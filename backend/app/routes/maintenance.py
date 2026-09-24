from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.domain import MaintenanceLog, MaintenanceBenchmark, Vehicle
from backend.app.schemas.schemas import (
    MaintenanceLogCreate, MaintenanceLogResponse,
    MaintenanceBenchmarkCreate, MaintenanceBenchmarkResponse
)

router = APIRouter(prefix="/api/maintenance", tags=["Maintenance"])

@router.get("/benchmarks", response_model=List[MaintenanceBenchmarkResponse])
def get_benchmarks(db: Session = Depends(get_db)):
    return db.query(MaintenanceBenchmark).all()

@router.post("/benchmarks", response_model=MaintenanceBenchmarkResponse)
def create_benchmark(payload: MaintenanceBenchmarkCreate, db: Session = Depends(get_db)):
    bm = MaintenanceBenchmark(**payload.dict())
    db.add(bm)
    db.commit()
    db.refresh(bm)
    return bm

@router.put("/benchmarks/{benchmark_id}", response_model=MaintenanceBenchmarkResponse)
def update_benchmark(benchmark_id: int, payload: MaintenanceBenchmarkCreate, db: Session = Depends(get_db)):
    bm = db.query(MaintenanceBenchmark).filter(MaintenanceBenchmark.benchmark_id == benchmark_id).first()
    if not bm:
        raise HTTPException(status_code=404, detail="Maintenance benchmark not found")
    bm.repair_type = payload.repair_type
    bm.vehicle_class = payload.vehicle_class
    bm.benchmark_cost = payload.benchmark_cost
    db.commit()
    db.refresh(bm)
    return bm

@router.get("", response_model=List[MaintenanceLogResponse])
def get_maintenance_logs(db: Session = Depends(get_db)):
    return db.query(MaintenanceLog).all()

@router.post("", response_model=MaintenanceLogResponse)
def create_maintenance_log(payload: MaintenanceLogCreate, db: Session = Depends(get_db)):
    vehicle = db.query(Vehicle).filter(Vehicle.vehicle_id == payload.vehicle_id).first()
    if not vehicle:
        raise HTTPException(status_code=400, detail="Vehicle not found")

    if payload.total_repair_cost < 0:
        raise HTTPException(status_code=400, detail="Repair cost cannot be negative")

    # Fetch reference benchmark if not explicitly supplied
    benchmark_cost = payload.benchmark_cost or 0.0
    if benchmark_cost == 0.0:
        bm = db.query(MaintenanceBenchmark).filter(
            MaintenanceBenchmark.repair_type == payload.repair_type,
            MaintenanceBenchmark.vehicle_class == vehicle.vehicle_class
        ).first()
        if bm:
            benchmark_cost = bm.benchmark_cost

    data = payload.dict()
    data["benchmark_cost"] = benchmark_cost
    if data["total_repair_cost"] == 0.0 and (data["parts_cost"] > 0 or data["labor_cost"] > 0):
        data["total_repair_cost"] = data["parts_cost"] + data["labor_cost"]

    log = MaintenanceLog(**data)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

@router.delete("/{repair_id}")
def delete_maintenance_log(repair_id: str, db: Session = Depends(get_db)):
    log = db.query(MaintenanceLog).filter(MaintenanceLog.repair_id == repair_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="Maintenance log not found")
    db.delete(log)
    db.commit()
    return {"message": "Maintenance record deleted successfully"}
