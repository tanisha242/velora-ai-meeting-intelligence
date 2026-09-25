'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Edit,
  User,
  Calendar,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ActionItem } from '@/types';
import { api } from '@/lib/api';
import { useToast } from '@/components/common/Toast';
import { Modal } from '@/components/common/Modal';

interface ActionItemsPanelProps {
  meetingId: string;
  actionItems: ActionItem[];
  onUpdate: () => void;
}

export const ActionItemsPanel: React.FC<ActionItemsPanelProps> = ({
  meetingId,
  actionItems,
  onUpdate
}) => {
  const { showToast } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleStatus = async (item: ActionItem) => {
    const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.patchActionItemStatus(item.id, nextStatus);
      showToast(
        nextStatus === 'completed' ? 'Task marked as completed' : 'Task reopened',
        'success'
      );
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to update task status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteActionItem(id);
      showToast('Action item deleted', 'info');
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task', 'error');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await api.createActionItem(meetingId, {
        title: title.trim(),
        description: description.trim(),
        assignee: assignee.trim(),
        due_date: dueDate.trim(),
        status: 'pending'
      });
      showToast('Action item created', 'success');
      setTitle('');
      setDescription('');
      setAssignee('');
      setDueDate('');
      setCreateModalOpen(false);
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to create task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !title.trim()) return;
    setLoading(true);
    try {
      await api.updateActionItem(editingItem.id, {
        title: title.trim(),
        description: description.trim(),
        assignee: assignee.trim(),
        due_date: dueDate.trim()
      });
      showToast('Action item updated', 'success');
      setEditingItem(null);
      onUpdate();
    } catch (err: any) {
      showToast(err.message || 'Failed to update task', 'error');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (item: ActionItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDescription(item.description || '');
    setAssignee(item.assignee || '');
    setDueDate(item.due_date || '');
  };

  return (
    <>
      <div className="bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl p-6 space-y-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E3DED4]">
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-[#55745C]" />
            <h2 className="text-base font-semibold text-[#171717] font-serif-display">Action Items</h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-[#55745C]/10 text-[#55745C] border border-[#55745C]/20 font-sans-ui">
              {actionItems.filter((i) => i.status === 'completed').length} / {actionItems.length} Done
            </span>
          </div>

          <button
            onClick={() => {
              setTitle('');
              setDescription('');
              setAssignee('');
              setDueDate('');
              setCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#6F4B3E] hover:bg-[#5C3D32] text-white text-xs font-medium transition-all shadow-sm font-sans-ui"
          >
            <Plus className="w-3.5 h-3.5" /> Add Task
          </button>
        </div>

        {actionItems.length === 0 ? (
          <p className="text-xs text-[#969087] text-center py-8 font-sans-ui">No action items recorded for this meeting yet.</p>
        ) : (
          <div className="space-y-3">
            {actionItems.map((item) => {
              const isCompleted = item.status === 'completed';

              return (
                <div
                  key={item.id}
                  className={`group p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isCompleted
                      ? 'bg-[#F7F5F0]/60 border-[#E3DED4] opacity-75'
                      : 'bg-[#FFFEFB] border-[#E3DED4] hover:border-[#6F4B3E]/30'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <button
                      onClick={() => handleToggleStatus(item)}
                      className="mt-0.5 text-[#969087] hover:text-[#55745C] transition-colors"
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-[#55745C] fill-[#55745C]/20" />
                      ) : (
                        <Square className="w-5 h-5 text-[#969087]" />
                      )}
                    </button>

                    <div className="flex-1 min-w-0 font-sans-ui">
                      <p
                        className={`text-xs font-semibold text-[#171717] ${
                          isCompleted ? 'line-through text-[#969087]' : ''
                        }`}
                      >
                        {item.title}
                      </p>

                      {item.description && (
                        <p className="text-xs text-[#6F6A62] mt-1">{item.description}</p>
                      )}

                      <div className="flex flex-wrap items-center gap-4 mt-2.5 text-[11px] text-[#969087]">
                        {item.assignee && (
                          <div className="flex items-center gap-1 text-[#6F6A62]">
                            <User className="w-3.5 h-3.5 text-[#6F4B3E]" />
                            <span>{item.assignee}</span>
                          </div>
                        )}
                        {item.due_date && (
                          <div className="flex items-center gap-1 text-[#969087]">
                            <Calendar className="w-3.5 h-3.5 text-[#969087]" />
                            <span>Due: {item.due_date}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-[#969087] hover:text-[#171717] hover:bg-[#F7F5F0]"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-[#969087] hover:text-[#A65A54] hover:bg-[#F7F5F0]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Action Item Modal */}
      <Modal
        isOpen={createModalOpen || editingItem !== null}
        onClose={() => {
          setCreateModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? 'Edit Action Item' : 'New Action Item'}
        maxWidth="md"
      >
        <form onSubmit={editingItem ? handleEditSubmit : handleCreateSubmit} className="space-y-4 font-sans-ui">
          <div>
            <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
              Task Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Update API specs"
              className="w-full px-3.5 py-2 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] text-xs focus:outline-none focus:border-[#6F4B3E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional details"
              className="w-full p-3 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] text-xs focus:outline-none focus:border-[#6F4B3E]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
                Assignee
              </label>
              <input
                type="text"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] text-xs focus:outline-none focus:border-[#6F4B3E]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
                Due Date
              </label>
              <input
                type="text"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                placeholder="Next Friday"
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFEFB] border border-[#E3DED4] text-[#171717] text-xs focus:outline-none focus:border-[#6F4B3E]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={() => {
                setCreateModalOpen(false);
                setEditingItem(null);
              }}
              className="px-4 py-2 rounded-xl text-[#6F6A62] hover:text-[#171717] text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-xl bg-[#6F4B3E] hover:bg-[#5C3D32] text-white text-xs font-medium transition-colors"
            >
              {loading ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};
