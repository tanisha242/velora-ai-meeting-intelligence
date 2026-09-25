import React from 'react';
import { Plus } from 'lucide-react';
import { VeloraLogo } from '@/components/common/VeloraLogo';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No meetings yet',
  description = 'Your recorded conversations will appear here.',
  actionLabel = 'New Meeting',
  onAction
}) => (
  <div className="flex flex-col items-center justify-center p-12 text-center bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl shadow-sm font-sans-ui">
    <div className="w-14 h-14 rounded-2xl bg-[#6F4B3E]/10 flex items-center justify-center mb-4">
      <VeloraLogo showWordmark={false} size="md" />
    </div>
    <h3 className="text-lg font-semibold text-[#171717] font-serif-display mb-1">{title}</h3>
    <p className="text-[#6F6A62] max-w-md text-xs mb-6 leading-relaxed">{description}</p>
    {onAction && (
      <button
        onClick={onAction}
        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6F4B3E] hover:bg-[#5C3D32] text-white font-medium text-xs transition-all shadow-sm"
      >
        <Plus className="w-3.5 h-3.5" />
        {actionLabel}
      </button>
    )}
  </div>
);
