'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UI_STRINGS, SUPPORTED_LANGUAGES } from '@/constants/appConstants';
import { MessageSquare } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !fullName) return;

    setIsLoading(true);
    setError('');
    const ok = await signup({ email, fullName, preferredLanguage });
    setIsLoading(false);

    if (ok) {
      router.push('/dashboard');
    } else {
      setError('Registration failed. Try signing in if you already have an account.');
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
            {UI_STRINGS.AUTH.SIGNUP_TITLE}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {UI_STRINGS.AUTH.SIGNUP_SUBTITLE}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {UI_STRINGS.AUTH.NAME_LABEL}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Marco Rossi"
              required
              className="w-full px-3 py-2 text-sm enterprise-input"
            />
          </div>

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
              {UI_STRINGS.AUTH.LANG_LABEL}
            </label>
            <select
              value={preferredLanguage}
              onChange={(e) => setPreferredLanguage(e.target.value)}
              className="w-full px-3 py-2 text-sm enterprise-input bg-white"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors cursor-pointer shadow-sm disabled:opacity-50"
          >
            {isLoading ? 'Creating Account...' : UI_STRINGS.AUTH.SIGNUP_BTN}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-slate-900 hover:underline">
            {UI_STRINGS.AUTH.LOGIN_BTN}
          </Link>
        </div>
      </div>
    </div>
  );
}
