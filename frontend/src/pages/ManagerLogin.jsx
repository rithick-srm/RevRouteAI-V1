import React, { useState } from 'react';
import { api } from '../services/api';
import { UserCheck, ShieldCheck, ArrowRight, ArrowLeft } from 'lucide-react';

export default function ManagerLogin({ onLoginSuccess, onBackToWelcome, onSwitchToDriver }) {
  const [email, setEmail] = useState('manager@revroute.ai');
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

  return (
    <div className="min-h-screen bg-[#0B1B32] text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 relative">
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
          <div className="w-14 h-14 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-blue-600/30">
            RR
          </div>
          <h1 className="text-2xl font-bold tracking-tight">RevRoute AI</h1>
          <p className="text-xs text-teal-400 font-semibold uppercase tracking-wider">Manager & Admin Portal</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Manager Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="manager@revroute.ai"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 font-bold text-sm rounded-xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? 'Signing In...' : 'Continue as Manager'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Demo Manager Sign-In */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider text-center">Quick Demo Manager Sign-In</p>
          <button
            type="button"
            onClick={() => {
              setEmail('manager@revroute.ai');
              setPassword('password');
            }}
            className="w-full p-3 rounded-xl border border-blue-500/40 bg-blue-600/10 hover:bg-blue-600/20 text-left text-xs transition-colors flex items-center justify-between"
          >
            <div>
              <div className="font-semibold text-white">Fleet Manager</div>
              <div className="text-[10px] text-teal-400 font-mono">manager@revroute.ai</div>
            </div>
            <UserCheck size={16} className="text-blue-400" />
          </button>
        </div>

        {/* Switch Portal Link */}
        <div className="text-center pt-2 flex flex-col gap-2">
          {onSwitchToDriver && (
            <button
              onClick={onSwitchToDriver}
              className="text-xs text-slate-400 hover:text-white underline font-medium"
            >
              Switch to Driver Portal
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
