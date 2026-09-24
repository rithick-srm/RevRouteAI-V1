# RevRoute AI — AI-Assisted Logistics Financial & Operational Leakage Audit Platform

> **Motto:** *Detect. Analyze. Recover.*  
> **Project Scope:** College-level CSE AIML Project Prototype

---

## 1. Problem Statement

In modern logistics and transport operations, freight service providers face substantial invisible margin erosion due to:
1. **Unbilled Customer Revenue (Revenue Leakage)**: Contractual freight base rates, fuel surcharges, weight overcharges, and warehouse detention fees being omitted or underbilled on invoices.
2. **Operational Maintenance Cost Overruns**: Vehicle repair costs exceeding configured market benchmarks, duplicate billing records, and repeated repair activities.
3. **Fuel Consumption & Cost Variances**: Fuel consumption deviating significantly from vehicle baseline fuel efficiency standards.

---

## 2. Objective

RevRoute AI bridges operational data and financial billing by providing an end-to-end, human-verified audit platform. Using **AI-assisted document understanding** (OCR & PDF text extraction) to convert contracts, invoices, and receipts into structured parameters, the platform applies **deterministic rule engines** to calculate expected values, detect financial variances, generate alerts, and track recovery actions.

---

## 3. Core Architectural Principle

```text
AI EXTRACTS → RULES CALCULATE → HUMAN VERIFIES → ACTION TRACKS
```

- **Role of AI**: Extract structured parameters from PDF/image documents (Contracts, Invoices, Receipts) with mandatory human review fallback.
- **Role of Rule Engine**: Execute 100% deterministic financial calculations and variance detection algorithms.
- **Role of Human Manager**: Inspect audit findings, verify/dismiss alerts, and authorize recovery/corrective cases.
- **Role of Case System**: Track verified financial recovery amounts and resolution status.

---

## 4. Key Features & Audit Modules

### Module 1 — Billing Revenue Leakage
- **Contract Compliance**: Validates invoice total against contractual pricing models (`PER_KM`, `PER_KG`, `FLAT`).
- **Fuel Surcharge Audit**: Verifies contracted fuel surcharge percentages applied to base freight.
- **Weight Overcharge Audit**: Calculates excess weight over contract limits and checks billing.
- **Detention Time Audit**: Calculates billable warehouse waiting time:  
  $$\text{Billable Detention Hours} = \max(\text{Service Start} - \text{Arrival} - \text{Free Detention Hours}, 0)$$  
  $$\text{Expected Detention Charge} = \text{Billable Hours} \times \text{Detention Rate}$$

### Module 2 — Maintenance Cost Overrun
- **Benchmark Comparison**: Flags repair costs exceeding configurable reference benchmarks:  
  $$\text{Potential Overrun} = \max(\text{Actual Repair Cost} - \text{Benchmark Cost}, 0)$$
- **Duplicate Record Detection**: Flags matching vehicle ID, service date, service center, repair type, and invoice number.
- **Repeated Repair Flagging**: Identifies vehicles undergoing identical repairs within a 30-day window.

### Module 3 — Fuel Consumption & Cost Variance
- **Expected Fuel Consumption**:  
  $$\text{Expected Fuel (L)} = \frac{\text{Trip Distance (KM)}}{\text{Vehicle Baseline Mileage (KM/L)}}$$
- **Estimated Actual Consumption**:  
  $$\text{Estimated Consumption} = \text{Opening Fuel} + \text{Liters Filled} - \text{Closing Fuel}$$
- **Potential Fuel Cost Variance**:  
  $$\text{Potential Cost Variance} = \max(\text{Actual Fuel Cost} - (\text{Expected Fuel} \times \text{Reference Fuel Price}), 0)$$

---

## 5. Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Chart.js (`react-chartjs-2`), Lucide Icons.
- **Backend**: Python 3.14, FastAPI, SQLAlchemy ORM, PyPDF2, Pillow, Regex Parser, Tesseract OCR.
- **Database**: MySQL 8.0 / SQLite (dual compatibility).

