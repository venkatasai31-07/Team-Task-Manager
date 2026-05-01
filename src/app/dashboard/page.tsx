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
      <div className="mb-10">
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 font-medium mt-1">Welcome back! Here is what is happening across your projects.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
        <Link href="/projects"><StatCard title="Total Tasks" value={stats.totalTasks} color="blue" /></Link>
        <Link href="/projects"><StatCard title="Pending" value={stats.tasksByStatus.todo} color="yellow" /></Link>
        <Link href="/projects"><StatCard title="In Progress" value={stats.tasksByStatus.inProgress} color="indigo" /></Link>
        <Link href="/projects"><StatCard title="Completed" value={stats.tasksByStatus.done} color="green" /></Link>
        <Link href="/projects"><StatCard title="Overdue" value={stats.overdueTasks} color="red" /></Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
           <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 transition-all duration-300 group-hover:w-2"></div>
           <h2 className="text-xl font-black mb-6 text-slate-900 flex items-center">
             Recent Tasks
             <span className="ml-3 text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Latest Activity</span>
           </h2>
           <div className="space-y-4">
             {stats.recentTasks?.map((task: any) => (
               <Link 
                 key={task.id} 
                 href={`/projects/${task.project_id}`}
                 className="flex justify-between items-center p-4 rounded-2xl border border-slate-50 hover:bg-slate-50 hover:border-indigo-100 transition-all group/item"
               >
                 <span className="text-sm font-bold text-slate-700 group-hover/item:text-indigo-600 transition-colors">{task.title}</span>
                 <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${
                   task.status === 'Done' ? 'bg-emerald-100 text-emerald-700' : 
                   task.status === 'In Progress' ? 'bg-indigo-100 text-indigo-700' : 'bg-amber-100 text-amber-700'
                 }`}>
                   {task.status}
                 </span>
               </Link>
             ))}
             {(!stats.recentTasks || stats.recentTasks.length === 0) && (
               <div className="py-10 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-2xl">
                 No tasks created yet.
               </div>
             )}
           </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500 transition-all duration-300 group-hover:w-2"></div>
          <h2 className="text-xl font-black mb-6 text-slate-900 flex items-center">
            Tasks Per User
            <span className="ml-3 text-[10px] bg-slate-100 text-slate-400 px-2 py-0.5 rounded-full uppercase tracking-widest font-black">Workload</span>
          </h2>
          <div className="space-y-4">
            {stats.tasksPerUser.map((u: any) => (
              <div key={u.name} className="flex justify-between items-center p-4 rounded-2xl bg-slate-50/50 border border-transparent hover:border-emerald-200 transition-all">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black text-xs">
                    {u.name[0]}
                  </div>
                  <span className="text-slate-800 font-bold">{u.name}</span>
                </div>
                <span className="bg-white px-4 py-1.5 rounded-xl text-xs font-black text-slate-600 shadow-sm border border-slate-100">
                  {u.count} TASKS
                </span>
              </div>
            ))}
            {stats.tasksPerUser.length === 0 && (
               <div className="py-10 text-center text-slate-400 font-medium italic border-2 border-dashed border-slate-100 rounded-2xl">
                 No tasks assigned yet.
               </div>
             )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatCard({ title, value, color }: { title: string, value: number, color: string }) {
  const themes: any = {
    blue: 'from-blue-600 to-indigo-700 shadow-blue-200',
    yellow: 'from-amber-400 to-orange-500 shadow-amber-200',
    indigo: 'from-indigo-500 to-purple-600 shadow-indigo-200',
    green: 'from-emerald-500 to-teal-600 shadow-emerald-200',
    red: 'from-rose-500 to-red-600 shadow-rose-200',
  };

  return (
    <div className={`p-6 rounded-3xl bg-gradient-to-br ${themes[color]} text-white shadow-xl transition-transform hover:-translate-y-1 duration-300`}>
      <div className="text-[10px] font-black uppercase tracking-widest opacity-80">{title}</div>
      <div className="text-4xl font-black mt-2 tracking-tighter">{value}</div>
    </div>
  );
}
