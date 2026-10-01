import { API_BASE_URL, SERVER_BASE_URL } from '../config/env';

export async function fetchApi(endpoint, options = {}, driverId = 2) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-Driver-ID': String(driverId), // Dev identity header transmitted to server
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

    return await response.json();
  } catch (error) {
    if (error.message.includes('Network request failed') || error.message.includes('Failed to fetch')) {
      throw new Error('Network connection failed. Please check your internet or LAN API connection.');
    }
    throw error;
  }
}

export const driverApi = {
  // Authentication
  login: (credentials) => fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  }),

  // Driver Profile & Assigned Vehicle (Identity derived server-side via X-Driver-ID header)
  getDriverProfile: (driverId = 2) => fetchApi('/driver/me', {}, driverId),
  getAssignedVehicle: (driverId = 2) => fetchApi('/driver/vehicle', {}, driverId),
  
  // Driver Trips & Submissions History
  getDriverTrips: (driverId = 2) => fetchApi('/driver/trips', {}, driverId),
  getDriverHistory: (driverId = 2) => fetchApi('/driver/history', {}, driverId),
  getDriverNotifications: (driverId = 2) => fetchApi('/driver/notifications', {}, driverId),

  // Driver Submissions (Server-side enforces driver_id & assigned vehicle_id)
  submitDriverFuel: (payload, driverId = 2) => fetchApi('/driver/fuel', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, driverId),

  submitDriverRepair: (payload, driverId = 2) => fetchApi('/driver/repair', {
    method: 'POST',
    body: JSON.stringify(payload),
  }, driverId),

  // Document Upload & OCR Extractor
  uploadDocument: async (fileUri, fileName, mimeType, docType = 'fuel') => {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      name: fileName || `receipt_${Date.now()}.${mimeType?.split('/')[1] || 'jpg'}`,
      type: mimeType || 'image/jpeg',
    });
    formData.append('doc_type', docType);

    const res = await fetch(`${API_BASE_URL}/documents/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Document upload failed.');
    }

    return await res.json();
  },

  // Helper to resolve document full URL
  resolveDocumentUrl: (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    const cleanPath = path.replace(/^\/+/, '');
    return `${SERVER_BASE_URL}/${cleanPath}`;
  }
};
