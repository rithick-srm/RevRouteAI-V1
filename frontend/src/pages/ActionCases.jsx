import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { CheckSquare, Edit, CheckCircle } from 'lucide-react';

export default function ActionCases() {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    verified_amount: 0, recovered_or_corrected_amount: 0, assigned_to: '', review_notes: '', status: 'IN_PROGRESS'
  });

  useEffect(() => {
    loadCases();
  }, []);

  const loadCases = async () => {
    try {
      setLoading(true);
      const res = await api.getActionCases();
      setCases(res);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (c) => {
    setSelectedCase(c);
    setForm({
      verified_amount: c.verified_amount || 0,
      recovered_or_corrected_amount: c.recovered_or_corrected_amount || 0,
      assigned_to: c.assigned_to || 'Fleet Manager',
      review_notes: c.review_notes || '',
      status: c.status || 'IN_PROGRESS'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCase) return;
    try {
      await api.updateActionCase(selectedCase.case_id, form);
      setIsModalOpen(false);
      loadCases();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Recovery & Action Case Tracking</h2>
          <p className="text-xs text-slate-500">Track human-verified billing recovery, maintenance corrections, and fuel investigations</p>
        </div>
      </div>

      {/* Critical Rule Notice Banner */}
      <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs flex items-center gap-2 font-medium">
        <CheckCircle size={18} className="text-teal-600 shrink-0" />
        <span>
          <strong>Human Decision Rule:</strong> Potential financial impacts are not automatically marked as recovered. Fleet managers explicitly verify and record final recovered/corrected amounts.
        </span>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading action cases...</div>
      ) : cases.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <CheckSquare size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-800">No Action Cases Created</h3>
          <p className="text-xs text-slate-500 mt-1">Initiate cases from verified alerts to track financial recovery.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto min-w-full block">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="px-4 sm:px-5 py-3.5">Case ID</th>
                <th className="px-4 sm:px-5 py-3.5">Alert ID</th>
                <th className="px-4 sm:px-5 py-3.5">Action Type</th>
                <th className="px-4 sm:px-5 py-3.5">Verified Amount</th>
                <th className="px-4 sm:px-5 py-3.5">Recovered / Corrected</th>
                <th className="px-4 sm:px-5 py-3.5">Assigned To</th>
                <th className="px-4 sm:px-5 py-3.5">Status</th>
                <th className="px-4 sm:px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {cases.map((c) => (
                <tr key={c.case_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{c.case_id}</td>
                  <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900 font-mono text-xs">{c.alert_id}</td>
                  <td className="px-4 sm:px-5 py-4 font-semibold text-slate-800 text-xs">{c.action_type}</td>
                  <td className="px-4 sm:px-5 py-4 font-bold text-slate-900">₹{c.verified_amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 sm:px-5 py-4 font-extrabold text-emerald-700">₹{c.recovered_or_corrected_amount.toLocaleString('en-IN')}</td>
                  <td className="px-4 sm:px-5 py-4 text-slate-600 text-xs">{c.assigned_to}</td>
                  <td className="px-4 sm:px-5 py-4"><StatusBadge status={c.status} /></td>
                  <td className="px-4 sm:px-5 py-4 text-right">
                    <button
                      onClick={() => handleEdit(c)}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-md border border-slate-300 inline-flex items-center gap-1"
                    >
                      <Edit size={13} /> Update Case
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Case Modal */}
      {selectedCase && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={`Update Case: ${selectedCase.case_id}`}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.verified_amount}
                  onChange={(e) => setForm({ ...form, verified_amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Recovered / Corrected Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={form.recovered_or_corrected_amount}
                  onChange={(e) => setForm({ ...form, recovered_or_corrected_amount: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-emerald-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Manager</label>
              <input
                type="text"
                required
                value={form.assigned_to}
                onChange={(e) => setForm({ ...form, assigned_to: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Case Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white font-semibold"
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Manager Case Notes</label>
              <textarea
                rows={3}
                value={form.review_notes}
                onChange={(e) => setForm({ ...form, review_notes: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save & Update</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
