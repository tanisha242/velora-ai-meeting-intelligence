'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, CheckSquare, ArrowRight } from 'lucide-react';
import { MeetingSummaryListItem } from '@/types';

interface MeetingCardProps {
  meeting: MeetingSummaryListItem;
}

export const MeetingCard: React.FC<MeetingCardProps> = ({ meeting }) => {
  const formattedDate = new Date(meeting.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const minutes = Math.round(meeting.duration_seconds / 60);

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] hover:border-[#635BFF]/40 dark:hover:border-[#818CF8]/40 hover:shadow-md transition-all duration-200 font-sans-ui"
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-serif-display text-lg font-bold text-[#171717] dark:text-[#F4F0E8] group-hover:text-[#635BFF] dark:group-hover:text-[#818CF8] transition-colors line-clamp-1" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            {meeting.title}
          </h3>
          <span className="shrink-0 flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F1EEE7] dark:bg-[#2A2722] text-[#6F6A62] dark:text-[#B7B0A5] text-[11px] font-semibold border border-[#E3DED4] dark:border-[#36322B]">
            <Clock className="w-3 h-3 text-[#6F4B3E] dark:text-[#C59A83]" /> {minutes} min
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs text-[#6F6A62] dark:text-[#B7B0A5] mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#969087]" />
            <span className="text-[11px]">{formattedDate}</span>
          </div>

          {meeting.summary_preview && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#635BFF]/10 text-[#635BFF] dark:text-[#818CF8] text-[10px] font-semibold border border-[#635BFF]/20">
              ✦ AI Summary
            </span>
          )}

          {meeting.action_items_count > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#55745C]/10 text-[#55745C] dark:text-[#789C7F] text-[10px] font-semibold border border-[#55745C]/20">
              <CheckSquare className="w-3 h-3" /> {meeting.action_items_count} actions
            </span>
          )}
        </div>

        {meeting.summary_preview && (
          <p className="text-xs text-[#6F6A62] dark:text-[#B7B0A5] line-clamp-2 mb-5 leading-relaxed bg-[#F7F5F0]/60 dark:bg-[#171614]/40 p-2.5 rounded-xl border border-[#E3DED4]/60">
            {meeting.summary_preview}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between pt-3.5 border-t border-[#ECE7DE] dark:border-[#2C2923]">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5 overflow-hidden">
            {meeting.participants.slice(0, 4).map((p, idx) => (
              <img
                key={p.id || idx}
                src={p.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`}
                alt={p.name}
                title={p.name}
                className="inline-block h-6 w-6 rounded-full ring-2 ring-[#FFFEFB] dark:ring-[#211F1B] object-cover bg-[#F1EEE7]"
              />
            ))}
          </div>
          <span className="text-[11px] text-[#6F6A62] dark:text-[#B7B0A5] truncate max-w-[140px]">
            {meeting.participants.map((p) => p.name.split(' ')[0]).join(', ')}
          </span>
        </div>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#635BFF] dark:text-[#818CF8] group-hover:translate-x-1 transition-transform">
          Inspect Intelligence <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
};

