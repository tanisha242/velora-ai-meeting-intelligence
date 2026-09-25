'use client';

import React, { useState } from 'react';
import { User, Palette, Bell, Link as LinkIcon, Building } from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'appearance' | 'notifications' | 'integrations' | 'workspace'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: LinkIcon },
    { id: 'workspace', label: 'Workspace', icon: Building },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-[#FFFEFB] border border-[#E3DED4] shadow-sm space-y-1">
        <h1 className="text-2xl font-bold text-[#171717] font-serif-display tracking-tight">Workspace Settings</h1>
        <p className="text-xs text-[#6F6A62] font-sans-ui">
          Manage your account profile, theme preferences, and integration settings.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="md:col-span-4 bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl p-2 space-y-1 shadow-sm font-sans-ui">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-[#6F4B3E]/10 text-[#6F4B3E] font-semibold border border-[#6F4B3E]/20'
                    : 'text-[#6F6A62] hover:text-[#171717] hover:bg-[#F7F5F0]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#6F4B3E]' : 'text-[#969087]'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Box */}
        <div className="md:col-span-8 bg-[#FFFEFB] border border-[#E3DED4] rounded-2xl p-6 space-y-6 shadow-sm font-sans-ui">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-[#171717] font-serif-display pb-3 border-b border-[#E3DED4]">User Profile</h2>
              <div className="flex items-center gap-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah%20Connor"
                  alt="Avatar"
                  className="w-14 h-14 rounded-full bg-[#F7F5F0] ring-2 ring-[#6F4B3E]/30"
                />
                <div>
                  <h3 className="text-sm font-semibold text-[#171717]">Sarah Connor</h3>
                  <p className="text-xs text-[#969087]">sarah.connor@example.com</p>
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-[#55745C]/10 text-[#55745C] border border-[#55745C]/20 text-[11px] font-medium">
                    Default Active Account
                  </span>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-[#E3DED4]">
                <div>
                  <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
                    Display Name
                  </label>
                  <input
                    type="text"
                    disabled
                    value="Sarah Connor"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F0] border border-[#E3DED4] text-[#6F6A62] text-xs cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#6F6A62] uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    disabled
                    value="sarah.connor@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#F7F5F0] border border-[#E3DED4] text-[#6F6A62] text-xs cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-10 text-center space-y-3">
              <span className="px-3 py-1 rounded-full bg-[#6F4B3E]/10 text-[#6F4B3E] border border-[#6F4B3E]/20 text-[11px] font-semibold uppercase tracking-wider">
                Coming Soon
              </span>
              <h3 className="text-base font-semibold text-[#171717] font-serif-display">
                {tabs.find((t) => t.id === activeTab)?.label} Settings
              </h3>
              <p className="text-xs text-[#6F6A62] max-w-sm mx-auto leading-relaxed">
                This configuration option is scheduled for future Velora enterprise releases.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
