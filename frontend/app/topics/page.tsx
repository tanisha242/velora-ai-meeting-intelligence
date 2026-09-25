'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bookmark, Video, ArrowRight, Clock } from 'lucide-react';
import { api } from '@/lib/api';
import { MeetingSummaryListItem, Topic } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';

interface AggregatedTopic extends Topic {
  meetingTitle: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<AggregatedTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAllTopics() {
      setLoading(true);
      try {
        const meetings: MeetingSummaryListItem[] = await api.getMeetings();
        const all: AggregatedTopic[] = [];

        for (const m of meetings) {
          const detail = await api.getMeeting(m.id);
          if (detail.topics) {
            detail.topics.forEach((t) => {
              all.push({
                ...t,
                meetingTitle: m.title
              });
            });
          }
        }

        setTopics(all);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadAllTopics();
  }, []);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-[#FFFEFB] border border-[#E3DED4] shadow-sm space-y-1">
        <div className="flex items-center gap-2.5">
          <span className="text-xl font-bold text-[#635BFF]">✦</span>
          <h1 className="text-2xl font-bold text-[#171717] font-serif-display tracking-tight">Meeting Intelligence</h1>
        </div>
        <p className="text-xs text-[#6F6A62] font-sans-ui">
          Explore the themes Velora identified across your conversations.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : topics.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl shadow-sm font-sans-ui">
          <p className="text-xs text-[#6F6A62]">No topic chapters found in workspace.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topics.map((t) => (
            <Link
              key={t.id}
              href={`/meetings/${t.meeting_id}`}
              className="p-5 rounded-2xl bg-[#FFFEFB] border border-[#E3DED4] hover:border-[#6F4B3E]/40 hover:shadow-md transition-all flex flex-col justify-between group font-sans-ui"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono font-semibold text-[#6F4B3E] bg-[#6F4B3E]/10 px-2.5 py-0.5 rounded border border-[#6F4B3E]/20">
                    {formatTime(t.start_time)} – {formatTime(t.end_time)}
                  </span>
                  <span className="text-xs text-[#969087] flex items-center gap-1">
                    <Video className="w-3 h-3 text-[#969087]" /> {t.meetingTitle}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-[#171717] group-hover:text-[#6F4B3E] transition-colors">
                  {t.title}
                </h3>
                {t.description && <p className="text-xs text-[#6F6A62] line-clamp-2 leading-relaxed">{t.description}</p>}
              </div>

              <div className="pt-4 mt-3 border-t border-[#E3DED4]/80 flex items-center justify-between text-xs font-medium text-[#6F4B3E]">
                <span>Jump to Timestamp</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
