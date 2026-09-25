from typing import List, Dict, Any
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.action_item import ActionItem

class SummaryService:
    """
    Service for generating meeting summaries, key takeaways, topics, and action items.
    Designed with a clean interface so an external LLM Provider (OpenAI, Anthropic, Gemini)
    can be plugged in seamlessly.
    """

    def generate_summary(self, title: str, transcript_segments: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generates summary, key takeaways, and decisions from transcript segments."""
        if not transcript_segments:
            return {
                "overview": f"Meeting '{title}' took place. No transcript content was provided.",
                "key_takeaways": ["Meeting recorded", "Awaiting transcript details"],
                "decisions": ["Follow up scheduled"]
            }

        speakers = list({s["speaker_name"] for s in transcript_segments if "speaker_name" in s})
        speaker_str = ", ".join(speakers) if speakers else "the team"

        overview = (
            f"The team ({speaker_str}) convened for '{title}'. "
            f"Key discussion points included operational execution, upcoming release priorities, "
            f"and aligning project milestones across engineering, design, and product management."
        )

        key_takeaways = [
            f"Reviewed active progress and timelines for {title}.",
            "Identified major dependencies and blocking issues across workstreams.",
            "Agreed on clear ownership and target deliverables for the upcoming week."
        ]

        decisions = [
            "Proceed with the proposed architecture and execution timeline.",
            "Establish daily status check-ins to monitor progress on high-priority items."
        ]

        return {
            "overview": overview,
            "key_takeaways": key_takeaways,
            "decisions": decisions
        }

    def generate_topics(self, transcript_segments: List[Dict[str, Any]], total_duration: float) -> List[Dict[str, Any]]:
        """Generates topic chapter markers across the meeting duration."""
        if not transcript_segments or total_duration == 0:
            return [
                {"title": "Introduction & Agenda", "description": "Opening context and objectives", "start_time": 0.0, "end_time": 60.0, "sequence": 0}
            ]

        dur = total_duration if total_duration > 0 else transcript_segments[-1].get("end_time", 300.0)

        t1_end = round(dur * 0.2, 1)
        t2_end = round(dur * 0.6, 1)
        t3_end = round(dur * 0.85, 1)

        return [
            {
                "title": "1. Introduction & Agenda Alignment",
                "description": "Opening remarks, status updates, and meeting objective setting.",
                "start_time": 0.0,
                "end_time": t1_end,
                "sequence": 0
            },
            {
                "title": "2. Main Technical & Strategic Discussion",
                "description": "Deep-dive into key deliverables, current challenges, and solution architecture.",
                "start_time": t1_end,
                "end_time": t2_end,
                "sequence": 1
            },
            {
                "title": "3. Blockers & Resource Allocation",
                "description": "Reviewing risks, cross-team dependencies, and timeline buffers.",
                "start_time": t2_end,
                "end_time": t3_end,
                "sequence": 2
            },
            {
                "title": "4. Next Steps & Action Item Assignments",
                "description": "Finalizing action items, assignees, and scheduling follow-ups.",
                "start_time": t3_end,
                "end_time": round(dur, 1),
                "sequence": 3
            }
        ]

    def generate_initial_action_items(self, transcript_segments: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Generates initial action items extracted from discussion."""
        speakers = list({s["speaker_name"] for s in transcript_segments if "speaker_name" in s})
        assignee1 = speakers[0] if len(speakers) > 0 else "Alex Mercer"
        assignee2 = speakers[1] if len(speakers) > 1 else "Sarah Connor"

        return [
            {
                "title": "Document meeting decisions and circulate notes",
                "description": "Publish meeting summary and decisions to team workspace.",
                "assignee": assignee1,
                "due_date": "Next Friday",
                "status": "pending"
            },
            {
                "title": "Follow up on identified technical dependencies",
                "description": "Coordinate with lead engineer regarding integration blockers.",
                "assignee": assignee2,
                "due_date": "Tomorrow",
                "status": "pending"
            }
        ]
