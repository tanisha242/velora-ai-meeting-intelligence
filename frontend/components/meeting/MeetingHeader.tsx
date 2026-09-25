'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Download,
  Edit,
  Trash2,
  Share2,
  UserCheck
} from 'lucide-react';
import { MeetingDetail } from '@/types';
import { Modal } from '@/components/common/Modal';
import { api } from '@/lib/api';
import { useToast } from '@/components/common/Toast';

interface MeetingHeaderProps {
  meeting: MeetingDetail;
  onUpdate: () => void;
}

export const MeetingHeader: React.FC<MeetingHeaderProps> = ({ meeting, onUpdate }) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const [editTitle, setEditTitle] = useState(meeting.title);
  const [editDescription, setEditDescription] = useState(meeting.description || '');

  const [loading, setLoading] = useState(false);

  const formattedDate = new Date(meeting.date).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const minutes = Math.round(meeting.duration_seconds / 60);

  const handleDelete = async () => {
    setLoading(true);
    try {
      await api.deleteMeeting(meeting.id);
      showToast('Meeting deleted successfully', 'info');
      router.push('/meetings');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete meeting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateMeeting(meeting.id, {
        title: editTitle.trim(),
        description: editDescription.trim()
      });
      showToast('Meeting updated', 'success');
      setEditModalOpen(false);
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to update meeting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const summaryText = meeting.summary?.overview || '';
    const takeaways = (meeting.summary?.key_takeaways || []).map((t) => `• ${t}`).join('\n');
    const decisions = (meeting.summary?.decisions || []).map((d) => `• ${d}`).join('\n');
    const actionItems = meeting.action_items
      .map((ai) => `[${ai.status.toUpperCase()}] ${ai.title} (Assigned: ${ai.assignee || 'Unassigned'})`)
      .join('\n');

    const transcriptText = meeting.transcript_segments
      .map((s) => `[${Math.floor(s.start_time / 60)}:${Math.floor(s.start_time % 60).toString().padStart(2, '0')}] ${s.speaker_name}: ${s.text}`)
      .join('\n');

    const markdownContent = `# ${meeting.title}
Date: ${formattedDate}
Duration: ${minutes} minutes

## Executive Summary
${summaryText}

### Key Takeaways
${takeaways}

### Decisions
${decisions}

## Action Items
${actionItems}

## Full Transcript
${transcriptText}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_notes.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported meeting notes as Markdown', 'success');
  };

  return (
    <>
      <div className="bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B] rounded-2xl p-6 md:p-7 space-y-4 shadow-xs">
        {/* Navigation & Actions Row */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#6F6A62] dark:text-[#B7B0A5] hover:text-[#6F4B3E] dark:hover:text-[#C59A83] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Meetings Library
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1EEE7] dark:bg-[#2A2722] hover:bg-[#EAE6DD] text-[#171717] dark:text-[#F4F0E8] text-xs font-semibold border border-[#E3DED4] dark:border-[#36322B] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#6F4B3E] dark:text-[#C59A83]" /> Export Notes
            </button>
            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F1EEE7] dark:bg-[#2A2722] hover:bg-[#EAE6DD] text-[#171717] dark:text-[#F4F0E8] text-xs font-semibold border border-[#E3DED4] dark:border-[#36322B] transition-colors"
            >
              <Edit className="w-3.5 h-3.5 text-[#A88972]" /> Edit
            </button>
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#A65A54]/10 hover:bg-[#A65A54]/20 text-[#A65A54] dark:text-[#C57E78] text-xs font-semibold border border-[#A65A54]/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>

        {/* Title & Metadata */}
        <div>
          <h1 className="font-serif-display text-2xl md:text-3xl font-bold text-[#171717] dark:text-[#F4F0E8] mb-2" style={{ fontFamily: 'var(--font-cormorant), Georgia, serif' }}>
            {meeting.title}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#6F6A62] dark:text-[#B7B0A5]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#969087]" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#969087]" />
              <span>{minutes} minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#969087]" />
              <div className="flex flex-wrap items-center gap-1.5">
                {meeting.participants.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F1EEE7] dark:bg-[#2A2722] text-[#171717] dark:text-[#F4F0E8] text-xs font-semibold border border-[#E3DED4] dark:border-[#36322B]"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal for Delete */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Meeting Workspace?"
        maxWidth="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300">
            Are you sure you want to delete <span className="font-semibold text-white">&quot;{meeting.title}&quot;</span>?
          </p>
          <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900/40 p-3 rounded-xl">
            Warning: All associated transcript segments, AI summaries, chapter topics, and action items will be permanently deleted.
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <button
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium transition-colors"
            >
              {loading ? 'Deleting...' : 'Delete Meeting'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Meeting Metadata"
        maxWidth="md"
      >
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={3}
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 text-sm"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-slate-200 text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
