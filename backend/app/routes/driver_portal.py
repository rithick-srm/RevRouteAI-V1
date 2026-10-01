import os
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.app.database.session import get_db
from backend.app.models.domain import (
    User, Vehicle, FuelLog, MaintenanceLog, MaintenanceBenchmark, Shipment, DriverNotification
)
from backend.app.schemas.schemas import (
    UserResponse, VehicleResponse, FuelLogCreate, FuelLogResponse, MaintenanceLogCreate, MaintenanceLogResponse
)
from backend.app.services.document_processor import process_document

router = APIRouter(prefix="/api/driver", tags=["Driver Portal"])
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")

def get_current_driver(
    db: Session = Depends(get_db),
    x_driver_id: Optional[int] = Header(None, alias="X-Driver-ID")
) -> User:
    """
    Development-only authenticated driver identity via X-Driver-ID.
    Resolves driver identity server-side using the mandatory X-Driver-ID header.
    Missing or invalid X-Driver-ID returns 401 Unauthorized.
    Non-Driver role returns 403 Forbidden.
    """
    if x_driver_id is None:
        raise HTTPException(status_code=401, detail="Authentication required: X-Driver-ID header missing.")
    
    user = db.query(User).filter(User.id == x_driver_id).first()
    if not user:
        raise HTTPException(status_code=401, detail=f"Authenticated driver record with ID '{x_driver_id}' not found.")
    
    if user.role != "Driver":
        raise HTTPException(status_code=403, detail="Access denied: User is not authorized as a driver.")
    
    return user

def resolve_safe_upload_path(user_supplied_path: Optional[str], doc_subfolder: str) -> Optional[str]:
    """
    Sanitizes client-supplied document paths and verifies canonical path containment strictly inside UPLOAD_DIR/<doc_subfolder>/.
    Uses os.path.commonpath to prevent path traversal (../), drive escapes, sibling directory tricks, or cross-folder submissions.
    """
    if not user_supplied_path:
        return None
    
    clean_rel = user_supplied_path.replace("\\", "/").lstrip("/")
    if ".." in clean_rel:
        return None
    
    candidate_path = os.path.abspath(clean_rel)
    allowed_subfolder_dir = os.path.abspath(os.path.join(UPLOAD_DIR, doc_subfolder))
    
    try:
        common = os.path.commonpath([candidate_path, allowed_subfolder_dir])
        if common != allowed_subfolder_dir:
            return None
    except ValueError:
        return None
    
    if os.path.exists(candidate_path) and os.path.isfile(candidate_path):
        return candidate_path
    
    return None

def verify_driver_document_ownership(safe_file_path: str, driver_id: int) -> bool:
    """
    Verifies that the uploaded server document is associated with the authenticated driver.
    Prevents Driver B from submitting or confirming Driver A's uploaded document.
    """
    filename = os.path.basename(safe_file_path)
    if filename.startswith("drv"):
        parts = filename.split("_")
        if parts[0].startswith("drv"):
            expected_prefix = f"drv{driver_id}"
            if parts[0] != expected_prefix:
                return False
    return True

@router.get("/me", response_model=UserResponse)
def get_driver_profile(current_driver: User = Depends(get_current_driver)):
    return current_driver

@router.get("/vehicle", response_model=VehicleResponse)
def get_driver_assigned_vehicle(
    db: Session = Depends(get_db),
    current_driver: User = Depends(get_current_driver)
):
    assigned_vehicle_id = current_driver.assigned_vehicle_id
    if not assigned_vehicle_id:
        raise HTTPException(status_code=404, detail="No vehicle currently assigned to this driver.")

    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == assigned_vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=404, detail=f"Assigned vehicle '{assigned_vehicle_id}' not found in fleet records.")
    return vehicle

