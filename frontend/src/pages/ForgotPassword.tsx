import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail, Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../services/api';
import { PrototypeNotice } from '../components/PrototypeNotice';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState<1 | 2>(1);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setStep(2);
      setMsg('Demo reset token generated. Set your new password below.');
    } catch (e) {
      setStep(2);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { email, new_password: newPassword, reset_token: 'CG-RESET-DEMO' });
      setMsg('Password updated successfully! You can now log in.');
    } catch (err: any) {
      setMsg(err.response?.data?.detail || 'Reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-between">
      <PrototypeNotice />
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold text-navy-800">Password Recovery</h2>
            <p className="text-xs text-slate-500">Reset your prototype account access</p>
          </div>

          {msg && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-xs">
              {msg}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Registered Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="caregiver@caregap.demo"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Send Recovery Token
              </button>
            </form>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter at least 6 characters"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs"
              >
                Set New Password
              </button>
            </form>
          )}

          <div className="text-center text-xs pt-2">
            <Link to="/login" className="text-teal-600 font-medium hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