---

## 6. Database Structure

The system uses 12 normalized database tables:
1. `users`: Fleet manager authentication.
2. `customers`: Logistics client directory.
3. `contracts`: Pricing terms, base rates, fuel surcharge %, weight limits, detention rates.
4. `vehicles`: Fleet registry with vehicle class and baseline mileage (KM/L).
5. `maintenance_benchmarks`: Reference costs per repair type and vehicle class.
6. `shipments`: Route origin/destination, distance, weight, arrival/service start/departure timestamps.
7. `invoices`: Billed freight, fuel surcharge, weight, detention, and total amounts.
8. `maintenance_logs`: Service center repair records, parts/labor costs, total costs.
9. `fuel_logs`: Liters filled, price per liter, odometer, opening/closing tank levels, GPS coordinates.
10. `audit_results`: Expected value, actual value, variance, potential financial impact, explanation.
11. `leakage_alerts`: Alert category, status (`DETECTED`, `UNDER REVIEW`, `VERIFIED`, `ACTION INITIATED`, `RESOLVED`, `DISMISSED`).
12. `recovery_action_cases`: Action type, verified amount, recovered amount, manager notes, status.

---

## 7. Installation & Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js v18+

### Step 1 — Clone Repository
```bash
git clone <repository_url>
cd "revroute-ai"
```

### Step 2 — Backend Setup
```bash
cd backend
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1

# Install requirements
pip install -r requirements.txt

# Seed Database with realistic demo data
$env:PYTHONPATH=".."
python seed_data.py

# Run FastAPI Server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### Step 3 — Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open browser at: `http://localhost:3000` (or `http://localhost:5173`)

---

## 8. Demo Credentials & Pre-loaded Scenarios

### Demo Login
- **Email**: `manager@revroute.ai`
- **Role**: `Fleet Manager`

### Pre-loaded Scenarios
1. **Billing Revenue Leakage Demo**:
   - Shipment: `SHP-1001` (1000 km @ ₹25/km = ₹25,000 + ₹2,500 fuel surcharge = ₹27,500 expected freight).
   - Invoice `INV-88901`: Billed ₹27,000.
   - Audit Result: **Potential Revenue Leakage = ₹3,000**.
2. **Detention Leakage Demo**:
   - Shipment `SHP-1002`: Waiting time 3 hrs (1 hr free = 2 billable hrs @ ₹1,500/hr = ₹3,000 expected detention).
   - Invoice `INV-88902`: Billed ₹0 detention.
   - Audit Result: **Potential Revenue Leakage = ₹3,000**.
3. **Maintenance Overrun Demo**:
   - Repair `REP-3001`: Brake Pad Replacement actual cost ₹10,000 vs benchmark ₹6,500.
   - Audit Result: **Potential Maintenance Cost Overrun = ₹3,500**.
4. **Fuel Variance Demo**:
   - Fuel Log `FL-5001`: 400 km @ 8 km/L baseline -> Expected 50 L vs Estimated Actual 70 L.
   - Audit Result: **Fuel Consumption Variance = 20 L (Potential Cost Variance = ₹1,800)**.

---

## 9. Testing

Run backend unit tests for audit calculations:
```bash
$env:PYTHONPATH="."
python -m unittest discover -s tests -p "test_*.py"
```

---

## 10. MVP Limitations

1. Contract calculations use standard billing models (`PER_KM`, `PER_KG`, `FLAT`).
2. One invoice per shipment in MVP structure.
3. OCR extraction populates suggested fields requiring manager verification.
4. Maintenance benchmarks are configurable reference values.
5. Discrepancy alerts indicate potential financial variance, not proof of fraud.

---

## 11. Future Scope

- **Advanced Document AI**: Multipage OCR & LLM-generated audit summaries.
- **IoT & Telematics**: OBD-II CAN bus telemetry, live GPS route tracking.
- **Predictive Maintenance**: Machine learning models forecasting component failure risk.
- **ERP Integration**: Direct API sync with SAP and enterprise logistics software.
