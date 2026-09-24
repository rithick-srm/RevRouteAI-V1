from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from backend.app.database.session import get_db
from backend.app.models.domain import (
    Shipment, Invoice, AuditResult, LeakageAlert, RecoveryActionCase, FuelLog
)

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """
    Computes real-time dynamic KPI cards and Chart data directly from Database records.
    """
    shipments_audited = db.query(Shipment).count()
    invoices_audited = db.query(Invoice).count()

    # Dynamic KPI totals by audit category
    billing_leakage = db.query(func.coalesce(func.sum(AuditResult.potential_financial_impact), 0.0))\
        .filter(AuditResult.audit_type == "BILLING").scalar()

    maintenance_overrun = db.query(func.coalesce(func.sum(AuditResult.potential_financial_impact), 0.0))\
        .filter(AuditResult.audit_type == "MAINTENANCE").scalar()

    fuel_cost_variance = db.query(func.coalesce(func.sum(AuditResult.potential_financial_impact), 0.0))\
        .filter(AuditResult.audit_type == "FUEL").scalar()

    total_financial_impact = billing_leakage + maintenance_overrun + fuel_cost_variance

    open_alerts_count = db.query(LeakageAlert)\
        .filter(LeakageAlert.status.in_(["DETECTED", "UNDER REVIEW", "VERIFIED", "ACTION INITIATED"])).count()

    # Chart 1: Financial Variance by Category
    financial_variance_chart = {
        "labels": ["Revenue Leakage", "Maintenance Overrun", "Fuel Cost Variance"],
        "datasets": [{
            "label": "Potential Amount (₹)",
            "data": [round(billing_leakage, 2), round(maintenance_overrun, 2), round(fuel_cost_variance, 2)],
            "backgroundColor": ["#2563EB", "#14B8A6", "#F59E0B"]
        }]
    }

    # Chart 2: Alerts by Category
    categories = ["Revenue Leakage", "Maintenance Overrun", "Fuel Variance", "Duplicate Record", "Operational Inconsistency"]
    category_counts = []
    for cat in categories:
        count = db.query(LeakageAlert).filter(LeakageAlert.category == cat).count()
        category_counts.append(count)

    alerts_by_category_chart = {
        "labels": categories,
        "datasets": [{
            "label": "Number of Alerts",
            "data": category_counts,
            "backgroundColor": ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"]
        }]
    }

    # Chart 3: Alert Status Breakdown
    statuses = ["DETECTED", "UNDER REVIEW", "VERIFIED", "ACTION INITIATED", "RESOLVED", "DISMISSED"]
    status_counts = []
    for st in statuses:
        count = db.query(LeakageAlert).filter(LeakageAlert.status == st).count()
        status_counts.append(count)

    alert_status_chart = {
        "labels": ["Detected", "Under Review", "Verified", "Action Initiated", "Resolved", "Dismissed"],
        "datasets": [{
            "label": "Alerts by Status",
            "data": status_counts,
            "backgroundColor": ["#EF4444", "#F59E0B", "#3B82F6", "#8B5CF6", "#10B981", "#9CA3AF"]
        }]
    }

    # Chart 4: Fuel Performance (Expected vs Estimated Actual Liters)
    fuel_results = db.query(AuditResult).filter(AuditResult.audit_type == "FUEL").all()
    total_expected_fuel = sum(r.expected_value for r in fuel_results) if fuel_results else 50.0
    total_actual_fuel = sum(r.actual_value for r in fuel_results) if fuel_results else 70.0

    fuel_performance_chart = {
        "labels": ["Expected Fuel (L)", "Estimated Actual Fuel (L)"],
        "datasets": [{
            "label": "Volume (Liters)",
            "data": [round(total_expected_fuel, 2), round(total_actual_fuel, 2)],
            "backgroundColor": ["#10B981", "#EF4444"]
        }]
    }

    # Chart 5: Recovery / Corrective Action
    verified_sum = db.query(func.coalesce(func.sum(RecoveryActionCase.verified_amount), 0.0)).scalar()
    recovered_sum = db.query(func.coalesce(func.sum(RecoveryActionCase.recovered_or_corrected_amount), 0.0)).scalar()

    recovery_chart = {
        "labels": ["Potential Financial Impact", "Verified Amount", "Recovered / Corrected Amount"],
        "datasets": [{
            "label": "Amount (₹)",
            "data": [round(total_financial_impact, 2), round(verified_sum, 2), round(recovered_sum, 2)],
            "backgroundColor": ["#3B82F6", "#F59E0B", "#10B981"]
        }]
    }

    return {
        "kpis": {
            "shipments_audited": shipments_audited,
            "invoices_audited": invoices_audited,
            "potential_revenue_leakage": round(billing_leakage, 2),
            "potential_maintenance_overrun": round(maintenance_overrun, 2),
            "potential_fuel_cost_variance": round(fuel_cost_variance, 2),
            "total_potential_financial_impact": round(total_financial_impact, 2),
            "open_alerts": open_alerts_count
        },
        "charts": {
            "financial_variance": financial_variance_chart,
            "alerts_by_category": alerts_by_category_chart,
            "alert_status": alert_status_chart,
            "fuel_performance": fuel_performance_chart,
            "recovery_action": recovery_chart
        }
    }
