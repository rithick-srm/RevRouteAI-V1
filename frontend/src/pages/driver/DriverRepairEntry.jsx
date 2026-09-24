import React, { useState } from 'react';
import { api } from '../../services/api';
import { Wrench, Upload, CheckCircle2, ArrowLeft, Receipt } from 'lucide-react';

export default function DriverRepairEntry({ currentUser, setDriverPage }) {
  const assignedTruck = currentUser?.assigned_vehicle_id || 'TRK-101';
  const driverId = currentUser?.id || 2;

  const [form, setForm] = useState({
    vehicle_id: assignedTruck,
    driver_id: driverId,
    service_center: 'Express Heavy Repairs',
    service_date: new Date().toISOString().split('T')[0],
    repair_type: 'Brake Pad Replacement',
    problem_description: 'Brake pad noise noticed during trip from Chennai to Bengaluru.',
    parts_cost: 7000.0,
    labor_cost: 2500.0,
    total_repair_cost: 9500.0,
    odometer_reading: 45600.0,
    invoice_number: 'REP-BILL-990',
    receipt_url: '',
    notes: 'Uploaded official workshop invoice bill.'
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadDocument(file, 'maintenance');
      const extFields = res.extraction?.extracted_fields || {};

      setForm((prev) => ({
        ...prev,
        receipt_url: res.document_url,
        service_center: extFields.service_center || prev.service_center,
        repair_type: extFields.repair_type || prev.repair_type,
        total_repair_cost: extFields.total_repair_cost ?? prev.total_repair_cost,
        parts_cost: extFields.parts_cost ?? prev.parts_cost,
        labor_cost: extFields.labor_cost ?? prev.labor_cost,
      }));
    } catch (err) {
      alert(`Repair bill upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSuccessMsg(null);
      await api.submitDriverRepair(form);
      setSuccessMsg('Repair report and uploaded bill saved to Central Database! Available in Management Maintenance & Billing Audits.');
      setTimeout(() => {
        setDriverPage('history');
      }, 1500);
    } catch (err) {
      alert(`Error submitting repair report: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setDriverPage('dashboard')}
          className="p-2 bg-slate-200 hover:bg-slate-300 rounded-xl text-slate-700 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Report Repair & Upload Bill</h2>
          <p className="text-xs text-slate-500">Report maintenance issues, repair costs & upload workshop invoices</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        {/* Repair Bill Upload Box */}
        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Upload size={15} className="text-teal-600" /> Upload Repair Invoice / Bill Document
            </label>
            <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">Bill Extractor</span>
          </div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="text-xs text-slate-500 w-full" />
          {uploading && <p className="text-xs text-teal-600 font-semibold animate-pulse">Scanning repair bill...</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Truck</label>
            <input
              type="text"
              readOnly
              value={form.vehicle_id}
              className="w-full px-3 py-2.5 bg-slate-100 border rounded-xl font-mono font-bold text-slate-800"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Repair / Service Date</label>
            <input
              type="date"
              required
              value={form.service_date}
              onChange={(e) => setForm({ ...form, service_date: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Repair Type / Category</label>
            <select
              value={form.repair_type}
              onChange={(e) => setForm({ ...form, repair_type: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-xl bg-white font-medium"
            >
              <option value="Brake Pad Replacement">Brake Pad Replacement</option>
              <option value="Oil Change">Oil Change</option>
              <option value="Battery Replacement">Battery Replacement</option>
              <option value="Tyre Replacement">Tyre Replacement</option>
              <option value="Engine Service">Engine Service</option>
              <option value="Clutch Service">Clutch Service</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Service Workshop / Provider</label>
            <input
              type="text"
              required
              placeholder="e.g. Express Heavy Repairs"
              value={form.service_center}
              onChange={(e) => setForm({ ...form, service_center: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-xl"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Description of Problem / Service Details</label>
            <textarea
              rows={2}
              required
              placeholder="Describe vehicle symptoms or maintenance performed..."
              value={form.problem_description}
              onChange={(e) => setForm({ ...form, problem_description: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Bill / Invoice Number</label>
            <input
              type="text"
              placeholder="MNT-BILL-101"
              value={form.invoice_number}
              onChange={(e) => setForm({ ...form, invoice_number: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Odometer Reading (KM)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="45600"
              value={form.odometer_reading}
              onChange={(e) => setForm({ ...form, odometer_reading: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Parts Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={form.parts_cost}
              onChange={(e) => {
                const pc = parseFloat(e.target.value) || 0;
                setForm({ ...form, parts_cost: pc, total_repair_cost: pc + form.labor_cost });
              }}
              className="w-full px-3 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Labor Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              value={form.labor_cost}
              onChange={(e) => {
                const lc = parseFloat(e.target.value) || 0;
                setForm({ ...form, labor_cost: lc, total_repair_cost: form.parts_cost + lc });
              }}
              className="w-full px-3 py-2.5 border rounded-xl"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Total Repair Bill Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.total_repair_cost}
              onChange={(e) => setForm({ ...form, total_repair_cost: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border rounded-xl font-extrabold text-teal-700 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-teal-600 hover:bg-teal-500 font-bold text-white text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <Wrench size={18} /> {submitting ? 'Saving to Central Database...' : 'Submit Repair & Bill Record'}
        </button>
      </form>
    </div>
  );
}
