import React from 'react';
import { Incident } from '../types';
import { X, ShieldAlert, Award, Info, AlertTriangle, Layers } from 'lucide-react';

interface Props {
  incident: Incident | null;
  onClose: () => void;
}

export const PriorityExplanationModal: React.FC<Props> = ({ incident, onClose }) => {
  if (!incident) return null;

  const pb = incident.priority_breakdown || {
    severity_pts: 25,
    traffic_pts: 20,
    proximity_pts: 20,
    repeated_complaints_pts: 15,
    damage_size_pts: 8,
    risk_trend_pts: 6,
    total_score: incident.priority_score,
    explanation: "Priority calculated via CivicVision AI Rules Engine."
  };

  const factors = [
    { title: 'AI Detected Severity', pts: pb.severity_pts, max: 25, color: 'bg-red-500', desc: `Base AI severity classification: ${incident.severity}` },
    { title: 'Traffic Corridor Intensity', pts: pb.traffic_pts, max: 20, color: 'bg-amber-500', desc: `Arterial road traffic volume & speed index on ${incident.address}` },
    { title: 'Proximity to Schools/Hospitals', pts: pb.proximity_pts, max: 20, color: 'bg-blue-500', desc: 'Located within 300m of high-pedestrian public sensitivity zone' },
    { title: 'Citizen Complaint Frequency', pts: pb.repeated_complaints_pts, max: 15, color: 'bg-purple-500', desc: `${incident.duplicate_count} citizen reports linked to this master incident` },
    { title: 'Damage Affected Area', pts: pb.damage_size_pts, max: 8, color: 'bg-cyan-500', desc: `Estimated surface defect footprint: ${incident.estimated_area_m2} m²` },
    { title: 'Deterioration Speed Trend', pts: pb.risk_trend_pts, max: 6, color: 'bg-emerald-500', desc: 'Sub-base moisture penetration accelerating decay rate' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Why This Priority Score?</h2>
              <p className="text-xs text-slate-400 font-mono">Explainable AI Scoring Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          
          {/* Main Score Banner */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Master Priority Score</div>
              <div className="text-3xl font-extrabold text-amber-400 font-mono mt-0.5">
                {incident.priority_score} <span className="text-sm text-slate-500">/ 100</span>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="text-slate-300 font-semibold">{incident.report_code}</div>
              <div className="text-slate-500 text-[10px]">{incident.zone_name}</div>
            </div>
          </div>

          {/* Factor Breakdown Bars */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>SCORE BREAKDOWN BY FACTOR</span>
            </div>

            {factors.map((item, idx) => (
              <div key={idx} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-200">{item.title}</span>
                  <span className="font-mono font-bold text-white">
                    +{item.pts} <span className="text-[10px] text-slate-500">/ {item.max}</span>
                  </span>
                </div>
                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${(item.pts / item.max) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>

          {/* AI Explanation Text */}
          <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30 text-xs text-slate-300">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-cyan-400 font-bold mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>EXPLAINABILITY RATIONALE</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-300 font-mono">
              {pb.explanation}
            </p>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all"
        >
          Close Explanation
        </button>

      </div>
    </div>
  );
};
