import React, { useState } from 'react';
import { Settings, Lock, Bell, Shield, Save, CheckCircle2 } from 'lucide-react';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { ChatWidget } from '../../components/ChatWidget';

export const CaregiverSettingsPage: React.FC = () => {
  const [notifsEnabled, setNotifsEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('Preferences updated successfully.');
    setTimeout(() => setMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Account & Privacy Settings" subtitle="Configure notifications, security credentials, and data privacy" />

        <main className="p-6 max-w-3xl space-y-6">
          {msg && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{msg}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-6">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Bell className="w-4 h-4 text-teal-600" />
                Notification Preferences
              </h3>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <p className="font-semibold text-navy-800">In-App Claim Updates</p>
                    <p className="text-slate-500 text-[11px]">Receive live alerts when adjusters review or approve claims.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={notifsEnabled}
                    onChange={(e) => setNotifsEnabled(e.target.checked)}
                    className="w-4 h-4 accent-teal-600"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <p className="font-semibold text-navy-800">Email Renewal Reminders</p>
                    <p className="text-slate-500 text-[11px]">Notify me 30 days prior to annual policy renewal.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailAlerts}
                    onChange={(e) => setEmailAlerts(e.target.checked)}
                    className="w-4 h-4 accent-teal-600"
                  />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-navy-800 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Shield className="w-4 h-4 text-teal-600" />
                Privacy & Data Retention
              </h3>

              <p className="text-xs text-slate-600 leading-relaxed">
                Your medical certificates and sensitive health diagnoses are encrypted and strictly restricted to authorized claim adjudicators. Employers and placement agencies cannot view medical incapacity records.
              </p>

              <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-900 text-xs">
                Zero-credential storage: Bank card details and netbanking passwords are never collected.
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-xs transition-colors"
            >
              Save Preferences
            </button>
          </form>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
};

