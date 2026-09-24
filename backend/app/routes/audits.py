from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.domain import (
    Shipment, Contract, Invoice, Vehicle, MaintenanceLog, MaintenanceBenchmark, FuelLog, AuditResult
)
from backend.app.schemas.schemas import AuditResultResponse
from backend.app.services.billing_audit import perform_billing_audit
from backend.app.services.maintenance_audit import perform_maintenance_audit
from backend.app.services.fuel_audit import perform_fuel_audit
from backend.app.services.alert_service import create_audit_and_alert

router = APIRouter(prefix="/api/audit", tags=["Audit Engine"])

@router.get("/results", response_model=List[AuditResultResponse])
def get_all_audit_results(db: Session = Depends(get_db)):
    return db.query(AuditResult).order_by(AuditResult.created_at.desc()).all()

@router.post("/billing", response_model=AuditResultResponse)
def run_billing_audit(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail=f"Shipment '{shipment_id}' not found.")

    contract = db.query(Contract).filter(Contract.contract_id == shipment.contract_id).first()
    if not contract:
        raise HTTPException(status_code=400, detail=f"No contract linked to shipment '{shipment_id}'.")

    if contract.verification_status != "VERIFIED":
        raise HTTPException(status_code=400, detail=f"Contract '{contract.contract_id}' is PENDING or REJECTED. Only VERIFIED contracts can be audited.")

    invoice = db.query(Invoice).filter(Invoice.shipment_id == shipment_id).first()
    if not invoice:
        raise HTTPException(status_code=400, detail=f"No invoice recorded for shipment '{shipment_id}'. Upload or record an invoice first.")

    audit_payload = perform_billing_audit(contract=contract, shipment=shipment, invoice=invoice)

    # Save Audit Result and create Alert
    alert = create_audit_and_alert(db, audit_payload)
    audit_res = db.query(AuditResult).filter(AuditResult.audit_id == audit_payload["audit_id"]).first()
    return audit_res

@router.post("/maintenance", response_model=AuditResultResponse)
def run_maintenance_audit(repair_id: str, db: Session = Depends(get_db)):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.repair_id == repair_id).first()
    if not log:
        raise HTTPException(status_code=404, detail=f"Maintenance log '{repair_id}' not found.")

    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == log.vehicle_id).first()
    vehicle_class = vehicle.vehicle_class if vehicle else "Heavy Truck"

    benchmark = db.query(MaintenanceBenchmark).filter(
        MaintenanceBenchmark.repair_type == log.repair_type,
        MaintenanceBenchmark.vehicle_class == vehicle_class
    ).first()

    existing_logs = db.query(MaintenanceLog).filter(MaintenanceLog.vehicle_id == log.vehicle_id).all()

    audit_payload = perform_maintenance_audit(log=log, benchmark=benchmark, existing_logs=existing_logs)
    alert = create_audit_and_alert(db, audit_payload)
    audit_res = db.query(AuditResult).filter(AuditResult.audit_id == audit_payload["audit_id"]).first()
    return audit_res

@router.post("/fuel", response_model=AuditResultResponse)
def run_fuel_audit(fuel_log_id: str, db: Session = Depends(get_db)):
    fuel_log = db.query(FuelLog).filter(FuelLog.fuel_log_id == fuel_log_id).first()
    if not fuel_log:
        raise HTTPException(status_code=404, detail=f"Fuel log '{fuel_log_id}' not found.")

    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == fuel_log.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail=f"Vehicle '{fuel_log.vehicle_id}' not found.")

    shipment = None
    if fuel_log.shipment_id:
        shipment = db.query(Shipment).filter(Shipment.shipment_id == fuel_log.shipment_id).first()

    audit_payload = perform_fuel_audit(fuel_log=fuel_log, vehicle=vehicle, shipment=shipment)
    alert = create_audit_and_alert(db, audit_payload)
    audit_res = db.query(AuditResult).filter(AuditResult.audit_id == audit_payload["audit_id"]).first()
    return audit_res
