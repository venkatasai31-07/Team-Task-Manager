'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading } = useAuth();
  const pathname = usePathname();

  if (loading) return <div>Loading...</div>;
  if (!user) return null; // Should be handled by middleware or redirect in useEffect

  const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Projects', href: '/projects' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-indigo-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold border-b border-indigo-800">
          TaskFlow
        </div>
        <nav className="flex-grow p-4 space-y-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`block px-4 py-2 rounded-lg hover:bg-indigo-800 transition ${pathname === item.href ? 'bg-indigo-700' : ''}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-indigo-800">
          <div className="text-sm opacity-75">Logged in as:</div>
          <div className="font-medium truncate">{user.name}</div>
          <button 
            onClick={logout}
            className="mt-4 w-full px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm transition"
          >
            Logout
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
