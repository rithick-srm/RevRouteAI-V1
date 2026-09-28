import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { 
  CreditCard, Plus, Search, Filter, ShieldAlert, CheckCircle2, 
  AlertTriangle, Clock, RefreshCw, X, TrendingUp, DollarSign, Route as RouteIcon
} from 'lucide-react';

export default function TollCosts() {
  const [tolls, setTolls] = useState([]);
  const [summary, setSummary] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedVehicle, setSelectedVehicle] = useState('All');

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    vehicle_id: 'TRK-101',
    shipment_id: '',
    route: 'Chennai → Bengaluru',
    toll_gate: 'Krishnagiri Plaza',
    date: new Date().toISOString().split('T')[0],
    expected_amount: '1400',
    actual_amount: '1450',
    notes: 'Standard FASTag route toll charge'
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [tollsData, summaryData, vehiclesData, shipmentsData] = await Promise.all([
        api.getTollRecords(),
        api.getTollSummary(),
        api.getVehicles(),
        api.getShipments()
      ]);
      setTolls(tollsData);
      setSummary(summaryData);
      setVehicles(vehiclesData);
      setShipments(shipmentsData);
    } catch (err) {
      setError(err.message || 'Failed to load toll records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await api.createTollRecord({
        vehicle_id: formData.vehicle_id,
        shipment_id: formData.shipment_id || null,
        route: formData.route,
        toll_gate: formData.toll_gate,
        date: formData.date,
        expected_amount: parseFloat(formData.expected_amount) || 0,
        actual_amount: parseFloat(formData.actual_amount) || 0,
        notes: formData.notes
      });
      setShowAddModal(false);
      setFormData({
        vehicle_id: 'TRK-101',
        shipment_id: '',
        route: 'Chennai → Bengaluru',
        toll_gate: 'Krishnagiri Plaza',
        date: new Date().toISOString().split('T')[0],
        expected_amount: '1400',
        actual_amount: '1450',
        notes: ''
      });
      await fetchData();
    } catch (err) {
      alert(err.message || 'Failed to create toll record.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (tollId, newStatus) => {
    try {
      await api.updateTollStatus(tollId, newStatus);
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to update status');
    }
  };

  const filteredTolls = tolls.filter((t) => {
    const matchesSearch = 
      t.toll_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.vehicle_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.route.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.toll_gate.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || t.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesVehicle = selectedVehicle === 'All' || t.vehicle_id === selectedVehicle;

    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 size={12} /> Verified
          </span>
        );
      case 'Review':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock size={12} /> Review
          </span>
        );
      case 'Flagged':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle size={12} /> Flagged
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
              <CreditCard size={22} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Toll Cost & Audit</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Monitor route toll expenses, verify charges, and identify toll discrepancies.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-2 transition-colors"
          >
            <Plus size={18} />
            <span>Add Toll Record</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl flex items-center gap-2 font-medium">
          <AlertTriangle size={18} /> {error}
        </div>
      )}

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Toll Spend</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 font-mono">
            ₹{summary ? summary.total_actual_spend.toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-[11px] text-slate-400">Actual toll cost recorded</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Toll Spend</p>
          <p className="text-xl sm:text-2xl font-bold text-slate-700 font-mono">
            ₹{summary ? summary.total_expected_spend.toLocaleString('en-IN') : '0'}
          </p>
          <p className="text-[11px] text-slate-400">Route baseline tariff</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Variance</p>
          <p className={`text-xl sm:text-2xl font-bold font-mono ${summary && summary.total_variance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {summary && summary.total_variance > 0 ? `+₹${summary.total_variance.toLocaleString('en-IN')}` : '₹0'}
          </p>
          <p className="text-[11px] text-slate-400">Actual vs expected diff</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Review</p>
          <p className="text-xl sm:text-2xl font-bold text-amber-600 font-mono">
            {summary ? summary.review_count : 0}
          </p>
          <p className="text-[11px] text-slate-400">Requires verification</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flagged Items</p>
          <p className="text-xl sm:text-2xl font-bold text-rose-600 font-mono">
            {summary ? summary.flagged_count : 0}
          </p>
          <p className="text-[11px] text-slate-400">Overcharge alerts</p>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search Toll ID, Vehicle, Route, Gate..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs sm:text-sm text-slate-800 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <Filter size={14} className="text-slate-400" />
            <span className="font-semibold text-slate-600">Vehicle:</span>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_id}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs">
            <span className="font-semibold text-slate-600">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Review">Review</option>
              <option value="Flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {/* Toll Records Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase text-[11px] font-semibold tracking-wider">
                <th className="py-3 px-4">Toll ID</th>
                <th className="py-3 px-4">Vehicle</th>
                <th className="py-3 px-4">Shipment</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Toll Gate</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Expected</th>
                <th className="py-3 px-4 text-right">Actual</th>
                <th className="py-3 px-4 text-right">Variance</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-medium">
                    Loading toll cost records...
                  </td>
                </tr>
              ) : filteredTolls.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-8 text-center text-slate-400 font-medium">
                    No matching toll records found.
                  </td>
                </tr>
              ) : (
                filteredTolls.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">{t.toll_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{t.vehicle_id}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{t.shipment_id || '—'}</td>
                    <td className="py-3 px-4 font-medium text-slate-700">{t.route}</td>
                    <td className="py-3 px-4 text-slate-600">{t.toll_gate}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-xs">{t.date}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">₹{t.expected_amount.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-900">₹{t.actual_amount.toLocaleString('en-IN')}</td>
                    <td className={`py-3 px-4 text-right font-mono font-bold ${t.variance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                      {t.variance > 0 ? `+₹${t.variance.toLocaleString('en-IN')}` : '₹0'}
                    </td>
                    <td className="py-3 px-4 text-center">{getStatusBadge(t.status)}</td>
                    <td className="py-3 px-4 text-center">
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.toll_id, e.target.value)}
                        className="bg-slate-100 border border-slate-200 text-xs font-semibold rounded px-2 py-1 text-slate-700 focus:outline-none"
                      >
                        <option value="Verified">Verified</option>
                        <option value="Review">Review</option>
                        <option value="Flagged">Flagged</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Toll Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in duration-150">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard size={18} className="text-teal-400" />
                <h3 className="font-bold text-base">Add New Toll Record</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle</label>
                  <select
                    value={formData.vehicle_id}
                    onChange={(e) => setFormData({ ...formData, vehicle_id: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {vehicles.map((v) => (
                      <option key={v.vehicle_id} value={v.vehicle_id}>{v.vehicle_id} ({v.license_plate})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Shipment (Optional)</label>
                  <input
                    type="text"
                    value={formData.shipment_id}
                    onChange={(e) => setFormData({ ...formData, shipment_id: e.target.value })}
                    placeholder="e.g. SHP-1001"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Route</label>
                <input
                  type="text"
                  required
                  value={formData.route}
                  onChange={(e) => setFormData({ ...formData, route: e.target.value })}
                  placeholder="e.g. Chennai → Bengaluru"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Toll Gate Plaza</label>
                  <input
                    type="text"
                    required
                    value={formData.toll_gate}
                    onChange={(e) => setFormData({ ...formData, toll_gate: e.target.value })}
                    placeholder="e.g. Krishnagiri Plaza"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Toll (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.expected_amount}
                    onChange={(e) => setFormData({ ...formData, expected_amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Actual Toll Paid (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.actual_amount}
                    onChange={(e) => setFormData({ ...formData, actual_amount: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Audit Remarks</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="e.g. FASTag deduction note or tariff variance detail"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md transition-colors"
                >
                  {submitting ? 'Saving...' : 'Save Toll Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
