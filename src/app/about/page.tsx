'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  VolumeX,
  Cpu,
  Database,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function AboutPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // If a logged-in user navigates to /about, redirect them to /dashboard
  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading || user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-6 h-6 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 bg-white">
      {/* Executive Header */}
      <section className="py-16 sm:py-20 border-b border-slate-200 bg-slate-50/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="inline-block px-3 py-1 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-mono font-semibold text-slate-700 uppercase tracking-wider mb-4">
            Protocol Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            About CrossTalk
          </h1>
          <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-3xl">
            CrossTalk is an open dispute resolution protocol engineered for real-time negotiations between speakers with no common language. It combines peer-to-peer session isolation, acoustic barge-in ducking, and low-latency generative inference.
          </p>
        </div>
      </section>

      {/* Core Problem & Approach */}
      <section className="py-14 border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-10">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-3">
              The Problem with Standard Translation
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Standard translation applications assume polite, sequential turn-taking. In commercial disagreements and interpersonal disputes, communication is fundamentally different: participants interrupt, speak with urgency, and negotiate under emotional friction. Standard tools sanitize language into polite corporate phrases and lock speakers into rigid walkie-talkie delays.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-4">
              Our Architectural Approach
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Emotional & Urgent Tone</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Translations preserve visceral pushback, firm boundaries, and colloquial nuances without flattening intent.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Acoustic Barge-In Ducking</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  When either participant begins speaking, the opposing audio stream cuts off in under 30ms to mirror natural human dialogue.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Stance & Concession Tracking</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Each argument is evaluated for heat score (1-10) and automatically detects moments where either party concedes ground.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-1.5">
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                  <span>Independent P2P Sessions</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Both adversaries connect from separate devices via secure 6-character room codes with individual microphone streams.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Infrastructure */}
      <section className="py-14 border-b border-slate-200 bg-[#f8fafc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-6">
            Technical Infrastructure
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                <Cpu className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Google Gemini Flash</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                High-throughput inference model delivering sub-second structured JSON translation and sentiment analysis.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Neon Serverless PostgreSQL</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Cloud-native Postgres database storing room state, speaker presence, and tamper-resistant dispute turn logs.
              </p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-900">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Strict Cryptography</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Salted scrypt hashing with constant-time equality validation ensures credentials and access are strictly secured.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Ready to resolve a cross-language dispute?</h3>
            <p className="text-xs text-slate-500 mt-0.5">Create your free account to generate your first debate room.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 hover:bg-slate-800 text-white transition-colors shadow-xs inline-flex items-center gap-1.5"
            >
              <span>Create Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
