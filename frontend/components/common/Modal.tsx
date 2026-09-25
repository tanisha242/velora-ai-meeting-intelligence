'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'lg'
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`w-full ${widthClasses} bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] transition-all font-sans-ui`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E3DED4] bg-[#F7F5F0]/60">
          <h3 className="text-lg font-semibold text-[#171717] font-serif-display tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#969087] hover:text-[#171717] hover:bg-[#E3DED4]/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 velora-scrollbar">{children}</div>
      </div>
    </div>
  );
};
