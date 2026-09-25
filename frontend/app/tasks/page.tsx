'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CheckSquare, Square, CheckCircle2, Video, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { MeetingSummaryListItem, ActionItem } from '@/types';
import { Skeleton } from '@/components/common/Skeleton';
import { useToast } from '@/components/common/Toast';

interface AggregatedActionItem extends ActionItem {
  meetingTitle: string;
}

export default function TasksPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<AggregatedActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const fetchAllTasks = async () => {
    setLoading(true);
    try {
      const meetings: MeetingSummaryListItem[] = await api.getMeetings();
      const allAggregated: AggregatedActionItem[] = [];

      for (const m of meetings) {
        const fullMeeting = await api.getMeeting(m.id);
        if (fullMeeting.action_items) {
          fullMeeting.action_items.forEach((ai) => {
            allAggregated.push({
              ...ai,
              meetingTitle: m.title
            });
          });
        }
      }

      setItems(allAggregated);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTasks();
  }, []);

  const handleToggle = async (item: AggregatedActionItem) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.patchActionItemStatus(item.id, nextStatus);
      showToast(nextStatus === 'completed' ? 'Task completed' : 'Task reopened', 'success');
      fetchAllTasks();
    } catch (err: any) {
      showToast('Failed to update status', 'error');
    }
  };

  const filteredItems = items.filter((i) => {
    if (statusFilter === 'pending') return i.status === 'pending' || i.status === 'in_progress';
    if (statusFilter === 'completed') return i.status === 'completed';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[#FFFEFB] border border-[#E3DED4] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <CheckSquare className="w-5 h-5 text-[#55745C]" />
            <h1 className="text-2xl font-bold text-[#171717] font-serif-display tracking-tight">Workspace Tasks</h1>
          </div>
          <p className="text-xs text-[#6F6A62] font-sans-ui">
            Consolidated action items extracted from all meetings across your organization.
          </p>
        </div>

        <div className="flex bg-[#F7F5F0] p-1 rounded-xl border border-[#E3DED4] text-xs shrink-0 font-sans-ui">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'all' ? 'bg-[#6F4B3E] text-white shadow-sm' : 'text-[#6F6A62] hover:text-[#171717]'
            }`}
          >
            All ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'pending' ? 'bg-[#6F4B3E] text-white shadow-sm' : 'text-[#6F6A62] hover:text-[#171717]'
            }`}
          >
            Pending ({items.filter((i) => i.status !== 'completed').length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              statusFilter === 'completed' ? 'bg-[#6F4B3E] text-white shadow-sm' : 'text-[#6F6A62] hover:text-[#171717]'
            }`}
          >
            Completed ({items.filter((i) => i.status === 'completed').length})
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl shadow-sm">
          <CheckSquare className="w-8 h-8 text-[#969087] mx-auto mb-2" />
          <p className="text-xs text-[#6F6A62] font-sans-ui">No action items found for this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const isDone = item.status === 'completed';

            return (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] hover:border-[#6F4B3E]/30 flex items-center justify-between gap-4 transition-all shadow-sm font-sans-ui"
              >
                <div className="flex items-center gap-3.5 flex-1 min-w-0">
                  <button onClick={() => handleToggle(item)} className="text-[#969087] hover:text-[#55745C] transition-colors">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-[#55745C] fill-[#55745C]/20" />
                    ) : (
                      <Square className="w-5 h-5 text-[#969087]" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold text-[#171717] ${isDone ? 'line-through text-[#969087]' : ''}`}>
                      {item.title}
                    </p>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-[#969087]">
                      <span className="flex items-center gap-1 text-[#6F4B3E] font-medium">
                        <Video className="w-3 h-3" /> {item.meetingTitle}
                      </span>
                      {item.assignee && <span>Assigned to: {item.assignee}</span>}
                      {item.due_date && <span>Due: {item.due_date}</span>}
                    </div>
                  </div>
                </div>

                <Link
                  href={`/meetings/${item.meeting_id}`}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#6F4B3E] hover:text-[#5C3D32]"
                >
                  View Meeting <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
