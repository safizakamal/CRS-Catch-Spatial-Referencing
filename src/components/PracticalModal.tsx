import React from 'react';
import { X, BookOpen, Layers, CheckCircle, ExternalLink, Compass } from 'lucide-react';

interface PracticalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PracticalModal: React.FC<PracticalModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="max-w-2xl w-full bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 relative my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-xl shrink-0">
            🧪
          </div>
          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
              COURSE GUIDE · WEEK 3
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Practical 03 — Investigating CRSs in QGIS
            </h2>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Congratulations! You have mastered the conceptual distinction between Geographic and Projected Coordinate Systems. Here is your practical checklist when opening QGIS this week:
        </p>

        {/* Practical Checklist Cards */}
        <div className="space-y-3.5 mb-6 text-xs text-slate-200">
          
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <h3 className="font-bold text-sky-400 flex items-center gap-2 mb-1">
              <span className="font-mono text-xs">01.</span>
              <span>Where to Check Layer CRS vs Project CRS</span>
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Right-click the layer in the Layers panel → <strong>Properties → Source</strong> to view the Layer CRS. 
              Look at the bottom-right corner of the QGIS status bar to see the active <strong>Project CRS</strong> (e.g. EPSG:4326 or EPSG:3857).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <h3 className="font-bold text-emerald-400 flex items-center gap-2 mb-1">
              <span className="font-mono text-xs">02.</span>
              <span>On-The-Fly (OTF) Transformation</span>
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              QGIS automatically re-projects layers dynamically for visualization on screen. Even if one shapefile uses WGS 84 and another uses UTM 48N, they will visually overlay if their CRS definitions are correctly recorded.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 mb-1">
              <span className="font-mono text-xs">03.</span>
              <span>Assigning CRS vs Exporting/Reprojecting</span>
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Never use <em>"Set Layer CRS"</em> to change coordinate numbers! Only use <em>"Set Layer CRS"</em> if QGIS misidentified an unknown file. To convert metres to degrees or reproject, right-click → <strong>Export → Save Features As…</strong> and choose the new target CRS.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <h3 className="font-bold text-indigo-400 flex items-center gap-2 mb-1">
              <span className="font-mono text-xs">04.</span>
              <span>Malaysia & Regional Study Area Context</span>
            </h3>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Peninsular Malaysia (including Melaka) commonly references:
              <br />
              • <strong>GCS:</strong> WGS 84 (EPSG:4326) or Kertau 1948 (EPSG:4245).
              <br />
              • <strong>PCS:</strong> WGS 84 / UTM Zone 48N (EPSG:32648) or Cassini-Soldner (Melaka local cadastral grid).
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-mono">
            Bachelor of Computer Science · GIS Lab
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Got it, Back to Mission
          </button>
        </div>

      </div>
    </div>
  );
};
