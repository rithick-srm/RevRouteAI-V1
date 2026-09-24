from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.domain import LeakageAlert, AuditResult
from backend.app.schemas.schemas import AlertResponse, AlertStatusUpdate
from backend.app.services.alert_service import update_alert_status

router = APIRouter(prefix="/api/alerts", tags=["Leakage Alerts"])

@router.get("", response_model=List[AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(LeakageAlert).order_by(LeakageAlert.created_at.desc()).all()

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(alert_id: str, db: Session = Depends(get_db)):
    alert = db.query(LeakageAlert).filter(LeakageAlert.alert_id == alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert

@router.put("/{alert_id}/status", response_model=AlertResponse)
def change_alert_status(alert_id: str, payload: AlertStatusUpdate, db: Session = Depends(get_db)):
    alert = update_alert_status(db, alert_id, payload.status)
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    return alert
