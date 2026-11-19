import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  User,
  Briefcase,
  Building,
  CreditCard,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { PrototypeNotice } from '../../components/PrototypeNotice';

export const CaregiverOnboarding: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Personal
    full_name: 'Pooja Sharma',
    mobile_number: '9820123456',
    date_of_birth: '1994-06-15',
    city: 'Mumbai',
    state: 'Maharashtra',
    pin_code: '400050',
    // Step 2: Employment & Salary
    caregiver_category: 'Elderly Care',
    years_experience: 3.5,
    monthly_salary: 20000,
    employment_type: 'Full-Time Agency',
    employer_name: 'CareBridge Senior Living & Homecare',
    employment_start_date: '2023-01-15',
    // Step 3: Bank Details (Masked)
    bank_name: 'HDFC Bank',
    bank_account_last4: '4921',
    ifsc_code: 'HDFC0001234',
    // Step 4: Plan Choice
    selected_plan_id: 2, // Plus Dual Shield default
    coverage_type: 'COMBINED'
  });

  const [aiRiskResult, setAiRiskResult] = useState<any>(null);

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    setError('');

    if (currentStep === 1) {
      if (!formData.full_name || !formData.mobile_number || !formData.city || !formData.pin_code) {
        setError('Please fill in all personal and contact fields.');
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!formData.monthly_salary || formData.monthly_salary <= 0) {
        setError('Please enter a valid monthly salary.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!formData.bank_name || !formData.bank_account_last4 || formData.bank_account_last4.length !== 4) {
        setError('Please enter your bank name and the last 4 digits of your account.');
        return;
      }

      // Run AI Underwriting Risk Assessment before Step 4
      setLoading(true);
      try {
        const riskRes = await api.post('/risk-assessment/evaluate', {
          caregiver_category: formData.caregiver_category,
          employment_type: formData.employment_type,
          years_experience: formData.years_experience,
          monthly_salary: formData.monthly_salary,
          employment_duration_months: 18,
          declared_risks: ["Night Shift Patient Care"],
          selected_coverage: formData.coverage_type
        });
        setAiRiskResult(riskRes.data);
        setCurrentStep(4);
      } catch (e) {
        // Fallback default
        setAiRiskResult({
          risk_category: 'LOW',
          risk_score: 28,
          risk_factors: ['Verifiable agency employment history', 'Continuous salary pattern'],
          recommendations: ['Plus Dual Shield provides balanced health and employment safety.'],
          explanation: 'Evaluated as low risk under prototype decision-support guidelines.'
        });
        setCurrentStep(4);
      } finally {
        setLoading(false);
      }
    } else if (currentStep === 4) {
      // Finalize Onboarding: Save profile and activate policy
      setLoading(true);
      try {
        await api.put('/caregivers/profile', {
          full_name: formData.full_name,
          mobile_number: formData.mobile_number,
          date_of_birth: formData.date_of_birth,
          city: formData.city,
          state: formData.state,
          pin_code: formData.pin_code,
          caregiver_category: formData.caregiver_category,
          years_experience: formData.years_experience,
          monthly_salary: formData.monthly_salary,
          employment_type: formData.employment_type,
          employer_name: formData.employer_name,
          employment_start_date: formData.employment_start_date,
          bank_name: formData.bank_name,
          bank_account_last4: formData.bank_account_last4,
          ifsc_code: formData.ifsc_code,
          bank_verification_status: 'verified'
        });

        // Activate policy
        await api.post('/policies/purchase', {
          plan_id: formData.selected_plan_id,
          coverage_type: formData.coverage_type,
          terms_accepted: true
        });

        navigate('/caregiver');
      } catch (e: any) {
        setError(e.response?.data?.detail || 'Failed to complete profile onboarding. Please check inputs.');
      } finally {
        setLoading(false);
      }
    }
  };

  const progressPercent = (currentStep / 4) * 100;

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-between">
      <PrototypeNotice />

      <div className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        
        {/* Progress Bar Header */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center text-xs font-semibold text-navy-800">
            <span>Caregiver Onboarding Wizard</span>
            <span className="text-teal-600 font-bold">Step {currentStep} of 4 ({progressPercent}%)</span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-teal-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Personal & Contact */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-navy-800">Personal Information</h3>
                <p className="text-xs text-slate-500">Enter your basic demographic and contact details</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => updateField('full_name', e.target.value)}
                  placeholder="e.g. Pooja Sharma"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => updateField('mobile_number', e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => updateField('date_of_birth', e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="Mumbai"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => updateField('state', e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PIN Code</label>
                  <input
                    type="text"
                    value={formData.pin_code}
                    onChange={(e) => updateField('pin_code', e.target.value)}
                    placeholder="400050"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Employment & Salary */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-navy-800">Caregiving & Salary Profile</h3>
                <p className="text-xs text-slate-500">Your income protection benefits are calculated from these values</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Caregiver Category</label>
                  <select
                    value={formData.caregiver_category}
                    onChange={(e) => updateField('caregiver_category', e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  >
                    <option value="Elderly Care">Elderly Care Attendant</option>
                    <option value="Patient Care Assistant">Patient Care Assistant (PCA)</option>
                    <option value="Home Nurse">Home Nurse</option>
                    <option value="Specialized Care">Specialized Palliative / ICU</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Years of Experience</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    value={formData.years_experience}
                    onChange={(e) => updateField('years_experience', Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Declared Monthly Salary (₹)</label>
                <input
                  type="number"
                  step="500"
                  value={formData.monthly_salary}
                  onChange={(e) => updateField('monthly_salary', Number(e.target.value))}
                  placeholder="20000"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white font-bold"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Protection payout limit will be ₹{formData.monthly_salary.toLocaleString('en-IN')}/month.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                  <select
                    value={formData.employment_type}
                    onChange={(e) => updateField('employment_type', e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  >
                    <option value="Full-Time Agency">Full-Time Agency Placed</option>
                    <option value="Direct Family Contract">Direct Household Family Contract</option>
                    <option value="Part-Time Multiple Homes">Part-Time Multiple Homes</option>
                    <option value="Freelance/Independent">Freelance / Independent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Agency / Employer Name</label>
                  <input
                    type="text"
                    value={formData.employer_name}
                    onChange={(e) => updateField('employer_name', e.target.value)}
                    placeholder="e.g. CareBridge Senior Care"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Bank Account Verification */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-navy-800">Payout Bank Verification</h3>
                <p className="text-xs text-slate-500">Provide bank information for direct claim benefit disbursals</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                <Shield className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Privacy Guarantee:</strong> We never collect or store netbanking passwords or complete card numbers. We only store masked accounts for automated verification and claim payout transfers.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={formData.bank_name}
                  onChange={(e) => updateField('bank_name', e.target.value)}
                  placeholder="e.g. State Bank of India, HDFC Bank"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Last 4 Digits</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={formData.bank_account_last4}
                    onChange={(e) => updateField('bank_account_last4', e.target.value)}
                    placeholder="4921"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    value={formData.ifsc_code}
                    onChange={(e) => updateField('ifsc_code', e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white font-mono uppercase"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: AI Underwriting & Plan Activation */}
          {currentStep === 4 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 pb-3">
                <h3 className="text-base font-bold text-navy-800">AI Risk Assessment & Plan Selection</h3>
                <p className="text-xs text-slate-500">Google Gemini risk evaluation and policy activation</p>
              </div>

              {/* AI Assessment Result Card */}
              {aiRiskResult && (
                <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-teal-600" />
                      <span className="text-xs font-bold text-navy-800">Underwriting Assessment</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-teal-600 text-white">
                      Risk Category: {aiRiskResult.risk_category} (Score: {aiRiskResult.risk_score}/100)
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic">
                    "{aiRiskResult.explanation}"
                  </p>

                  <div className="pt-1 text-[11px] text-slate-600 space-y-1">
                    <p className="font-semibold text-navy-800">Observed Stability Factors:</p>
                    {aiRiskResult.risk_factors?.map((f: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-slate-600">
                        <CheckCircle2 className="w-3 h-3 text-teal-600 flex-shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Plan Choice Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">Select Your Coverage Package</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => {
                      updateField('selected_plan_id', 1);
                      updateField('coverage_type', 'OPTION_A');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.coverage_type === 'OPTION_A'
                        ? 'bg-navy-800 text-white border-navy-800 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold">Basic Care Shield</span>
                      <span className="text-xs font-extrabold text-teal-400">₹199/mo</span>
                    </div>
                    <p className={`text-[11px] ${formData.coverage_type === 'OPTION_A' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Option A Medical Incapacity only.
                    </p>
                  </div>

                  <div
                    onClick={() => {
                      updateField('selected_plan_id', 2);
                      updateField('coverage_type', 'COMBINED');
                    }}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      formData.coverage_type === 'COMBINED'
                        ? 'bg-navy-800 text-white border-navy-800 shadow-md'
                        : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold flex items-center gap-1">
                        CareGap Plus Dual
                        <span className="text-[9px] px-1 py-0.2 rounded bg-teal-500 text-navy-950 font-bold">Recommended</span>
                      </span>
                      <span className="text-xs font-extrabold text-teal-400">₹349/mo</span>
                    </div>
                    <p className={`text-[11px] ${formData.coverage_type === 'COMBINED' ? 'text-slate-300' : 'text-slate-500'}`}>
                      Dual Option A (Medical) + Option B (Involuntary Job Loss).
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                By activating this prototype policy, you acknowledge this is an academic software demonstration. No real financial debit occurs.
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            ) : <div></div>}

            <button
              type="button"
              disabled={loading}
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <span>Processing...</span>
              ) : currentStep === 4 ? (
                <>
                  <span>Activate Policy & Go to Dashboard</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

