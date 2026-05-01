'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface AuthFormProps {
  type: 'login' | 'signup';
}

export default function AuthForm({ type }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('Member');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = type === 'login' 
        ? await login(email, password) 
        : await signup(email, password, name, role);

      if (authError) throw authError;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full space-y-8 p-12 bg-white/10 backdrop-blur-2xl rounded-[2.5rem] border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] z-10">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-6 transform rotate-12 group hover:rotate-0 transition-transform duration-500">
           <span className="text-white text-3xl font-black -rotate-12 group-hover:rotate-0 transition-transform duration-500">T</span>
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter">
          {type === 'login' ? 'Welcome Back' : 'Join TaskFlow'}
        </h2>
        <p className="mt-2 text-slate-400 font-medium">
          {type === 'login' ? 'Please enter your details to sign in' : 'Create your pro account today'}
        </p>
      </div>
      <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-3 rounded-xl text-xs font-bold text-center animate-shake">
            {error}
          </div>
        )}
        <div className="space-y-4">
          {type === 'signup' && (
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Full Name</label>
              <input
                type="text"
                required
                className="block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
            <input
              type="email"
              required
              className="block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
              placeholder="name@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Password</label>
            <input
              type="password"
              required
              className="block w-full px-5 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        {type === 'signup' && (
          <div className="space-y-3">
             <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Select Role</label>
             <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setRole('Member')}
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${role === 'Member' ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
                >
                  Member
                </button>
                <button
                  type="button"
                  onClick={() => setRole('Admin')}
                  className={`flex-1 py-3 text-xs font-black rounded-xl transition-all duration-300 uppercase tracking-widest ${role === 'Admin' ? 'bg-white text-slate-900 shadow-xl scale-[1.02]' : 'text-slate-400 hover:text-white'}`}
                >
                  Admin
                </button>
             </div>
             <p className="text-[10px] text-slate-500 font-bold italic ml-1">
               {role === 'Admin' ? '✨ Full administrative controls over projects.' : '🤝 Collaboration and task tracking permissions.'}
             </p>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-black rounded-2xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (type === 'login' ? 'Sign In Now' : 'Create Account')}
          </button>
        </div>

        <div className="text-center pt-4">
          <Link href={type === 'login' ? '/signup' : '/login'} className="text-sm font-bold text-slate-400 hover:text-white transition-colors duration-300">
            {type === 'login' ? "Don't have an account? " : "Already have an account? "}
            <span className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-4">
              {type === 'login' ? 'Register' : 'Login'}
            </span>
          </Link>
        </div>
      </form>
    </div>
  );
}
