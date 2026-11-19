import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatusBadge } from '../../components/StatusBadge';

export const EmployerVerificationsPage: React.FC = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [verifyModal, setVerifyModal] = useState<any>(null);
  const [notes, setNotes] = useState<string>('Contract discontinued due to client cessation.');
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await api.get('/employers/verification-requests');
      setVerifications(res.data);
    } catch (e) {
      console.log('Error fetching verifications:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (claimId: number, confirm: boolean) => {
    setActionLoading(true);
    try {
      await api.post(`/employers/verify-termination/${claimId}`, {
        confirmed_termination: confirm,
        termination_reason_valid: confirm,
        employer_notes: notes
      });
      setVerifyModal(null);
      setMsg(`Verification recorded: ${confirm ? 'Confirmed' : 'Disputed'}.`);
      fetchVerifications();
    } catch (e) {
      alert('Verification update failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Employment Verification Requests" subtitle="Confirm involuntary caregiver contract terminations for Option B claims" />

        <main className="p-6 max-w-5xl space-y-6 flex-1 overflow-y-auto">
          {msg && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
              {msg}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs flex items-center gap-2">
            <Shield className="w-4 h-4 text-teal-600 flex-shrink-0" />
            <span>
              <strong>Privacy Protection:</strong> Employers only verify whether care service ended involuntarily. Medical diagnosis or illness details are never shown to agencies.
            </span>
          </div>

          <div className="space-y-4">
            {verifications.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                No pending termination verification requests at this time.
              </div>
            ) : (
              verifications.map((v) => (
                <div key={v.claim_id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-navy-800">{v.caregiver_name}</h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">{v.claim_number}</p>
                    </div>
                    <StatusBadge status={v.status} />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                    <span className="font-semibold text-slate-700">Reported Termination Circumstance:</span>
                    <p className="text-slate-600 italic">"{v.claimed_reason}"</p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500">Last Working Day: <strong>{v.last_working_date}</strong></span>
                    <button
                      onClick={() => setVerifyModal(v)}
                      className="px-4 py-2 rounded-xl bg-navy-800 text-white font-bold hover:bg-navy-900 transition-colors"
                    >
                      Verify Circumstances
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {verifyModal && (
            <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-800">
                    Verify Termination: {verifyModal.caregiver_name}
                  </h3>
                  <button onClick={() => setVerifyModal(null)} className="text-xs text-slate-400 hover:text-slate-700 font-bold">
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl">
                  <p><strong>Claim:</strong> {verifyModal.claim_number}</p>
                  <p><strong>Reported Reason:</strong> {verifyModal.claimed_reason}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agency Verification Remarks</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerify(verifyModal.claim_id, false)}
                    className="flex-1 py-2.5 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 text-xs font-bold transition-colors"
                  >
                    Dispute Reason
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleVerify(verifyModal.claim_id, true)}
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

