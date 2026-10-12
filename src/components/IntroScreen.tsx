import React from 'react';
import { Camera, MousePointer, ArrowRight, Compass, Globe, Ruler, BookOpen } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface IntroScreenProps {
  onStartWithHand: () => void;
  onStartWithMouse: () => void;
  onOpenLearnMore?: () => void;
}

export const IntroScreen: React.FC<IntroScreenProps> = ({
  onStartWithHand,
  onStartWithMouse,
  onOpenLearnMore,
}) => {
  return (
    <div className="relative w-full h-[calc(100vh-65px)] min-h-[580px] flex items-center justify-center p-4 md:p-6 overflow-y-auto select-none">
      
      {/* Background Graticules */}
      <div className="absolute inset-0 bg-gis-crosshair opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-3xl w-full bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl my-auto">
        
        {/* Course & Big Question Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-mono font-medium mb-3">
            <Compass className="w-3.5 h-3.5" />
            <span>BACHELOR OF COMPUTER SCIENCE · WEEK 3 — LOCATE</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            🌍 CRS CATCH!
          </h2>
          <p className="text-base sm:text-lg font-semibold text-sky-300 mt-1">
            “Choose the Right Coordinate System”
          </p>

          <div className="mt-3 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 max-w-lg mx-auto">
            <span className="text-[11px] font-mono text-amber-400 font-bold block mb-0.5">
              THE BIG QUESTION:
            </span>
            <p className="text-sm font-semibold text-slate-200">
              “How does GIS know exactly WHERE something is?”
            </p>
          </div>
        </div>

        {/* 2 Core Systems Comparison Quick Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          
          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm mb-1">
                <Globe className="w-4 h-4" />
                <span>🌐 GCS (Geographic)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                References positions on the curved 3D Earth ellipsoid using angular <strong>Latitude & Longitude</strong> in <strong>Degrees</strong> (e.g. WGS 84).
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-sky-400/80 bg-sky-500/10 px-2 py-1 rounded">
              UNITS: Angular Degrees (°)
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
                <Ruler className="w-4 h-4" />
                <span>📐 PCS (Projected)</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Flattens 3D coordinates onto a 2D plane for accurate local distance, perimeter, and area calculations in <strong>Metres</strong> (e.g. UTM 48N).
              </p>
            </div>
            <div className="mt-3 text-[10px] font-mono text-emerald-400/80 bg-emerald-500/10 px-2 py-1 rounded">
              UNITS: Linear Metres (m)
            </div>
          </div>

        </div>

        {/* 3 Levels Mission Roadmap */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-2.5">
            🗺️ YOUR 3-LEVEL LEARNING ROADMAP:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/20">
              <div className="flex items-center gap-1.5 font-bold text-sky-400 text-[11px] mb-1 font-mono">
                <span>01.</span>
                <span>GCS vs PCS SORTING</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Pinch & drag scenario cards into <strong>GCS</strong> (degrees) or <strong>PCS</strong> (metres).
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/20">
              <div className="flex items-center gap-1.5 font-bold text-amber-400 text-[11px] mb-1 font-mono">
                <span>02.</span>
                <span>CRS DETECTIVE</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                A layer appears misaligned or in another ocean. <strong>Diagnose the spatial cause</strong> first!
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20">
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 text-[11px] mb-1 font-mono">
                <span>03.</span>
                <span>5-SECOND RAPID</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Fast reflexes! Make instant spatial decisions under a 5-second timer for bonus points.
              </p>
            </div>
          </div>
        </div>

        {/* Gestures Guide */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 mb-6">
          <span className="text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider block mb-2">
            🖐️ INTERACTIVE HAND TRACKING GESTURES:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xl block mb-1">🖐</span>
              <span className="font-bold text-slate-200 block text-[11px]">MOVE</span>
              <span className="text-[10px] text-slate-400">Move cursor</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xl block mb-1">🤏</span>
              <span className="font-bold text-slate-200 block text-[11px]">PINCH</span>
              <span className="text-[10px] text-slate-400">Grab</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
              <span className="text-xl block mb-1">🖐</span>
              <span className="font-bold text-slate-200 block text-[11px]">RELEASE</span>
              <span className="text-[10px] text-slate-400">Drop</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900 border border-sky-500/30 bg-sky-950/20">
              <span className="text-xl block mb-1">👌</span>
              <span className="font-bold text-sky-300 block text-[11px]">PINCH & HOLD</span>
              <span className="text-[10px] text-sky-400/80">Continue</span>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                sounds.playHover();
                onStartWithMouse();
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <MousePointer className="w-4 h-4 text-amber-400" />
              <span>Mouse / Touch Mode</span>
            </button>

            {onOpenLearnMore && (
              <button
                onClick={() => {
                  sounds.playHover();
                  onOpenLearnMore();
                }}
                className="px-3.5 py-2.5 rounded-xl border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                title="Read GIS Field Guide"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Field Guide</span>
              </button>
            )}
          </div>

          <button
            onClick={() => {
              sounds.playGrab();
              onStartWithHand();
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-sky-500/25 transition-all"
          >
            <Camera className="w-4 h-4" />
            <span>Calibrate Hand & Start Game</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
