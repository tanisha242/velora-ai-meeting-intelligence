from sqlalchemy import Table, Column, String, ForeignKey
from app.db.database import Base

meeting_participants = Table(
    "meeting_participants",
    Base.metadata,
    Column("meeting_id", String(36), ForeignKey("meetings.id", ondelete="CASCADE"), primary_key=True),
    Column("participant_id", String(36), ForeignKey("participants.id", ondelete="CASCADE"), primary_key=True)
)
