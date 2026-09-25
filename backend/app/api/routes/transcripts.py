from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.services.transcript_service import TranscriptService
from app.schemas.transcript import TranscriptResponse, TranscriptSegmentResponse, TranscriptSearchMatch
from app.schemas.common import ResponseEnvelope

router = APIRouter(prefix="/meetings/{meeting_id}/transcript", tags=["Transcripts"])

@router.get("", response_model=ResponseEnvelope[List[TranscriptSegmentResponse]])
def get_transcript_segments(
    meeting_id: str,
    db: Session = Depends(get_db)
):
    service = TranscriptService(db)
    segments = service.get_segments(meeting_id)
    return ResponseEnvelope(data=segments, message="Transcript segments retrieved successfully")

@router.post("/upload", response_model=ResponseEnvelope[dict])
async def upload_transcript(
    meeting_id: str,
    file: UploadFile = File(...),
    format_type: str = Form("txt"),
    db: Session = Depends(get_db)
):
    content_bytes = await file.read()
    try:
        text_content = content_bytes.decode("utf-8")
    except UnicodeDecodeError:
        text_content = content_bytes.decode("latin-1")

    service = TranscriptService(db)
    transcript = service.parse_and_save_transcript(meeting_id, text_content, format_type)
    return ResponseEnvelope(data={"id": transcript.id, "meeting_id": meeting_id}, message="Transcript uploaded and parsed successfully")

@router.get("/search", response_model=ResponseEnvelope[List[TranscriptSearchMatch]])
def search_transcript(
    meeting_id: str,
    q: str = Query(..., min_length=1, description="Keyword query to search within transcript"),
    db: Session = Depends(get_db)
):
    service = TranscriptService(db)
    matches = service.search_transcript(meeting_id, q)
    return ResponseEnvelope(data=matches, message=f"Found {len(matches)} matching segment(s)")
