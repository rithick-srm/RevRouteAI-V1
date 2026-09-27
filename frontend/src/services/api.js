const API_BASE = '/api';

export async function fetchApi(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    let errorDetail = 'An API error occurred';
    try {
      const errData = await response.json();
      errorDetail = errData.detail || errorDetail;
    } catch (e) {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (credentials) => fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),

  // Dashboard
  getDashboard: () => fetchApi('/dashboard'),

  // Customers
  getCustomers: () => fetchApi('/customers'),
  createCustomer: (data) => fetchApi('/customers', { method: 'POST', body: JSON.stringify(data) }),
  deleteCustomer: (id) => fetchApi(`/customers/${id}`, { method: 'DELETE' }),

  // Contracts
  getContracts: () => fetchApi('/contracts'),
  getContract: (id) => fetchApi(`/contracts/${id}`),
  createContract: (data) => fetchApi('/contracts', { method: 'POST', body: JSON.stringify(data) }),
  verifyContract: (id, status = 'VERIFIED') => fetchApi(`/contracts/${id}/verify?status=${status}`, { method: 'PUT' }),
  deleteContract: (id) => fetchApi(`/contracts/${id}`, { method: 'DELETE' }),

  // Shipments
  getShipments: () => fetchApi('/shipments'),
  getShipment: (id) => fetchApi(`/shipments/${id}`),
  createShipment: (data) => fetchApi('/shipments', { method: 'POST', body: JSON.stringify(data) }),
  deleteShipment: (id) => fetchApi(`/shipments/${id}`, { method: 'DELETE' }),

  // Invoices
  getInvoices: () => fetchApi('/invoices'),
  getInvoice: (id) => fetchApi(`/invoices/${id}`),
  createInvoice: (data) => fetchApi('/invoices', { method: 'POST', body: JSON.stringify(data) }),
  verifyInvoice: (id, status = 'VERIFIED') => fetchApi(`/invoices/${id}/verify?status=${status}`, { method: 'PUT' }),
  deleteInvoice: (id) => fetchApi(`/invoices/${id}`, { method: 'DELETE' }),

  // Vehicles & Baselines
  getVehicles: () => fetchApi('/vehicles'),
  createVehicle: (data) => fetchApi('/vehicles', { method: 'POST', body: JSON.stringify(data) }),
  updateVehicleBaseline: (id, data) => fetchApi(`/vehicles/${id}/baseline`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteVehicle: (id) => fetchApi(`/vehicles/${id}`, { method: 'DELETE' }),

  // AI Fleet Audit Assistant
  askAssistant: (question) => fetchApi('/ai/ask', { method: 'POST', body: JSON.stringify({ question }) }),

  // Maintenance
  getMaintenanceBenchmarks: () => fetchApi('/maintenance/benchmarks'),
  createBenchmark: (data) => fetchApi('/maintenance/benchmarks', { method: 'POST', body: JSON.stringify(data) }),
  updateBenchmark: (id, data) => fetchApi(`/maintenance/benchmarks/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getMaintenanceLogs: () => fetchApi('/maintenance'),
  createMaintenanceLog: (data) => fetchApi('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  deleteMaintenanceLog: (id) => fetchApi(`/maintenance/${id}`, { method: 'DELETE' }),

  // Fuel
  getFuelLogs: () => fetchApi('/fuel'),
  createFuelLog: (data) => fetchApi('/fuel', { method: 'POST', body: JSON.stringify(data) }),
  deleteFuelLog: (id) => fetchApi(`/fuel/${id}`, { method: 'DELETE' }),

  // Audit Execution
  getAuditResults: () => fetchApi('/audit/results'),
  runBillingAudit: (shipmentId) => fetchApi(`/audit/billing?shipment_id=${shipmentId}`, { method: 'POST' }),
  runMaintenanceAudit: (repairId) => fetchApi(`/audit/maintenance?repair_id=${repairId}`, { method: 'POST' }),
  runFuelAudit: (fuelLogId) => fetchApi(`/audit/fuel?fuel_log_id=${fuelLogId}`, { method: 'POST' }),

  // Alerts
  getAlerts: () => fetchApi('/alerts'),
  getAlert: (id) => fetchApi(`/alerts/${id}`),
  updateAlertStatus: (id, status) => fetchApi(`/alerts/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Action Cases
  getActionCases: () => fetchApi('/action-cases'),
  getActionCase: (id) => fetchApi(`/action-cases/${id}`),
  createActionCase: (data) => fetchApi('/action-cases', { method: 'POST', body: JSON.stringify(data) }),
  updateActionCase: (id, data) => fetchApi(`/action-cases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteActionCase: (id) => fetchApi(`/action-cases/${id}`, { method: 'DELETE' }),

  // Driver Portal APIs
  getDriverProfile: (driverId = 2) => fetchApi(`/driver/me?driver_id=${driverId}`),
  getDriverHistory: (driverId = 2) => fetchApi(`/driver/history?driver_id=${driverId}`),
  submitDriverFuel: (data) => fetchApi('/driver/fuel', { method: 'POST', body: JSON.stringify(data) }),
  submitDriverRepair: (data) => fetchApi('/driver/repair', { method: 'POST', body: JSON.stringify(data) }),

  // Documents Upload
  uploadDocument: async (file, docType = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('doc_type', docType);

    const res = await fetch('/api/documents/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Upload failed');
    }
    return res.json();
  }
};
