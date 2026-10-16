'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DebateRoom } from '@/types/clashTypes';
import { UI_STRINGS, PRESET_TOPICS, SUPPORTED_LANGUAGES } from '@/constants/appConstants';
import {
  Plus,
  ArrowRight,
  Hash,
  Users,
  Clock,
  Globe,
  Sparkles,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [rooms, setRooms] = useState<DebateRoom[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Create room modal/form state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [topic, setTopic] = useState<string>(PRESET_TOPICS[0]);
  const [isCreating, setIsCreating] = useState(false);

  // Join by code state
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const loadRooms = useCallback(async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/rooms?userId=${user.id}`);
      const data = await res.json();
      if (data.success && data.rooms) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to load user rooms:', err);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [user]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !topic.trim()) return;

    setIsCreating(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topic.trim(),
          createdBy: user.id,
          creatorLang: user.preferred_language,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        router.push(`/room/${data.room.id}`);
      }
    } catch (err) {
      console.error('Create room error:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode.trim()) return;

    setIsJoining(true);
    setJoinError('');
    try {
      const res = await fetch('/api/rooms/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomCode: joinCode.trim().toUpperCase(),
          userId: user.id,
          userLang: user.preferred_language,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        router.push(`/room/${data.room.id}`);
      } else {
        setJoinError(data.error || 'Room not found.');
      }
    } catch {
      setJoinError('Failed to join room.');
    } finally {
      setIsJoining(false);
    }
  };

  const userLangName = user?.preferred_language
    ? SUPPORTED_LANGUAGES[user.preferred_language]?.name || user.preferred_language
    : 'English';

  return (
    <div className="flex-1 bg-[#f8fafc] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {UI_STRINGS.DASHBOARD.WELCOME}, {user?.full_name || 'Participant'}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {UI_STRINGS.DASHBOARD.SUBTITLE}
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-slate-200 shadow-xs text-xs text-slate-700">
            <Globe className="w-4 h-4 text-slate-500" />
            <span>Native Language:</span>
            <strong className="text-slate-900">{userLangName}</strong>
          </div>
        </div>

        {/* Action Cards: Create vs Join */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Room Card */}
          <div className="enterprise-card p-6 bg-white border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white mb-4 shadow-xs">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                {UI_STRINGS.DASHBOARD.CREATE_CARD_TITLE}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                {UI_STRINGS.DASHBOARD.CREATE_CARD_DESC}
              </p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-sm"
            >
              <span>{UI_STRINGS.DASHBOARD.CREATE_CARD_TITLE}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Join Room Card */}
          <div className="enterprise-card p-6 bg-white border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 mb-4 shadow-xs">
                <Hash className="w-5 h-5 text-slate-700" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-1">
                {UI_STRINGS.DASHBOARD.JOIN_CARD_TITLE}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed mb-4">
                {UI_STRINGS.DASHBOARD.JOIN_CARD_DESC}
              </p>
            </div>

            <form onSubmit={handleJoinRoom} className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => {
                    setJoinCode(e.target.value);
                    setJoinError('');
                  }}
                  placeholder="Enter Room Code (e.g. DISPUT)"
                  maxLength={8}
                  className="flex-1 px-3 py-2 text-xs font-mono enterprise-input uppercase placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isJoining || !joinCode.trim()}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isJoining ? 'Joining...' : UI_STRINGS.DASHBOARD.SUBMIT_JOIN_BTN}
                </button>
              </div>
              {joinError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{joinError}</span>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Recent Debate Rooms Table */}
        <div className="enterprise-card bg-white border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              {UI_STRINGS.DASHBOARD.RECENT_DEBATES}
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {rooms.length} Recorded
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {isLoadingRooms ? (
              <div className="p-8 text-center text-xs text-slate-500">
                Loading dispute rooms...
              </div>
            ) : rooms.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                {UI_STRINGS.DASHBOARD.NO_DEBATES}
              </div>
            ) : (
              rooms.map((room) => {
                const isCreator = room.created_by === user?.id;
                const otherParticipant = isCreator ? room.participant_b : room.participant_a;
                const formattedDate = new Date(room.created_at).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div
                    key={room.id}
                    className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors"
                  >
                    <div className="space-y-1.5 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                          {room.room_code}
                        </span>
                        <span
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                            room.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {room.status === 'active' ? 'Active Discussion' : 'Waiting for Opponent'}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {room.topic}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5" />
                          <span>
                            {otherParticipant ? otherParticipant.full_name : 'Waiting for counterpart'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formattedDate}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Link
                        href={`/room/${room.id}`}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors shadow-xs"
                      >
                        <span>Open Room</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Create Debate Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg enterprise-card bg-white p-6 border border-slate-300 shadow-xl rounded-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {UI_STRINGS.DASHBOARD.CREATE_MODAL_TITLE}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the topic or select a preset dispute issue.
            </p>

            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {UI_STRINGS.DASHBOARD.TOPIC_LABEL}
                </label>
                <textarea
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  rows={3}
                  required
                  placeholder={UI_STRINGS.DASHBOARD.TOPIC_PLACEHOLDER}
                  className="w-full p-3 text-xs enterprise-input resize-none"
                />
              </div>

              {/* Topic Presets */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Or select a common scenario:
                </label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {PRESET_TOPICS.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setTopic(preset)}
                      className="w-full text-left p-2 rounded text-xs border border-slate-200 hover:border-slate-400 hover:bg-slate-50 transition-colors text-slate-700 truncate"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !topic.trim()}
                  className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Creating Room...' : UI_STRINGS.DASHBOARD.SUBMIT_CREATE_BTN}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
