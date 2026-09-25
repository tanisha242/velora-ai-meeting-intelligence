'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileText, Upload, Sparkles, Plus, X } from 'lucide-react';
import { Modal } from '@/components/common/Modal';
import { useToast } from '@/components/common/Toast';
import { api } from '@/lib/api';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMeetingCreated?: () => void;
}

export const CreateMeetingModal: React.FC<CreateMeetingModalProps> = ({
  isOpen,
  onClose,
  onMeetingCreated
}) => {
  const router = useRouter();
  const { showToast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [participantInput, setParticipantInput] = useState('');
  const [participants, setParticipants] = useState<string[]>(['Sarah Connor', 'Alex Mercer']);

  const [tab, setTab] = useState<'paste' | 'upload'>('paste');
  const [transcriptText, setTranscriptText] = useState('');
  const [transcriptFormat, setTranscriptFormat] = useState<'txt' | 'vtt' | 'json'>('txt');
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);

  const handleAddParticipant = () => {
    if (participantInput.trim() && !participants.includes(participantInput.trim())) {
      setParticipants([...participants, participantInput.trim()]);
      setParticipantInput('');
    }
  };

  const handleRemoveParticipant = (name: string) => {
    setParticipants(participants.filter((p) => p !== name));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const name = selectedFile.name.toLowerCase();
      if (name.endsWith('.vtt')) setTranscriptFormat('vtt');
      else if (name.endsWith('.json')) setTranscriptFormat('json');
      else setTranscriptFormat('txt');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Please enter a meeting title', 'error');
      return;
    }

    setLoading(true);

    try {
      let finalTranscriptText = transcriptText;

      if (tab === 'upload' && file) {
        finalTranscriptText = await file.text();
      }

      const meeting = await api.createMeeting({
        title: title.trim(),
        description: description.trim(),
        date: new Date(date).toISOString(),
        participants,
        transcript_text: finalTranscriptText,
        transcript_format: transcriptFormat
      });

      showToast('Meeting created successfully!', 'success');
      onClose();
      if (onMeetingCreated) onMeetingCreated();
      router.push(`/meetings/${meeting.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create meeting', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="New Meeting Workspace" maxWidth="xl">
      <form onSubmit={handleSubmit} className="space-y-4 font-sans-ui">
        <div>
          <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
            Meeting Title *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Weekly Product Team Sync"
            className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] placeholder-[#969087] focus:outline-none focus:border-[#6F4B3E] text-xs transition-colors"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
              Date & Time
            </label>
            <input
              type="datetime-local"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] focus:outline-none focus:border-[#6F4B3E] text-xs transition-colors"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief agenda preview"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] placeholder-[#969087] focus:outline-none focus:border-[#6F4B3E] text-xs transition-colors"
            />
          </div>
        </div>

        {/* Participants Selection */}
        <div>
          <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
            Participants
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={participantInput}
              onChange={(e) => setParticipantInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddParticipant();
                }
              }}
              placeholder="Add participant name..."
              className="flex-1 px-3.5 py-2 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] placeholder-[#969087] focus:outline-none focus:border-[#6F4B3E] text-xs"
            />
            <button
              type="button"
              onClick={handleAddParticipant}
              className="px-3 py-2 rounded-xl bg-[#F7F5F0] hover:bg-[#E3DED4] text-[#171717] text-xs font-medium border border-[#E3DED4] transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#6F4B3E]/10 text-[#6F4B3E] border border-[#6F4B3E]/20 text-[11px] font-medium"
              >
                {p}
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(p)}
                  className="hover:text-[#A65A54] transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Transcript Tab Selector */}
        <div className="pt-3 border-t border-[#E3DED4]">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider">
              Transcript Ingestion
            </label>
            <div className="flex bg-[#F7F5F0] p-1 rounded-xl border border-[#E3DED4] text-xs">
              <button
                type="button"
                onClick={() => setTab('paste')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                  tab === 'paste' ? 'bg-[#6F4B3E] text-white shadow-sm' : 'text-[#6F6A62] hover:text-[#171717]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Paste Text
              </button>
              <button
                type="button"
                onClick={() => setTab('upload')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-medium transition-all ${
                  tab === 'upload' ? 'bg-[#6F4B3E] text-white shadow-sm' : 'text-[#6F6A62] hover:text-[#171717]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" /> Upload File
              </button>
            </div>
          </div>

          {tab === 'paste' ? (
            <div className="space-y-2">
              <textarea
                rows={5}
                value={transcriptText}
                onChange={(e) => setTranscriptText(e.target.value)}
                placeholder="[00:00 - 00:15] Sarah: Welcome everyone...&#10;[00:15 - 00:30] Alex: Glad to be here!"
                className="w-full p-3.5 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] placeholder-[#969087] focus:outline-none focus:border-[#6F4B3E] text-xs font-mono velora-scrollbar"
              />
              <div className="flex items-center justify-between text-xs text-[#6F6A62]">
                <span>Format:</span>
                <select
                  value={transcriptFormat}
                  onChange={(e) => setTranscriptFormat(e.target.value as any)}
                  className="bg-[#FFFEFB] border border-[#E3DED4] text-[#6F6A62] rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-[#6F4B3E]"
                >
                  <option value="txt">Standard TXT ([00:00] Speaker: Text)</option>
                  <option value="vtt">WebVTT (.vtt)</option>
                  <option value="json">JSON Array (.json)</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-[#E3DED4] rounded-xl text-center bg-[#F7F5F0]">
              <Upload className="w-7 h-7 text-[#6F4B3E] mx-auto mb-2" />
              <p className="text-xs font-medium text-[#171717]">
                {file ? file.name : 'Upload .txt, .vtt, or .json transcript file'}
              </p>
              <p className="text-[11px] text-[#969087] mt-1 mb-4">Supported formats: Plain Text, WebVTT, JSON array</p>
              <input
                type="file"
                accept=".txt,.vtt,.json"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-block px-4 py-2 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] text-xs font-medium cursor-pointer hover:bg-[#F7F5F0] transition-colors"
              >
                Choose File
              </label>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-3 border-t border-[#E3DED4]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[#6F6A62] hover:text-[#171717] hover:bg-[#F7F5F0] text-xs font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6F4B3E] hover:bg-[#5C3D32] text-white text-xs font-medium transition-all shadow-sm disabled:opacity-50"
          >
            {loading ? (
              <span>Creating...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Create & Generate Notes
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
