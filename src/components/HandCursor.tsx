import React from 'react';
import { CursorPosition, GestureState, TrackingStatus } from '../types/game';

interface HandCursorProps {
  cursor: CursorPosition;
  gestureState: GestureState;
  trackingStatus: TrackingStatus;
  isNearCard?: boolean;
  isHoldingCard?: boolean;
}

export const HandCursor: React.FC<HandCursorProps> = ({
  cursor,
  gestureState,
  trackingStatus,
  isNearCard = false,
  isHoldingCard = false,
}) => {
  // If mouse mode, hide the custom cursor only if user prefers native or render custom crosshair cursor
  const isPinching = cursor.isPinching || gestureState === 'GRABBED' || gestureState === 'PINCH_START';

  // Determine appearance
  let stateLabel = 'OPEN HAND';
  let ringColor = 'border-sky-400 text-sky-300';
  let glowEffect = 'shadow-[0_0_15px_rgba(56,189,248,0.5)]';
  let dotColor = 'bg-sky-400';

  if (isHoldingCard || gestureState === 'GRABBED') {
    stateLabel = '✊ GRABBED!';
    ringColor = 'border-emerald-400 text-emerald-300';
    glowEffect = 'shadow-[0_0_25px_rgba(52,211,153,0.8)] scale-110';
    dotColor = 'bg-emerald-400';
  } else if (isPinching) {
    stateLabel = '🤏 PINCHING';
    ringColor = 'border-amber-400 text-amber-300';
    glowEffect = 'shadow-[0_0_20px_rgba(251,191,36,0.7)]';
    dotColor = 'bg-amber-400';
  } else if (isNearCard) {
    stateLabel = '🟡 PINCH TO GRAB';
    ringColor = 'border-yellow-400 text-yellow-300';
    glowEffect = 'shadow-[0_0_20px_rgba(250,204,21,0.6)] animate-pulse';
    dotColor = 'bg-yellow-400';
  } else if (trackingStatus === 'NO_HAND') {
    stateLabel = '👋 SHOW HAND';
    ringColor = 'border-slate-500 text-slate-400';
    glowEffect = '';
    dotColor = 'bg-slate-400';
  }

  return (
    <div
      className="fixed top-0 left-0 pointer-events-none z-50 select-none will-change-transform"
      style={{
        transform: `translate3d(${cursor.x - 24}px, ${cursor.y - 24}px, 0)`,
      }}
    >
      {/* Outer Targeting Reticle */}
      <div
        className={`relative w-12 h-12 rounded-full border-2 border-dashed ${ringColor} ${glowEffect} flex items-center justify-center transition-colors duration-100`}
      >
        {/* Cardinal GIS Crosshair ticks */}
        <span className="absolute -top-1 w-0.5 h-2 bg-current" />
        <span className="absolute -bottom-1 w-0.5 h-2 bg-current" />
        <span className="absolute -left-1 w-2 h-0.5 bg-current" />
        <span className="absolute -right-1 w-2 h-0.5 bg-current" />

        {/* Center Target Point */}
        <div className={`w-3 h-3 rounded-full ${dotColor} transition-transform duration-100 ${isPinching ? 'scale-150' : 'scale-100'}`} />

        {/* Distance Arc indicator */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 48 48">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="125.6"
            strokeDashoffset={Math.min(125.6, Math.max(0, (cursor.pinchDistance / 0.15) * 125.6))}
            className="opacity-40 transition-all duration-75"
          />
        </svg>
      </div>

      {/* State badge floating tag */}
      <div className="absolute top-14 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider bg-slate-950/85 backdrop-blur-md border border-slate-700/70 shadow-lg text-slate-200 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span>{stateLabel}</span>
      </div>
    </div>
  );
};
