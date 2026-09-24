-- RevRoute AI Seed Data
USE revroute_db;

-- 1. Users
INSERT INTO users (id, name, email, password_hash, role) VALUES
(1, 'Fleet Manager', 'manager@revroute.ai', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeg6Lruj3vjPGga31lW', 'Fleet Manager');

-- 2. Customers
INSERT INTO customers (customer_id, customer_name, contact) VALUES
('CUST-101', 'ABC Manufacturing Pvt Ltd', '+91 98765 43210 / logistics@abcmfg.in'),
('CUST-102', 'South India Retail Logistics', '+91 98400 12345 / supply@southindiaretail.com'),
('CUST-103', 'Chennai Industrial Supplies', '+91 94440 67890 / ops@chennaiind.in'),
('CUST-104', 'Bharat Consumer Distribution', '+91 91760 99887 / dispatch@bharatconsumer.com');

-- 3. Contracts
INSERT INTO contracts (contract_id, customer_id, pricing_method, base_rate, fuel_surcharge_percentage, max_weight_limit, weight_overcharge_rate, free_detention_hours, detention_rate, effective_date, expiry_date, verification_status, document_url) VALUES
('CNT-2024-001', 'CUST-101', 'PER_KM', 25.00, 10.00, 1000.00, 15.00, 1.00, 1500.00, '2024-01-01', '2025-12-31', 'VERIFIED', 'uploads/contracts/CNT-2024-001.pdf'),
('CNT-2024-002', 'CUST-102', 'PER_KM', 30.00, 8.00, 2000.00, 20.00, 2.00, 1000.00, '2024-01-15', '2025-12-31', 'VERIFIED', 'uploads/contracts/CNT-2024-002.pdf'),
('CNT-2024-003', 'CUST-103', 'FLAT', 45000.00, 5.00, 5000.00, 25.00, 1.50, 1200.00, '2024-02-01', '2025-06-30', 'VERIFIED', 'uploads/contracts/CNT-2024-003.pdf'),
('CNT-2024-004', 'CUST-104', 'PER_KG', 12.00, 10.00, 1500.00, 18.00, 1.00, 1500.00, '2024-03-01', '2025-12-31', 'PENDING', 'uploads/contracts/CNT-2024-004.pdf');

-- 4. Vehicles
INSERT INTO vehicles (vehicle_id, vehicle_class, license_plate, expected_mileage_km_l, fuel_type) VALUES
('TRK-101', 'Heavy Truck', 'TN-01-AB-1234', 8.00, 'Diesel'),
('TRK-102', 'Heavy Truck', 'TN-02-CD-5678', 7.50, 'Diesel'),
('TRK-103', 'Medium Commercial', 'KA-01-EF-9012', 10.00, 'Diesel'),
('TRK-104', 'Medium Commercial', 'MH-12-GH-3456', 9.50, 'Diesel');

-- 5. Maintenance Benchmarks
INSERT INTO maintenance_benchmarks (repair_type, vehicle_class, benchmark_cost) VALUES
('Brake Pad Replacement', 'Heavy Truck', 6500.00),
('Oil Change', 'Heavy Truck', 4300.00),
('Battery Replacement', 'Heavy Truck', 8500.00),
('Tyre Replacement', 'Heavy Truck', 12000.00),
('Engine Service', 'Heavy Truck', 15000.00),
('Clutch Service', 'Heavy Truck', 18000.00),
('Brake Pad Replacement', 'Medium Commercial', 5000.00),
('Oil Change', 'Medium Commercial', 3500.00);

-- 6. Shipments
INSERT INTO shipments (shipment_id, contract_id, vehicle_id, origin, destination, distance_km, cargo_weight_kg, arrival_time, service_start_time, departure_time, scheduled_delivery, actual_delivery, status) VALUES
-- Demo Scenario 1: Freight Leakage (Distance = 1000km @ 25/km = 25000 + 10% fuel = 2500 -> Expected 27500 + weight extra = ₹30,000 expected billing total, Actual billed = ₹27,000)
('SHP-1001', 'CNT-2024-001', 'TRK-101', 'Chennai', 'Bengaluru', 1000.00, 1000.00, '2024-09-10 08:00:00', '2024-09-10 08:30:00', '2024-09-10 10:00:00', '2024-09-11 18:00:00', '2024-09-11 17:30:00', 'Delivered'),
-- Demo Scenario 2: Detention Leakage (Arrival 10:00, Service Start 13:00 -> Waiting 3h, Free 1h, Billable 2h @ 1500 = 3000 expected detention)
('SHP-1002', 'CNT-2024-001', 'TRK-102', 'Coimbatore', 'Hyderabad', 600.00, 800.00, '2024-09-12 10:00:00', '2024-09-12 13:00:00', '2024-09-12 14:30:00', '2024-09-13 12:00:00', '2024-09-13 11:45:00', 'Delivered'),
-- Demo Scenario 4: Fuel Variance (Distance = 400 km @ 8 km/L -> Expected Fuel = 50 L, Actual = 70 L)
('SHP-1003', 'CNT-2024-002', 'TRK-101', 'Chennai', 'Madurai', 400.00, 1500.00, '2024-09-14 06:00:00', '2024-09-14 06:15:00', '2024-09-14 07:00:00', '2024-09-14 18:00:00', '2024-09-14 17:50:00', 'Delivered'),
('SHP-1004', 'CNT-2024-003', 'TRK-103', 'Pune', 'Bengaluru', 840.00, 3000.00, '2024-09-15 09:00:00', '2024-09-15 09:30:00', '2024-09-15 11:00:00', '2024-09-16 20:00:00', '2024-09-16 19:40:00', 'Delivered');

-- 7. Invoices
INSERT INTO invoices (invoice_id, invoice_number, shipment_id, invoice_date, billed_freight_amount, billed_fuel_surcharge, billed_weight_charge, billed_detention_charge, total_billed_amount, verification_status, document_url) VALUES
-- Demo Scenario 1: Expected Billing = ₹30,000 (Base 25,000 + Fuel 2,500 + Weight/Detention 2,500), Billed = ₹27,000 -> Leakage ₹3,000
('INV-2024-001', 'INV-88901', 'SHP-1001', '2024-09-12', 25000.00, 2000.00, 0.00, 0.00, 27000.00, 'VERIFIED', 'uploads/invoices/INV-88901.pdf'),
-- Demo Scenario 2: Expected Detention = ₹3,000, Actual Billed Detention = ₹0
('INV-2024-002', 'INV-88902', 'SHP-1002', '2024-09-14', 18000.00, 1440.00, 0.00, 0.00, 19440.00, 'VERIFIED', 'uploads/invoices/INV-88902.pdf'),
('INV-2024-003', 'INV-88903', 'SHP-1003', '2024-09-15', 12000.00, 960.00, 0.00, 0.00, 12960.00, 'VERIFIED', 'uploads/invoices/INV-88903.pdf');

-- 8. Maintenance Logs
INSERT INTO maintenance_logs (repair_id, vehicle_id, service_center, service_date, repair_type, parts_cost, labor_cost, benchmark_cost, total_repair_cost, invoice_number, receipt_url) VALUES
-- Demo Scenario 3: Maintenance Overrun (Benchmark = ₹6,500, Actual = ₹10,000 -> Overrun = ₹3,500)
('REP-3001', 'TRK-101', 'Apex Truck Care Chennai', '2024-09-01', 'Brake Pad Replacement', 7500.00, 2500.00, 6500.00, 10000.00, 'MNT-4401', 'uploads/maintenance/MNT-4401.pdf'),
('REP-3002', 'TRK-101', 'Apex Truck Care Chennai', '2024-09-07', 'Brake Pad Replacement', 7000.00, 2000.00, 6500.00, 9000.00, 'MNT-4409', 'uploads/maintenance/MNT-4409.pdf'), -- Repeated repair demo
('REP-3003', 'TRK-102', 'Deccan Fleet Repairs Hyd', '2024-09-05', 'Oil Change', 3500.00, 800.00, 4300.00, 4300.00, 'MNT-5502', 'uploads/maintenance/MNT-5502.pdf');

-- 9. Fuel Logs
INSERT INTO fuel_logs (fuel_log_id, vehicle_id, shipment_id, fuel_date, liters_filled, price_per_liter, total_cost, odometer_reading, opening_fuel, closing_fuel, gps_latitude, gps_longitude, receipt_url) VALUES
-- Demo Scenario 4: Distance 400km @ 8km/L -> Expected = 50 L. Opening 20L + Added 80L - Closing 30L = 70 L actual. Variance = 20 L. Cost: 70 * 90 = 6,300 vs Expected 50 * 90 = 4,500. Cost Variance = ₹1,800.
('FL-5001', 'TRK-101', 'SHP-1003', '2024-09-14', 80.00, 90.00, 7200.00, 45200.00, 20.00, 30.00, 13.0827, 80.2707, 'uploads/fuel/FL-5001.pdf'),
('FL-5002', 'TRK-102', 'SHP-1002', '2024-09-12', 80.00, 91.50, 7320.00, 38100.00, 15.00, 15.00, 11.0168, 76.9558, 'uploads/fuel/FL-5002.pdf');

-- 10. Audit Results
INSERT INTO audit_results (audit_id, audit_type, reference_id, expected_value, actual_value, variance, potential_financial_impact, explanation) VALUES
('AUD-B-001', 'BILLING', 'SHP-1001', 30000.00, 27000.00, 3000.00, 3000.00, 'Potential Revenue Leakage Detected: Expected Billing is ₹30,000.00 based on contract base rate, fuel surcharge & weight limit, but recorded invoice amount is ₹27,000.00.'),
('AUD-B-002', 'BILLING', 'SHP-1002', 22440.00, 19440.00, 3000.00, 3000.00, 'Potential Revenue Leakage Detected: Waiting time was 3 hours (1 free hour), resulting in 2 billable detention hours at ₹1,500/hr (₹3,000.00), which was unbilled in the invoice.'),
('AUD-M-001', 'MAINTENANCE', 'REP-3001', 6500.00, 10000.00, 3500.00, 3500.00, 'Potential Maintenance Cost Overrun: Recorded repair cost of ₹10,000.00 exceeds the reference benchmark of ₹6,500.00 for Brake Pad Replacement on Heavy Truck.'),
('AUD-F-001', 'FUEL', 'FL-5001', 50.00, 70.00, 20.00, 1800.00, 'Fuel Consumption & Cost Variance Detected: Expected fuel consumption for 400.00 km at 8.00 km/L baseline is 50.00 L, whereas estimated actual consumption was 70.00 L (Variance: 20.00 L). Potential Fuel Cost Variance: ₹1,800.00.');

-- 11. Leakage Alerts
INSERT INTO leakage_alerts (alert_id, audit_id, category, status) VALUES
('ALT-101', 'AUD-B-001', 'Revenue Leakage', 'DETECTED'),
('ALT-102', 'AUD-B-002', 'Revenue Leakage', 'DETECTED'),
('ALT-103', 'AUD-M-001', 'Maintenance Overrun', 'UNDER REVIEW'),
('ALT-104', 'AUD-F-001', 'Fuel Variance', 'DETECTED');

-- 12. Recovery Action Cases
INSERT INTO recovery_action_cases (case_id, alert_id, action_type, verified_amount, recovered_or_corrected_amount, assigned_to, review_notes, status) VALUES
('CAS-901', 'ALT-103', 'Maintenance Review', 3500.00, 0.00, 'Fleet Manager', 'Contacted service center regarding parts mark-up variance.', 'IN_PROGRESS');
