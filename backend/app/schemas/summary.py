from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class SummaryBase(BaseModel):
    overview: str
    key_takeaways: List[str] = []
    decisions: List[str] = []

class SummaryCreate(SummaryBase):
    pass

class SummaryUpdate(BaseModel):
    overview: Optional[str] = None
    key_takeaways: Optional[List[str]] = None
    decisions: Optional[List[str]] = None

class SummaryResponse(SummaryBase):
    id: str
    meeting_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
