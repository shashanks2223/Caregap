import React, { useState, useEffect } from 'react';
import { Users, Search, Plus, UserPlus } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';
import { StatusBadge } from '../../components/StatusBadge';

export const EmployerCaregiversPage: React.FC = () => {
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      const res = await api.get('/employers/caregivers');
      setCaregivers(res.data);
    } catch (e) {
      console.log('Error:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = caregivers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.role_title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Agency Caregiver Roster" subtitle="All care attendants affiliated with your agency" />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search caregiver name or role..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
            <span className="text-slate-500 font-medium">Total Staff: {caregivers.length}</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Caregiver Name</th>
                    <th className="p-3.5">Specialty</th>
                    <th className="p-3.5">Role Title</th>
                    <th className="p-3.5">Verified Monthly Salary</th>
                    <th className="p-3.5">Start Date</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Income Shield</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((cg) => (
                    <tr key={cg.employment_id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-navy-800">{cg.full_name}</td>
                      <td className="p-3.5">{cg.category}</td>
                      <td className="p-3.5 text-slate-500">{cg.role_title}</td>
                      <td className="p-3.5 font-bold text-navy-800">₹{cg.monthly_salary?.toLocaleString('en-IN')}</td>
                      <td className="p-3.5 text-slate-500">{cg.start_date}</td>
                      <td className="p-3.5"><StatusBadge status={cg.status} /></td>
                      <td className="p-3.5">
                        {cg.active_protection ? (
                          <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            Active Protection
                          </span>
                        ) : (
                          <span className="text-slate-400">Inactive</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

