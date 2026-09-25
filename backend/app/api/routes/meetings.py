from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.meeting_service import MeetingService
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingSummaryListItem, MeetingDetailResponse
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/meetings", tags=["Meetings"])

@router.get("", response_model=ResponseEnvelope[List[MeetingSummaryListItem]])
def list_meetings(
    q: Optional[str] = Query(None, description="Search query matching title or description"),
    participant: Optional[str] = Query(None, description="Filter by participant name or email"),
    date_from: Optional[datetime] = Query(None, description="Filter meetings from date"),
    date_to: Optional[datetime] = Query(None, description="Filter meetings to date"),
    sort_by: str = Query("date_desc", description="Sort by date_desc, date_asc, title_asc"),
    db: Session = Depends(get_db)
):
    service = MeetingService(db)
    items = service.list_meetings(
        q=q,
        participant=participant,
        date_from=date_from,
        date_to=date_to,
        sort_by=sort_by
    )
    return ResponseEnvelope(data=items, message="Meetings retrieved successfully")

@router.post("", response_model=ResponseEnvelope[MeetingDetailResponse], status_code=status.HTTP_201_CREATED)
def create_meeting(
    payload: MeetingCreate,
    db: Session = Depends(get_db)
):
    service = MeetingService(db)
    meeting = service.create_meeting(payload)
    return ResponseEnvelope(data=meeting, message="Meeting created successfully")

@router.get("/{id}", response_model=ResponseEnvelope[MeetingDetailResponse])
def get_meeting(
    id: str,
    db: Session = Depends(get_db)
):
    service = MeetingService(db)
    meeting = service.get_meeting(id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return ResponseEnvelope(data=meeting, message="Meeting fetched successfully")

@router.put("/{id}", response_model=ResponseEnvelope[MeetingDetailResponse])
def update_meeting(
    id: str,
    payload: MeetingUpdate,
    db: Session = Depends(get_db)
):
    service = MeetingService(db)
    meeting = service.update_meeting(id, payload)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return ResponseEnvelope(data=meeting, message="Meeting updated successfully")

@router.delete("/{id}", response_model=ResponseEnvelope[dict])
def delete_meeting(
    id: str,
    db: Session = Depends(get_db)
):
    service = MeetingService(db)
    success = service.delete_meeting(id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return ResponseEnvelope(data={"id": id}, message="Meeting deleted successfully")