@router.get("/trips")
def get_driver_trips(
    db: Session = Depends(get_db),
    current_driver: User = Depends(get_current_driver)
):
    assigned_vehicle_id = current_driver.assigned_vehicle_id
    if not assigned_vehicle_id:
        return {
            "driver_id": current_driver.id,
            "vehicle_id": None,
            "trips": []
        }

    shipments = db.query(Shipment).filter(Shipment.vehicle_id == assigned_vehicle_id).order_by(Shipment.created_at.desc()).all()
    return {
        "driver_id": current_driver.id,
        "vehicle_id": assigned_vehicle_id,
        "trips": shipments
    }

@router.get("/history")
def get_driver_history(
    db: Session = Depends(get_db),
    current_driver: User = Depends(get_current_driver)
):
    fuel_records = db.query(FuelLog).filter(FuelLog.driver_id == current_driver.id).order_by(FuelLog.created_at.desc()).all()
    repair_records = db.query(MaintenanceLog).filter(MaintenanceLog.driver_id == current_driver.id).order_by(MaintenanceLog.created_at.desc()).all()

    return {
        "driver_id": current_driver.id,
        "fuel_logs": fuel_records,
        "maintenance_logs": repair_records
    }

@router.get("/notifications")
def get_driver_notifications(
    db: Session = Depends(get_db),
    current_driver: User = Depends(get_current_driver)
):
    notifications = db.query(DriverNotification).filter(DriverNotification.driver_id == current_driver.id).order_by(DriverNotification.created_at.desc()).all()
    return notifications or []

@router.post("/fuel", response_model=FuelLogResponse)
def submit_driver_fuel_entry(
    payload: FuelLogCreate,
    db: Session = Depends(get_db),
    current_driver: User = Depends(get_current_driver)
):
    assigned_vehicle_id = current_driver.assigned_vehicle_id
    if not assigned_vehicle_id:
        raise HTTPException(status_code=400, detail="Cannot submit fuel log: Driver has no assigned vehicle.")

    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == assigned_vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail=f"Assigned vehicle '{assigned_vehicle_id}' not found.")

    if payload.liters_filled <= 0 or payload.price_per_liter <= 0:
        raise HTTPException(status_code=400, detail="Liters filled and price per liter must be positive numbers.")

    total_cost = payload.total_cost if payload.total_cost > 0 else (payload.liters_filled * payload.price_per_liter)
    manager_review_status = "PENDING_REVIEW"

    # Backend-Authoritative OCR Verification
    # Requires: 1) payload.is_ocr_confirmed == True, 2) safe_path inside UPLOAD_DIR/fuel/, 3) driver ownership, 4) OCR success
    ocr_status = "NONE"
    ocr_raw_text = None
    ocr_extracted_json = None

    if payload.is_ocr_confirmed and payload.receipt_url:
        safe_path = resolve_safe_upload_path(payload.receipt_url, "fuel")
        if safe_path and verify_driver_document_ownership(safe_path, current_driver.id):
            extraction = process_document(safe_path, doc_type="fuel")
            if extraction.get("success"):
                ocr_status = "DRIVER_CONFIRMED"
                ocr_raw_text = extraction.get("raw_text")
                ocr_extracted_json = json.dumps(extraction.get("extracted_fields") or {})

    # Backend Duplicate Detection (Neutral flag signal only)
    existing_dup = db.query(FuelLog).filter(
        FuelLog.vehicle_id == assigned_vehicle_id,
        FuelLog.fuel_date == payload.fuel_date,
        FuelLog.fuel_station == payload.fuel_station,
        FuelLog.total_cost == total_cost
    ).first()

    notes = payload.notes or ""
    if existing_dup:
        notes = f"(Possible duplicate entry — requires review) {notes}".strip()
        manager_review_status = "REQUIRES_REVIEW"

    fuel_id = payload.fuel_log_id or f"FL-DRV-{uuid.uuid4().hex[:6].upper()}"

    data = payload.dict(exclude={"is_ocr_confirmed"})
    # Server-side identity, vehicle, and OCR enforcement
    data["driver_id"] = current_driver.id
    data["vehicle_id"] = assigned_vehicle_id
    data["fuel_log_id"] = fuel_id
    data["total_cost"] = total_cost
    data["notes"] = notes
    data["manager_review_status"] = manager_review_status
    data["ocr_status"] = ocr_status
    data["ocr_raw_text"] = ocr_raw_text
    data["ocr_extracted_json"] = ocr_extracted_json

    fuel_log = FuelLog(**data)
    db.add(fuel_log)
    db.commit()
    db.refresh(fuel_log)
    return fuel_log

