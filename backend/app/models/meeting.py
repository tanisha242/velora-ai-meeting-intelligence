import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, Integer, DateTime
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.meeting_participant import meeting_participants

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    duration_seconds = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships with CASCADE ON DELETE
    participants = relationship("Participant", secondary=meeting_participants, back_populates="meetings")
    transcript = relationship("Transcript", uselist=False, back_populates="meeting", cascade="all, delete-orphan")
    transcript_segments = relationship("TranscriptSegment", back_populates="meeting", cascade="all, delete-orphan", order_by="TranscriptSegment.sequence")
    summary = relationship("Summary", uselist=False, back_populates="meeting", cascade="all, delete-orphan")
    topics = relationship("Topic", back_populates="meeting", cascade="all, delete-orphan", order_by="Topic.sequence")
    action_items = relationship("ActionItem", back_populates="meeting", cascade="all, delete-orphan")
