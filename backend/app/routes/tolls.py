from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime

from backend.app.database.session import get_db
from backend.app.models.domain import TollRecord, Vehicle, Shipment
from backend.app.schemas.schemas import TollRecordCreate, TollRecordResponse, TollStatusUpdate

router = APIRouter(prefix="/api/tolls", tags=["Toll Costs & Audit"])

@router.get("", response_model=List[TollRecordResponse])
def get_tolls(
    vehicle_id: Optional[str] = Query(None),
    route: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(TollRecord)
    if vehicle_id:
        query = query.filter(TollRecord.vehicle_id == vehicle_id)
    if route:
        query = query.filter(TollRecord.route.ilike(f"%{route}%"))
    if status and status.lower() != "all":
        query = query.filter(func.lower(TollRecord.status) == status.lower())
    
    return query.order_by(TollRecord.date.desc(), TollRecord.id.desc()).all()

@router.get("/summary")
def get_tolls_summary(db: Session = Depends(get_db)):
    tolls = db.query(TollRecord).all()
    
    total_actual = sum(t.actual_amount for t in tolls)
    total_expected = sum(t.expected_amount for t in tolls)
    total_variance = sum(t.variance for t in tolls)
    pending_count = sum(1 for t in tolls if t.status == "Pending")
    review_count = sum(1 for t in tolls if t.status in ["Review", "Flagged"])
    flagged_count = sum(1 for t in tolls if t.status == "Flagged")

    return {
        "total_actual_spend": round(total_actual, 2),
        "total_expected_spend": round(total_expected, 2),
        "total_variance": round(total_variance, 2),
        "pending_count": pending_count,
        "review_count": review_count,
        "flagged_count": flagged_count,
        "total_records": len(tolls)
    }

@router.get("/audit")
def get_tolls_audit(db: Session = Depends(get_db)):
    tolls = db.query(TollRecord).all()

    # Vehicles with repeated toll variances
    veh_variances = {}
    for t in tolls:
        if t.variance > 0:
            veh_variances[t.vehicle_id] = veh_variances.get(t.vehicle_id, 0.0) + t.variance

    repeated_variance_vehicles = [
        {"vehicle_id": v_id, "total_variance": round(var, 2)}
        for v_id, var in veh_variances.items() if var > 0
    ]
    repeated_variance_vehicles.sort(key=lambda x: x["total_variance"], reverse=True)

    # Routes with highest toll variances
    route_variances = {}
    for t in tolls:
        if t.variance > 0:
            route_variances[t.route] = route_variances.get(t.route, 0.0) + t.variance

    unusual_routes = [
        {"route": r, "total_variance": round(var, 2)}
        for r, var in route_variances.items() if var > 0
    ]
    unusual_routes.sort(key=lambda x: x["total_variance"], reverse=True)

    # Flagged / Review items
    flagged_records = [
        {
            "toll_id": t.toll_id,
            "vehicle_id": t.vehicle_id,
            "route": t.route,
            "toll_gate": t.toll_gate,
            "date": t.date.isoformat(),
            "expected_amount": t.expected_amount,
            "actual_amount": t.actual_amount,
            "variance": t.variance,
            "status": t.status,
            "notes": t.notes
        }
        for t in tolls if t.status in ["Review", "Flagged"] or t.variance > 0
    ]

    total_audited = len(tolls)
    discrepancy_count = sum(1 for t in tolls if t.variance > 0 or t.status in ["Review", "Flagged"])
    total_financial_impact = sum(t.variance for t in tolls if t.variance > 0)

    return {
        "total_audited": total_audited,
        "discrepancy_count": discrepancy_count,
        "financial_impact": round(total_financial_impact, 2),
        "repeated_variance_vehicles": repeated_variance_vehicles,
        "unusual_routes": unusual_routes,
        "flagged_records": flagged_records
    }

@router.post("", response_model=TollRecordResponse)
def create_toll_record(payload: TollRecordCreate, db: Session = Depends(get_db)):
    # Validate vehicle
    veh = db.query(Vehicle).filter(Vehicle.vehicle_id == payload.vehicle_id).first()
    if not veh:
        raise HTTPException(status_code=404, detail=f"Vehicle {payload.vehicle_id} not found.")

    # Validate shipment if provided
    if payload.shipment_id:
        shp = db.query(Shipment).filter(Shipment.shipment_id == payload.shipment_id).first()
        if not shp:
            raise HTTPException(status_code=404, detail=f"Shipment {payload.shipment_id} not found.")

    # Generate toll_id if not provided
    if not payload.toll_id:
        count = db.query(TollRecord).count() + 1
        generated_id = f"TOL-{200 + count}"
    else:
        generated_id = payload.toll_id

    # Deterministic variance calculation: actual - expected
    variance = round(payload.actual_amount - payload.expected_amount, 2)

    # Determine status deterministically using neutral language rules
    if variance == 0:
        status = "Verified"
    elif variance > 200:
        status = "Flagged"
    elif variance > 0:
        status = "Review"
    else:
        status = "Verified"

    toll = TollRecord(
        toll_id=generated_id,
        vehicle_id=payload.vehicle_id,
        shipment_id=payload.shipment_id,
        route=payload.route,
        toll_gate=payload.toll_gate,
        date=payload.date,
        expected_amount=payload.expected_amount,
        actual_amount=payload.actual_amount,
        variance=variance,
        status=status,
        notes=payload.notes
    )

    db.add(toll)
    db.commit()
    db.refresh(toll)
    return toll

@router.put("/{toll_id}/status", response_model=TollRecordResponse)
def update_toll_status(toll_id: str, payload: TollStatusUpdate, db: Session = Depends(get_db)):
    toll = db.query(TollRecord).filter(TollRecord.toll_id == toll_id).first()
    if not toll:
        raise HTTPException(status_code=404, detail=f"Toll record {toll_id} not found.")

    toll.status = payload.status
    db.commit()
    db.refresh(toll)
    return toll

@router.delete("/{toll_id}")
def delete_toll_record(toll_id: str, db: Session = Depends(get_db)):
    toll = db.query(TollRecord).filter(TollRecord.toll_id == toll_id).first()
    if not toll:
        raise HTTPException(status_code=404, detail=f"Toll record {toll_id} not found.")

    db.delete(toll)
    db.commit()
    return {"message": f"Toll record {toll_id} deleted successfully."}
