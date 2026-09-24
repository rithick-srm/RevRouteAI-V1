import React from 'react';
import { Truck, LogOut, Fuel, Wrench, History, LayoutDashboard, Shield } from 'lucide-react';

export default function DriverHeader({ currentUser, driverPage, setDriverPage, onLogout, onSwitchPortal }) {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'fuel', label: 'Add Fuel', icon: Fuel },
    { id: 'repair', label: 'Report Repair', icon: Wrench },
    { id: 'history', label: 'My Submissions', icon: History },
  ];

  const assignedTruck = currentUser?.assigned_vehicle_id || 'TRK-101';

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-30 shadow-md">
      {/* Top Bar */}
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-xs shadow-xs shrink-0">
            RR
          </div>
          <div>
            <h1 className="font-bold text-white text-sm sm:text-base tracking-tight leading-tight">RevRoute AI</h1>
            <span className="text-[10px] text-teal-400 font-semibold tracking-wider uppercase">Driver Portal</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Assigned Truck Badge */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs text-slate-200">
            <Truck size={14} className="text-teal-400" />
            <span className="font-bold text-white font-mono text-[11px] sm:text-xs">{assignedTruck}</span>
          </div>

          <button
            onClick={onSwitchPortal}
            className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] sm:text-[11px] font-semibold rounded-lg border border-slate-700 transition-colors flex items-center gap-1"
            title="Switch to Management Portal"
          >
            <Shield size={12} /> <span className="hidden xs:inline">Portal Switcher</span><span className="xs:hidden">Admin</span>
          </button>

          <button
            onClick={onLogout}
            className="p-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 rounded-lg border border-rose-500/30 transition-colors shrink-0"
            title="Log Out"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Driver Mobile Nav Tabs */}
      <nav className="max-w-4xl mx-auto px-2 flex justify-around bg-slate-900/90 text-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = driverPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setDriverPage(item.id)}
              className={`flex-1 py-2.5 flex flex-col items-center gap-1 font-semibold border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-slate-800/40'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={16} />
              <span className="text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </header>
  );
}
