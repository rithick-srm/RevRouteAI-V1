import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  Scale, AlertTriangle, ShieldCheck, CheckCircle2, Clock, 
  TrendingUp, RefreshCw, AlertCircle, ArrowRight
} from 'lucide-react';

export default function TollAudit({ setActivePage }) {
  const [auditData, setAuditData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAuditData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTollAudit();
      setAuditData(data);
    } catch (err) {
      setError(err.message || 'Failed to load toll audit data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, []);

  const handleUpdateStatus = async (tollId, newStatus) => {
    try {
      await api.updateTollStatus(tollId, newStatus);
      fetchAuditData();
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
              <Scale size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Toll Revenue & Expense Leakage Audit</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Audit Engine / Module 4 — Route Toll Discrepancy & Overcharge Analysis
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchAuditData}
          className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors self-start md:self-auto"
          title="Refresh Audit Data"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2 font-medium">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Audit Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Tolls Audited</span>
            <ShieldCheck size={18} className="text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
            {auditData ? auditData.total_audited : 0}
          </p>
          <p className="text-xs text-slate-400">Total toll transactions analyzed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Discrepancies Detected</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-amber-600 font-mono">
            {auditData ? auditData.discrepancy_count : 0}
          </p>
          <p className="text-xs text-slate-400">Variances exceeding baseline</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Potential Financial Impact</span>
            <TrendingUp size={18} className="text-rose-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-rose-600 font-mono">
            ₹{auditData ? auditData.financial_impact.toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-xs text-slate-400">Total overcharge variance</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Audit Engine Rule</span>
            <CheckCircle2 size={18} className="text-teal-600" />
          </div>
          <p className="text-sm font-bold text-slate-800">
            Deterministic Baseline
          </p>
          <p className="text-xs text-slate-500">Actual toll − Route expected tariff</p>
        </div>
      </div>

      {/* Discrepancy Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vehicles with Repeated Toll Variances */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-500" /> Vehicles with Repeated Toll Variances
            </h3>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-slate-400 py-4">Analyzing vehicle toll records...</p>
            ) : auditData?.repeated_variance_vehicles.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No vehicles with repeated toll variances detected.</p>
            ) : (
              auditData?.repeated_variance_vehicles.map((v) => (
                <div key={v.vehicle_id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{v.vehicle_id}</span>
                    <span className="text-xs text-slate-500 block">Repeated route tariff exceedance</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-amber-600 text-xs sm:text-sm">+₹{v.total_variance.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400 block">Total Overcharge</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Routes with Highest Toll Differences */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <TrendingUp size={16} className="text-blue-500" /> Routes with Highest Toll Variances
            </h3>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-xs text-slate-400 py-4">Analyzing route toll baselines...</p>
            ) : auditData?.unusual_routes.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No routes with toll differences detected.</p>
            ) : (
              auditData?.unusual_routes.map((r) => (
                <div key={r.route} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <span className="font-bold text-slate-900 text-xs sm:text-sm">{r.route}</span>
                    <span className="text-xs text-slate-500 block">Unscheduled gate tariff variance</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-rose-600 text-xs sm:text-sm">+₹{r.total_variance.toLocaleString('en-IN')}</span>
                    <span className="text-[10px] text-slate-400 block">Route Overcharge</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Audit Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Flagged & Pending Toll Audit Items</h3>
          <span className="text-xs text-slate-500">Manual review recommended</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Toll ID</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Plaza</th>
                <th className="py-3 px-4 text-right">Expected</th>
                <th className="py-3 px-4 text-right">Actual</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Audit Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">Loading audit records...</td>
                </tr>
              ) : auditData?.flagged_records.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">No flagged toll records requiring review.</td>
                </tr>
              ) : (
                auditData?.flagged_records.map((t) => (
                  <tr key={t.toll_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{t.toll_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.vehicle_id}</td>
                    <td className="py-3 px-4 text-slate-700">{t.route}</td>
                    <td className="py-3 px-4 text-slate-600">{t.toll_gate}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹{t.expected_amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">₹{t.actual_amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-rose-600">+₹{t.variance.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${t.status === 'Flagged' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleUpdateStatus(t.toll_id, 'Verified')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold rounded transition-colors"
                        >
                          Verify Charge
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(t.toll_id, 'Flagged')}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold rounded transition-colors"
                        >
                          Flag
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
