# REST API Specification - MeetNote Platform

## Overview
MeetNote provides a clean RESTful API built with **FastAPI**. All response payloads adhere to standard JSON conventions.

Base URL: `http://localhost:8000/api`

---

## Response Envelope Structure

### Success Response Format
```json
{
  "data": { ... },
  "message": "Operation completed successfully"
}
```

### Error Response Format (HTTP 4xx / 5xx)
```json
{
  "detail": "Error description message"
}
```

---

## 1. Meetings API

### `GET /api/meetings`
* **Description**: Retrieve a list of all meetings with support for filtering, searching, and sorting.
* **Query Parameters**:
  * `q` (string, optional): Search query matching meeting title or participant names.
  * `participant` (string, optional): Filter by participant name/email.
  * `date_from` (string, optional): ISO date string filter start.
  * `date_to` (string, optional): ISO date string filter end.
  * `sort_by` (string, optional, default: `"date_desc"`): `"date_desc"`, `"date_asc"`, `"title_asc"`.
* **Status**: `200 OK`

### `POST /api/meetings`
* **Description**: Create a new meeting along with transcript ingestion, auto-generated mock summary, topics, and initial action items.
* **Request Body**:
```json
{
  "title": "Q4 Roadmap Strategy Sync",
  "description": "Quarterly planning and sprint priorities",
  "date": "2026-09-26T10:00:00Z",
  "participants": ["Sarah Connor", "Alex Mercer", "John Doe"],
  "transcript_text": "[00:00] Sarah: Welcome team...\n[00:15] Alex: Happy to be here.",
  "transcript_format": "txt"
}
```
* **Status**: `201 Created`

### `GET /api/meetings/{id}`
* **Description**: Retrieve complete meeting details including metadata, participants, summary, topics, and action items.
* **Status**: `200 OK` / `404 Not Found`

### `PUT /api/meetings/{id}`
* **Description**: Update meeting metadata (title, description, date, participants).
* **Request Body**:
```json
{
  "title": "Updated Q4 Roadmap Strategy Sync",
  "description": "Updated agenda details",
  "date": "2026-09-26T10:30:00Z",
  "participants": ["Sarah Connor", "Alex Mercer"]
}
```
* **Status**: `200 OK` / `404 Not Found`

### `DELETE /api/meetings/{id}`
* **Description**: Delete meeting and cascade-delete all associated transcript segments, summaries, topics, and action items.
* **Status**: `200 OK` / `404 Not Found`

---

## 2. Transcript API

### `GET /api/meetings/{meeting_id}/transcript`
* **Description**: Fetch all transcript segments for a meeting ordered by sequence.
* **Status**: `200 OK` / `404 Not Found`

### `POST /api/meetings/{meeting_id}/transcript/upload`
* **Description**: Upload/replace transcript file (`.txt`, `.vtt`, `.json`).
* **Content-Type**: `multipart/form-data`
* **Payload**: `file` (file binary), `format` (`txt` | `vtt` | `json`)
* **Status**: `200 OK` / `400 Bad Request`

### `GET /api/meetings/{meeting_id}/transcript/search`
* **Description**: Case-insensitive keyword search within a specific meeting transcript. Returns matching segments with match offsets.
* **Query Parameters**: `q` (string, required)
* **Status**: `200 OK`

---

## 3. Summary & Topics API

### `GET /api/meetings/{meeting_id}/summary`
* **Description**: Fetch executive AI summary and key takeaways for a meeting.
* **Status**: `200 OK` / `404 Not Found`

### `POST /api/meetings/{meeting_id}/summary/generate`
* **Description**: Re-generate or generate mock AI summary from transcript content.
* **Status**: `200 OK`

### `GET /api/meetings/{meeting_id}/topics`
* **Description**: Fetch chapter topics with start and end timestamps.
* **Status**: `200 OK`

---

## 4. Action Items API

### `GET /api/meetings/{meeting_id}/action-items`
* **Description**: List all action items associated with a meeting.
* **Status**: `200 OK`

### `POST /api/meetings/{meeting_id}/action-items`
* **Description**: Create a new action item for a meeting.
* **Request Body**:
```json
{
  "title": "Finalize Q4 API Spec",
  "description": "Ensure OpenAPI spec includes all search routes",
  "assignee": "Alex Mercer",
  "due_date": "2026-09-30",
  "status": "pending"
}
```
* **Status**: `201 Created`

### `PUT /api/action-items/{id}`
* **Description**: Update an existing action item.
* **Status**: `200 OK` / `404 Not Found`

### `PATCH /api/action-items/{id}/status`
* **Description**: Toggle status (`pending` -> `in_progress` -> `completed`).
* **Request Body**:
```json
{
  "status": "completed"
}
```
* **Status**: `200 OK`

### `DELETE /api/action-items/{id}`
* **Description**: Delete an action item.
* **Status**: `200 OK` / `404 Not Found`

---

## 5. Global Search & QA API

### `GET /api/search`
* **Description**: Global search across meeting titles, participant names, summary overviews, and transcript segments.
* **Query Parameters**: `q` (string, required)
* **Status**: `200 OK`

### `POST /api/meetings/{meeting_id}/ask-ai`
* **Description**: Ask AI questions about the meeting (Mock LLM response engine).
* **Request Body**:
```json
{
  "question": "What were the major release blockers discussed?"
}
```
* **Status**: `200 OK`
