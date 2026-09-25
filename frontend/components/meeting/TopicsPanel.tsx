'use client';

import React from 'react';
import { Bookmark, Play } from 'lucide-react';
import { Topic } from '@/types';

interface TopicsPanelProps {
  topics: Topic[];
  onSeek: (time: number) => void;
}

export const TopicsPanel: React.FC<TopicsPanelProps> = ({ topics, onSeek }) => {
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!topics || topics.length === 0) {
    return (
      <div className="p-8 text-center bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl shadow-sm">
        <Bookmark className="w-8 h-8 text-[#969087] mx-auto mb-2" />
        <h3 className="text-sm font-medium text-[#6F6A62] font-sans-ui">No Chapters or Topics Available</h3>
      </div>
    );
  }

  return (
    <div className="bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 pb-3 border-b border-[#E3DED4]">
        <span className="text-base font-bold text-[#635BFF]">✦</span>
        <h2 className="text-base font-semibold text-[#171717] font-serif-display">✦ CONVERSATION THEMES</h2>
      </div>

      <div className="space-y-3">
        {topics.map((topic, idx) => (
          <div
            key={topic.id}
            onClick={() => onSeek(topic.start_time)}
            className="group p-4 rounded-xl bg-[#FFFEFB] border border-[#E3DED4]/80 hover:border-[#635BFF]/40 hover:bg-[#EEECFF]/40 transition-all cursor-pointer flex items-start justify-between gap-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-xs font-mono font-semibold text-[#635BFF] bg-[#635BFF]/10 px-2 py-1 rounded-md shrink-0">
                {(idx + 1).toString().padStart(2, '0')}
              </span>
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <h3 className="text-xs font-semibold text-[#171717] group-hover:text-[#6F4B3E] transition-colors font-sans-ui">
                    {topic.title}
                  </h3>
                  <span className="text-[11px] font-mono text-[#969087]">
                    {formatTime(topic.start_time)} — {formatTime(topic.end_time)}
                  </span>
                </div>
                {topic.description && (
                  <p className="text-xs text-[#6F6A62] leading-relaxed font-sans-ui">
                    {topic.description}
                  </p>
                )}
              </div>
            </div>

            <button className="shrink-0 p-1.5 rounded-lg bg-[#F1EEE7] group-hover:bg-[#6F4B3E] text-[#6F6A62] group-hover:text-white transition-all">
              <Play className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
