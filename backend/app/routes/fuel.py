from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.domain import FuelLog, Vehicle, Shipment
from backend.app.schemas.schemas import FuelLogCreate, FuelLogResponse

router = APIRouter(prefix="/api/fuel", tags=["Fuel"])

@router.get("", response_model=List[FuelLogResponse])
def get_fuel_logs(db: Session = Depends(get_db)):
    return db.query(FuelLog).all()

@router.post("", response_model=FuelLogResponse)
def create_fuel_log(payload: FuelLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found")

    if payload.shipment_id:
        shp = db.query(Shipment).filter(Shipment.shipment_id == payload.shipment_id).first()
        if not shp:
            raise HTTPException(status_code=400, detail="Associated shipment not found")

    if payload.liters_filled <= 0 or payload.price_per_liter <= 0:
        raise HTTPException(status_code=400, detail="Liters filled and price per liter must be positive values")

    log = FuelLog(**payload.dict())
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.delete("/{fuel_log_id}")
def delete_fuel_log(fuel_log_id: str, db: Session = Depends(get_db)):
    log = db.query(FuelLog).filter(FuelLog.fuel_log_id == fuel_log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Fuel log not found")
    db.delete(log)
    db.commit()
    return {"message": "Fuel log deleted successfully"}
