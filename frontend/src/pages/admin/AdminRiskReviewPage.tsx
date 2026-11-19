import React, { useState, useEffect } from 'react';
import { Sparkles, CheckCircle2, Shield, User, Edit3 } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export const AdminRiskReviewPage: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [notes, setNotes] = useState<string>('Underwriter reviewed: verifiable track record confirms eligibility.');
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/risk-assessment/history');
      setAssessments(res.data);
    } catch (e) {
      console.log('Error fetching assessments:', e);
    }
  };

  const handleSignOff = async () => {
    if (!selectedRecord) return;
    setSaving(true);
    try {
      await api.put(`/risk-assessment/review/${selectedRecord.id}?reviewer_notes=${encodeURIComponent(notes)}`);
      setMsg(`Underwriter review recorded for ${selectedRecord.caregiver_name}.`);
      setSelectedRecord(null);
      fetchAssessments();
    } catch (e) {
      alert('Review submission failed.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="AI Risk Assessment & Human Underwriting"
          subtitle="Google Gemini decision-support scores with underwriter oversight"
        />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {msg && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs">
              {msg}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Caregiver</th>
                    <th className="p-3.5">Risk Score</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Key Identified Factors</th>
                    <th className="p-3.5">AI Assessed</th>
                    <th className="p-3.5">Human Reviewed</th>
                    <th className="p-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {assessments.map((ra) => (
                    <tr key={ra.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-navy-800">{ra.caregiver_name}</td>
                      <td className="p-3.5 font-bold">
                        <span className={`px-2 py-0.5 rounded text-[11px] ${
                          ra.risk_score < 35 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ra.risk_score}/100
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{ra.risk_category}</td>
                      <td className="p-3.5 max-w-sm truncate text-slate-600">
                        {ra.risk_factors?.join('; ')}
                      </td>
                      <td className="p-3.5">
                        <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                          Gemini 1.5
                        </span>
                      </td>
                      <td className="p-3.5">
                        {ra.human_reviewed ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Verified
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedRecord(ra);
                            setNotes(ra.reviewer_notes || 'Verified against platform guidelines.');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-navy-800 text-white font-semibold hover:bg-navy-900 transition-colors"
                        >
                          Underwrite
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Underwriter Review Modal */}
          {selectedRecord && (
            <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-800">
                    Human Underwriter Review: {selectedRecord.caregiver_name}
                  </h3>
                  <button onClick={() => setSelectedRecord(null)} className="text-xs text-slate-400 hover:text-slate-700 font-bold">
                    ✕
                  </button>
                </div>

                <div className="space-y-2 text-xs bg-slate-50 p-4 rounded-2xl">
                  <p><strong>AI Score:</strong> {selectedRecord.risk_score} ({selectedRecord.risk_category})</p>
                  <p><strong>Rationale:</strong> {selectedRecord.explanation}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Underwriter Review Notes</label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => setSelectedRecord(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={saving}
                    onClick={handleSignOff}
                    className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs"
                  >
                    {saving ? 'Signing off...' : 'Sign Off & Approve Underwriting'}
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

