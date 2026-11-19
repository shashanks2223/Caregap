import React, { useState, useEffect } from 'react';
import { History, Shield, AlertTriangle, Search } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [tab, setTab] = useState<'AUDIT' | 'FRAUD'>('AUDIT');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const [logRes, fraudRes] = await Promise.all([
        api.get('/admin/audit-logs'),
        api.get('/admin/fraud-alerts')
      ]);
      setLogs(logRes.data);
      setFraudAlerts(fraudRes.data);
    } catch (e) {
      console.log('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="System Audit Trail & Fraud Review Queue"
          subtitle="Immutable operational activity logs & claim anomaly detection"
        />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTab('AUDIT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                tab === 'AUDIT'
                  ? 'bg-navy-800 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              System Audit Trail ({logs.length})
            </button>
            <button
              onClick={() => setTab('FRAUD')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                tab === 'FRAUD'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
              <span>Fraud Review Queue ({fraudAlerts.length})</span>
            </button>
          </div>

          {tab === 'AUDIT' ? (
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">User</th>
                      <th className="p-3.5">Action</th>
                      <th className="p-3.5">Entity</th>
                      <th className="p-3.5">Entity ID</th>
                      <th className="p-3.5">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                    {logs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/70">
                        <td className="p-3.5 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                        <td className="p-3.5 font-bold text-navy-800">{log.user_email}</td>
                        <td className="p-3.5 text-teal-700 font-bold">{log.action}</td>
                        <td className="p-3.5 uppercase text-slate-600">{log.entity_type}</td>
                        <td className="p-3.5 text-slate-500">#{log.entity_id || '-'}</td>
                        <td className="p-3.5 text-slate-600 truncate max-w-xs">{JSON.stringify(log.details)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {fraudAlerts.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-200">
                  No claims currently flagged for statistical or behavioral anomalies.
                </div>
              ) : (
                fraudAlerts.map((fa) => (
                  <div key={fa.claim_id} className="bg-white rounded-3xl p-6 border border-rose-200 shadow-xs space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-50 text-rose-700">
                          Anomaly Alert
                        </span>
                        <h3 className="text-sm font-bold text-navy-800 mt-1">Claim {fa.claim_number} - {fa.caregiver_name}</h3>
                      </div>
                      <span className="font-bold text-navy-800 text-xs">₹{fa.claimed_amount?.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="p-3 rounded-2xl bg-rose-50/60 border border-rose-100 text-xs text-rose-800 space-y-1">
                      <p className="font-bold">Flagged Reasons:</p>
                      {fa.flagged_reasons?.map((r: string, i: number) => (
                        <p key={i}>&bull; {r}</p>
                      ))}
                    </div>

                    <p className="text-[11px] text-slate-500">
                      Filed on: {new Date(fa.created_at).toLocaleDateString()} &bull; Current Status: {fa.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

