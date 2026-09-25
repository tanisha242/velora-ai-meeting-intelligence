from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.transcript import Transcript
from app.models.transcript_segment import TranscriptSegment

class TranscriptRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_meeting_id(self, meeting_id: str) -> Optional[Transcript]:
        return self.db.query(Transcript).filter(Transcript.meeting_id == meeting_id).first()

    def get_segments_by_meeting_id(self, meeting_id: str) -> List[TranscriptSegment]:
        return self.db.query(TranscriptSegment)\
            .filter(TranscriptSegment.meeting_id == meeting_id)\
            .order_by(TranscriptSegment.sequence.asc())\
            .all()

    def search_segments(self, meeting_id: str, query: str) -> List[TranscriptSegment]:
        pattern = f"%{query}%"
        return self.db.query(TranscriptSegment)\
            .filter(TranscriptSegment.meeting_id == meeting_id)\
            .filter(TranscriptSegment.text.ilike(pattern))\
            .order_by(TranscriptSegment.sequence.asc())\
            .all()

    def create_transcript_with_segments(
        self,
        meeting_id: str,
        raw_text: str,
        segments_data: List[dict]
    ) -> Transcript:
        # Clear existing transcript if any
        existing = self.get_by_meeting_id(meeting_id)
        if existing:
            self.db.delete(existing)
            self.db.commit()

        transcript = Transcript(meeting_id=meeting_id, raw_text=raw_text)
        self.db.add(transcript)
        self.db.flush()

        for seg_data in segments_data:
            segment = TranscriptSegment(
                transcript_id=transcript.id,
                meeting_id=meeting_id,
                speaker_name=seg_data["speaker_name"],
                start_time=seg_data["start_time"],
                end_time=seg_data["end_time"],
                text=seg_data["text"],
                sequence=seg_data["sequence"]
            )
            self.db.add(segment)

        self.db.commit()
        self.db.refresh(transcript)
        return transcript
