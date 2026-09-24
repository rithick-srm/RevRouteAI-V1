import unittest
from datetime import datetime, date
from backend.app.models.domain import Contract, Shipment, Invoice
from backend.app.services.billing_audit import perform_billing_audit

class TestBillingAudit(unittest.TestCase):
    def test_billing_leakage_calculation(self):
        contract = Contract(
            contract_id="CNT-TEST-01",
            customer_id="CUST-01",
            pricing_method="PER_KM",
            base_rate=25.0,
            fuel_surcharge_percentage=10.0,
            max_weight_limit=1000.0,
            weight_overcharge_rate=15.0,
            free_detention_hours=1.0,
            detention_rate=1500.0,
            effective_date=date(2024, 1, 1),
            expiry_date=date(2025, 12, 31),
            verification_status="VERIFIED"
        )

        shipment = Shipment(
            shipment_id="SHP-TEST-01",
            contract_id="CNT-TEST-01",
            vehicle_id="TRK-01",
            origin="Chennai",
            destination="Bengaluru",
            distance_km=1000.0,
            cargo_weight_kg=1000.0,
            arrival_time=datetime(2024, 9, 10, 8, 0),
            service_start_time=datetime(2024, 9, 10, 8, 30)
        )

        invoice = Invoice(
            invoice_id="INV-TEST-01",
            invoice_number="INV-9901",
            shipment_id="SHP-TEST-01",
            invoice_date=date(2024, 9, 12),
            total_billed_amount=27000.0
        )

        res = perform_billing_audit(contract, shipment, invoice)
        self.assertEqual(res["expected_value"], 27500.0)
        self.assertEqual(res["actual_value"], 27000.0)
        self.assertEqual(res["potential_financial_impact"], 500.0)

    def test_detention_leakage_calculation(self):
        contract = Contract(
            contract_id="CNT-TEST-02",
            customer_id="CUST-01",
            pricing_method="PER_KM",
            base_rate=20.0,
            fuel_surcharge_percentage=0.0,
            free_detention_hours=1.0,
            detention_rate=1500.0,
            verification_status="VERIFIED"
        )

        shipment = Shipment(
            shipment_id="SHP-TEST-02",
            contract_id="CNT-TEST-02",
            vehicle_id="TRK-01",
            origin="Origin",
            destination="Dest",
            distance_km=500.0,
            cargo_weight_kg=500.0,
            arrival_time=datetime(2024, 9, 10, 10, 0),
            service_start_time=datetime(2024, 9, 10, 13, 0)
        )

        invoice = Invoice(
            invoice_id="INV-TEST-02",
            invoice_number="INV-9902",
            shipment_id="SHP-TEST-02",
            invoice_date=date(2024, 9, 12),
            total_billed_amount=10000.0,
            billed_detention_charge=0.0
        )

        res = perform_billing_audit(contract, shipment, invoice)
        self.assertEqual(res["expected_value"], 13000.0)
        self.assertEqual(res["actual_value"], 10000.0)
        self.assertEqual(res["potential_financial_impact"], 3000.0)

if __name__ == "__main__":
    unittest.main()
