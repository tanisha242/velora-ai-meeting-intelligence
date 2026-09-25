'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, ChevronUp, ChevronDown, Filter, MessageSquareText } from 'lucide-react';
import { TranscriptSegment as TranscriptSegmentType } from '@/types';
import { TranscriptSegment } from './TranscriptSegment';

interface TranscriptPanelProps {
  segments: TranscriptSegmentType[];
  currentTime: number;
  onSeek: (time: number) => void;
}

export const TranscriptPanel: React.FC<TranscriptPanelProps> = ({
  segments,
  currentTime,
  onSeek
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [speakerFilter, setSpeakerFilter] = useState('');
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);

  const segmentRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Extract unique speaker list
  const availableSpeakers = useMemo(() => {
    return Array.from(new Set(segments.map((s) => s.speaker_name)));
  }, [segments]);

  // Determine active segment index based on currentTime
  const activeSegmentId = useMemo(() => {
    if (!segments || segments.length === 0) return null;
    const active = segments.find(
      (s) => currentTime >= s.start_time && currentTime < s.end_time
    );
    if (active) return active.id;
    // Fallback: find closest preceding segment
    const pastSegments = segments.filter((s) => s.start_time <= currentTime);
    if (pastSegments.length > 0) return pastSegments[pastSegments.length - 1].id;
    return segments[0].id;
  }, [segments, currentTime]);

  // Calculate search matches
  const matchingSegmentIds = useMemo(() => {
    if (!searchQuery || !searchQuery.trim()) return [];
    const q = searchQuery.trim().toLowerCase();
    return segments
      .filter((s) => s.text.toLowerCase().includes(q) || s.speaker_name.toLowerCase().includes(q))
      .map((s) => s.id);
  }, [segments, searchQuery]);

  // Auto-scroll active segment into view when currentTime changes
  useEffect(() => {
    if (activeSegmentId && segmentRefs.current[activeSegmentId]) {
      segmentRefs.current[activeSegmentId]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }
  }, [activeSegmentId]);

  // Navigate between search matches
  const handleNextMatch = () => {
    if (matchingSegmentIds.length === 0) return;
    const nextIdx = (activeMatchIndex + 1) % matchingSegmentIds.length;
    setActiveMatchIndex(nextIdx);
    const targetId = matchingSegmentIds[nextIdx];
    if (targetId && segmentRefs.current[targetId]) {
      segmentRefs.current[targetId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handlePrevMatch = () => {
    if (matchingSegmentIds.length === 0) return;
    const prevIdx = (activeMatchIndex - 1 + matchingSegmentIds.length) % matchingSegmentIds.length;
    setActiveMatchIndex(prevIdx);
    const targetId = matchingSegmentIds[prevIdx];
    if (targetId && segmentRefs.current[targetId]) {
      segmentRefs.current[targetId]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const filteredSegments = useMemo(() => {
    if (!speakerFilter) return segments;
    return segments.filter((s) => s.speaker_name === speakerFilter);
  }, [segments, speakerFilter]);

  return (
    <div className="flex flex-col h-full bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl overflow-hidden shadow-sm">
      {/* Panel Header & Search Controls */}
      <div className="p-4 border-b border-[#E3DED4] bg-[#F7F5F0]/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-4 h-4 text-[#6F4B3E]" />
            <h2 className="text-sm font-semibold tracking-tight text-[#171717] font-serif-display">Verified Transcript</h2>
          </div>
          <span className="text-xs text-[#969087] font-mono">
            {segments.length} dialogue block(s)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-[#969087] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setActiveMatchIndex(0);
              }}
              placeholder="Search transcript..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] placeholder-[#969087] focus:outline-none focus:border-[#6F4B3E] focus:ring-1 focus:ring-[#6F4B3E] text-xs transition-all"
            />
          </div>

          {/* Speaker Filter */}
          <select
            value={speakerFilter}
            onChange={(e) => setSpeakerFilter(e.target.value)}
            className="bg-[#FFFEFB] border border-[#E3DED4] text-[#6F6A62] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#6F4B3E] focus:ring-1 focus:ring-[#6F4B3E]"
          >
            <option value="">All Speakers</option>
            {availableSpeakers.map((spk) => (
              <option key={spk} value={spk}>
                {spk}
              </option>
            ))}
          </select>
        </div>

        {/* Search Match Controls */}
        {searchQuery.trim() !== '' && (
          <div className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-[#6F4B3E]/10 border border-[#6F4B3E]/20 text-xs text-[#6F4B3E]">
            <span className="font-medium">
              {matchingSegmentIds.length > 0
                ? `Match ${activeMatchIndex + 1} of ${matchingSegmentIds.length}`
                : 'No matches found'}
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMatch}
                disabled={matchingSegmentIds.length === 0}
                className="p-1 rounded hover:bg-[#6F4B3E]/20 disabled:opacity-30 transition-colors"
                title="Previous match"
              >
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleNextMatch}
                disabled={matchingSegmentIds.length === 0}
                className="p-1 rounded hover:bg-[#6F4B3E]/20 disabled:opacity-30 transition-colors"
                title="Next match"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transcript Segments Scrollable Container */}
      <div ref={panelRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[600px] velora-scrollbar">
        {filteredSegments.length === 0 ? (
          <p className="text-xs text-[#969087] text-center py-10 font-sans-ui">No transcript segments match the filter.</p>
        ) : (
          filteredSegments.map((segment) => (
            <TranscriptSegment
              key={segment.id}
              segment={segment}
              isActive={segment.id === activeSegmentId}
              searchQuery={searchQuery}
              isMatchedSearch={matchingSegmentIds.includes(segment.id)}
              onSelect={onSeek}
              segmentRef={(el) => {
                segmentRefs.current[segment.id] = el;
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
