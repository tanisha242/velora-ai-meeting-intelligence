import uuid
import json
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, TypeDecorator
from sqlalchemy.orm import relationship
from app.db.database import Base

class JSONEncodedList(TypeDecorator):
    """Encodes list/dict to JSON string for SQLite portability."""
    impl = Text

    def process_bind_param(self, value, dialect):
        if value is not None:
            return json.dumps(value)
        return "[]"

    def process_result_value(self, value, dialect):
        if value is not None:
            try:
                return json.loads(value)
            except Exception:
                return []
        return []

class Summary(Base):
    __tablename__ = "summaries"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    overview = Column(Text, nullable=False)
    key_takeaways = Column(JSONEncodedList, nullable=False, default=list)
    decisions = Column(JSONEncodedList, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    meeting = relationship("Meeting", back_populates="summary")
