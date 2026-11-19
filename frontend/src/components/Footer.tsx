import React from 'react';
import { Shield, Heart, FileText, Lock, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-900 text-slate-300 pt-16 pb-12 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-700/60">
          {/* Brand */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                CareGap <span className="text-teal-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-powered dual income protection designed for professional caregivers, elder attendants, and home health nurses across India.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-[11px] text-teal-300">
              <Sparkles className="w-3 h-3 text-teal-400" />
              <span>Google Gemini AI Integrated</span>
            </div>
          </div>

          {/* Dual Protection Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Protection Models</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#dual-protection" className="hover:text-teal-400 transition-colors">Option A: Medical Incapacity Shield</a></li>
              <li><a href="#dual-protection" className="hover:text-teal-400 transition-colors">Option B: Involuntary Job Loss Shield</a></li>
              <li><a href="#plans" className="hover:text-teal-400 transition-colors">Combined Dual-Shield Package</a></li>
              <li><a href="#plans" className="hover:text-teal-400 transition-colors">Transparent Pricing Breakdown</a></li>
            </ul>
          </div>

          {/* Quick Access */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Platform Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-teal-400 transition-colors">Caregiver Portal</Link></li>
              <li><Link to="/login" className="hover:text-teal-400 transition-colors">Care Agency / Employer Portal</Link></li>
              <li><Link to="/login" className="hover:text-teal-400 transition-colors">Underwriter Administration</Link></li>
              <li><Link to="/register" className="hover:text-teal-400 transition-colors">Register as a Caregiver</Link></li>
            </ul>
          </div>

          {/* Prototype Compliance Disclaimer */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Academic Prototype Notice</span>
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed bg-navy-800/80 p-3 rounded-lg border border-navy-700">
              CareGap AI is an academic software demonstration prototype. It does not issue actual insurance contracts. All quotes, benefit durations, and payouts are simulated under sandbox guidelines.
            </p>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-1">
            <span>Built with care for caregivers &copy; 2026 CareGap AI. All rights reserved.</span>
          </div>
          <div className="flex items-center space-x-6 text-slate-400">
            <span>Privacy Architecture</span>
            <span>Deterministic Pricing</span>
            <span>Role-Based Access Control</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

