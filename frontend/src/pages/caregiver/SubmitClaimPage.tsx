import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  UserX,
  Upload,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { ChatWidget } from '../../components/ChatWidget';

export const SubmitClaimPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'OPTION_A' | 'OPTION_B'>('OPTION_A');
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form State: Option A (Medical)
  const [claimA, setClaimA] = useState({
    policy_id: '',
    incident_date: '2026-10-15',
    incident_description: 'Sprained wrist and lower back muscular strain during patient mobility lifting.',
    interruption_start_date: '2026-10-16',
    expected_recovery_date: '2026-11-05',
    claimed_salary: 20000
  });

  // Form State: Option B (Job Loss)
  const [claimB, setClaimB] = useState({
    policy_id: '',
    termination_date: '2026-10-01',
    termination_reason: 'Elderly patient recovered fully and household discontinued daily attendant service.',
    employer_name: 'CareBridge Senior Living & Homecare',
    employer_contact: '9820123456',
    last_working_date: '2026-09-30',
    previous_monthly_salary: 20000,
    claimed_salary: 20000
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/policies');
      setPolicies(res.data);
      if (res.data.length > 0) {
        setClaimA(prev => ({ ...prev, policy_id: res.data[0].id }));
        setClaimB(prev => ({ ...prev, policy_id: res.data[0].id }));
      }
    } catch (e) {
      console.log('Error fetching policies:', e);
    }
  };

  const handleSubmitA = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      const res = await api.post('/claims/submit-option-a', {
        policy_id: Number(claimA.policy_id),
        incident_date: claimA.incident_date,
        incident_description: claimA.incident_description,
        interruption_start_date: claimA.interruption_start_date,
        expected_recovery_date: claimA.expected_recovery_date,
        claimed_salary: Number(claimA.claimed_salary)
      });

      const claimId = res.data.id;

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('document_type', 'medical_certificate');
        formData.append('file', selectedFile);
        await api.post(`/claim-documents/upload/${claimId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setMsg({
        text: `Claim ${res.data.claim_number} successfully submitted! Moving to automated document verification.`,
        type: 'success'
      });
      setTimeout(() => navigate('/caregiver/claims'), 1500);
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Failed to submit claim.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitB = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg(null);

    try {
      const res = await api.post('/claims/submit-option-b', {
        policy_id: Number(claimB.policy_id),
        termination_date: claimB.termination_date,
        termination_reason: claimB.termination_reason,
        employer_name: claimB.employer_name,
        employer_contact: claimB.employer_contact,
        last_working_date: claimB.last_working_date,
        previous_monthly_salary: Number(claimB.previous_monthly_salary),
        claimed_salary: Number(claimB.claimed_salary)
      });

      const claimId = res.data.id;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('document_type', 'termination_letter');
        formData.append('file', selectedFile);
        await api.post(`/claim-documents/upload/${claimId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setMsg({
        text: `Continuity claim ${res.data.claim_number} filed! Employment verification request sent to your agency.`,
        type: 'success'
      });
      setTimeout(() => navigate('/caregiver/claims'), 1500);
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Failed to submit claim.', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Submit Income Protection Claim" subtitle="Select your claim type and attach verifiable proof" />

        <main className="p-6 max-w-4xl space-y-6">
          {msg && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Type Selector Tabs */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab('OPTION_A');
                setSelectedFile(null);
              }}
              className={`p-5 rounded-3xl border text-left flex items-start gap-3.5 transition-all ${
                activeTab === 'OPTION_A'
                  ? 'bg-teal-50/60 border-teal-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeTab === 'OPTION_A' ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Option A</span>
                <h3 className="text-sm font-bold text-navy-800">Medical Incapacity Claim</h3>
                <p className="text-xs text-slate-500 mt-0.5">Physical illness or accidental injury preventing work</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('OPTION_B');
                setSelectedFile(null);
              }}
              className={`p-5 rounded-3xl border text-left flex items-start gap-3.5 transition-all ${
                activeTab === 'OPTION_B'
                  ? 'bg-blue-50/60 border-blue-500 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className={`p-2 rounded-xl ${activeTab === 'OPTION_B' ? 'bg-navy-800 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <UserX className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-navy-700">Option B</span>
                <h3 className="text-sm font-bold text-navy-800">Involuntary Job Loss Claim</h3>
                <p className="text-xs text-slate-500 mt-0.5">Family contract ended or patient care concluded</p>
              </div>
            </button>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            
            {activeTab === 'OPTION_A' ? (
              <form onSubmit={handleSubmitA} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-800">Option A: Medical Incapacity Claim Details</h3>
                  <p className="text-xs text-slate-500">Provide medical details and duration of work interruption</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Policy</label>
                    <select
                      value={claimA.policy_id}
                      onChange={(e) => setClaimA({ ...claimA, policy_id: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    >
                      {policies.map(p => (
                        <option key={p.id} value={p.id}>{p.policy_number} - {p.plan?.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Incident / Onset</label>
                    <input
                      type="date"
                      required
                      value={claimA.incident_date}
                      onChange={(e) => setClaimA({ ...claimA, incident_date: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Diagnosis & Incident Description</label>
                  <textarea
                    rows={3}
                    required
                    value={claimA.incident_description}
                    onChange={(e) => setClaimA({ ...claimA, incident_description: e.target.value })}
                    placeholder="Describe how the injury or illness occurred and why it prevents lifting/care duties..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Interruption Start Date</label>
                    <input
                      type="date"
                      required
                      value={claimA.interruption_start_date}
                      onChange={(e) => setClaimA({ ...claimA, interruption_start_date: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Recovery Date</label>
                    <input
                      type="date"
                      required
                      value={claimA.expected_recovery_date}
                      onChange={(e) => setClaimA({ ...claimA, expected_recovery_date: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* File Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Attach Doctor's Certificate / Discharge Proof (PDF / Images)
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-teal-500 transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="fileA"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                    <label htmlFor="fileA" className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 text-teal-600 mx-auto" />
                      <p className="text-xs font-semibold text-navy-800">
                        {selectedFile ? selectedFile.name : 'Click to upload Medical Certificate'}
                      </p>
                      <p className="text-[10px] text-slate-400">PDF, PNG, or JPG up to 10MB</p>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Submitting & Analyzing Proof...' : 'Submit Option A Claim'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmitB} className="space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-800">Option B: Involuntary Job Loss Claim Details</h3>
                  <p className="text-xs text-slate-500">Provide termination details for agency verification</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Select Policy</label>
                    <select
                      value={claimB.policy_id}
                      onChange={(e) => setClaimB({ ...claimB, policy_id: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    >
                      {policies.map(p => (
                        <option key={p.id} value={p.id}>{p.policy_number} - {p.plan?.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Termination Notice Date</label>
                    <input
                      type="date"
                      required
                      value={claimB.termination_date}
                      onChange={(e) => setClaimB({ ...claimB, termination_date: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Involuntary Contract End</label>
                  <textarea
                    rows={3}
                    required
                    value={claimB.termination_reason}
                    onChange={(e) => setClaimB({ ...claimB, termination_reason: e.target.value })}
                    placeholder="e.g. Patient recovered / patient family relocated / agency restructuring..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white leading-relaxed"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Note: Voluntary resignations and disciplinary dismissals are excluded from Option B coverage.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Employer / Household Name</label>
                    <input
                      type="text"
                      required
                      value={claimB.employer_name}
                      onChange={(e) => setClaimB({ ...claimB, employer_name: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Last Working Day</label>
                    <input
                      type="date"
                      required
                      value={claimB.last_working_date}
                      onChange={(e) => setClaimB({ ...claimB, last_working_date: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* File Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Attach Termination Notice / WhatsApp Confirmation / Discontinuation Proof
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
                    <input
                      type="file"
                      id="fileB"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                      className="hidden"
                    />
                    <label htmlFor="fileB" className="cursor-pointer space-y-2 block">
                      <Upload className="w-8 h-8 text-navy-700 mx-auto" />
                      <p className="text-xs font-semibold text-navy-800">
                        {selectedFile ? selectedFile.name : 'Click to upload Termination Document'}
                      </p>
                      <p className="text-[10px] text-slate-400">PDF, PNG, or JPG up to 10MB</p>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-xl bg-navy-800 hover:bg-navy-900 text-white font-bold text-xs shadow-md shadow-navy-800/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                >
                  {submitting ? 'Sending for Employer Verification...' : 'Submit Option B Claim'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

