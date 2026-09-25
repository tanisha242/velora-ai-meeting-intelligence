from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.participant import ParticipantResponse
from app.schemas.summary import SummaryResponse
from app.schemas.topic import TopicResponse
from app.schemas.action_item import ActionItemResponse
from app.schemas.transcript import TranscriptSegmentResponse

class MeetingBase(BaseModel):
    title: str
    description: Optional[str] = None
    date: Optional[datetime] = None

class MeetingCreate(MeetingBase):
    participants: List[str] = []  # List of participant names or emails
    transcript_text: Optional[str] = None
    transcript_format: str = "txt"

class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    date: Optional[datetime] = None
    participants: Optional[List[str]] = None

class MeetingSummaryListItem(MeetingBase):
    id: str
    date: datetime
    duration_seconds: int
    participants: List[ParticipantResponse] = []
    action_items_count: int = 0
    summary_preview: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class MeetingDetailResponse(MeetingBase):
    id: str
    date: datetime
    duration_seconds: int
    participants: List[ParticipantResponse] = []
    summary: Optional[SummaryResponse] = None
    topics: List[TopicResponse] = []
    action_items: List[ActionItemResponse] = []
    transcript_segments: List[TranscriptSegmentResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
