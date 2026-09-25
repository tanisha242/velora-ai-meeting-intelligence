'use client';

import React, { useState } from 'react';
import { Search, Plus, Menu, Command, Video, Text } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { api } from '@/lib/api';
import Link from 'next/link';

interface TopbarProps {
  onOpenMobileMenu: () => void;
  onOpenCreateModal: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu, onOpenCreateModal }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ meetings: any[]; transcript_segments: any[] }>({
    meetings: [],
    transcript_segments: []
  });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (q: string) => {
    setQuery(q);
    if (!q.trim() || q.length < 2) {
      setResults({ meetings: [], transcript_segments: [] });
      return;
    }
    setLoading(true);
    try {
      const data = await api.globalSearch(q);
      setResults(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 h-16 bg-[#FFFEFB]/90 dark:bg-[#211F1B]/90 backdrop-blur-md border-b border-[#E3DED4] dark:border-[#36322B] px-4 md:px-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-[#6F6A62] hover:text-[#171717] dark:hover:text-[#F4F0E8] hover:bg-[#F1EEE7] transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Bar Button */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-3 px-4 py-2 rounded-xl bg-[#F1EEE7]/70 dark:bg-[#2A2722]/70 border border-[#E3DED4] dark:border-[#36322B] text-[#6F6A62] dark:text-[#B7B0A5] hover:text-[#171717] dark:hover:text-[#F4F0E8] hover:border-[#6F4B3E]/30 transition-all text-xs w-48 sm:w-64 md:w-80 group"
          >
            <Search className="w-4 h-4 text-[#969087] group-hover:text-[#6F4B3E] dark:group-hover:text-[#C59A83] transition-colors" />
            <span className="truncate flex-1 text-left">Search meetings, transcripts...</span>
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-mono text-[#969087] bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] rounded">
              <Command className="w-3 h-3" /> K
            </kbd>
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6F4B3E] hover:bg-[#5A3C31] text-white font-medium text-xs transition-all shadow-xs active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Meeting</span>
          </button>
        </div>
      </header>

      {/* Global Search Modal */}
      <Modal
        isOpen={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setQuery('');
          setResults({ meetings: [], transcript_segments: [] });
        }}
        title="Global Search"
        maxWidth="xl"
      >
        <div className="space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#969087] absolute left-3.5 top-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by title, participant, or transcript content..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#F7F5F0] dark:bg-[#171614] border border-[#E3DED4] dark:border-[#36322B] text-[#171717] dark:text-[#F4F0E8] placeholder-[#969087] focus:outline-none focus:ring-2 focus:ring-[#6F4B3E]/40 text-xs font-sans-ui"
              autoFocus
            />
          </div>

          {loading && <p className="text-xs text-[#6F6A62] py-4 text-center">Searching workspace...</p>}

          {!loading && query && results.meetings.length === 0 && results.transcript_segments.length === 0 && (
            <p className="text-xs text-[#6F6A62] py-6 text-center">No results found for &quot;{query}&quot;.</p>
          )}

          {results.meetings.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[#969087] uppercase tracking-wider mb-2">Meetings</h4>
              <div className="space-y-2">
                {results.meetings.map((m) => (
                  <Link
                    key={m.id}
                    href={`/meetings/${m.id}`}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#F1EEE7]/50 dark:bg-[#2A2722]/50 hover:bg-[#F1EEE7] border border-[#E3DED4] dark:border-[#36322B] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <Video className="w-4 h-4 text-[#6F4B3E] dark:text-[#C59A83]" />
                      <div>
                        <p className="text-xs font-semibold text-[#171717] dark:text-[#F4F0E8] group-hover:text-[#6F4B3E] dark:group-hover:text-[#C59A83] transition-colors">
                          {m.title}
                        </p>
                        <p className="text-[11px] text-[#6F6A62]">
                          {new Date(m.date).toLocaleDateString()} · {Math.round(m.duration_seconds / 60)} min
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {results.transcript_segments.length > 0 && (
            <div>
              <h4 className="text-[11px] font-semibold text-[#969087] uppercase tracking-wider mb-2">Transcript Matches</h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {results.transcript_segments.map((seg) => (
                  <Link
                    key={seg.id}
                    href={`/meetings/${seg.meeting_id}`}
                    onClick={() => setSearchOpen(false)}
                    className="block p-3 rounded-xl bg-[#F1EEE7]/50 dark:bg-[#2A2722]/50 hover:bg-[#F1EEE7] border border-[#E3DED4] dark:border-[#36322B] transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Text className="w-3.5 h-3.5 text-[#6F4B3E] dark:text-[#C59A83]" />
                      <span className="text-xs font-semibold text-[#6F4B3E] dark:text-[#C59A83]">{seg.speaker_name}</span>
                      <span className="text-[10px] text-[#969087] font-mono">
                        {Math.floor(seg.start_time / 60)}:
                        {Math.floor(seg.start_time % 60).toString().padStart(2, '0')}
                      </span>
                    </div>
                    <p className="text-xs text-[#171717] dark:text-[#F4F0E8] line-clamp-2">{seg.text}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};

