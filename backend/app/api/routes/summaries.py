from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.meeting_service import MeetingService
from app.services.transcript_service import TranscriptService
from app.services.summary_service import SummaryService
from app.models.summary import Summary
from app.models.topic import Topic
from app.schemas.summary import SummaryResponse
from app.schemas.topic import TopicResponse
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/meetings/{meeting_id}", tags=["Summaries & Topics"])

@router.get("/summary", response_model=ResponseEnvelope[SummaryResponse])
def get_meeting_summary(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting = MeetingService(db).get_meeting(meeting_id)
    if not meeting or not meeting.summary:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Summary not found for meeting")
    return ResponseEnvelope(data=meeting.summary, message="Summary retrieved successfully")

@router.post("/summary/generate", response_model=ResponseEnvelope[SummaryResponse])
def generate_meeting_summary(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting_service = MeetingService(db)
    meeting = meeting_service.get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")

    transcript_service = TranscriptService(db)
    segments = transcript_service.get_segments(meeting_id)
    segments_data = [
        {"speaker_name": s.speaker_name, "start_time": s.start_time, "end_time": s.end_time, "text": s.text}
        for s in segments
    ]

    summary_service = SummaryService()
    sum_data = summary_service.generate_summary(meeting.title, segments_data)

    if meeting.summary:
        meeting.summary.overview = sum_data["overview"]
        meeting.summary.key_takeaways = sum_data["key_takeaways"]
        meeting.summary.decisions = sum_data["decisions"]
    else:
        new_summary = Summary(
            meeting_id=meeting_id,
            overview=sum_data["overview"],
            key_takeaways=sum_data["key_takeaways"],
            decisions=sum_data["decisions"]
        )
        db.add(new_summary)

    db.commit()
    db.refresh(meeting.summary)
    return ResponseEnvelope(data=meeting.summary, message="Summary generated successfully")

@router.get("/topics", response_model=ResponseEnvelope[List[TopicResponse]])
def get_meeting_topics(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    meeting = MeetingService(db).get_meeting(meeting_id)
    if not meeting:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meeting not found")
    return ResponseEnvelope(data=meeting.topics, message="Topics retrieved successfully")
