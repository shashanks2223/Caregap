import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PrototypeNotice } from '../components/PrototypeNotice';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { role } = await login(email, password);
      if (role === 'admin') navigate('/admin');
      else if (role === 'employer') navigate('/employer');
      else navigate('/caregiver');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('CareGap@2026!');
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-between">
      <PrototypeNotice />
      
      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md space-y-6">
          
          {/* Brand header */}
          <div className="text-center space-y-2">
            <Link to="/" className="inline-flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-navy-800 text-teal-400 flex items-center justify-center shadow-sm">
                <Shield className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-navy-800 tracking-tight">
                CareGap <span className="text-teal-600">AI</span>
              </span>
            </Link>
            <h2 className="text-xl font-bold text-navy-800">Sign in to your account</h2>
            <p className="text-xs text-slate-500">Access your protection policies, claims, or agency portal</p>
          </div>

          {/* Quick Demo Access Bar */}
          <div className="bg-white rounded-2xl p-4 border border-teal-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-navy-800">
              <span className="flex items-center gap-1.5 text-teal-700">
                <Sparkles className="w-3.5 h-3.5" />
                One-Click Demo Accounts
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Pre-seeded with realistic data</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <button
                type="button"
                onClick={() => fillDemo('caregiver@caregap.demo')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 font-medium text-slate-700 hover:text-teal-800 transition-colors"
              >
                Caregiver
              </button>
              <button
                type="button"
                onClick={() => fillDemo('employer@caregap.demo')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 font-medium text-slate-700 hover:text-teal-800 transition-colors"
              >
                Care Agency
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@caregap.demo')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-teal-50 border border-slate-200 hover:border-teal-300 font-medium text-slate-700 hover:text-teal-800 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@caregap.demo"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">Password</label>
                  <Link to="/forgot-password" className="text-[11px] text-teal-600 hover:text-teal-700 font-medium">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-teal-600 font-semibold hover:underline">
                Register as a Caregiver or Agency
              </Link>
            </div>
          </div>

        </div>
      </div>

      <div className="py-4 text-center text-xs text-slate-400">
        Academic Insurtech Demonstration &bull; Safe Sandbox Environment
      </div>
    </div>
  );
};

