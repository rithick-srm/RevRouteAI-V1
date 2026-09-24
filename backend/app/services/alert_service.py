import uuid
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.app.models.domain import AuditResult, LeakageAlert, RecoveryActionCase

def create_audit_and_alert(db: Session, audit_data: Dict[str, Any]) -> LeakageAlert:
    """
    Saves an AuditResult record and automatically creates a LeakageAlert if a variance/impact exists.
    """
    audit_result = AuditResult(
        audit_id=audit_data["audit_id"],
        audit_type=audit_data["audit_type"],
        reference_id=audit_data["reference_id"],
        expected_value=audit_data["expected_value"],
        actual_value=audit_data["actual_value"],
        variance=audit_data["variance"],
        potential_financial_impact=audit_data["potential_financial_impact"],
        explanation=audit_data["explanation"]
    )
    db.add(audit_result)
    db.flush()

    # Determine alert category
    category = "Operational Inconsistency"
    audit_type = audit_data["audit_type"]
    impact = audit_data.get("potential_financial_impact", 0.0)

    if audit_type == "BILLING":
        category = "Revenue Leakage"
    elif audit_type == "MAINTENANCE":
        if audit_data.get("is_duplicate", False):
            category = "Duplicate Record"
        else:
            category = "Maintenance Overrun"
    elif audit_type == "FUEL":
        category = "Fuel Variance"

    alert_id = f"ALT-{uuid.uuid4().hex[:6].upper()}"
    alert = LeakageAlert(
        alert_id=alert_id,
        audit_id=audit_result.audit_id,
        category=category,
        status="DETECTED"
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert

def update_alert_status(db: Session, alert_id: str, new_status: str) -> Optional[LeakageAlert]:
    valid_statuses = ["DETECTED", "UNDER REVIEW", "VERIFIED", "ACTION INITIATED", "RESOLVED", "DISMISSED"]
    if new_status not in valid_statuses:
        raise ValueError(f"Invalid alert status: {new_status}. Allowed: {valid_statuses}")

    alert = db.query(LeakageAlert).filter(LeakageAlert.alert_id == alert_id).first()
    if not alert:
        return None

    alert.status = new_status
    db.commit()
    db.refresh(alert)
    return alert
