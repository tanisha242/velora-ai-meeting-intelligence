'use client';

import React from 'react';
import { Sparkles, CheckCircle2, Bookmark, RefreshCw } from 'lucide-react';
import { Summary } from '@/types';

interface SummaryPanelProps {
  summary?: Summary;
  onReGenerate?: () => void;
  isGenerating?: boolean;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  summary,
  onReGenerate,
  isGenerating = false
}) => {
  if (!summary) {
    return (
      <div className="p-8 text-center bg-[#FFFCFD] border border-[#E5DDE2] rounded-2xl shadow-xs font-sans-ui">
        <Sparkles className="w-8 h-8 text-[#9B5C83] mx-auto mb-3" />
        <h3 className="text-base font-semibold text-[#211A20] mb-1 font-serif-display">No Summary Generated</h3>
        <p className="text-xs text-[#756B73] mb-4 font-sans-ui">Generate executive notes from the meeting transcript.</p>
        {onReGenerate && (
          <button
            onClick={onReGenerate}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl bg-[#713F5A] hover:bg-[#4B263B] text-white text-xs font-medium transition-colors"
          >
            {isGenerating ? 'Generating...' : 'Generate AI Summary'}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#FFFCFD] border border-[#E5DDE2] rounded-2xl p-6 space-y-6 shadow-xs font-sans-ui">
      <div className="flex items-center justify-between pb-4 border-b border-[#E5DDE2]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#F3E7EE] text-[#9B5C83] flex items-center justify-center font-bold">
            ✦
          </div>
          <div>
            <h2 className="text-base font-semibold text-[#211A20] font-serif-display">✦ AI SUMMARY</h2>
            <p className="text-xs text-[#9A9097] font-sans-ui">Automated meeting intelligence recap</p>
          </div>
        </div>

        {onReGenerate && (
          <button
            onClick={onReGenerate}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-[#756B73] hover:text-[#9B5C83] hover:bg-[#F3E7EE] transition-colors"
            title="Re-generate Summary"
          >
            <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin text-[#9B5C83]' : ''}`} />
          </button>
        )}
      </div>

      {/* Overview Paragraph */}
      <div>
        <h3 className="text-xs font-semibold text-[#9A9097] uppercase tracking-wider mb-2 font-sans-ui">Overview</h3>
        <p className="text-xs text-[#211A20] leading-relaxed bg-[#F3EEF1] p-4 rounded-xl border border-[#E5DDE2]/80 font-sans-ui">
          {summary.overview}
        </p>
      </div>

      {/* Key Takeaways */}
      {summary.key_takeaways && summary.key_takeaways.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[#9A9097] uppercase tracking-wider mb-3 font-sans-ui">Key Takeaways</h3>
          <ul className="space-y-2">
            {summary.key_takeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-[#211A20] font-sans-ui">
                <CheckCircle2 className="w-4 h-4 text-[#4F7661] shrink-0 mt-0.5" />
                <span className="leading-relaxed">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Decisions Made */}
      {summary.decisions && summary.decisions.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-[#9A9097] uppercase tracking-wider mb-3 font-sans-ui">Decisions Made</h3>
          <div className="space-y-2">
            {summary.decisions.map((decision, idx) => (
              <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F3E7EE] border border-[#9B5C83]/20 text-[#9B5C83] text-xs font-sans-ui">
                <Bookmark className="w-4 h-4 text-[#9B5C83] shrink-0 mt-0.5" />
                <span className="leading-relaxed font-medium">{decision}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