@router.post("/repair", response_model=MaintenanceLogResponse)
def submit_driver_repair_entry(
    payload: MaintenanceLogCreate,
    db: Session = Depends(get_db),
    current_driver: User = Depends(get_current_driver)
):
    assigned_vehicle_id = current_driver.assigned_vehicle_id
    if not assigned_vehicle_id:
        raise HTTPException(status_code=400, detail="Cannot submit maintenance log: Driver has no assigned vehicle.")

    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == assigned_vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail=f"Assigned vehicle '{assigned_vehicle_id}' not found.")

    repair_id = payload.repair_id or f"REP-DRV-{uuid.uuid4().hex[:6].upper()}"

    # Auto-fetch reference benchmark if not supplied
    benchmark_cost = payload.benchmark_cost or 0.0
    if benchmark_cost == 0.0:
        bm = db.query(MaintenanceBenchmark).filter(
            MaintenanceBenchmark.repair_type == payload.repair_type,
            MaintenanceBenchmark.vehicle_class == vehicle.vehicle_class
        ).first()
        if bm:
            benchmark_cost = bm.benchmark_cost

    data = payload.dict(exclude={"is_ocr_confirmed"})

    if data["total_repair_cost"] == 0.0 and (data["parts_cost"] > 0 or data["labor_cost"] > 0):
        data["total_repair_cost"] = data["parts_cost"] + data["labor_cost"]

    # Backend-Authoritative OCR Verification
    # Requires: 1) payload.is_ocr_confirmed == True, 2) safe_path inside UPLOAD_DIR/maintenance/, 3) driver ownership, 4) OCR success
    ocr_status = "NONE"
    ocr_raw_text = None
    ocr_extracted_json = None

    if payload.is_ocr_confirmed and payload.receipt_url:
        safe_path = resolve_safe_upload_path(payload.receipt_url, "maintenance")
        if safe_path and verify_driver_document_ownership(safe_path, current_driver.id):
            extraction = process_document(safe_path, doc_type="maintenance")
            if extraction.get("success"):
                ocr_status = "DRIVER_CONFIRMED"
                ocr_raw_text = extraction.get("raw_text")
                ocr_extracted_json = json.dumps(extraction.get("extracted_fields") or {})

    manager_review_status = "PENDING_REVIEW"
    notes = data.get("notes") or ""

    # Backend Duplicate Detection for repairs (Neutral flag signal only)
    existing_dup = db.query(MaintenanceLog).filter(
        MaintenanceLog.vehicle_id == assigned_vehicle_id,
        MaintenanceLog.service_date == payload.service_date,
        MaintenanceLog.repair_type == payload.repair_type,
        MaintenanceLog.total_repair_cost == data["total_repair_cost"]
    ).first()

    if existing_dup:
        notes = f"(Possible duplicate entry — requires review) {notes}".strip()
        manager_review_status = "REQUIRES_REVIEW"

    # Server-side identity, vehicle, and OCR enforcement
    data["driver_id"] = current_driver.id
    data["vehicle_id"] = assigned_vehicle_id
    data["repair_id"] = repair_id
    data["benchmark_cost"] = benchmark_cost
    data["notes"] = notes
    data["manager_review_status"] = manager_review_status
    data["ocr_status"] = ocr_status
    data["ocr_raw_text"] = ocr_raw_text
    data["ocr_extracted_json"] = ocr_extracted_json

    m_log = MaintenanceLog(**data)
    db.add(m_log)
    db.commit()
    db.refresh(m_log)
    return m_log
