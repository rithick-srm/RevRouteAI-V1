-- RevRoute AI Database Schema (MySQL 8.0+)
-- AI-Assisted Logistics Financial & Operational Leakage Audit Platform

CREATE DATABASE IF NOT EXISTS revroute_db;
USE revroute_db;

-- 1. Users Table (Supports Fleet Manager & Driver Roles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Fleet Manager', -- Fleet Manager, Driver, Admin
    assigned_vehicle_id VARCHAR(50),
    phone_number VARCHAR(50),
    license_number VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
    customer_id VARCHAR(50) PRIMARY KEY,
    customer_name VARCHAR(255) NOT NULL,
    contact VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    contract_id VARCHAR(50) PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    pricing_method VARCHAR(20) NOT NULL, -- PER_KM, PER_KG, FLAT
    base_rate DECIMAL(10, 2) NOT NULL,
    fuel_surcharge_percentage DECIMAL(5, 2) DEFAULT 0.00,
    max_weight_limit DECIMAL(10, 2) DEFAULT 0.00,
    weight_overcharge_rate DECIMAL(10, 2) DEFAULT 0.00,
    free_detention_hours DECIMAL(5, 2) DEFAULT 0.00,
    detention_rate DECIMAL(10, 2) DEFAULT 0.00,
    effective_date DATE NOT NULL,
    expiry_date DATE NOT NULL,
    verification_status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    document_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
);

-- 4. Vehicles Table
CREATE TABLE IF NOT EXISTS vehicles (
    vehicle_id VARCHAR(50) PRIMARY KEY,
    vehicle_class VARCHAR(100) NOT NULL, -- Heavy Truck, Medium Commercial, etc.
    license_plate VARCHAR(50) NOT NULL,
    expected_mileage_km_l DECIMAL(5, 2) NOT NULL,
    fuel_type VARCHAR(20) DEFAULT 'Diesel',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Key constraint from users to vehicles
ALTER TABLE users ADD CONSTRAINT fk_users_vehicle FOREIGN KEY (assigned_vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE SET NULL;

-- 5. Maintenance Benchmarks Table
CREATE TABLE IF NOT EXISTS maintenance_benchmarks (
    benchmark_id INT AUTO_INCREMENT PRIMARY KEY,
    repair_type VARCHAR(150) NOT NULL,
    vehicle_class VARCHAR(100) NOT NULL,
    benchmark_cost DECIMAL(10, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_repair_class (repair_type, vehicle_class)
);

-- 6. Shipments Table
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id VARCHAR(50) PRIMARY KEY,
    contract_id VARCHAR(50) NOT NULL,
    vehicle_id VARCHAR(50) NOT NULL,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    distance_km DECIMAL(10, 2) NOT NULL,
    cargo_weight_kg DECIMAL(10, 2) NOT NULL,
    arrival_time DATETIME,
    service_start_time DATETIME,
    departure_time DATETIME,
    scheduled_delivery DATETIME,
    actual_delivery DATETIME,
    status VARCHAR(30) DEFAULT 'Scheduled', -- Scheduled, In Transit, Delivered, Cancelled
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contract_id) REFERENCES contracts(contract_id) ON DELETE CASCADE,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE
);

-- 7. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    invoice_id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(100) UNIQUE NOT NULL,
    shipment_id VARCHAR(50) NOT NULL,
    invoice_date DATE NOT NULL,
    billed_freight_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    billed_fuel_surcharge DECIMAL(10, 2) DEFAULT 0.00,
    billed_weight_charge DECIMAL(10, 2) DEFAULT 0.00,
    billed_detention_charge DECIMAL(10, 2) DEFAULT 0.00,
    total_billed_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    document_url VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id) ON DELETE CASCADE
);

-- 8. Maintenance Logs Table
CREATE TABLE IF NOT EXISTS maintenance_logs (
    repair_id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    driver_id INT,
    service_center VARCHAR(255) NOT NULL,
    service_date DATE NOT NULL,
    repair_type VARCHAR(150) NOT NULL,
    problem_description TEXT,
    parts_cost DECIMAL(10, 2) DEFAULT 0.00,
    labor_cost DECIMAL(10, 2) DEFAULT 0.00,
    benchmark_cost DECIMAL(10, 2) DEFAULT 0.00,
    total_repair_cost DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    odometer_reading DECIMAL(10, 2),
    invoice_number VARCHAR(100),
    receipt_url VARCHAR(500),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 9. Fuel Logs Table
CREATE TABLE IF NOT EXISTS fuel_logs (
    fuel_log_id VARCHAR(50) PRIMARY KEY,
    vehicle_id VARCHAR(50) NOT NULL,
    driver_id INT,
    shipment_id VARCHAR(50),
    fuel_date DATE NOT NULL,
    liters_filled DECIMAL(10, 2) NOT NULL,
    price_per_liter DECIMAL(10, 2) NOT NULL,
    total_cost DECIMAL(10, 2) NOT NULL,
    fuel_station VARCHAR(255),
    odometer_reading DECIMAL(10, 2),
    opening_fuel DECIMAL(10, 2),
    closing_fuel DECIMAL(10, 2),
    gps_latitude DECIMAL(10, 6),
    gps_longitude DECIMAL(10, 6),
    receipt_url VARCHAR(500),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (shipment_id) REFERENCES shipments(shipment_id) ON DELETE SET NULL
);

-- 10. Audit Results Table
CREATE TABLE IF NOT EXISTS audit_results (
    audit_id VARCHAR(50) PRIMARY KEY,
    audit_type VARCHAR(30) NOT NULL, -- BILLING, MAINTENANCE, FUEL
    reference_id VARCHAR(50) NOT NULL, -- shipment_id, repair_id, or fuel_log_id
    expected_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    actual_value DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    variance DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    potential_financial_impact DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    explanation TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Leakage Alerts Table
CREATE TABLE IF NOT EXISTS leakage_alerts (
    alert_id VARCHAR(50) PRIMARY KEY,
    audit_id VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Revenue Leakage, Maintenance Overrun, Fuel Variance, Duplicate Record, Operational Inconsistency
    status VARCHAR(30) DEFAULT 'DETECTED', -- DETECTED, UNDER REVIEW, VERIFIED, ACTION INITIATED, RESOLVED, DISMISSED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (audit_id) REFERENCES audit_results(audit_id) ON DELETE CASCADE
);

-- 12. Recovery Action Cases Table
CREATE TABLE IF NOT EXISTS recovery_action_cases (
    case_id VARCHAR(50) PRIMARY KEY,
    alert_id VARCHAR(50) NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- Customer Billing Recovery, Maintenance Review, Fuel Investigation, Record Correction, No Action Required
    verified_amount DECIMAL(10, 2) DEFAULT 0.00,
    recovered_or_corrected_amount DECIMAL(10, 2) DEFAULT 0.00,
    assigned_to VARCHAR(255) DEFAULT 'Fleet Manager',
    review_notes TEXT,
    status VARCHAR(30) DEFAULT 'OPEN', -- OPEN, IN_PROGRESS, RESOLVED, CLOSED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    FOREIGN KEY (alert_id) REFERENCES leakage_alerts(alert_id) ON DELETE CASCADE
);
