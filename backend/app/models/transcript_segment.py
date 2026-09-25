import uuid
from sqlalchemy import Column, String, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class TranscriptSegment(Base):
    __tablename__ = "transcript_segments"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    transcript_id = Column(String(36), ForeignKey("transcripts.id", ondelete="CASCADE"), nullable=False, index=True)
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    speaker_name = Column(String(100), nullable=False)
    speaker_id = Column(String(36), ForeignKey("participants.id", ondelete="SET NULL"), nullable=True)
    start_time = Column(Float, nullable=False, default=0.0)
    end_time = Column(Float, nullable=False, default=0.0)
    text = Column(Text, nullable=False)
    sequence = Column(Integer, nullable=False, default=0)

    transcript = relationship("Transcript", back_populates="segments")
    meeting = relationship("Meeting", back_populates="transcript_segments")
    speaker = relationship("Participant")
