import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="transcript")
    segments = relationship("TranscriptSegment", back_populates="transcript", cascade="all, delete-orphan", order_by="TranscriptSegment.sequence")
