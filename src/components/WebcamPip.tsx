import React from 'react';
import { TrackingStatus } from '../types/game';
import { Eye, EyeOff, Maximize2 } from 'lucide-react';

interface WebcamPipProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  trackingStatus: TrackingStatus;
  showPip: boolean;
  onTogglePip: () => void;
  isMouseFallback: boolean;
  onSwitchToMouse: () => void;
}

export const WebcamPip: React.FC<WebcamPipProps> = ({
  canvasRef,
  trackingStatus,
  showPip,
  onTogglePip,
  isMouseFallback,
  onSwitchToMouse,
}) => {
  if (isMouseFallback) return null;

  if (!showPip) {
    return (
      <button
        onClick={onTogglePip}
        className="fixed bottom-4 right-4 z-40 bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700/80 px-3 py-1.5 rounded-lg text-xs font-mono shadow-xl flex items-center gap-2 backdrop-blur-md transition-all"
        title="Open Webcam Preview"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>Hand Radar</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Webcam Hand Radar"
      className="fixed bottom-4 right-4 z-40 w-48 sm:w-56 bg-slate-950/95 border border-slate-800/90 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md transition-all"
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-[11px] font-mono text-slate-300">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full ${
              trackingStatus === 'HAND_DETECTED' || trackingStatus === 'PINCHING'
                ? 'bg-emerald-400 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <span className="font-semibold text-slate-200">Hand Radar</span>
        </div>
        <button
          onClick={onTogglePip}
          className="text-slate-400 hover:text-white p-0.5 rounded transition-colors"
          title="Minimize PIP"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Video / Skeleton Canvas (Mirrored) */}
      <div className="relative aspect-4/3 bg-slate-950 flex items-center justify-center overflow-hidden">
        {/* Mirrored Canvas */}
        <canvas
          ref={canvasRef}
          width={280}
          height={210}
          className="w-full h-full object-cover scale-x-[-1] opacity-90"
        />

        {/* Overlay guides */}
        <div className="absolute inset-0 pointer-events-none border border-sky-500/10 flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-dashed border-sky-500/20" />
        </div>

        {/* Status prompt when no hand */}
        {trackingStatus === 'NO_HAND' && (
          <div className="absolute inset-0 bg-slate-950/75 flex flex-col items-center justify-center p-2 text-center text-xs">
            <span className="text-2xl mb-1 animate-bounce">👋</span>
            <p className="font-medium text-slate-200">Show hand to camera</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Keep index & thumb visible</p>
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-2 py-1 bg-slate-900/50 flex items-center justify-between text-[10px] text-slate-400">
        <span>☝ Tip: Point index finger</span>
        <button
          onClick={onSwitchToMouse}
          className="text-amber-400 hover:underline"
        >
          Use mouse
        </button>
      </div>
    </aside>
  );
};
