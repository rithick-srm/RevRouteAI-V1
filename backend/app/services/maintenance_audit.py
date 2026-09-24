import uuid
from typing import Dict, Any, List, Optional
from datetime import timedelta
from backend.app.models.domain import MaintenanceLog, MaintenanceBenchmark

def perform_maintenance_audit(
    log: MaintenanceLog,
    benchmark: Optional[MaintenanceBenchmark] = None,
    existing_logs: Optional[List[MaintenanceLog]] = None
) -> Dict[str, Any]:
    """
    Maintenance Audit Engine:
    Identifies maintenance cost overruns relative to reference benchmarks,
    detects duplicate records, and flags repeated maintenance activity.
    """
    actual_cost = log.total_repair_cost or (log.parts_cost + log.labor_cost)
    benchmark_cost = benchmark.benchmark_cost if benchmark else (log.benchmark_cost or 0.0)

    overrun = max(actual_cost - benchmark_cost, 0.0) if benchmark_cost > 0 else 0.0
    audit_id = f"AUD-M-{uuid.uuid4().hex[:8].upper()}"

    # Flag duplicate & repeated maintenance
    is_duplicate = False
    repeated_count = 0

    if existing_logs:
        for prev in existing_logs:
            if prev.repair_id == log.repair_id:
                continue
            
            # Exact Duplicate check
            if (prev.vehicle_id == log.vehicle_id and
                prev.service_date == log.service_date and
                prev.repair_type == log.repair_type and
                prev.service_center == log.service_center and
                prev.invoice_number == log.invoice_number and log.invoice_number is not None):
                is_duplicate = True

            # Repeated Repair within 30 days check
            if prev.vehicle_id == log.vehicle_id and prev.repair_type == log.repair_type:
                date_diff = abs((log.service_date - prev.service_date).days)
                if date_diff <= 30:
                    repeated_count += 1

    explanation_parts = []
    explanation_parts.append(
        f"Repair Cost: ₹{actual_cost:,.2f} vs Reference Benchmark: ₹{benchmark_cost:,.2f} for '{log.repair_type}'."
    )

    if overrun > 0:
        explanation_parts.append(
            f" Potential Maintenance Cost Overrun of ₹{overrun:,.2f} detected above reference benchmark."
        )

    if is_duplicate:
        explanation_parts.append(
            " WARNING: Potentially duplicate maintenance record identified with matching vehicle, service center, date, and invoice number."
        )

    if repeated_count > 0:
        explanation_parts.append(
            f" NOTE: Vehicle has undergone {repeated_count + 1} '{log.repair_type}' services within a 30-day period."
        )

    if overrun == 0 and not is_duplicate and repeated_count == 0:
        explanation_parts.append(" Maintenance cost is within configured reference benchmark limits.")

    explanation = "".join(explanation_parts)

    return {
        "audit_id": audit_id,
        "audit_type": "MAINTENANCE",
        "reference_id": log.repair_id,
        "expected_value": round(benchmark_cost, 2),
        "actual_value": round(actual_cost, 2),
        "variance": round(overrun, 2),
        "potential_financial_impact": round(overrun, 2),
        "is_duplicate": is_duplicate,
        "repeated_count": repeated_count,
        "explanation": explanation
    }
