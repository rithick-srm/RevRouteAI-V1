import React, { useState } from 'react';
import { api } from '../../services/api';
import { Fuel, Upload, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';

export default function DriverFuelEntry({ currentUser, setDriverPage }) {
  const assignedTruck = currentUser?.assigned_vehicle_id || 'TRK-101';
  const driverId = currentUser?.id || 2;

  const [form, setForm] = useState({
    vehicle_id: assignedTruck,
    driver_id: driverId,
    fuel_date: new Date().toISOString().split('T')[0],
    fuel_station: 'HP Fuel Station',
    liters_filled: 75.0,
    price_per_liter: 90.0,
    total_cost: 6750.0,
    odometer_reading: 45500.0,
    receipt_url: '',
    notes: ''
  });

  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadDocument(file, 'fuel');
      const extFields = res.extraction?.extracted_fields || {};

      setForm((prev) => ({
        ...prev,
        receipt_url: res.document_url,
        liters_filled: extFields.liters_filled ?? prev.liters_filled,
        price_per_liter: extFields.price_per_liter ?? prev.price_per_liter,
        total_cost: extFields.total_cost ?? (extFields.liters_filled && extFields.price_per_liter ? extFields.liters_filled * extFields.price_per_liter : prev.total_cost)
      }));
    } catch (err) {
      alert(`Receipt upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setSuccessMsg(null);
      await api.submitDriverFuel(form);
      setSuccessMsg('Fuel entry saved to Central Database! Automatically available in Management Fuel Audit.');
      setTimeout(() => {
        setDriverPage('history');
      }, 1500);
    } catch (err) {
      alert(`Error submitting fuel entry: ${err.message}`);
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
          <h2 className="text-xl font-bold text-slate-900">Add Fuel Record</h2>
          <p className="text-xs text-slate-500">Record trip fuel purchases & upload fuel receipt</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        {/* Receipt Upload Box */}
        <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Upload size={15} className="text-blue-600" /> Upload Fuel Receipt Image / Bill
            </label>
            <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-semibold">OCR Scanner</span>
          </div>
          <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileUpload} className="text-xs text-slate-500 w-full" />
          {uploading && <p className="text-xs text-blue-600 font-semibold animate-pulse">Scanning fuel receipt...</p>}
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
            <label className="block font-semibold text-slate-700 mb-1">Fuel Date</label>
            <input
              type="date"
              required
              value={form.fuel_date}
              onChange={(e) => setForm({ ...form, fuel_date: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-xl"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Fuel Station Name / Location</label>
            <input
              type="text"
              required
              placeholder="e.g. Indian Oil / HP Station Chennai"
              value={form.fuel_station}
              onChange={(e) => setForm({ ...form, fuel_station: e.target.value })}
              className="w-full px-3 py-2.5 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Fuel Quantity (Liters)</label>
            <input
              type="number"
              step="0.1"
              required
              value={form.liters_filled}
              onChange={(e) => {
                const l = parseFloat(e.target.value) || 0;
                setForm({ ...form, liters_filled: l, total_cost: l * form.price_per_liter });
              }}
              className="w-full px-3 py-2.5 border rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Price Per Liter (₹)</label>
            <input
              type="number"
              step="0.1"
              required
              value={form.price_per_liter}
              onChange={(e) => {
                const p = parseFloat(e.target.value) || 0;
                setForm({ ...form, price_per_liter: p, total_cost: form.liters_filled * p });
              }}
              className="w-full px-3 py-2.5 border rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Total Fuel Cost (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={form.total_cost}
              onChange={(e) => setForm({ ...form, total_cost: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border rounded-xl font-extrabold text-blue-600 text-sm"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Odometer Reading (KM)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="45500"
              value={form.odometer_reading}
              onChange={(e) => setForm({ ...form, odometer_reading: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2.5 border rounded-xl font-mono"
            />
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label className="block font-semibold text-slate-700 mb-1">Additional Notes (Optional)</label>
            <textarea
              rows={2}
              placeholder="e.g. Tank filled full during Chennai trip."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold text-white text-sm rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
        >
          <Fuel size={18} /> {submitting ? 'Saving to Central Database...' : 'Submit Fuel Record'}
        </button>
      </form>
    </div>
  );
}
