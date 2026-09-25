import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    assignee = Column(String(100), nullable=True)
    due_date = Column(String(50), nullable=True)
    status = Column(String(20), nullable=False, default="pending", index=True)  # pending, in_progress, completed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="action_items")
