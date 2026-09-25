import os
import re
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.repositories.meeting_repository import MeetingRepository

class MeetingQAService:
    """
    Grounded Meeting QA Engine.
    Answers user questions based strictly on the current meeting's DB context:
    - Transcript segments
    - AI Summary (overview, takeaways, decisions)
    - Chapter topics
    - Action items & assignees
    
    Includes anti-hallucination guardrails and pluggable OpenAI LLM support.
    """
    def __init__(self, db: Session):
        self.db = db
        self.meeting_repo = MeetingRepository(db)

    def ask(self, meeting_id: str, question: str) -> Dict[str, str]:
        if not question or not question.strip():
            return {
                "question": question or "",
                "answer": "Please enter a valid question about the meeting."
            }

        q_text = question.strip()
        meeting = self.meeting_repo.get_by_id(meeting_id)

        if not meeting:
            return {
                "question": q_text,
                "answer": f"Meeting with ID '{meeting_id}' was not found in the workspace."
            }

        # Check if external OpenAI API key is configured
        openai_key = os.getenv("OPENAI_API_KEY")
        if openai_key:
            try:
                answer = self._ask_external_llm(meeting, q_text, openai_key)
                return {"question": q_text, "answer": answer}
            except Exception as e:
                # Fallback to local grounded QA engine if external call fails
                pass

        # Use Grounded Deterministic QA Engine
        answer = self._generate_grounded_answer(meeting, q_text)
        return {"question": q_text, "answer": answer}

    def _generate_grounded_answer(self, meeting: Any, question: str) -> str:
        q_lower = question.lower()

        # Extract meeting components
        title = meeting.title
        summary = meeting.summary
        overview = summary.overview if summary else ""
        takeaways = summary.key_takeaways if summary else []
        decisions = summary.decisions if summary else []
        topics = meeting.topics or []
        action_items = meeting.action_items or []
        segments = meeting.transcript_segments or []

        # 1. ANTI-HALLUCINATION GUARDRAIL: Check if subject is completely missing
        missing_topic = self._check_unmentioned_topic(question, title, overview, takeaways, decisions, topics, action_items, segments)
        if missing_topic:
            return f"The meeting transcript and summary do not mention any information about {missing_topic}."

        # 2. Speaker / Participant Questions (e.g., Alex, John, Priya, Sarah, Marcus, David, etc.)
        speaker_match = self._find_speaker_in_question(q_lower, meeting, segments)
        if speaker_match:
            speaker_name, matching_segs = speaker_match
            if matching_segs:
                # Filter by question keywords if specific topic is mentioned (excluding speaker name & stop words)
                stop_words = {"what", "where", "when", "which", "how", "team", "meeting", "did", "say", "said", "mention", "mentioned", "about", "this", "that", "with", speaker_name.lower()}
                q_words = [w for w in re.findall(r'\w+', q_lower) if len(w) > 3 and w not in stop_words]
                
                topic_matching_segs = []
                if q_words:
                    for seg in matching_segs:
                        if any(w in seg.text.lower() for w in q_words):
                            topic_matching_segs.append(seg)

                target_segs = topic_matching_segs if topic_matching_segs else matching_segs
                
                snippets = []
                for seg in target_segs:
                    time_str = f"{int(seg.start_time//60):02d}:{int(seg.start_time%60):02d}"
                    snippets.append(f"• At {time_str}, {seg.speaker_name} said: \"{seg.text}\"")
                
                if snippets:
                    return f"Regarding your question about {speaker_name} in '{title}':\n" + "\n".join(snippets)

        # 3. Action Items & Tasks Questions
        if any(k in q_lower for k in ["action item", "action items", "task", "tasks", "assignee", "assignees", "assigned to", "todo"]):
            if action_items:
                ai_list = []
                for idx, ai in enumerate(action_items):
                    assignee_str = f"Assigned to: {ai.assignee}" if ai.assignee else "Unassigned"
                    due_str = f", Due: {ai.due_date}" if ai.due_date else ""
                    ai_list.append(f"{idx+1}. {ai.title} — {assignee_str}{due_str} (Status: {ai.status})")
                return f"The action items and task assignments for '{title}' are:\n" + "\n".join(ai_list)
            else:
                return f"No action items were created for '{title}'."

        # 4. Decisions & Agreements Questions
        if any(k in q_lower for k in ["decision", "decisions", "agreed", "agree", "conclude", "decide"]):
            if decisions:
                d_list = "\n".join([f"{idx+1}. {d}" for idx, d in enumerate(decisions)])
                return f"The major decisions made in '{title}' were:\n{d_list}"
            else:
                return f"No explicit formal decisions were recorded in the summary for '{title}'."

        # 5. Main Topics / Agenda / Discussion Questions
        if any(k in q_lower for k in ["main topic", "main topics", "topics discussed", "agenda", "overall discussion", "overview of the meeting", "topics in this meeting", "topics covered"]):
            if topics:
                t_list = "\n".join([f"{idx+1}. {t.title}: {t.description or ''}" for idx, t in enumerate(topics)])
                ans = f"The main topics discussed in '{title}' were:\n{t_list}"
                if takeaways:
                    t_bullets = "\n".join([f"• {t}" for t in takeaways[:3]])
                    ans += f"\n\nKey Takeaways:\n{t_bullets}"
                return ans
            elif overview:
                return f"The main summary of '{title}':\n{overview}"

        # 6. Blockers / Issues / Challenges Questions
        if any(k in q_lower for k in ["blocker", "blockers", "release blocker", "issue", "issues", "challenge", "delay", "concern", "risk"]):
            blockers = []
            for seg in segments:
                s_text = seg.text.lower()
                if any(bk in s_text for bk in ["blocker", "issue", "challenge", "delay", "concern", "rate limit", "problem"]):
                    blockers.append(f"• {seg.speaker_name}: \"{seg.text}\" (at {int(seg.start_time//60):02d}:{int(seg.start_time%60):02d})")
            
            for t in takeaways:
                if any(bk in t.lower() for bk in ["blocker", "issue", "challenge", "delay", "concern", "rate limit"]):
                    blockers.append(f"• Takeaway: {t}")

            if blockers:
                unique_blockers = list(dict.fromkeys(blockers))
                return f"The key blockers and issues mentioned in '{title}' were:\n" + "\n".join(unique_blockers[:4])
            else:
                return f"No major release blockers or critical issues were explicitly mentioned in '{title}'."

        # 7. Specific Keyword Search across Transcript
        matching_snippets = []
        q_words = [w for w in re.findall(r'\w+', q_lower) if len(w) > 3 and w not in ["what", "where", "when", "which", "how", "team", "meeting", "this", "that"]]
        
        if q_words:
            for seg in segments:
                if any(w in seg.text.lower() for w in q_words):
                    time_str = f"{int(seg.start_time//60):02d}:{int(seg.start_time%60):02d}"
                    matching_snippets.append(f"• At {time_str}, {seg.speaker_name} said: \"{seg.text}\"")

        if matching_snippets:
            return f"Based on the transcript for '{title}':\n" + "\n".join(matching_snippets[:3])

        if overview:
            return f"Regarding your question about '{title}':\n{overview}"

        return f"The transcript for '{title}' does not contain sufficient details to answer that specific question."

    def _find_speaker_in_question(self, q_lower: str, meeting: Any, segments: List[Any]) -> Optional[tuple]:
        """Matches a speaker name mentioned in the user's question with meeting participants or transcript segments."""
        speaker_names = set()
        if hasattr(meeting, "participants") and meeting.participants:
            for p in meeting.participants:
                speaker_names.add(p.name)
        for seg in segments:
            if seg.speaker_name:
                speaker_names.add(seg.speaker_name)

        for full_name in speaker_names:
            first_name = full_name.split()[0].lower()
            if len(first_name) > 2 and (first_name in q_lower or full_name.lower() in q_lower):
                matching_segs = [s for s in segments if s.speaker_name and (first_name in s.speaker_name.lower() or full_name.lower() in s.speaker_name.lower())]
                return (full_name.split()[0], matching_segs)
        return None

    def _check_unmentioned_topic(
        self,
        question: str,
        title: str,
        overview: str,
        takeaways: List[str],
        decisions: List[str],
        topics: List[Any],
        action_items: List[Any],
        segments: List[Any]
    ) -> Optional[str]:
        """
        Anti-hallucination check: detects if the question asks about a specific entity/topic
        (e.g., 'mobile application', 'pricing', 'crypto') that is totally absent from the meeting.
        """
        known_absent_topics = [
            ("mobile application", ["mobile", "ios", "android", "app store"]),
            ("mobile app", ["mobile", "ios", "android", "app store"]),
            ("pricing model", ["pricing", "subscription", "discount", "tier"]),
            ("cryptocurrency", ["crypto", "bitcoin", "blockchain", "token"]),
            ("hiring budget", ["salary", "budget", "compensation"]),
        ]

        q_lower = question.lower()

        # Combine all text content from meeting
        all_text = (
            title + " " +
            overview + " " +
            " ".join(takeaways) + " " +
            " ".join(decisions) + " " +
            " ".join([t.title + " " + (t.description or "") for t in topics]) + " " +
            " ".join([a.title + " " + (a.description or "") for a in action_items]) + " " +
            " ".join([s.text for s in segments])
        ).lower()

        for topic_name, keywords in known_absent_topics:
            if topic_name in q_lower or any(kw in q_lower for kw in keywords):
                if not any(kw in all_text for kw in keywords):
                    return f"'{topic_name}'"

        # General noun phrase extraction check if question contains 'about X'
        about_match = re.search(r"about\s+([a-zA-Z0-9\s]{3,30})(?:\?|\.|$)", q_lower)
        if about_match:
            phrase = about_match.group(1).strip()
            phrase_words = [w for w in phrase.split() if len(w) > 3 and w not in ["the", "that", "this", "some", "any", "with", "this", "meeting"]]
            if phrase_words and not any(w in all_text for w in phrase_words):
                return f"'{phrase}'"

        return None

    def _ask_external_llm(self, meeting: Any, question: str, api_key: str) -> str:
        """Helper to invoke OpenAI API when OPENAI_API_KEY environment variable is configured."""
        import httpx

        context_parts = [
            f"Meeting Title: {meeting.title}",
            f"Overview: {meeting.summary.overview if meeting.summary else 'N/A'}",
            f"Takeaways: {', '.join(meeting.summary.key_takeaways if meeting.summary else [])}",
            f"Decisions: {', '.join(meeting.summary.decisions if meeting.summary else [])}",
            f"Action Items: {', '.join([a.title for a in meeting.action_items])}"
        ]

        transcript_text = "\n".join([f"[{int(s.start_time//60):02d}:{int(s.start_time%60):02d}] {s.speaker_name}: {s.text}" for s in meeting.transcript_segments[:30]])
        context_parts.append(f"Transcript:\n{transcript_text[:3000]}")

        prompt = "\n".join(context_parts)
        system_prompt = (
            "You are a helpful AI meeting assistant. Answer the user's question based STRICTLY on the provided meeting context. "
            "If the information is not mentioned in the transcript or notes, explicitly state that the meeting transcript does not mention it. "
            "Do not invent or hallucinate answers."
        )

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        body = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Meeting Context:\n{prompt}\n\nQuestion: {question}"}
            ],
            "temperature": 0.2
        }

        resp = httpx.post("https://api.openai.com/v1/chat/completions", json=body, headers=headers, timeout=10.0)
        resp.raise_for_status()
        return resp.json()["choices"][0]["message"]["content"]

