import uuid
from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.db.database import Base
from app.models.meeting_participant import meeting_participants

class Participant(Base):
    __tablename__ = "participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(100), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=True)
    avatar_url = Column(String(500), nullable=True)

    meetings = relationship("Meeting", secondary=meeting_participants, back_populates="participants")
