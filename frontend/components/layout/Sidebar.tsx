'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Video,
  CheckSquare,
  Bookmark,
  Settings,
  ChevronRight,
  X
} from 'lucide-react';
import { VeloraLogo } from '@/components/common/VeloraLogo';
import { api } from '@/lib/api';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const pathname = usePathname();

  const mainNavItems = [
    { label: 'Meetings', href: '/meetings', icon: Video },
    { label: 'Tasks', href: '/tasks', icon: CheckSquare },
    { label: 'Topics', href: '/topics', icon: Bookmark },
  ];

  const managementNavItems = [
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const [firstMeetingId, setFirstMeetingId] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function loadInitialMeeting() {
      try {
        const meetings = await api.getMeetings();
        if (meetings && meetings.length > 0) {
          setFirstMeetingId(meetings[0].id);
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadInitialMeeting();
  }, []);

  const askVeloraHref = pathname.startsWith('/meetings/')
    ? `${pathname.split('?')[0]}?tab=ask_ai`
    : firstMeetingId
    ? `/meetings/${firstMeetingId}?tab=ask_ai`
    : '/meetings';

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-neutral-900/60 backdrop-blur-xs md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-[#FFFCFD] dark:bg-[#211F1B] border-r border-[#E5DDE2] dark:border-[#36322B] flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-[#E5DDE2] dark:border-[#36322B]">
          <Link href="/meetings" className="flex items-center gap-2 group">
            <VeloraLogo size="md" />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden text-[#756B73] hover:text-[#211A20] dark:hover:text-[#F4F0E8]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 py-6 px-4 space-y-6 overflow-y-auto velora-scrollbar">
          <div>
            <div className="px-3 mb-2.5 text-[11px] font-semibold text-[#9A9097] dark:text-[#80786E] uppercase tracking-widest">
              Workspace
            </div>
            <div className="space-y-1">
              {mainNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#713F5A]/10 dark:bg-[#D8C3CF]/15 text-[#713F5A] dark:text-[#D8C3CF] border border-[#713F5A]/20 dark:border-[#D8C3CF]/20 shadow-xs'
                        : 'text-[#756B73] dark:text-[#B7B0A5] hover:text-[#211A20] dark:hover:text-[#F4F0E8] hover:bg-[#F3EEF1]/80 dark:hover:bg-[#2A2722]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#713F5A] dark:text-[#D8C3CF]' : 'text-[#9A9097]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#713F5A] dark:text-[#D8C3CF]" />}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <div className="px-3 mb-2.5 text-[11px] font-semibold text-[#9B5C83] dark:text-[#D8C3CF] uppercase tracking-widest flex items-center gap-1">
              <span>✦</span> Intelligence
            </div>
            <div className="space-y-1">
              <Link
                href={askVeloraHref}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  pathname.includes('/meetings/') && pathname.includes('tab=ask_ai')
                    ? 'bg-[#9B5C83]/15 dark:bg-[#D8C3CF]/15 text-[#9B5C83] dark:text-[#D8C3CF] border border-[#9B5C83]/30 shadow-xs'
                    : 'text-[#9B5C83] dark:text-[#D8C3CF] hover:bg-[#F3E7EE] dark:hover:bg-[#2A2722]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#9B5C83] dark:text-[#D8C3CF]">✦</span>
                  <span>Ask Velora</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#9B5C83]/10 text-[#9B5C83] dark:text-[#D8C3CF]">AI</span>
              </Link>
            </div>
          </div>

          <div>
            <div className="px-3 mb-2.5 text-[11px] font-semibold text-[#9A9097] dark:text-[#80786E] uppercase tracking-widest">
              Management
            </div>
            <div className="space-y-1">
              {managementNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-[#713F5A]/10 dark:bg-[#D8C3CF]/15 text-[#713F5A] dark:text-[#D8C3CF] border border-[#713F5A]/20 dark:border-[#D8C3CF]/20 shadow-xs'
                        : 'text-[#756B73] dark:text-[#B7B0A5] hover:text-[#211A20] dark:hover:text-[#F4F0E8] hover:bg-[#F3EEF1]/80 dark:hover:bg-[#2A2722]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#713F5A] dark:text-[#D8C3CF]' : 'text-[#9A9097]'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#713F5A] dark:text-[#D8C3CF]" />}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Profile Badge */}
        <div className="p-4 border-t border-[#E3DED4] dark:border-[#36322B] bg-[#F7F5F0]/60 dark:bg-[#171614]/60">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#FFFEFB] dark:bg-[#211F1B] border border-[#E3DED4] dark:border-[#36322B]">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah%20Connor"
              alt="Default User"
              className="w-8 h-8 rounded-full bg-[#F1EEE7] ring-1 ring-[#6F4B3E]/30"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#171717] dark:text-[#F4F0E8] truncate">Sarah Connor</p>
              <p className="text-[11px] text-[#6F6A62] dark:text-[#B7B0A5] truncate">Lead Architect</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

