from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from backend.app.database.session import get_db
from backend.app.services.assistant_service import process_assistant_question

router = APIRouter(prefix="/api/ai", tags=["AI Fleet Assistant"])

class AskQuestionRequest(BaseModel):
    question: str

class AskQuestionResponse(BaseModel):
    question: str
    data_found: bool
    intent: Optional[str] = "general"
    vehicle_id: Optional[str] = None
    title: str
    formatted_answer: str
    structured_data: Dict[str, Any] = {}
    suggested_questions: List[str] = []

@router.post("/ask", response_model=AskQuestionResponse)
def ask_fleet_assistant(payload: AskQuestionRequest, db: Session = Depends(get_db)):
    if not payload.question or not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    result = process_assistant_question(payload.question, db)
    return result
