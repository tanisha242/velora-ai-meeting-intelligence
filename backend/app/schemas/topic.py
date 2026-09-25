from typing import Optional
from pydantic import BaseModel, ConfigDict

class TopicBase(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: float = 0.0
    end_time: float = 0.0
    sequence: int = 0

class TopicCreate(TopicBase):
    pass

class TopicResponse(TopicBase):
    id: str
    meeting_id: str

    model_config = ConfigDict(from_attributes=True)
