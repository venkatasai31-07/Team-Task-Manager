'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) return <div className="p-8 text-indigo-600 font-bold">Loading...</div>;
  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
  ];

  if (user.role === 'Admin') {
    navItems.push({ name: 'Admin Console', href: '/admin' });
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white flex flex-col shadow-2xl">
        <div className="p-6 text-2xl font-black tracking-tighter border-b border-slate-800 bg-slate-900/50 backdrop-blur-xl">
          <span className="text-indigo-400">Task</span>Flow
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${
                pathname === item.href 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-xs uppercase shadow-lg shadow-indigo-500/40">
              {user.name[0]}
            </div>
            <div className="flex-grow truncate">
              <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest leading-none mb-1">Authenticated</div>
              <div className="text-sm font-bold truncate leading-none">{user.name}</div>
            </div>
          </div>
          <button 
            onClick={logout}
            className="mt-4 w-full px-4 py-2.5 bg-rose-600/10 text-rose-500 hover:bg-rose-600 hover:text-white border border-rose-500/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow overflow-auto p-8">
        {children}
      </div>
    </div>
  );
}
