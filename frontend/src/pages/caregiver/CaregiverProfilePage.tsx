import React, { useState, useEffect } from 'react';
import { User, Shield, CreditCard, Building, CheckCircle2, AlertCircle, Save } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { ChatWidget } from '../../components/ChatWidget';

export const CaregiverProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/caregivers/profile');
      setProfile(res.data);
    } catch (e) {
      console.log('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await api.put('/caregivers/profile', {
        full_name: profile.full_name,
        mobile_number: profile.mobile_number,
        date_of_birth: profile.date_of_birth,
        city: profile.city,
        state: profile.state,
        pin_code: profile.pin_code,
        caregiver_category: profile.caregiver_category,
        years_experience: profile.years_experience,
        monthly_salary: profile.monthly_salary,
        employment_type: profile.employment_type,
        employer_name: profile.employer_name,
        bank_name: profile.bank_name,
        bank_account_last4: profile.bank_account_last4,
        ifsc_code: profile.ifsc_code
      });
      setProfile(res.data);
      setMsg({ text: 'Profile updated successfully.', type: 'success' });
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9FC] flex">
        <Sidebar />
        <div className="flex-1 p-8 text-center text-xs text-slate-500">Loading profile data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Caregiver Profile & Bank Settings" subtitle="Manage your identity, category, and benefit payout account" />

        <main className="p-6 max-w-4xl space-y-6">
          {msg && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          <form onSubmit={handleUpdate} className="space-y-6">
            
            {/* Identity Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
                  <User className="w-4 h-4 text-teal-600" />
                  Personal Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={profile?.full_name || ''}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    value={profile?.mobile_number || ''}
                    onChange={(e) => setProfile({ ...profile, mobile_number: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={profile?.city || ''}
                    onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={profile?.state || ''}
                    onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={profile?.pin_code || ''}
                    onChange={(e) => setProfile({ ...profile, pin_code: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Employment & Salary Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
                  <Building className="w-4 h-4 text-teal-600" />
                  Employment & Salary Profile
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Caregiver Category</label>
                  <select
                    value={profile?.caregiver_category || 'Elderly Care'}
                    onChange={(e) => setProfile({ ...profile, caregiver_category: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  >
                    <option value="Elderly Care">Elderly Care</option>
                    <option value="Patient Care Assistant">Patient Care Assistant</option>
                    <option value="Home Nurse">Home Nurse</option>
                    <option value="Specialized Care">Specialized Care</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Experience (Years)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={profile?.years_experience || 1}
                    onChange={(e) => setProfile({ ...profile, years_experience: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Salary (₹)</label>
                  <input
                    type="number"
                    value={profile?.monthly_salary || 20000}
                    onChange={(e) => setProfile({ ...profile, monthly_salary: Number(e.target.value) })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-bold focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={profile?.employment_type || 'Full-Time Agency'}
                    onChange={(e) => setProfile({ ...profile, employment_type: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  >
                    <option value="Full-Time Agency">Full-Time Agency</option>
                    <option value="Direct Family Contract">Direct Family Contract</option>
                    <option value="Part-Time Multiple Homes">Part-Time Multiple Homes</option>
                    <option value="Freelance/Independent">Freelance/Independent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Affiliated Agency / Household</label>
                  <input
                    type="text"
                    value={profile?.employer_name || ''}
                    onChange={(e) => setProfile({ ...profile, employer_name: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Payout Bank Details */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                  Payout Bank Verification
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Status: {profile?.bank_verification_status || 'Verified'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={profile?.bank_name || ''}
                    onChange={(e) => setProfile({ ...profile, bank_name: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Account Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={profile?.bank_account_last4 || ''}
                    onChange={(e) => setProfile({ ...profile, bank_account_last4: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-mono focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={profile?.ifsc_code || ''}
                    onChange={(e) => setProfile({ ...profile, ifsc_code: e.target.value.toUpperCase() })}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-mono uppercase focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

