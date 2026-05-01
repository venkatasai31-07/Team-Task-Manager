'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/context/AuthContext';

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
      <h1 className="text-3xl font-bold mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Tasks" value={stats.totalTasks} color="blue" />
        <StatCard title="Pending (To Do)" value={stats.tasksByStatus.todo} color="yellow" />
        <StatCard title="In Progress" value={stats.tasksByStatus.inProgress} color="indigo" />
        <StatCard title="Completed" value={stats.tasksByStatus.done} color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-red-600">Overdue Tasks</h2>
          <div className="text-4xl font-bold">{stats.overdueTasks}</div>
          <p className="text-sm text-gray-500 mt-2">Tasks past due date that are not completed.</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-4">Tasks Per User</h2>
          <div className="space-y-4">
            {stats.tasksPerUser.map((u: any) => (
              <div key={u.name} className="flex justify-between items-center">
                <span>{u.name}</span>
                <span className="bg-gray-100 px-3 py-1 rounded-full text-sm font-medium">{u.count} tasks</span>
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
  };

  return (
    <div className={`p-6 rounded-xl border shadow-sm ${colors[color]}`}>
      <div className="text-sm font-medium opacity-75">{title}</div>
      <div className="text-3xl font-bold mt-1">{value}</div>
    </div>
  );
}
