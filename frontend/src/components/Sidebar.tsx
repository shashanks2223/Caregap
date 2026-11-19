import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Shield,
  LayoutDashboard,
  User,
  Briefcase,
  FileText,
  FileCheck2,
  Send,
  Clock,
  Sparkles,
  Bell,
  Settings,
  Users,
  Building2,
  Sliders,
  AlertTriangle,
  History,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'caregiver';

  const caregiverNav = [
    { name: 'Overview', to: '/caregiver', icon: LayoutDashboard },
    { name: 'My Profile', to: '/caregiver/profile', icon: User },
    { name: 'Insurance Plans', to: '/caregiver/plans', icon: FileText },
    { name: 'My Policies', to: '/caregiver/policies', icon: FileCheck2 },
    { name: 'Submit Claim', to: '/caregiver/submit-claim', icon: Send },
    { name: 'Claim Tracking', to: '/caregiver/claims', icon: Clock },
    { name: 'AI Assistant', to: '/caregiver/assistant', icon: Sparkles },
    { name: 'Notifications', to: '/caregiver/notifications', icon: Bell },
    { name: 'Settings', to: '/caregiver/settings', icon: Settings },
  ];

  const employerNav = [
    { name: 'Dashboard', to: '/employer', icon: LayoutDashboard },
    { name: 'Caregiver Staff', to: '/employer/caregivers', icon: Users },
    { name: 'Verification Requests', to: '/employer/verifications', icon: CheckCircle2 },
  ];

  const adminNav = [
    { name: 'Platform Analytics', to: '/admin', icon: LayoutDashboard },
    { name: 'Claims Adjudication', to: '/admin/claims', icon: FileText },
    { name: 'Caregiver Directory', to: '/admin/caregivers', icon: Users },
    { name: 'Agency Directory', to: '/admin/employers', icon: Building2 },
    { name: 'Plan Configurator', to: '/admin/plans', icon: Sliders },
    { name: 'AI Risk Assessments', to: '/admin/risk-review', icon: Sparkles },
    { name: 'Fraud Review Queue', to: '/admin/fraud-queue', icon: AlertTriangle },
    { name: 'System Audit Logs', to: '/admin/audit-logs', icon: History },
  ];

  const navItems = role === 'admin' ? adminNav : role === 'employer' ? employerNav : caregiverNav;

  return (
    <aside className="w-64 bg-navy-800 text-slate-300 flex flex-col flex-shrink-0 h-screen sticky top-0 border-r border-navy-700 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-navy-700/80 bg-navy-900/40">
        <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 mr-3">
          <Shield className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
            CareGap <span className="text-teal-400">AI</span>
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-teal-300">
            {role === 'admin' ? 'Underwriter Console' : role === 'employer' ? 'Agency Portal' : 'Caregiver Portal'}
          </span>
        </div>
      </div>

      {/* Nav List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/caregiver' || item.to === '/employer' || item.to === '/admin'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  : 'text-slate-300 hover:bg-navy-700/60 hover:text-white'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="p-4 border-t border-navy-700/80 bg-navy-900/30">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 flex items-center justify-center text-xs font-bold uppercase">
            {user?.email ? user.email[0] : 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{user?.email}</p>
            <p className="text-[10px] text-teal-400/90 capitalize">{role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

