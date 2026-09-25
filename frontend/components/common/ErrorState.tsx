import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to load workspace data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry
}) => (
  <div className="flex flex-col items-center justify-center p-10 text-center bg-[#FFFEFB] border border-[#A65A54]/30 rounded-2xl shadow-sm font-sans-ui">
    <div className="w-12 h-12 rounded-xl bg-[#A65A54]/10 text-[#A65A54] flex items-center justify-center mb-3">
      <AlertTriangle className="w-6 h-6" />
    </div>
    <h3 className="text-base font-semibold text-[#171717] font-serif-display mb-1">{title}</h3>
    <p className="text-[#6F6A62] max-w-md text-xs mb-5">{message}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#F7F5F0] hover:bg-[#E3DED4] text-[#171717] text-xs font-medium transition-colors border border-[#E3DED4]"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Retry Request
      </button>
    )}
  </div>
);
