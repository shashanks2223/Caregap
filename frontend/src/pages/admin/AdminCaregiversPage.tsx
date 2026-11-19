import React, { useState, useEffect } from 'react';
import { Users, Search, CheckCircle2, Shield, ArrowRight } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export const AdminCaregiversPage: React.FC = () => {
  const [caregivers, setCaregivers] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchCaregivers();
  }, []);

  const fetchCaregivers = async () => {
    try {
      const res = await api.get('/admin/caregivers');
      setCaregivers(res.data);
    } catch (e) {
      console.log('Error fetching admin caregivers:', e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = caregivers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.city.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Caregiver Staff Directory" subtitle="Manage registered caregivers, verify bank status, and review active protection" />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Search bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search caregiver name, city, category..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
            <span className="text-slate-500 font-medium">Total: {caregivers.length} Registered</span>
          </div>

          {/* Caregiver Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Caregiver Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Experience</th>
                    <th className="p-3.5">Monthly Salary</th>
                    <th className="p-3.5">Bank Status</th>
                    <th className="p-3.5">Protection Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-navy-800">{c.full_name}</td>
                      <td className="p-3.5">{c.category}</td>
                      <td className="p-3.5 text-slate-600">{c.city}, {c.state}</td>
                      <td className="p-3.5">{c.experience} Years</td>
                      <td className="p-3.5 font-bold text-navy-800">₹{c.monthly_salary?.toLocaleString('en-IN')}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {c.bank_status}
                        </span>
                      </td>
                      <td className="p-3.5">
                        {c.active_policy ? (
                          <span className="text-teal-700 font-bold bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                            Active Shield
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

