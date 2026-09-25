from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.repositories.meeting_repository import MeetingRepository
from app.models.transcript_segment import TranscriptSegment
from app.models.summary import Summary

class SearchService:
    def __init__(self, db: Session):
        self.db = db

    def global_search(self, query: str) -> Dict[str, Any]:
        if not query or len(query.strip()) < 2:
            return {"meetings": [], "transcript_segments": []}

        q_str = f"%{query.strip()}%"

        # Search meetings by title or description
        meeting_repo = MeetingRepository(self.db)
        matched_meetings = meeting_repo.get_all(q=query.strip())

        meetings_data = [
            {
                "id": m.id,
                "title": m.title,
                "date": m.date.isoformat(),
                "duration_seconds": m.duration_seconds,
                "participants": [p.name for p in m.participants]
            }
            for m in matched_meetings
        ]

        # Search transcript segments
        matched_segments = self.db.query(TranscriptSegment)\
            .filter(TranscriptSegment.text.ilike(q_str))\
            .limit(20)\
            .all()

        segments_data = [
            {
                "id": seg.id,
                "meeting_id": seg.meeting_id,
                "speaker_name": seg.speaker_name,
                "start_time": seg.start_time,
                "text": seg.text
            }
            for seg in matched_segments
        ]

        return {
            "meetings": meetings_data,
            "transcript_segments": segments_data
        }

    def ask_ai_question(self, meeting_id: str, question: str) -> Dict[str, str]:
        """Delegate Ask AI question answering to MeetingQAService."""
        from app.services.meeting_qa_service import MeetingQAService
        qa_service = MeetingQAService(self.db)
        return qa_service.ask(meeting_id, question)
