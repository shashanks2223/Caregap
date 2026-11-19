import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Activity,
  FileText,
  UserCheck,
  Send,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  TrendingUp
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatusBadge } from '../../components/StatusBadge';
import { ChatWidget } from '../../components/ChatWidget';

export const CaregiverDashboard: React.FC = () => {
  const [profile, setProfile] = useState<any>(null);
  const [activePolicy, setActivePolicy] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [riskAssessment, setRiskAssessment] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [profRes, polRes, claimsRes, riskRes] = await Promise.all([
        api.get('/caregivers/profile'),
        api.get('/policies'),
        api.get('/claims'),
        api.get('/risk-assessment/history')
      ]);

      setProfile(profRes.data);
      const active = polRes.data.find((p: any) => p.status === 'active') || polRes.data[0];
      setActivePolicy(active);
      setClaims(claimsRes.data);
      if (riskRes.data && riskRes.data.length > 0) {
        setRiskAssessment(riskRes.data[0]);
      }
    } catch (e) {
      console.log('Error fetching caregiver dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  // Recharts Data for Income Protection Coverage
  const coverageData = [
    { month: 'May', regularSalary: profile?.monthly_salary || 20000, protectedCoverage: profile?.monthly_salary || 20000 },
    { month: 'Jun', regularSalary: profile?.monthly_salary || 20000, protectedCoverage: profile?.monthly_salary || 20000 },
    { month: 'Jul', regularSalary: profile?.monthly_salary || 20000, protectedCoverage: profile?.monthly_salary || 20000 },
    { month: 'Aug', regularSalary: profile?.monthly_salary || 20000, protectedCoverage: profile?.monthly_salary || 20000 },
    { month: 'Sep', regularSalary: profile?.monthly_salary || 20000, protectedCoverage: profile?.monthly_salary || 20000 },
    { month: 'Oct', regularSalary: profile?.monthly_salary || 20000, protectedCoverage: profile?.monthly_salary || 20000 }
  ];

  const utilizationData = [
    { type: 'Option A (Medical)', utilized: 0, allowable: 60 },
    { type: 'Option B (Job Loss)', utilized: 0, allowable: 60 }
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title={`Welcome back, ${profile?.full_name || 'Caregiver'}`}
          subtitle="CareGap AI Income Protection Dashboard &bull; Live Coverage Status"
        />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Top Banner KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1: Active Plan */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Active Protection</span>
                <span className="p-2 rounded-xl bg-teal-50 text-teal-600">
                  <Shield className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-bold text-navy-800">
                {activePolicy?.plan?.name || 'CareGap Plus Dual'}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <StatusBadge status={activePolicy?.status || 'active'} />
                <span>&bull; {activePolicy?.coverage_type || 'COMBINED'}</span>
              </div>
            </div>

            {/* KPI 2: Monthly Premium */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Monthly Contribution</span>
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-bold text-navy-800">
                ₹{activePolicy?.monthly_premium || 349} <span className="text-xs font-normal text-slate-500">/ month</span>
              </p>
              <p className="text-xs text-slate-500">Illustrative prototype value</p>
            </div>

            {/* KPI 3: Protected Monthly Income */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Monthly Benefit Limit</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <UserCheck className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-bold text-emerald-700">
                ₹{(profile?.monthly_salary || 20000).toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-slate-500">100% of declared regular income</p>
            </div>

            {/* KPI 4: Claims Status */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold text-slate-500">Claims History</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <p className="text-lg font-bold text-navy-800">
                {claims.length} Filed <span className="text-xs font-normal text-slate-500">({claims.filter(c => c.status === 'UNDER_REVIEW').length} in review)</span>
              </p>
              <Link to="/caregiver/claims" className="text-xs text-teal-600 font-semibold hover:underline block">
                Track Claim Progress &rarr;
              </Link>
            </div>

          </div>

          {/* Quick Action Bar */}
          <div className="bg-navy-800 text-white rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Experienced an Income Interruption?</h3>
                <p className="text-xs text-slate-300">File a medical incapacity claim (Option A) or job loss claim (Option B) in minutes.</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <Link
                to="/caregiver/submit-claim"
                className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-navy-950 font-bold text-xs shadow-xs text-center transition-colors"
              >
                File Protection Claim
              </Link>
              <Link
                to="/caregiver/plans"
                className="flex-1 md:flex-initial px-4 py-2 rounded-xl bg-navy-700 hover:bg-navy-600 text-white border border-navy-600 font-semibold text-xs text-center transition-colors"
              >
                Compare Plans
              </Link>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Recharts Area Chart: Protected Income Trajectory */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-navy-800">Monthly Guaranteed Salary Safety Net</h3>
                  <p className="text-xs text-slate-500">Regular declared salary vs. guaranteed prototype protection coverage</p>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  100% Protected
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={coverageData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="protectedGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                    <Tooltip formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']} />
                    <Area type="monotone" dataKey="protectedCoverage" stroke="#14B8A6" strokeWidth={2.5} fillOpacity={1} fill="url(#protectedGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recharts Bar Chart: Benefit Window Utilization */}
            <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-bold text-navy-800">Coverage Duration Utilized</h3>
                  <span className="text-xs font-semibold text-slate-500">0 of 60 Days Used</span>
                </div>
                <p className="text-xs text-slate-500">Maximum allowable income replacement window per policy cycle</p>

                <div className="h-44 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={utilizationData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E2E8F0" />
                      <XAxis type="number" domain={[0, 60]} tick={{ fontSize: 10, fill: '#64748B' }} />
                      <YAxis type="category" dataKey="type" tick={{ fontSize: 10, fill: '#64748B' }} width={110} />
                      <Tooltip />
                      <Bar dataKey="utilized" fill="#14B8A6" radius={[0, 4, 4, 0]} barSize={14} name="Days Utilized" />
                      <Bar dataKey="allowable" fill="#E2E8F0" radius={[0, 4, 4, 0]} barSize={14} name="Max Days" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bank Verification Mini Banner */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {profile?.bank_name || 'Bank Account'} &bull; ****{profile?.bank_account_last4 || '4921'}
                    </p>
                    <p className="text-[10px] text-emerald-700 font-medium">Direct Disbursal Verified</p>
                  </div>
                </div>
                <Link to="/caregiver/profile" className="text-teal-600 font-semibold hover:underline text-[11px]">
                  Manage
                </Link>
              </div>
            </div>

          </div>

          {/* AI Underwriting Recommendation & Recent Claims */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* AI Risk Assessment Card */}
            <div className="lg:col-span-5 bg-gradient-to-br from-teal-50/60 via-white to-slate-50 p-6 rounded-3xl border border-teal-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <h3 className="text-sm font-bold text-navy-800">AI Risk Assessment Indicator</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-600 text-white">
                  Score: {riskAssessment?.risk_score || 25}/100 ({riskAssessment?.risk_category || 'LOW'})
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{riskAssessment?.explanation || 'Caregiver profile demonstrates steady agency service history. Eligible for standard and combined dual protection.'}"
              </p>

              <div className="space-y-1.5 text-xs text-slate-700 pt-1">
                <p className="font-semibold text-navy-800 text-[11px] uppercase tracking-wider">AI Recommendations:</p>
                {(riskAssessment?.recommendations || [
                  'Maintain continuous quarterly salary slips to preserve benefit limits.',
                  'Option B provides strong transition security against household care cessation.'
                ]).map((rec: string, i: number) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-[11px] text-slate-600">{rec}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 text-[10px] text-slate-400 border-t border-teal-100">
                Decision-support prototype indicator. Does not infer sensitive personal or health attributes.
              </div>
            </div>

            {/* Recent Claims Table */}
            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-navy-800">Your Claims History</h3>
                  <p className="text-xs text-slate-500">Track claim verification, adjudication, and benefit approval</p>
                </div>
                <Link to="/caregiver/submit-claim" className="text-xs font-bold text-teal-600 hover:underline">
                  + File Claim
                </Link>
              </div>

              <div className="divide-y divide-slate-100 overflow-hidden">
                {claims.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No claims submitted yet. Your income protection is active.
                  </div>
                ) : (
                  claims.slice(0, 4).map((c) => (
                    <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-navy-800">{c.claim_number}</span>
                          <span className="px-1.5 py-0.2 rounded text-[10px] bg-slate-100 font-semibold text-slate-700">
                            {c.claim_type}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate max-w-xs">
                          {c.claim_type === 'OPTION_A' ? c.incident_description : c.termination_reason || 'Involuntary contract end'}
                        </p>
                      </div>

                      <div className="text-right space-y-0.5">
                        <StatusBadge status={c.status} />
                        <p className="text-[11px] font-bold text-navy-800 mt-1">
                          ₹{c.calculated_benefit_amount?.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

