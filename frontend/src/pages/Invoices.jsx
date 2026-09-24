import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import StatusBadge from '../components/StatusBadge';
import { Plus, Upload, Receipt, AlertCircle } from 'lucide-react';

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    invoice_id: '', invoice_number: '', shipment_id: '', invoice_date: '2024-09-14',
    billed_freight_amount: 25000, billed_fuel_surcharge: 2000, billed_weight_charge: 0,
    billed_detention_charge: 0, total_billed_amount: 27000, verification_status: 'PENDING',
    document_url: ''
  });

  const [uploading, setUploading] = useState(false);
  const [ocrMessage, setOcrMessage] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [invs, shps] = await Promise.all([api.getInvoices(), api.getShipments()]);
      setInvoices(invs);
      setShipments(shps);
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
      const res = await api.uploadDocument(file, 'invoices');
      const extFields = res.extraction?.extracted_fields || {};
      setOcrMessage(res.extraction?.message || 'Invoice parsed');

      setForm((prev) => ({
        ...prev,
        document_url: res.document_url,
        invoice_number: extFields.invoice_number || prev.invoice_number,
        total_billed_amount: extFields.total_billed_amount ?? prev.total_billed_amount,
        billed_freight_amount: extFields.billed_freight_amount ?? prev.billed_freight_amount,
        billed_fuel_surcharge: extFields.billed_fuel_surcharge ?? prev.billed_fuel_surcharge,
        billed_detention_charge: extFields.billed_detention_charge ?? prev.billed_detention_charge,
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
      await api.createInvoice(form);
      setIsModalOpen(false);
      loadData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Invoice Registry</h2>
          <p className="text-xs text-slate-500">Record customer billing invoices to run contract compliance audits</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={16} /> Add Invoice
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading invoices...</div>
      ) : invoices.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <Receipt size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">No Invoices Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Record invoices to run billing audit engine.</p>
          <button onClick={() => setIsModalOpen(true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">
            Add Invoice
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Scrollable Container for Table */}
          <div className="overflow-x-auto min-w-full block">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 sm:px-5 py-3.5">Invoice #</th>
                  <th className="px-4 sm:px-5 py-3.5">Shipment ID</th>
                  <th className="px-4 sm:px-5 py-3.5">Invoice Date</th>
                  <th className="px-4 sm:px-5 py-3.5">Billed Freight</th>
                  <th className="px-4 sm:px-5 py-3.5">Fuel Surcharge</th>
                  <th className="px-4 sm:px-5 py-3.5">Detention Charge</th>
                  <th className="px-4 sm:px-5 py-3.5">Total Billed</th>
                  <th className="px-4 sm:px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {invoices.map((inv) => (
                  <tr key={inv.invoice_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-5 py-4 font-bold text-blue-600 font-mono text-xs">{inv.invoice_number}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700 font-mono text-xs">{inv.shipment_id}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-600 text-xs sm:text-sm">{inv.invoice_date}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700">₹{inv.billed_freight_amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700">₹{inv.billed_fuel_surcharge.toLocaleString('en-IN')}</td>
                    <td className="px-4 sm:px-5 py-4 text-slate-700">₹{inv.billed_detention_charge.toLocaleString('en-IN')}</td>
                    <td className="px-4 sm:px-5 py-4 font-bold text-slate-900">₹{inv.total_billed_amount.toLocaleString('en-IN')}</td>
                    <td className="px-4 sm:px-5 py-4"><StatusBadge status={inv.verification_status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Invoice Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add / Upload Invoice">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 sm:p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Upload size={14} className="text-blue-600 shrink-0" />
                Upload Invoice (PDF / Receipt Image)
              </label>
              <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold w-fit">OCR Extractor</span>
            </div>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="text-xs text-slate-500 w-full" />
            {uploading && <p className="text-xs text-blue-600 font-semibold animate-pulse">Extracting invoice data...</p>}
            {ocrMessage && (
              <p className="text-xs p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded flex items-center gap-1.5">
                <AlertCircle size={14} className="shrink-0" /> {ocrMessage}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice ID</label>
              <input type="text" required placeholder="INV-2024-004" value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number</label>
              <input type="text" required placeholder="INV-88904" value={form.invoice_number} onChange={(e) => setForm({ ...form, invoice_number: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Associated Shipment</label>
              <select required value={form.shipment_id} onChange={(e) => setForm({ ...form, shipment_id: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="">Select Shipment</option>
                {shipments.map((s) => <option key={s.shipment_id} value={s.shipment_id}>{s.shipment_id} ({s.origin} to {s.destination})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Date</label>
              <input type="date" required value={form.invoice_date} onChange={(e) => setForm({ ...form, invoice_date: e.target.value })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billed Freight Amount (₹)</label>
              <input type="number" step="0.01" required value={form.billed_freight_amount} onChange={(e) => setForm({ ...form, billed_freight_amount: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billed Fuel Surcharge (₹)</label>
              <input type="number" step="0.01" value={form.billed_fuel_surcharge} onChange={(e) => setForm({ ...form, billed_fuel_surcharge: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Billed Detention Charge (₹)</label>
              <input type="number" step="0.01" value={form.billed_detention_charge} onChange={(e) => setForm({ ...form, billed_detention_charge: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Billed Amount (₹)</label>
              <input type="number" step="0.01" required value={form.total_billed_amount} onChange={(e) => setForm({ ...form, total_billed_amount: parseFloat(e.target.value) })} className="w-full px-3 py-2 border rounded-lg text-sm font-bold text-blue-600" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border text-slate-700 text-xs font-semibold rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg">Save Invoice</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
