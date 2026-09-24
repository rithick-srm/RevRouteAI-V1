import uuid
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from backend.app.database.session import get_db
from backend.app.models.domain import User, Vehicle, FuelLog, MaintenanceLog, MaintenanceBenchmark
from backend.app.schemas.schemas import (
    UserResponse, FuelLogCreate, FuelLogResponse, MaintenanceLogCreate, MaintenanceLogResponse
)

router = APIRouter(prefix="/api/driver", tags=["Driver Portal"])

@router.get("/me", response_model=UserResponse)
def get_driver_profile(driver_id: int = Query(2), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == driver_id).first()
    if not user:
        # Fallback demo driver
        return UserResponse(
            id=2,
            name="Ramesh Kumar",
            email="driver1@revroute.ai",
            role="Driver",
            assigned_vehicle_id="TRK-101",
            phone_number="+91 98765 11111",
            license_number="DL-TN01-20210001"
        )
    return user

@router.get("/history")
def get_driver_history(driver_id: int = Query(2), db: Session = Depends(get_db)):
    fuel_records = db.query(FuelLog).filter(FuelLog.driver_id == driver_id).order_by(FuelLog.created_at.desc()).all()
    repair_records = db.query(MaintenanceLog).filter(MaintenanceLog.driver_id == driver_id).order_by(MaintenanceLog.created_at.desc()).all()

    return {
        "driver_id": driver_id,
        "fuel_logs": fuel_records,
        "maintenance_logs": repair_records
    }

@router.post("/fuel", response_model=FuelLogResponse)
def submit_driver_fuel_entry(payload: FuelLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail=f"Vehicle '{payload.vehicle_id}' not found.")

    if payload.liters_filled <= 0 or payload.price_per_liter <= 0:
        raise HTTPException(status_code=400, detail="Liters filled and price per liter must be positive numbers.")

    fuel_id = payload.fuel_log_id or f"FL-DRV-{uuid.uuid4().hex[:6].upper()}"

    total_cost = payload.total_cost if payload.total_cost > 0 else (payload.liters_filled * payload.price_per_liter)

    data = payload.dict()
    data["fuel_log_id"] = fuel_id
    data["total_cost"] = total_cost

    fuel_log = FuelLog(**data)
    db.add(fuel_log)
    db.commit()
    db.refresh(fuel_log)
    return fuel_log

@router.post("/repair", response_model=MaintenanceLogResponse)
def submit_driver_repair_entry(payload: MaintenanceLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail=f"Vehicle '{payload.vehicle_id}' not found.")

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

    data = payload.dict()
    data["repair_id"] = repair_id
    data["benchmark_cost"] = benchmark_cost

    if data["total_repair_cost"] == 0.0 and (data["parts_cost"] > 0 or data["labor_cost"] > 0):
        data["total_repair_cost"] = data["parts_cost"] + data["labor_cost"]

    m_log = MaintenanceLog(**data)
    db.add(m_log)
    db.commit()
    db.refresh(m_log)
    return m_log
