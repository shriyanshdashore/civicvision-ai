import React from 'react';
import { RoadHealth } from '../types';
import { X, Dna, ShieldAlert, Activity, Sparkles, AlertCircle } from 'lucide-react';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  road: RoadHealth | null;
  onClose: () => void;
}

export const InfrastructureDNAModal: React.FC<Props> = ({ road, onClose }) => {
  if (!road) return null;

  let dnaProfile: any = {};
  try {
    dnaProfile = JSON.parse(road.dna_profile_json);
  } catch (err) {
    dnaProfile = {
      vulnerabilities: ['Sub-base moisture erosion', 'Heavy bus traffic fatigue'],
      pothole_tendency: road.pothole_risk,
      flood_vulnerability: road.flood_risk,
      deterioration_speed: 'HIGH',
      recommended_fix: 'Mill & Overlay 50mm Asphalt'
    };
  }

  const radarData = [
    { subject: 'Pothole Risk', value: road.pothole_risk, fullMark: 100 },
    { subject: 'Flood Risk', value: road.flood_risk, fullMark: 100 },
    { subject: 'Traffic Stress', value: road.traffic_stress, fullMark: 100 },
    { subject: 'Complaint Freq', value: road.complaint_freq, fullMark: 100 },
    { subject: 'Repair History', value: road.repair_history, fullMark: 100 }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Infrastructure DNA Profile</h2>
              <p className="text-xs text-slate-400 font-mono">{road.road_name} ({road.zone_name})</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          
          {/* Main Score & Speed Banner */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono">
              <div className="text-[10px] text-slate-400">PAVEMENT HEALTH SCORE</div>
              <div className="text-3xl font-extrabold text-cyan-400 mt-0.5">{road.health_score} <span className="text-xs text-slate-500">/ 100</span></div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono">
              <div className="text-[10px] text-slate-400">DECAY VELOCITY</div>
              <div className="text-lg font-bold text-red-400 mt-1 uppercase">{dnaProfile.deterioration_speed || 'HIGH'}</div>
            </div>
          </div>

          {/* Radar Chart */}
          <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="Vulnerability" dataKey="value" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Key Vulnerabilities & Recommended Fix */}
          <div className="space-y-2 text-xs font-mono">
            <div className="text-slate-300 font-bold flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>PRIMARY VULNERABILITY DRIVERS</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(dnaProfile.vulnerabilities || ['Sub-base moisture penetration', 'Heavy axle load fatigue']).map((v: string, idx: number) => (
                <span key={idx} className="bg-slate-950 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 text-[11px]">
                  • {v}
                </span>
              ))}
            </div>

            <div className="pt-2 text-cyan-400 font-semibold text-[11px] bg-cyan-500/10 p-3 rounded-xl border border-cyan-500/30">
              🔧 Recommended Engineering Fix: <span className="text-white font-normal">{dnaProfile.recommended_fix || 'Mill & Overlay 50mm Asphalt'}</span>
            </div>
          </div>

        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
        >
          Close DNA Profile
        </button>

      </div>
    </div>
  );
};
