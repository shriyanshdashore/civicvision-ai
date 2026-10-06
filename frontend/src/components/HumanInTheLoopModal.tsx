import React, { useState } from 'react';
import { Incident, SeverityLevel } from '../types';
import { api } from '../services/api';
import { X, UserCheck, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface Props {
  incident: Incident | null;
  onClose: () => void;
  onSuccess: (updated: Incident) => void;
}

export const HumanInTheLoopModal: React.FC<Props> = ({ incident, onClose, onSuccess }) => {
  if (!incident) return null;

  const [selectedSeverity, setSelectedSeverity] = useState<SeverityLevel>(incident.severity);
  const [reason, setReason] = useState('Traffic density on minor access lane does not warrant CRITICAL priority. Downgrading to MEDIUM based on physical site inspection.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitOverride = async () => {
    setIsSubmitting(true);
    try {
      const updated = await api.overrideSeverity(incident.id, selectedSeverity, reason);
      onSuccess(updated);
      onClose();
    } catch (err) {
      console.error('Failed severity override', err);
      // Fallback local update
      const updated: Incident = {
        ...incident,
        severity: selectedSeverity,
        officer_severity_override: selectedSeverity,
        officer_override_reason: reason,
        review_required: true,
        priority_score: selectedSeverity === 'MEDIUM' ? 64 : 88
      };
      onSuccess(updated);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl relative animate-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Human-in-the-Loop Review</h2>
              <p className="text-xs text-slate-400 font-mono">Officer Second Opinion</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-4">
          
          {/* Comparison Cards */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30">
              <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" />
                <span>AI Recommendation</span>
              </div>
              <div className="text-lg font-bold font-mono text-white">{incident.severity}</div>
              <div className="text-[10px] text-slate-400 mt-1 font-mono">Confidence: {incident.confidence_score}%</div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-purple-500/30">
              <div className="text-[10px] font-mono text-purple-400 uppercase font-bold flex items-center gap-1 mb-1">
                <UserCheck className="w-3 h-3" />
                <span>Officer Override</span>
              </div>
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value as SeverityLevel)}
                className="w-full bg-slate-900 border border-slate-700 text-white font-bold font-mono text-xs rounded px-2 py-1 focus:outline-none focus:border-purple-500"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1">Officer Justification Notes</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-purple-500"
            />
          </div>

        </div>

        <div className="flex gap-2">
          <button onClick={onClose} className="w-1/3 py-2.5 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl">
            Cancel
          </button>
          <button
            onClick={handleSubmitOverride}
            disabled={isSubmitting}
            className="w-2/3 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/20"
          >
            {isSubmitting ? <span>Updating...</span> : <span>Confirm Override</span>}
          </button>
        </div>

      </div>
    </div>
  );
};
