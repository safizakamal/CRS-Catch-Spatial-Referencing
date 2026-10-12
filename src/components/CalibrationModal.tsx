import React, { useEffect, useState, useRef } from 'react';
import { TrackingStatus, CursorPosition, GestureState } from '../types/game';
import { Camera, MousePointer, CheckCircle2, ArrowRight } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface CalibrationModalProps {
  trackingStatus: TrackingStatus;
  calibration: {
    hasSeenHand: boolean;
    hasPointed: boolean;
    hasPinched: boolean;
  };
  isMouseFallback: boolean;
  onComplete: () => void;
  onSwitchToMouse: () => void;
  onStartCamera: () => void;
  cameraError: string | null;
  cursor?: CursorPosition;
  gestureState?: GestureState;
}

export const CalibrationModal: React.FC<CalibrationModalProps> = ({
  trackingStatus,
  calibration,
  isMouseFallback,
  onComplete,
  onSwitchToMouse,
  onStartCamera,
  cameraError,
  cursor,
  gestureState,
}) => {
  const [calibrated, setCalibrated] = useState(false);
  const [practiceHoldProgress, setPracticeHoldProgress] = useState<number>(0);
  const [practiceCompleted, setPracticeCompleted] = useState<boolean>(false);
  const [isPracticeHovered, setIsPracticeHovered] = useState<boolean>(false);

  const practiceTargetRef = useRef<HTMLDivElement | null>(null);
  const practiceHoldStartRef = useRef<number | null>(null);
  const mouseHoldTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (isMouseFallback) {
      setCalibrated(true);
    } else if (calibration.hasSeenHand && calibration.hasPointed && calibration.hasPinched) {
      setCalibrated(true);
      sounds.playCorrect();
    }
  }, [calibration, isMouseFallback]);

  // Hand tracking pinch-and-hold test for practice target
  useEffect(() => {
    if (practiceCompleted || !cursor) return;

    const isPinching = cursor.isPinching || gestureState === 'GRABBED';
    let isInside = false;

    if (practiceTargetRef.current) {
      const rect = practiceTargetRef.current.getBoundingClientRect();
      const pad = 10;
      isInside = (
        cursor.x >= rect.left - pad &&
        cursor.x <= rect.right + pad &&
        cursor.y >= rect.top - pad &&
        cursor.y <= rect.bottom + pad
      );
    }

    setIsPracticeHovered(isInside);

    if (isInside && isPinching) {
      const now = performance.now();
      if (!practiceHoldStartRef.current) {
        practiceHoldStartRef.current = now;
      }
      const elapsed = now - practiceHoldStartRef.current;
      const progress = Math.min(1, elapsed / 700);
      setPracticeHoldProgress(progress);

      if (progress >= 1) {
        setPracticeCompleted(true);
        sounds.playCorrect();
      }
    } else {
      practiceHoldStartRef.current = null;
      setPracticeHoldProgress(0);
    }
  }, [cursor, gestureState, practiceCompleted]);

  // Mouse / Touch hold handler
  const handleMouseDownPractice = () => {
    if (practiceCompleted) return;
    const start = performance.now();
    const interval = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const progress = Math.min(1, elapsed / 700);
      setPracticeHoldProgress(progress);
      if (progress >= 1) {
        clearInterval(interval);
        setPracticeCompleted(true);
        sounds.playCorrect();
      }
    }, 30);
    mouseHoldTimerRef.current = interval;
  };

  const handleMouseUpPractice = () => {
    if (mouseHoldTimerRef.current) {
      clearInterval(mouseHoldTimerRef.current);
      mouseHoldTimerRef.current = null;
    }
    if (!practiceCompleted) {
      setPracticeHoldProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-7 relative overflow-hidden">
        
        {/* Subtle decorative grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

        {/* Top Header */}
        <div className="text-center mb-5 relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono font-medium mb-2">
            <span>GESTURE SENSOR CALIBRATION</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Let’s Calibrate Your Hand 🖐️
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Test your webcam tracking to enable natural fingertip sorting, pinching, and holding.
          </p>
        </div>

        {/* Compact Gesture Reminder Grid */}
        <div className="mb-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-2">
            GESTURE REFERENCE
          </div>
          <div className="grid grid-cols-4 gap-2 text-center text-xs">
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-base block">🖐</span>
              <span className="font-bold text-slate-200 block text-[11px]">MOVE</span>
              <span className="text-[10px] text-slate-400">Move cursor</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-base block">🤏</span>
              <span className="font-bold text-slate-200 block text-[11px]">PINCH</span>
              <span className="text-[10px] text-slate-400">Grab</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-base block">🖐</span>
              <span className="font-bold text-slate-200 block text-[11px]">RELEASE</span>
              <span className="text-[10px] text-slate-400">Drop</span>
            </div>
            <div className="p-1.5 rounded-lg bg-slate-900 border border-sky-500/30 bg-sky-950/20">
              <span className="text-base block">👌</span>
              <span className="font-bold text-sky-300 block text-[11px]">PINCH & HOLD</span>
              <span className="text-[10px] text-sky-400/80">Continue</span>
            </div>
          </div>
        </div>

        {/* Optional Practice Target: PINCH & HOLD HERE */}
        <div className="mb-5">
          <div
            ref={practiceTargetRef}
            onMouseDown={handleMouseDownPractice}
            onMouseUp={handleMouseUpPractice}
            onTouchStart={handleMouseDownPractice}
            onTouchEnd={handleMouseUpPractice}
            className={`p-3 rounded-xl border-2 transition-all flex items-center justify-between cursor-pointer select-none ${
              practiceCompleted
                ? 'bg-emerald-950/50 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(52,211,153,0.2)]'
                : isPracticeHovered
                ? 'bg-sky-950/50 border-sky-400 ring-2 ring-sky-400/50 text-white'
                : 'bg-slate-950/60 border-dashed border-slate-700 hover:border-slate-500 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke="#334155"
                    strokeWidth="3.5"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="none"
                    stroke={practiceCompleted ? "#34d399" : "#38bdf8"}
                    strokeWidth="3.5"
                    strokeDasharray="88"
                    strokeDashoffset={88 - (practiceHoldProgress * 88)}
                    strokeLinecap="round"
                    className="transition-all duration-75"
                  />
                </svg>
                <span className="absolute text-xs">👌</span>
              </div>
              <div>
                <p className="font-bold text-xs uppercase tracking-wide font-mono">
                  {practiceCompleted ? "✓ GREAT! YOU'RE READY." : "👌 PINCH & HOLD HERE"}
                </p>
                <p className="text-[11px] text-slate-400">
                  {practiceCompleted
                    ? "Pinch-and-hold interaction confirmed!"
                    : practiceHoldProgress > 0
                    ? `Holding... ${Math.round(practiceHoldProgress * 100)}%`
                    : "Move cursor over here & hold pinch for 0.7s"}
                </p>
              </div>
            </div>

            {practiceCompleted ? (
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/30">
                READY
              </span>
            ) : (
              <span className="text-[10px] font-mono text-slate-500 uppercase">
                PRACTICE
              </span>
            )}
          </div>
        </div>

        {/* 3 Step Interactive Checklist */}
        <div className="space-y-2 mb-5 relative">
          
          {/* Step 1 */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
              calibration.hasSeenHand || isMouseFallback
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">👋</span>
              <div>
                <p className="font-semibold text-xs">Step 1: Show one hand to camera</p>
                <p className="text-[10px] text-slate-400">Position hand in the center of the webcam</p>
              </div>
            </div>
            {calibration.hasSeenHand || isMouseFallback ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 animate-spin shrink-0" />
            )}
          </div>

          {/* Step 2 */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
              calibration.hasPointed || isMouseFallback
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">☝️</span>
              <div>
                <p className="font-semibold text-xs">Step 2: Point with index finger</p>
                <p className="text-[10px] text-slate-400">Your fingertip acts as the cursor target</p>
              </div>
            </div>
            {calibration.hasPointed || isMouseFallback ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 shrink-0" />
            )}
          </div>

          {/* Step 3 */}
          <div
            className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
              calibration.hasPinched || isMouseFallback
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span className="text-xl">🤏</span>
              <div>
                <p className="font-semibold text-xs">Step 3: Pinch thumb + index finger</p>
                <p className="text-[10px] text-slate-400">Bring tips together to grab cards, release to drop</p>
              </div>
            </div>
            {calibration.hasPinched || isMouseFallback ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-slate-600 shrink-0" />
            )}
          </div>
        </div>

        {/* Camera error or permission note */}
        {cameraError && !isMouseFallback && (
          <div className="mb-4 p-2.5 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300">
            <p className="font-semibold">Webcam notification:</p>
            <p className="text-rose-400 mt-0.5">{cameraError}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              onSwitchToMouse();
              onComplete();
            }}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <MousePointer className="w-4 h-4 text-amber-400" />
            <span>Play with Mouse / Touchscreen</span>
          </button>

          <button
            onClick={onComplete}
            disabled={!calibrated && !isMouseFallback}
            className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              calibrated || isMouseFallback
                ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-lg shadow-sky-500/30'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>{calibrated ? '✓ Hand Control Ready · Start Game' : 'Waiting for Gesture...'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom accessibility note */}
        <p className="text-center text-[11px] text-slate-500 mt-3">
          Camera unavailable or in a noisy room? You can switch between Hand Tracking and Mouse anytime in the top bar.
        </p>
      </div>
    </div>
  );
};
