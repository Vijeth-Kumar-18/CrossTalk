'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG, UI_STRINGS, SUPPORTED_LANGUAGES, DEMO_USERS } from '@/constants/appConstants';
import { MessageSquare, Plus, LogOut, User as UserIcon, Globe, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();

  const userLang = user?.preferred_language
    ? SUPPORTED_LANGUAGES[user.preferred_language]?.name || user.preferred_language
    : 'English';

  const otherDemoUser = user?.id === DEMO_USERS[0].id ? DEMO_USERS[1] : DEMO_USERS[0];

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-sm shadow-sm group-hover:bg-slate-800 transition-colors">
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
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
            {UI_STRINGS.NAVBAR.DASHBOARD}
          </Link>
          <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
            Debate Rooms
          </Link>
          <Link href="/#how-it-works" className="hover:text-slate-900 transition-colors">
            How It Works
          </Link>
        </nav>

        {/* Right User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Quick Switch Persona for Multi-Window Testing */}
              <button
                onClick={() => demoLogin(otherDemoUser.id)}
                title={`Quick Switch to ${otherDemoUser.fullName} (${otherDemoUser.role})`}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
              >
                <span>Switch to {otherDemoUser.fullName.split(' ')[0]}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>

              {/* User Profile Tag */}
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold text-slate-800 max-w-[120px] truncate">
                  {user.full_name}
                </span>
                <span className="text-slate-300">|</span>
                <div className="flex items-center gap-1 text-slate-600 font-mono text-[11px]">
                  <Globe className="w-3 h-3 text-slate-400" />
                  <span>{userLang.split(' ')[0]}</span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                title={UI_STRINGS.NAVBAR.SIGN_OUT}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
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
                className="px-3.5 py-1.5 text-xs font-medium rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-sm"
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
