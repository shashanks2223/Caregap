import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Sparkles, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'employer') return '/employer';
    return '/caregiver';
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-navy-800 flex items-center justify-center text-teal-400 shadow-sm shadow-navy-800/20">
                <Shield className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-navy-800 tracking-tight flex items-center gap-1.5">
                  CareGap <span className="text-teal-600">AI</span>
                  <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
                    Prototype
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium -mt-1">Caregiver Income Protection</span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <a href="#dual-protection" className="hover:text-teal-600 transition-colors">Dual Protection</a>
            <a href="#plans" className="hover:text-teal-600 transition-colors">Plans & Pricing</a>
            <a href="#how-it-works" className="hover:text-teal-600 transition-colors">How It Works</a>
            <a href="#ai-capabilities" className="hover:text-teal-600 transition-colors flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              AI Underwriting
            </a>
            <a href="#faqs" className="hover:text-teal-600 transition-colors">FAQs</a>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <Link
                  to={getDashboardLink()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-navy-800 text-white hover:bg-navy-700 shadow-sm transition-all"
                >
                  <UserCheck className="w-4 h-4 text-teal-400" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-navy-800 hover:bg-slate-100/70 rounded-lg transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-600/20 transition-all hover:shadow"
                >
                  <span>Get Protected</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

