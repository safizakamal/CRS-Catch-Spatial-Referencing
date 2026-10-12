/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { GameStage, GameStats } from './types/game';
import {
  LEVEL_1_SCENARIOS,
  LEVEL_2_DETECTIVE_QUESTIONS,
  LEVEL_3_QUICK_ITEMS,
} from './data/scenarios';
import { useHandTracking } from './hooks/useHandTracking';
import { Header } from './components/Header';
import { HandCursor } from './components/HandCursor';
import { WebcamPip } from './components/WebcamPip';
import { CalibrationModal } from './components/CalibrationModal';
import { IntroScreen } from './components/IntroScreen';
import { Level1Sorting } from './components/Level1Sorting';
import { Level2Detective } from './components/Level2Detective';
import { Level3QuickDecision } from './components/Level3QuickDecision';
import { GameOverSummary } from './components/GameOverSummary';
import { LearnMoreModal } from './components/LearnMoreModal';
import { sounds } from './services/soundEffects';

export default function App() {
  const [currentStage, setCurrentStage] = useState<GameStage>('INTRO');
  const [level1Index, setLevel1Index] = useState<number>(0);
  const [level2Index, setLevel2Index] = useState<number>(0);
  const [level3Index, setLevel3Index] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState<boolean>(false);

  // Game Stats
  const [stats, setStats] = useState<GameStats>({
    score: 0,
    lives: 3,
    level1Correct: 0,
    level2Correct: 0,
    level3Correct: 0,
    streak: 0,
    maxStreak: 0,
  });

  // Level unlock transition banners
  const [levelUnlockAlert, setLevelUnlockAlert] = useState<{
    title: string;
    description: string;
    instructions: string[];
    targetStage: GameStage;
    actionLabel: string;
  } | null>(null);

  // Hand tracking
  const {
    trackingStatus,
    gestureState,
    cursor,
    isMouseFallback,
    cameraError,
    showPip,
    setShowPip,
    startCamera,
    enableMouseFallback,
    enableCameraMode,
    canvasRef,
    calibration,
  } = useHandTracking();

  // Shuffled or randomized scenarios
  const scenarios = useMemo(() => {
    return [...LEVEL_1_SCENARIOS];
  }, []);

  const detectiveQuestions = useMemo(() => {
    return [...LEVEL_2_DETECTIVE_QUESTIONS];
  }, []);

  const quickItems = useMemo(() => {
    return [...LEVEL_3_QUICK_ITEMS];
  }, []);

  // Handlers for stage transitions
  const handleStartWithHand = () => {
    setCurrentStage('CALIBRATION');
    startCamera();
  };

  const handleStartWithMouse = () => {
    enableMouseFallback();
    setCurrentStage('LEVEL_1');
  };

  const handleCalibrationComplete = () => {
    sounds.playCorrect();
    setCurrentStage('LEVEL_1');
  };

  const handleRestart = () => {
    setLevel1Index(0);
    setLevel2Index(0);
    setLevel3Index(0);
    setStats({
      score: 0,
      lives: 3,
      level1Correct: 0,
      level2Correct: 0,
      level3Correct: 0,
      streak: 0,
      maxStreak: 0,
    });
    setLevelUnlockAlert(null);
    setCurrentStage('LEVEL_1');
  };

  // Toggle Camera vs Mouse mode
  const handleToggleFallback = () => {
    if (isMouseFallback) {
      enableCameraMode();
    } else {
      enableMouseFallback();
    }
  };

  // Level 1 Correct Answer
  const handleLevel1Correct = (points: number) => {
    setStats((prev) => {
      const nextScore = prev.score + points;
      const nextStreak = prev.streak + 1;
      return {
        ...prev,
        score: nextScore,
        streak: nextStreak,
        maxStreak: Math.max(prev.maxStreak, nextStreak),
        level1Correct: prev.level1Correct + 1,
      };
    });
  };

  // Level 1 Wrong Answer
  const handleLevel1Wrong = () => {
    setStats((prev) => ({
      ...prev,
      lives: Math.max(1, prev.lives - 1),
      streak: 0,
    }));
  };

  // Level 1 Next Question
  const handleLevel1Next = () => {
    if (level1Index + 1 < scenarios.length) {
      setLevel1Index((prev) => prev + 1);
    } else {
      // Level 1 Complete! Unlock Level 2
      sounds.playFanfare();
      setLevelUnlockAlert({
        title: '🔍 LEVEL 2 UNLOCKED: CRS DETECTIVE!',
        description: 'You are now entering the GIS Diagnostic Laboratory. Layers are misbehaving on screen!',
        instructions: [
          '1. Inspect the Map & Layer Table on the left to see the anomaly.',
          '2. Read the Detective Question in the amber box.',
          '3. Pinch 🤏 (thumb + index) or Click 🖱️ the correct diagnostic action card (A, B, C, or D) to solve the case!'
        ],
        targetStage: 'LEVEL_2',
        actionLabel: 'START DETECTIVE CASE 1 →'
      });
    }
  };

  // Level 2 Handlers
  const handleLevel2Correct = (points: number) => {
    setStats((prev) => ({
      ...prev,
      score: prev.score + points,
      level2Correct: prev.level2Correct + 1,
    }));
  };

  const handleLevel2Wrong = () => {
    setStats((prev) => ({
      ...prev,
      lives: Math.max(1, prev.lives - 1),
    }));
  };

  const handleLevel2Next = () => {
    if (level2Index + 1 < detectiveQuestions.length) {
      setLevel2Index((prev) => prev + 1);
    } else {
      // Level 2 Complete! Unlock Level 3
      sounds.playFanfare();
      setLevelUnlockAlert({
        title: '⚡ LEVEL 3 UNLOCKED: RAPID DECISION!',
        description: 'How fast can you make the right GIS choice? Test your spatial referencing decisions under timed pressure.',
        instructions: [
          '1 — READ 👀: Take your time to understand the scenario (no timer rush).',
          '2 — READY 🎯: Click "I\'M READY" when you understand the situation.',
          '3 — DECIDE 🖱️: You have 5 seconds to click your answer with mouse or touch.',
          '🖐 Hand Control is paused for this round — tests GIS decision, not gesture speed!'
        ],
        targetStage: 'LEVEL_3',
        actionLabel: 'START RAPID CHALLENGE →'
      });
    }
  };

  // Level 3 Handlers
  const handleLevel3Answer = (isCorrect: boolean, points: number) => {
    if (isCorrect) {
      setStats((prev) => ({
        ...prev,
        score: prev.score + points,
        level3Correct: prev.level3Correct + 1,
      }));
    }
  };

  const handleLevel3NextItem = () => {
    if (level3Index + 1 < quickItems.length) {
      setLevel3Index((prev) => prev + 1);
    } else {
      handleCompleteGame();
    }
  };

  const handleCompleteGame = () => {
    sounds.playFanfare();
    setCurrentStage('SUMMARY');
  };

  // Calculate top bar metrics
  const levelNumber = currentStage === 'LEVEL_1' ? 1 : currentStage === 'LEVEL_2' ? 2 : 3;
  const currentQuestionIdx = currentStage === 'LEVEL_1' ? level1Index : currentStage === 'LEVEL_2' ? level2Index : level3Index;
  const totalQuestions = currentStage === 'LEVEL_1' ? scenarios.length : currentStage === 'LEVEL_2' ? detectiveQuestions.length : quickItems.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      
      {/* Top Status HUD */}
      <Header
        currentStage={currentStage}
        levelNumber={levelNumber}
        questionIndex={currentQuestionIdx}
        totalQuestions={totalQuestions}
        score={stats.score}
        lives={stats.lives}
        trackingStatus={trackingStatus}
        isMouseFallback={isMouseFallback}
        onToggleFallback={handleToggleFallback}
        onRestart={handleRestart}
        isMuted={isMuted}
        onToggleMute={() => setIsMuted(!isMuted)}
        showPip={showPip}
        onTogglePip={() => setShowPip(!showPip)}
        onSelectStage={(stage) => setCurrentStage(stage)}
        onOpenLearnMore={() => setIsLearnMoreOpen(true)}
      />

      {/* Main Game Stage Router */}
      <main className="flex-1 relative flex flex-col">
        {currentStage === 'INTRO' && (
          <IntroScreen
            onStartWithHand={handleStartWithHand}
            onStartWithMouse={handleStartWithMouse}
            onOpenLearnMore={() => setIsLearnMoreOpen(true)}
          />
        )}

        {currentStage === 'CALIBRATION' && (
          <CalibrationModal
            trackingStatus={trackingStatus}
            calibration={calibration}
            isMouseFallback={isMouseFallback}
            onComplete={handleCalibrationComplete}
            onSwitchToMouse={handleStartWithMouse}
            onStartCamera={startCamera}
            cameraError={cameraError}
            cursor={cursor}
            gestureState={gestureState}
          />
        )}

        {currentStage === 'LEVEL_1' && (
          <Level1Sorting
            scenarios={scenarios}
            currentIndex={level1Index}
            cursor={cursor}
            gestureState={gestureState}
            onCorrectAnswer={handleLevel1Correct}
            onWrongAnswer={handleLevel1Wrong}
            onNextQuestion={handleLevel1Next}
            isMouseFallback={isMouseFallback}
            score={stats.score}
          />
        )}

        {currentStage === 'LEVEL_2' && (
          <Level2Detective
            questions={detectiveQuestions}
            currentIndex={level2Index}
            cursor={cursor}
            gestureState={gestureState}
            onCorrectAnswer={handleLevel2Correct}
            onWrongAnswer={handleLevel2Wrong}
            onNextQuestion={handleLevel2Next}
            isMouseFallback={isMouseFallback}
          />
        )}

        {currentStage === 'LEVEL_3' && (
          <Level3QuickDecision
            items={quickItems}
            currentIndex={level3Index}
            cursor={cursor}
            gestureState={gestureState}
            onAnswer={handleLevel3Answer}
            onNextQuestion={handleLevel3NextItem}
            isMouseFallback={isMouseFallback}
          />
        )}

        {currentStage === 'SUMMARY' && (
          <GameOverSummary
            stats={stats}
            onRestart={handleRestart}
          />
        )}

        {/* Level Unlock Splash Overlay with Step-by-Step Instructions */}
        {levelUnlockAlert && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
            <div className="max-w-lg w-full bg-slate-900 border-2 border-amber-400 rounded-3xl p-6 md:p-8 text-center shadow-2xl animate-in zoom-in-95 duration-200">
              <span className="text-4xl block mb-2">🔓</span>
              <h3 className="text-xl md:text-2xl font-black text-white mb-2">
                {levelUnlockAlert.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                {levelUnlockAlert.description}
              </p>

              {/* Step by step guidance checklist */}
              <div className="text-left bg-slate-950/80 p-4 rounded-2xl border border-slate-800 mb-6 space-y-2 text-xs text-slate-200">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider block mb-1">
                  MISSION BRIEFING INSTRUCTIONS:
                </span>
                {levelUnlockAlert.instructions.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  const target = levelUnlockAlert.targetStage;
                  setLevelUnlockAlert(null);
                  setCurrentStage(target);
                  sounds.playCorrect();
                }}
                className="w-full py-3 px-6 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-400/25 transition-all scale-100 hover:scale-102"
              >
                {levelUnlockAlert.actionLabel}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Hand Reticle Cursor (Active for Level 1 & 2; Paused for Level 3 Rapid Mouse/Touch Round) */}
      {currentStage !== 'LEVEL_3' && (
        <HandCursor
          cursor={cursor}
          gestureState={gestureState}
          trackingStatus={trackingStatus}
        />
      )}

      {/* PIP Video / Hand Radar Canvas in corner */}
      <WebcamPip
        canvasRef={canvasRef}
        trackingStatus={trackingStatus}
        showPip={showPip}
        onTogglePip={() => setShowPip(!showPip)}
        isMouseFallback={isMouseFallback}
        onSwitchToMouse={enableMouseFallback}
      />

      {/* GIS Field Guide Modal */}
      <LearnMoreModal
        isOpen={isLearnMoreOpen}
        onClose={() => setIsLearnMoreOpen(false)}
      />

    </div>
  );
}
