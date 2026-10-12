import React, { useState } from 'react';
import { GameStats } from '../types/game';
import { CheckCircle2, RotateCcw, Award, ArrowRight, BookOpen } from 'lucide-react';
import { PracticalModal } from './PracticalModal';
import { sounds } from '../services/soundEffects';

interface GameOverSummaryProps {
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverSummary: React.FC<GameOverSummaryProps> = ({ stats, onRestart }) => {
  const [showPractical, setShowPractical] = useState(false);

  // Total possible points: Level 1 (100) + Level 2 (75) + Level 3 (100-150) = ~275 max
  const maxPossible = 100 + 75 + 100;
  const scorePercent = Math.min(100, Math.round((stats.score / maxPossible) * 100));

  return (
    <div className="relative w-full h-[calc(100vh-65px)] min-h-[580px] flex items-center justify-center p-4 md:p-6 overflow-y-auto select-none">
      
      {/* Background Graticules */}
      <div className="absolute inset-0 bg-gis-crosshair opacity-30 pointer-events-none" />

      <div className="relative z-10 max-w-2xl w-full bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 backdrop-blur-xl my-auto">
        
        {/* Top Trophy Banner */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-emerald-400 mx-auto flex items-center justify-center text-3xl shadow-xl shadow-sky-500/20 mb-3 animate-bounce">
            🎉
          </div>
          <span className="text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase">
            CHALLENGE DEBRIEFING
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
            CRS Challenge Complete!
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Week 3 — LOCATE: Spatial Referencing Mastery
          </p>
        </div>

        {/* Score Card */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
            <div>
              <span className="text-xs text-slate-400 font-mono">TOTAL SCORE EARNED:</span>
              <div className="text-3xl font-black text-white mt-0.5">
                <span className="text-emerald-400 tabular-nums">{stats.score}</span>
                <span className="text-slate-500 text-lg font-normal"> / {maxPossible}</span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 font-mono">ACCURACY INDEX:</span>
              <div className="text-2xl font-extrabold text-sky-400 tabular-nums mt-0.5">
                {scorePercent}%
              </div>
            </div>
          </div>

          {/* Level Breakdown Pills */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
            <div className="p-2 rounded-xl bg-slate-900 border border-sky-500/20">
              <span className="text-[10px] text-slate-400 block">LEVEL 1 SORT</span>
              <strong className="text-sky-300 text-sm">{stats.level1Correct} / 10</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-amber-500/20">
              <span className="text-[10px] text-slate-400 block">L2 DETECTIVE</span>
              <strong className="text-amber-300 text-sm">{stats.level2Correct} / 5</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-900 border border-emerald-500/20">
              <span className="text-[10px] text-slate-400 block">L3 RAPID</span>
              <strong className="text-emerald-300 text-sm">{stats.level3Correct} / 10</strong>
            </div>
          </div>
        </div>

        {/* Week 3 Journey Flow */}
        <div className="mb-6 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-center">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">
            WEEK 3 SPATIAL LITERACY JOURNEY
          </span>
          <div className="flex items-center justify-center gap-2 sm:gap-4 font-mono text-xs font-bold">
            <span className="text-emerald-400 flex items-center gap-1">
              THINK <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400 flex items-center gap-1">
              REPRESENT <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400 flex items-center gap-1">
              LOCATE <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Learning Achievements Checklist */}
        <div className="mb-6">
          <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-2">
            <Award className="w-4 h-4 text-sky-400" />
            <span>Learning Achievements Verified:</span>
          </h3>

          <div className="space-y-2 text-xs text-slate-200">
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>I can recognise Geographic Coordinate Systems (GCS).</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>I can recognise Projected Coordinate Systems (PCS).</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>I can use coordinate units (degrees vs. metres) as diagnostic clues.</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>I can choose a coordinate system based on purpose and study area.</span>
            </div>
            <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-950/40 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>I know what to investigate when a GIS layer appears in the wrong location.</span>
            </div>
          </div>
        </div>

        {/* Final Message */}
        <div className="mb-6 text-center p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-200 text-xs leading-relaxed">
          “You are now ready to investigate coordinate systems in QGIS.”
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={() => {
              sounds.playHover();
              onRestart();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              sounds.playCorrect();
              setShowPractical(true);
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>🧪 GO TO PRACTICAL 03</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Practical Guide Modal */}
      <PracticalModal
        isOpen={showPractical}
        onClose={() => setShowPractical(false)}
      />

    </div>
  );
};
