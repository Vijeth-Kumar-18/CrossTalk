'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { APP_CONFIG, UI_STRINGS } from '@/constants/appConstants';
import {
  ArrowRight,
  Shield,
  VolumeX,
  Zap,
  Globe,
  Radio,
  Users,
  Mic,
  MessageSquare,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [roomCode, setRoomCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleJoinByCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;

    if (!user) {
      router.push(`/login?redirect=${encodeURIComponent(roomCode.trim().toUpperCase())}`);
      return;
    }

    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: roomCode.trim().toUpperCase(),
          userId: user.id,
          userLang: user.preferred_language || 'en-US',
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        router.push(`/room/${data.room.id}`);
      } else {
        setErrorMsg('Room not found. Check the 6-character code or create a new room.');
      }
    } catch {
      setErrorMsg('Failed to join room. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc]">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-200 bg-white">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{UI_STRINGS.LANDING.BADGE}</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Cross-Language Discourse Without Language Barriers.
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-lg text-slate-600 leading-relaxed">
            {UI_STRINGS.LANDING.HERO_DESC}
          </p>

          {/* Action Row */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={user ? '/dashboard' : '/signup'}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium text-sm hover:bg-slate-800 transition-all shadow-md active:scale-98"
            >
              <span>{user ? 'Go to Dashboard' : UI_STRINGS.LANDING.CTA_START}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {/* Quick Room Code Join Form */}
            <form onSubmit={handleJoinByCode} className="w-full sm:w-auto flex items-center gap-2">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="Enter 6-digit Code (e.g. DISPUT)"
                maxLength={8}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-800 placeholder:text-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:border-slate-800 uppercase"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-sm font-medium transition-colors cursor-pointer"
              >
                Join Room
              </button>
            </form>
          </div>

          {errorMsg && (
            <p className="text-xs text-red-600 font-medium pt-1">{errorMsg}</p>
          )}
        </div>
      </section>

      {/* Product Architecture Visual Explainer */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        <div className="enterprise-card p-6 sm:p-8 bg-white border border-slate-200">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-400 tracking-wider">
              System Architecture
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              How Peer-to-Peer Dispute Resolution Works
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Both parties join from their own devices and speak in their native languages with near-zero latency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto text-xs font-bold">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">Direct Speech Capture</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stream spoken thoughts word-by-word via Web Speech API in your native dialect.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto text-xs font-bold">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-900">Acoustic Ducking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                When either participant speaks, the opponent&apos;s audio output silences immediately for natural human dialogue.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center mx-auto text-xs font-bold">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Resolution Audit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Persistent audit registry logs each point, heat score, and concession in Neon PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions / Features Section */}
      <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Engineered for Real Human Friction
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Traditional translation software is built for polite tourist inquiries. CrossTalk is built for high-stakes business arguments.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <VolumeX className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {UI_STRINGS.LANDING.FEATURE_1_TITLE}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {UI_STRINGS.LANDING.FEATURE_1_DESC}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {UI_STRINGS.LANDING.FEATURE_2_TITLE}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {UI_STRINGS.LANDING.FEATURE_2_DESC}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                {UI_STRINGS.LANDING.FEATURE_3_TITLE}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {UI_STRINGS.LANDING.FEATURE_3_DESC}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-8 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 {APP_CONFIG.NAME}. Enterprise Peer-to-Peer Cross-Language Dispute Architecture.</p>
          <div className="flex items-center gap-6 font-medium text-slate-600">
            <Link href="/about" className="hover:text-slate-900 transition-colors">
              About Us & Protocol
            </Link>
            <Link href="/dashboard" className="hover:text-slate-900 transition-colors">
              Dispute Rooms
            </Link>
            <Link href="/signup" className="hover:text-slate-900 transition-colors">
              Sign Up
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
