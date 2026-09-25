'use client';

import React, { useState } from 'react';
import { Search, Filter, Calendar, ArrowUpDown, X, Check } from 'lucide-react';

export type DateFilterOption = 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'custom';

interface MeetingFiltersProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  participantFilter: string;
  setParticipantFilter: (p: string) => void;
  dateFilter: DateFilterOption;
  setDateFilter: (d: DateFilterOption) => void;
  customFrom: string;
  setCustomFrom: (d: string) => void;
  customTo: string;
  setCustomTo: (d: string) => void;
  onApplyCustomDate: () => void;
  onClearCustomDate: () => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  availableParticipants: string[];
}

export const MeetingFilters: React.FC<MeetingFiltersProps> = ({
  searchQuery,
  setSearchQuery,
  participantFilter,
  setParticipantFilter,
  dateFilter,
  setDateFilter,
  customFrom,
  setCustomFrom,
  customTo,
  setCustomTo,
  onApplyCustomDate,
  onClearCustomDate,
  sortBy,
  setSortBy,
  availableParticipants
}) => {
  const [showCustomPopover, setShowCustomPopover] = useState(false);

  const handleDateSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as DateFilterOption;
    setDateFilter(val);
    if (val === 'custom') {
      setShowCustomPopover(true);
    } else {
      setShowCustomPopover(false);
    }
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Primary Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#969087] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter meetings by title or description..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] text-[#171717] dark:text-[#F4F0E8] placeholder-[#969087] focus:outline-none focus:ring-2 focus:ring-[#6F4B3E]/30 text-xs font-sans-ui shadow-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Participant Filter */}
          <div className="relative flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-[#969087] absolute left-3 top-3 pointer-events-none" />
            <select
              value={participantFilter}
              onChange={(e) => setParticipantFilter(e.target.value)}
              className="w-full sm:w-auto pl-8 pr-8 py-2.5 rounded-xl bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] text-[#171717] dark:text-[#F4F0E8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6F4B3E]/30 appearance-none cursor-pointer"
            >
              <option value="">All Participants</option>
              {availableParticipants.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <Calendar className="w-3.5 h-3.5 text-[#969087] absolute left-3 top-3 pointer-events-none" />
            <select
              value={dateFilter}
              onChange={handleDateSelectChange}
              className="w-full sm:w-auto pl-8 pr-8 py-2.5 rounded-xl bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] text-[#171717] dark:text-[#F4F0E8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6F4B3E]/30 appearance-none cursor-pointer"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="custom">Custom Range...</option>
            </select>
          </div>

          {/* Sort Selector */}
          <div className="relative flex-1 sm:flex-initial">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#969087] absolute left-3 top-3 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full sm:w-auto pl-8 pr-8 py-2.5 rounded-xl bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] text-[#171717] dark:text-[#F4F0E8] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6F4B3E]/30 appearance-none cursor-pointer"
            >
              <option value="date_desc">Newest First</option>
              <option value="date_asc">Oldest First</option>
              <option value="title_asc">Title A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Custom Date Range Controls */}
      {(dateFilter === 'custom' || showCustomPopover) && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#6F4B3E]/30 dark:border-[#C59A83]/30 shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6F6A62] dark:text-[#B7B0A5] uppercase tracking-wider">From:</span>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#F7F5F0] dark:bg-[#171614] border border-[#E3DED4] dark:border-[#36322B] text-[#171717] dark:text-[#F4F0E8] text-xs focus:outline-none focus:ring-1 focus:ring-[#6F4B3E]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#6F6A62] dark:text-[#B7B0A5] uppercase tracking-wider">To:</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-[#F7F5F0] dark:bg-[#171614] border border-[#E3DED4] dark:border-[#36322B] text-[#171717] dark:text-[#F4F0E8] text-xs focus:outline-none focus:ring-1 focus:ring-[#6F4B3E]"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={onApplyCustomDate}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#6F4B3E] hover:bg-[#5A3C31] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" /> Apply
            </button>
            <button
              onClick={() => {
                onClearCustomDate();
                setShowCustomPopover(false);
              }}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#F1EEE7] dark:bg-[#2A2722] hover:bg-[#EAE6DD] text-[#171717] dark:text-[#F4F0E8] text-xs font-semibold transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Clear Range
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

