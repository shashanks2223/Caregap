import React, { useState, useEffect } from 'react';
import { Shield, FileCheck2, Calendar, Download, AlertCircle, ArrowUpRight } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatusBadge } from '../../components/StatusBadge';
import { ChatWidget } from '../../components/ChatWidget';

export const CaregiverPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadModal, setDownloadModal] = useState<any>(null);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const res = await api.get('/policies');
      setPolicies(res.data);
    } catch (e) {
      console.log('Error fetching policies:', e);
    } finally {
      setLoading(false);
    }
  };

  const downloadSummary = async (policyId: number) => {
    try {
      const res = await api.get(`/policies/${policyId}/download-summary`);
      setDownloadModal(res.data);
    } catch (e) {
      alert('Could not generate certificate summary.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="My Protection Policies" subtitle="View active certificates and coverage breakdowns" />

        <main className="p-6 max-w-5xl space-y-6">
          <div className="space-y-4">
            {policies.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
                <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-navy-800">No active policies found</h3>
                <p className="text-xs text-slate-500">Explore protection plans and activate your first income shield.</p>
              </div>
            ) : (
              policies.map((pol) => (
                <div
                  key={pol.id}
                  className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-navy-800">{pol.plan?.name || 'Care Shield Policy'}</h3>
                        <StatusBadge status={pol.status} />
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">Policy Number: {pol.policy_number}</p>
                    </div>

                    <button
                      onClick={() => downloadSummary(pol.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-navy-800 text-xs font-semibold transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Summary</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 font-medium">Coverage Type</span>
                      <p className="font-bold text-navy-800 mt-0.5">{pol.coverage_type}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Monthly Benefit Limit</span>
                      <p className="font-bold text-emerald-700 mt-0.5">₹{pol.max_monthly_benefit?.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Monthly Premium</span>
                      <p className="font-bold text-navy-800 mt-0.5">₹{pol.monthly_premium} / month</p>
                    </div>
                    <div>
                      <span className="text-slate-400 font-medium">Annual Renewal Date</span>
                      <p className="font-bold text-navy-800 mt-0.5">
                        {new Date(pol.renewal_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-teal-600 flex-shrink-0" />
                      <span>Waiting Period completed on: <strong>{new Date(pol.waiting_period_ends_at).toLocaleDateString()}</strong></span>
                    </div>
                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Eligible for Immediate Claims
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Certificate Download Summary Modal */}
          {downloadModal && (
            <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-teal-600" />
                    <h3 className="text-sm font-bold text-navy-800">Certificate Summary</h3>
                  </div>
                  <button onClick={() => setDownloadModal(null)} className="text-xs text-slate-400 hover:text-slate-700 font-bold">
                    ✕ Close
                  </button>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl font-mono text-slate-700">
                  <p><strong>Policy ID:</strong> {downloadModal.policy_number}</p>
                  <p><strong>Insured:</strong> {downloadModal.insured_caregiver}</p>
                  <p><strong>Category:</strong> {downloadModal.caregiver_category}</p>
                  <p><strong>Plan:</strong> {downloadModal.plan_name}</p>
                  <p><strong>Monthly Contribution:</strong> {downloadModal.monthly_premium}</p>
                  <p><strong>Guaranteed Benefit:</strong> {downloadModal.max_monthly_benefit}</p>
                  <p><strong>Renewal Date:</strong> {downloadModal.renewal_date}</p>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  {downloadModal.academic_prototype_disclaimer}
                </div>

                <button
                  onClick={() => setDownloadModal(null)}
                  className="w-full py-2.5 rounded-xl bg-teal-600 text-white font-bold text-xs"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

