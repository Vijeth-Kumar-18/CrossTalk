'use client';

import React, { useState, useEffect, useRef, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { DebateRoom, DebateTurn, StanceType } from '@/types/clashTypes';
import {
  APP_CONFIG,
  UI_STRINGS,
  AUDIO_CONFIG,
  SUPPORTED_LANGUAGES,
} from '@/constants/appConstants';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  Copy,
  Check,
  ArrowLeft,
  FileText,
  ShieldAlert,
  Flame,
  Globe,
  Radio,
  Clock,
  Sparkles,
  CornerDownRight,
  User as UserIcon,
} from 'lucide-react';

export default function DisputeRoomPage({
  params,
}: {
  params: Promise<{ roomId: string }>;
}) {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const resolvedParams = use(params);
  const roomId = resolvedParams.roomId;

  // Protect route
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?redirect=${encodeURIComponent(roomId)}`);
    }
  }, [user, authLoading, router, roomId]);

  const [room, setRoom] = useState<DebateRoom | null>(null);
  const [turns, setTurns] = useState<DebateTurn[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Local speech & text states
  const [isListening, setIsListening] = useState(false);
  const [interimSpeech, setInterimSpeech] = useState('');
  const [typedMessage, setTypedMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Opponent & Audio Output States
  const [isOpponentSpeaking, setIsOpponentSpeaking] = useState(false);
  const [opponentLatestTranslated, setOpponentLatestTranslated] = useState('');
  const [opponentStance, setOpponentStance] = useState<StanceType>('Standing Firm');
  const [audioMuted, setAudioMuted] = useState(false);

  // Barge-In & Interruption Notification
  const [bargeInActive, setBargeInActive] = useState(false);

  // UI helpers
  const [copiedCode, setCopiedCode] = useState(false);

  // Refs
  const recognitionRef = useRef<any>(null);
  const playedTurnsSetRef = useRef<Set<string>>(new Set());

  // Determine user role and languages
  const isParticipantA = room?.participant_a_id === user?.id;
  const isParticipantB = room?.participant_b_id === user?.id;

  const yourLang = isParticipantA
    ? room?.participant_a_lang || user?.preferred_language || 'en-US'
    : room?.participant_b_lang || user?.preferred_language || 'de-DE';

  const opponentLang = isParticipantA
    ? room?.participant_b_lang || 'de-DE'
    : room?.participant_a_lang || 'en-US';

  const yourName = user?.full_name || 'You';
  const opponentName = isParticipantA
    ? room?.participant_b?.full_name || 'Opponent'
    : room?.participant_a?.full_name || 'Opponent';

  const isOpponentConnected = Boolean(room?.participant_b_id);

  /**
   * Barge-In Engine:
   * When local user begins speaking or sending input while opponent's translation audio is playing,
   * cancel speech synthesis immediately!
   */
  const triggerBargeInCutoff = useCallback((): boolean => {
    let causedCutoff = false;
    if (
      typeof window !== 'undefined' &&
      window.speechSynthesis &&
      window.speechSynthesis.speaking
    ) {
      window.speechSynthesis.cancel();
      setIsOpponentSpeaking(false);
      causedCutoff = true;
      setBargeInActive(true);
      setTimeout(() => setBargeInActive(false), 3000);
    }
    return causedCutoff;
  }, []);

  /**
   * Play incoming translation in local user's native language
   */
  const playIncomingSpeech = useCallback(
    (text: string, langCode: string) => {
      if (typeof window === 'undefined' || !window.speechSynthesis || audioMuted) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = AUDIO_CONFIG.SPEECH_RATE;
      utterance.pitch = AUDIO_CONFIG.SPEECH_PITCH;

      setIsOpponentSpeaking(true);

      utterance.onend = () => setIsOpponentSpeaking(false);
      utterance.onerror = () => setIsOpponentSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [audioMuted]
  );

  /**
   * Fetch room data
   */
  const fetchRoomData = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}`);
      const data = await res.json();
      if (data.success && data.room) {
        setRoom(data.room);

        // If user is not yet in room and room needs participant B, auto-join
        if (
          user &&
          data.room.participant_a_id !== user.id &&
          !data.room.participant_b_id
        ) {
          await fetch('/api/rooms/join', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              roomCode: data.room.room_code,
              userId: user.id,
              userLang: user.preferred_language || 'de-DE',
            }),
          });
        }
      }
    } catch (err) {
      console.error('Fetch room error:', err);
    }
  }, [roomId, user]);

  /**
   * Fetch room turns and trigger speech synthesis for newly arrived opponent turns
   */
  const fetchRoomTurns = useCallback(async () => {
    try {
      const res = await fetch(`/api/rooms/${roomId}/turns`);
      const data = await res.json();
      if (data.success && Array.isArray(data.turns)) {
        setTurns(data.turns);

        // Check for new opponent turns to speak out loud
        for (const turn of data.turns) {
          if (!playedTurnsSetRef.current.has(turn.id)) {
            playedTurnsSetRef.current.add(turn.id);

            // If turn is from opponent and this is not the initial load
            if (user && turn.speaker_id !== user.id && !isLoading) {
              setOpponentLatestTranslated(turn.translated_text);
              if (turn.is_concession) {
                setOpponentStance('Conceding');
              } else if (turn.heat_score >= 7) {
                setOpponentStance('Pushing Back');
              } else {
                setOpponentStance('Standing Firm');
              }

              // Speak opponent's translation in YOUR language
              playIncomingSpeech(turn.translated_text, yourLang);
            }
          }
        }
      }
    } catch (err) {
      console.error('Fetch turns error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [roomId, user, isLoading, yourLang, playIncomingSpeech]);

  // Initial load and periodic polling (every 1.5s for real-time synchronization)
  useEffect(() => {
    fetchRoomData();
    fetchRoomTurns();

    const interval = setInterval(() => {
      fetchRoomData();
      fetchRoomTurns();
    }, 1500);

    return () => clearInterval(interval);
  }, [fetchRoomData, fetchRoomTurns]);

  /**
   * Dispatch turn to backend
   */
  const dispatchTurn = async (rawText: string, didInterrupt: boolean) => {
    if (!rawText.trim() || !user || !room) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          speakerId: user.id,
          text: rawText.trim(),
          fromLang: yourLang,
          toLang: opponentLang,
          didInterrupt,
        }),
      });
      const data = await res.json();
      if (data.success && data.data?.turn) {
        setTurns((prev) => [...prev, data.data.turn]);
        playedTurnsSetRef.current.add(data.data.turn.id);
      }
    } catch (err) {
      console.error('Dispatch turn error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Speech Recognition handlers
   */
  const startRecording = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. You can type arguments below.');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = yourLang;

    let bargeInTriggeredForThisUtterance = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      if (!bargeInTriggeredForThisUtterance) {
        const caused = triggerBargeInCutoff();
        if (caused) bargeInTriggeredForThisUtterance = true;
      }

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += text;
        } else {
          interim += text;
        }
      }

      setInterimSpeech(interim || final);

      if (final.trim()) {
        const didInterrupt = bargeInTriggeredForThisUtterance;
        bargeInTriggeredForThisUtterance = false;
        dispatchTurn(final.trim(), didInterrupt);
        setInterimSpeech('');
      }
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error(e);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleManualSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typedMessage.trim()) return;

    const caused = triggerBargeInCutoff();
    dispatchTurn(typedMessage.trim(), caused);
    setTypedMessage('');
  };

  const handleCopyCode = () => {
    if (room?.room_code) {
      navigator.clipboard.writeText(room.room_code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#f8fafc]">
      {/* Top Dispute Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Back & Topic */}
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase font-semibold text-slate-400">
                  Room
                </span>
                <span className="text-sm font-bold text-slate-900">
                  {room?.topic || 'Loading Dispute Room...'}
                </span>
              </div>
            </div>
          </div>

          {/* Room Code & Actions */}
          <div className="flex items-center gap-3">
            {/* Room Code Copy Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-mono">
              <span className="text-slate-500">{UI_STRINGS.ROOM.ROOM_CODE_LABEL}</span>
              <strong className="text-slate-900 font-bold">{room?.room_code}</strong>
              <button
                onClick={handleCopyCode}
                className="ml-1 text-slate-500 hover:text-slate-900 cursor-pointer"
                title="Copy Room Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Connection Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                isOpponentConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOpponentConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span>
                {isOpponentConnected
                  ? UI_STRINGS.ROOM.CONNECTED_STATUS
                  : UI_STRINGS.ROOM.WAITING_STATUS}
              </span>
            </div>

            {/* Resolution Summary Button */}
            <Link
              href={`/room/${roomId}/summary`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-slate-500" />
              <span>{UI_STRINGS.ROOM.SUMMARY_BTN}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Interruption / Barge-In Notification Banner */}
      {bargeInActive && (
        <div className="bg-slate-900 text-white px-4 py-2 text-center text-xs font-medium tracking-wide flex items-center justify-center gap-2 animate-interrupt-badge">
          <ShieldAlert className="w-4 h-4" />
          <span>{UI_STRINGS.ROOM.INTERRUPT_ALERT}</span>
        </div>
      )}

      {/* Main Workspace: Split-Screen View (You vs Opponent) */}
      <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 flex-1 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
          {/* ========================================================= */}
          {/* LEFT: YOU (Local Debater) */}
          {/* ========================================================= */}
          <div className="enterprise-card bg-white p-6 border border-slate-200 flex flex-col justify-between">
            {/* Header */}
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  {UI_STRINGS.ROOM.YOU_HEADER}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {yourName}
                </h3>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{SUPPORTED_LANGUAGES[yourLang]?.name || yourLang}</span>
              </div>
            </div>

            {/* Speaking Waveform & Live Interim Speech Box */}
            <div className="py-6 flex-1 flex flex-col justify-center">
              {isListening ? (
                <div className="space-y-4">
                  {/* Waveform Bars */}
                  <div className="flex items-center justify-center gap-1.5 h-8">
                    <div className="w-1 bg-slate-900 rounded-full animate-wave-1" />
                    <div className="w-1 bg-slate-900 rounded-full animate-wave-2" />
                    <div className="w-1 bg-slate-900 rounded-full animate-wave-3" />
                    <div className="w-1 bg-slate-900 rounded-full animate-wave-4" />
                    <div className="w-1 bg-slate-900 rounded-full animate-wave-2" />
                    <div className="w-1 bg-slate-900 rounded-full animate-wave-1" />
                  </div>
                  <p className="text-center text-xs font-semibold text-slate-900 tracking-wide animate-pulse">
                    {UI_STRINGS.ROOM.MIC_ACTIVE}
                  </p>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 min-h-[70px] max-h-32 overflow-y-auto leading-relaxed">
                    {interimSpeech || 'Listening for your voice...'}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 space-y-2">
                  <div className="w-12 h-12 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
                    <Mic className="w-5 h-5" />
                  </div>
                  <p className="text-xs">
                    Press the microphone button or type below to speak in your native language.
                  </p>
                </div>
              )}
            </div>

            {/* Controls Bar */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              {/* Type Message Input Form */}
              <form onSubmit={handleManualSend} className="flex items-center gap-2">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  placeholder={UI_STRINGS.ROOM.INPUT_PLACEHOLDER}
                  className="flex-1 px-3 py-2 text-xs enterprise-input placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !typedMessage.trim()}
                  className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors disabled:opacity-40 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isListening ? stopRecording : startRecording}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shadow-sm ${
                    isListening
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Stop Microphone</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>{UI_STRINGS.ROOM.MIC_START}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: OPPONENT (Real-Time Translation & Stance) */}
          {/* ========================================================= */}
          <div className="enterprise-card bg-white p-6 border border-slate-200 flex flex-col justify-between">
            {/* Header */}
            <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400">
                  {UI_STRINGS.ROOM.OPPONENT_HEADER}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {opponentName}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  <span>{SUPPORTED_LANGUAGES[opponentLang]?.name || opponentLang}</span>
                </div>

                <button
                  onClick={() => setAudioMuted(!audioMuted)}
                  title="Toggle Opponent Speech Translation Audio"
                  className="p-1 rounded text-slate-400 hover:text-slate-800 transition-colors"
                >
                  {audioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Opponent Real-Time Stream Box */}
            <div className="py-6 flex-1 flex flex-col justify-center space-y-4">
              {/* Opponent Speaking Status Pill */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOpponentSpeaking ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'
                    }`}
                  />
                  <span className="text-xs font-medium text-slate-600">
                    {isOpponentSpeaking ? 'Opponent Speaking (Playing audio)...' : 'Listening to room'}
                  </span>
                </div>

                {/* Stance Indicator Badge */}
                <div
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    opponentStance === 'Conceding'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                      : opponentStance === 'Pushing Back'
                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                      : 'bg-slate-100 text-slate-800 border-slate-200'
                  }`}
                >
                  {opponentStance}
                </div>
              </div>

              {/* Translated Transcript Box */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 min-h-[140px] flex flex-col justify-center">
                {opponentLatestTranslated ? (
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                      Translated to {SUPPORTED_LANGUAGES[yourLang]?.name}:
                    </span>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">
                      &ldquo;{opponentLatestTranslated}&rdquo;
                    </p>
                  </div>
                ) : (
                  <div className="text-center text-xs text-slate-400 py-4">
                    Awaiting opponent speech. As soon as they speak, you will hear their words translated into your native language.
                  </div>
                )}
              </div>
            </div>

            {/* Opponent Connection Footer */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isOpponentConnected ? 'bg-emerald-500' : 'bg-amber-400'}`} />
                <span>{isOpponentConnected ? 'Encrypted Speech Bridge Active' : 'Waiting for Counterpart to Connect'}</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                P2P Session
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM: LIVE CHRONOLOGICAL DISPUTE TRANSCRIPT */}
        {/* ========================================================= */}
        <div className="enterprise-card bg-white p-6 border border-slate-200">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {UI_STRINGS.ROOM.TRANSCRIPT_TITLE}
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {turns.length} Exchanges Logged
            </span>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {turns.length === 0 ? (
              <p className="text-center py-8 text-xs text-slate-400">
                No exchanges recorded yet. Speak into the microphone or type below to begin the debate.
              </p>
            ) : (
              turns.map((turn) => {
                const isYou = turn.speaker_id === user?.id;
                const formattedTime = new Date(turn.created_at).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });

                return (
                  <div
                    key={turn.id}
                    className={`p-3.5 rounded-xl border transition-all ${
                      turn.did_interrupt
                        ? 'border-amber-300 bg-amber-50/40'
                        : isYou
                        ? 'border-slate-200 bg-slate-50/60'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">
                          {isYou ? 'You' : turn.speaker_name || opponentName}
                        </span>

                        {turn.did_interrupt && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
                            Interrupted
                          </span>
                        )}

                        {turn.is_concession && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                            {UI_STRINGS.ROOM.CONCESSION_BADGE}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-slate-400 text-[11px] font-mono">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3 h-3 text-amber-500" />
                          <span>Heat: {turn.heat_score}/10</span>
                        </span>
                        <span>{formattedTime}</span>
                      </div>
                    </div>

                    {/* Original & Translated Texts */}
                    <div className="space-y-1 text-xs">
                      <p className="text-slate-600">
                        {turn.original_text}
                      </p>
                      <div className="flex items-start gap-1.5 text-slate-900 font-medium pl-2.5 border-l-2 border-slate-300 pt-0.5">
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
