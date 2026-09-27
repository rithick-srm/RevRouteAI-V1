import os
from datetime import datetime, date
from backend.app.database.session import Base, engine, SessionLocal
from backend.app.models.domain import (
    User, Customer, Contract, Vehicle, MaintenanceBenchmark, Shipment,
    Invoice, MaintenanceLog, FuelLog, AuditResult, LeakageAlert, RecoveryActionCase
)

def seed_database():
    print("Initializing Database Tables...")
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    # Check if data already exists
    if db.query(Customer).count() > 0:
        print("Database already seeded.")
        db.close()
        return

    print("Seeding RevRoute AI Demo Data (Manager & Driver Portals)...")

    # 1. Users (Manager & Drivers)
    manager = User(
        id=1,
        name="Fleet Manager",
        email="manager@revroute.ai",
        password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW",
        role="Fleet Manager"
    )

    driver1 = User(
        id=2,
        name="Ramesh Kumar",
        email="driver1@revroute.ai",
        password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW",
        role="Driver",
        assigned_vehicle_id="TRK-101",
        phone_number="+91 98765 11111",
        license_number="DL-TN01-20210001"
    )

    driver2 = User(
        id=3,
        name="Suresh Patel",
        email="driver2@revroute.ai",
        password_hash="$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW",
        role="Driver",
        assigned_vehicle_id="TRK-102",
        phone_number="+91 98765 22222",
        license_number="DL-TN02-20210002"
    )
    db.add_all([manager, driver1, driver2])

    # 2. Customers
    c1 = Customer(customer_id="CUST-101", customer_name="ABC Manufacturing Pvt Ltd", contact="+91 98765 43210")
    c2 = Customer(customer_id="CUST-102", customer_name="South India Retail Logistics", contact="+91 98400 12345")
    c3 = Customer(customer_id="CUST-103", customer_name="Chennai Industrial Supplies", contact="+91 94440 67890")
    c4 = Customer(customer_id="CUST-104", customer_name="Bharat Consumer Distribution", contact="+91 91760 99887")
    db.add_all([c1, c2, c3, c4])

    # 3. Contracts
    cnt1 = Contract(
        contract_id="CNT-2024-001", customer_id="CUST-101", pricing_method="PER_KM",
        base_rate=25.0, fuel_surcharge_percentage=10.0, max_weight_limit=1000.0,
        weight_overcharge_rate=15.0, free_detention_hours=1.0, detention_rate=1500.0,
        effective_date=date(2024, 1, 1), expiry_date=date(2025, 12, 31),
        verification_status="VERIFIED", document_url="uploads/contracts/CNT-2024-001.pdf"
    )
    cnt2 = Contract(
        contract_id="CNT-2024-002", customer_id="CUST-102", pricing_method="PER_KM",
        base_rate=30.0, fuel_surcharge_percentage=8.0, max_weight_limit=2000.0,
        weight_overcharge_rate=20.0, free_detention_hours=2.0, detention_rate=1000.0,
        effective_date=date(2024, 1, 15), expiry_date=date(2025, 12, 31),
        verification_status="VERIFIED", document_url="uploads/contracts/CNT-2024-002.pdf"
    )
    cnt3 = Contract(
        contract_id="CNT-2024-003", customer_id="CUST-103", pricing_method="FLAT",
        base_rate=45000.0, fuel_surcharge_percentage=5.0, max_weight_limit=5000.0,
        weight_overcharge_rate=25.0, free_detention_hours=1.5, detention_rate=1200.0,
        effective_date=date(2024, 2, 1), expiry_date=date(2025, 6, 30),
        verification_status="VERIFIED", document_url="uploads/contracts/CNT-2024-003.pdf"
    )
    db.add_all([cnt1, cnt2, cnt3])

    # 4. Vehicles & Baselines
    v1 = Vehicle(
        vehicle_id="TRK-101", vehicle_class="Heavy Truck", license_plate="TN-01-AB-1234",
        expected_mileage_km_l=4.5, fuel_type="Diesel",
        expected_fuel_price_per_l=90.0,
        expected_maint_cost_min=6000.0, expected_maint_cost_max=8000.0,
        expected_maint_interval_km=10000.0, expected_maint_interval_days=90
    )
    v2 = Vehicle(
        vehicle_id="TRK-102", vehicle_class="Heavy Truck", license_plate="TN-02-CD-5678",
        expected_mileage_km_l=5.0, fuel_type="Diesel",
        expected_fuel_price_per_l=90.0,
        expected_maint_cost_min=6000.0, expected_maint_cost_max=8000.0,
        expected_maint_interval_km=10000.0, expected_maint_interval_days=90
    )
    v3 = Vehicle(
        vehicle_id="TRK-103", vehicle_class="Medium Commercial", license_plate="KA-01-EF-9012",
        expected_mileage_km_l=10.0, fuel_type="Diesel",
        expected_fuel_price_per_l=90.0,
        expected_maint_cost_min=4000.0, expected_maint_cost_max=6000.0,
        expected_maint_interval_km=12000.0, expected_maint_interval_days=120
    )
    db.add_all([v1, v2, v3])

    # 5. Maintenance Benchmarks
    bm1 = MaintenanceBenchmark(repair_type="Brake Pad Replacement", vehicle_class="Heavy Truck", benchmark_cost=6500.0)
    bm2 = MaintenanceBenchmark(repair_type="Oil Change", vehicle_class="Heavy Truck", benchmark_cost=4300.0)
    bm3 = MaintenanceBenchmark(repair_type="Battery Replacement", vehicle_class="Heavy Truck", benchmark_cost=8500.0)
    bm4 = MaintenanceBenchmark(repair_type="Tyre Replacement", vehicle_class="Heavy Truck", benchmark_cost=12000.0)
    bm5 = MaintenanceBenchmark(repair_type="Engine Service", vehicle_class="Heavy Truck", benchmark_cost=15000.0)
    bm6 = MaintenanceBenchmark(repair_type="Clutch Service", vehicle_class="Heavy Truck", benchmark_cost=18000.0)
    db.add_all([bm1, bm2, bm3, bm4, bm5, bm6])

    # 6. Shipments
    s1 = Shipment(
        shipment_id="SHP-1001", contract_id="CNT-2024-001", vehicle_id="TRK-101",
        origin="Chennai", destination="Bengaluru", distance_km=1000.0, cargo_weight_kg=1000.0,
        arrival_time=datetime(2024, 9, 10, 8, 0), service_start_time=datetime(2024, 9, 10, 8, 30),
        departure_time=datetime(2024, 9, 10, 10, 0), status="Delivered"
    )
    s2 = Shipment(
        shipment_id="SHP-1002", contract_id="CNT-2024-001", vehicle_id="TRK-102",
        origin="Coimbatore", destination="Hyderabad", distance_km=600.0, cargo_weight_kg=800.0,
        arrival_time=datetime(2024, 9, 12, 10, 0), service_start_time=datetime(2024, 9, 12, 13, 0),
        departure_time=datetime(2024, 9, 12, 14, 30), status="Delivered"
    )
    s3 = Shipment(
        shipment_id="SHP-1003", contract_id="CNT-2024-002", vehicle_id="TRK-101",
        origin="Chennai", destination="Madurai", distance_km=400.0, cargo_weight_kg=1500.0,
        arrival_time=datetime(2024, 9, 14, 6, 0), service_start_time=datetime(2024, 9, 14, 6, 15),
        departure_time=datetime(2024, 9, 14, 7, 0), status="Delivered"
    )
    db.add_all([s1, s2, s3])

    # 7. Invoices
    inv1 = Invoice(
        invoice_id="INV-2024-001", invoice_number="INV-88901", shipment_id="SHP-1001",
        invoice_date=date(2024, 9, 12), billed_freight_amount=25000.0, billed_fuel_surcharge=2000.0,
        billed_weight_charge=0.0, billed_detention_charge=0.0, total_billed_amount=27000.0,
        verification_status="VERIFIED"
    )
    inv2 = Invoice(
        invoice_id="INV-2024-002", invoice_number="INV-88902", shipment_id="SHP-1002",
        invoice_date=date(2024, 9, 14), billed_freight_amount=18000.0, billed_fuel_surcharge=1440.0,
        billed_weight_charge=0.0, billed_detention_charge=0.0, total_billed_amount=19440.0,
        verification_status="VERIFIED"
    )
    db.add_all([inv1, inv2])

    # 8. Maintenance Logs (Includes Driver Submitted Repair Entries)
    ml1 = MaintenanceLog(
        repair_id="REP-3001", vehicle_id="TRK-101", driver_id=2, service_center="Apex Truck Care Chennai",
        service_date=date(2024, 9, 1), repair_type="Brake Pad Replacement", parts_cost=7500.0,
        labor_cost=2500.0, benchmark_cost=6500.0, total_repair_cost=10000.0, invoice_number="MNT-4401"
    )
    ml2 = MaintenanceLog(
        repair_id="REP-3002", vehicle_id="TRK-101", driver_id=2, service_center="Apex Truck Care Chennai",
        service_date=date(2024, 9, 7), repair_type="Brake Pad Replacement", parts_cost=7000.0,
        labor_cost=2000.0, benchmark_cost=6500.0, total_repair_cost=9000.0, invoice_number="MNT-4409"
    )
    db.add_all([ml1, ml2])

    # 9. Fuel Logs (Includes Driver Submitted Fuel Entries)
    fl1 = FuelLog(
        fuel_log_id="FL-5001", vehicle_id="TRK-101", driver_id=2, shipment_id="SHP-1003",
        fuel_date=date(2024, 9, 14), liters_filled=80.0, price_per_liter=90.0,
        total_cost=7200.0, fuel_station="HP Petrol Pump Chennai", odometer_reading=45200.0, opening_fuel=20.0, closing_fuel=30.0,
        gps_latitude=13.0827, gps_longitude=80.2707
    )
    db.add(fl1)

    # 10. Audit Results
    ar1 = AuditResult(
        audit_id="AUD-B-001", audit_type="BILLING", reference_id="SHP-1001",
        expected_value=30000.0, actual_value=27000.0, variance=3000.0, potential_financial_impact=3000.0,
        explanation="Potential Revenue Leakage Detected: Expected Billing is ₹30,000.00 (Freight 25,000 + Fuel 2,500 + Weight/Detention 2,500), but recorded invoice amount is ₹27,000.00."
    )
    ar2 = AuditResult(
        audit_id="AUD-B-002", audit_type="BILLING", reference_id="SHP-1002",
        expected_value=22440.0, actual_value=19440.0, variance=3000.0, potential_financial_impact=3000.0,
        explanation="Potential Revenue Leakage Detected: Waiting time was 3 hours (1 free hour), resulting in 2 billable detention hours at ₹1,500/hr (₹3,000.00), which was unbilled in the invoice."
    )
    ar3 = AuditResult(
        audit_id="AUD-M-001", audit_type="MAINTENANCE", reference_id="REP-3001",
        expected_value=6500.0, actual_value=10000.0, variance=3500.0, potential_financial_impact=3500.0,
        explanation="Potential Maintenance Cost Overrun: Recorded repair cost of ₹10,000.00 exceeds reference benchmark of ₹6,500.00 for Brake Pad Replacement on Heavy Truck."
    )
    ar4 = AuditResult(
        audit_id="AUD-F-001", audit_type="FUEL", reference_id="FL-5001",
        expected_value=50.0, actual_value=70.0, variance=20.0, potential_financial_impact=1800.0,
        explanation="Fuel Consumption & Cost Variance Detected: Expected fuel consumption for 400.0 km at 8.0 km/L baseline is 50.0 L, whereas estimated actual consumption was 70.0 L (Variance: 20.0 L). Potential Fuel Cost Variance: ₹1,800.00."
    )
    db.add_all([ar1, ar2, ar3, ar4])

    # 11. Leakage Alerts
    alt1 = LeakageAlert(alert_id="ALT-101", audit_id="AUD-B-001", category="Revenue Leakage", status="DETECTED")
    alt2 = LeakageAlert(alert_id="ALT-102", audit_id="AUD-B-002", category="Revenue Leakage", status="DETECTED")
    alt3 = LeakageAlert(alert_id="ALT-103", audit_id="AUD-M-001", category="Maintenance Overrun", status="UNDER REVIEW")
    alt4 = LeakageAlert(alert_id="ALT-104", audit_id="AUD-F-001", category="Fuel Variance", status="DETECTED")
    db.add_all([alt1, alt2, alt3, alt4])

    # 12. Recovery Action Cases
    cas1 = RecoveryActionCase(
        case_id="CAS-901", alert_id="ALT-103", action_type="Maintenance Review",
        verified_amount=3500.0, recovered_or_corrected_amount=0.0, assigned_to="Fleet Manager",
        review_notes="Contacted service center regarding parts markup variance.", status="IN_PROGRESS"
    )
    db.add(cas1)

    db.commit()
    db.close()
    print("Seeding Completed Successfully!")

if __name__ == "__main__":
    seed_database()
