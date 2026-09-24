import unittest
from datetime import date
from backend.app.models.domain import FuelLog, Vehicle, Shipment
from backend.app.services.fuel_audit import perform_fuel_audit

class TestFuelAudit(unittest.TestCase):
    def test_fuel_consumption_and_cost_variance(self):
        vehicle = Vehicle(
            vehicle_id="TRK-101",
            vehicle_class="Heavy Truck",
            license_plate="TN-01-AB-1234",
            expected_mileage_km_l=8.0
        )

        shipment = Shipment(
            shipment_id="SHP-TEST-03",
            contract_id="CNT-01",
            vehicle_id="TRK-101",
            origin="Chennai",
            destination="Madurai",
            distance_km=400.0,
            cargo_weight_kg=1000.0
        )

        fuel_log = FuelLog(
            fuel_log_id="FL-TEST-01",
            vehicle_id="TRK-101",
            shipment_id="SHP-TEST-03",
            fuel_date=date(2024, 9, 14),
            liters_filled=80.0,
            price_per_liter=90.0,
            total_cost=7200.0,
            opening_fuel=20.0,
            closing_fuel=30.0
        )

        res = perform_fuel_audit(fuel_log=fuel_log, vehicle=vehicle, shipment=shipment, reference_fuel_price=90.0)

        self.assertEqual(res["expected_value"], 50.0)
        self.assertEqual(res["actual_value"], 70.0)
        self.assertEqual(res["variance"], 20.0)
        self.assertEqual(res["expected_cost"], 4500.0)
        self.assertEqual(res["actual_cost"], 7200.0)
        self.assertEqual(res["potential_financial_impact"], 2700.0)

if __name__ == "__main__":
    unittest.main()
