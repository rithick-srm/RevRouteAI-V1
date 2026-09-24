from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database.session import get_db
from backend.app.models.domain import User
from backend.app.schemas.schemas import UserLogin, UserResponse

router = APIRouter(prefix="/api/auth", tags=["Auth"])

@router.post("/login", response_model=UserResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        # Default fallbacks for demo logins if database has not been seeded yet
        if payload.email == "manager@revroute.ai":
            return UserResponse(
                id=1,
                name="Fleet Manager",
                email="manager@revroute.ai",
                role="Fleet Manager"
            )
        elif payload.email == "driver1@revroute.ai":
            return UserResponse(
                id=2,
                name="Ramesh Kumar",
                email="driver1@revroute.ai",
                role="Driver",
                assigned_vehicle_id="TRK-101",
                phone_number="+91 98765 11111",
                license_number="DL-TN01-20210001"
            )
        elif payload.email == "driver2@revroute.ai":
            return UserResponse(
                id=3,
                name="Suresh Patel",
                email="driver2@revroute.ai",
                role="Driver",
                assigned_vehicle_id="TRK-102",
                phone_number="+91 98765 22222",
                license_number="DL-TN02-20210002"
            )
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return user
