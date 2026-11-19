import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, AlertCircle, User, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PrototypeNotice } from '../components/PrototypeNotice';

export const Register: React.FC = () => {
  const [role, setRole] = useState<'caregiver' | 'employer'>('caregiver');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await register(email, password, role);
      if (res.role === 'employer') {
        navigate('/employer/onboarding');
      } else {
        navigate('/caregiver/onboarding');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be in use.');
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-xl font-bold text-navy-800">Create your account</h2>
            <p className="text-xs text-slate-500">Choose your account type to begin onboarding</p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
            {/* Role Switcher */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">I am registering as:</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('caregiver')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'caregiver'
                      ? 'bg-teal-50/60 border-teal-500 text-teal-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <User className={`w-4 h-4 mt-0.5 ${role === 'caregiver' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold">Caregiver / Nurse</p>
                    <p className="text-[10px] text-slate-500">Individual income protection</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all ${
                    role === 'employer'
                      ? 'bg-teal-50/60 border-teal-500 text-teal-900 shadow-xs'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 className={`w-4 h-4 mt-0.5 ${role === 'employer' ? 'text-teal-600' : 'text-slate-400'}`} />
                  <div>
                    <p className="text-xs font-bold">Agency / Employer</p>
                    <p className="text-[10px] text-slate-500">Manage & verify staff</p>
                  </div>
                </button>
              </div>
            </div>

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
                    placeholder={role === 'caregiver' ? 'nurse.sharma@gmail.com' : 'contact@careagency.com'}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Create Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
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
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Continue to Onboarding</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-3 border-t border-slate-100 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-teal-600 font-semibold hover:underline">
                Sign In
              </Link>
            </div>
          </div>

        </div>
      </div>

      <div className="py-4 text-center text-xs text-slate-400">
        CareGap AI Insurtech Prototype &bull; Prototype Simulation
      </div>
    </div>
  );
};

