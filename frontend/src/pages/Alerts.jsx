import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { ShieldAlert, CheckCircle, XCircle, ArrowRight, Eye, AlertTriangle } from 'lucide-react';

export default function Alerts({ setActivePage }) {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [caseModalOpen, setCaseModalOpen] = useState(false);

  // Recovery Case Form
  const [caseForm, setCaseForm] = useState({
    action_type: 'Customer Billing Recovery', assigned_to: 'Fleet Manager', review_notes: ''
  });

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const res = await api.getAlerts();
      setAlerts(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (alertId, newStatus) => {
    try {
      await api.updateAlertStatus(alertId, newStatus);
      loadAlerts();
      if (selectedAlert && selectedAlert.alert_id === alertId) {
        setSelectedAlert((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenReview = (alt) => {
    setSelectedAlert(alt);
    setIsReviewOpen(true);
    if (alt.category === 'Revenue Leakage') {
      setCaseForm({ action_type: 'Customer Billing Recovery', assigned_to: 'Fleet Manager', review_notes: '' });
    } else if (alt.category === 'Maintenance Overrun') {
      setCaseForm({ action_type: 'Maintenance Review', assigned_to: 'Fleet Manager', review_notes: '' });
    } else {
      setCaseForm({ action_type: 'Fuel Investigation', assigned_to: 'Fleet Manager', review_notes: '' });
    }
  };

  const handleCreateCase = async (e) => {
    e.preventDefault();
    if (!selectedAlert) return;
    try {
      await api.createActionCase({
        alert_id: selectedAlert.alert_id,
        action_type: caseForm.action_type,
        assigned_to: caseForm.assigned_to,
        review_notes: caseForm.review_notes
      });
      setCaseModalOpen(false);
      setIsReviewOpen(false);
      loadAlerts();
      setActivePage('action-cases');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Leakage & Operational Variance Alerts</h2>
          <p className="text-xs text-slate-500">Centralized alert queue requiring human verification before recovery or corrective action</p>
        </div>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <ShieldAlert size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-800">No Open Alerts</h3>
          <p className="text-xs text-slate-500 mt-1">Run billing, maintenance, or fuel audits to generate discrepancy alerts.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto min-w-full block">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 sm:px-5 py-3.5">Alert ID</th>
                <th className="px-4 sm:px-5 py-3.5">Category</th>
                <th className="px-4 sm:px-5 py-3.5">Audit Reference</th>
                <th className="px-4 sm:px-5 py-3.5">Potential Impact</th>
                <th className="px-4 sm:px-5 py-3.5">Status</th>
                <th className="px-4 sm:px-5 py-3.5 text-right">Human Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {alerts.map((alt) => {
                const audit = alt.audit_result || {};
                return (
                  <tr key={alt.alert_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{alt.alert_id}</td>
                    <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900">{alt.category}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700 font-mono text-xs">{audit.reference_id || alt.audit_id}</td>
                    <td className="px-4 sm:px-5 py-4 font-bold text-slate-900">
                      ₹{(audit.potential_financial_impact || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 sm:px-5 py-4"><StatusBadge status={alt.status} /></td>
                    <td className="px-4 sm:px-5 py-4 text-right">
                      <button
                        onClick={() => handleOpenReview(alt)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-2xs inline-flex items-center gap-1.5"
                      >
                        <Eye size={14} /> Review Alert
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Human Verification Modal */}
      {selectedAlert && (
        <Modal isOpen={isReviewOpen} onClose={() => setIsReviewOpen(false)} title={`Review Alert: ${selectedAlert.alert_id}`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
              <div>
                <span className="text-xs text-slate-500 font-semibold uppercase">Category</span>
                <p className="font-bold text-slate-900 text-sm">{selectedAlert.category}</p>
              </div>
              <StatusBadge status={selectedAlert.status} />
            </div>

            {selectedAlert.audit_result && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white p-3 rounded-lg border text-center text-xs">
                  <div>
                    <span className="text-slate-500">Expected Value</span>
                    <p className="font-bold text-slate-900">₹{selectedAlert.audit_result.expected_value.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Actual Value</span>
                    <p className="font-bold text-slate-900">₹{selectedAlert.audit_result.actual_value.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Financial Impact</span>
                    <p className="font-extrabold text-blue-600">₹{selectedAlert.audit_result.potential_financial_impact.toLocaleString('en-IN')}</p>
                  </div>
                </div>

                <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Deterministic Rule Output:</strong> {selectedAlert.audit_result.explanation}
                </div>
              </div>
            )}

            {/* Verification Decision Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleStatusChange(selectedAlert.alert_id, 'DISMISSED')}
                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 flex-1 sm:flex-none"
                >
                  <XCircle size={14} /> Dismiss Alert
                </button>
                <button
                  onClick={() => handleStatusChange(selectedAlert.alert_id, 'VERIFIED')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 flex-1 sm:flex-none"
                >
                  <CheckCircle size={14} /> Mark as Verified
                </button>
              </div>

              <button
                onClick={() => setCaseModalOpen(true)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-2xs flex items-center justify-center gap-1.5 shrink-0"
              >
                <span>Initiate Case</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Create Action Case Modal */}
      <Modal isOpen={caseModalOpen} onClose={() => setCaseModalOpen(false)} title="Create Recovery / Corrective Action Case">
        <form onSubmit={handleCreateCase} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Action Type</label>
            <select
              value={caseForm.action_type}
              onChange={(e) => setCaseForm({ ...caseForm, action_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
            >
              <option value="Customer Billing Recovery">Customer Billing Recovery (Billing)</option>
              <option value="Maintenance Review">Maintenance Review (Maintenance)</option>
              <option value="Fuel Investigation">Fuel Investigation (Fuel)</option>
              <option value="Record Correction">Record Correction</option>
              <option value="No Action Required">No Action Required</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Manager</label>
            <input
              type="text"
              required
              value={caseForm.assigned_to}
              onChange={(e) => setCaseForm({ ...caseForm, assigned_to: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Manager Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Contacting customer accounts department regarding unbilled detention hours."
              value={caseForm.review_notes}
              onChange={(e) => setCaseForm({ ...caseForm, review_notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setCaseModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Open Action Case</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
