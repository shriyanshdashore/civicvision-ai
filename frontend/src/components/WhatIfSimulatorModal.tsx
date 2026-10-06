import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { RiskSimulationResponse } from '../types';
import { X, TrendingUp, AlertTriangle, ShieldCheck, Play, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roadName?: string;
}

export const WhatIfSimulatorModal: React.FC<Props> = ({ isOpen, onClose, roadName = 'AB Road Corridor, Indore' }) => {
  const [daysDelay, setDaysDelay] = useState(30);
  const [repairTargetCount, setRepairTargetCount] = useState(0);
  const [simResult, setSimResult] = useState<RiskSimulationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) runSimulation();
  }, [isOpen, daysDelay, repairTargetCount]);

  const runSimulation = async () => {
    setIsLoading(true);
    try {
      const repairedIds = repairTargetCount > 0 ? Array.from({ length: repairTargetCount }, (_, i) => i + 1) : [];
      const res = await api.runRiskSimulation(daysDelay, roadName, repairedIds);
      setSimResult(res);
    } catch (err) {
      // Fallback local simulation math
      const baseHealth = 62;
      const decay = repairTargetCount > 0 ? 0 : Math.floor((daysDelay / 30) * 15);
      const gain = repairTargetCount > 0 ? repairTargetCount * 8 : 0;
      const projHealth = Math.min(100, Math.max(10, baseHealth - decay + gain));

      setSimResult({
        days_delay: daysDelay,
        current_health: baseHealth,
        projected_health: projHealth,
        expected_priority_change: repairTargetCount > 0 ? -(repairTargetCount * 10) : Math.floor((daysDelay / 30) * 18),
        hotspot_expansion_risk: daysDelay >= 60 ? 'CRITICAL (Spreading Risk)' : daysDelay >= 30 ? 'HIGH' : 'MODERATE',
        deterioration_summary: repairTargetCount > 0 
          ? `Executing target repairs across ${repairTargetCount} locations restores road pavement index by +${gain} pts.`
          : `Delaying maintenance by ${daysDelay} days allows asphalt stripping to worsen, dropping health from ${baseHealth}/100 to ${projHealth}/100.`,
        recommended_action: repairTargetCount > 0
          ? 'Dispatch repair crews immediately to secure predicted +24pt health recovery.'
          : 'Schedule resurfacing within 14 days to prevent sub-base collapse.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">What-If Risk & Deterioration Simulator</h2>
              <p className="text-xs text-slate-400 font-mono">Predictive Infrastructure Intelligence</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-5">
          
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div>
              <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                <span>Maintenance Delay:</span>
                <strong className="text-cyan-400 font-bold">{daysDelay} Days</strong>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="15"
                value={daysDelay}
                onChange={(e) => {
                  setDaysDelay(Number(e.target.value));
                  if (Number(e.target.value) > 0) setRepairTargetCount(0);
                }}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs text-slate-300 font-mono mb-1">
                <span>Action: Repair Top Locations:</span>
                <strong className="text-emerald-400 font-bold">{repairTargetCount} Sites</strong>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={repairTargetCount}
                onChange={(e) => {
                  setRepairTargetCount(Number(e.target.value));
                  if (Number(e.target.value) > 0) setDaysDelay(0);
                }}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Results Visual */}
          {simResult && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">CURRENT HEALTH</div>
                  <div className="text-2xl font-bold font-mono text-white mt-1">{simResult.current_health}/100</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/40">
                  <div className="text-[10px] font-mono text-cyan-400">PROJECTED HEALTH</div>
                  <div className={`text-2xl font-bold font-mono mt-1 ${simResult.projected_health >= simResult.current_health ? 'text-emerald-400' : 'text-red-400'}`}>
                    {simResult.projected_health}/100
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-400">PRIORITY DELTA</div>
                  <div className="text-2xl font-bold font-mono text-amber-400 mt-1">
                    {simResult.expected_priority_change > 0 ? `+${simResult.expected_priority_change}` : simResult.expected_priority_change}
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <span className="text-slate-400">HOTSPOT EXPANSION RISK:</span>
                  <span className="font-bold text-red-400">{simResult.hotspot_expansion_risk}</span>
                </div>
                <p className="text-slate-300 leading-relaxed font-mono text-[11px]">
                  {simResult.deterioration_summary}
                </p>
                <div className="pt-2 border-t border-slate-800 text-cyan-400 font-mono text-[11px] font-semibold">
                  💡 Recommendation: {simResult.recommended_action}
                </div>
              </div>
            </div>
          )}

        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl"
        >
          Close Simulator
        </button>

      </div>
    </div>
  );
};
