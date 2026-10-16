'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG, UI_STRINGS, SUPPORTED_LANGUAGES } from '@/constants/appConstants';
import { MessageSquare, LogOut, User as UserIcon, Globe } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();

  const userLang = user?.preferred_language
    ? SUPPORTED_LANGUAGES[user.preferred_language]?.name || user.preferred_language
    : 'English';

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-xs group-hover:bg-slate-800 transition-colors">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 tracking-tight text-base">
                {APP_CONFIG.NAME}
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold border border-slate-200">
                P2P
              </span>
            </div>
          </div>
        </Link>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                {UI_STRINGS.NAVBAR.DASHBOARD}
              </Link>
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
                My Dispute Rooms
              </Link>
            </>
          ) : (
            <>
              <Link href="/#how-it-works" className="hover:text-slate-900 transition-colors">
                How It Works
              </Link>
              <Link href="/login" className="hover:text-slate-900 transition-colors">
                Dispute Resolution Protocol
              </Link>
            </>
          )}
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Authenticated User Profile Tag */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="font-semibold text-slate-900 max-w-[130px] truncate">
                  {user.full_name}
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>{userLang.split(' ')[0]}</span>
                </div>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                title={UI_STRINGS.NAVBAR.SIGN_OUT}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 transition-colors"
              >
                {UI_STRINGS.NAVBAR.SIGN_IN}
              </Link>
              <Link
                href="/signup"
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-xs"
              >
                {UI_STRINGS.NAVBAR.SIGN_UP}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
