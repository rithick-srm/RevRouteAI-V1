import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Fuel, Play, ArrowRight } from 'lucide-react';

export default function FuelAudit({ setActivePage }) {
  const [logs, setLogs] = useState([]);
  const [selectedFuelLog, setSelectedFuelLog] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultsList, setResultsList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [lgs, allRes] = await Promise.all([api.getFuelLogs(), api.getAuditResults()]);
      setLogs(lgs);
      const fuelAudits = allRes.filter((r) => r.audit_type === 'FUEL');
      setResultsList(fuelAudits);
      if (lgs.length > 0) setSelectedFuelLog(lgs[0].fuel_log_id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRunAudit = async () => {
    if (!selectedFuelLog) return;
    try {
      setLoading(true);
      const res = await api.runFuelAudit(selectedFuelLog);
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
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Module 3 — Fuel Consumption & Cost Variance Audit</h2>
        <p className="text-xs text-slate-500">Calculates expected fuel based on trip distance & vehicle baseline mileage, then identifies abnormal fuel consumption and cost variances requiring investigation</p>
      </div>

      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Fuel size={18} className="text-amber-600" /> Execute Fuel Audit Engine
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <select
            value={selectedFuelLog}
            onChange={(e) => setSelectedFuelLog(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white font-medium w-full"
          >
            <option value="">Select Fuel Log to Audit</option>
            {logs.map((l) => (
              <option key={l.fuel_log_id} value={l.fuel_log_id}>
                {l.fuel_log_id} — Vehicle: {l.vehicle_id}, Fuel Filled: {l.liters_filled} L (₹{l.total_cost}) [Date: {l.fuel_date}]
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAudit}
            disabled={loading || !selectedFuelLog}
            className="px-6 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-300 text-white font-semibold text-sm rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Play size={16} /> {loading ? 'Auditing...' : 'Run Fuel Audit'}
          </button>
        </div>

        {auditResult && (
          <div className="mt-4 p-4 sm:p-5 bg-slate-50 border border-amber-200 rounded-xl space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider">Audit Result: {auditResult.audit_id}</span>
              <span className="text-xs text-slate-500">Ref: {auditResult.reference_id}</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white p-4 rounded-lg border border-slate-200 text-center">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Expected Fuel</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">{auditResult.expected_value} L</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Est. Actual Fuel</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">{auditResult.actual_value} L</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Consumption Variance</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">+{auditResult.variance} L</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Potential Cost Variance</p>
                <p className="text-base sm:text-lg font-extrabold text-amber-600">₹{auditResult.potential_financial_impact.toLocaleString('en-IN')}</p>
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
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Fuel Audit Log History</h3>
        </div>
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="px-4 sm:px-5 py-3.5">Audit ID</th>
              <th className="px-4 sm:px-5 py-3.5">Fuel Log ID</th>
              <th className="px-4 sm:px-5 py-3.5">Expected Vol (L)</th>
              <th className="px-4 sm:px-5 py-3.5">Actual Vol (L)</th>
              <th className="px-4 sm:px-5 py-3.5">Volume Variance</th>
              <th className="px-4 sm:px-5 py-3.5">Potential Cost Variance</th>
              <th className="px-4 sm:px-5 py-3.5">Explanation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {resultsList.map((res) => (
              <tr key={res.audit_id} className="hover:bg-slate-50/80 transition-colors">
                <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{res.audit_id}</td>
                <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900 font-mono text-xs">{res.reference_id}</td>
                <td className="px-4 sm:px-5 py-4 text-slate-700">{res.expected_value} L</td>
                <td className="px-4 sm:px-5 py-4 text-slate-700">{res.actual_value} L</td>
                <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900">+{res.variance} L</td>
                <td className="px-4 sm:px-5 py-4 font-bold text-amber-600">₹{res.potential_financial_impact.toLocaleString('en-IN')}</td>
                <td className="px-4 sm:px-5 py-4 text-xs text-slate-600 max-w-md truncate">{res.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
