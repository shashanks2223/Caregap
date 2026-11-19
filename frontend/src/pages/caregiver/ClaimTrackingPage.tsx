import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Building,
  Check,
  ChevronRight,
  Shield,
  FileCheck2,
  Sparkles
} from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatusBadge } from '../../components/StatusBadge';
import { ChatWidget } from '../../components/ChatWidget';

export const ClaimTrackingPage: React.FC = () => {
  const [claims, setClaims] = useState<any[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchClaims();
  }, []);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/claims');
      setClaims(res.data);
      if (res.data.length > 0) {
        setSelectedClaim(res.data[0]);
      }
    } catch (e) {
      console.log('Error fetching claims:', e);
    } finally {
      setLoading(false);
    }
  };

  const stepsA = [
    { key: 'SUBMITTED', label: 'Claim Submitted' },
    { key: 'DOCUMENT_VERIFICATION', label: 'Document Verification' },
    { key: 'UNDER_REVIEW', label: 'Adjuster Review' },
    { key: 'APPROVED', label: 'Benefit Approved & Disbursed' }
  ];

  const stepsB = [
    { key: 'SUBMITTED', label: 'Claim Filed' },
    { key: 'EMPLOYMENT_VERIFICATION', label: 'Employer / Agency Check' },
    { key: 'UNDER_REVIEW', label: 'Continuity Review' },
    { key: 'APPROVED', label: 'Benefit Approved' }
  ];

  const stepsPG = [
    { key: 'SUBMITTED', label: 'Claim Filed' },
    { key: 'DOCUMENT_VERIFICATION', label: 'Onboarding Check' },
    { key: 'UNDER_REVIEW', label: '15-Day Verification' },
    { key: 'APPROVED', label: '15-Day Salary Disbursed' }
  ];

  const getStepIndex = (status: string, isOptionB: boolean) => {
    const list = isOptionB ? ['SUBMITTED', 'EMPLOYMENT_VERIFICATION', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED'] : ['SUBMITTED', 'DOCUMENT_VERIFICATION', 'UNDER_REVIEW', 'APPROVED', 'COMPLETED'];
    const idx = list.indexOf(status);
    return idx >= 0 ? idx : 0;
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Claim Tracking & Disbursal" subtitle="Live step-by-step progress and verification status" />

        <main className="p-6 max-w-6xl space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Claims List */}
            <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-navy-800 uppercase tracking-wider px-1">
                Your Claims ({claims.length})
              </h3>

              <div className="space-y-2">
                {claims.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No filed claims found.</div>
                ) : (
                  claims.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClaim(c)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedClaim?.id === c.id
                          ? 'bg-teal-50/70 border-teal-500 shadow-xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-xs text-navy-800">{c.claim_number}</span>
                        <StatusBadge status={c.status} />
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-1">
                        {c.claim_type === 'OPTION_A' ? c.incident_description : (c.claim_type === 'PLACEMENT_GAP' ? `Placement Gap (${c.days_unassigned || 15} days unassigned)` : c.termination_reason)}
                      </p>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2 pt-2 border-t border-slate-100">
                        <span>{c.claim_type}</span>
                        <span className="font-bold text-navy-800">₹{c.calculated_benefit_amount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Active Claim Stepper & Details */}
            {selectedClaim ? (
              <div className="lg:col-span-8 space-y-6">
                
                {/* Visual Workflow Stepper */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-navy-800">{selectedClaim.claim_number}</h3>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold text-slate-700">
                          {selectedClaim.claim_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Filed on {new Date(selectedClaim.created_at).toLocaleDateString()}
                      </p>
                    </div>

                    <StatusBadge status={selectedClaim.status} />
                  </div>

                  {/* Multi-step progress visual */}
                  <div className="pt-2">
                    <p className="text-xs font-semibold text-navy-800 mb-4">Adjudication Pipeline</p>
                    
                    <div className="relative flex justify-between items-center">
                      <div className="absolute top-1/2 left-4 right-4 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
                      
                      {(selectedClaim.claim_type === 'OPTION_B' ? stepsB : (selectedClaim.claim_type === 'PLACEMENT_GAP' ? stepsPG : stepsA)).map((step, idx) => {
                        const currentIdx = getStepIndex(selectedClaim.status, selectedClaim.claim_type === 'OPTION_B');
                        const isDone = idx <= currentIdx;
                        const isCurrent = idx === currentIdx;

                        return (
                          <div key={idx} className="relative z-10 flex flex-col items-center text-center">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                                isDone
                                  ? 'bg-teal-600 text-white shadow-xs'
                                  : 'bg-white border-2 border-slate-300 text-slate-400'
                              } ${isCurrent ? 'ring-4 ring-teal-100' : ''}`}
                            >
                              {isDone ? <Check className="w-4 h-4" /> : idx + 1}
                            </div>
                            <span className="text-[10px] font-medium text-slate-700 mt-2 max-w-[80px]">
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Financial calculation breakdown */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Regular Salary</span>
                      <p className="font-bold text-navy-800 mt-0.5">
                        ₹{selectedClaim.claimed_salary?.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Duration Count</span>
                      <p className="font-bold text-navy-800 mt-0.5">
                        {selectedClaim.benefit_duration_days} Days
                      </p>
                    </div>
                    <div>
                      <span className="text-slate-500">Approved Benefit</span>
                      <p className="font-bold text-emerald-700 mt-0.5">
                        ₹{(selectedClaim.approved_benefit_amount || selectedClaim.calculated_benefit_amount)?.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Remarks & Notes */}
                  {selectedClaim.admin_notes && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/70 border border-teal-200 text-xs text-teal-900 space-y-1">
                      <span className="font-bold">Adjuster Remarks:</span>
                      <p className="text-slate-700">{selectedClaim.admin_notes}</p>
                    </div>
                  )}

                  {selectedClaim.rejection_reason && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-900 space-y-1">
                      <span className="font-bold">Claim Rejection Notice:</span>
                      <p className="text-slate-700">{selectedClaim.rejection_reason}</p>
                    </div>
                  )}

                  {/* Documents & AI Validation section */}
                  <div className="space-y-3 pt-2">
                    <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider">
                      Attached Documents ({selectedClaim.documents?.length || 0})
                    </h4>

                    {selectedClaim.documents?.map((doc: any) => (
                      <div
                        key={doc.id}
                        className="p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-teal-600 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">{doc.file_name}</p>
                            <p className="text-[10px] text-slate-400 capitalize">{doc.document_type.replace('_', ' ')}</p>
                          </div>
                        </div>

                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {doc.ai_validation_status?.toUpperCase() || 'VALID'}
                        </span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>
            ) : (
              <div className="lg:col-span-8 bg-white p-12 rounded-3xl border border-slate-200 text-center text-xs text-slate-400">
                Select a claim to review tracking details.
              </div>
            )}

          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

