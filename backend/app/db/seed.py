from datetime import datetime, timedelta
import random
from sqlalchemy.orm import Session
from app.db.database import Base, engine, SessionLocal
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.transcript import Transcript
from app.models.transcript_segment import TranscriptSegment
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.action_item import ActionItem

SEED_MEETINGS = [
    {
        "title": "Weekly Product Team Sync",
        "description": "Weekly alignment on product roadmap priorities, UI mockups review, and release timeline for Q4 features.",
        "date_offset_days": -1,
        "duration_seconds": 1800,  # 30 mins
        "participants": [
            {"name": "Sarah Connor", "email": "sarah.connor@example.com"},
            {"name": "Alex Mercer", "email": "alex.mercer@example.com"},
            {"name": "John Doe", "email": "john.doe@example.com"},
            {"name": "Priya Sharma", "email": "priya.sharma@example.com"}
        ],
        "summary": {
            "overview": "The product team reviewed the Q4 feature roadmap and finalized design specs for the meeting workspace. Alex confirmed frontend components are on track, while Priya highlighted API rate limiting concerns for transcript search. The release target remains locked for next Friday.",
            "key_takeaways": [
                "UI mockups for the two-panel meeting workspace approved unanimously.",
                "Transcript search performance benchmarked at under 50ms for 1,000 segments.",
                "QA testing plan scheduled to begin by Wednesday morning."
            ],
            "decisions": [
                "Use standard REST endpoints with Pydantic payload validation.",
                "Adopt Lucide React icons across all dashboard navigation components.",
                "Postpone CRM integration to the Q1 sprint cycle."
            ]
        },
        "topics": [
            {"title": "1. Roadmap Review & Overview", "description": "High-level review of sprint progress and upcoming release goals.", "start_time": 0.0, "end_time": 300.0, "sequence": 0},
            {"title": "2. UI/UX Design Feedback", "description": "Walkthrough of interactive transcript panel and audio player controls.", "start_time": 300.0, "end_time": 900.0, "sequence": 1},
            {"title": "3. Backend API & Performance", "description": "Database indexing, SQLite WAL mode, and endpoint optimizations.", "start_time": 900.0, "end_time": 1500.0, "sequence": 2},
            {"title": "4. Action Item Distribution", "description": "Assigning task ownership and scheduling follow-up reviews.", "start_time": 1500.0, "end_time": 1800.0, "sequence": 3}
        ],
        "action_items": [
            {"title": "Finalize Next.js App Router component structure", "description": "Ensure clean layout separation between sidebar, header, and transcript view.", "assignee": "Alex Mercer", "due_date": "Sep 28, 2026", "status": "in_progress"},
            {"title": "Implement SQLite database migration script", "description": "Verify cascading deletion behavior on foreign keys.", "assignee": "John Doe", "due_date": "Sep 27, 2026", "status": "completed"},
            {"title": "Conduct load testing on transcript search API", "description": "Benchmark LIKE queries vs indexed column lookup.", "assignee": "Priya Sharma", "due_date": "Sep 29, 2026", "status": "pending"},
            {"title": "Prepare client demo deck for Friday", "description": "Include walkthrough slides for live transcript auto-scrolling.", "assignee": "Sarah Connor", "due_date": "Oct 01, 2026", "status": "pending"}
        ],
        "transcript_raw": """
[00:00 - 00:15] Sarah Connor: Good morning team, welcome to our weekly product sync. Let's start with the roadmap updates.
[00:15 - 00:35] Alex Mercer: Morning Sarah! On the frontend side, we've completed the primary sidebar navigation and meeting library views.
[00:35 - 00:58] John Doe: Backend endpoints for meetings CRUD are live and passing pytest suites. Database schema is fully normalized.
[00:58 - 01:25] Priya Sharma: I reviewed the transcript search API. The indexed query pattern is performing well under 50 milliseconds.
[01:25 - 01:50] Sarah Connor: That's awesome news Priya. Alex, how is the audio synchronization coming along in the workspace?
[01:50 - 02:20] Alex Mercer: Smooth! Clicking any transcript segment seeks the audio player, and auto-scroll follows active playback seamlessly.
[02:20 - 02:45] John Doe: We also configured SQLite WAL mode so concurrent reads during live updates don't lock the database file.
[02:45 - 03:15] Priya Sharma: Excellent. Are we still planning to generate initial summaries automatically upon transcript upload?
[03:15 - 03:45] Sarah Connor: Yes, exactly. We have the mock summary generator in place, ready to wire up to OpenAI when needed.
[03:45 - 04:15] Alex Mercer: I'll make sure the Action Items panel allows instant creation, status toggles, and optimistic UI updates.
[04:15 - 04:45] John Doe: Perfect. I'll finish up the seed script so the app looks populated immediately out of the box.
[04:45 - 05:10] Sarah Connor: Great work everyone. Let's push our remaining PRs before tomorrow's code freeze.
[05:10 - 05:30] Priya Sharma: Sounds like a plan. Thanks all!
[05:30 - 05:50] Alex Mercer: Talk to you all tomorrow.
"""
    },
    {
        "title": "Engineering Sprint Planning",
        "description": "Bi-weekly sprint planning meeting focusing on microservices architecture, API endpoint contracts, and test coverage.",
        "date_offset_days": -3,
        "duration_seconds": 2400,  # 40 mins
        "participants": [
            {"name": "Alex Mercer", "email": "alex.mercer@example.com"},
            {"name": "John Doe", "email": "john.doe@example.com"},
            {"name": "Marcus Vance", "email": "marcus.vance@example.com"}
        ],
        "summary": {
            "overview": "Engineering team mapped out sprint 14 engineering tasks. Marcus presented the database indexing strategy for transcript segments, while John detailed Pydantic request validation schemas.",
            "key_takeaways": [
                "Sprint focus: Complete Meeting CRUD APIs, Search endpoints, and pytest integration.",
                "Target code coverage set at >= 85% across service layers."
            ],
            "decisions": [
                "Use SQLAlchemy 2.0 style select queries with joinedload for optimal eager fetching.",
                "Enforce Pydantic response models to prevent exposing raw DB models."
            ]
        },
        "topics": [
            {"title": "1. Sprint 13 Retro & Metrics", "description": "Reviewing velocity and resolved PRs from the previous cycle.", "start_time": 0.0, "end_time": 600.0, "sequence": 0},
            {"title": "2. Database Schema Optimization", "description": "Foreign keys, cascading updates, and indexing strategy.", "start_time": 600.0, "end_time": 1500.0, "sequence": 1},
            {"title": "3. Unit & Integration Testing", "description": "Writing pytest suites for transcript parsing and search API.", "start_time": 1500.0, "end_time": 2400.0, "sequence": 2}
        ],
        "action_items": [
            {"title": "Add composite indexes to transcript_segments table", "description": "Index on (meeting_id, sequence) for ordered queries.", "assignee": "Marcus Vance", "due_date": "Sep 27, 2026", "status": "completed"},
            {"title": "Write unit tests for WebVTT and TXT parsers", "description": "Cover edge cases with malformed timestamps.", "assignee": "John Doe", "due_date": "Sep 28, 2026", "status": "in_progress"},
            {"title": "Configure FastAPI CORS middleware for frontend origin", "description": "Allow localhost:3000 explicitly.", "assignee": "Alex Mercer", "due_date": "Sep 26, 2026", "status": "completed"}
        ],
        "transcript_raw": """
[00:00 - 00:20] Alex Mercer: Welcome engineers to Sprint Planning 14. Today we're locking in backend APIs and database schemas.
[00:20 - 00:45] Marcus Vance: I reviewed the database schema. Having indexed foreign keys on transcript_segments is critical for fast playback syncing.
[00:45 - 01:15] John Doe: Agreed. I also added cascade delete on all child tables so deleting a meeting cleans up all transcripts, summaries, and tasks.
[01:15 - 01:45] Alex Mercer: How are we handling file uploads for VTT and JSON transcript formats?
[01:45 - 02:15] John Doe: We built a dedicated TranscriptParser class that standardizes all input into floating point start/end times.
[02:15 - 02:50] Marcus Vance: That's clean. Are we returning standard JSON envelopes for API responses?
[02:50 - 03:20] John Doe: Yes, every response uses the ResponseEnvelope schema containing 'data' and 'message' keys.
[03:20 - 03:55] Alex Mercer: Great. Let's make sure our pytest suite tests all HTTP status codes (200, 201, 404, 422).
[03:55 - 04:30] Marcus Vance: I'll take ownership of writing tests for global search across meetings and transcript text.
[04:30 - 05:00] Alex Mercer: Excellent session team. Let me know if any blockers arise.
"""
    },
    {
        "title": "Client Discovery Call - Acme Corp",
        "description": "Initial requirement gathering with Acme Corp stakeholders regarding enterprise meeting intelligence integration.",
        "date_offset_days": -5,
        "duration_seconds": 2100,  # 35 mins
        "participants": [
            {"name": "Sarah Connor", "email": "sarah.connor@example.com"},
            {"name": "David Miller (Acme)", "email": "david.miller@acme.com"},
            {"name": "Elena Rostova (Acme)", "email": "elena.rostova@acme.com"}
        ],
        "summary": {
            "overview": "Exploratory call with Acme Corp leadership. David requested seamless export features (TXT, Markdown) and custom keyword tagging during live transcription.",
            "key_takeaways": [
                "Acme Corp manages over 200 internal meetings per week across sales and product teams.",
                "Key requirement: Instant text export and action item assignment tracking."
            ],
            "decisions": [
                "Provide multi-format export capabilities in Phase 2.",
                "Schedule a follow-up technical demonstration next Tuesday."
            ]
        },
        "topics": [
            {"title": "1. Client Needs Assessment", "description": "Understanding Acme Corp's current meeting documentation pain points.", "start_time": 0.0, "end_time": 600.0, "sequence": 0},
            {"title": "2. Velora Platform Demo", "description": "Interactive demonstration of real-time audio sync and AI summaries.", "start_time": 600.0, "end_time": 1400.0, "sequence": 1},
            {"title": "3. Security & Export Capabilities", "description": "Data privacy policy, export options, and custom workflows.", "start_time": 1400.0, "end_time": 2100.0, "sequence": 2}
        ],
        "action_items": [
            {"title": "Send Velora platform security overview whitepaper", "description": "Include SQLite data encryption guidelines and API access specs.", "assignee": "Sarah Connor", "due_date": "Sep 28, 2026", "status": "completed"},
            {"title": "Draft custom export feature specification", "description": "Support Markdown and plain TXT formatted meeting notes.", "assignee": "Sarah Connor", "due_date": "Oct 02, 2026", "status": "pending"}
        ],
        "transcript_raw": """
[00:00 - 00:25] Sarah Connor: Hi David and Elena, thank you for joining us today. We're excited to showcase Velora.
[00:25 - 00:55] David Miller (Acme): Thanks Sarah! Our team currently spends hours writing post-meeting recaps manually. We need automated intelligence.
[00:55 - 01:30] Elena Rostova (Acme): Specifically, being able to search across all past meeting transcripts for key terms like 'pricing' or 'contract terms'.
[01:30 - 02:05] Sarah Connor: Velora does exactly that! Our search engine indexes speaker segments, topics, and AI summaries instantly.
[02:05 - 02:40] David Miller (Acme): Can our team export action items directly to plain text or Markdown files?
[02:40 - 03:15] Sarah Connor: Absolutely! We support direct export of meeting summaries, topics, and action item lists.
[03:15 - 03:45] Elena Rostova (Acme): That would save our project managers immense time every single week.
[03:45 - 04:15] Sarah Connor: I'll follow up with our technical documentation and schedule a full team onboarding demo.
"""
    },
    {
        "title": "Marketing Strategy Meeting",
        "description": "Brainstorming session for Q4 digital campaign launch, social media channels, and brand messaging.",
        "date_offset_days": -7,
        "duration_seconds": 2700,  # 45 mins
        "participants": [
            {"name": "Priya Sharma", "email": "priya.sharma@example.com"},
            {"name": "Jessica Taylor", "email": "jessica.taylor@example.com"},
            {"name": "Liam Vance", "email": "liam.vance@example.com"}
        ],
        "summary": {
            "overview": "The marketing team outlined key campaign pillars for Q4 launch. Jessica presented content assets for social channels, while Priya detailed lead generation performance targets.",
            "key_takeaways": [
                "Primary campaign theme focused on 'Productivity Reimagined with AI Notes'.",
                "Targeting 25% increase in organic trial signups in month one."
            ],
            "decisions": [
                "Focus ad spend on LinkedIn and Developer newsletters.",
                "Publish weekly blog posts showcasing meeting workflow productivity tips."
            ]
        },
        "topics": [
            {"title": "1. Q3 Campaign Performance Review", "description": "Analyzing ROI and user acquisition channels.", "start_time": 0.0, "end_time": 900.0, "sequence": 0},
            {"title": "2. Q4 Messaging Strategy", "description": "Crafting landing page value propositions and copy.", "start_time": 900.0, "end_time": 1800.0, "sequence": 1},
            {"title": "3. Budget Allocation & Next Steps", "description": "Finalizing ad budget split across platforms.", "start_time": 1800.0, "end_time": 2700.0, "sequence": 2}
        ],
        "action_items": [
            {"title": "Finalize Q4 social media banner designs", "description": "Create modern dark-mode branded graphics.", "assignee": "Jessica Taylor", "due_date": "Sep 30, 2026", "status": "in_progress"},
            {"title": "Write launch blog post announcement", "description": "Highlight real-time transcript sync and instant action items.", "assignee": "Liam Vance", "due_date": "Oct 03, 2026", "status": "pending"}
        ],
        "transcript_raw": """
[00:00 - 00:30] Priya Sharma: Welcome team! Let's align on our Q4 marketing campaign strategy for Velora.
[00:30 - 01:00] Jessica Taylor: Our main focus is highlighting how much time engineers and product managers save on meeting notes.
[01:00 - 01:30] Liam Vance: I've drafted copy centered around 'Never miss an action item again'. It resonates strongly in user tests.
[01:30 - 02:00] Priya Sharma: Perfect. Jessica, can you ensure the campaign visuals feature clean dark-mode UI mockups?
[02:00 - 02:30] Jessica Taylor: Definitely! I'll have the graphic assets ready by early next week.
[02:30 - 03:00] Liam Vance: I'll finalize the announcement blog post and press release draft.
"""
    },
    {
        "title": "Project Retrospective - Q3 Release",
        "description": "Team retro analyzing what went well, what could be improved, and action items for the upcoming product cycle.",
        "date_offset_days": -10,
        "duration_seconds": 3600,  # 60 mins
        "participants": [
            {"name": "Sarah Connor", "email": "sarah.connor@example.com"},
            {"name": "Alex Mercer", "email": "alex.mercer@example.com"},
            {"name": "John Doe", "email": "john.doe@example.com"},
            {"name": "Priya Sharma", "email": "priya.sharma@example.com"}
        ],
        "summary": {
            "overview": "Comprehensive retrospective covering Q3 achievements and engineering friction points. The team celebrated delivering the interactive transcript audio player ahead of schedule.",
            "key_takeaways": [
                "Audio-transcript synchronization achieved zero perceived latency.",
                "Automated unit testing prevented 4 critical regression bugs prior to release."
            ],
            "decisions": [
                "Implement strict pre-commit hooks for TypeScript and Python formatting.",
                "Allocate 15% of sprint capacity to technical debt refactoring."
            ]
        },
        "topics": [
            {"title": "1. What Went Well", "description": "Celebrating feature deliveries and cross-functional team collaboration.", "start_time": 0.0, "end_time": 1200.0, "sequence": 0},
            {"title": "2. Process & Technical Friction", "description": "Identifying bottlenecks in build pipelines and documentation.", "start_time": 1200.0, "end_time": 2400.0, "sequence": 1},
            {"title": "3. Actionable Retro Improvements", "description": "Formulating concrete changes for Q4 sprint workflows.", "start_time": 2400.0, "end_time": 3600.0, "sequence": 2}
        ],
        "action_items": [
            {"title": "Set up CI pipeline for automated pytest and ESLint verification", "description": "Ensure zero breaking builds on main branch.", "assignee": "John Doe", "due_date": "Oct 05, 2026", "status": "completed"},
            {"title": "Update architectural documentation in /docs", "description": "Document system layers, Pydantic schemas, and SQLAlchemy relationship cascade rules.", "assignee": "Alex Mercer", "due_date": "Oct 04, 2026", "status": "completed"}
        ],
        "transcript_raw": """
[00:00 - 00:30] Sarah Connor: Welcome everyone to our Q3 retrospective! Let's review our major wins and areas for growth.
[00:30 - 01:05] Alex Mercer: Delivering the real-time audio sync feature was our biggest win. User feedback has been fantastic.
[01:05 - 01:40] John Doe: Automated pytest coverage gave us huge confidence during database schema refactoring.
[01:40 - 02:15] Priya Sharma: One improvement area is documentation. Having clear architecture diagrams makes onboarding so much faster.
[02:15 - 02:50] Sarah Connor: Agreed. Let's make sure comprehensive docs are maintained right alongside the codebase in /docs.
[02:50 - 03:20] Alex Mercer: I'll gladly update the architecture and database schema docs.
"""
    },
    {
        "title": "Hiring & Interview Discussion - Senior Frontend Lead",
        "description": "Debrief session evaluating candidates for the Senior Frontend Engineer position.",
        "date_offset_days": -12,
        "duration_seconds": 1500,  # 25 mins
        "participants": [
            {"name": "Sarah Connor", "email": "sarah.connor@example.com"},
            {"name": "Alex Mercer", "email": "alex.mercer@example.com"}
        ],
        "summary": {
            "overview": "Debrief on frontend candidate technical interviews. Candidate demonstrated exceptional mastery of Next.js App Router, state management, and performance optimization for complex UI panels.",
            "key_takeaways": [
                "Candidate solved live coding challenge using clean modular React component architecture.",
                "Strong understanding of responsive Tailwind layout styling and accessibility standards."
            ],
            "decisions": [
                "Extend formal offer for Senior Frontend Engineer role.",
                "Target start date for first week of November."
            ]
        },
        "topics": [
            {"title": "1. Candidate Evaluation & Code Review", "description": "Assessing system design performance and code structure.", "start_time": 0.0, "end_time": 600.0, "sequence": 0},
            {"title": "2. Culture Fit & Alignment", "description": "Evaluating communication clarity and pair programming collaboration.", "start_time": 600.0, "end_time": 1100.0, "sequence": 1},
            {"title": "3. Offer Details & Timeline", "description": "Structuring compensation package and start date.", "start_time": 1100.0, "end_time": 1500.0, "sequence": 2}
        ],
        "action_items": [
            {"title": "Submit offer approval request to HR", "description": "Prepare role details and equity allocation.", "assignee": "Sarah Connor", "due_date": "Sep 25, 2026", "status": "completed"},
            {"title": "Schedule team welcoming call", "description": "Coordinate onboarding schedule upon offer acceptance.", "assignee": "Alex Mercer", "due_date": "Oct 10, 2026", "status": "pending"}
        ],
        "transcript_raw": """
[00:00 - 00:25] Sarah Connor: Hi Alex, let's debrief on yesterday's frontend interview candidate.
[00:25 - 00:55] Alex Mercer: Overall extremely impressive. They built a clean component layout with state-driven audio playback in record time.
[00:55 - 01:25] Sarah Connor: Their communication during the system design phase was also top tier.
[01:25 - 01:55] Alex Mercer: Exactly. They clearly understand Next.js App Router, custom hooks, and state isolation.
[01:55 - 02:25] Sarah Connor: Fantastic. I'll submit the formal offer request today.
"""
    }
]

