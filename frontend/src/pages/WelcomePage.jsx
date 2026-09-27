import React from 'react';
import { UserCheck, Truck, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function WelcomePage({ onSelectManager, onSelectDriver }) {
  return (
    <div className="min-h-screen bg-[#0B1B32] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Top Header / Branding Bar */}
      <header className="w-full border-b border-slate-800/80 bg-[#0B1B32]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-lg shadow-lg shadow-blue-600/30 shrink-0">
              RR
            </div>
            <div>
              <span className="font-extrabold text-white text-lg tracking-tight block">REVROUTE AI</span>
              <span className="text-[11px] text-teal-400 font-semibold tracking-wider uppercase block">
                Detect. Analyze. Recover.
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
            <ShieldCheck size={14} className="text-teal-400" />
            <span>AI Fleet Audit Platform</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center justify-center w-full">
        {/* Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/10 border border-blue-500/30 text-blue-400 text-xs font-semibold uppercase tracking-wider">
            <span>Logistics Leakage Detection</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Welcome to RevRoute AI
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed font-normal">
            An AI-assisted logistics platform for monitoring fleet operations, verifying expenses, and identifying financial and operational leakage.
          </p>

          <div className="pt-4 border-t border-slate-800/80 max-w-xs mx-auto">
            <h2 className="text-sm sm:text-base font-semibold text-teal-400 tracking-wide">
              How are you accessing RevRoute AI?
            </h2>
          </div>
        </div>

        {/* Role Selection Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 w-full max-w-4xl">
          {/* MANAGER CARD */}
          <div 
            onClick={onSelectManager}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectManager(); }}
            className="group relative bg-slate-900/90 border border-slate-700/70 hover:border-blue-500/80 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-200 flex items-center justify-center shrink-0">
                <UserCheck size={28} />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Manager
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Manage fleet operations, audits, expenses and revenue recovery.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
                  <span>Executive leakage dashboard & audit engine</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
                  <span>Vehicle baselines & AI Fleet Audit Assistant</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectManager();
                }}
                className="w-full py-3.5 px-5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-all duration-150 group-hover:bg-blue-500"
              >
                <span>Continue as Manager</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/* DRIVER CARD */}
          <div 
            onClick={onSelectDriver}
            tabIndex={0}
            role="button"
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelectDriver(); }}
            className="group relative bg-slate-900/90 border border-slate-700/70 hover:border-teal-500/80 rounded-2xl p-6 sm:p-8 shadow-xl hover:shadow-2xl hover:shadow-teal-900/20 hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <div className="space-y-5">
              <div className="w-14 h-14 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-400 group-hover:bg-teal-500 group-hover:text-slate-950 transition-colors duration-200 flex items-center justify-center shrink-0">
                <Truck size={28} />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white group-hover:text-teal-400 transition-colors">
                  Driver
                </h3>
                <p className="text-sm text-slate-300 mt-2 leading-relaxed">
                  Submit and track fuel, maintenance and vehicle records.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
                  <span>Mobile fuel entry & odometer logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-teal-400 shrink-0" />
                  <span>Maintenance logs & submission history</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDriver();
                }}
                className="w-full py-3.5 px-5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 transition-all duration-150"
              >
                <span>Continue as Driver</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 text-center text-xs text-slate-500">
        <p>RevRoute AI — Intelligent Logistics Financial & Operational Leakage Prevention</p>
      </footer>
    </div>
  );
}
