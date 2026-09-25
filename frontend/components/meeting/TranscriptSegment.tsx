'use client';

import React from 'react';
import { Play } from 'lucide-react';
import { TranscriptSegment as TranscriptSegmentType } from '@/types';

interface TranscriptSegmentProps {
  segment: TranscriptSegmentType;
  isActive: boolean;
  searchQuery: string;
  isMatchedSearch: boolean;
  onSelect: (startTime: number) => void;
  segmentRef?: (el: HTMLDivElement | null) => void;
}

export const TranscriptSegment: React.FC<TranscriptSegmentProps> = ({
  segment,
  isActive,
  searchQuery,
  isMatchedSearch,
  onSelect,
  segmentRef
}) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Speaker tag styling with warm neutral tones
  const speakerColors: Record<string, string> = {
    'Sarah Connor': 'text-[#6F4B3E] bg-[#6F4B3E]/10 border-[#6F4B3E]/20',
    'Alex Mercer': 'text-[#55745C] bg-[#55745C]/10 border-[#55745C]/20',
    'John Doe': 'text-[#A17A43] bg-[#A17A43]/10 border-[#A17A43]/20',
    'Priya Sharma': 'text-[#A88972] bg-[#A88972]/10 border-[#A88972]/20'
  };

  const badgeStyle = speakerColors[segment.speaker_name] || 'text-[#6F4B3E] bg-[#6F4B3E]/10 border-[#6F4B3E]/20';

  // Highlight search keyword matches in text
  const renderHighlightedText = () => {
    if (!searchQuery || !searchQuery.trim()) return segment.text;

    const query = searchQuery.trim();
    const parts = segment.text.split(new RegExp(`(${query})`, 'gi'));

    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark
          key={index}
          className="bg-[#A88972]/25 text-[#6F4B3E] px-1 py-0.5 rounded font-semibold border border-[#6F4B3E]/30"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div
      ref={segmentRef}
      onClick={() => onSelect(segment.start_time)}
      className={`group relative p-4 rounded-xl transition-all duration-200 cursor-pointer border ${
        isActive
          ? 'bg-[#F1EEE7] border-l-4 border-l-[#6F4B3E] border-[#E3DED4] shadow-sm'
          : isMatchedSearch
          ? 'bg-[#A88972]/10 border-[#A88972]/30'
          : 'bg-[#FFFEFB] border-[#E3DED4]/70 hover:bg-[#F7F5F0] hover:border-[#E3DED4]'
      }`}
    >
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border font-sans-ui uppercase tracking-wider ${badgeStyle}`}>
            {segment.speaker_name}
          </span>

          <span className="text-xs font-mono text-[#969087] group-hover:text-[#6F6A62] transition-colors">
            {formatTime(segment.start_time)} – {formatTime(segment.end_time)}
          </span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(segment.start_time);
          }}
          className={`flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md transition-all ${
            isActive
              ? 'bg-[#6F4B3E] text-white'
              : 'text-[#969087] group-hover:text-[#6F4B3E] group-hover:bg-[#F1EEE7]'
          }`}
        >
          <Play className="w-3 h-3 fill-current" />
          <span>{isActive ? 'Playing' : 'Seek'}</span>
        </button>
      </div>

      <p className="text-xs text-[#171717] leading-relaxed font-sans-ui">
        {renderHighlightedText()}
      </p>
    </div>
  );
};
