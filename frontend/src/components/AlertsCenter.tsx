import React from 'react';
import { Alert } from '../types';
import { Bell, ShieldAlert, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface Props {
  alerts: Alert[];
}

export const AlertsCenter: React.FC<Props> = ({ alerts }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span>Infrastructure Alerts & System Notifications</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">Real-time Anomaly Stream & Audit Events</p>
        </div>
        <span className="bg-cyan-500/20 text-cyan-400 text-xs font-mono px-3 py-1 rounded-full border border-cyan-500/30">
          {alerts.length} Active Notifications
        </span>
      </div>

      <div className="space-y-3">
        {alerts.map((al) => {
          let badgeColor = 'bg-red-500/20 text-red-400 border-red-500/30';
          if (al.severity === 'HIGH') badgeColor = 'bg-amber-500/20 text-amber-400 border-amber-500/30';
          if (al.severity === 'LOW') badgeColor = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';

          return (
            <div key={al.id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-start gap-3.5 shadow-lg">
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
                <ShieldAlert className="w-5 h-5 text-cyan-400" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{al.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badgeColor}`}>
                    {al.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-mono leading-relaxed">{al.message}</p>
                <div className="text-[10px] text-slate-500 font-mono flex items-center gap-3 pt-1">
                  <span>Zone: <strong className="text-slate-400">{al.zone || 'Citywide'}</strong></span>
                  <span>Time: {new Date(al.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
