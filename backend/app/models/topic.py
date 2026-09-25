import uuid
from sqlalchemy import Column, String, Text, Float, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.database import Base

class Topic(Base):
    __tablename__ = "topics"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(Float, nullable=False, default=0.0)
    end_time = Column(Float, nullable=False, default=0.0)
    sequence = Column(Integer, nullable=False, default=0)

    meeting = relationship("Meeting", back_populates="topics")
