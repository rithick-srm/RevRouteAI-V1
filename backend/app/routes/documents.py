import os
import shutil
import uuid
from fastapi import APIRouter, File, UploadFile, HTTPException, Form
from typing import Dict, Any
from backend.app.services.document_processor import process_document

router = APIRouter(prefix="/api/documents", tags=["Document Processing"])

UPLOAD_DIR = os.getenv("UPLOAD_DIR", "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "contracts"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "invoices"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "maintenance"), exist_ok=True)
os.makedirs(os.path.join(UPLOAD_DIR, "fuel"), exist_ok=True)

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form("general") # contract, invoice, maintenance, fuel
):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")

    ext = os.path.splitext(file.filename)[1].lower()
    allowed_exts = [".pdf", ".jpg", ".jpeg", ".png"]
    if ext not in allowed_exts:
        raise HTTPException(status_code=400, detail=f"Unsupported file format '{ext}'. Allowed: PDF, JPG, JPEG, PNG.")

    subfolder = doc_type if doc_type in ["contracts", "invoices", "maintenance", "fuel"] else ""
    target_dir = os.path.join(UPLOAD_DIR, subfolder)
    os.makedirs(target_dir, exist_ok=True)

    filename = f"{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(target_dir, filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Process document with OCR / Text extractor
    extraction_result = process_document(file_path, doc_type=doc_type)

    return {
        "filename": filename,
        "document_url": file_path.replace("\\", "/"),
        "doc_type": doc_type,
        "extraction": extraction_result
    }

@router.post("/process-ocr")
def process_existing_ocr(document_url: str, doc_type: str = "general"):
    if not os.path.exists(document_url):
        raise HTTPException(status_code=404, detail="File path not found on server")

    extraction_result = process_document(document_url, doc_type=doc_type)
    return extraction_result
