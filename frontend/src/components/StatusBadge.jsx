import React from 'react';

export default function StatusBadge({ status }) {
  const styles = {
    // Verification & General Status
    VERIFIED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
    REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',

    // Alert Status Lifecycle
    DETECTED: 'bg-rose-50 text-rose-700 border-rose-200',
    'UNDER REVIEW': 'bg-amber-50 text-amber-700 border-amber-200',
    'ACTION INITIATED': 'bg-blue-50 text-blue-700 border-blue-200',
    RESOLVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    DISMISSED: 'bg-slate-100 text-slate-600 border-slate-300',

    // Case Status
    OPEN: 'bg-rose-50 text-rose-700 border-rose-200',
    IN_PROGRESS: 'bg-amber-50 text-amber-700 border-amber-200',
    CLOSED: 'bg-slate-100 text-slate-600 border-slate-300',

    // Shipment Status
    Delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'In Transit': 'bg-blue-50 text-blue-700 border-blue-200',
    Scheduled: 'bg-slate-50 text-slate-700 border-slate-200',
    Cancelled: 'bg-rose-50 text-rose-700 border-rose-200'
  };

  const badgeClass = styles[status] || 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border whitespace-nowrap ${badgeClass}`}>
      {status}
    </span>
  );
}
