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

  if (loading) return <DashboardLayout><div className="text-gray-900 font-bold">Loading console...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Admin Console</h1>
          <p className="text-gray-500">Global oversight of projects, tasks, and users</p>
        </div>
        <div className="text-sm font-bold text-indigo-600 bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
          SYSTEM HEALTH: 100% OPERATIONAL
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-white to-blue-50/30 p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Total Users</div>
            <div className="text-3xl font-black text-gray-900 leading-tight">{data.allSystemUsers?.length || 0}</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-emerald-50/30 p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 00(2) 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Global Tasks</div>
            <div className="text-3xl font-black text-gray-900 leading-tight">{data.totalTasks || 0}</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-white to-amber-50/30 p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-4">
          <div className="p-4 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Overdue Rate</div>
            <div className="text-3xl font-black text-gray-900 leading-tight">{data.totalTasks > 0 ? Math.round((data.overdueTasks / data.totalTasks) * 100) : 0}%</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">User Management</h2>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Managing {data.allSystemUsers?.length} Users</div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">User Profile</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">System Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.allSystemUsers?.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold">
                          {u.name?.[0]}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900 flex items-center">
                            {u.name} {u.id === user?.id && <span className="ml-2 bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">YOU</span>}
                          </div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                        u.role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-emerald-600 text-xs font-bold">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
                        ACTIVE
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                       <button className="text-gray-400 hover:text-indigo-600 text-xs font-bold underline transition">Role</button>
                       {u.id !== user?.id && (
                         <button className="text-gray-400 hover:text-red-600 text-xs font-bold underline transition">Delete</button>
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
