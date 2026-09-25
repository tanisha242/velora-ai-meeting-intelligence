export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatar_url?: string;
}

export interface Summary {
  id: string;
  meeting_id: string;
  overview: string;
  key_takeaways: string[];
  decisions: string[];
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  start_time: number;
  end_time: number;
  sequence: number;
}

export interface ActionItem {
  id: string;
  meeting_id: string;
  title: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at: string;
  updated_at: string;
}

export interface TranscriptSegment {
  id: string;
  transcript_id: string;
  meeting_id: string;
  speaker_name: string;
  speaker_id?: string;
  start_time: number;
  end_time: number;
  text: string;
  sequence: number;
}

export interface MeetingSummaryListItem {
  id: string;
  title: string;
  description?: string;
  date: string;
  duration_seconds: number;
  participants: Participant[];
  action_items_count: number;
  summary_preview?: string;
  created_at: string;
  updated_at: string;
}

export interface MeetingDetail {
  id: string;
  title: string;
  description?: string;
  date: string;
  duration_seconds: number;
  participants: Participant[];
  summary?: Summary;
  topics: Topic[];
  action_items: ActionItem[];
  transcript_segments: TranscriptSegment[];
  created_at: string;
  updated_at: string;
}

export interface TranscriptSearchMatch {
  segment_id: string;
  speaker_name: string;
  start_time: number;
  end_time: number;
  text: string;
  sequence: number;
  matched_query: string;
}

export interface CreateMeetingPayload {
  title: string;
  description?: string;
  date?: string;
  participants: string[];
  transcript_text?: string;
  transcript_format?: 'txt' | 'vtt' | 'json';
}

export interface UpdateMeetingPayload {
  title?: string;
  description?: string;
  date?: string;
  participants?: string[];
}

export interface CreateActionItemPayload {
  title: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  status?: string;
}

export interface UpdateActionItemPayload {
  title?: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  status?: string;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
}
