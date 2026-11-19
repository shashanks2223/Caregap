import React, { useState, useEffect } from 'react';
import { Shield, Check, Sparkles, AlertCircle, ArrowRight, CheckCircle2, Calculator } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { ChatWidget } from '../../components/ChatWidget';

export const CaregiverPlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [purchasing, setPurchasing] = useState<boolean>(false);
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Calculator State
  const [salary, setSalary] = useState<number>(20000);
  const [selectedPlanId, setSelectedPlanId] = useState<number>(2);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/plans');
      setPlans(res.data);
    } catch (e) {
      console.log('Error fetching plans:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (plan: any) => {
    setPurchasing(true);
    setMsg(null);

    try {
      const res = await api.post('/policies/purchase', {
        plan_id: plan.id,
        coverage_type: plan.coverage_option,
        terms_accepted: true
      });
      setMsg({
        text: `Success! Policy ${res.data.policy_number} for ${plan.name} has been activated.`,
        type: 'success'
      });
    } catch (err: any) {
      setMsg({
        text: err.response?.data?.detail || 'Failed to activate policy.',
        type: 'error'
      });
    } finally {
      setPurchasing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Income Protection Plans" subtitle="Compare simulated plans & activate dual coverage packages" />

        <main className="p-6 max-w-6xl space-y-8">
          {msg && (
            <div className={`p-4 rounded-2xl text-xs flex items-center gap-2 ${
              msg.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
              <span>{msg.text}</span>
            </div>
          )}

          {/* Pricing Tiers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {plans.map((p) => {
              const isPlus = p.plan_code === 'PLUS';
              return (
                <div
                  key={p.id}
                  className={`bg-white rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
                    isPlus
                      ? 'border-2 border-teal-500 shadow-xl shadow-teal-500/10 relative'
                      : 'border border-slate-200 shadow-sm hover:shadow-md'
                  }`}
                >
                  {isPlus && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-[10px] font-bold uppercase tracking-wider">
                        CareGap Recommended
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-[11px] font-bold uppercase px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                        {p.coverage_option}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-navy-800">{p.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed min-h-[3rem]">{p.description}</p>

                    <div className="pt-2">
                      <span className="text-3xl font-black text-navy-800">₹{p.monthly_premium}</span>
                      <span className="text-xs text-slate-500"> / month</span>
                    </div>

                    {/* Features checklist */}
                    <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Max Duration:</strong> Up to {p.max_option_a_duration_days} days benefit</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Waiting Period:</strong> {p.option_a_waiting_period_days} days</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                        <span><strong>Qualifying Service:</strong> {p.min_qualifying_employment_months} month(s)</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-slate-100">
                    <button
                      disabled={purchasing}
                      onClick={() => handleActivate(p)}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-colors shadow-xs ${
                        isPlus
                          ? 'bg-teal-600 hover:bg-teal-700 text-white'
                          : 'bg-navy-800 hover:bg-navy-900 text-white'
                      }`}
                    >
                      {purchasing ? 'Activating...' : `Activate ${p.name}`}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Plan Comparison Table */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-navy-800">Side-by-Side Coverage Comparison</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Feature</th>
                    <th className="p-3">Basic Care Shield</th>
                    <th className="p-3 text-teal-700">CareGap Plus Dual</th>
                    <th className="p-3">Elite Comprehensive</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold">Option A (Illness / Injury)</td>
                    <td className="p-3 text-teal-600 font-bold">Included</td>
                    <td className="p-3 text-teal-600 font-bold">Included</td>
                    <td className="p-3 text-teal-600 font-bold">Included</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Option B (Job Loss / Client Loss)</td>
                    <td className="p-3 text-slate-400">Not Included</td>
                    <td className="p-3 text-teal-600 font-bold">Included</td>
                    <td className="p-3 text-teal-600 font-bold">Included</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Monthly Illustrative Rate</td>
                    <td className="p-3 font-bold text-navy-800">₹199 / mo</td>
                    <td className="p-3 font-bold text-teal-700">₹349 / mo</td>
                    <td className="p-3 font-bold text-navy-800">₹499 / mo</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Maximum Benefit Window</td>
                    <td className="p-3">60 Days</td>
                    <td className="p-3">60 Days</td>
                    <td className="p-3 font-bold text-navy-800">90 Days Extended</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold">Initial Waiting Period</td>
                    <td className="p-3">7 Days</td>
                    <td className="p-3">7-14 Days</td>
                    <td className="p-3 font-bold text-teal-700">3 Days Expedited</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

