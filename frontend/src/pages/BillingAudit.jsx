import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Scale, Play, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';

export default function BillingAudit({ setActivePage }) {
  const [shipments, setShipments] = useState([]);
  const [selectedShipment, setSelectedShipment] = useState('');
  const [auditResult, setAuditResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultsList, setResultsList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [shps, allRes] = await Promise.all([api.getShipments(), api.getAuditResults()]);
      setShipments(shps);
      const billingAudits = allRes.filter((r) => r.audit_type === 'BILLING');
      setResultsList(billingAudits);
      if (shps.length > 0) setSelectedShipment(shps[0].shipment_id);
    } catch (err) {
      alert(err.message);
    }
  };

  const handleRunAudit = async () => {
    if (!selectedShipment) return;
    try {
      setLoading(true);
      const res = await api.runBillingAudit(selectedShipment);
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
      {/* Header */}
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">Module 1 — Billing Revenue Leakage Audit</h2>
        <p className="text-xs text-slate-500">Compares Verified Contract Rates, Shipment Distances, Cargo Weight & Warehouse Detention against Recorded Invoices</p>
      </div>

      {/* Execution Control Card */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <Scale size={18} className="text-blue-600" /> Execute Billing Audit Engine
        </h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <select
            value={selectedShipment}
            onChange={(e) => setSelectedShipment(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-white font-medium w-full"
          >
            <option value="">Select Shipment to Audit</option>
            {shipments.map((s) => (
              <option key={s.shipment_id} value={s.shipment_id}>
                {s.shipment_id} — {s.origin} to {s.destination} ({s.distance_km} km) [Contract: {s.contract_id}]
              </option>
            ))}
          </select>

          <button
            onClick={handleRunAudit}
            disabled={loading || !selectedShipment}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-semibold text-sm rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors shrink-0"
          >
            <Play size={16} /> {loading ? 'Auditing...' : 'Run Billing Audit'}
          </button>
        </div>

        {/* Real-time Audit Output Card */}
        {auditResult && (
          <div className="mt-4 p-4 sm:p-5 bg-slate-50 border border-blue-200 rounded-xl space-y-3 animate-in fade-in">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Audit Result: {auditResult.audit_id}</span>
              <span className="text-xs text-slate-500">Ref: {auditResult.reference_id}</span>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 bg-white p-4 rounded-lg border border-slate-200 text-center">
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Expected Billing</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">₹{auditResult.expected_value.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Actual Billed</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">₹{auditResult.actual_value.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Variance</p>
                <p className="text-base sm:text-lg font-bold text-slate-900">₹{auditResult.variance.toLocaleString('en-IN')}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-slate-500">Potential Revenue Leakage</p>
                <p className="text-base sm:text-lg font-extrabold text-rose-600">₹{auditResult.potential_financial_impact.toLocaleString('en-IN')}</p>
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

      {/* Historical Audit Results Log */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto min-w-full block">
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Billing Audit Log History</h3>
        </div>
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
            <tr>
              <th className="px-4 sm:px-5 py-3.5">Audit ID</th>
              <th className="px-4 sm:px-5 py-3.5">Shipment ID</th>
              <th className="px-4 sm:px-5 py-3.5">Expected Value</th>
              <th className="px-4 sm:px-5 py-3.5">Actual Billed</th>
              <th className="px-4 sm:px-5 py-3.5">Potential Leakage</th>
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
                <td className="px-4 sm:px-5 py-4 font-bold text-rose-600">₹{res.potential_financial_impact.toLocaleString('en-IN')}</td>
                <td className="px-4 sm:px-5 py-4 text-xs text-slate-600 max-w-md truncate">{res.explanation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
