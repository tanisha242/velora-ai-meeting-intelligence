from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class TranscriptSegmentBase(BaseModel):
    speaker_name: str
    speaker_id: Optional[str] = None
    start_time: float
    end_time: float
    text: str
    sequence: int

class TranscriptSegmentCreate(TranscriptSegmentBase):
    pass

class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: str
    transcript_id: str
    meeting_id: str

    model_config = ConfigDict(from_attributes=True)

class TranscriptResponse(BaseModel):
    id: str
    meeting_id: str
    raw_text: Optional[str] = None
    segments: List[TranscriptSegmentResponse] = []
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class TranscriptSearchMatch(BaseModel):
    segment_id: str
    speaker_name: str
    start_time: float
    end_time: float
    text: str
    sequence: int
    matched_query: str
