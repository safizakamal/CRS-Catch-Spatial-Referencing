import React, { useState, useEffect } from 'react';
import { GameStage, TrackingStatus } from '../types/game';
import { Volume2, VolumeX, Camera, MousePointer, RotateCcw, Video, BookOpen, ExternalLink } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface HeaderProps {
  currentStage: GameStage;
  levelNumber: number;
  questionIndex: number;
  totalQuestions: number;
  score: number;
  lives: number;
  trackingStatus: TrackingStatus;
  isMouseFallback: boolean;
  onToggleFallback: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  showPip: boolean;
  onTogglePip: () => void;
  onSelectStage?: (stage: GameStage) => void;
  onOpenLearnMore?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStage,
  levelNumber,
  questionIndex,
  totalQuestions,
  score,
  lives,
  trackingStatus,
  isMouseFallback,
  onToggleFallback,
  onRestart,
  isMuted,
  onToggleMute,
  showPip,
  onTogglePip,
  onSelectStage,
  onOpenLearnMore,
}) => {
  const [isInIframe, setIsInIframe] = useState<boolean>(false);

  useEffect(() => {
    try {
      setIsInIframe(window.self !== window.top);
    } catch {
      setIsInIframe(true);
    }
  }, []);

  const handleOpenInNewTab = () => {
    try {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    } catch {
      // fallback
    }
  };
  // Determine camera status indicator
  let statusBadge = {
    color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    dot: 'bg-emerald-400',
    text: 'Hand detected',
  };

  if (isMouseFallback) {
    statusBadge = {
      color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      dot: 'bg-amber-400',
      text: 'Mouse / Touch active',
    };
  } else if (trackingStatus === 'INITIALIZING') {
    statusBadge = {
      color: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      dot: 'bg-sky-400 animate-pulse',
      text: 'Starting camera...',
    };
  } else if (trackingStatus === 'NO_HAND') {
    statusBadge = {
      color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
      dot: 'bg-yellow-400',
      text: 'Show your hand 👋',
    };
  } else if (trackingStatus === 'PINCHING') {
    statusBadge = {
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
      dot: 'bg-cyan-400',
      text: 'Pinch active',
    };
  } else if (trackingStatus === 'ERROR') {
    statusBadge = {
      color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
      dot: 'bg-rose-400',
      text: 'Camera unavailable',
    };
  }

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border-b border-slate-800/80 px-4 lg:px-8 py-2.5 z-40 sticky top-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 lg:gap-8">
        
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center shadow-md shadow-sky-500/20 text-base">
            🌍
          </div>
          <div className="leading-tight">
            <h1 className="text-base font-extrabold tracking-tight text-white whitespace-nowrap">
              CRS CATCH!
            </h1>
            <p className="text-[11px] font-medium text-slate-400 whitespace-nowrap hidden sm:block">
              Week 3 · LOCATE: Spatial Referencing
            </p>
          </div>
        </div>

        {/* Zone 2: Mission Telemetry & Status HUD */}
        {currentStage !== 'INTRO' && currentStage !== 'CALIBRATION' && currentStage !== 'SUMMARY' && (
          <div className="flex items-center gap-3 md:gap-5 text-xs text-slate-300 font-mono">
            {/* Level indicator / Quick Selector */}
            {onSelectStage ? (
              <div className="flex items-center gap-1 bg-slate-950/70 p-1 rounded-lg border border-slate-800">
                <button
                  onClick={() => onSelectStage('LEVEL_1')}
                  className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold transition-all ${
                    currentStage === 'LEVEL_1'
                      ? 'bg-sky-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Level 1: GCS vs PCS Sorting"
                >
                  L1: Sort
                </button>
                <button
                  onClick={() => onSelectStage('LEVEL_2')}
                  className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold transition-all ${
                    currentStage === 'LEVEL_2'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Level 2: CRS Detective"
                >
                  L2: Detective
                </button>
                <button
                  onClick={() => onSelectStage('LEVEL_3')}
                  className={`px-2 py-0.5 rounded text-[11px] font-sans font-bold transition-all ${
                    currentStage === 'LEVEL_3'
                      ? 'bg-emerald-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Level 3: Quick Decision"
                >
                  L3: Rapid
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 whitespace-nowrap">
                <span className="text-slate-400 font-sans">Level:</span>
                <span className="font-bold text-sky-400 tabular-nums">{levelNumber}/3</span>
              </div>
            )}

            <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

            {/* Score */}
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-400 font-sans">Score:</span>
              <span className="font-bold text-emerald-400 tabular-nums">{score}</span>
            </div>

            <span className="text-slate-700 hidden md:inline" aria-hidden="true">|</span>

            {/* Question Progress */}
            <div className="hidden md:flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-slate-400 font-sans">Question:</span>
              <span className="font-bold text-slate-200 tabular-nums">{questionIndex + 1}/{totalQuestions}</span>
            </div>

            <span className="text-slate-700 hidden sm:inline" aria-hidden="true">|</span>

            {/* Lives */}
            <div className="flex items-center gap-0.5 tracking-tighter" title={`${lives} attempts remaining`}>
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className={`text-sm transition-opacity ${i < lives ? 'opacity-100 scale-100' : 'opacity-25 grayscale'}`}
                >
                  ❤️
                </span>
              ))}
            </div>

            {/* Hand Status Tag */}
            <div className={`hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-md border text-[11px] font-sans font-medium whitespace-nowrap ${statusBadge.color}`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.text}</span>
            </div>
          </div>
        )}

        {/* Zone 3: Interactive Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Camera / Mouse Mode Toggle */}
          <button
            onClick={onToggleFallback}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
              isMouseFallback
                ? 'bg-amber-500/15 border-amber-500/40 text-amber-200 hover:bg-amber-500/25'
                : 'bg-sky-500/15 border-sky-500/40 text-sky-200 hover:bg-sky-500/25'
            }`}
            title={isMouseFallback ? 'Switch to Webcam Hand Tracking' : 'Switch to Mouse/Touch drag'}
          >
            {isMouseFallback ? (
              <>
                <MousePointer className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">Mouse Mode</span>
              </>
            ) : (
              <>
                <Camera className="w-3.5 h-3.5 text-sky-300" />
                <span className="hidden sm:inline">Hand Tracking</span>
              </>
            )}
          </button>

          {/* Toggle PIP Webcam window */}
          {!isMouseFallback && (
            <button
              onClick={onTogglePip}
              className={`p-1.5 text-xs rounded-lg border transition-colors ${
                showPip
                  ? 'bg-slate-800 text-sky-300 border-slate-700'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
              title={showPip ? 'Hide Webcam Preview' : 'Show Webcam Preview'}
            >
              <Video className="w-4 h-4" />
            </button>
          )}

          {/* Learn More Field Guide */}
          {onOpenLearnMore && (
            <button
              onClick={() => {
                sounds.playHover();
                onOpenLearnMore();
              }}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-sky-300 hover:text-white transition-colors flex items-center gap-1.5"
              title="Open GIS Coordinate Systems Knowledge Base"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Learn More</span>
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sounds.isMuted = !isMuted;
              onToggleMute();
            }}
            className="p-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title={isMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Open in New Tab (Moodle / Iframe helper) */}
          <button
            onClick={handleOpenInNewTab}
            className="p-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Open Game in New Tab (Full Window)"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          {/* Reset / Restart */}
          <button
            onClick={onRestart}
            className="p-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Restart Session"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
