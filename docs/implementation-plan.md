# Implementation Plan - MeetNote Platform

## Execution Roadmap

This plan outlines the structured multi-phase execution strategy for constructing MeetNote.

---

## Phase 1: Repository Setup & Foundation
* **Target Files**:
  * Root folder structure (`backend/`, `frontend/`, `docs/`)
  * `backend/pyproject.toml` or `backend/requirements.txt`
  * `backend/.env.example`
  * `frontend/package.json`
* **Tasks**:
  1. Initialize Python virtual environment with FastAPI, Uvicorn, SQLAlchemy, Pydantic, Pytest, python-multipart.
  2. Initialize Next.js 14 App Router project with TypeScript, Tailwind CSS, and Lucide React icons.
  3. Verify frontend dev server and backend FastAPI startup (`GET /docs`).

---

## Phase 2: Database Schema & Seeding Engine
* **Target Files**:
  * `backend/app/db/database.py`
  * `backend/app/models/*.py`
  * `backend/app/db/seed.py`
* **Tasks**:
  1. Set up SQLAlchemy engine, `Base` model class, and `get_db` session dependency.
  2. Implement models: `Meeting`, `Participant`, `MeetingParticipant`, `Transcript`, `TranscriptSegment`, `Summary`, `Topic`, `ActionItem`.
  3. Build automatic database seeder (`seed.py`) populating **6 realistic meeting records** complete with realistic non-lorem-ipsum transcripts (15-30 segments each), participants, audio timestamps, AI summaries, topics, and action items.
  4. Verify seeding CLI command (`python -m app.db.seed`).

---

## Phase 3: Service Layer & Transcript Parsers
* **Target Files**:
  * `backend/app/utils/transcript_parser.py`
  * `backend/app/services/*.py`
  * `backend/app/repositories/*.py`
* **Tasks**:
  1. Implement `TranscriptParser` supporting `.txt`, `.vtt`, and `.json` files/strings into normalized timestamped segments.
  2. Implement `MeetingService`, `TranscriptService`, `SummaryService`, `ActionItemService`, `SearchService`.
  3. Implement modular Pytest test cases for transcript parsing, audio segment alignment, and database operations.

---

## Phase 4: FastAPI REST Endpoints & Pydantic Schemas
* **Target Files**:
  * `backend/app/schemas/*.py`
  * `backend/app/api/routes/*.py`
  * `backend/app/main.py`
* **Tasks**:
  1. Create Pydantic request/response schemas for all endpoints.
  2. Implement FastAPI route handlers for Meetings CRUD, Transcripts search/upload, Summaries, Action items, and Global Search.
  3. Enable CORS middleware allowing requests from `http://localhost:3000`.
  4. Test and verify all endpoints via FastAPI Swagger UI (`/docs`).

---

## Phase 5: Frontend Design System & App Shell
* **Target Files**:
  * `frontend/app/globals.css`
  * `frontend/components/layout/Sidebar.tsx`
  * `frontend/components/layout/Topbar.tsx`
  * `frontend/components/common/*.tsx`
  * `frontend/lib/api.ts`
* **Tasks**:
  1. Configure Fireflies-inspired modern dark/light SaaS theme palette with CSS variables and Tailwind.
  2. Build responsive collapsible `Sidebar` navigation with active route highlights.
  3. Build reusable UI components: `Modal`, `ToastProvider`, `Skeleton`, `EmptyState`, `ErrorState`.
  4. Implement centralized API client (`lib/api/*.ts`) for typed fetching.

---

## Phase 6: Meetings Library & Search Dashboard
* **Target Files**:
  * `frontend/app/meetings/page.tsx`
  * `frontend/components/meetings/MeetingList.tsx`
  * `frontend/components/meetings/MeetingCard.tsx`
  * `frontend/components/meetings/MeetingFilters.tsx`
  * `frontend/components/meetings/CreateMeetingModal.tsx`
* **Tasks**:
  1. Build Meetings Library dashboard with search input, date pickers, participant filter, and sorting.
  2. Implement meeting cards displaying title, date, duration, participant avatars, action item count, and summary preview.
  3. Build "Create Meeting" modal supporting transcript pasting and file upload (`.txt`, `.vtt`, `.json`).

---

## Phase 7: Interactive Meeting Workspace & Audio Synchronization
* **Target Files**:
  * `frontend/app/meetings/[id]/page.tsx`
  * `frontend/components/meeting/MeetingHeader.tsx`
  * `frontend/components/meeting/AudioPlayer.tsx`
  * `frontend/components/meeting/TranscriptPanel.tsx`
  * `frontend/components/meeting/TranscriptSegment.tsx`
  * `frontend/components/meeting/SummaryPanel.tsx`
  * `frontend/components/meeting/TopicsPanel.tsx`
  * `frontend/components/meeting/ActionItemsPanel.tsx`
* **Tasks**:
  1. Construct 2-panel Fireflies-inspired meeting workspace layout (Left: Summary / Topics / Action Items tabs; Right: Interactive Transcript).
  2. Build custom HTML5 `AudioPlayer` with play/pause, seek slider, speed controls (+/- 15s skip, 1x-2x speed).
  3. Implement **Audio-Transcript Real-time Synchronization**:
     * Active segment highlighting based on player `currentTime`.
     * Smooth auto-scroll into view during playback.
     * Click segment to seek audio `currentTime` directly to `start_time`.
  4. Implement in-transcript search with keyword match highlighting and Next/Prev result jumping.
  5. Build interactive Action Items manager (create, edit, delete, status checkbox toggle with optimistic update).

---

## Phase 8: Verification, Testing & Polish
* **Tasks**:
  1. Execute backend unit tests (`pytest`).
  2. Run frontend production build check (`npm run build`).
  3. Perform manual end-to-end user workflow testing across all checklist items.
  4. Generate root `README.md` complete with architecture details, setup guide, and interview preparation notes.
