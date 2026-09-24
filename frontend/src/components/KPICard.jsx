import React from 'react';

export default function KPICard({ title, value, subtext, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    teal: 'bg-teal-50 text-teal-600 border-teal-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    red: 'bg-red-50 text-red-600 border-red-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 md:p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider truncate">{title}</p>
          <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-slate-900 mt-1 tracking-tight truncate">{value}</h3>
          {subtext && <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5 sm:mt-1 truncate">{subtext}</p>}
        </div>
        {Icon && (
          <div className={`p-2 sm:p-2.5 md:p-3 rounded-lg border shrink-0 ${colorMap[color] || colorMap.blue}`}>
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5" />
          </div>
        )}
      </div>
    </div>
  );
}
