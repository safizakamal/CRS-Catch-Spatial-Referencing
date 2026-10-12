import React, { useState } from 'react';
import { X, BookOpen, Globe, Ruler, AlertTriangle, Layers, Compass, CheckCircle2, ChevronRight } from 'lucide-react';

interface LearnMoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTopic?: string;
}

export const LearnMoreModal: React.FC<LearnMoreModalProps> = ({
  isOpen,
  onClose,
  initialTopic = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTopic);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-5 sm:p-7 relative my-6 text-slate-200 flex flex-col max-h-[90vh]">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
          title="Close Guide"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-emerald-400 text-slate-950 flex items-center justify-center text-xl font-bold shrink-0 shadow-lg shadow-sky-500/20">
            📖
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-widest block">
              SPATIAL REFERENCING FIELD GUIDE · WEEK 3
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              GIS Coordinate Systems Knowledge Base
            </h2>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-800 shrink-0 text-xs font-mono">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-sky-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>GCS vs PCS Rule</span>
          </button>

          <button
            onClick={() => setActiveTab('otf')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'otf'
                ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>On-The-Fly (OTF) Alignment</span>
          </button>

          <button
            onClick={() => setActiveTab('diagnostic')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'diagnostic'
                ? 'bg-amber-400 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>5-Step Diagnostic Protocol</span>
          </button>

          <button
            onClick={() => setActiveTab('melaka')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'melaka'
                ? 'bg-indigo-400 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Melaka & Malaysia Reference</span>
          </button>
        </div>

        {/* Scrollable Tab Content Body */}
        <div className="overflow-y-auto py-4 space-y-4 pr-1 text-xs leading-relaxed">
          
          {/* TAB 1: OVERVIEW GCS VS PCS */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/30">
                <h3 className="font-bold text-sky-400 text-sm flex items-center gap-2 mb-1.5">
                  <Globe className="w-4 h-4 text-sky-400" />
                  <span>Geographic Coordinate System (GCS)</span>
                </h3>
                <p className="text-slate-300 mb-2">
                  A GCS identifies positions on a curved three-dimensional Earth model (an ellipsoid) using spherical angles.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-200">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">COORDINATES</span>
                    <strong className="text-sky-300">Latitude / Longitude</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">UNITS</span>
                    <strong className="text-sky-300">Degrees (°), Decimals</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">SURFACE</span>
                    <strong className="text-sky-300">Curved Ellipsoid</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">STANDARD</span>
                    <strong className="text-sky-300">WGS 84 (EPSG:4326)</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30">
                <h3 className="font-bold text-emerald-400 text-sm flex items-center gap-2 mb-1.5">
                  <Ruler className="w-4 h-4 text-emerald-400" />
                  <span>Projected Coordinate System (PCS)</span>
                </h3>
                <p className="text-slate-300 mb-2">
                  A PCS projects curved 3D coordinates onto a flat two-dimensional plane using mathematical projection formulas. This allows accurate planar measurements.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-slate-200">
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">COORDINATES</span>
                    <strong className="text-emerald-300">Easting (X), Northing (Y)</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">UNITS</span>
                    <strong className="text-emerald-300">Metres (m), Feet</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">SURFACE</span>
                    <strong className="text-emerald-300">Flat 2D Plane</strong>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-500 block text-[9px]">EXAMPLES</span>
                    <strong className="text-emerald-300">UTM Zone 48N, Cassini</strong>
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <span className="font-mono font-bold text-[10px] tracking-wider text-amber-400 block mb-1">
                  ⚡ GOLDEN PEDAGOGICAL RULE
                </span>
                <p>
                  <strong>Never calculate metres or areas directly from angular degrees!</strong> Degrees do not represent constant distance across latitudes (1 degree of longitude is ~111 km at the Equator, but shrinks to 0 km at the North Pole). Always project data into a PCS before measuring distances, perimeters, or polygon areas.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: ON-THE-FLY (OTF) PROJECTION */}
          {activeTab === 'otf' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h3 className="font-bold text-white text-sm mb-1.5">
                  How GIS Displays Different CRSs Together
                </h3>
                <p className="text-slate-300 mb-3">
                  Beginners often believe that if Layer A is in WGS 84 (degrees) and Layer B is in UTM Zone 48N (metres), they will not overlay on screen. <strong>This is a misconception!</strong>
                </p>
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 mb-3">
                  <strong className="block mb-1">On-The-Fly (OTF) Coordinate Transformation:</strong>
                  Modern GIS software (QGIS and ArcGIS) reads each layer's spatial metadata and automatically converts coordinates into the <strong>Project CRS</strong> in computer memory during screen rendering.
                </div>
                <div className="space-y-2 text-slate-300 text-[11px]">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Raw files on your storage drive are <strong>NOT altered</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Both layers align visually on the map canvas as long as each layer knows its genuine CRS.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong>When to permanently reproject?</strong> When running spatial analyses, geoprocessing tools (e.g. Buffers, Intersects), or calculating geometry attributes in metres.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DIAGNOSTIC PROTOCOL */}
          {activeTab === 'diagnostic' && (
            <div className="space-y-3 animate-in fade-in duration-150">
              <p className="text-slate-300">
                When a layer appears in the wrong place or fails to overlay, follow this 5-step diagnostic sequence:
              </p>

              <div className="space-y-2 font-mono text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-sky-500/30 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">1</span>
                  <div>
                    <strong className="text-sky-300 block font-sans text-xs">WHERE? (Study Area)</strong>
                    <span className="text-slate-300 font-sans text-[11px]">Where in the real world does this dataset belong? Local campus, city, or continent?</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-sky-500/30 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">2</span>
                  <div>
                    <strong className="text-sky-300 block font-sans text-xs">COORDINATES? (Value Magnitude)</strong>
                    <span className="text-slate-300 font-sans text-[11px]">Inspect raw values. Small numbers (e.g. 2.30, 102.30) mean degrees. Large numbers (250,000+) mean metres!</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-sky-500/30 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold shrink-0">3</span>
                  <div>
                    <strong className="text-sky-300 block font-sans text-xs">UNITS? (Measurement Type)</strong>
                    <span className="text-slate-300 font-sans text-[11px]">Are units angular (degrees, minutes) or linear (metres, international feet)?</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold shrink-0">4</span>
                  <div>
                    <strong className="text-emerald-300 block font-sans text-xs">CRS? (Spatial Reference)</strong>
                    <span className="text-slate-300 font-sans text-[11px]">Does the assigned CRS definition match the numbers? Look for datum and projection authority (EPSG code).</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950 border border-amber-500/30 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold shrink-0">5</span>
                  <div>
                    <strong className="text-amber-300 block font-sans text-xs">PURPOSE? (Operational Goal)</strong>
                    <span className="text-slate-300 font-sans text-[11px]">Is this for web basemap display, engineering distance, or zoning area measurement? Reproject if required.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: MELAKA & MALAYSIA */}
          {activeTab === 'melaka' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                <h3 className="font-bold text-white text-sm mb-2 flex items-center gap-2">
                  <span>🇲🇾 Peninsular Malaysia & Melaka Case Study</span>
                </h3>
                <p className="text-slate-300 mb-3">
                  For your Computer Science GIS coursework, you will frequently encounter these coordinate reference systems:
                </p>

                <div className="space-y-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-sky-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-sky-300 font-bold">WGS 84 (EPSG:4326)</strong>
                      <span className="text-sky-400 font-mono text-[10px] bg-sky-500/10 px-2 py-0.5 rounded">GCS</span>
                    </div>
                    <p className="text-slate-300">
                      Standard GPS satellite coordinates. Melaka center is approximately <strong>2.30° N, 102.30° E</strong> (or 2.19° N, 102.25° E).
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-emerald-300 font-bold">WGS 84 / UTM Zone 48N (EPSG:32648)</strong>
                      <span className="text-emerald-400 font-mono text-[10px] bg-emerald-500/10 px-2 py-0.5 rounded">PCS</span>
                    </div>
                    <p className="text-slate-300">
                      Standard metric projection for Peninsular Malaysia and Singapore. Linear units in <strong>metres</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-amber-300 font-bold">Melaka Cassini-Soldner Grid</strong>
                      <span className="text-amber-400 font-mono text-[10px] bg-amber-500/10 px-2 py-0.5 rounded">PCS</span>
                    </div>
                    <p className="text-slate-300">
                      Cadastral land surveying coordinate system managed by JUPEM (Jabatan Ukur dan Pemetaan Malaysia) for land parcel boundaries in Melaka.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
          <span className="text-[11px] font-mono text-slate-500">
            CRS CATCH! · Bachelor of Computer Science
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Got it, Continue Playing
          </button>
        </div>

      </div>
    </div>
  );
};