def seed_database(db: Session = None, overwrite: bool = False):
    close_session = False
    if db is None:
        db = SessionLocal()
        close_session = True

    try:
        # Re-create tables
        Base.metadata.create_all(bind=engine)

        existing_count = db.query(Meeting).count()
        if existing_count > 0 and not overwrite:
            print(f"--> Database already contains {existing_count} meetings. Skipping seed.")
            return

        # Clear existing data
        db.query(ActionItem).delete()
        db.query(Topic).delete()
        db.query(Summary).delete()
        db.query(TranscriptSegment).delete()
        db.query(Transcript).delete()
        db.query(Meeting).delete()
        db.query(Participant).delete()
        db.commit()

        print("--> Seeding 6 realistic sample meetings...")

        now = datetime.utcnow()

        for m_data in SEED_MEETINGS:
            m_date = now + timedelta(days=m_data["date_offset_days"])

            meeting = Meeting(
                title=m_data["title"],
                description=m_data["description"],
                date=m_date,
                duration_seconds=m_data["duration_seconds"]
            )

            db.add(meeting)
            db.flush()

            # Add participants
            for p_info in m_data["participants"]:
                p = db.query(Participant).filter(Participant.email == p_info["email"]).first()
                if not p:
                    p = Participant(
                        name=p_info["name"],
                        email=p_info["email"],
                        avatar_url=f"https://api.dicebear.com/7.x/avataaars/svg?seed={p_info['name']}"
                    )
                    db.add(p)
                    db.flush()
                meeting.participants.append(p)

            db.flush()

            # Add Summary
            s_info = m_data["summary"]
            summary = Summary(
                meeting_id=meeting.id,
                overview=s_info["overview"],
                key_takeaways=s_info["key_takeaways"],
                decisions=s_info["decisions"]
            )
            db.add(summary)

            # Add Topics
            for t_info in m_data["topics"]:
                topic = Topic(
                    meeting_id=meeting.id,
                    title=t_info["title"],
                    description=t_info["description"],
                    start_time=t_info["start_time"],
                    end_time=t_info["end_time"],
                    sequence=t_info["sequence"]
                )
                db.add(topic)

            # Add Action Items
            for ai_info in m_data["action_items"]:
                ai = ActionItem(
                    meeting_id=meeting.id,
                    title=ai_info["title"],
                    description=ai_info["description"],
                    assignee=ai_info["assignee"],
                    due_date=ai_info["due_date"],
                    status=ai_info["status"]
                )
                db.add(ai)

            # Add Transcript & Segments
            raw_txt = m_data["transcript_raw"].strip()
            transcript = Transcript(meeting_id=meeting.id, raw_text=raw_txt)
            db.add(transcript)
            db.flush()

            from app.utils.transcript_parser import TranscriptParser
            segments_parsed = TranscriptParser.parse_txt(raw_txt)
            for seg in segments_parsed:
                segment = TranscriptSegment(
                    transcript_id=transcript.id,
                    meeting_id=meeting.id,
                    speaker_name=seg["speaker_name"],
                    start_time=seg["start_time"],
                    end_time=seg["end_time"],
                    text=seg["text"],
                    sequence=seg["sequence"]
                )
                db.add(segment)

        db.commit()
        print(" Successfully seeded database with 6 meeting records!")

    except Exception as e:
        db.rollback()
        print(f" Error seeding database: {e}")
        raise e
    finally:
        if close_session:
            db.close()

if __name__ == "__main__":
    seed_database(overwrite=True)
