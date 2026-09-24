from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.app.database.session import get_db
from backend.app.models.domain import Contract, Customer
from backend.app.schemas.schemas import ContractCreate, ContractResponse

router = APIRouter(prefix="/api/contracts", tags=["Contracts"])

@router.get("", response_model=List[ContractResponse])
def get_contracts(db: Session = Depends(get_db)):
    return db.query(Contract).all()

@router.get("/{contract_id}", response_model=ContractResponse)
def get_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    return contract

@router.post("", response_model=ContractResponse)
def create_contract(payload: ContractCreate, db: Session = Depends(get_db)):
    customer = db.query(Customer).filter(Customer.customer_id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=400, detail="Associated customer does not exist")

    existing = db.query(Contract).filter(Contract.contract_id == payload.contract_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Contract ID already exists")

    contract = Contract(**payload.dict())
    db.add(contract)
    db.commit()
    db.refresh(contract)
    return contract

@router.put("/{contract_id}/verify", response_model=ContractResponse)
def verify_contract(contract_id: str, status: str = "VERIFIED", db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")

    if status not in ["VERIFIED", "PENDING", "REJECTED"]:
        raise HTTPException(status_code=400, detail="Invalid verification status")

    contract.verification_status = status
    db.commit()
    db.refresh(contract)
    return contract

@router.delete("/{contract_id}")
def delete_contract(contract_id: str, db: Session = Depends(get_db)):
    contract = db.query(Contract).filter(Contract.contract_id == contract_id).first()
    if not contract:
        raise HTTPException(status_code=404, detail="Contract not found")
    db.delete(contract)
    db.commit()
    return {"message": "Contract deleted successfully"}
