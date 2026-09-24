import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Wrench, Play, ArrowRight } from 'lucide-react';

export default function MaintenanceAudit({ setActivePage }) {
  const [logs, setLogs] = useState([]);
  const [selectedRepair, setSelectedRepair] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultsList, setResultsList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lgs, allRes] = await Promise.all([api.getMaintenanceLogs(), api.getAuditResults()]);
      setLogs(lgs);
      const mntAudits = allRes.filter((r) => r.audit_type === 'MAINTENANCE');
      setResultsList(mntAudits);
      if (lgs.length > 0) setSelectedRepair(lgs[0].repair_id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRunAudit = async () => {
    if (!selectedRepair) return;
    try {
      setLoading(true);
      const res = await api.runMaintenanceAudit(selectedRepair);
      setAuditResult(res);
      loadData();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Module 2 — Maintenance Cost Overrun Audit</h2>
        <p className="text-xs text-slate-500">Identifies operational maintenance & repair costs exceeding reference benchmarks, duplicate records, and repeated repair patterns</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Wrench size={18} className="text-teal-600" /> Execute Maintenance Audit Engine
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <select
            value={selectedRepair}
            onChange={(e) => setSelectedRepair(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white font-medium w-full"
          >
            <option value="">Select Maintenance Record to Audit</option>
            {logs.map((l) => (
              <option key={l.repair_id} value={l.repair_id}>
                {l.repair_id} — {l.vehicle_id}: {l.repair_type} (₹{l.total_repair_cost}) [{l.service_center}]
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAudit}
            disabled={loading || !selectedRepair}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:bg-slate-300 text-white font-semibold text-sm rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Play size={16} /> {loading ? 'Auditing...' : 'Run Maintenance Audit'}
          </button>
        </div>

        {auditResult && (
          <div className="mt-4 p-4 sm:p-5 bg-slate-50 border border-teal-200 rounded-xl space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-teal-700 uppercase tracking-wider">Audit Result: {auditResult.audit_id}</span>
              <span className="text-xs text-slate-500">Ref: {auditResult.reference_id}</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white p-4 rounded-lg border border-slate-200 text-center">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Benchmark Cost</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">₹{auditResult.expected_value.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Actual Repair Cost</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">₹{auditResult.actual_value.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Cost Overrun</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">₹{auditResult.variance.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Potential Financial Impact</p>
                <p className="text-base sm:text-lg font-extrabold text-teal-700">₹{auditResult.potential_financial_impact.toLocaleString('en-IN')}</p>
              </div>
            </div>

            <p className="text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              <strong className="text-slate-900">Explanation:</strong> {auditResult.explanation}
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setActivePage('alerts')}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 flex items-center gap-1.5"
              >
                <span>View Alert & Initiate Review</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto min-w-full block">
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Maintenance Audit Log History</h3>
        </div>
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="px-4 sm:px-5 py-3.5">Audit ID</th>
              <th className="px-4 sm:px-5 py-3.5">Repair ID</th>
              <th className="px-4 sm:px-5 py-3.5">Benchmark Cost</th>
              <th className="px-4 sm:px-5 py-3.5">Actual Repair Cost</th>
              <th className="px-4 sm:px-5 py-3.5">Potential Overrun</th>
              <th className="px-4 sm:px-5 py-3.5">Explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {resultsList.map((res) => (
              <tr key={res.audit_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{res.audit_id}</td>
                <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900 font-mono text-xs">{res.reference_id}</td>
                <td className="px-4 sm:px-5 py-4 text-slate-700">₹{res.expected_value.toLocaleString('en-IN')}</td>
                <td className="px-4 sm:px-5 py-4 text-slate-700">₹{res.actual_value.toLocaleString('en-IN')}</td>
                <td className="px-4 sm:px-5 py-4 font-bold text-teal-700">₹{res.potential_financial_impact.toLocaleString('en-IN')}</td>
                <td className="px-4 sm:px-5 py-4 text-xs text-slate-600 max-w-md truncate">{res.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
