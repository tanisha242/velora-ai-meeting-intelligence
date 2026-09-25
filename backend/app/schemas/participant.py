from typing import Optional
from pydantic import BaseModel, ConfigDict

class ParticipantBase(BaseModel):
    name: str
    email: Optional[str] = None
    avatar_url: Optional[str] = None

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantResponse(ParticipantBase):
    id: str

    model_config = ConfigDict(from_attributes=True)
