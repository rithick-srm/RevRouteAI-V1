import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from backend.app.database.session import Base, engine
from backend.app.routes import (
    auth, dashboard, customers, contracts, shipments, invoices,
    vehicles, maintenance, fuel, audits, alerts, action_cases, documents,
    driver_portal, assistant, tolls
)

# Create database tables if they do not exist
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="RevRoute AI — Logistics Financial & Operational Leakage Audit Platform",
    description="Detect. Analyze. Recover. AI-Assisted Logistics Auditing Platform prototype with Manager and Driver Portals.",
    version="1.3.0"
)

# CORS Middleware Setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static File Upload Directory
uploads_path = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(uploads_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_path), name="uploads")

# Include API Routers
app.include_router(auth.router)
app.include_router(dashboard.router)
app.include_router(customers.router)
app.include_router(contracts.router)
app.include_router(shipments.router)
app.include_router(invoices.router)
app.include_router(vehicles.router)
app.include_router(maintenance.router)
app.include_router(fuel.router)
app.include_router(tolls.router)
app.include_router(audits.router)
app.include_router(alerts.router)
app.include_router(action_cases.router)
app.include_router(documents.router)
app.include_router(driver_portal.router)
app.include_router(assistant.router)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "app": "RevRoute AI",
        "motto": "Detect. Analyze. Recover.",
        "version": "1.1.0"
    }
