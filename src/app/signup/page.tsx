'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UI_STRINGS, SUPPORTED_LANGUAGES } from '@/constants/appConstants';
import { UserPlus, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('en-US');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !password) {
      setError('Please fill out all required fields.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);
    setError('');
    const res = await signup({
      email: email.trim(),
      fullName: fullName.trim(),
      password,
      preferredLanguage,
    });
    setIsLoading(false);

    if (res.success) {
      router.push('/dashboard');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 sm:p-6 bg-[#f8fafc]">
      <div className="w-full max-w-md enterprise-card bg-white p-8 border border-slate-200">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-900 mx-auto flex items-center justify-center text-white mb-3 shadow-xs">
            <UserPlus className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {UI_STRINGS.AUTH.SIGNUP_TITLE}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {UI_STRINGS.AUTH.SIGNUP_SUBTITLE}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-600 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
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
              onChange={(e) => {
                setFullName(e.target.value);
                setError('');
              }}
              placeholder="e.g. Elena Rostova"
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
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              placeholder="name@company.com"
              required
              autoComplete="email"
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {UI_STRINGS.AUTH.PASSWORD_LABEL}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              placeholder="At least 8 characters"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm enterprise-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {UI_STRINGS.AUTH.CONFIRM_PASSWORD_LABEL}
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setError('');
              }}
              placeholder="Re-enter password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full px-3 py-2 text-sm enterprise-input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email.trim() || !fullName.trim() || !password}
            className="w-full py-2.5 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50"
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
