import React from 'react';
import { Trophy, Search, User } from 'lucide-react';

export default function StitchNavbar({ onSearchClick, activeTab = 'Home' }) {
  return (
    <header className="sticky top-0 z-50 bg-[#faf8ff]/80 dark:bg-[#0b0f19]/80 backdrop-blur-xl border-b border-gray-200/10 dark:border-white/10 px-5 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052ff] to-[#00c6ff] flex items-center justify-center shadow-lg shadow-[#0052ff]/30">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
              Apex <span className="text-[#0052ff]">Athletics</span>
            </h1>
            <span className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">
              {activeTab} • Indoor Ecosystem
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSearchClick}
            className="w-10 h-10 rounded-full bg-gray-100 dark:bg-slate-800/80 hover:bg-gray-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors shadow-sm"
            aria-label="Search Venues"
          >
            <Search className="w-5 h-5" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#0052ff]/10 border border-[#0052ff]/30 flex items-center justify-center text-[#0052ff]">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
}
