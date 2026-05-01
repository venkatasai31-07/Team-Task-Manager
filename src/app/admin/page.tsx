'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

export default function AdminConsolePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { session, user } = useAuth();

  useEffect(() => {
    if (session?.access_token) {
      fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
    }
  }, [session]);

  const handleToggleRole = async (uId: string, currentRole: string) => {
    const newRole = currentRole === 'Admin' ? 'Member' : 'Admin';
    const res = await fetch(`/api/admin/users/${uId}`, {
      method: 'PATCH',
      headers: { 
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ role: newRole })
    });
    if (res.ok) {
      // Refresh data
      const updatedUsers = data.allSystemUsers.map((u: any) => 
        u.id === uId ? { ...u, role: newRole } : u
      );
      setData({ ...data, allSystemUsers: updatedUsers });
    }
  };

  const handleDeleteUser = async (uId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    
    const res = await fetch(`/api/admin/users/${uId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${session.access_token}` }
    });
    if (res.ok) {
      setData({
        ...data,
        allSystemUsers: data.allSystemUsers.filter((u: any) => u.id !== uId)
      });
    }
  };

  if (loading) return <DashboardLayout><div className="text-slate-900 font-bold p-8">Loading console...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">System Admin Console</h1>
          <p className="text-slate-500 font-medium mt-1">Global oversight of projects, tasks, and users</p>
        </div>
        <div className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl border border-indigo-100 uppercase tracking-widest shadow-sm shadow-indigo-100">
          SYSTEM HEALTH: 100% OPERATIONAL
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
          <div className="p-5 bg-gradient-to-tr from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Users</div>
            <div className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">{data.allSystemUsers?.length || 0}</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 group hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300">
          <div className="p-5 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-2xl shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 00(2) 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Global Tasks</div>
            <div className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">{data.totalTasks || 0}</div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex items-center space-x-6 group hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-300">
          <div className="p-5 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-2xl shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Overdue Rate</div>
            <div className="text-4xl font-black text-slate-900 leading-tight tracking-tighter">{data.totalTasks > 0 ? Math.round((data.overdueTasks / data.totalTasks) * 100) : 0}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/30 flex justify-between items-center">
            <h2 className="text-xl font-black text-slate-900">User Management</h2>
            <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest bg-white px-3 py-1 rounded-full border border-slate-100 shadow-sm">
              Managing {data.allSystemUsers?.length} Active Users
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/10">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">User Profile</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">System Role</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.allSystemUsers?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-center text-indigo-700 font-black text-lg shadow-sm">
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-900 flex items-center">
                            {u.name} {u.id === user?.id && <span className="ml-2 bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full font-black tracking-widest">YOU</span>}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        u.role === 'Admin' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-emerald-600 text-[10px] font-black tracking-widest">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                        ACTIVE
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right space-x-3">
                       <button 
                        onClick={() => handleToggleRole(u.id, u.role)}
                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 transition p-2 hover:bg-indigo-50 rounded-lg"
                       >
                         Role
                       </button>
                       {u.id !== user?.id && (
                         <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600 transition p-2 hover:bg-rose-50 rounded-lg"
                         >
                           Delete
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
