import React from 'react';
import { 
  Building2, ShieldAlert, Sparkles, Map, ArrowRight, CheckCircle2, 
  TrendingUp, Wrench, Play 
} from 'lucide-react';

interface Props {
  onExploreMap: () => void;
  onReportIssue: () => void;
  onStartDemoTour: () => void;
}

export const LandingPage: React.FC<Props> = ({ onExploreMap, onReportIssue, onStartDemoTour }) => {
  return (
    <div className="space-y-16 pb-16 animate-in fade-in">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-800/80">
        
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-6 relative z-10 px-4">
          
          <div className="inline-flex items-center gap-2 bg-slate-900/90 border border-cyan-500/40 px-4 py-1.5 rounded-full text-xs font-semibold text-cyan-300 shadow-lg shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI-POWERED INDORE INFRASTRUCTURE COMMAND CENTER</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            See problems <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300 bg-clip-text text-transparent">
              before they become disasters.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-medium leading-relaxed">
            CivicVision AI combines computer vision anomaly detection, explainable priority scoring, 
            GIS hotspot clustering, and AI before/after repair verification for modern smart cities.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onExploreMap}
              className="px-6 py-3.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-xl shadow-cyan-500/25 transition-all flex items-center gap-2.5 active:scale-95"
            >
              <Map className="w-4.5 h-4.5" />
              <span>Explore Indore GIS Radar</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onReportIssue}
              className="px-6 py-3.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700 font-semibold text-sm rounded-xl transition-all flex items-center gap-2"
            >
              <span>Citizen Report Issue</span>
            </button>

            <button
              onClick={onStartDemoTour}
              className="px-6 py-3.5 bg-slate-900/90 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 font-semibold text-xs rounded-xl transition-all flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              <span>Watch Interactive Demo (3-5 min)</span>
            </button>
          </div>

        </div>

      </section>

      {/* CORE 4 PIPELINE STEPS */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/30">
            End-to-End Intelligence Lifecycle
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight pt-2">
            How CivicVision AI Transforms Infrastructure
          </h2>
          <p className="text-sm text-slate-400 font-medium max-w-xl mx-auto">
            From automated computer vision detection to AI-verified maintenance closure.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          <div className="glass-panel p-6 rounded-2xl space-y-3 relative text-left shadow-xl hover:border-cyan-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center justify-center font-extrabold text-sm">
              01
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">Multi-Issue AI Vision</h3>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              Detects potholes, cracked pavement, broken lighting & overflowing drains from a single photo with bounding boxes & confidence scores.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 relative text-left shadow-xl hover:border-amber-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 flex items-center justify-center font-extrabold text-sm">
              02
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">Explainable Priority</h3>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              Computes transparent 0-100 priority scores considering severity, traffic, proximity to schools, and citizen report frequency.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 relative text-left shadow-xl hover:border-purple-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 flex items-center justify-center font-extrabold text-sm">
              03
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">GIS Hotspot Radar</h3>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              Clusters defects spatially within 500m radius to identify critical risk zones automatically before severe decay spreads.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-3 relative text-left shadow-xl hover:border-emerald-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-extrabold text-sm">
              04
            </div>
            <h3 className="font-bold text-white text-base tracking-tight">AI Repair Verification</h3>
            <p className="text-xs text-slate-300 font-normal leading-relaxed">
              Compares baseline pre-repair photos with field worker post-repair photos to guarantee repair quality before closing.
            </p>
          </div>

        </div>
      </section>

      {/* FEATURE SHOWCASE CARDS */}
      <section className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="glass-panel p-7 rounded-3xl space-y-4 shadow-2xl hover:border-cyan-500/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/15 border border-cyan-500/30 rounded-xl text-cyan-300">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">What-If Risk & Deterioration Simulator</h3>
              <p className="text-xs text-slate-400 font-medium">Predictive Infrastructure Intelligence</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-normal leading-relaxed">
            Simulate the impact of delaying maintenance by 30, 60, or 90 days vs repairing top priority locations. Predict pavement health drops and budget escalation.
          </p>
          <button onClick={onExploreMap} className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1.5 pt-1">
            <span>Launch What-If Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="glass-panel p-7 rounded-3xl space-y-4 shadow-2xl hover:border-emerald-500/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">AI Maintenance Budget Optimizer</h3>
              <p className="text-xs text-slate-400 font-medium">Capital Allocation Engine</p>
            </div>
          </div>
          <p className="text-xs text-slate-300 font-normal leading-relaxed">
            Input available municipal budget (₹10 Lakhs - ₹50 Lakhs) to generate 3 Pareto-optimal allocation strategies balancing critical arterials with maximum public safety ROI.
          </p>
          <button onClick={onExploreMap} className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1.5 pt-1">
            <span>Open Budget Optimizer</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </section>

    </div>
  );
};
