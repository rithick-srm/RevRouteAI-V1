import uuid
from typing import Dict, Any, Optional
from backend.app.models.domain import FuelLog, Vehicle, Shipment

def perform_fuel_audit(
    fuel_log: FuelLog,
    vehicle: Vehicle,
    shipment: Optional[Shipment] = None,
    reference_fuel_price: float = 90.00
) -> Dict[str, Any]:
    """
    Fuel Audit Engine:
    Calculates expected fuel consumption based on distance and vehicle mileage baseline.
    Estimates actual consumption from fuel levels or purchases.
    Calculates potential fuel cost variance.
    """
    mileage_baseline = vehicle.expected_mileage_km_l if vehicle.expected_mileage_km_l > 0 else 8.0
    distance_km = shipment.distance_km if shipment else 0.0

    # 1. Expected Fuel Consumption
    if distance_km > 0:
        expected_fuel_liters = distance_km / mileage_baseline
    else:
        # Fallback if shipment distance not directly linked
        expected_fuel_liters = fuel_log.liters_filled

    # 2. Estimated Actual Consumption
    has_tank_levels = (fuel_log.opening_fuel is not None and fuel_log.closing_fuel is not None)
    if has_tank_levels:
        estimated_actual_liters = max(
            fuel_log.opening_fuel + fuel_log.liters_filled - fuel_log.closing_fuel,
            0.0
        )
        consumption_note = "Estimated actual consumption calculated from tank opening/closing levels and fuel filled."
    else:
        estimated_actual_liters = fuel_log.liters_filled
        consumption_note = "Estimated consumption based on recorded fuel purchases."

    # 3. Consumption Variance
    fuel_consumption_variance = estimated_actual_liters - expected_fuel_liters

    # 4. Expected Fuel Cost & Actual Fuel Cost
    unit_price = fuel_log.price_per_liter if fuel_log.price_per_liter > 0 else reference_fuel_price
    expected_fuel_cost = expected_fuel_liters * unit_price
    actual_fuel_cost = fuel_log.total_cost if fuel_log.total_cost > 0 else (fuel_log.liters_filled * unit_price)

    potential_cost_variance = max(actual_fuel_cost - expected_fuel_cost, 0.0)

    audit_id = f"AUD-F-{uuid.uuid4().hex[:8].upper()}"

    explanation_parts = [
        f"Distance: {distance_km:.1f} km @ {mileage_baseline:.2f} km/L baseline.",
        f" Expected Fuel: {expected_fuel_liters:.2f} L vs Estimated Actual Consumption: {estimated_actual_liters:.2f} L.",
        f" Consumption Variance: {fuel_consumption_variance:+.2f} L. {consumption_note}",
        f" Expected Fuel Cost: ₹{expected_fuel_cost:,.2f} vs Recorded Fuel Cost: ₹{actual_fuel_cost:,.2f}."
    ]

    if potential_cost_variance > 0:
        explanation_parts.append(
            f" Potential Fuel Cost Variance of ₹{potential_cost_variance:,.2f} identified above baseline expectations."
        )
    else:
        explanation_parts.append(" Fuel consumption and cost align within baseline parameters.")

    explanation = "".join(explanation_parts)

    return {
        "audit_id": audit_id,
        "audit_type": "FUEL",
        "reference_id": fuel_log.fuel_log_id,
        "expected_value": round(expected_fuel_liters, 2),
        "actual_value": round(estimated_actual_liters, 2),
        "variance": round(fuel_consumption_variance, 2),
        "potential_financial_impact": round(potential_cost_variance, 2),
        "expected_cost": round(expected_fuel_cost, 2),
        "actual_cost": round(actual_fuel_cost, 2),
        "explanation": explanation
    }
