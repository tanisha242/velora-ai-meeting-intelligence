from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ActionItemBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    status: str = "pending"  # pending, in_progress, completed

class ActionItemCreate(ActionItemBase):
    pass

class ActionItemUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None

class ActionItemStatusPatch(BaseModel):
    status: str

class ActionItemResponse(ActionItemBase):
    id: str
    meeting_id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
