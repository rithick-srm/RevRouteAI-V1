import React, { useState } from 'react';
import { api } from '../../services/api';
import { Truck, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function DriverLogin({ onLoginSuccess, onSwitchToManager, onBackToWelcome }) {
  const [email, setEmail] = useState('driver1@revroute.ai');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const user = await api.login({ email, password });
      onLoginSuccess(user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDriverSelect = (driverEmail) => {
    setEmail(driverEmail);
    setPassword('password');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-5 sm:p-8 space-y-6">
        {/* Back to Welcome Page Button */}
        {onBackToWelcome && (
          <button
            onClick={onBackToWelcome}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors mb-2 font-medium"
          >
            <ArrowLeft size={14} /> Back to Welcome Page
          </button>
        )}

        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center font-extrabold text-white text-xl shadow-lg">
            RR
          </div>
          <h1 className="text-2xl font-bold tracking-tight">RevRoute AI</h1>
          <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Driver Mobile Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Driver Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="driver@revroute.ai"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? 'Signing In...' : 'Continue as Driver'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Drivers */}
        <div className="pt-4 border-t border-slate-700/60 space-y-2">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider text-center">Quick Demo Driver Sign-In</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDriverSelect('driver1@revroute.ai')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                email === 'driver1@revroute.ai'
                  ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="font-semibold">Ramesh Kumar</div>
              <div className="text-[10px] text-teal-400 font-mono">TRK-101</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDriverSelect('driver2@revroute.ai')}
              className={`p-2.5 rounded-xl border text-left text-xs transition-colors ${
                email === 'driver2@revroute.ai'
                  ? 'bg-blue-600/30 border-blue-500 text-white font-bold'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <div className="font-semibold">Suresh Patel</div>
              <div className="text-[10px] text-teal-400 font-mono">TRK-102</div>
            </button>
          </div>
        </div>

        {/* Switch Portal Link */}
        <div className="text-center pt-2">
          <button
            onClick={onSwitchToManager}
            className="text-xs text-slate-400 hover:text-white underline font-medium"
          >
            Switch to Management / Admin Portal
          </button>
        </div>
      </div>
    </div>
  );
}
