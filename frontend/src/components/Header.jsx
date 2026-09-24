import React from 'react';
import { ShieldCheck, Menu } from 'lucide-react';

export default function Header({ pageTitle, subtitle, onToggleSidebar }) {
  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3 sm:py-4 flex items-center justify-between shadow-xs sticky top-0 z-20 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {/* Hamburger Menu Toggle Button for Mobile / Tablet */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
          aria-label="Toggle Navigation Menu"
        >
          <Menu size={20} />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-xl font-bold text-slate-900 tracking-tight truncate">{pageTitle}</h1>
          {subtitle && <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-medium">
          <ShieldCheck size={14} className="text-teal-600" />
          <span>Rule Engine Active</span>
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
            FM
          </div>
          <span className="text-xs sm:text-sm font-medium text-slate-700 hidden md:inline">Fleet Manager</span>
        </div>
      </div>
    </header>
  );
}
