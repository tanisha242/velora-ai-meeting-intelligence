'use client';

import React, { useState } from 'react';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import '@/app/globals.css';
import { ToastProvider } from '@/components/common/Toast';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { CreateMeetingModal } from '@/components/meetings/CreateMeetingModal';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant'
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-manrope'
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <title>VELORA — Refined Meeting Intelligence</title>
        <meta
          name="description"
          content="VELORA is an elegant, intelligent, calm meeting intelligence platform featuring interactive transcripts, AI summaries, and action item tracking."
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${manrope.className} bg-[#F7F5F0] text-[#171717] min-h-screen flex antialiased selection:bg-[#6F4B3E]/15 selection:text-[#6F4B3E]`}>
        <ToastProvider>
          {/* Sidebar Navigation */}
          <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

          {/* Main Layout Container */}
          <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all">
            <Topbar
              onOpenMobileMenu={() => setMobileOpen(true)}
              onOpenCreateModal={() => setCreateModalOpen(true)}
            />

            <main className="flex-1 p-4 md:p-8 overflow-y-auto">
              {children}
            </main>
          </div>

          {/* Create Meeting Global Modal */}
          <CreateMeetingModal
            isOpen={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
          />
        </ToastProvider>
      </body>
    </html>
  );
}

