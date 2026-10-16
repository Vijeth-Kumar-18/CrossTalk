'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG, UI_STRINGS, SUPPORTED_LANGUAGES } from '@/constants/appConstants';
import {
  MessageSquare,
  LogOut,
  User as UserIcon,
  Globe,
  Settings,
  Menu,
  X,
  Info,
  LayoutDashboard,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const userLang = user?.preferred_language
    ? SUPPORTED_LANGUAGES[user.preferred_language]?.name || user.preferred_language
    : 'English';

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" onClick={closeMenu} className="flex items-center gap-2.5 group">
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

        {/* Center Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          {user ? (
            <>
              <Link href="/dashboard" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
                {UI_STRINGS.NAVBAR.DASHBOARD}
              </Link>
              <Link href="/profile" className="hover:text-slate-900 transition-colors flex items-center gap-1.5">
                Profile & Language
              </Link>
            </>
          ) : (
            <>
              <Link href="/about" className="hover:text-slate-900 transition-colors">
                About Protocol
              </Link>
              <Link href="/#how-it-works" className="hover:text-slate-900 transition-colors">
                How It Works
              </Link>
            </>
          )}
        </nav>

        {/* Right User Actions (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              {/* Authenticated User Profile Link */}
              <Link
                href="/profile"
                title="Manage language and profile settings"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors group cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-slate-200 group-hover:bg-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-700 transition-colors">
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
                <Settings className="w-3 h-3 text-slate-400 group-hover:text-slate-700 transition-colors ml-0.5" />
              </Link>

              {/* Sign Out Button */}
              <button
                onClick={logout}
                title={UI_STRINGS.NAVBAR.SIGN_OUT}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer text-xs font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
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

        {/* Mobile Hamburger Toggle */}
        <div className="flex md:hidden items-center gap-2">
          {user && (
            <Link
              href="/profile"
              onClick={closeMenu}
              className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-800"
            >
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </Link>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={closeMenu}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <LayoutDashboard className="w-4 h-4 text-slate-400" />
                  <span>{UI_STRINGS.NAVBAR.DASHBOARD}</span>
                </Link>

                <Link
                  href="/profile"
                  onClick={closeMenu}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Profile & Language Preferences</span>
                </Link>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between px-3">
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900">{user.full_name}</p>
                    <p className="text-slate-400 text-[11px] font-mono">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      closeMenu();
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Info className="w-4 h-4 text-slate-400" />
                  <span>About Protocol</span>
                </Link>

                <Link
                  href="/#how-it-works"
                  onClick={closeMenu}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare className="w-4 h-4 text-slate-400" />
                  <span>How It Works</span>
                </Link>

                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="py-2.5 text-center text-xs font-semibold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
                  >
                    {UI_STRINGS.NAVBAR.SIGN_IN}
                  </Link>
                  <Link
                    href="/signup"
                    onClick={closeMenu}
                    className="py-2.5 text-center text-xs font-semibold rounded-xl bg-slate-900 text-white hover:bg-slate-800"
                  >
                    {UI_STRINGS.NAVBAR.SIGN_UP}
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
