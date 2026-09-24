import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.domain import RecoveryActionCase, LeakageAlert, AuditResult
from backend.app.schemas.schemas import ActionCaseCreate, ActionCaseUpdate, ActionCaseResponse

router = APIRouter(prefix="/api/action-cases", tags=["Recovery Action Cases"])

@router.get("", response_model=List[ActionCaseResponse])
def get_action_cases(db: Session = Depends(get_db)):
    return db.query(RecoveryActionCase).order_by(RecoveryActionCase.created_at.desc()).all()

@router.get("/{case_id}", response_model=ActionCaseResponse)
def get_action_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(RecoveryActionCase).filter(RecoveryActionCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return case

@router.post("", response_model=ActionCaseResponse)
def create_action_case(payload: ActionCaseCreate, db: Session = Depends(get_db)):
    alert = db.query(LeakageAlert).filter(LeakageAlert.alert_id == payload.alert_id).first()
    if not alert:
        raise HTTPException(status_code=404, detail="Associated alert not found")

    # Fetch audit potential financial impact to pre-populate verified amount draft
    audit = db.query(AuditResult).filter(AuditResult.audit_id == alert.audit_id).first()
    initial_verified = audit.potential_financial_impact if audit else 0.0

    case_id = f"CAS-{uuid.uuid4().hex[:6].upper()}"
    case = RecoveryActionCase(
        case_id=case_id,
        alert_id=payload.alert_id,
        action_type=payload.action_type,
        verified_amount=initial_verified,
        recovered_or_corrected_amount=0.0,
        assigned_to=payload.assigned_to or "Fleet Manager",
        review_notes=payload.review_notes,
        status="OPEN"
    )

    # Update alert status to ACTION INITIATED
    alert.status = "ACTION INITIATED"

    db.add(case)
    db.commit()
    db.refresh(case)
    return case

@router.put("/{case_id}", response_model=ActionCaseResponse)
def update_action_case(case_id: str, payload: ActionCaseUpdate, db: Session = Depends(get_db)):
    case = db.query(RecoveryActionCase).filter(RecoveryActionCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if payload.verified_amount is not None:
        case.verified_amount = payload.verified_amount
    if payload.recovered_or_corrected_amount is not None:
        case.recovered_or_corrected_amount = payload.recovered_or_corrected_amount
    if payload.assigned_to is not None:
        case.assigned_to = payload.assigned_to
    if payload.review_notes is not None:
        case.review_notes = payload.review_notes

    if payload.status:
        case.status = payload.status
        if payload.status in ["RESOLVED", "CLOSED"]:
            case.resolved_at = datetime.utcnow()
            # Mark associated alert as RESOLVED
            alert = db.query(LeakageAlert).filter(LeakageAlert.alert_id == case.alert_id).first()
            if alert:
                alert.status = "RESOLVED"

    db.commit()
    db.refresh(case)
    return case

@router.delete("/{case_id}")
def delete_action_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(RecoveryActionCase).filter(RecoveryActionCase.case_id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    db.delete(case)
    db.commit()
    return {"message": "Case deleted successfully"}
