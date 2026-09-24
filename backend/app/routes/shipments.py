from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.domain import Shipment, Contract, Vehicle
from backend.app.schemas.schemas import ShipmentCreate, ShipmentResponse

router = APIRouter(prefix="/api/shipments", tags=["Shipments"])

@router.get("", response_model=List[ShipmentResponse])
def get_shipments(db: Session = Depends(get_db)):
    return db.query(Shipment).all()

@router.get("/{shipment_id}", response_model=ShipmentResponse)
def get_shipment(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.post("", response_model=ShipmentResponse)
def create_shipment(payload: ShipmentCreate, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.contract_id == payload.contract_id).first()
    if not contract:
        raise HTTPException(status_code=400, detail="Contract not found")

    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found")

    if payload.distance_km < 0 or payload.cargo_weight_kg < 0:
        raise HTTPException(status_code=400, detail="Distance and cargo weight cannot be negative")

    existing = db.query(Shipment).filter(Shipment.shipment_id == payload.shipment_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Shipment ID already exists")

    shipment = Shipment(**payload.dict())
    db.add(shipment)
    db.commit()
    db.refresh(shipment)
    return shipment

@router.delete("/{shipment_id}")
def delete_shipment(shipment_id: str, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    db.delete(shipment)
    db.commit()
    return {"message": "Shipment deleted successfully"}
