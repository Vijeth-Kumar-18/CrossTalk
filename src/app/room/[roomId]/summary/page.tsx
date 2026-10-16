'use client';

import React, { useState, useEffect, useCallback, use } from 'react';
import Link from 'next/link';
import { DebateRoom, DebateTurn } from '@/types/clashTypes';
import { UI_STRINGS } from '@/constants/appConstants';
import {
  ArrowLeft,
  Copy,
  Check,
  Flame,
  ShieldAlert,
  Award,
  Layers,
  Clock,
  CornerDownRight,
  Download,
  Share2,
} from 'lucide-react';

export default function DisputeSummaryPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;

  const [room, setRoom] = useState<DebateRoom | null>(null);
  const [turns, setTurns] = useState<DebateTurn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [roomRes, turnsRes] = await Promise.all([
        fetch(`/api/rooms/${roomId}`),
        fetch(`/api/rooms/${roomId}/turns`),
      ]);
      const roomData = await roomRes.json();
      const turnsData = await turnsRes.json();

      if (roomData.success) setRoom(roomData.room);
      if (turnsData.success) setTurns(turnsData.turns || []);
    } catch (err) {
      console.error('Summary load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalInterruptions = turns.filter((t) => t.did_interrupt).length;
  const totalConcessions = turns.filter((t) => t.is_concession).length;
  const peakHeat = turns.length
    ? Math.max(...turns.map((t) => t.heat_score))
    : 0;

  const handleCopyTranscript = () => {
    const formatted = turns
      .map((t) => {
        const time = new Date(t.created_at).toLocaleTimeString();
        const interruptFlag = t.did_interrupt ? ' [INTERRUPTED]' : '';
        const concessionFlag = t.is_concession ? ' [CONCESSION]' : '';
        return `[${time}] ${t.speaker_name}${interruptFlag}${concessionFlag}:\nOriginal: ${t.original_text}\nTranslation: ${t.translated_text}\nHeat: ${t.heat_score}/10\n`;
      })
      .join('\n---\n\n');

    const fullExport = `CROSSTALK DISPUTE RESOLUTION AUDIT\nRoom: ${room?.topic}\nRoom Code: ${room?.room_code}\nDate: ${new Date().toLocaleDateString()}\nTotal Exchanges: ${turns.length}\nTotal Interruptions: ${totalInterruptions}\nConcessions Detected: ${totalConcessions}\n\n========================================\n\n${formatted}`;

    navigator.clipboard.writeText(fullExport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Navigation */}
        <div className="flex items-center justify-between">
          <Link
            href={`/room/${roomId}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{UI_STRINGS.SUMMARY.BACK_BTN}</span>
          </Link>

          <button
            onClick={handleCopyTranscript}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-sm cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? UI_STRINGS.SUMMARY.COPIED : UI_STRINGS.SUMMARY.COPY_TRANSCRIPT}</span>
          </button>
        </div>

        {/* Title Header */}
        <div className="enterprise-card bg-white p-6 sm:p-8 border border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {room?.room_code}
            </span>
            <span className="text-xs text-slate-500 font-medium">Dispute Audit Log</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-2">
            {room?.topic || 'Dispute Topic'}
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            {UI_STRINGS.SUMMARY.SUBTITLE}
          </p>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {UI_STRINGS.SUMMARY.TOTAL_TURNS}
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5">
                {turns.length}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {UI_STRINGS.SUMMARY.INTERRUPTIONS}
              </span>
              <div className="text-xl font-extrabold text-amber-700 mt-0.5 flex items-center gap-1">
                <span>{totalInterruptions}</span>
                <ShieldAlert className="w-4 h-4 text-amber-500" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                Peak Heat Score
              </span>
              <div className="text-xl font-extrabold text-slate-900 mt-0.5 flex items-center gap-1">
                <span>{peakHeat}/10</span>
                <Flame className="w-4 h-4 text-slate-500" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-400">
                {UI_STRINGS.SUMMARY.CONCESSIONS}
              </span>
              <div className="text-xl font-extrabold text-emerald-700 mt-0.5 flex items-center gap-1">
                <span>{totalConcessions}</span>
                <Award className="w-4 h-4 text-emerald-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Timeline Feed */}
        <div className="enterprise-card bg-white p-6 sm:p-8 border border-slate-200 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 tracking-tight">
            Chronological Argument Exchanges
          </h2>

          <div className="space-y-4">
            {turns.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                No exchanges recorded in this session.
              </p>
            ) : (
              turns.map((turn, index) => {
                const formattedTime = new Date(turn.created_at).toLocaleTimeString();

                return (
                  <div
                    key={turn.id}
                    className={`p-4 rounded-xl border transition-all ${
                      turn.is_concession
                        ? 'border-emerald-300 bg-emerald-50/40'
                        : turn.did_interrupt
                        ? 'border-amber-300 bg-amber-50/40'
                        : 'border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          #{index + 1}
                        </span>
                        <strong className="text-slate-900">{turn.speaker_name}</strong>

                        {turn.did_interrupt && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            Interrupted Opponent
                          </span>
                        )}

                        {turn.is_concession && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            Concession Detected
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                        <span>Heat: {turn.heat_score}/10</span>
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <p className="text-slate-600">
                        {turn.original_text}
                      </p>
                      <div className="flex items-start gap-1.5 text-slate-900 font-medium pl-3 border-l-2 border-slate-300 pt-0.5">
                        <CornerDownRight className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{turn.translated_text}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
