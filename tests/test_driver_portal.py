import unittest
from datetime import date
from backend.app.models.domain import FuelLog, MaintenanceLog, Vehicle, MaintenanceBenchmark
from backend.app.services.fuel_audit import perform_fuel_audit
from backend.app.services.maintenance_audit import perform_maintenance_audit

class TestDriverPortalIntegration(unittest.TestCase):
    def test_driver_fuel_submission_audit_integration(self):
        # Assigned Vehicle
        vehicle = Vehicle(
            vehicle_id="TRK-101",
            vehicle_class="Heavy Truck",
            license_plate="TN-01-AB-1234",
            expected_mileage_km_l=8.0
        )

        # Driver Ramesh Kumar submits fuel log
        driver_fuel_log = FuelLog(
            fuel_log_id="FL-DRV-001",
            vehicle_id="TRK-101",
            driver_id=2, # Ramesh Kumar
            fuel_date=date(2024, 9, 20),
            liters_filled=75.0,
            price_per_liter=90.0,
            total_cost=6750.0,
            fuel_station="HP Fuel Pump Chennai",
            odometer_reading=45500.0,
            notes="Submitted via Driver Portal"
        )

        # Audit Engine processes driver submission
        res = perform_fuel_audit(fuel_log=driver_fuel_log, vehicle=vehicle, reference_fuel_price=90.0)

        self.assertEqual(res["audit_type"], "FUEL")
        self.assertEqual(res["reference_id"], "FL-DRV-001")
        self.assertEqual(res["actual_value"], 75.0)
        self.assertEqual(res["actual_cost"], 6750.0)

    def test_driver_repair_submission_audit_integration(self):
        # Benchmark for Brake Pad Replacement
        bm = MaintenanceBenchmark(
            repair_type="Brake Pad Replacement",
            vehicle_class="Heavy Truck",
            benchmark_cost=6500.0
        )

        # Driver Ramesh Kumar submits repair log with uploaded bill
        driver_repair_log = MaintenanceLog(
            repair_id="REP-DRV-001",
            vehicle_id="TRK-101",
            driver_id=2, # Ramesh Kumar
            service_center="Express Heavy Repairs",
            service_date=date(2024, 9, 21),
            repair_type="Brake Pad Replacement",
            problem_description="Brake pad wear noise",
            parts_cost=7000.0,
            labor_cost=2500.0,
            benchmark_cost=6500.0,
            total_repair_cost=9500.0,
            odometer_reading=45600.0,
            invoice_number="BILL-9901",
            receipt_url="uploads/maintenance/bill_9901.pdf",
            notes="Submitted via Driver Portal"
        )

        # Audit Engine processes driver submission against reference benchmark
        res = perform_maintenance_audit(log=driver_repair_log, benchmark=bm)

        self.assertEqual(res["audit_type"], "MAINTENANCE")
        self.assertEqual(res["reference_id"], "REP-DRV-001")
        self.assertEqual(res["expected_value"], 6500.0)
        self.assertEqual(res["actual_value"], 9500.0)
        self.assertEqual(res["variance"], 3000.0) # 9500 - 6500 = 3000 overrun

if __name__ == "__main__":
    unittest.main()
