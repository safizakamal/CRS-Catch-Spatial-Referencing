import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Scenario, CursorPosition, GestureState, CRSType } from '../types/game';
import { Globe, Ruler, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, Lightbulb, Pin } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface Level1SortingProps {
  scenarios: Scenario[];
  currentIndex: number;
  cursor: CursorPosition;
  gestureState: GestureState;
  onCorrectAnswer: (points: number, reason: string) => void;
  onWrongAnswer: (hint: string) => void;
  onNextQuestion: () => void;
  isMouseFallback: boolean;
  score: number;
}

export const Level1Sorting: React.FC<Level1SortingProps> = ({
  scenarios,
  currentIndex,
  cursor,
  gestureState,
  onCorrectAnswer,
  onWrongAnswer,
  onNextQuestion,
  isMouseFallback,
}) => {
  const currentScenario = scenarios[currentIndex];

  // Drag state
  const [isGrabbed, setIsGrabbed] = useState<boolean>(false);
  const [cardOffset, setCardOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredZone, setHoveredZone] = useState<CRSType | null>(null);
  const [showCardHint, setShowCardHint] = useState<boolean>(false);

  // Resolution feedback state
  const [feedback, setFeedback] = useState<{
    status: 'CORRECT' | 'WRONG' | null;
    message: string;
    hint?: string;
  }>({ status: null, message: '' });

  // Answer locked state (prevents further dragging once correctly answered)
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);

  // Reading lock: disables continuation for ~2.0 seconds after feedback appears
  const [isReadingLocked, setIsReadingLocked] = useState<boolean>(false);
  const readingLockTimerRef = useRef<number | null>(null);

  // Pinch-and-hold progress state (0 to 1 for 0.7s hold)
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isContinueHovered, setIsContinueHovered] = useState<boolean>(false);

  // Refs for tracking gestures and safety locks
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const hasReleasedAfterAnswerRef = useRef<boolean>(false);
  const wasPinchingRef = useRef<boolean>(false);

  // Refs for drop zones and card bounding box
  const leftZoneRef = useRef<HTMLDivElement | null>(null);
  const rightZoneRef = useRef<HTMLDivElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const initialCardPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Reset state on scenario switch
  useEffect(() => {
    if (readingLockTimerRef.current) clearTimeout(readingLockTimerRef.current);
    setCardOffset({ x: 0, y: 0 });
    setIsGrabbed(false);
    setHoveredZone(null);
    setShowCardHint(false);
    setFeedback({ status: null, message: '' });
    setIsAnswerLocked(false);
    setIsReadingLocked(false);
    setHoldProgress(0);
    setIsContinueHovered(false);
    holdStartTimeRef.current = null;
    hasReleasedAfterAnswerRef.current = false;
    wasPinchingRef.current = false;
  }, [currentIndex]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (readingLockTimerRef.current) clearTimeout(readingLockTimerRef.current);
    };
  }, []);

  // Measure card position
  const updateInitialCardCenter = useCallback(() => {
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      initialCardPosRef.current = {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      };
    }
  }, []);

  useEffect(() => {
    updateInitialCardCenter();
    window.addEventListener('resize', updateInitialCardCenter);
    return () => window.removeEventListener('resize', updateInitialCardCenter);
  }, [updateInitialCardCenter]);

  // Check which zone is hovered
  const getHoveredZone = useCallback((x: number, y: number): CRSType | null => {
    if (leftZoneRef.current) {
      const lRect = leftZoneRef.current.getBoundingClientRect();
      if (x >= lRect.left && x <= lRect.right && y >= lRect.top && y <= lRect.bottom) {
        return 'GCS';
      }
    }
    if (rightZoneRef.current) {
      const rRect = rightZoneRef.current.getBoundingClientRect();
      if (x >= rRect.left && x <= rRect.right && y >= rRect.top && y <= rRect.bottom) {
        return 'PCS';
      }
    }
    return null;
  }, []);

  // Intentional Continuation handler (for both hand hold & mouse/touch click)
  const handleContinue = useCallback(() => {
    if (isReadingLocked) return;
    sounds.playHover();
    if (readingLockTimerRef.current) clearTimeout(readingLockTimerRef.current);
    setFeedback({ status: null, message: '' });
    setHoldProgress(0);
    holdStartTimeRef.current = null;
    onNextQuestion();
  }, [isReadingLocked, onNextQuestion]);

  // Retry handler for incorrect answers
  const handleRetry = useCallback(() => {
    sounds.playHover();
    setFeedback({ status: null, message: '' });
    setCardOffset({ x: 0, y: 0 });
    setHoveredZone(null);
    setIsGrabbed(false);
    setIsAnswerLocked(false);
  }, []);

  // Answer Evaluation
  const handleCheckAnswer = useCallback((chosenCRS: CRSType) => {
    if (!currentScenario || isAnswerLocked) return;

    if (chosenCRS === currentScenario.correctAnswer) {
      sounds.playCorrect();
      setIsAnswerLocked(true);
      setIsGrabbed(false);
      setFeedback({
        status: 'CORRECT',
        message: currentScenario.reason,
      });
      onCorrectAnswer(10, currentScenario.reason);

      // READING LOCK: Disable continuation for ~2.0 seconds so student reads explanation
      setIsReadingLocked(true);
      hasReleasedAfterAnswerRef.current = false;
      setHoldProgress(0);
      holdStartTimeRef.current = null;

      if (readingLockTimerRef.current) clearTimeout(readingLockTimerRef.current);
      readingLockTimerRef.current = window.setTimeout(() => {
        setIsReadingLocked(false);
      }, 2000);
    } else {
      sounds.playWrong();
      setFeedback({
        status: 'WRONG',
        message: 'Look at the units and coordinates.',
        hint: currentScenario.hint || 'Look at the units. Are the coordinates expressed in degrees or metres?',
      });
      onWrongAnswer(currentScenario.hint);
      // Spring card back so student can try again
      setCardOffset({ x: 0, y: 0 });
      setHoveredZone(null);
      setIsGrabbed(false);
    }
  }, [currentScenario, isAnswerLocked, onCorrectAnswer, onWrongAnswer]);

  // Gesture loop: Drag-and-drop while playing & Pinch-and-hold continue when correct
  useEffect(() => {
    const isPinching = cursor.isPinching || gestureState === 'GRABBED';

    // Must detect a release after dropping before recognizing any new pinch gesture
    if (!isPinching) {
      hasReleasedAfterAnswerRef.current = true;
    }

    // ==========================================
    // CASE A: ANSWER IS CORRECT (CONTINUE STAGE)
    // ==========================================
    if (feedback.status === 'CORRECT') {
      // While reading is locked, continuation is disabled
      if (isReadingLocked) {
        holdStartTimeRef.current = null;
        setHoldProgress(0);
        setIsContinueHovered(false);
        wasPinchingRef.current = isPinching;
        return;
      }

      // Check if hand cursor is over the Continue control
      let isInsideContinue = false;
      if (continueButtonRef.current) {
        const rect = continueButtonRef.current.getBoundingClientRect();
        const pad = 12; // tolerance margin for hand tracking stability
        isInsideContinue = (
          cursor.x >= rect.left - pad &&
          cursor.x <= rect.right + pad &&
          cursor.y >= rect.top - pad &&
          cursor.y <= rect.bottom + pad
        );
      }
      setIsContinueHovered(isInsideContinue);

      // Crucial rules:
      // 1. Cursor MUST be inside the Continue button
      // 2. Student MUST be pinching
      // 3. The pinch used to drop the card must have been released first
      // 4. Pinch anywhere else will NOT advance
      const canHoldContinue = isInsideContinue && isPinching && hasReleasedAfterAnswerRef.current;

      if (canHoldContinue) {
        const now = performance.now();
        if (!holdStartTimeRef.current) {
          holdStartTimeRef.current = now;
        }
        const elapsed = now - holdStartTimeRef.current;
        const HOLD_DURATION = 700; // ~0.7 seconds
        const progress = Math.min(1, elapsed / HOLD_DURATION);
        setHoldProgress(progress);

        if (progress >= 1) {
          handleContinue();
        }
      } else {
        // Cancel hold progress immediately if released early or cursor left
        holdStartTimeRef.current = null;
        setHoldProgress(0);
      }

      wasPinchingRef.current = isPinching;
      return;
    }

    // ==========================================
    // CASE B: CARD SORTING (DRAG & DROP STAGE)
    // ==========================================
    if (isAnswerLocked) {
      wasPinchingRef.current = isPinching;
      return;
    }

    // 1. Proximity check to grab card
    if (cardRef.current) {
      const cardRect = cardRef.current.getBoundingClientRect();
      const padding = 60;
      const isNearCard =
        cursor.x >= cardRect.left - padding &&
        cursor.x <= cardRect.right + padding &&
        cursor.y >= cardRect.top - padding &&
        cursor.y <= cardRect.bottom + padding;

      // Pinch Start: Grab card
      if (isPinching && !wasPinchingRef.current && isNearCard && !isGrabbed) {
        setIsGrabbed(true);
        sounds.playGrab();
      }
    }

    // 2. Dragging card while grabbed
    if (isGrabbed && isPinching) {
      const currentCardX = cursor.x;
      const currentCardY = cursor.y;
      setCardOffset({
        x: currentCardX - initialCardPosRef.current.x,
        y: currentCardY - initialCardPosRef.current.y,
      });

      const zone = getHoveredZone(cursor.x, cursor.y);
      setHoveredZone(zone);
    }

    // 3. Pinch Release: Drop card and check answer
    if (!isPinching && wasPinchingRef.current && isGrabbed) {
      setIsGrabbed(false);
      const droppedZone = getHoveredZone(cursor.x, cursor.y);

      if (droppedZone) {
        handleCheckAnswer(droppedZone);
      } else {
        // Spring back to center
        setCardOffset({ x: 0, y: 0 });
        setHoveredZone(null);
        sounds.playDrop();
      }
    }

    wasPinchingRef.current = isPinching;
  }, [
    cursor,
    gestureState,
    isGrabbed,
    isAnswerLocked,
    feedback.status,
    isReadingLocked,
    getHoveredZone,
    handleCheckAnswer,
    handleContinue,
  ]);

  // Direct Click/Drop handler for mouse fallback
  const handleDirectSelect = (crs: CRSType) => {
    if (isAnswerLocked || feedback.status === 'CORRECT') return;
    handleCheckAnswer(crs);
  };

  if (!currentScenario) return null;

  return (
    <div className="relative w-full h-[calc(100vh-65px)] min-h-[580px] flex flex-col justify-between p-4 md:p-6 overflow-hidden select-none">
      
      {/* Background GIS Graticules */}
      <div className="absolute inset-0 bg-gis-crosshair opacity-35 pointer-events-none" />

      {/* Top Pedagogical Context Ribbon */}
      <div className="relative z-10 max-w-2xl mx-auto text-center mb-1">
        <span className="text-[11px] font-mono uppercase tracking-widest text-sky-400 font-semibold">
          Level 1 · The Foundation Challenge · RECOGNISE
        </span>
        <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
          Distinguish GCS from PCS
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Pinch & drag the scenario into Geographic Coordinates (GCS) or Projected Coordinates (PCS).
        </p>
      </div>

      {/* Main Interactive Stage: 3-Column Arena */}
      <div className="relative z-10 flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-stretch max-w-7xl mx-auto w-full my-auto">
        
        {/* LEFT ZONE: Geographic Coordinate System (GCS) - BLUE */}
        <div
          ref={leftZoneRef}
          onClick={() => isMouseFallback && handleDirectSelect('GCS')}
          className={`md:col-span-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between p-6 relative overflow-hidden group cursor-pointer ${
            hoveredZone === 'GCS'
              ? 'bg-sky-950/60 border-sky-400 shadow-[0_0_35px_rgba(56,189,248,0.45)] scale-[1.015]'
              : 'bg-slate-900/60 border-sky-500/30 hover:border-sky-500/50 hover:bg-slate-900/80'
          }`}
        >
          {/* Subtle cyan glow orb */}
          <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

          {/* Top Title & Icon */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">🌐</span>
              <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                ANGULAR DEGREES
              </span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-sky-200 transition-colors">
              GCS
            </h3>
            <p className="text-sm font-semibold text-sky-300 mt-0.5">
              Geographic Coordinate System
            </p>
          </div>

          {/* Key Characteristics */}
          <div className="my-6 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-sky-500/15">
              <span className="text-sky-400 font-mono font-bold">●</span>
              <span>Latitude (φ) & Longitude (λ)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-sky-500/15">
              <span className="text-sky-400 font-mono font-bold">●</span>
              <span>Units: Angular Degrees (° / DMS)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-sky-500/15">
              <span className="text-sky-400 font-mono font-bold">●</span>
              <span>Models 3D Curved Earth Ellipsoid</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-sky-500/15">
              <span className="text-sky-400 font-mono font-bold">●</span>
              <span>Standard: WGS 84 (EPSG:4326)</span>
            </div>
          </div>

          {/* Bottom Drop Target */}
          <div
            className={`w-full py-3 rounded-xl border border-dashed text-center text-xs font-bold transition-all ${
              hoveredZone === 'GCS'
                ? 'bg-sky-500 text-slate-950 border-sky-300 shadow-lg'
                : 'border-sky-500/40 text-sky-300/80 bg-sky-500/5'
            }`}
          >
            {hoveredZone === 'GCS' ? 'RELEASE PINCH TO DROP HERE 📥' : 'DROP GCS SCENARIOS HERE'}
          </div>
        </div>

        {/* CENTER COLUMN: Central Scenario Card */}
        <div className="md:col-span-4 flex flex-col items-center justify-center relative min-h-[300px]">
          
          {/* Card Anchor container */}
          <div
            ref={cardRef}
            style={{
              transform: `translate(${cardOffset.x}px, ${cardOffset.y}px) rotate(${cardOffset.x * 0.04}deg)`,
              transition: isGrabbed ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            className={`w-full max-w-sm rounded-2xl p-6 bg-slate-900 border-2 transition-shadow select-none relative z-20 ${
              isAnswerLocked
                ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(52,211,153,0.3)] opacity-90 cursor-default'
                : isGrabbed
                ? 'border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.6)] cursor-grabbing scale-105'
                : 'border-slate-700 shadow-2xl hover:border-sky-400 cursor-grab hover:shadow-sky-500/20'
            }`}
          >
            {/* Grab Aura Glow */}
            <div
              className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-sky-500 to-emerald-500 opacity-0 blur transition-opacity pointer-events-none ${
                isGrabbed ? 'opacity-40' : ''
              }`}
            />

            {/* Top metadata */}
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3 font-mono">
              <span>Card {currentIndex + 1} of {scenarios.length}</span>
              <span aria-hidden="true">·</span>
              <span className="text-sky-400 font-semibold">{currentScenario.badge}</span>
            </div>

            {/* Scenario Title */}
            <h4 className="text-base font-bold text-white mb-2 leading-snug">
              {currentScenario.title}
            </h4>

            {/* Scenario Content */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 text-sm leading-relaxed mb-4">
              "{currentScenario.scenarioText}"
            </div>

            {/* Unit Clue & Optional Hint Toggle */}
            <div className="flex items-center justify-between gap-2 mb-3">
              {currentScenario.unitClue && (
                <div className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700/60 font-mono">
                  <span className="text-amber-400 font-bold">🔍 CLUE:</span>
                  <span className="text-slate-200">{currentScenario.unitClue}</span>
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCardHint(!showCardHint);
                  sounds.playHover();
                }}
                className={`ml-auto text-[11px] font-mono px-2 py-1 rounded-lg border transition-colors flex items-center gap-1 cursor-pointer ${
                  showCardHint
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-800 text-slate-400 hover:text-amber-300 border-slate-700'
                }`}
                title="Toggle helpful hint"
              >
                <span>💡</span>
                <span>{showCardHint ? 'Hide Hint' : 'Need Hint?'}</span>
              </button>
            </div>

            {/* Revealed Hint Box */}
            {showCardHint && (
              <div className="p-2.5 mb-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 animate-in fade-in slide-in-from-top-1 duration-150">
                <span className="font-bold block text-[10px] font-mono text-amber-400 uppercase tracking-wide mb-0.5">
                  PEDAGOGICAL HINT:
                </span>
                <p className="leading-relaxed">{currentScenario.hint}</p>
              </div>
            )}

            {/* Instruction badge */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>
                  {isAnswerLocked
                    ? 'Answer Locked'
                    : isGrabbed
                    ? 'GRABBED · Moving'
                    : 'Pinch thumb & index to grab'}
                </span>
              </span>
              <span className="text-slate-500">↔ Drag left or right</span>
            </div>
          </div>

          {/* Quick Click Hint for mouse users */}
          {isMouseFallback && !feedback.status && (
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
              <span>Click either zone or drag the card directly!</span>
            </div>
          )}
        </div>

        {/* RIGHT ZONE: Projected Coordinate System (PCS) - GREEN */}
        <div
          ref={rightZoneRef}
          onClick={() => isMouseFallback && handleDirectSelect('PCS')}
          className={`md:col-span-4 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between p-6 relative overflow-hidden group cursor-pointer ${
            hoveredZone === 'PCS'
              ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_35px_rgba(52,211,153,0.45)] scale-[1.015]'
              : 'bg-slate-900/60 border-emerald-500/30 hover:border-emerald-500/50 hover:bg-slate-900/80'
          }`}
        >
          {/* Subtle green glow orb */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          {/* Top Title & Icon */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-3xl">📐</span>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                LINEAR METRES
              </span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-emerald-200 transition-colors">
              PCS
            </h3>
            <p className="text-sm font-semibold text-emerald-300 mt-0.5">
              Projected Coordinate System
            </p>
          </div>

          {/* Key Characteristics */}
          <div className="my-6 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/15">
              <span className="text-emerald-400 font-mono font-bold">●</span>
              <span>X (Easting) & Y (Northing)</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/15">
              <span className="text-emerald-400 font-mono font-bold">●</span>
              <span>Units: Metres (m) or Kilometres</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/15">
              <span className="text-emerald-400 font-mono font-bold">●</span>
              <span>Projects 3D Earth onto a 2D Flat Surface</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/15">
              <span className="text-emerald-400 font-mono font-bold">●</span>
              <span>Examples: UTM 48N, Cassini-Soldner</span>
            </div>
          </div>

          {/* Bottom Drop Target */}
          <div
            className={`w-full py-3 rounded-xl border border-dashed text-center text-xs font-bold transition-all ${
              hoveredZone === 'PCS'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-lg'
                : 'border-emerald-500/40 text-emerald-300/80 bg-emerald-500/5'
            }`}
          >
            {hoveredZone === 'PCS' ? 'RELEASE PINCH TO DROP HERE 📥' : 'DROP PCS SCENARIOS HERE'}
          </div>
        </div>

      </div>

      {/* Interactive Modal / Bottom Drawer for Educational Feedback */}
      {feedback.status && (
        <div className="fixed inset-x-4 bottom-5 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 max-w-2xl w-full z-40 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-5 md:p-6 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* ======================================================== */}
          {/* CORRECT ANSWER PANEL: Clean visual hierarchy by colors */}
          {/* ======================================================== */}
          {feedback.status === 'CORRECT' && (
            <div className="space-y-3.5">
              
              {/* 1. Small GREEN Result: Result Only */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-extrabold font-mono text-xs uppercase tracking-wider">
                    ✓ CORRECT!
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    +10 PTS
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  Challenge {currentIndex + 1} of {scenarios.length}
                </span>
              </div>

              {/* 2. BLUE/NAVY Learning Panel: WHY? */}
              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-100">
                <div className="flex items-center gap-1.5 mb-1.5 text-sky-400 text-xs font-mono font-bold uppercase tracking-wide">
                  <Lightbulb className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>WHY?</span>
                </div>
                <p className="text-xs md:text-sm text-sky-100/90 font-medium leading-relaxed">
                  {feedback.message}
                </p>
              </div>

              {/* 3. Compact ORANGE Panel: REMEMBER */}
              <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-100">
                <div className="flex items-center gap-1.5 mb-1.5 text-amber-400 text-xs font-mono font-bold uppercase tracking-wide">
                  <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>REMEMBER</span>
                </div>
                <div className="text-xs text-amber-200/90 font-medium">
                  {currentScenario.correctAnswer === 'GCS' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] md:text-xs">
                      <div className="flex items-center gap-1.5 bg-amber-900/30 px-2 py-1 rounded border border-amber-500/20">
                        <span className="text-amber-400 font-bold">●</span>
                        <span>Latitude / Longitude</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-amber-900/30 px-2 py-1 rounded border border-amber-500/20">
                        <span className="text-amber-400 font-bold">●</span>
                        <span>Angular coordinates</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-amber-900/30 px-2 py-1 rounded border border-amber-500/20">
                        <span className="text-amber-400 font-bold">●</span>
                        <span>Degrees (°)</span>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px] md:text-xs">
                      <div className="flex items-center gap-1.5 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/20 text-emerald-200">
                        <span className="text-emerald-400 font-bold">●</span>
                        <span>X / Y coordinates</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/20 text-emerald-200">
                        <span className="text-emerald-400 font-bold">●</span>
                        <span>Planar coordinates</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-emerald-900/30 px-2 py-1 rounded border border-emerald-500/20 text-emerald-200">
                        <span className="text-emerald-400 font-bold">●</span>
                        <span>Usually linear units (metres)</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* 4. Continuation Control (Neutral styling) */}
              <div className="pt-1">
                {isReadingLocked ? (
                  /* READING LOCK: Continuation is disabled for ~2s */
                  <div className="w-full py-3.5 px-6 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-400 font-bold text-xs flex items-center justify-center gap-2.5 cursor-not-allowed select-none">
                    <span className="text-base animate-pulse">👀</span>
                    <span className="tracking-wide uppercase font-mono text-slate-300">
                      READ THE EXPLANATION
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Unlocked shortly)
                    </span>
                  </div>
                ) : (
                  /* GESTURE + MOUSE/TOUCH CONTINUE CONTROL */
                  <button
                    ref={continueButtonRef}
                    type="button"
                    onClick={handleContinue}
                    className={`relative w-full py-3.5 px-6 rounded-xl font-bold text-xs md:text-sm uppercase tracking-wider flex items-center justify-center gap-3 transition-all select-none shadow-xl border cursor-pointer ${
                      isContinueHovered
                        ? 'bg-sky-500 text-slate-950 border-sky-300 ring-2 ring-sky-400/80 ring-offset-2 ring-offset-slate-900 shadow-sky-500/40 scale-[1.01]'
                        : 'bg-slate-800 hover:bg-slate-700 text-white border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    {/* Circular SVG progress indicator while holding */}
                    <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                      <svg className="w-8 h-8 -rotate-90" viewBox="0 0 36 36">
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3.5"
                          className={isContinueHovered ? "text-sky-700/50" : "text-slate-700"}
                        />
                        <circle
                          cx="18"
                          cy="18"
                          r="14"
                          fill="none"
                          stroke={isContinueHovered ? "#0284c7" : "#38bdf8"}
                          strokeWidth="3.5"
                          strokeDasharray="88"
                          strokeDashoffset={88 - (holdProgress * 88)}
                          strokeLinecap="round"
                          className="transition-all duration-75"
                        />
                      </svg>
                      <span className="absolute text-xs">👌</span>
                    </div>

                    <div className="flex flex-col items-start text-left">
                      <span className="font-mono font-black text-xs md:text-sm">
                        {holdProgress > 0
                          ? `HOLDING... ${Math.round(holdProgress * 100)}%`
                          : 'PINCH & HOLD TO CONTINUE'}
                      </span>
                      <span className={`text-[10px] font-normal normal-case ${isContinueHovered ? 'text-slate-900' : 'text-slate-400'}`}>
                        Pinch & hold for 0.7s · or click/tap with mouse
                      </span>
                    </div>

                    <ArrowRight className="w-4 h-4 ml-auto shrink-0" />
                  </button>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* INCORRECT ANSWER PANEL: Short RED result + BLUE hint     */}
          {/* ======================================================== */}
          {feedback.status === 'WRONG' && (
            <div className="space-y-3">
              
              {/* Short RED result */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-extrabold font-mono text-xs uppercase tracking-wider">
                  ✗ NOT QUITE
                </span>
              </div>

              {/* BLUE/NAVY hint */}
              <div className="p-3.5 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-100">
                <div className="flex items-center gap-1.5 mb-1 text-sky-400 text-xs font-mono font-bold uppercase tracking-wide">
                  <Lightbulb className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>HINT</span>
                </div>
                <p className="text-xs md:text-sm text-sky-100/90 font-medium leading-relaxed">
                  {feedback.hint || "Look at the units. Are the coordinates expressed in degrees or metres?"}
                </p>
              </div>

              {/* Neutral TRY AGAIN button */}
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <RotateCcw className="w-4 h-4 text-slate-300" />
                <span>TRY AGAIN</span>
              </button>

            </div>
          )}

        </div>
      )}

      {/* Footer Compact Gesture Reminder Ribbon */}
      <div className="relative z-10 max-w-xl mx-auto text-center mt-2 px-4 py-1.5 rounded-full bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1 text-slate-300">
          <span>🖐</span> MOVE
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-slate-300">
          <span>🤏</span> PINCH
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-slate-300">
          <span>🖐</span> RELEASE
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-sky-400 font-semibold">
          <span>👌</span> PINCH & HOLD
        </span>
      </div>

    </div>
  );
};
