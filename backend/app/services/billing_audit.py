import uuid
from typing import Dict, Any
from backend.app.models.domain import Contract, Shipment, Invoice

def perform_billing_audit(contract: Contract, shipment: Shipment, invoice: Invoice) -> Dict[str, Any]:
    """
    Billing Audit Engine:
    Calculates expected freight, fuel surcharge, weight overcharge, and detention charges.
    Compares total expected billing against recorded invoice total.
    Returns audit result payload.
    """
    if contract.verification_status != "VERIFIED":
        raise ValueError("Contract must be VERIFIED before performing a billing audit.")

    # 1. Base Freight Calculation
    pricing_method = (contract.pricing_method or "").upper()
    if pricing_method == "PER_KM":
        expected_freight = shipment.distance_km * contract.base_rate
    elif pricing_method == "PER_KG":
        expected_freight = shipment.cargo_weight_kg * contract.base_rate
    elif pricing_method == "FLAT":
        expected_freight = contract.base_rate
    else:
        expected_freight = contract.base_rate

    # 2. Fuel Surcharge Calculation
    fuel_surcharge_pct = contract.fuel_surcharge_percentage or 0.0
    expected_fuel_surcharge = expected_freight * (fuel_surcharge_pct / 100.0)

    # 3. Excess Weight Charge Calculation
    expected_weight_charge = 0.0
    max_weight = contract.max_weight_limit or 0.0
    weight_rate = contract.weight_overcharge_rate or 0.0
    if max_weight > 0 and shipment.cargo_weight_kg > max_weight:
        excess_weight = shipment.cargo_weight_kg - max_weight
        expected_weight_charge = excess_weight * weight_rate

    # 4. Detention Charge Calculation
    expected_detention_charge = 0.0
    billable_detention_hours = 0.0
    if shipment.arrival_time and shipment.service_start_time:
        diff_seconds = (shipment.service_start_time - shipment.arrival_time).total_seconds()
        waiting_hours = max(diff_seconds / 3600.0, 0.0)
        free_hours = contract.free_detention_hours or 0.0
        billable_detention_hours = max(waiting_hours - free_hours, 0.0)
        detention_rate = contract.detention_rate or 0.0
        expected_detention_charge = billable_detention_hours * detention_rate

    # Total Expected Billing
    expected_total = (
        expected_freight
        + expected_fuel_surcharge
        + expected_weight_charge
        + expected_detention_charge
    )

    actual_total = invoice.total_billed_amount or 0.0
    potential_revenue_leakage = max(expected_total - actual_total, 0.0)
    variance = potential_revenue_leakage

    # Explanation Generation
    explanation_parts = []
    explanation_parts.append(
        f"Expected Billing: ₹{expected_total:,.2f} (Base Freight: ₹{expected_freight:,.2f}, "
        f"Fuel Surcharge: ₹{expected_fuel_surcharge:,.2f}, Weight Charge: ₹{expected_weight_charge:,.2f}, "
        f"Detention: ₹{expected_detention_charge:,.2f}). Actual Billed Amount: ₹{actual_total:,.2f}."
    )

    if billable_detention_hours > 0 and (invoice.billed_detention_charge or 0) < expected_detention_charge:
        explanation_parts.append(
            f" Unbilled detention detected: Recorded {billable_detention_hours:.1f} billable hours at ₹{contract.detention_rate:,.2f}/hr."
        )

    if potential_revenue_leakage > 0:
        explanation_parts.append(
            f" Potential Revenue Leakage of ₹{potential_revenue_leakage:,.2f} identified due to underbilled freight/surcharges/detention."
        )
    else:
        explanation_parts.append(" Invoice billing matches or exceeds expected contract pricing.")

    explanation = "".join(explanation_parts)
    audit_id = f"AUD-B-{uuid.uuid4().hex[:8].upper()}"

    return {
        "audit_id": audit_id,
        "audit_type": "BILLING",
        "reference_id": shipment.shipment_id,
        "expected_value": round(expected_total, 2),
        "actual_value": round(actual_total, 2),
        "variance": round(variance, 2),
        "potential_financial_impact": round(potential_revenue_leakage, 2),
        "explanation": explanation
    }
