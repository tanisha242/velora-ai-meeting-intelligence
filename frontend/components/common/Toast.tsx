'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all duration-300 transform translate-y-0 animate-in slide-in-from-bottom-2 font-sans-ui ${
              toast.type === 'success'
                ? 'bg-[#FFFEFB] text-[#55745C] border-[#55745C]/30'
                : toast.type === 'error'
                ? 'bg-[#FFFEFB] text-[#A65A54] border-[#A65A54]/30'
                : 'bg-[#FFFEFB] text-[#6F4B3E] border-[#6F4B3E]/30'
            }`}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#55745C] shrink-0" />}
              {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-[#A65A54] shrink-0" />}
              {toast.type === 'info' && <Info className="w-4 h-4 text-[#6F4B3E] shrink-0" />}
              <span className="text-xs font-medium text-[#171717]">{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-[#969087] hover:text-[#171717] transition-colors p-1 rounded-lg"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
