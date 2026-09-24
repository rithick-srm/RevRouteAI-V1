import unittest
from datetime import date
from backend.app.models.domain import MaintenanceLog, MaintenanceBenchmark
from backend.app.services.maintenance_audit import perform_maintenance_audit

class TestMaintenanceAudit(unittest.TestCase):
    def test_maintenance_overrun(self):
        bm = MaintenanceBenchmark(
            repair_type="Brake Pad Replacement",
            vehicle_class="Heavy Truck",
            benchmark_cost=6500.0
        )

        log = MaintenanceLog(
            repair_id="REP-TEST-01",
            vehicle_id="TRK-101",
            service_center="Apex Truck Care",
            service_date=date(2024, 9, 1),
            repair_type="Brake Pad Replacement",
            total_repair_cost=10000.0
        )

        res = perform_maintenance_audit(log=log, benchmark=bm)
        self.assertEqual(res["expected_value"], 6500.0)
        self.assertEqual(res["actual_value"], 10000.0)
        self.assertEqual(res["variance"], 3500.0)
        self.assertEqual(res["potential_financial_impact"], 3500.0)

if __name__ == "__main__":
    unittest.main()
