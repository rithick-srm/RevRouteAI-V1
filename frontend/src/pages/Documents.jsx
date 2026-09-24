import React, { useState } from 'react';
import { api } from '../services/api';
import { FolderArchive, Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';

export default function Documents() {
  const [file, setFile] = useState(null);
  const [docType, setDocType] = useState('contracts');
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [editedFields, setEditedFields] = useState({});

  const handleFileChange = (e) => {
    setFile(e.target.files[0] || null);
    setResult(null);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      const res = await api.uploadDocument(file, docType);
      setResult(res);
      setEditedFields(res.extraction?.extracted_fields || {});
    } catch (err) {
      alert(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h2 className="text-base sm:text-lg font-bold text-slate-900">AI Document Processing & Extraction Hub</h2>
        <p className="text-xs text-slate-500">Extract structured parameters from PDF contracts, invoices, and maintenance/fuel receipts with manual correction fallback</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Form */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Upload size={16} className="text-blue-600" /> Upload Document File
          </h3>

          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Document Category</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
              >
                <option value="contracts">Contract Agreement (PDF / Image)</option>
                <option value="invoices">Customer Billing Invoice (PDF / Image)</option>
                <option value="maintenance">Maintenance Receipt (PDF / Image)</option>
                <option value="fuel">Fuel Purchase Receipt (PDF / Image)</option>
              </select>
            </div>

            <div className="p-4 sm:p-6 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50 hover:bg-slate-100 transition-colors">
              <FileText size={36} className="mx-auto text-slate-400 mb-2" />
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} className="text-xs text-slate-600 max-w-full" />
              <p className="text-[11px] text-slate-400 mt-1">Supported: PDF, JPG, JPEG, PNG (Max 10 MB)</p>
            </div>

            <button
              type="submit"
              disabled={!file || uploading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white font-semibold text-sm rounded-lg shadow-xs flex items-center justify-center gap-2"
            >
              {uploading ? 'Extracting Fields...' : 'Process Document AI'}
            </button>
          </form>
        </div>

        {/* Extraction Result Panel */}
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" /> Suggested Fields & Manual Verification
          </h3>

          {!result ? (
            <div className="p-8 text-center text-slate-400 text-xs italic">
              Upload a document on the left to inspect extracted structured fields.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">{result.extraction?.message}</p>
                  <p className="text-[11px] text-amber-700 mt-0.5">AI extracts fields for manager verification. Edit any field below before saving.</p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 uppercase">Extracted Key-Value Fields</h4>
                {Object.keys(editedFields).length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No automated fields found. Enter values manually.</p>
                ) : (
                  Object.entries(editedFields).map(([key, val]) => (
                    <div key={key} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 text-xs">
                      <span className="font-semibold text-slate-700 uppercase tracking-wide shrink-0">{key.replace(/_/g, ' ')}:</span>
                      <input
                        type="text"
                        value={val !== null && val !== undefined ? val : ''}
                        onChange={(e) => setEditedFields({ ...editedFields, [key]: e.target.value })}
                        className="px-2 py-1 border rounded bg-white font-mono text-slate-900 w-full sm:w-1/2 text-left sm:text-right"
                      />
                    </div>
                  ))
                )}
              </div>

              <div className="p-3 bg-slate-900 text-slate-300 rounded-lg text-[11px] font-mono overflow-x-auto">
                <p className="font-bold text-slate-100 mb-1">Raw Document Text Preview:</p>
                {result.extraction?.raw_text || 'No raw text available.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
