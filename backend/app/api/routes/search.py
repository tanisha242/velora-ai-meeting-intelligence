from typing import Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.search_service import SearchService
from app.schemas.common import ResponseEnvelope

router = APIRouter(tags=["Search & AI QA"])

class AskAIRequest(BaseModel):
    question: str

@router.get("/search", response_model=ResponseEnvelope[Dict[str, Any]])
def global_search(
    q: str = Query(..., min_length=1, description="Query across meetings and transcript text"),
    db: Session = Depends(get_db)
):
    service = SearchService(db)
    results = service.global_search(q)
    return ResponseEnvelope(data=results, message="Global search executed successfully")

@router.post("/meetings/{meeting_id}/ask-ai", response_model=ResponseEnvelope[Dict[str, str]])
def ask_ai_question(
    meeting_id: str,
    payload: AskAIRequest,
    db: Session = Depends(get_db)
):
    service = SearchService(db)
    res = service.ask_ai_question(meeting_id, payload.question)
    return ResponseEnvelope(data=res, message="AI response generated successfully")
