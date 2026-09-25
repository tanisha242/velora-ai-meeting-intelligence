from typing import List, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.repositories.meeting_repository import MeetingRepository
from app.repositories.transcript_repository import TranscriptRepository
from app.services.summary_service import SummaryService
from app.utils.transcript_parser import TranscriptParser
from app.models.meeting import Meeting
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.action_item import ActionItem
from app.schemas.meeting import MeetingCreate, MeetingUpdate, MeetingSummaryListItem

class MeetingService:
    def __init__(self, db: Session):
        self.db = db
        self.meeting_repo = MeetingRepository(db)
        self.transcript_repo = TranscriptRepository(db)
        self.summary_service = SummaryService()

    def list_meetings(
        self,
        q: Optional[str] = None,
        participant: Optional[str] = None,
        date_from: Optional[datetime] = None,
        date_to: Optional[datetime] = None,
        sort_by: str = "date_desc"
    ) -> List[MeetingSummaryListItem]:
        meetings = self.meeting_repo.get_all(
            q=q,
            participant_query=participant,
            date_from=date_from,
            date_to=date_to,
            sort_by=sort_by
        )

        items = []
        for m in meetings:
            summary_prev = m.summary.overview if m.summary else (m.description or "No summary available.")
            items.append(
                MeetingSummaryListItem(
                    id=m.id,
                    title=m.title,
                    description=m.description,
                    date=m.date,
                    duration_seconds=m.duration_seconds,
                    participants=m.participants,
                    action_items_count=len(m.action_items),
                    summary_preview=summary_prev,
                    created_at=m.created_at,
                    updated_at=m.updated_at
                )
            )

        return items

    def get_meeting(self, meeting_id: str) -> Optional[Meeting]:
        return self.meeting_repo.get_by_id(meeting_id)

    def create_meeting(self, payload: MeetingCreate) -> Meeting:
        meeting = Meeting(
            title=payload.title,
            description=payload.description,
            date=payload.date or datetime.utcnow(),
            duration_seconds=0
        )

        # Attach participants
        for part_name in payload.participants:
            participant = self.meeting_repo.get_or_create_participant(part_name)
            meeting.participants.append(participant)

        self.meeting_repo.create(meeting)

        # Parse & attach transcript if provided
        segments_data = []
        if payload.transcript_text:
            segments_data = TranscriptParser.parse(payload.transcript_text, payload.transcript_format)
            self.transcript_repo.create_transcript_with_segments(meeting.id, payload.transcript_text, segments_data)

            if segments_data:
                meeting.duration_seconds = int(segments_data[-1].get("end_time", 300))
                self.meeting_repo.update(meeting)

        # Auto-generate Summary, Topics & Action Items
        summary_data = self.summary_service.generate_summary(payload.title, segments_data)
        summary = Summary(
            meeting_id=meeting.id,
            overview=summary_data["overview"],
            key_takeaways=summary_data["key_takeaways"],
            decisions=summary_data["decisions"]
        )
        self.db.add(summary)

        topics_data = self.summary_service.generate_topics(segments_data, float(meeting.duration_seconds))
        for t_data in topics_data:
            topic = Topic(
                meeting_id=meeting.id,
                title=t_data["title"],
                description=t_data["description"],
                start_time=t_data["start_time"],
                end_time=t_data["end_time"],
                sequence=t_data["sequence"]
            )
            self.db.add(topic)

        action_items_data = self.summary_service.generate_initial_action_items(segments_data)
        for ai_data in action_items_data:
            action_item = ActionItem(
                meeting_id=meeting.id,
                title=ai_data["title"],
                description=ai_data["description"],
                assignee=ai_data["assignee"],
                due_date=ai_data["due_date"],
                status=ai_data["status"]
            )
            self.db.add(action_item)

        self.db.commit()
        return self.get_meeting(meeting.id)

    def update_meeting(self, meeting_id: str, payload: MeetingUpdate) -> Optional[Meeting]:
        meeting = self.get_meeting(meeting_id)
        if not meeting:
            return None

        if payload.title is not None:
            meeting.title = payload.title
        if payload.description is not None:
            meeting.description = payload.description
        if payload.date is not None:
            meeting.date = payload.date

        if payload.participants is not None:
            meeting.participants.clear()
            for part_name in payload.participants:
                participant = self.meeting_repo.get_or_create_participant(part_name)
                meeting.participants.append(participant)

        return self.meeting_repo.update(meeting)

    def delete_meeting(self, meeting_id: str) -> bool:
        meeting = self.get_meeting(meeting_id)
        if not meeting:
            return False

        self.meeting_repo.delete(meeting)
        return True
