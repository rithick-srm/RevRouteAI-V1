from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Float, Numeric, DateTime, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="Fleet Manager") # "Fleet Manager", "Driver", "Admin"
    assigned_vehicle_id = Column(String(50), ForeignKey("vehicles.vehicle_id"), nullable=True)
    phone_number = Column(String(50), nullable=True)
    license_number = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    assigned_vehicle = relationship("Vehicle", back_populates="assigned_drivers")
    fuel_logs = relationship("FuelLog", back_populates="driver")
    maintenance_logs = relationship("MaintenanceLog", back_populates="driver")

class Customer(Base):
    __tablename__ = "customers"

    customer_id = Column(String(50), primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False)
    contact = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    contracts = relationship("Contract", back_populates="customer", cascade="all, delete-orphan")

class Contract(Base):
    __tablename__ = "contracts"

    contract_id = Column(String(50), primary_key=True, index=True)
    customer_id = Column(String(50), ForeignKey("customers.customer_id"), nullable=False)
    pricing_method = Column(String(20), nullable=False) # PER_KM, PER_KG, FLAT
    base_rate = Column(Float, nullable=False)
    fuel_surcharge_percentage = Column(Float, default=0.0)
    max_weight_limit = Column(Float, default=0.0)
    weight_overcharge_rate = Column(Float, default=0.0)
    free_detention_hours = Column(Float, default=0.0)
    detention_rate = Column(Float, default=0.0)
    effective_date = Column(Date, nullable=False)
    expiry_date = Column(Date, nullable=False)
    verification_status = Column(String(20), default="PENDING") # PENDING, VERIFIED, REJECTED
    document_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="contracts")
    shipments = relationship("Shipment", back_populates="contract", cascade="all, delete-orphan")

class Vehicle(Base):
    __tablename__ = "vehicles"

    vehicle_id = Column(String(50), primary_key=True, index=True)
    vehicle_class = Column(String(100), nullable=False)
    license_plate = Column(String(50), nullable=False)
    expected_mileage_km_l = Column(Float, nullable=False) # Fuel Baseline Efficiency (km/L)
    fuel_type = Column(String(20), default="Diesel")
    
    # Baseline Configuration Fields
    expected_fuel_price_per_l = Column(Float, default=90.0)
    expected_fuel_consumption_min_l = Column(Float, nullable=True)
    expected_fuel_consumption_max_l = Column(Float, nullable=True)
    expected_maint_cost_min = Column(Float, default=6000.0)
    expected_maint_cost_max = Column(Float, default=8000.0)
    expected_maint_interval_km = Column(Float, default=10000.0)
    expected_maint_interval_days = Column(Integer, default=90)
    
    # Fleet Map / Location Telematics Fields
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    location_name = Column(String(255), nullable=True)
    current_driver_name = Column(String(255), nullable=True)
    current_route = Column(String(255), nullable=True)
    speed_kmh = Column(Float, default=0.0)
    status = Column(String(50), default="Idle") # "Moving", "Idle", "Maintenance", "Offline"
    fuel_level_pct = Column(Float, default=100.0)
    last_update = Column(DateTime, default=datetime.utcnow)

    created_at = Column(DateTime, default=datetime.utcnow)

    shipments = relationship("Shipment", back_populates="vehicle")
    maintenance_logs = relationship("MaintenanceLog", back_populates="vehicle")
    fuel_logs = relationship("FuelLog", back_populates="vehicle")
    assigned_drivers = relationship("User", back_populates="assigned_vehicle")
    toll_records = relationship("TollRecord", back_populates="vehicle")

class TollRecord(Base):
    __tablename__ = "toll_records"

    id = Column(Integer, primary_key=True, autoincrement=True)
    toll_id = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_id = Column(String(50), ForeignKey("vehicles.vehicle_id"), nullable=False)
    shipment_id = Column(String(50), ForeignKey("shipments.shipment_id"), nullable=True)
    route = Column(String(255), nullable=False)
    toll_gate = Column(String(255), nullable=False)
    date = Column(Date, nullable=False)
    expected_amount = Column(Float, nullable=False)
    actual_amount = Column(Float, nullable=False)
    variance = Column(Float, default=0.0) # actual_amount - expected_amount
    status = Column(String(30), default="Pending") # "Verified", "Pending", "Flagged", "Review"
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="toll_records")
    shipment = relationship("Shipment")

class MaintenanceBenchmark(Base):
    __tablename__ = "maintenance_benchmarks"

    benchmark_id = Column(Integer, primary_key=True, autoincrement=True)
    repair_type = Column(String(150), nullable=False)
    vehicle_class = Column(String(100), nullable=False)
    benchmark_cost = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Shipment(Base):
    __tablename__ = "shipments"

    shipment_id = Column(String(50), primary_key=True, index=True)
    contract_id = Column(String(50), ForeignKey("contracts.contract_id"), nullable=False)
    vehicle_id = Column(String(50), ForeignKey("vehicles.vehicle_id"), nullable=False)
    origin = Column(String(255), nullable=False)
    destination = Column(String(255), nullable=False)
    distance_km = Column(Float, nullable=False)
    cargo_weight_kg = Column(Float, nullable=False)
    arrival_time = Column(DateTime, nullable=True)
    service_start_time = Column(DateTime, nullable=True)
    departure_time = Column(DateTime, nullable=True)
    scheduled_delivery = Column(DateTime, nullable=True)
    actual_delivery = Column(DateTime, nullable=True)
    status = Column(String(30), default="Scheduled")
    created_at = Column(DateTime, default=datetime.utcnow)

    contract = relationship("Contract", back_populates="shipments")
    vehicle = relationship("Vehicle", back_populates="shipments")
    invoices = relationship("Invoice", back_populates="shipment", cascade="all, delete-orphan")
    fuel_logs = relationship("FuelLog", back_populates="shipment")

