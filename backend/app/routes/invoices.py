from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.domain import Invoice, Shipment
from backend.app.schemas.schemas import InvoiceCreate, InvoiceResponse

router = APIRouter(prefix="/api/invoices", tags=["Invoices"])

@router.get("", response_model=List[InvoiceResponse])
def get_invoices(db: Session = Depends(get_db)):
    return db.query(Invoice).all()

@router.get("/{invoice_id}", response_model=InvoiceResponse)
def get_invoice(invoice_id: str, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return invoice

@router.post("", response_model=InvoiceResponse)
def create_invoice(payload: InvoiceCreate, db: Session = Depends(get_db)):
    shipment = db.query(Shipment).filter(Shipment.shipment_id == payload.shipment_id).first()
    if not shipment:
        raise HTTPException(status_code=400, detail="Shipment not found")

    # Validation: One invoice per shipment rule for MVP
    existing_shp_inv = db.query(Invoice).filter(Invoice.shipment_id == payload.shipment_id).first()
    if existing_shp_inv:
        raise HTTPException(status_code=400, detail=f"Shipment '{payload.shipment_id}' is already associated with invoice '{existing_shp_inv.invoice_number}'")

    existing_no = db.query(Invoice).filter(Invoice.invoice_number == payload.invoice_number).first()
    if existing_no:
        raise HTTPException(status_code=400, detail="Invoice number already exists")

    if payload.total_billed_amount < 0:
        raise HTTPException(status_code=400, detail="Total billed amount cannot be negative")

    invoice = Invoice(**payload.dict())
    db.add(invoice)
    db.commit()
    db.refresh(invoice)
    return invoice

@router.put("/{invoice_id}/verify", response_model=InvoiceResponse)
def verify_invoice(invoice_id: str, status: str = "VERIFIED", db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")

    invoice.verification_status = status
    db.commit()
    db.refresh(invoice)
    return invoice

@router.delete("/{invoice_id}")
def delete_invoice(invoice_id: str, db: Session = Depends(get_db)):
    invoice = db.query(Invoice).filter(Invoice.invoice_id == invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found")
    db.delete(invoice)
    db.commit()
    return {"message": "Invoice deleted successfully"}
