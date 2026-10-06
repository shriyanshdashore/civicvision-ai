import React, { useState } from 'react';
import { X, Play, CheckCircle2, ChevronRight, ChevronLeft, Sparkles, Map, Wrench, ShieldCheck, DollarSign, TrendingUp } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onGoToStep: (stepKey: string) => void;
}

const STEPS = [
  {
    title: '1. Citizen Photo Upload & AI Detection',
    icon: Sparkles,
    desc: 'Citizen uploads road photo. CivicVision AI Computer Vision pre-processes image & identifies multiple anomaly bounding boxes (Pothole 96.4%, Road Crack 88.7%).'
  },
  {
    title: '2. Explainable Priority Scoring (0-100)',
    icon: Sparkles,
    desc: 'Priority Engine computes explainable 94/100 score factoring severity (+25), traffic (+20), proximity to schools (+20), and duplicate complaint frequency (+15).'
  },
  {
    title: '3. GIS Radar & Hotspot Clustering',
    icon: Map,
    desc: 'Incident automatically maps on GIS Radar. DBSCAN algorithm aggregates nearby defects into HOTSPOT #01 (17 incidents within 500m radius).'
  },
  {
    title: '4. Predictive Risk & What-If Simulation',
    icon: TrendingUp,
    desc: 'What-If Engine models pavement deterioration 30/60/90 days out vs projected health recovery when top 5 sites are repaired.'
  },
  {
    title: '5. AI Maintenance Budget Optimizer',
    icon: DollarSign,
    desc: 'Municipal Director inputs available budget (₹10 Lakhs) to generate 3 Pareto-optimal capital allocation packages balancing critical arterials & public safety.'
  },
  {
    title: '6. Field Worker Task & Navigation',
    icon: Wrench,
    desc: 'Work order dispatched to field engineer mobile app with GPS navigation link and work instructions.'
  },
  {
    title: '7. AI Before/After Repair Verification',
    icon: ShieldCheck,
    desc: 'Field worker uploads after-repair photo. AI Computer Vision compares baseline pre-repair photo against resurfaced surface, returning REPAIR VERIFIED ✓.'
  }
];

export const DemoTourModal: React.FC<Props> = ({ isOpen, onClose, onGoToStep }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const current = STEPS[currentStep];
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Play className="w-4 h-4 fill-cyan-400 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hackathon Demo Mode Tour</h2>
              <p className="text-[10px] text-slate-400 font-mono">End-to-End Product Walkthrough ({currentStep + 1} of {STEPS.length})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Body */}
        <div className="py-6 space-y-4">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start gap-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-400 rounded-xl shrink-0">
              <Icon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-white">{current.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed font-mono">{current.desc}</p>
            </div>
          </div>

          {/* Progress dots */}
          <div className="flex justify-center gap-1.5">
            {STEPS.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentStep ? 'w-6 bg-cyan-400' : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-between gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 font-semibold text-xs rounded-xl flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </button>

          <button
            onClick={() => {
              if (currentStep < STEPS.length - 1) {
                setCurrentStep(currentStep + 1);
              } else {
                onClose();
              }
            }}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center gap-1"
          >
            <span>{currentStep === STEPS.length - 1 ? 'Finish Tour' : 'Next Step'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
