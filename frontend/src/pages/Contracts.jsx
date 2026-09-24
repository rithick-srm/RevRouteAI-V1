import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Plus, Upload, FileText, AlertCircle } from 'lucide-react';

export default function Contracts() {
  const [contracts, setContracts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [form, setForm] = useState({
    contract_id: '', customer_id: '', pricing_method: 'PER_KM', base_rate: 25.0,
    fuel_surcharge_percentage: 10.0, max_weight_limit: 1000.0, weight_overcharge_rate: 15.0,
    free_detention_hours: 1.0, detention_rate: 1500.0, effective_date: '2024-01-01',
    expiry_date: '2025-12-31', verification_status: 'PENDING', document_url: ''
  });

  // OCR Extraction State
  const [uploading, setUploading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cnts, custs] = await Promise.all([api.getContracts(), api.getCustomers()]);
      setContracts(cnts);
      setCustomers(custs);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setOcrMessage(null);
      const res = await api.uploadDocument(file, 'contracts');
      
      const extFields = res.extraction?.extracted_fields || {};
      setOcrMessage(res.extraction?.message || 'Document parsed');

      setForm((prev) => ({
        ...prev,
        document_url: res.document_url,
        base_rate: extFields.base_rate !== undefined && extFields.base_rate !== null ? extFields.base_rate : prev.base_rate,
        pricing_method: extFields.pricing_method ? extFields.pricing_method.toUpperCase() : prev.pricing_method,
        fuel_surcharge_percentage: extFields.fuel_surcharge_percentage ?? prev.fuel_surcharge_percentage,
        max_weight_limit: extFields.max_weight_limit ?? prev.max_weight_limit,
        detention_rate: extFields.detention_rate ?? prev.detention_rate,
        free_detention_hours: extFields.free_detention_hours ?? prev.free_detention_hours,
      }));
    } catch (err) {
      alert(`OCR Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createContract(form);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleVerify = async (id, status) => {
    try {
      await api.verifyContract(id, status);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Contract Management</h2>
          <p className="text-xs text-slate-500">Only VERIFIED contracts can be used by the deterministic billing audit engine</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={16} /> New Contract
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <FileText size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">No Contracts Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Upload or create customer contract definitions.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
            Create Contract
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Scrollable Container for Table */}
          <div className="overflow-x-auto min-w-full block">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 sm:px-5 py-3.5">Contract ID</th>
                  <th className="px-4 sm:px-5 py-3.5">Customer</th>
                  <th className="px-4 sm:px-5 py-3.5">Pricing Model</th>
                  <th className="px-4 sm:px-5 py-3.5">Base Rate</th>
                  <th className="px-4 sm:px-5 py-3.5">Fuel Surcharge %</th>
                  <th className="px-4 sm:px-5 py-3.5">Detention Rate</th>
                  <th className="px-4 sm:px-5 py-3.5">Status</th>
                  <th className="px-4 sm:px-5 py-3.5 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {contracts.map((c) => (
                  <tr key={c.contract_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{c.contract_id}</td>
                    <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900">{c.customer_id}</td>
                    <td className="px-4 sm:px-5 py-4 font-mono text-xs text-slate-700">{c.pricing_method}</td>
                    <td className="px-4 sm:px-5 py-4 font-semibold text-slate-900">₹{c.base_rate}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700">{c.fuel_surcharge_percentage}%</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700 text-xs">₹{c.detention_rate}/hr after {c.free_detention_hours}h</td>
                    <td className="px-4 sm:px-5 py-4"><StatusBadge status={c.verification_status} /></td>
                    <td className="px-4 sm:px-5 py-4 text-right space-x-2">
                      {c.verification_status !== 'VERIFIED' ? (
                        <button
                          onClick={() => handleVerify(c.contract_id, 'VERIFIED')}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-md shadow-2xs"
                        >
                          Verify Contract
                        </button>
                      ) : (
                        <button
                          onClick={() => handleVerify(c.contract_id, 'PENDING')}
                          className="px-2.5 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-md"
                        >
                          Unverify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Contract Add / OCR Upload Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create / Upload Contract">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 sm:p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload size={14} className="text-blue-600 shrink-0" />
                AI Document Understanding (PDF / Image)
              </label>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold w-fit">OCR Field Extractor</span>
            </div>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="text-xs text-slate-500 w-full" />
            {uploading && <p className="text-xs text-blue-600 font-semibold animate-pulse">Extracting document text...</p>}
            {ocrMessage && (
              <p className="text-xs p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" /> {ocrMessage}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contract ID</label>
              <input type="text" required placeholder="CNT-2024-005" value={form.contract_id} onChange={(e) => setForm({ ...form, contract_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer</label>
              <select required value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="">Select Customer</option>
                {customers.map((c) => <option key={c.customer_id} value={c.customer_id}>{c.customer_name} ({c.customer_id})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pricing Method</label>
              <select value={form.pricing_method} onChange={(e) => setForm({ ...form, pricing_method: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="PER_KM">PER_KM (Rate per km)</option>
                <option value="PER_KG">PER_KG (Rate per kg)</option>
                <option value="FLAT">FLAT (Flat rate)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Base Rate (₹)</label>
              <input type="number" step="0.01" required value={form.base_rate} onChange={(e) => setForm({ ...form, base_rate: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fuel Surcharge (%)</label>
              <input type="number" step="0.01" value={form.fuel_surcharge_percentage} onChange={(e) => setForm({ ...form, fuel_surcharge_percentage: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Max Weight Limit (kg)</label>
              <input type="number" step="0.01" value={form.max_weight_limit} onChange={(e) => setForm({ ...form, max_weight_limit: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Free Detention Hours</label>
              <input type="number" step="0.1" value={form.free_detention_hours} onChange={(e) => setForm({ ...form, free_detention_hours: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Detention Rate (₹/hr)</label>
              <input type="number" step="0.01" value={form.detention_rate} onChange={(e) => setForm({ ...form, detention_rate: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save Contract</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
