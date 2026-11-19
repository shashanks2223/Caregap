import React, { useState, useEffect } from 'react';
import {
  Users,
  Building2,
  CheckCircle2,
  Clock,
  UserPlus,
  AlertCircle,
  Shield,
  Search,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatusBadge } from '../../components/StatusBadge';

export const EmployerDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Add Caregiver Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [addForm, setAddForm] = useState({
    caregiver_email: '',
    role_title: 'Senior Caregiver',
    start_date: '2023-01-15',
    monthly_salary: 20000
  });

  // Verification Modal State
  const [verifyModal, setVerifyModal] = useState<any>(null);
  const [verifyNotes, setVerifyNotes] = useState<string>('Contract concluded due to client cessation.');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchEmployerData();
  }, []);

  const fetchEmployerData = async () => {
    try {
      const [profRes, cgRes, verifRes] = await Promise.all([
        api.get('/employers/profile'),
        api.get('/employers/caregivers'),
        api.get('/employers/verification-requests')
      ]);

      setProfile(profRes.data);
      setCaregivers(cgRes.data);
      setVerifications(verifRes.data);
    } catch (e) {
      console.log('Error fetching employer dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCaregiver = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setMsg(null);

    try {
      await api.post('/employers/add-caregiver', addForm);
      setShowAddModal(false);
      setMsg({ text: 'Caregiver successfully added to agency roster.', type: 'success' });
      fetchEmployerData();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Failed to add caregiver.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyClaim = async (claimId: number, confirm: boolean) => {
    setActionLoading(true);
    setMsg(null);

    try {
      await api.post(`/employers/verify-termination/${claimId}`, {
        confirmed_termination: confirm,
        termination_reason_valid: confirm,
        employer_notes: verifyNotes
      });
      setVerifyModal(null);
      setMsg({
        text: `Claim response recorded. ${confirm ? 'Termination confirmed' : 'Termination disputed'}.`,
        type: 'success'
      });
      fetchEmployerData();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Action failed.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={profile?.organization_name || 'Care Agency Portal'}
          subtitle="Staff Employment Records & Involuntary Termination Verifications"
        />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {msg && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Total Affiliated Caregivers</span>
              <p className="text-2xl font-black text-navy-800">{caregivers.length}</p>
              <p className="text-[11px] text-teal-600 font-medium">Verifiable agency staff</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Active Employment Records</span>
              <p className="text-2xl font-black text-navy-800">
                {caregivers.filter(c => c.is_current).length}
              </p>
              <p className="text-[11px] text-slate-500">In good standing</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Pending Termination Checks</span>
              <p className="text-2xl font-black text-amber-600">{verifications.length}</p>
              <p className="text-[11px] text-slate-500">Option B claim requests</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-xs font-semibold text-slate-500">Monthly Protected Payroll</span>
              <p className="text-2xl font-black text-emerald-700">
                ₹{caregivers.reduce((acc, c) => acc + (c.monthly_salary || 0), 0).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-slate-500">Income protection volume</p>
            </div>
          </div>

          {/* Pending Verifications Alert Queue */}
          {verifications.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-900">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold">Action Required: Caregiver Termination Verification Requests</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-200 text-amber-900">
                  {verifications.length} Pending
                </span>
              </div>

              <p className="text-xs text-amber-900 leading-relaxed">
                The caregivers below filed Option B claims stating involuntary contract conclusion. Please confirm or dispute the circumstances. Note: Medical details are strictly hidden for privacy.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {verifications.map((v) => (
                  <div key={v.claim_id} className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-navy-800">{v.caregiver_name}</p>
                        <p className="text-[11px] font-mono text-slate-500">{v.claim_number}</p>
                      </div>
                      <StatusBadge status={v.status} />
                    </div>

                    <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{v.claimed_reason}"
                    </p>

                    <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                      <span>Last Day: {v.last_working_date}</span>
                      <button
                        onClick={() => setVerifyModal(v)}
                        className="px-3 py-1 rounded-lg bg-navy-800 text-white font-bold hover:bg-navy-900 transition-colors"
                      >
                        Respond to Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Caregivers Staff Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-navy-800">Affiliated Caregiver Staff</h3>
                <p className="text-xs text-slate-500">Manage caregiver employment records and verify monthly salary slips</p>
              </div>

              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Link Caregiver</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Caregiver Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Role Title</th>
                    <th className="p-3">Monthly Salary</th>
                    <th className="p-3">Start Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Protection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {caregivers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-6 text-center text-slate-400">
                        No caregivers linked to your agency yet. Click "Link Caregiver" to add staff.
                      </td>
                    </tr>
                  ) : (
                    caregivers.map((cg) => (
                      <tr key={cg.employment_id} className="hover:bg-slate-50/60">
                        <td className="p-3 font-semibold text-navy-800">{cg.full_name}</td>
                        <td className="p-3">{cg.category}</td>
                        <td className="p-3 text-slate-500">{cg.role_title}</td>
                        <td className="p-3 font-bold text-navy-800">₹{cg.monthly_salary?.toLocaleString('en-IN')}</td>
                        <td className="p-3 text-slate-500">{cg.start_date}</td>
                        <td className="p-3"><StatusBadge status={cg.status} /></td>
                        <td className="p-3">
                          {cg.active_protection ? (
                            <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                              Active Shield
                            </span>
                          ) : (
                            <span className="text-slate-400">Inactive</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Caregiver Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-800">Link Caregiver to Agency</h3>
                  <button onClick={() => setShowAddModal(false)} className="text-xs text-slate-400 hover:text-slate-700 font-bold">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleAddCaregiver} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Caregiver User Email</label>
                    <input
                      type="email"
                      required
                      value={addForm.caregiver_email}
                      onChange={(e) => setAddForm({ ...addForm, caregiver_email: e.target.value })}
                      placeholder="caregiver1@caregap.demo"
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Must be an existing registered caregiver.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Role Title</label>
                    <input
                      type="text"
                      required
                      value={addForm.role_title}
                      onChange={(e) => setAddForm({ ...addForm, role_title: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Start Date</label>
                      <input
                        type="date"
                        required
                        value={addForm.start_date}
                        onChange={(e) => setAddForm({ ...addForm, start_date: e.target.value })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Verified Monthly Salary (₹)</label>
                      <input
                        type="number"
                        required
                        value={addForm.monthly_salary}
                        onChange={(e) => setAddForm({ ...addForm, monthly_salary: Number(e.target.value) })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-teal-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                    >
                      {actionLoading ? 'Linking...' : 'Confirm & Link'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Verification Modal */}
          {verifyModal && (
            <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-800">Verify Involuntary Job Termination</h3>
                  <button onClick={() => setVerifyModal(null)} className="text-xs text-slate-400 hover:text-slate-700 font-bold">
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p><strong>Caregiver:</strong> {verifyModal.caregiver_name}</p>
                  <p><strong>Claim Number:</strong> {verifyModal.claim_number}</p>
                  <p><strong>Reported Reason:</strong> {verifyModal.claimed_reason}</p>
                  <p><strong>Last Working Date:</strong> {verifyModal.last_working_date}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agency Verification Remarks</label>
                  <textarea
                    rows={3}
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerifyClaim(verifyModal.claim_id, false)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
                  >
                    Dispute Termination
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerifyClaim(verifyModal.claim_id, true)}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition-colors"
                  >
                    Confirm Involuntary End
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

