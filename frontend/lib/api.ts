import {
  MeetingSummaryListItem,
  MeetingDetail,
  CreateMeetingPayload,
  UpdateMeetingPayload,
  TranscriptSegment,
  TranscriptSearchMatch,
  ActionItem,
  CreateActionItemPayload,
  UpdateActionItemPayload,
  Summary,
  Topic,
  ApiResponse
} from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function fetcher<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    let errorMsg = `API call failed: ${response.status} ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson.detail) {
        errorMsg = errJson.detail;
      }
    } catch (_) {}
    throw new Error(errorMsg);
  }

  const json: ApiResponse<T> = await response.json();
  return json.data;
}

export const api = {
  // Meetings
  async getMeetings(params?: {
    q?: string;
    participant?: string;
    date_from?: string;
    date_to?: string;
    sort_by?: string;
  }): Promise<MeetingSummaryListItem[]> {
    const query = new URLSearchParams();
    if (params?.q) query.append('q', params.q);
    if (params?.participant) query.append('participant', params.participant);
    if (params?.date_from) query.append('date_from', params.date_from);
    if (params?.date_to) query.append('date_to', params.date_to);
    if (params?.sort_by) query.append('sort_by', params.sort_by);

    const queryString = query.toString() ? `?${query.toString()}` : '';
    return fetcher<MeetingSummaryListItem[]>(`/meetings${queryString}`);
  },

  async getMeeting(id: string): Promise<MeetingDetail> {
    return fetcher<MeetingDetail>(`/meetings/${id}`);
  },

  async createMeeting(payload: CreateMeetingPayload): Promise<MeetingDetail> {
    return fetcher<MeetingDetail>('/meetings', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateMeeting(id: string, payload: UpdateMeetingPayload): Promise<MeetingDetail> {
    return fetcher<MeetingDetail>(`/meetings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async deleteMeeting(id: string): Promise<{ id: string }> {
    return fetcher<{ id: string }>(`/meetings/${id}`, {
      method: 'DELETE'
    });
  },

  // Transcript
  async getTranscriptSegments(meetingId: string): Promise<TranscriptSegment[]> {
    return fetcher<TranscriptSegment[]>(`/meetings/${meetingId}/transcript`);
  },

  async uploadTranscript(meetingId: string, file: File, format: string = 'txt'): Promise<{ id: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format_type', format);

    const url = `${API_BASE_URL}/meetings/${meetingId}/transcript/upload`;
    const res = await fetch(url, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      throw new Error('Failed to upload transcript file');
    }

    const json: ApiResponse<{ id: string }> = await res.json();
    return json.data;
  },

  async searchTranscript(meetingId: string, query: string): Promise<TranscriptSearchMatch[]> {
    const qEscaped = encodeURIComponent(query);
    return fetcher<TranscriptSearchMatch[]>(`/meetings/${meetingId}/transcript/search?q=${qEscaped}`);
  },

  // Action Items
  async getActionItems(meetingId: string): Promise<ActionItem[]> {
    return fetcher<ActionItem[]>(`/meetings/${meetingId}/action-items`);
  },

  async createActionItem(meetingId: string, payload: CreateActionItemPayload): Promise<ActionItem> {
    return fetcher<ActionItem>(`/meetings/${meetingId}/action-items`, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async updateActionItem(id: string, payload: UpdateActionItemPayload): Promise<ActionItem> {
    return fetcher<ActionItem>(`/action-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  async patchActionItemStatus(id: string, status: string): Promise<ActionItem> {
    return fetcher<ActionItem>(`/action-items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
  },

  async deleteActionItem(id: string): Promise<{ id: string }> {
    return fetcher<{ id: string }>(`/action-items/${id}`, {
      method: 'DELETE'
    });
  },

  // Summary & Topics
  async getSummary(meetingId: string): Promise<Summary> {
    return fetcher<Summary>(`/meetings/${meetingId}/summary`);
  },

  async generateSummary(meetingId: string): Promise<Summary> {
    return fetcher<Summary>(`/meetings/${meetingId}/summary/generate`, {
      method: 'POST'
    });
  },

  async getTopics(meetingId: string): Promise<Topic[]> {
    return fetcher<Topic[]>(`/meetings/${meetingId}/topics`);
  },

  // Global Search & AI QA
  async globalSearch(q: string): Promise<{ meetings: any[]; transcript_segments: any[] }> {
    return fetcher<{ meetings: any[]; transcript_segments: any[] }>(`/search?q=${encodeURIComponent(q)}`);
  },

  async askAI(meetingId: string, question: string): Promise<{ question: string; answer: string }> {
    return fetcher<{ question: string; answer: string }>(`/meetings/${meetingId}/ask-ai`, {
      method: 'POST',
      body: JSON.stringify({ question })
    });
  }
};
