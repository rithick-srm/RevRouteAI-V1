import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import { Plus, Trash2, Users } from 'lucide-react';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ customer_id: '', customer_name: '', contact: '' });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.getCustomers();
      setCustomers(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.createCustomer(form);
      setIsModalOpen(false);
      setForm({ customer_id: '', customer_name: '', contact: '' });
      loadCustomers();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to delete customer '${id}'?`)) {
      try {
        await api.deleteCustomer(id);
        loadCustomers();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900">Customer Directory</h2>
          <p className="text-xs text-slate-500">Manage registered logistics clients and contract partners</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {loading ? (
        <div className="p-8 text-center text-slate-500 text-sm font-medium">Loading customers...</div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-8 sm:p-12 text-center">
          <Users size={40} className="mx-auto text-slate-400 mb-3" />
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">No Customers Found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">Add your first logistics customer to create contracts and shipments.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg"
          >
            Add Customer
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Scrollable Container for Table */}
          <div className="overflow-x-auto min-w-full block">
            <table className="w-full text-left text-sm min-w-[500px]">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
                <tr>
                  <th className="px-4 sm:px-6 py-3.5">Customer ID</th>
                  <th className="px-4 sm:px-6 py-3.5">Customer Name</th>
                  <th className="px-4 sm:px-6 py-3.5">Contact Details</th>
                  <th className="px-4 sm:px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {customers.map((c) => (
                  <tr key={c.customer_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-bold text-blue-600 font-mono text-xs">{c.customer_id}</td>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-slate-900">{c.customer_name}</td>
                    <td className="px-4 sm:px-6 py-4 text-slate-600 text-xs sm:text-sm">{c.contact || 'N/A'}</td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(c.customer_id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Customer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Customer">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer ID</label>
            <input
              type="text"
              required
              placeholder="e.g. CUST-105"
              value={form.customer_id}
              onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Name</label>
            <input
              type="text"
              required
              placeholder="e.g. South Logistics Pvt Ltd"
              value={form.customer_name}
              onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email / Phone</label>
            <input
              type="text"
              placeholder="+91 98000 11111 / contact@domain.com"
              value={form.contact}
              onChange={(e) => setForm({ ...form, contact: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-500"
            >
              Save Customer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
