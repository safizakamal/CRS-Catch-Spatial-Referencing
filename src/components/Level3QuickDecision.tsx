import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QuickDecisionItem, CursorPosition, GestureState, CRSType } from '../types/game';
import { Zap, Timer, CheckCircle2, AlertCircle, ArrowRight, MousePointer, PauseCircle, Lightbulb, Pin } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface Level3QuickDecisionProps {
  items: QuickDecisionItem[];
  currentIndex: number;
  cursor: CursorPosition;
  gestureState: GestureState;
  onAnswer: (isCorrect: boolean, points: number, explanation: string) => void;
  onNextQuestion: () => void;
  isMouseFallback: boolean;
}

type RoundPhase = 'READ' | 'DECIDING' | 'FEEDBACK';

export const Level3QuickDecision: React.FC<Level3QuickDecisionProps> = ({
  items,
  currentIndex,
  onAnswer,
  onNextQuestion,
}) => {
  const currentItem = items[currentIndex];

  // Show intro only on the very first question when Level 3 starts
  const [showIntro, setShowIntro] = useState<boolean>(currentIndex === 0);

  // Flow phases: READ (untimed) -> DECIDING (5s timer) -> FEEDBACK (untimed debrief)
  const [phase, setPhase] = useState<RoundPhase>('READ');
  const [timeLeft, setTimeLeft] = useState<number>(5.0);
  const [selectedChoice, setSelectedChoice] = useState<CRSType | null>(null);
  const [lastResult, setLastResult] = useState<{
    isCorrect: boolean;
    isTimeout: boolean;
    points: number;
    explanation: string;
    gisTip?: string;
  } | null>(null);

  const timerRef = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // When currentIndex changes, reset state to READ phase
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('READ');
    setTimeLeft(5.0);
    setSelectedChoice(null);
    setLastResult(null);
  }, [currentIndex]);

  // Start Decision Phase & 5-second countdown when student clicks "I'M READY"
  const handleStartDecision = () => {
    sounds.playClick();
    setPhase('DECIDING');
    setTimeLeft(5.0);

    if (timerRef.current) clearInterval(timerRef.current);

    const interval = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0.1) {
          clearInterval(interval);
          handleTimeout();
          return 0;
        }
        // Audible ticks in final 2 seconds
        if (prev <= 2.0 && Math.floor(prev * 10) % 5 === 0) {
          sounds.playTick();
        }
        return Math.max(0, +(prev - 0.1).toFixed(1));
      });
    }, 100);

    timerRef.current = interval;
  };

  // Timeout handler when 5 seconds expire without an answer
  const handleTimeout = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    sounds.playWrong();

    const resultData = {
      isCorrect: false,
      isTimeout: true,
      points: 0,
      explanation: currentItem.explanation,
      gisTip: currentItem.gisTip,
    };

    setLastResult(resultData);
    setPhase('FEEDBACK');
    onAnswer(false, 0, currentItem.explanation);
  };

  // Answer selection handler (Mouse / Touch click)
  const handleSelectAnswer = useCallback((chosen: CRSType) => {
    if (phase !== 'DECIDING' || !currentItem) return;
    if (timerRef.current) clearInterval(timerRef.current);

    setSelectedChoice(chosen);
    const isCorrect = chosen === currentItem.correctAnswer;
    const points = isCorrect ? (timeLeft >= 2.5 ? 15 : 10) : 0;

    if (isCorrect) {
      sounds.playCorrect();
    } else {
      sounds.playWrong();
    }

    const resultData = {
      isCorrect,
      isTimeout: false,
      points,
      explanation: currentItem.explanation,
      gisTip: currentItem.gisTip,
    };

    setLastResult(resultData);
    setPhase('FEEDBACK');
    onAnswer(isCorrect, points, currentItem.explanation);
  }, [phase, currentItem, timeLeft, onAnswer]);

  // Proceed to next question intentionally (NO auto-advance)
  const handleNextChallenge = () => {
    sounds.playClick();
    if (timerRef.current) clearInterval(timerRef.current);
    onNextQuestion();
  };

  if (!currentItem) return null;

  // ==========================================
  // LEVEL 3 INTRODUCTION SCREEN
  // ==========================================
  if (showIntro) {
    return (
      <div className="relative w-full h-[calc(100vh-65px)] min-h-[580px] flex items-center justify-center p-4 md:p-6 overflow-y-auto select-none">
        {/* Background Graticules */}
        <div className="absolute inset-0 bg-gis-crosshair opacity-30 pointer-events-none" />

        <div className="relative z-10 max-w-2xl w-full bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>LEVEL 3 · DECIDE</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ⚡ LEVEL 3 — RAPID DECISION
            </h2>
            <p className="text-sm font-medium text-slate-300 mt-1">
              How fast can you make the right GIS choice?
            </p>
            <div className="mt-2 inline-block px-3 py-1 rounded-lg bg-sky-950/60 border border-sky-500/30 text-sky-300 text-xs font-mono">
              Learning Question: &ldquo;Can I apply my spatial-referencing knowledge and make the appropriate GIS decision quickly?&rdquo;
            </div>
          </div>

          {/* 3 Clear Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl mb-1">👀</div>
              <h4 className="text-xs font-mono font-bold text-sky-400 uppercase tracking-wide">
                1 — READ
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Take your time to understand the situation. No countdown while reading.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl mb-1">🎯</div>
              <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wide">
                2 — READY
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                Click &ldquo;I&apos;M READY&rdquo; when you understand the scenario.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
              <div className="text-2xl mb-1">🖱️</div>
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wide">
                3 — DECIDE
              </h4>
              <p className="text-xs text-slate-300 mt-1">
                You have 5 seconds to click your answer. Fast choices earn +15 speed bonus!
              </p>
            </div>
          </div>

          {/* Hand Control Paused Notification Card */}
          <div className="p-4 rounded-2xl bg-indigo-950/60 border-2 border-indigo-500/40 text-center mb-6">
            <div className="flex items-center justify-center gap-2 text-indigo-300 font-mono font-bold text-sm mb-1">
              <PauseCircle className="w-4 h-4 text-indigo-400" />
              <span>🖐 HAND CONTROL PAUSED</span>
            </div>
            <p className="text-xs text-slate-200">
              Use your <span className="font-bold text-white">mouse or touchscreen</span> for this round.
            </p>
            <p className="text-[11px] text-indigo-300/90 mt-0.5">
              This challenge tests your <span className="text-emerald-400 font-bold">GIS decision speed</span> — not your hand gesture speed.
            </p>
          </div>

          {/* Start Round Button */}
          <button
            onClick={() => {
              sounds.playClick();
              setShowIntro(false);
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-emerald-500/20 transition-transform scale-100 hover:scale-102 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>START RAPID ROUND</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN ROUND GAMEPLAY
  // ==========================================
  return (
    <div className="relative w-full h-[calc(100vh-65px)] min-h-[580px] flex flex-col justify-between p-4 md:p-6 overflow-y-auto select-none">
      
      {/* Background Graticules */}
      <div className="absolute inset-0 bg-gis-crosshair opacity-30 pointer-events-none" />

      {/* Top Status & Mode Ribbon */}
      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-wrap items-center justify-between gap-2 mb-3">
        {/* Left: Level & Progress */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
            <Zap className="w-3.5 h-3.5" />
            <span>LEVEL 3 · RAPID DECISION</span>
          </span>
          <span className="text-xs font-mono text-slate-400">
            Challenge #{currentIndex + 1} of {items.length}
          </span>
        </div>

        {/* Right: Hand Control Paused Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/70 border border-indigo-500/40 text-[11px] font-mono text-indigo-300">
            <PauseCircle className="w-3 h-3 text-indigo-400" />
            <span>🖐 Hand Control: Paused for Rapid Round</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-[11px] font-mono text-slate-300">
            <MousePointer className="w-3 h-3 text-sky-400" />
            <span>Mouse & Touch Active</span>
          </div>
        </div>
      </div>

      {/* Center Stage Container */}
      <div className="relative z-10 max-w-3xl mx-auto w-full my-auto flex flex-col gap-4">

        {/* TARGET SCENARIO CARD */}
        <div className="p-6 md:p-7 rounded-3xl bg-slate-900/95 border-2 border-slate-700/80 shadow-2xl backdrop-blur-xl relative overflow-hidden text-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              GIS SCENARIO · #{currentIndex + 1}
            </span>
            <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider">
              {phase === 'READ' ? '👀 READ PHASE' : phase === 'DECIDING' ? '⏱️ DECISION PHASE' : '💡 REVIEW PHASE'}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-2">
            {currentItem.text}
          </h3>

          {currentItem.subtext && (
            <p className="text-xs font-mono text-sky-300 bg-sky-950/60 inline-block px-3.5 py-1.5 rounded-full border border-sky-500/30">
              {currentItem.subtext}
            </p>
          )}

          {/* Phase 1: READ Guidance */}
          {phase === 'READ' && (
            <div className="mt-5 pt-4 border-t border-slate-800 text-center">
              <p className="text-xs text-slate-300 leading-relaxed mb-4 max-w-lg mx-auto">
                👀 Take your time to understand the situation. The 5-second countdown will <span className="text-amber-400 font-bold">NOT</span> start until you click below.
              </p>

              <button
                onClick={handleStartDecision}
                className="py-3 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm tracking-wide shadow-xl shadow-amber-400/20 transition-transform scale-100 hover:scale-103 cursor-pointer inline-flex items-center gap-2"
              >
                <span>I&apos;M READY</span>
                <span className="text-base">🎯</span>
              </button>
            </div>
          )}
        </div>

        {/* Phase 2: DECIDING (5-Second Timer & Revealed Choices) */}
        {phase === 'DECIDING' && (
          <div className="flex flex-col gap-4 animate-in fade-in duration-150">
            
            {/* 5-Second Timer Bar */}
            <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
              <div className="flex items-center justify-between text-xs font-mono font-bold mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Timer className={`w-4 h-4 ${timeLeft <= 2.0 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
                  <span>5-SECOND DECISION COUNTDOWN:</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    {timeLeft >= 2.5 ? '⚡ Speed Bonus Active (+15 pts)' : 'Standard (+10 pts)'}
                  </span>
                  <span className={`tabular-nums text-base font-black ${
                    timeLeft <= 1.0
                      ? 'text-rose-400 animate-pulse'
                      : timeLeft <= 2.5
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}>
                    {timeLeft.toFixed(1)}s
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all duration-100 ease-linear rounded-full ${
                    timeLeft > 2.5
                      ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.7)]'
                      : timeLeft > 1.0
                      ? 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.7)]'
                      : 'bg-rose-500 shadow-[0_0_15px_rgba(239,68,68,0.8)]'
                  }`}
                  style={{ width: `${(timeLeft / 5.0) * 100}%` }}
                />
              </div>
            </div>

            {/* Answer Options Grid (GCS vs PCS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* GCS Card */}
              <button
                onClick={() => handleSelectAnswer('GCS')}
                className="rounded-2xl border-2 border-sky-500/40 bg-slate-900/90 hover:bg-sky-950/60 hover:border-sky-400 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-102 hover:shadow-[0_0_30px_rgba(56,189,248,0.3)] group"
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">🌐</span>
                <h4 className="text-2xl font-black text-sky-300">GCS</h4>
                <span className="text-xs text-sky-400 font-mono font-bold mt-0.5">Geographic Coordinate System</span>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">Angular Degrees (Lat / Lon) · 3D Ellipsoid</p>
                <div className="mt-3 px-4 py-1.5 rounded-xl bg-sky-500/15 group-hover:bg-sky-500 group-hover:text-slate-950 text-sky-300 text-xs font-mono font-bold border border-sky-500/30 transition-colors">
                  CLICK TO SELECT GCS 🖱️
                </div>
              </button>

              {/* PCS Card */}
              <button
                onClick={() => handleSelectAnswer('PCS')}
                className="rounded-2xl border-2 border-emerald-500/40 bg-slate-900/90 hover:bg-emerald-950/60 hover:border-emerald-400 p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all hover:scale-102 hover:shadow-[0_0_30px_rgba(52,211,153,0.3)] group"
              >
                <span className="text-4xl mb-2 group-hover:scale-110 transition-transform">📐</span>
                <h4 className="text-2xl font-black text-emerald-300">PCS</h4>
                <span className="text-xs text-emerald-400 font-mono font-bold mt-0.5">Projected Coordinate System</span>
                <p className="text-[11px] text-slate-400 mt-1 font-mono">Planar Metres (Easting / Northing) · 2D Plane</p>
                <div className="mt-3 px-4 py-1.5 rounded-xl bg-emerald-500/15 group-hover:bg-emerald-500 group-hover:text-slate-950 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30 transition-colors">
                  CLICK TO SELECT PCS 🖱️
                </div>
              </button>

            </div>

          </div>
        )}

        {/* Phase 3: FEEDBACK (No auto-advance, strict color rules) */}
        {phase === 'FEEDBACK' && lastResult && (
          <div className="flex flex-col gap-3 animate-in fade-in duration-150">
            
            {/* 1. Small Result Badge (Green for correct, Red for incorrect/timeout) */}
            <div className={`p-4 rounded-2xl border-2 flex items-center justify-between gap-3 ${
              lastResult.isCorrect
                ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.2)]'
                : 'bg-rose-950/80 border-rose-500/60 text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.2)]'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  lastResult.isCorrect ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}>
                  {lastResult.isCorrect ? <CheckCircle2 className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                </div>
                <div>
                  <h4 className="text-sm font-mono font-black">
                    {lastResult.isCorrect
                      ? `✓ CORRECT! (+${lastResult.points} PTS${lastResult.points === 15 ? ' · SPEED BONUS!' : ''})`
                      : lastResult.isTimeout
                      ? '✗ TIME EXPIRED! (0 PTS)'
                      : `✗ NOT QUITE (0 PTS) — You chose ${selectedChoice}`}
                  </h4>
                  <p className="text-xs text-slate-200 mt-0.5">
                    Correct System:{' '}
                    <span className="font-bold underline text-white">
                      {currentItem.correctAnswer === 'GCS' ? '🌐 GCS (Geographic Coordinate System)' : '📐 PCS (Projected Coordinate System)'}
                    </span>
                  </p>
                </div>
              </div>

              {/* Next Challenge Button */}
              <button
                onClick={handleNextChallenge}
                className="py-2.5 px-5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs font-mono uppercase tracking-wide flex items-center gap-1.5 shrink-0 transition-transform scale-100 hover:scale-103 shadow-lg cursor-pointer"
              >
                <span>{currentIndex + 1 < items.length ? 'NEXT CHALLENGE' : 'VIEW FINAL RESULTS'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Blue/Navy Learning Panel: WHY? */}
            <div className="p-4 rounded-2xl bg-sky-950/60 border border-sky-500/30 text-left">
              <span className="text-[11px] font-mono text-sky-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-sky-400" />
                <span>💡 WHY?</span>
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {lastResult.explanation}
              </p>
            </div>

            {/* 3. Orange Learning Panel: REMEMBER / GIS TIP */}
            <div className="p-4 rounded-2xl bg-amber-950/50 border border-amber-500/30 text-left">
              <span className="text-[11px] font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1.5">
                <Pin className="w-3.5 h-3.5 text-amber-400" />
                <span>📌 REMEMBER / GIS TIP</span>
              </span>
              <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                {lastResult.gisTip || (currentItem.correctAnswer === 'GCS'
                  ? 'Geographic Coordinate Systems (GCS) use angular units (degrees) to locate features across the 3D spherical Earth.'
                  : 'Projected Coordinate Systems (PCS) translate curved Earth coordinates onto a flat 2D plane with linear metric units (metres) for accurate length and area calculations.')}
              </p>
            </div>

          </div>
        )}

      </div>

      {/* Footer Navigation Note */}
      <div className="relative z-10 max-w-3xl mx-auto text-center mt-3 text-[11px] font-mono text-slate-500">
        Level 3 · Test your spatial referencing decisions under timed pressure · No auto-advance
      </div>

    </div>
  );
};
