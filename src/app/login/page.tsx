'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UI_STRINGS, DEMO_USERS } from '@/constants/appConstants';
import { MessageSquare, ArrowRight, UserCheck, Shield } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setError('');
    const ok = await login(email);
    setIsLoading(false);

    if (ok) {
      router.push('/dashboard');
    } else {
      setError('Invalid login credentials.');
    }
  };

  const handleDemo = async (userId: string) => {
    setIsLoading(true);
    setError('');
    const ok = await demoLogin(userId);
    setIsLoading(false);
    if (ok) {
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#f8fafc]">
      <div className="w-full max-w-md enterprise-card bg-white p-8 border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 mx-auto flex items-center justify-center text-white mb-3 shadow-sm">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {UI_STRINGS.AUTH.LOGIN_TITLE}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {UI_STRINGS.AUTH.LOGIN_SUBTITLE}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
            {error}
          </div>
        )}

        {/* Standard Email Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {UI_STRINGS.AUTH.EMAIL_LABEL}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              className="w-full px-3 py-2 text-sm enterprise-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {UI_STRINGS.AUTH.PASSWORD_LABEL}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 text-sm enterprise-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : UI_STRINGS.AUTH.LOGIN_BTN}
          </button>
        </form>

        {/* 1-Click Demo Profiles for Rapid Multi-Tab Testing */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-3 text-center">
            {UI_STRINGS.AUTH.DEMO_ACCOUNT_LABEL}
          </p>

          <div className="grid grid-cols-1 gap-2">
            {DEMO_USERS.map((demo) => (
              <button
                key={demo.id}
                type="button"
                onClick={() => handleDemo(demo.id)}
                className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 transition-all text-left text-xs cursor-pointer"
              >
                <div>
                  <div className="font-semibold text-slate-900">
                    {demo.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {demo.email} • {demo.preferredLanguage}
                  </div>
                </div>
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                  {demo.role.split('/')[0]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-slate-900 hover:underline">
            {UI_STRINGS.AUTH.SIGNUP_BTN}
          </Link>
        </div>
      </div>
    </div>
  );
}
