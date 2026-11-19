import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Building2,
  Shield,
  FileText,
  AlertTriangle,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sliders,
  Sparkles,
  ArrowRight
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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/analytics/dashboard-charts')
      ]);
      setStats(statsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (e) {
      console.log('Error fetching admin dashboard:', e);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#14B8A6', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar
          title="Platform Underwriting & Analytics Command"
          subtitle="CareGap AI Platform Key Performance Indicators & Risk Intelligence"
        />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          
          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Caregivers</span>
              <p className="text-xl font-bold text-navy-800">{stats?.total_caregivers || 15}</p>
              <Link to="/admin/caregivers" className="text-[10px] text-teal-600 font-semibold hover:underline block">
                Directory &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Agencies</span>
              <p className="text-xl font-bold text-navy-800">{stats?.total_employers || 4}</p>
              <Link to="/admin/employers" className="text-[10px] text-teal-600 font-semibold hover:underline block">
                Agencies &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Active Policies</span>
              <p className="text-xl font-bold text-navy-800">{stats?.active_policies || 15}</p>
              <span className="text-[10px] text-emerald-600 font-medium">100% In Good Standing</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Total Claims</span>
              <p className="text-xl font-bold text-navy-800">{stats?.total_claims || 11}</p>
              <Link to="/admin/claims" className="text-[10px] text-teal-600 font-semibold hover:underline block">
                Adjudicate &rarr;
              </Link>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-amber-700">Pending Review</span>
              <p className="text-xl font-bold text-amber-600">{stats?.pending_claims || 6}</p>
              <span className="text-[10px] text-slate-400">Under Review</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-emerald-700">Approved</span>
              <p className="text-xl font-bold text-emerald-700">{stats?.approved_claims || 4}</p>
              <span className="text-[10px] text-slate-400">Claims settled</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-rose-700">Rejected</span>
              <p className="text-xl font-bold text-rose-600">{stats?.rejected_claims || 1}</p>
              <span className="text-[10px] text-slate-400">Exclusions hit</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
              <span className="text-[11px] font-semibold text-slate-500">Monthly Revenue</span>
              <p className="text-xl font-bold text-teal-700">
                ₹{(stats?.illustrative_revenue_monthly || 5980).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-400">Illustrative</span>
            </div>

          </div>

          {/* Quick Management Quicklink Pills */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Link to="/admin/claims" className="px-3.5 py-2 rounded-xl bg-navy-800 text-white font-semibold flex items-center gap-1.5 shadow-xs">
              <FileText className="w-3.5 h-3.5" />
              <span>Review Claims ({stats?.pending_claims || 6} Pending)</span>
            </Link>
            <Link to="/admin/plans" className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-teal-600" />
              <span>Configure Plan Prices</span>
            </Link>
            <Link to="/admin/risk-review" className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Risk Scores</span>
            </Link>
            <Link to="/admin/fraud-queue" className="px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Fraud Queue ({stats?.fraud_alerts_count || 1})</span>
            </Link>
          </div>

          {/* Analytics Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Chart 1: Monthly Registrations Trend */}
            <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-navy-800">Caregiver Platform Registrations Growth</h3>
                  <p className="text-xs text-slate-500">Cumulative verified onboarding growth across metro territories</p>
                </div>
                <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
                  +250% Growth
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.monthly_registrations || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip />
                    <Bar dataKey="caregivers" fill="#14B8A6" radius={[4, 4, 0, 0]} name="Registered Caregivers" />
                    <Bar dataKey="employers" fill="#142B45" radius={[4, 4, 0, 0]} name="Care Agencies" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Plan Distribution */}
            <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy-800">Plan Adoption Mix</h3>
                <p className="text-xs text-slate-500">Breakdown of active prototype policies</p>
              </div>

              <div className="h-56 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics?.plan_distribution || []}
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {(analytics?.plan_distribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-1.5 text-xs">
                {(analytics?.plan_distribution || []).map((p: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                      <span className="text-slate-600">{p.name}</span>
                    </span>
                    <span className="font-bold text-navy-800">{p.value} policies</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Bottom Grid: Claims Distribution & Termination Reasons */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Claims by Category */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy-800">Claims by Protection Pillar</h3>
                <p className="text-xs text-slate-500">Option A (Medical) vs Option B (Job Loss) distribution</p>
              </div>

              <div className="space-y-3 pt-2">
                {(analytics?.claims_by_category || []).map((cat: any, i: number) => (
                  <div key={i} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }}></span>
                      <span className="font-semibold text-slate-800">{cat.category}</span>
                    </div>
                    <span className="font-bold text-navy-800">{cat.count} Claims Filed</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Employment Termination Breakdown */}
            <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-navy-800">Option B Termination Cause Trends</h3>
                <p className="text-xs text-slate-500">Reported circumstances for involuntary caregiver replacement</p>
              </div>

              <div className="space-y-2.5 pt-2">
                {(analytics?.employment_termination_trends || []).map((t: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-xs p-2.5 rounded-xl hover:bg-slate-50">
                    <span className="text-slate-700">{t.reason}</span>
                    <span className="font-bold text-navy-800 bg-slate-100 px-2 py-0.5 rounded">{t.count} Cases</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </main>
      </div>
    </div>
  );
};

