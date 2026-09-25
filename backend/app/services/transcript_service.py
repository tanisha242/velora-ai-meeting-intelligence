from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.repositories.transcript_repository import TranscriptRepository
from app.utils.transcript_parser import TranscriptParser
from app.schemas.transcript import TranscriptSearchMatch

class TranscriptService:
    def __init__(self, db: Session):
        self.repo = TranscriptRepository(db)

    def parse_and_save_transcript(
        self,
        meeting_id: str,
        text_content: str,
        format_type: str = "txt"
    ):
        segments_data = TranscriptParser.parse(text_content, format_type)
        return self.repo.create_transcript_with_segments(meeting_id, text_content, segments_data)

    def get_transcript(self, meeting_id: str):
        return self.repo.get_by_meeting_id(meeting_id)

    def get_segments(self, meeting_id: str):
        return self.repo.get_segments_by_meeting_id(meeting_id)

    def search_transcript(self, meeting_id: str, query: str) -> List[TranscriptSearchMatch]:
        if not query or not query.strip():
            return []

        q_clean = query.strip()
        segments = self.repo.search_segments(meeting_id, q_clean)

        matches = []
        for seg in segments:
            matches.append(
                TranscriptSearchMatch(
                    segment_id=seg.id,
                    speaker_name=seg.speaker_name,
                    start_time=seg.start_time,
                    end_time=seg.end_time,
                    text=seg.text,
                    sequence=seg.sequence,
                    matched_query=q_clean
                )
            )

        return matches
