import React, { useState, useEffect } from 'react';
import { Sliders, Save, CheckCircle2, AlertCircle, Edit2 } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export const AdminPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data);
    } catch (e) {
      console.log('Error fetching plans:', e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan) return;
    setSaving(true);
    setMsg(null);

    try {
      await api.put(`/plans/${editingPlan.id}`, {
        name: editingPlan.name,
        monthly_premium: Number(editingPlan.monthly_premium),
        base_option_a_premium: Number(editingPlan.base_option_a_premium),
        option_b_premium: Number(editingPlan.option_b_premium),
        max_option_a_duration_days: Number(editingPlan.max_option_a_duration_days),
        max_option_b_duration_days: Number(editingPlan.max_option_b_duration_days),
        option_a_waiting_period_days: Number(editingPlan.option_a_waiting_period_days),
        option_b_waiting_period_days: Number(editingPlan.option_b_waiting_period_days),
        min_qualifying_employment_months: Number(editingPlan.min_qualifying_employment_months)
      });

      setMsg({ text: `Plan ${editingPlan.name} configuration updated successfully.`, type: 'success' });
      setEditingPlan(null);
      fetchPlans();
    } catch (err: any) {
      setMsg({ text: err.response?.data?.detail || 'Update failed.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="Plan Parameter Configurator"
          subtitle="Configure dynamic illustrative pricing, waiting periods, and replacement durations"
        />

        <main className="p-6 max-w-6xl space-y-6 flex-1 overflow-y-auto">
          {msg && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => (
              <div key={p.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {p.plan_code}
                    </span>
                    <button
                      onClick={() => setEditingPlan({ ...p })}
                      className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-navy-800 text-xs font-semibold flex items-center gap-1"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                  </div>

                  <h3 className="text-base font-bold text-navy-800">{p.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{p.description}</p>

                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Monthly Premium:</span>
                      <span className="font-bold text-navy-800">₹{p.monthly_premium}/mo</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Option A Base Rate:</span>
                      <span className="font-semibold text-slate-700">₹{p.base_option_a_premium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Option B Rate:</span>
                      <span className="font-semibold text-slate-700">₹{p.option_b_premium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Max Benefit Duration:</span>
                      <span className="font-semibold text-slate-700">{p.max_option_a_duration_days} Days</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Option A Waiting:</span>
                      <span className="font-semibold text-slate-700">{p.option_a_waiting_period_days} Days</span>
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-center">
                  Dynamically loaded from database
                </div>
              </div>
            ))}
          </div>

          {/* Edit Plan Modal */}
          {editingPlan && (
            <div className="fixed inset-0 bg-navy-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5 border border-slate-200 shadow-2xl">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-navy-800">Edit Plan: {editingPlan.name}</h3>
                  <button onClick={() => setEditingPlan(null)} className="text-xs text-slate-400 hover:text-slate-700 font-bold">
                    ✕
                  </button>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Plan Display Name</label>
                    <input
                      type="text"
                      required
                      value={editingPlan.name}
                      onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Total Monthly Premium (₹)</label>
                      <input
                        type="number"
                        required
                        value={editingPlan.monthly_premium}
                        onChange={(e) => setEditingPlan({ ...editingPlan, monthly_premium: Number(e.target.value) })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-bold focus:outline-none focus:border-teal-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Option A Base Rate (₹)</label>
                      <input
                        type="number"
                        required
                        value={editingPlan.base_option_a_premium}
                        onChange={(e) => setEditingPlan({ ...editingPlan, base_option_a_premium: Number(e.target.value) })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Max Duration (Days)</label>
                      <input
                        type="number"
                        required
                        value={editingPlan.max_option_a_duration_days}
                        onChange={(e) => setEditingPlan({ ...editingPlan, max_option_a_duration_days: Number(e.target.value) })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Waiting Period (Days)</label>
                      <input
                        type="number"
                        required
                        value={editingPlan.option_a_waiting_period_days}
                        onChange={(e) => setEditingPlan({ ...editingPlan, option_a_waiting_period_days: Number(e.target.value) })}
                        className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingPlan(null)}
                      className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                    >
                      {saving ? 'Updating...' : 'Save Configuration'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