class Invoice(Base):
    __tablename__ = "invoices"

    invoice_id = Column(String(50), primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, nullable=False)
    shipment_id = Column(String(50), ForeignKey("shipments.shipment_id"), nullable=False)
    invoice_date = Column(Date, nullable=False)
    billed_freight_amount = Column(Float, default=0.0)
    billed_fuel_surcharge = Column(Float, default=0.0)
    billed_weight_charge = Column(Float, default=0.0)
    billed_detention_charge = Column(Float, default=0.0)
    total_billed_amount = Column(Float, default=0.0)
    document_url = Column(String(500), nullable=True)
    verification_status = Column(String(20), default="PENDING")
    created_at = Column(DateTime, default=datetime.utcnow)

    shipment = relationship("Shipment", back_populates="invoices")

class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    repair_id = Column(String(50), primary_key=True, index=True)
    vehicle_id = Column(String(50), ForeignKey("vehicles.vehicle_id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    service_center = Column(String(255), nullable=False)
    service_date = Column(Date, nullable=False)
    repair_type = Column(String(150), nullable=False)
    problem_description = Column(Text, nullable=True)
    parts_cost = Column(Float, default=0.0)
    labor_cost = Column(Float, default=0.0)
    benchmark_cost = Column(Float, default=0.0)
    total_repair_cost = Column(Float, default=0.0)
    odometer_reading = Column(Float, nullable=True)
    invoice_number = Column(String(100), nullable=True)
    receipt_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="maintenance_logs")
    driver = relationship("User", back_populates="maintenance_logs")

class FuelLog(Base):
    __tablename__ = "fuel_logs"

    fuel_log_id = Column(String(50), primary_key=True, index=True)
    vehicle_id = Column(String(50), ForeignKey("vehicles.vehicle_id"), nullable=False)
    driver_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    shipment_id = Column(String(50), ForeignKey("shipments.shipment_id"), nullable=True)
    fuel_date = Column(Date, nullable=False)
    liters_filled = Column(Float, nullable=False)
    price_per_liter = Column(Float, nullable=False)
    total_cost = Column(Float, nullable=False)
    fuel_station = Column(String(255), nullable=True)
    odometer_reading = Column(Float, nullable=True)
    opening_fuel = Column(Float, nullable=True)
    closing_fuel = Column(Float, nullable=True)
    gps_latitude = Column(Float, nullable=True)
    gps_longitude = Column(Float, nullable=True)
    receipt_url = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    vehicle = relationship("Vehicle", back_populates="fuel_logs")
    shipment = relationship("Shipment", back_populates="fuel_logs")
    driver = relationship("User", back_populates="fuel_logs")

class AuditResult(Base):
    __tablename__ = "audit_results"

    audit_id = Column(String(50), primary_key=True, index=True)
    audit_type = Column(String(30), nullable=False) # BILLING, MAINTENANCE, FUEL
    reference_id = Column(String(50), nullable=False)
    expected_value = Column(Float, default=0.0)
    actual_value = Column(Float, default=0.0)
    variance = Column(Float, default=0.0)
    potential_financial_impact = Column(Float, default=0.0)
    explanation = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    alerts = relationship("LeakageAlert", back_populates="audit_result", cascade="all, delete-orphan")

class LeakageAlert(Base):
    __tablename__ = "leakage_alerts"

    alert_id = Column(String(50), primary_key=True, index=True)
    audit_id = Column(String(50), ForeignKey("audit_results.audit_id"), nullable=False)
    category = Column(String(50), nullable=False) # Revenue Leakage, Maintenance Overrun, Fuel Variance, Duplicate Record, Operational Inconsistency
    status = Column(String(30), default="DETECTED") # DETECTED, UNDER REVIEW, VERIFIED, ACTION INITIATED, RESOLVED, DISMISSED
    created_at = Column(DateTime, default=datetime.utcnow)

    audit_result = relationship("AuditResult", back_populates="alerts")
    action_cases = relationship("RecoveryActionCase", back_populates="alert", cascade="all, delete-orphan")

class RecoveryActionCase(Base):
    __tablename__ = "recovery_action_cases"

    case_id = Column(String(50), primary_key=True, index=True)
    alert_id = Column(String(50), ForeignKey("leakage_alerts.alert_id"), nullable=False)
    action_type = Column(String(100), nullable=False) # Customer Billing Recovery, Maintenance Review, Fuel Investigation, Record Correction, No Action Required
    verified_amount = Column(Float, default=0.0)
    recovered_or_corrected_amount = Column(Float, default=0.0)
    assigned_to = Column(String(255), default="Fleet Manager")
    review_notes = Column(Text, nullable=True)
    status = Column(String(30), default="OPEN") # OPEN, IN_PROGRESS, RESOLVED, CLOSED
    created_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    alert = relationship("LeakageAlert", back_populates="action_cases")
