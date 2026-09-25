'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { Sparkles, Bookmark, CheckSquare, Bot, MessageSquare } from 'lucide-react';
import { api } from '@/lib/api';
import { MeetingDetail } from '@/types';
import { MeetingHeader } from '@/components/meeting/MeetingHeader';
import { AudioPlayer } from '@/components/meeting/AudioPlayer';
import { TranscriptPanel } from '@/components/meeting/TranscriptPanel';
import { SummaryPanel } from '@/components/meeting/SummaryPanel';
import { TopicsPanel } from '@/components/meeting/TopicsPanel';
import { ActionItemsPanel } from '@/components/meeting/ActionItemsPanel';
import { AskAIPanel } from '@/components/meeting/AskAIPanel';
import { ErrorState } from '@/components/common/ErrorState';
import { Skeleton } from '@/components/common/Skeleton';
import { useToast } from '@/components/common/Toast';

export default function MeetingWorkspacePage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const tabParam = searchParams?.get('tab');
  const { showToast } = useToast();

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Audio Playback & Synchronization State
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Left Panel Active Tab State
  const [activeTab, setActiveTab] = useState<'summary' | 'topics' | 'tasks' | 'ask_ai'>('summary');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  useEffect(() => {
    if (tabParam === 'ask_ai') {
      setActiveTab('ask_ai');
    }
  }, [tabParam]);

  const fetchMeetingDetails = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getMeeting(id);
      setMeeting(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load meeting workspace');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMeetingDetails();
  }, [fetchMeetingDetails]);

  // Audio Seek trigger handler
  const handleSeek = (time: number) => {
    setCurrentTime(time);
    setIsPlaying(true);
  };

  const handleReGenerateSummary = async () => {
    if (!id) return;
    setIsGeneratingSummary(true);
    try {
      await api.generateSummary(id);
      showToast('AI Summary re-generated successfully', 'success');
      fetchMeetingDetails();
    } catch (err: any) {
      showToast(err.message || 'Failed to generate summary', 'error');
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-24 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Skeleton className="lg:col-span-7 h-[500px]" />
          <Skeleton className="lg:col-span-5 h-[500px]" />
        </div>
      </div>
    );
  }

  if (error || !meeting) {
    return (
      <div className="max-w-4xl mx-auto py-12">
        <ErrorState message={error || 'Meeting workspace not found'} onRetry={fetchMeetingDetails} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Workspace Header */}
      <MeetingHeader meeting={meeting} onUpdate={fetchMeetingDetails} />

      {/* Media Player Bar */}
      <AudioPlayer
        currentTime={currentTime}
        duration={meeting.duration_seconds || 300}
        onSeek={handleSeek}
        onTimeUpdate={setCurrentTime}
        isPlaying={isPlaying}
        setIsPlaying={setIsPlaying}
      />

      {/* ✦ AI MEETING OVERVIEW Banner */}
      {meeting.summary?.overview && (
        <div className="p-5 rounded-2xl bg-[#FFFCFD] border border-[#9B5C83]/30 shadow-xs space-y-3 font-sans-ui">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#9B5C83]">✦</span>
              <h2 className="text-xs font-semibold text-[#9B5C83] uppercase tracking-wider">✦ AI MEETING OVERVIEW</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F3E7EE] text-[#9B5C83] border border-[#9B5C83]/20">
                <span>✦</span> {meeting.topics.length} Themes
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#4F7661]/10 text-[#4F7661] border border-[#4F7661]/20">
                ✓ {meeting.action_items.length} Actions
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#9A7440]/10 text-[#9A7440] border border-[#9A7440]/20">
                ✦ {meeting.summary.decisions?.length || 0} Decisions
              </span>
            </div>
          </div>
          <p className="text-xs text-[#211A20] leading-relaxed">
            {meeting.summary.overview}
          </p>
        </div>
      )}

      {/* 2-Panel Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT / PANEL 1 (AI Notes, Summary, Topics, Action Items, Ask AI) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Tab Navigation */}
          <div className="flex p-1 rounded-xl bg-[#FFFCFD] border border-[#E5DDE2] text-xs font-medium overflow-x-auto shadow-xs font-sans-ui">
            <button
              onClick={() => setActiveTab('summary')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
                activeTab === 'summary'
                  ? 'bg-[#9B5C83] text-white shadow-xs font-semibold'
                  : 'text-[#756B73] hover:text-[#211A20] hover:bg-[#F3E7EE]/50'
              }`}
            >
              <span>✦</span> AI Summary
            </button>

            <button
              onClick={() => setActiveTab('topics')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
                activeTab === 'topics'
                  ? 'bg-[#9B5C83] text-white shadow-xs font-semibold'
                  : 'text-[#756B73] hover:text-[#211A20] hover:bg-[#F3E7EE]/50'
              }`}
            >
              <span>✦</span> Themes ({meeting.topics.length})
            </button>

            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
                activeTab === 'tasks'
                  ? 'bg-[#713F5A] text-white shadow-xs font-semibold'
                  : 'text-[#756B73] hover:text-[#211A20] hover:bg-[#F3EEF1]'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" /> Tasks ({meeting.action_items.length})
            </button>

            <button
              onClick={() => setActiveTab('ask_ai')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-all shrink-0 ${
                activeTab === 'ask_ai'
                  ? 'bg-[#9B5C83] text-white shadow-xs font-semibold'
                  : 'text-[#9B5C83] hover:bg-[#F3E7EE]'
              }`}
            >
              <span>✦</span> Ask Velora
            </button>
          </div>

          {/* Active Tab View */}
          {activeTab === 'summary' && (
            <SummaryPanel
              summary={meeting.summary}
              onReGenerate={handleReGenerateSummary}
              isGenerating={isGeneratingSummary}
            />
          )}

          {activeTab === 'topics' && (
            <TopicsPanel topics={meeting.topics} onSeek={handleSeek} />
          )}

          {activeTab === 'tasks' && (
            <ActionItemsPanel
              meetingId={meeting.id}
              actionItems={meeting.action_items}
              onUpdate={fetchMeetingDetails}
            />
          )}

          {activeTab === 'ask_ai' && <AskAIPanel meetingId={meeting.id} />}
        </div>

        {/* RIGHT / PANEL 2 (Interactive Transcript with Audio Sync) */}
        <div className="lg:col-span-6 h-[650px]">
          <TranscriptPanel
            segments={meeting.transcript_segments}
            currentTime={currentTime}
            onSeek={handleSeek}
          />
        </div>
      </div>
    </div>
  );
}
