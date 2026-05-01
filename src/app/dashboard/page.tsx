'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { session } = useAuth();

  useEffect(() => {
    if (session?.access_token) {
      fetch('/api/dashboard', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      });
    }
  }, [session]);

  if (loading) return <DashboardLayout><div className="text-gray-900 font-bold">Loading stats...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Link href="/projects"><StatCard title="Total Tasks" value={stats.totalTasks} color="blue" /></Link>
        <Link href="/projects"><StatCard title="Pending" value={stats.tasksByStatus.todo} color="yellow" /></Link>
        <Link href="/projects"><StatCard title="In Progress" value={stats.tasksByStatus.inProgress} color="indigo" /></Link>
        <Link href="/projects"><StatCard title="Completed" value={stats.tasksByStatus.done} color="green" /></Link>
        <Link href="/projects"><StatCard title="Overdue" value={stats.overdueTasks} color="red" /></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <h2 className="text-xl font-bold mb-4 text-gray-900">Recent Tasks</h2>
           <div className="space-y-3">
             {stats.recentTasks?.map((task: any) => (
               <Link 
                 key={task.id} 
                 href={`/projects/${task.project_id}`}
                 className="flex justify-between items-center p-3 rounded-lg border border-gray-50 hover:bg-gray-50 transition"
               >
                 <span className="text-sm font-medium text-gray-800">{task.title}</span>
                 <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full">{task.status}</span>
               </Link>
             ))}
             {(!stats.recentTasks || stats.recentTasks.length === 0) && <p className="text-gray-500 italic">No tasks created yet.</p>}
           </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold mb-4 text-gray-900">Tasks Per User</h2>
          <div className="space-y-4">
            {stats.tasksPerUser.map((u: any) => (
              <div key={u.name} className="flex justify-between items-center">
                <span className="text-gray-800 font-medium">{u.name}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-semibold text-gray-700">{u.count} tasks</span>
              </div>
            ))}
            {stats.tasksPerUser.length === 0 && <p className="text-gray-500 italic">No tasks assigned yet.</p>}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    indigo: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm ${colors[color]}`}>
      <div className="text-sm font-medium opacity-75">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
