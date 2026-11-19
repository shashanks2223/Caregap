import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Shield,
  FileCheck2,
  Calendar
} from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminClaimsPage: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [filteredClaims, setFilteredClaims] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState<boolean>(true);

  // Adjudication Modal State
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [eligibilityResult, setEligibilityResult] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/claims');
      setClaims(res.data);
      setFilteredClaims(res.data);
    } catch (e) {
      console.log('Error fetching admin claims:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let list = [...claims];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        c =>
          c.claim_number.toLowerCase().includes(q) ||
          (c.caregiver?.full_name || '').toLowerCase().includes(q) ||
          (c.incident_description || '').toLowerCase().includes(q) ||
          (c.termination_reason || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter !== 'ALL') {
      list = list.filter(c => c.status === statusFilter);
    }
    if (typeFilter !== 'ALL') {
      list = list.filter(c => c.claim_type === typeFilter);
    }
    setFilteredClaims(list);
  }, [search, statusFilter, typeFilter, claims]);

  const openAdjudicate = async (claim: any) => {
    setSelectedClaim(claim);
    setAdminNotes(claim.admin_notes || 'Verified against prototype conditions.');
    setRejectionReason(claim.rejection_reason || '');
    setEligibilityResult(null);

    // Call eligibility evaluation engine
    try {
      const elRes = await api.post(`/claims/evaluate-eligibility/${claim.id}`);
      setEligibilityResult(elRes.data);
    } catch (e) {
      console.log('Eligibility evaluation error:', e);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedClaim) return;
    setActionLoading(true);
    setMsg(null);

    try {
      await api.put(`/claims/${selectedClaim.id}/status`, {
        status: newStatus,
        admin_notes: adminNotes,
        rejection_reason: newStatus === 'REJECTED' ? rejectionReason || 'Failed eligibility criteria' : null,
        approved_benefit_amount: newStatus === 'APPROVED' ? selectedClaim.calculated_benefit_amount : null
      });

      setMsg({ text: `Claim ${selectedClaim.claim_number} updated to ${newStatus}.`, type: 'success' });
      setSelectedClaim(null);
      fetchClaims();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Status update failed.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="Claims Adjudication Queue"
          subtitle="Review submitted caregiver claims, evaluate rules, and approve payouts"
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

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by claim #, caregiver, reason..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUBMITTED">Submitted</option>
                <option value="DOCUMENT_VERIFICATION">Document Verification</option>
                <option value="EMPLOYMENT_VERIFICATION">Employment Verification</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-teal-500"
              >
                <option value="ALL">All Types</option>
                <option value="OPTION_A">Option A (Medical)</option>
                <option value="OPTION_B">Option B (Job Loss)</option>
              </select>
            </div>
          </div>

          {/* Claims Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Claim ID</th>
                    <th className="p-3.5">Caregiver</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Claimed Reason / Diagnosis</th>
                    <th className="p-3.5">Duration</th>
                    <th className="p-3.5">Calculated Benefit</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Adjudication</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClaims.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No claims match your active filters.
                      </td>
                    </tr>
                  ) : (
                    filteredClaims.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5 font-bold text-navy-800">
                          {c.claim_number}
                          {c.fraud_flag && (
                            <span className="ml-1.5 px-1.5 py-0.2 rounded text-[9px] bg-rose-100 text-rose-700 font-bold">
                              Flagged
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 font-semibold text-slate-800">
                          {c.caregiver?.full_name || 'Caregiver'}
                        </td>
                        <td className="p-3.5">
                          <span className="font-semibold text-slate-700">{c.claim_type}</span>
                        </td>
                        <td className="p-3.5 text-slate-600 max-w-xs truncate">
                          {c.claim_type === 'OPTION_A' ? c.incident_description : c.termination_reason}
                        </td>
                        <td className="p-3.5 text-slate-600">{c.benefit_duration_days} Days</td>
                        <td className="p-3.5 font-bold text-navy-800">
                          ₹{c.calculated_benefit_amount?.toLocaleString('en-IN')}
                        </td>
                        <td className="p-3.5"><StatusBadge status={c.status} /></td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => openAdjudicate(c)}
                            className="px-3 py-1.5 rounded-lg bg-navy-800 text-white font-semibold hover:bg-navy-900 transition-colors"
                          >
                            Review & Adjudicate
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Adjudication Modal */}
          {selectedClaim && (
            <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 border border-slate-200 shadow-2xl my-8">
                
                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-navy-800">
                        Adjudicate Claim {selectedClaim.claim_number}
                      </h3>
                      <StatusBadge status={selectedClaim.status} />
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Insured: {selectedClaim.caregiver?.full_name} &bull; Type: {selectedClaim.claim_type}
                    </p>
                  </div>
                  <button onClick={() => setSelectedClaim(null)} className="text-xs text-slate-400 hover:text-slate-700 font-bold">
                    ✕
                  </button>
                </div>

                {/* Eligibility Engine Pre-check Assessment */}
                {eligibilityResult && (
                  <div className={`p-4 rounded-2xl text-xs space-y-2 border ${
                    eligibilityResult.is_eligible
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                      : 'bg-rose-50/80 border-rose-200 text-rose-900'
                  }`}>
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        Eligibility Engine Rules Check:
                      </span>
                      <span>{eligibilityResult.is_eligible ? 'PASSED QUALIFYING RULES' : 'EXCLUSION OR INELIGIBILITY TRIGGERED'}</span>
                    </div>
                    <p className="italic">"{eligibilityResult.evaluation_notes}"</p>
                    
                    {eligibilityResult.failed_checks?.length > 0 && (
                      <div className="text-[11px] text-rose-800 space-y-0.5 pt-1">
                        <p className="font-semibold">Failed Conditions:</p>
                        {eligibilityResult.failed_checks.map((fc: string, i: number) => (
                          <div key={i} className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            <span>{fc}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Claim Specific Information */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p><strong>Claimed Description:</strong> {selectedClaim.claim_type === 'OPTION_A' ? selectedClaim.incident_description : selectedClaim.termination_reason}</p>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-1">
                    <span><strong>Duration Days:</strong> {selectedClaim.benefit_duration_days}</span>
                    <span><strong>Calculated Potential Benefit:</strong> ₹{selectedClaim.calculated_benefit_amount?.toLocaleString('en-IN')}</span>
                    <span><strong>Employer Verified:</strong> {selectedClaim.employer_verified ? 'Yes (Confirmed)' : 'Pending / Not Applicable'}</span>
                    <span><strong>Policy Number:</strong> {selectedClaim.policy?.policy_number}</span>
                  </div>
                </div>

                {/* Documents & AI Validation */}
                <div className="space-y-2 text-xs">
                  <h4 className="font-bold text-navy-800">Attached Documents & AI Audit:</h4>
                  {selectedClaim.documents?.length === 0 ? (
                    <p className="text-slate-400 italic">No verification documents attached.</p>
                  ) : (
                    selectedClaim.documents?.map((doc: any) => (
                      <div key={doc.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{doc.file_name}</p>
                          <p className="text-[10px] text-slate-500">{doc.ai_validation_notes}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          {doc.ai_validation_status?.toUpperCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Adjuster Notes Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriter Remarks</label>
                  <textarea
                    rows={2}
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Rejection Reason if rejecting */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Rejection Reason (if applicable)</label>
                  <input
                    type="text"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Provide specific exclusion citation..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('REJECTED')}
                    className="flex-1 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs transition-colors"
                  >
                    Reject Claim
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('UNDER_REVIEW')}
                    className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-bold text-xs transition-colors"
                  >
                    Request Documents
                  </button>
                  <button
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus('APPROVED')}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Approve Benefit (₹{selectedClaim.calculated_benefit_amount?.toLocaleString('en-IN')})
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

