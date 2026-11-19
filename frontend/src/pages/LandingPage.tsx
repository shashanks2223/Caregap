import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  Heart,
  Activity,
  UserX,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Calculator,
  ChevronDown,
  ChevronUp,
  FileText,
  Clock,
  Building,
  Check,
  AlertCircle
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { PrototypeNotice } from '../components/PrototypeNotice';
import { ChatWidget } from '../components/ChatWidget';

export const LandingPage: React.FC = () => {
  // Interactive Calculator State
  const [calcSalary, setCalcSalary] = useState<number>(20000);
  const [calcCategory, setCalcCategory] = useState<string>('Elderly Care');
  const [calcExp, setCalcExp] = useState<number>(3);
  const [calcCoverage, setCalcCoverage] = useState<string>('COMBINED');

  // FAQs Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Deterministic calculation for interactive widget
  const calculateEstimate = () => {
    let base = 349;
    if (calcCoverage === 'OPTION_A') base = 199;
    else if (calcCoverage === 'OPTION_B') base = 150;
    else if (calcCoverage === 'PREMIUM') base = 499;

    let catMult = 1.0;
    if (calcCategory === 'Patient Care Assistant') catMult = 1.05;
    if (calcCategory === 'Home Nurse') catMult = 1.10;
    if (calcCategory === 'Specialized Care') catMult = 1.15;

    let discount = calcExp >= 5 ? 0.10 : calcExp >= 3 ? 0.05 : 0.0;
    let discAmt = base * discount;
    let finalEst = Math.round((base * catMult) - discAmt);

    return {
      base,
      finalEst,
      benefit: calcSalary,
      daily: Math.round(calcSalary / 30)
    };
  };

  const est = calculateEstimate();

  const faqs = [
    {
      q: "How does CareGap AI differ from standard health or medical insurance?",
      a: "Traditional health insurance reimburses hospital bills and surgical expenses. It does not replace your lost income if you are bedridden at home or if your patient's family unexpectedly terminates your care contract. CareGap AI specifically protects caregiver salary replacement."
    },
    {
      q: "What is Option A: Personal Income Protection?",
      a: "Option A pays out daily/monthly income replacement when a registered physician certifies that you are medically unable to perform caregiving duties due to a covered illness or accidental injury."
    },
    {
      q: "What is Option B: Employment Continuity Protection?",
      a: "Option B protects caregivers against involuntary job displacement—such as when an elderly patient passes away, recovers, or the family relocates. It provides financial cushion while you transition to a new placement."
    },
    {
      q: "What if I have signed up but have not been provided with a job for 15 days?",
      a: "CareGap AI includes a 15-Day Placement Gap Guarantee! If you have enrolled and verified your caregiver profile but have not been assigned any caregiving duty for 15 consecutive days, you qualify for 15 days of salary compensation (50% of your monthly declared salary) to protect your livelihood while waiting for placement."
    },
    {
      q: "Are the displayed premiums actual insurance quotations?",
      a: "No. This application is an academic insurance technology prototype. All displayed prices (₹199, ₹349, ₹499) and compensation limits are illustrative demonstration values designed for evaluation."
    },
    {
      q: "Can care agencies and employers verify staff records?",
      a: "Yes! Registered care agencies have dedicated dashboards to verify caregiver employment tenure and confirm involuntary contract conclusions without having access to confidential personal medical records."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <PrototypeNotice />
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200/80 bg-gradient-to-b from-white via-slate-50 to-[#F7F9FC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Headlines */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span>Next-Gen Insurtech for Healthcare Attendants</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-800 tracking-tight leading-[1.15]">
                Protecting the People <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-navy-700">
                  Who Care for Others.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl font-normal">
                AI-powered income protection designed for professional caregivers, helping safeguard their earnings against unexpected illness, injury and employment disruption.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm shadow-md shadow-teal-600/25 transition-all transform hover:-translate-y-0.5"
                >
                  <span>Register as a Caregiver</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#plans"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-navy-800 border border-slate-300 font-semibold text-sm shadow-xs transition-all"
                >
                  <span>Explore Protection Plans</span>
                </a>
              </div>

              {/* Demo Account Callout */}
              <div className="pt-4 flex items-center gap-3 text-xs text-slate-500">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Demo environment ready:</span>
                <Link to="/login" className="text-teal-700 font-semibold underline underline-offset-2">
                  One-Click Instant Login (Caregiver, Agency, Admin)
                </Link>
              </div>
            </div>

            {/* Right Column: Hero Dual Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/60 border border-slate-200/80 space-y-6 relative">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <span className="text-xs font-bold text-navy-800 uppercase tracking-wider">Dual Protection Matrix</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                    Comprehensive
                  </span>
                </div>

                {/* Option A Box */}
                <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 space-y-2 hover:border-teal-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-800">Option A: Medical Incapacity</h3>
                      <p className="text-[11px] text-teal-700 font-medium">Personal Illness & Accidental Injury</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Replaces up to 100% of regular monthly income for up to 60 days when physically unable to work.
                  </p>
                </div>

                {/* Option B Box */}
                <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100 space-y-2 hover:border-blue-300 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-navy-800 text-white flex items-center justify-center shadow-xs">
                      <UserX className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-navy-800">Option B: Involuntary Job Loss</h3>
                      <p className="text-[11px] text-navy-600 font-medium">Caregiving Contract Discontinuation</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    Provides transition support when families no longer need care (patient recovery, relocation, or bereavement).
                  </p>
                </div>

                {/* 15-Day Placement Guarantee Box */}
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5 hover:border-amber-400 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-navy-800">15-Day Placement Guarantee</h3>
                      <p className="text-[10px] text-amber-700 font-semibold">15 Days Salary if Unassigned</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">
                    Signed up but not assigned a placement for 15 days? Receive 15 days of salary income protection.
                  </p>
                </div>

                {/* Trust Metrics */}
                <div className="pt-2 grid grid-cols-3 gap-2 text-center">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-lg font-bold text-navy-800">₹199<span className="text-[10px] font-normal text-slate-500">/mo</span></p>
                    <p className="text-[10px] text-slate-500 font-medium">Illustrative Base</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-lg font-bold text-teal-600">Up to 60d</p>
                    <p className="text-[10px] text-slate-500 font-medium">Benefit Window</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <p className="text-lg font-bold text-navy-800">24/7</p>
                    <p className="text-[10px] text-slate-500 font-medium">Gemini Assistant</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* THE PROBLEM STATEMENT */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">The Overlooked Vulnerability</span>
            <h2 className="text-3xl font-extrabold text-navy-800">
              Why Traditional Health Insurance Fails Professional Caregivers
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              India has millions of home nurses, elder companions, and patient care attendants. Unlike salaried corporate employees, their household earnings depend 100% on active physical presence.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-800">Risk 1: Temporary Medical Incapacity</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A caregiver suffers a fractured wrist, lumbar disc strain from lifting a heavy patient, or a serious infection. They are medically restricted from duty for 30 days. Standard health insurance pays the hospital, but <strong>zero income arrives to feed their own family</strong>.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <UserX className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-800">Risk 2: Sudden Involuntary Client Loss</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                A family suddenly terminates the caregiver because the patient makes a complete recovery, the household relocates, or the patient unfortunately passes away. The caregiver is left with <strong>immediate total income disruption through no fault of their own</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* DUAL PROTECTION EXPLANATION */}
      <section id="dual-protection" className="py-20 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Comprehensive Architecture</span>
            <h2 className="text-3xl font-extrabold text-navy-800">Two Complementary Protection Pillars</h2>
            <p className="text-sm text-slate-600">
              CareGap AI offers both protection options independently or unified as a dual safety package.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
            {/* Option A Detailed Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-700 text-xs font-bold">
                  OPTION A
                </div>
                <h3 className="text-2xl font-bold text-navy-800">Personal Income Protection</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Safeguards earnings during temporary physical inability to work caused by acute illness or accident.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Coverage Limit:</strong> Up to 100% of declared monthly salary (e.g. ₹18,000 to ₹28,000/month).</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Maximum Duration:</strong> 60 consecutive days of daily pro-rated replacement.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Waiting Period:</strong> 7-day initial policy activation waiting window.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span><strong>Verified Documentation:</strong> Doctor's medical certificate and hospital diagnosis.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Illustrative Premium</span>
                  <p className="text-xl font-bold text-navy-800">₹199 <span className="text-xs font-normal text-slate-500">/ month</span></p>
                </div>
                <Link to="/register" className="px-4 py-2 rounded-xl bg-teal-600 text-white text-xs font-semibold hover:bg-teal-700 transition-colors">
                  Select Option A
                </Link>
              </div>
            </div>

            {/* Option B Detailed Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-navy-700 text-xs font-bold">
                  OPTION B
                </div>
                <h3 className="text-2xl font-bold text-navy-800">Employment Continuity Protection</h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Provides replacement income when a caregiver involuntarily loses employment due to qualifying circumstances.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-navy-700 flex-shrink-0 mt-0.5" />
                    <span><strong>Qualifying Events:</strong> Patient recovery, family relocation, or client bereavement.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-navy-700 flex-shrink-0 mt-0.5" />
                    <span><strong>Exclusion Protection:</strong> Excludes voluntary resignation and documented disciplinary termination.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-navy-700 flex-shrink-0 mt-0.5" />
                    <span><strong>Waiting Period:</strong> 14-day policy window; requires 3 months verifiable caregiving history.</span>
                  </div>
                  <div className="flex items-start gap-3 text-xs text-slate-700">
                    <CheckCircle2 className="w-4 h-4 text-navy-700 flex-shrink-0 mt-0.5" />
                    <span><strong>Employer Check:</strong> Care agency or family verifies involuntary discontinuation.</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Included in Dual Plus</span>
                  <p className="text-xl font-bold text-navy-800">₹349 <span className="text-xs font-normal text-slate-500">/ month (A+B)</span></p>
                </div>
                <Link to="/register" className="px-4 py-2 rounded-xl bg-navy-800 text-white text-xs font-semibold hover:bg-navy-700 transition-colors">
                  Select Option B
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE ESTIMATE CALCULATOR */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-5 space-y-5">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Deterministic Pricing Engine</span>
              <h2 className="text-3xl font-extrabold text-navy-800">
                Transparent Premium Estimation in Seconds
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                Test our deterministic calculation engine. AI explains the rationale and customizes risk scoring, but premiums follow auditable, admin-configurable rules.
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <p className="font-semibold text-slate-700">Pricing Formula Highlights:</p>
                <ul className="space-y-1 text-slate-600 list-disc list-inside">
                  <li>Base rate: Basic ₹199 | Plus Dual ₹349 | Elite ₹499</li>
                  <li>Tenure discount: 5% discount (3+ yrs) | 10% discount (5+ yrs)</li>
                  <li>Max protection equals 100% of your verified salary</li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#F7F9FC] rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
              <div className="space-y-6">
                
                {/* Monthly Salary Slider */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700 mb-2">
                    <span>Monthly Salary</span>
                    <span className="text-sm font-bold text-teal-700">₹{calcSalary.toLocaleString('en-IN')} / month</span>
                  </div>
                  <input
                    type="range"
                    min="12000"
                    max="45000"
                    step="1000"
                    value={calcSalary}
                    onChange={(e) => setCalcSalary(Number(e.target.value))}
                    className="w-full accent-teal-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>₹12,000</span>
                    <span>₹28,000 (Average)</span>
                    <span>₹45,000</span>
                  </div>
                </div>

                {/* Category & Experience Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Caregiver Category</label>
                    <select
                      value={calcCategory}
                      onChange={(e) => setCalcCategory(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Elderly Care">Elderly Care Attendant</option>
                      <option value="Patient Care Assistant">Patient Care Assistant (PCA)</option>
                      <option value="Home Nurse">Certified Home Nurse</option>
                      <option value="Specialized Care">Specialized ICU/Palliative Care</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Experience in Caregiving</label>
                    <select
                      value={calcExp}
                      onChange={(e) => setCalcExp(Number(e.target.value))}
                      className="w-full text-xs bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500"
                    >
                      <option value={1}>1 Year (Junior)</option>
                      <option value={2}>2 Years</option>
                      <option value={3}>3 Years (5% Tenure Discount)</option>
                      <option value={5}>5+ Years (10% Tenure Discount)</option>
                    </select>
                  </div>
                </div>

                {/* Coverage Option Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Selected Protection Type</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'OPTION_A', label: 'Option A Only' },
                      { key: 'COMBINED', label: 'Plus (A + B)' },
                      { key: 'PREMIUM', label: 'Elite Dual' }
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => setCalcCoverage(opt.key)}
                        className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                          calcCoverage === opt.key
                            ? 'bg-navy-800 text-white border-navy-800 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Result Card */}
                <div className="p-5 rounded-2xl bg-white border border-teal-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-600">Illustrative Estimate</span>
                    <p className="text-2xl font-black text-navy-800">
                      ₹{est.finalEst} <span className="text-xs font-medium text-slate-500">/ month</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Guarantees up to ₹{est.benefit.toLocaleString('en-IN')}/mo (₹{est.daily}/day benefit)
                    </p>
                  </div>

                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold text-center shadow-xs transition-colors"
                  >
                    Lock In Quote
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* PLANS & COMPARISON */}
      <section id="plans" className="py-20 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Simulated Insurance Plans</span>
            <h2 className="text-3xl font-extrabold text-navy-800">Designed for Every Caregiver Budget</h2>
            <p className="text-sm text-slate-600">
              Clear tiers with configurable limits. All prices are prototype demonstration values.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Basic Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-slate-100 text-slate-700">
                  Basic Plan
                </span>
                <h3 className="text-xl font-bold text-navy-800">Basic Care Shield</h3>
                <p className="text-xs text-slate-500">Essential Option A coverage for accidental injuries and illness.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-navy-800">₹199</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Option A Medical Incapacity</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="w-4 h-0.5 bg-slate-300"></span>
                    <span className="line-through">Option B Job Loss Cover</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Up to 60 days medical benefit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>7-day waiting period</span>
                  </div>
                </div>
              </div>

              <Link to="/register" className="w-full py-2.5 rounded-xl border border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white text-xs font-bold text-center transition-colors">
                Choose Basic
              </Link>
            </div>

            {/* Plus Plan - Featured */}
            <div className="bg-white rounded-3xl p-8 border-2 border-teal-500 shadow-xl shadow-teal-500/10 flex flex-col justify-between space-y-6 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="px-3 py-1 rounded-full bg-teal-600 text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Most Popular
                </span>
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-teal-50 text-teal-700">
                  Plus Plan
                </span>
                <h3 className="text-xl font-bold text-navy-800">CareGap Plus Dual Shield</h3>
                <p className="text-xs text-slate-500">Dual Option A & Option B protection against both sickness and contract termination.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-navy-800">₹349</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span><strong>Option A:</strong> Medical Incapacity</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span><strong>Option B:</strong> Involuntary Job Loss</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Up to 60 days replacement duration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Agency verification expedited track</span>
                  </div>
                </div>
              </div>

              <Link to="/register" className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold text-center shadow-xs transition-colors">
                Choose Plus Dual
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow">
              <div className="space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-navy-50 text-navy-800">
                  Elite Plan
                </span>
                <h3 className="text-xl font-bold text-navy-800">CareGap Elite Comprehensive</h3>
                <p className="text-xs text-slate-500">Extended 90-day coverage, zero deductible, and expedited claim review.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-navy-800">₹499</span>
                  <span className="text-xs text-slate-500"> / month</span>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs text-slate-700">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Dual Option A + Option B</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Extended 90 days duration limit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>Reduced 3-day waiting period</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span>120% income cap multiplier</span>
                  </div>
                </div>
              </div>

              <Link to="/register" className="w-full py-2.5 rounded-xl border border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white text-xs font-bold text-center transition-colors">
                Choose Elite
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* HOW AI HELPS CAREGIVERS */}
      <section id="ai-capabilities" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Responsible AI Integration</span>
            <h2 className="text-3xl font-extrabold text-navy-800">Powered by Google Gemini</h2>
            <p className="text-sm text-slate-600">
              Artificial intelligence assists underwriting and speeds up legitimate claims while always maintaining human adjuster oversight.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-800">AI Risk Assessment</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Evaluates employment stability, category factors, and verifiable tenure. Generates structured JSON indicators (10-90 score) strictly as human decision support—never auto-denying coverage.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-800">Claim Document Analysis</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Scans medical certificates and termination letters, extracts key diagnosis and date metadata, detects missing attachments, and alerts adjusters to inconsistencies.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#F7F9FC] border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-navy-800">CareGap AI Assistant</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                24/7 conversational guide trained on live plan rules. Answers caregiver questions on waiting periods, required proofs, and benefits with complete database context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section id="faqs" className="py-20 bg-[#F7F9FC] border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Got Questions?</span>
            <h2 className="text-3xl font-extrabold text-navy-800">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between font-semibold text-sm text-navy-800 hover:text-teal-600"
                >
                  <span>{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="w-4 h-4 text-teal-600" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-16 bg-navy-800 text-white relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 relative z-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Protect Your Hard-Earned Caregiving Income?
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-normal">
            Join professional nurses and attendants across Mumbai, Bengaluru, Delhi and Hyderabad testing the future of income continuity.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-navy-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all"
            >
              Get Started Now
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-navy-700/80 hover:bg-navy-700 text-white border border-navy-600 font-semibold text-sm transition-all"
            >
              Open Demo Account
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      <ChatWidget />
    </div>
  );
};

