'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Video } from 'lucide-react';
import { api } from '@/lib/api';
import { MeetingSummaryListItem } from '@/types';
import { MeetingCard } from '@/components/meetings/MeetingCard';
import { MeetingFilters, DateFilterOption } from '@/components/meetings/MeetingFilters';
import { MeetingCardSkeleton } from '@/components/common/Skeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { CreateMeetingModal } from '@/components/meetings/CreateMeetingModal';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<MeetingSummaryListItem[]>([]);
  const [allWorkspaceParticipants, setAllWorkspaceParticipants] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search, Participant, Date & Sort Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [participantFilter, setParticipantFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilterOption>('all');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [appliedCustomFrom, setAppliedCustomFrom] = useState('');
  const [appliedCustomTo, setAppliedCustomTo] = useState('');
  const [sortBy, setSortBy] = useState('date_desc');

  const [createModalOpen, setCreateModalOpen] = useState(false);

  // Fetch all unique participants across the complete workspace dataset
  const fetchWorkspaceParticipants = async () => {
    try {
      const allMeetings = await api.getMeetings();
      const set = new Set<string>();
      allMeetings.forEach((m) => {
        m.participants.forEach((p) => set.add(p.name));
      });
      setAllWorkspaceParticipants(Array.from(set));
    } catch (err) {
      console.error('Failed to load workspace participants:', err);
    }
  };

  useEffect(() => {
    fetchWorkspaceParticipants();
  }, []);

  const fetchMeetings = async () => {
    setLoading(true);
    setError(null);

    let date_from: string | undefined = undefined;
    let date_to: string | undefined = undefined;

    const now = new Date();

    if (dateFilter === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      date_from = start.toISOString();
      date_to = end.toISOString();
    } else if (dateFilter === 'last_7_days') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      date_from = start.toISOString();
      date_to = end.toISOString();
    } else if (dateFilter === 'last_30_days') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29, 0, 0, 0, 0);
      const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      date_from = start.toISOString();
      date_to = end.toISOString();
    } else if (dateFilter === 'custom') {
      if (appliedCustomFrom) {
        const [y, m, d] = appliedCustomFrom.split('-').map(Number);
        const start = new Date(y, m - 1, d, 0, 0, 0, 0);
        date_from = start.toISOString();
      }
      if (appliedCustomTo) {
        const [y, m, d] = appliedCustomTo.split('-').map(Number);
        const end = new Date(y, m - 1, d, 23, 59, 59, 999);
        date_to = end.toISOString();
      }
    }

    try {
      const data = await api.getMeetings({
        q: searchQuery,
        participant: participantFilter,
        date_from,
        date_to,
        sort_by: sortBy
      });
      setMeetings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [searchQuery, participantFilter, dateFilter, appliedCustomFrom, appliedCustomTo, sortBy]);

  const handleApplyCustomDate = () => {
    setAppliedCustomFrom(customFrom);
    setAppliedCustomTo(customTo);
  };

  const handleClearCustomDate = () => {
    setCustomFrom('');
    setCustomTo('');
    setAppliedCustomFrom('');
    setAppliedCustomTo('');
    setDateFilter('all');
  };

  const handleMeetingCreated = () => {
    fetchMeetings();
    fetchWorkspaceParticipants();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <Video className="w-5 h-5 text-[#6F4B3E] dark:text-[#C59A83]" />
            <h1 className="font-serif-display text-2xl md:text-3xl font-bold text-[#171717] dark:text-[#F4F0E8] tracking-tight" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
              Meetings
            </h1>
          </div>
          <p className="text-xs text-[#6F6A62] dark:text-[#B7B0A5]">
            Your conversations, organized and easy to revisit.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#6F4B3E] hover:bg-[#5A3C31] text-white font-semibold text-xs transition-all shadow-xs shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Meeting</span>
        </button>
      </div>

      {/* Filter Bar */}
      <MeetingFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        participantFilter={participantFilter}
        setParticipantFilter={setParticipantFilter}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customFrom={customFrom}
        setCustomFrom={setCustomFrom}
        customTo={customTo}
        setCustomTo={setCustomTo}
        onApplyCustomDate={handleApplyCustomDate}
        onClearCustomDate={handleClearCustomDate}
        sortBy={sortBy}
        setSortBy={setSortBy}
        availableParticipants={allWorkspaceParticipants}
      />

      {/* Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <MeetingCardSkeleton />
          <MeetingCardSkeleton />
          <MeetingCardSkeleton />
        </div>
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={fetchMeetings}
        />
      ) : meetings.length === 0 ? (
        <EmptyState
          title={searchQuery || dateFilter !== 'all' ? 'No matching meetings found' : 'No meetings in workspace'}
          description={
            searchQuery || dateFilter !== 'all'
              ? 'Try adjusting your search query, clearing date range, or resetting participant filters.'
              : 'Create your first meeting workspace or ingest sample seeded meetings.'
          }
          onAction={() => setCreateModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {meetings.map((meeting) => (
            <MeetingCard key={meeting.id} meeting={meeting} />
          ))}
        </div>
      )}

      {/* Create Modal */}
      <CreateMeetingModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onMeetingCreated={handleMeetingCreated}
      />
    </div>
  );
}
