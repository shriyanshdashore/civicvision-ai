import React, { useState } from 'react';
import { Incident, Hotspot, RoadHealth, AnalyticsSummary } from '../types';
import { GISMap } from './GISMap';
import { AIBoundingBoxCanvas } from './AIBoundingBoxCanvas';
import { 
  Building2, ShieldAlert, Search, TrendingUp, Dna, Layers, ExternalLink 
} from 'lucide-react';

interface Props {
  incidents: Incident[];
  hotspots: Hotspot[];
  roadHealth: RoadHealth[];
  analytics: AnalyticsSummary;
  onSelectIncidentForPriority: (inc: Incident) => void;
  onSelectIncidentForOverride: (inc: Incident) => void;
  onOpenWhatIf: (roadName?: string) => void;
  onOpenBudget: () => void;
  onOpenDNA: (road: RoadHealth) => void;
  onAssignWorkOrder: (inc: Incident) => void;
  onRefreshData: () => void;
}

export const CommandCenterDashboard: React.FC<Props> = ({
  incidents,
  hotspots,
  roadHealth,
  analytics,
  onSelectIncidentForPriority,
  onSelectIncidentForOverride,
  onOpenWhatIf,
  onOpenDNA,
  onAssignWorkOrder
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(incidents[0] || null);

  const filteredIncidents = incidents.filter(inc => {
    const matchesSearch = 
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.report_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSev = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    return matchesSearch && matchesSev;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* TOP KPI STATS CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL INCIDENTS</div>
          <div className="text-2xl font-extrabold text-white mt-1">{analytics.total_incidents}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="text-[11px] font-bold text-red-400 uppercase tracking-wider">CRITICAL DEFECTS</div>
          <div className="text-2xl font-extrabold text-red-400 mt-1">{analytics.critical_incidents}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">HIGH PRIORITY</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{analytics.high_priority_incidents}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">IN PROGRESS</div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1">{analytics.in_progress_incidents}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">AI VERIFIED</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{analytics.resolved_incidents}</div>
        </div>

        <div className="glass-card p-4 rounded-2xl border border-slate-800/80 shadow-lg">
          <div className="text-[11px] font-bold text-purple-400 uppercase tracking-wider">HEALTH INDEX</div>
          <div className="text-2xl font-extrabold text-purple-400 mt-1">{analytics.overall_health_score}<span className="text-xs text-slate-400 font-normal">/100</span></div>
        </div>
      </div>

      {/* GIS MAP & HOTSPOTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main GIS Map (2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>INDORE LIVE GIS RADAR & RISK CLUSTERS</span>
            </div>
            <button
              onClick={() => onOpenWhatIf('AB Road Corridor, Indore')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Run What-If Risk Simulator</span>
            </button>
          </div>
          <GISMap
            incidents={filteredIncidents}
            hotspots={hotspots}
            onSelectIncident={(inc) => setSelectedIncident(inc)}
          />
        </div>

        {/* Hotspots & Health Metrics (1 col) */}
        <div className="space-y-4">
          
          {/* Infrastructure Hotspots Card */}
          <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>INDORE ACTIVE HOTSPOTS ({hotspots.length})</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {hotspots.map((hs) => (
                <div key={hs.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-red-400 text-xs">{hs.code}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-red-500/15 text-red-400 font-extrabold border border-red-500/30">
                      {hs.risk_level}
                    </span>
                  </div>
                  <div className="font-bold text-white text-xs">{hs.name}</div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{hs.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Road Health & Infrastructure DNA Card */}
          <div className="glass-panel rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                <Dna className="w-4 h-4" />
                <span>INFRASTRUCTURE DNA</span>
              </span>
            </div>

            <div className="space-y-2">
              {roadHealth.map((road) => (
                <div
                  key={road.id}
                  onClick={() => onOpenDNA(road)}
                  className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between cursor-pointer hover:border-purple-500/40 transition-all text-xs"
                >
                  <div>
                    <div className="font-bold text-white text-xs">{road.road_name}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{road.zone_name}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-cyan-400 text-sm">{road.health_score}/100</div>
                    <div className="text-[10px] text-purple-300 font-bold">View DNA Radar</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* MASTER PRIORITY QUEUE TABLE */}
      <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-2xl">
        
        {/* Controls Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Master Incident Priority Queue</span>
              <span className="bg-cyan-500/15 text-cyan-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                {filteredIncidents.length} Records
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Ranked by AI Priority Score & Risk Factors</p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search incident code, title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-cyan-500 font-medium"
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
            </select>
          </div>
        </div>

        {/* Incidents Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-slate-400 uppercase text-[11px] font-bold tracking-wider">
                <th className="py-3 px-3">Report Code</th>
                <th className="py-3 px-3">Title & Defect</th>
                <th className="py-3 px-3">Zone / Address</th>
                <th className="py-3 px-3">Severity</th>
                <th className="py-3 px-3 text-center">Priority Score</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredIncidents.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`hover:bg-slate-800/40 cursor-pointer transition-all ${
                    selectedIncident?.id === inc.id ? 'bg-cyan-500/10' : ''
                  }`}
                >
                  <td className="py-3.5 px-3 font-bold text-cyan-400 whitespace-nowrap text-xs">
                    {inc.report_code}
                    {inc.duplicate_count > 1 && (
                      <span className="ml-2 bg-purple-500/20 text-purple-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-purple-500/30">
                        x{inc.duplicate_count} Grouped
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white text-xs">{inc.title}</div>
                    <div className="text-[11px] text-slate-400 font-medium">{inc.primary_issue_type} ({inc.confidence_score}%)</div>
                  </td>
                  <td className="py-3.5 px-3 text-slate-300">
                    <div className="font-semibold text-slate-200">{inc.zone_name}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{inc.address}</div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      inc.severity === 'CRITICAL' ? 'bg-red-500/15 text-red-400 border border-red-500/30' :
                      inc.severity === 'HIGH' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      'bg-yellow-500/15 text-yellow-400 border border-yellow-500/30'
                    }`}>
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="font-extrabold text-sm text-amber-400">
                      {inc.priority_score}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {inc.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right space-x-1.5 whitespace-nowrap">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncidentForPriority(inc);
                      }}
                      className="px-2.5 py-1 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 font-semibold rounded-lg text-[11px] border border-amber-500/30 transition-all"
                    >
                      Why Priority?
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectIncidentForOverride(inc);
                      }}
                      className="px-2.5 py-1 bg-purple-500/15 hover:bg-purple-500/25 text-purple-300 font-semibold rounded-lg text-[11px] border border-purple-500/30 transition-all"
                    >
                      Human Override
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignWorkOrder(inc);
                      }}
                      className="px-2.5 py-1 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 font-semibold rounded-lg text-[11px] border border-cyan-500/30 transition-all"
                    >
                      Assign
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* SELECTED INCIDENT AI INSPECTION PREVIEW */}
      {selectedIncident && (
        <div className="glass-panel rounded-3xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-cyan-400">{selectedIncident.report_code}</span>
              <span className="font-bold text-white text-base">{selectedIncident.title}</span>
            </div>
            <span className="text-xs font-semibold text-slate-400">{selectedIncident.address}</span>
          </div>

          <AIBoundingBoxCanvas
            imageUrl={selectedIncident.image_url}
            detections={selectedIncident.detections}
          />
        </div>
      )}

    </div>
  );
};
