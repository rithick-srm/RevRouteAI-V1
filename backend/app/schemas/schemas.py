from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    assigned_vehicle_id: Optional[str] = None
    phone_number: Optional[str] = None
    license_number: Optional[str] = None

    class Config:
        from_attributes = True

class CustomerCreate(BaseModel):
    customer_id: str
    customer_name: str
    contact: Optional[str] = None

class CustomerResponse(CustomerCreate):
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ContractCreate(BaseModel):
    contract_id: str
    customer_id: str
    pricing_method: str # PER_KM, PER_KG, FLAT
    base_rate: float
    fuel_surcharge_percentage: float = 0.0
    max_weight_limit: float = 0.0
    weight_overcharge_rate: float = 0.0
    free_detention_hours: float = 0.0
    detention_rate: float = 0.0
    effective_date: date
    expiry_date: date
    verification_status: str = "PENDING"
    document_url: Optional[str] = None

class ContractResponse(ContractCreate):
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class VehicleCreate(BaseModel):
    vehicle_id: str
    vehicle_class: str
    license_plate: str
    expected_mileage_km_l: float
    fuel_type: str = "Diesel"
    expected_fuel_price_per_l: Optional[float] = 90.0
    expected_fuel_consumption_min_l: Optional[float] = None
    expected_fuel_consumption_max_l: Optional[float] = None
    expected_maint_cost_min: Optional[float] = 6000.0
    expected_maint_cost_max: Optional[float] = 8000.0
    expected_maint_interval_km: Optional[float] = 10000.0
    expected_maint_interval_days: Optional[int] = 90
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    location_name: Optional[str] = None
    current_driver_name: Optional[str] = None
    current_route: Optional[str] = None
    speed_kmh: Optional[float] = 0.0
    status: Optional[str] = "Idle"
    fuel_level_pct: Optional[float] = 100.0

class VehicleBaselineUpdate(BaseModel):
    expected_mileage_km_l: Optional[float] = None
    expected_fuel_price_per_l: Optional[float] = None
    expected_fuel_consumption_min_l: Optional[float] = None
    expected_fuel_consumption_max_l: Optional[float] = None
    expected_maint_cost_min: Optional[float] = None
    expected_maint_cost_max: Optional[float] = None
    expected_maint_interval_km: Optional[float] = None
    expected_maint_interval_days: Optional[int] = None

class VehicleResponse(VehicleCreate):
    last_update: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MaintenanceBenchmarkCreate(BaseModel):
    repair_type: str
    vehicle_class: str
    benchmark_cost: float

class MaintenanceBenchmarkResponse(MaintenanceBenchmarkCreate):
    benchmark_id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ShipmentCreate(BaseModel):
    shipment_id: str
    contract_id: str
    vehicle_id: str
    origin: str
    destination: str
    distance_km: float
    cargo_weight_kg: float
    arrival_time: Optional[datetime] = None
    service_start_time: Optional[datetime] = None
    departure_time: Optional[datetime] = None
    scheduled_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    status: str = "Scheduled"

class ShipmentResponse(ShipmentCreate):
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    invoice_id: str
    invoice_number: str
    shipment_id: str
    invoice_date: date
    billed_freight_amount: float = 0.0
    billed_fuel_surcharge: float = 0.0
    billed_weight_charge: float = 0.0
    billed_detention_charge: float = 0.0
    total_billed_amount: float = 0.0
    document_url: Optional[str] = None
    verification_status: str = "PENDING"

class InvoiceResponse(InvoiceCreate):
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class MaintenanceLogCreate(BaseModel):
    repair_id: Optional[str] = None
    vehicle_id: str
    driver_id: Optional[int] = None
    service_center: str
    service_date: date
    repair_type: str
    problem_description: Optional[str] = None
    parts_cost: float = 0.0
    labor_cost: float = 0.0
    benchmark_cost: Optional[float] = 0.0
    total_repair_cost: float = 0.0
    odometer_reading: Optional[float] = None
    invoice_number: Optional[str] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None

class MaintenanceLogResponse(BaseModel):
    repair_id: str
    vehicle_id: str
    driver_id: Optional[int] = None
    service_center: str
    service_date: date
    repair_type: str
    problem_description: Optional[str] = None
    parts_cost: float = 0.0
    labor_cost: float = 0.0
    benchmark_cost: float = 0.0
    total_repair_cost: float = 0.0
    odometer_reading: Optional[float] = None
    invoice_number: Optional[str] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class FuelLogCreate(BaseModel):
    fuel_log_id: Optional[str] = None
    vehicle_id: str
    driver_id: Optional[int] = None
    shipment_id: Optional[str] = None
    fuel_date: date
    liters_filled: float
    price_per_liter: float
    total_cost: float
    fuel_station: Optional[str] = None
    odometer_reading: Optional[float] = None
    opening_fuel: Optional[float] = None
    closing_fuel: Optional[float] = None
    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None

class FuelLogResponse(BaseModel):
    fuel_log_id: str
    vehicle_id: str
    driver_id: Optional[int] = None
    shipment_id: Optional[str] = None
    fuel_date: date
    liters_filled: float
    price_per_liter: float
    total_cost: float
    fuel_station: Optional[str] = None
    odometer_reading: Optional[float] = None
    opening_fuel: Optional[float] = None
    closing_fuel: Optional[float] = None
    gps_latitude: Optional[float] = None
    gps_longitude: Optional[float] = None
    receipt_url: Optional[str] = None
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuditResultResponse(BaseModel):
    audit_id: str
    audit_type: str
    reference_id: str
    expected_value: float
    actual_value: float
    variance: float
    potential_financial_impact: float
    explanation: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    alert_id: str
    audit_id: str
    category: str
    status: str
    created_at: Optional[datetime] = None
    audit_result: Optional[AuditResultResponse] = None

    class Config:
        from_attributes = True

class AlertStatusUpdate(BaseModel):
    status: str

class ActionCaseCreate(BaseModel):
    alert_id: str
    action_type: str
    assigned_to: Optional[str] = "Fleet Manager"
    review_notes: Optional[str] = None

class ActionCaseUpdate(BaseModel):
    verified_amount: Optional[float] = 0.0
    recovered_or_corrected_amount: Optional[float] = 0.0
    assigned_to: Optional[str] = None
    review_notes: Optional[str] = None
    status: Optional[str] = None

class ActionCaseResponse(BaseModel):
    case_id: str
    alert_id: str
    action_type: str
    verified_amount: float
    recovered_or_corrected_amount: float
    assigned_to: str
    review_notes: Optional[str] = None
    status: str
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TollRecordCreate(BaseModel):
    toll_id: Optional[str] = None
    vehicle_id: str
    shipment_id: Optional[str] = None
    route: str
    toll_gate: str
    date: date
    expected_amount: float
    actual_amount: float
    notes: Optional[str] = None

class TollStatusUpdate(BaseModel):
    status: str

class TollRecordResponse(BaseModel):
    id: int
    toll_id: str
    vehicle_id: str
    shipment_id: Optional[str] = None
    route: str
    toll_gate: str
    date: date
    expected_amount: float
    actual_amount: float
    variance: float
    status: str
    notes: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

