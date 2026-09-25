from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, desc, asc
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.summary import Summary

class MeetingRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        q: Optional[str] = None,
        participant_query: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        sort_by: str = "date_desc"
    ) -> List[Meeting]:
        query = self.db.query(Meeting).options(
            joinedload(Meeting.participants),
            joinedload(Meeting.summary),
            joinedload(Meeting.action_items)
        )

        if q:
            search_pattern = f"%{q}%"
            query = query.filter(
                or_(
                    Meeting.title.ilike(search_pattern),
                    Meeting.description.ilike(search_pattern)
                )
            )

        if participant_query:
            part_pattern = f"%{participant_query}%"
            query = query.join(Meeting.participants).filter(
                or_(
                    Participant.name.ilike(part_pattern),
                    Participant.email.ilike(part_pattern)
                )
            )

        if date_from:
            query = query.filter(Meeting.date >= date_from)
        if date_to:
            query = query.filter(Meeting.date <= date_to)

        if sort_by == "date_asc":
            query = query.order_by(asc(Meeting.date))
        elif sort_by == "title_asc":
            query = query.order_by(asc(Meeting.title))
        else:
            query = query.order_by(desc(Meeting.date))

        return query.distinct().all()

    def get_by_id(self, meeting_id: str) -> Optional[Meeting]:
        return self.db.query(Meeting).options(
            joinedload(Meeting.participants),
            joinedload(Meeting.summary),
            joinedload(Meeting.topics),
            joinedload(Meeting.action_items),
            joinedload(Meeting.transcript_segments)
        ).filter(Meeting.id == meeting_id).first()

    def create(self, meeting: Meeting) -> Meeting:
        self.db.add(meeting)
        self.db.commit()
        self.db.refresh(meeting)
        return meeting

    def update(self, meeting: Meeting) -> Meeting:
        self.db.commit()
        self.db.refresh(meeting)
        return meeting

    def delete(self, meeting: Meeting) -> None:
        self.db.delete(meeting)
        self.db.commit()

    def get_or_create_participant(self, name: str, email: Optional[str] = None) -> Participant:
        p = self.db.query(Participant).filter(Participant.name.ilike(name.strip())).first()
        if not p:
            p = Participant(
                name=name.strip(),
                email=email or f"{name.strip().lower().replace(' ', '.')}@example.com",
                avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={name.strip()}"
            )
            self.db.add(p)
            self.db.flush()
        return p
