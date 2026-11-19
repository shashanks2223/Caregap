import React, { useState, useEffect } from 'react';
import { Building2, Search, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import { Sidebar } from '../../components/Sidebar';
import { Topbar } from '../../components/Topbar';

export const AdminEmployersPage: React.FC = () => {
  const [employers, setEmployers] = useState<any[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchEmployers();
  }, []);

  const fetchEmployers = async () => {
    try {
      const res = await api.get('/admin/employers');
      setEmployers(res.data);
    } catch (e) {
      console.log('Error fetching employers:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleVerify = async (id: number, current: boolean) => {
    try {
      await api.put(`/admin/employers/${id}/verify?verified=${!current}`);
      fetchEmployers();
    } catch (e) {
      alert('Verification update failed.');
    }
  };

  const filtered = employers.filter(e =>
    e.organization_name.toLowerCase().includes(search.toLowerCase()) ||
    e.city.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar title="Care Agency & Employer Directory" subtitle="Manage healthcare agencies and toggle official accreditation status" />

        <main className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between text-xs">
            <div className="relative w-full max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search agency name, city..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-slate-800 focus:outline-none focus:border-teal-500"
              />
            </div>
            <span className="text-slate-500 font-medium">Total: {employers.length} Agencies</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Organization</th>
                    <th className="p-3.5">Type</th>
                    <th className="p-3.5">Contact Person</th>
                    <th className="p-3.5">Mobile</th>
                    <th className="p-3.5">City</th>
                    <th className="p-3.5">Affiliated Staff</th>
                    <th className="p-3.5 text-right">Accreditation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-bold text-navy-800">{emp.organization_name}</td>
                      <td className="p-3.5">{emp.organization_type}</td>
                      <td className="p-3.5">{emp.contact_person}</td>
                      <td className="p-3.5 font-mono text-slate-500">{emp.mobile_number}</td>
                      <td className="p-3.5">{emp.city}</td>
                      <td className="p-3.5 font-bold text-navy-800">{emp.affiliated_caregivers} Caregivers</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => toggleVerify(emp.id, emp.is_verified)}
                          className={`px-3 py-1 rounded-lg font-bold text-xs transition-colors ${
                            emp.is_verified
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {emp.is_verified ? 'Verified Agency' : 'Unverified (Click to Verify)'}
                        </button>
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

