import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DetectiveQuestion, CursorPosition, GestureState } from '../types/game';
import {
  Search,
  MapPin,
  Hash,
  Globe2,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  Pin,
  Compass,
  Layers,
  Sparkles
} from 'lucide-react';
import { sounds } from '../services/soundEffects';
import mapVisual from '../assets/images/gis_map_layer_detective_1791724897428.jpg';

interface Level2DetectiveProps {
  questions: DetectiveQuestion[];
  currentIndex: number;
  cursor: CursorPosition;
  gestureState: GestureState;
  onCorrectAnswer: (points: number, explanation: string) => void;
  onWrongAnswer: (hint: string) => void;
  onNextQuestion: () => void;
  isMouseFallback: boolean;
}

type ClueKey = 'WHERE' | 'NUMBERS' | 'CRS';

export const Level2Detective: React.FC<Level2DetectiveProps> = ({
  questions,
  currentIndex,
  cursor,
  gestureState,
  onCorrectAnswer,
  onWrongAnswer,
  onNextQuestion,
  isMouseFallback,
}) => {
  const currentQ = questions[currentIndex];

  // Interactive clues state: tracks which clues have been inspected
  const [openedClues, setOpenedClues] = useState<Set<ClueKey>>(new Set());
  const [hoveredClueKey, setHoveredClueKey] = useState<ClueKey | null>(null);

  // Diagnosis options selection state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [hoveredOptionId, setHoveredOptionId] = useState<string | null>(null);

  // Answer resolution feedback state
  const [feedback, setFeedback] = useState<{
    status: 'CORRECT' | 'WRONG' | null;
    message: string;
    hint?: string;
  }>({ status: null, message: '' });

  // Answer locked once correct
  const [isAnswerLocked, setIsAnswerLocked] = useState<boolean>(false);

  // Reading lock: ~2.0s delay before enabling Next Case
  const [isReadingLocked, setIsReadingLocked] = useState<boolean>(false);
  const readingLockTimerRef = useRef<number | null>(null);

  // Pinch-and-hold progress state (0 to 1 for 0.7s hold)
  const [holdProgress, setHoldProgress] = useState<number>(0);
  const [isContinueHovered, setIsContinueHovered] = useState<boolean>(false);

  // Element Refs
  const continueButtonRef = useRef<HTMLButtonElement | null>(null);
  const clueRefs = useRef<Map<ClueKey, HTMLButtonElement>>(new Map());
  const optionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Gesture tracking safety refs
  const holdStartTimeRef = useRef<number | null>(null);
  const hasReleasedAfterAnswerRef = useRef<boolean>(false);
  const wasPinchingRef = useRef<boolean>(false);

  // Reset states on question change
  useEffect(() => {
    if (readingLockTimerRef.current) clearTimeout(readingLockTimerRef.current);
    setOpenedClues(new Set());
    setHoveredClueKey(null);
    setSelectedOptionId(null);
    setHoveredOptionId(null);
    setFeedback({ status: null, message: '' });
    setIsAnswerLocked(false);
    setIsReadingLocked(false);
    setHoldProgress(0);
    setIsContinueHovered(false);
    holdStartTimeRef.current = null;
    hasReleasedAfterAnswerRef.current = false;
    wasPinchingRef.current = false;
  }, [currentIndex]);

  // Clean timers on unmount
  useEffect(() => {
    return () => {
      if (readingLockTimerRef.current) clearTimeout(readingLockTimerRef.current);
    };
  }, []);

  // Clue toggle handler
  const handleToggleClue = useCallback((key: ClueKey) => {
    sounds.playGrab();
    setOpenedClues((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  // Continuation handler (gesture hold or mouse click)
  const handleContinue = useCallback(() => {
    if (isReadingLocked) return;
    sounds.playHover();
    if (readingLockTimerRef.current) clearTimeout(readingLockTimerRef.current);
    setFeedback({ status: null, message: '' });
    setHoldProgress(0);
    holdStartTimeRef.current = null;
    onNextQuestion();
  }, [isReadingLocked, onNextQuestion]);

  // Retry handler for incorrect diagnosis
  const handleRetry = useCallback(() => {
    sounds.playHover();
    setFeedback({ status: null, message: '' });
    setSelectedOptionId(null);
    setIsAnswerLocked(false);
  }, []);

  // Evaluate student's diagnosis choice
  const handleSelectOption = useCallback((optionId: string) => {
    if (!currentQ || isAnswerLocked) return;
    const opt = currentQ.options.find((o) => o.id === optionId);
    if (!opt) return;

    setSelectedOptionId(optionId);

    if (opt.isCorrect) {
      sounds.playCorrect();
      setIsAnswerLocked(true);
      setFeedback({
        status: 'CORRECT',
        message: currentQ.explanation,
      });
      onCorrectAnswer(15, currentQ.explanation);

      // READING LOCK: 2.0s lock to ensure student reads key evidence and GIS tip
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
        message: 'That does not account for the observed spatial anomaly.',
        hint: currentQ.hint || 'Review the coordinate numbers and CRS definition again.',
      });
      onWrongAnswer(currentQ.hint);
    }
  }, [currentQ, isAnswerLocked, onCorrectAnswer, onWrongAnswer]);

  // Main Hand Tracking & Gesture Loop
  useEffect(() => {
    const isPinching = cursor.isPinching || gestureState === 'GRABBED';

    // Must detect a hand release after an action before recognizing any new pinch
    if (!isPinching) {
      hasReleasedAfterAnswerRef.current = true;
    }

    // ==========================================
    // CASE A: ANSWER IS CORRECT (CONTINUE STAGE)
    // ==========================================
    if (feedback.status === 'CORRECT') {
      if (isReadingLocked) {
        holdStartTimeRef.current = null;
        setHoldProgress(0);
        setIsContinueHovered(false);
        wasPinchingRef.current = isPinching;
        return;
      }

      // Bounds check on Continue button
      let isInsideContinue = false;
      if (continueButtonRef.current) {
        const rect = continueButtonRef.current.getBoundingClientRect();
        const pad = 12;
        isInsideContinue = (
          cursor.x >= rect.left - pad &&
          cursor.x <= rect.right + pad &&
          cursor.y >= rect.top - pad &&
          cursor.y <= rect.bottom + pad
        );
      }
      setIsContinueHovered(isInsideContinue);

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
        holdStartTimeRef.current = null;
        setHoldProgress(0);
      }

      wasPinchingRef.current = isPinching;
      return;
    }

    // ==========================================
    // CASE B: INVESTIGATION STAGE (CLUES & DIAGNOSIS)
    // ==========================================
    if (isAnswerLocked) {
      wasPinchingRef.current = isPinching;
      return;
    }

    // 1. Check Clue Cards Hover & Pinch
    let foundClueKey: ClueKey | null = null;
    clueRefs.current.forEach((el, key) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          cursor.x >= rect.left &&
          cursor.x <= rect.right &&
          cursor.y >= rect.top &&
          cursor.y <= rect.bottom
        ) {
          foundClueKey = key;
        }
      }
    });
    setHoveredClueKey(foundClueKey);

    if (isPinching && !wasPinchingRef.current && foundClueKey) {
      handleToggleClue(foundClueKey);
      wasPinchingRef.current = isPinching;
      return;
    }

    // 2. Check Diagnosis Option Cards Hover & Pinch
    let foundOptionId: string | null = null;
    optionRefs.current.forEach((el, id) => {
      if (el) {
        const rect = el.getBoundingClientRect();
        if (
          cursor.x >= rect.left &&
          cursor.x <= rect.right &&
          cursor.y >= rect.top &&
          cursor.y <= rect.bottom
        ) {
          foundOptionId = id;
        }
      }
    });
    setHoveredOptionId(foundOptionId);

    if (isPinching && !wasPinchingRef.current && foundOptionId) {
      handleSelectOption(foundOptionId);
    }

    wasPinchingRef.current = isPinching;
  }, [
    cursor,
    gestureState,
    feedback.status,
    isReadingLocked,
    isAnswerLocked,
    handleToggleClue,
    handleSelectOption,
    handleContinue,
  ]);

  if (!currentQ) return null;

  // Clue contents
  const clueWhere = currentQ.clues?.where || currentQ.mapAnomaly || 'Inspect the map location and expected study area.';
  const clueNumbers = currentQ.clues?.numbers || currentQ.coordinatesClue || 'Coordinate values in the raw dataset.';
  const clueCrs = currentQ.clues?.crs || 'Spatial reference definition and layer projection metadata.';

  return (
    <div className="relative w-full h-[calc(100vh-65px)] min-h-[580px] flex flex-col justify-between p-3 md:p-5 overflow-y-auto select-none">
      
      {/* Background Graticules */}
      <div className="absolute inset-0 bg-gis-crosshair opacity-30 pointer-events-none" />

      {/* TOP CASE BRIEFING: Concise Detective Header */}
      <div className="relative z-10 max-w-7xl mx-auto w-full mb-3">
        <div className="bg-slate-900/95 border border-amber-500/35 rounded-2xl p-3 md:p-4 shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            
            {/* Title & Case Index */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xl shrink-0 shadow-lg shadow-amber-500/10">
                🕵️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold tracking-widest text-amber-400 uppercase">
                    LEVEL 2 · CRS DETECTIVE · INVESTIGATE
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs text-slate-300 font-semibold font-mono">
                    Case {currentIndex + 1} / {questions.length}
                  </span>
                </div>
                <h2 className="text-base md:text-lg font-black text-white tracking-tight">
                  {currentQ.title}
                </h2>
              </div>
            </div>

            {/* Core Recurring Detective Question Banner */}
            <div className="inline-flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-sky-500/30 text-xs self-start sm:self-center font-mono">
              <span className="text-sky-400 font-bold">🔎 QUESTION:</span>
              <span className="text-slate-100 font-bold">
                WHAT DOES THE EVIDENCE TELL YOU?
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* MAIN TWO-COLUMN INVESTIGATION ARENA */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4 max-w-7xl mx-auto w-full items-stretch my-auto">
        
        {/* LEFT COLUMN: Visual Evidence & Map Viewport (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col justify-between">
          
          {/* Viewport Header */}
          <div className="px-3.5 py-2 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <Compass className="w-4 h-4 text-sky-400" />
              <span className="font-bold text-white">Visual Evidence Map</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400 text-[11px]">
              <span className="text-emerald-400">● Live Canvas</span>
            </div>
          </div>

          {/* Map Visual with Layer HUD */}
          <div className="relative flex-1 bg-slate-950 flex items-center justify-center overflow-hidden min-h-[190px] max-h-[260px]">
            <img
              src={mapVisual}
              alt="GIS Map Visualization Canvas"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover opacity-85"
            />

            {/* Simulated GIS Layers HUD */}
            <div className="absolute top-2.5 left-2.5 bg-slate-950/90 border border-slate-800 rounded-lg p-2 text-xs backdrop-blur-md max-w-xs z-10 shadow-lg">
              <div className="flex items-center gap-1.5 font-bold text-slate-200 mb-1.5 border-b border-slate-800 pb-1 text-[11px]">
                <Layers className="w-3.5 h-3.5 text-sky-400" />
                <span>Layer Table</span>
              </div>
              
              <div className="space-y-1 font-mono text-[10px]">
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Roads</span>
                  </span>
                  <span>[EPSG:32648]</span>
                </div>
                <div className="flex items-center justify-between text-emerald-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Buildings</span>
                  </span>
                  <span>[EPSG:32648]</span>
                </div>
                <div className="flex items-center justify-between text-rose-400 font-bold bg-rose-500/10 px-1 py-0.5 rounded">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                    <span>Target Layer</span>
                  </span>
                  <span>[ANOMALY]</span>
                </div>
              </div>
            </div>

            {/* Anomaly Badge */}
            <div className="absolute top-2.5 right-2.5 bg-rose-950/90 border border-rose-500/60 rounded-lg p-1.5 text-rose-200 text-[10px] font-mono shadow-xl backdrop-blur-md z-10 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
              <span className="font-bold">ANOMALY DETECTED</span>
            </div>

            {/* Inspected Coordinate Pill */}
            {currentQ.coordinatesClue && (
              <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-slate-950/95 border border-amber-500/50 rounded-lg px-2.5 py-1.5 text-xs font-mono text-amber-300 flex items-center justify-between backdrop-blur-md shadow-xl z-10">
                <span className="font-bold flex items-center gap-1 text-white text-[11px]">
                  <Search className="w-3.5 h-3.5 text-amber-400" />
                  <span>COORDINATES:</span>
                </span>
                <span className="text-amber-200 font-bold bg-amber-500/15 px-2 py-0.5 rounded text-[11px]">
                  {currentQ.coordinatesClue}
                </span>
              </div>
            )}
          </div>

          {/* Short Problem Summary */}
          <div className="p-3 bg-slate-950/90 border-t border-slate-800">
            <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block mb-0.5">
              PROBLEM SUMMARY:
            </span>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">
              "{currentQ.problemDescription}"
            </p>
          </div>

        </div>

        {/* RIGHT COLUMN: 3 Interactive Clues + Diagnosis Options (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-3">
          
          {/* SECTION 1: THREE INTERACTIVE CLUES */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <span className="text-base">🕵️</span>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  EXPLORE CLUES
                </span>
                <span className="text-[11px] text-slate-400 font-sans">
                  (Pinch 🤏 or Click to Inspect)
                </span>
              </div>

              {/* Unobtrusive Clue Status */}
              <div className="flex items-center gap-1.5 text-[11px] font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-400">CLUES EXPLORED:</span>
                <span className="text-amber-400 font-bold">{openedClues.size} / 3</span>
              </div>
            </div>

            {/* The 3 Clue Buttons/Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              
              {/* Clue 1: WHERE? */}
              <button
                type="button"
                ref={(el) => {
                  if (el) clueRefs.current.set('WHERE', el);
                  else clueRefs.current.delete('WHERE');
                }}
                onClick={() => handleToggleClue('WHERE')}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  openedClues.has('WHERE')
                    ? 'bg-sky-950/70 border-sky-400 shadow-md shadow-sky-500/20'
                    : hoveredClueKey === 'WHERE'
                    ? 'bg-slate-800 border-sky-400/80 ring-2 ring-sky-400/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>📍 WHERE?</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    openedClues.has('WHERE') ? 'bg-sky-500/20 text-sky-300 font-bold' : 'text-slate-500'
                  }`}>
                    {openedClues.has('WHERE') ? '✓ INSPECTED' : 'TAP'}
                  </span>
                </div>

                <div className="text-[11px] leading-snug mt-1">
                  {openedClues.has('WHERE') ? (
                    <p className="text-sky-100 font-medium">{clueWhere}</p>
                  ) : (
                    <p className="text-slate-400 italic">Where did the layer appear spatially?</p>
                  )}
                </div>
              </button>

              {/* Clue 2: NUMBERS? */}
              <button
                type="button"
                ref={(el) => {
                  if (el) clueRefs.current.set('NUMBERS', el);
                  else clueRefs.current.delete('NUMBERS');
                }}
                onClick={() => handleToggleClue('NUMBERS')}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  openedClues.has('NUMBERS')
                    ? 'bg-amber-950/70 border-amber-400 shadow-md shadow-amber-500/20'
                    : hoveredClueKey === 'NUMBERS'
                    ? 'bg-slate-800 border-amber-400/80 ring-2 ring-amber-400/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400">
                    <Hash className="w-3.5 h-3.5" />
                    <span>🔢 NUMBERS?</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    openedClues.has('NUMBERS') ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-500'
                  }`}>
                    {openedClues.has('NUMBERS') ? '✓ INSPECTED' : 'TAP'}
                  </span>
                </div>

                <div className="text-[11px] leading-snug mt-1">
                  {openedClues.has('NUMBERS') ? (
                    <p className="text-amber-100 font-medium">{clueNumbers}</p>
                  ) : (
                    <p className="text-slate-400 italic">Are numbers degrees or large metres?</p>
                  )}
                </div>
              </button>

              {/* Clue 3: CRS? */}
              <button
                type="button"
                ref={(el) => {
                  if (el) clueRefs.current.set('CRS', el);
                  else clueRefs.current.delete('CRS');
                }}
                onClick={() => handleToggleClue('CRS')}
                className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative overflow-hidden ${
                  openedClues.has('CRS')
                    ? 'bg-emerald-950/70 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : hoveredClueKey === 'CRS'
                    ? 'bg-slate-800 border-emerald-400/80 ring-2 ring-emerald-400/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-400">
                    <Globe2 className="w-3.5 h-3.5" />
                    <span>🏷️ CRS?</span>
                  </span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    openedClues.has('CRS') ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-500'
                  }`}>
                    {openedClues.has('CRS') ? '✓ INSPECTED' : 'TAP'}
                  </span>
                </div>

                <div className="text-[11px] leading-snug mt-1">
                  {openedClues.has('CRS') ? (
                    <p className="text-emerald-100 font-medium">{clueCrs}</p>
                  ) : (
                    <p className="text-slate-400 italic">What CRS or projection metadata exists?</p>
                  )}
                </div>
              </button>

            </div>
          </div>

          {/* SECTION 2: MAKE DIAGNOSIS CHOICES */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold font-mono text-emerald-400 uppercase tracking-wide">
                  🎯 MAKE DIAGNOSIS:
                </span>
                <span className="text-xs font-bold text-white">
                  {currentQ.question}
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">
                (Pinch 🤏 or Click card)
              </span>
            </div>

            {/* Diagnosis Option Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
              {currentQ.options.map((opt) => {
                const isHovered = hoveredOptionId === opt.id;
                const isSelected = selectedOptionId === opt.id;

                let cardStyle = 'bg-slate-950/80 border-slate-800 text-slate-200 hover:border-slate-700';
                if (isSelected) {
                  if (opt.isCorrect) {
                    cardStyle = 'bg-emerald-950/80 border-emerald-400 text-emerald-100 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/30';
                  } else {
                    cardStyle = 'bg-rose-950/80 border-rose-500 text-rose-100 shadow-md';
                  }
                } else if (isHovered) {
                  cardStyle = 'bg-slate-800 border-sky-400 text-white ring-2 ring-sky-400/40 shadow-lg';
                }

                return (
                  <div
                    key={opt.id}
                    ref={(el) => {
                      if (el) optionRefs.current.set(opt.id, el);
                      else optionRefs.current.delete(opt.id);
                    }}
                    onClick={() => isMouseFallback && handleSelectOption(opt.id)}
                    className={`p-3 rounded-xl border-2 transition-all duration-150 cursor-pointer select-none flex flex-col justify-between ${cardStyle}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 font-mono font-bold text-xs flex items-center justify-center text-sky-400">
                        {opt.id}
                      </span>
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${
                        isSelected && opt.isCorrect
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : isHovered
                          ? 'bg-yellow-400 text-slate-950'
                          : 'text-slate-500 bg-slate-900'
                      }`}>
                        {isSelected && opt.isCorrect ? '✓ CORRECT' : isHovered ? '🤏 PINCH' : 'CHOOSE'}
                      </span>
                    </div>

                    <p className="text-xs font-bold leading-snug text-white flex-1">
                      {opt.text}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* EDUCATIONAL RESOLUTION FEEDBACK DRAWER / MODAL           */}
      {/* ======================================================== */}
      {feedback.status && (
        <div className="fixed inset-x-4 bottom-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 max-w-2xl w-full z-40 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-4 md:p-5 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* CORRECT DIAGNOSIS PANEL */}
          {feedback.status === 'CORRECT' && (
            <div className="space-y-3">
              
              {/* 1. Green Result Tag */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-extrabold font-mono text-xs uppercase tracking-wider">
                    ✓ CASE SOLVED!
                  </span>
                  <span className="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    +15 PTS
                  </span>
                </div>

                <span className="text-[11px] font-mono text-slate-400">
                  {currentQ.diagnosisTitle || 'DIAGNOSIS CONFIRMED'}
                </span>
              </div>

              {/* 2. Blue/Navy Panel: KEY EVIDENCE */}
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-100">
                <div className="flex items-center gap-1.5 mb-1 text-sky-400 text-xs font-mono font-bold uppercase tracking-wide">
                  <Search className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>🔎 KEY EVIDENCE</span>
                </div>
                <p className="text-xs md:text-sm text-sky-100/95 font-medium leading-relaxed">
                  {currentQ.keyEvidence || feedback.message}
                </p>
              </div>

              {/* 3. Orange Panel: GIS TIP */}
              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-amber-100">
                <div className="flex items-center gap-1.5 mb-0.5 text-amber-400 text-xs font-mono font-bold uppercase tracking-wide">
                  <Pin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>📌 GIS TIP</span>
                </div>
                <p className="text-xs text-amber-200/90 font-medium leading-relaxed">
                  {currentQ.gisTip || 'Always verify layer CRS metadata before assuming coordinates are incorrect.'}
                </p>
              </div>

              {/* 4. Continue Control (Neutral with hold progress) */}
              <div className="pt-0.5">
                {isReadingLocked ? (
                  <div className="w-full py-3 px-6 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none">
                    <span className="text-base animate-pulse">👀</span>
                    <span className="tracking-wide uppercase font-mono text-slate-300">
                      READ THE EVIDENCE
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal">
                      (Unlocked shortly)
                    </span>
                  </div>
                ) : (
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
                    {/* Circular SVG progress indicator */}
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
                          : 'PINCH & HOLD FOR NEXT CASE'}
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

          {/* INCORRECT DIAGNOSIS PANEL */}
          {feedback.status === 'WRONG' && (
            <div className="space-y-3">
              {/* Short Red result */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-500/40 text-rose-300">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="font-extrabold font-mono text-xs uppercase tracking-wider">
                  ✗ NOT QUITE
                </span>
              </div>

              {/* Blue/Navy hint: LOOK AGAIN */}
              <div className="p-3 rounded-xl bg-blue-950/60 border border-blue-500/40 text-blue-100">
                <div className="flex items-center gap-1.5 mb-1 text-sky-400 text-xs font-mono font-bold uppercase tracking-wide">
                  <Lightbulb className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>💡 LOOK AGAIN</span>
                </div>
                <p className="text-xs md:text-sm text-sky-100/90 font-medium leading-relaxed">
                  {feedback.hint || currentQ.hint || 'Review the coordinate numbers and CRS definition again.'}
                </p>
              </div>

              {/* Retry action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 hover:border-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                >
                  <RotateCcw className="w-4 h-4 text-slate-300" />
                  <span>TRY AGAIN</span>
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Footer Compact Gesture Reminder */}
      <div className="relative z-10 max-w-xl mx-auto text-center mt-2 px-4 py-1 rounded-full bg-slate-900/70 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center gap-3">
        <span className="flex items-center gap-1 text-slate-300">
          <span>🖐</span> MOVE
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-slate-300">
          <span>🤏</span> PINCH TO INSPECT
        </span>
        <span className="text-slate-600">·</span>
        <span className="flex items-center gap-1 text-sky-400 font-semibold">
          <span>👌</span> PINCH & HOLD FOR NEXT CASE
        </span>
      </div>

    </div>
  );
};
