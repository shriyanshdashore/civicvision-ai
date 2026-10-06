import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { CommandCenterDashboard } from './components/CommandCenterDashboard';
import { GISMap } from './components/GISMap';
import { FieldWorkerApp } from './components/FieldWorkerApp';
import { CitizenReportModal } from './components/CitizenReportModal';
import { PriorityExplanationModal } from './components/PriorityExplanationModal';
import { HumanInTheLoopModal } from './components/HumanInTheLoopModal';
import { WhatIfSimulatorModal } from './components/WhatIfSimulatorModal';
import { BudgetOptimizerModal } from './components/BudgetOptimizerModal';
import { InfrastructureDNAModal } from './components/InfrastructureDNAModal';
import { DemoTourModal } from './components/DemoTourModal';
import { AlertsCenter } from './components/AlertsCenter';
import { api } from './services/api';
import { Incident, Hotspot, RoadHealth, AnalyticsSummary, Alert } from './types';

export const MainAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [roadHealth, setRoadHealth] = useState<RoadHealth[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>({
    total_incidents: 6,
    critical_incidents: 2,
    high_priority_incidents: 4,
    in_progress_incidents: 2,
    resolved_incidents: 1,
    avg_resolution_hours: 18.4,
    overall_health_score: 68,
    repair_verification_pass_rate: 95.8
  });

  // Modal states
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isWhatIfOpen, setIsWhatIfOpen] = useState(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [selectedPrioIncident, setSelectedPrioIncident] = useState<Incident | null>(null);
  const [selectedOverrideIncident, setSelectedOverrideIncident] = useState<Incident | null>(null);
  const [selectedDnaRoad, setSelectedDnaRoad] = useState<RoadHealth | null>(null);

  const loadData = async () => {
    try {
      const [incRes, hsRes, rhRes, anRes, alRes] = await Promise.all([
        api.getIncidents(),
        api.getHotspots(),
        api.getRoadHealth(),
        api.getAnalytics(),
        api.getAlerts()
      ]);
      setIncidents(incRes);
      setHotspots(hsRes);
      setRoadHealth(rhRes);
      setAnalytics(anRes);
      setAlerts(alRes);
    } catch (err) {
      console.warn('Backend unavailable, using pre-populated sample dataset');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-cyan-500 selection:text-white">
      
      {/* Top Header & Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReportModal={() => setIsReportOpen(true)}
        onStartDemoTour={() => setIsDemoTourOpen(true)}
        unreadAlertsCount={alerts.filter(a => !a.is_read).length}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {activeTab === 'landing' && (
          <LandingPage
            onExploreMap={() => setActiveTab('dashboard')}
            onReportIssue={() => setIsReportOpen(true)}
            onStartDemoTour={() => setIsDemoTourOpen(true)}
          />
        )}

        {activeTab === 'dashboard' && (
          <CommandCenterDashboard
            incidents={incidents}
            hotspots={hotspots}
            roadHealth={roadHealth}
            analytics={analytics}
            onSelectIncidentForPriority={(inc) => setSelectedPrioIncident(inc)}
            onSelectIncidentForOverride={(inc) => setSelectedOverrideIncident(inc)}
            onOpenWhatIf={(roadName) => setIsWhatIfOpen(true)}
            onOpenBudget={() => setIsBudgetOpen(true)}
            onOpenDNA={(road) => setSelectedDnaRoad(road)}
            onAssignWorkOrder={(inc) => setSelectedOverrideIncident(inc)}
            onRefreshData={loadData}
          />
        )}

        {activeTab === 'map' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Full Screen GIS Radar & Risk Hotspots</h2>
                <p className="text-xs text-slate-400 font-mono">Interactive Spatial Clusters & Priority Marker Map</p>
              </div>
            </div>
            <GISMap incidents={incidents} hotspots={hotspots} />
          </div>
        )}

        {activeTab === 'predictive' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h2 className="text-xl font-bold text-white">Predictive Infrastructure Risk & Deterioration Engine</h2>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Simulate how moisture intrusion, heavy traffic loads, and repair delays affect pavement health over 30, 60, and 90 days.
              </p>
              <button
                onClick={() => setIsWhatIfOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Open What-If Simulator Modal
              </button>
            </div>
          </div>
        )}

        {activeTab === 'budget' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4">
              <h2 className="text-xl font-bold text-white">AI Maintenance Capital Budget Optimizer</h2>
              <p className="text-xs text-slate-300 font-mono leading-relaxed">
                Input available municipal budget to generate 3 Pareto-optimal allocation strategies maximizing public safety ROI.
              </p>
              <button
                onClick={() => setIsBudgetOpen(true)}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs rounded-xl shadow-lg"
              >
                Open Budget Optimizer Simulation
              </button>
            </div>
          </div>
        )}

        {activeTab === 'worker' && (
          <FieldWorkerApp incidents={incidents} onRefreshIncidents={loadData} />
        )}

        {activeTab === 'alerts' && (
          <AlertsCenter alerts={alerts} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs font-mono text-slate-500 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">CIVICVISION AI v1.0</span>
            <span>— Public Infrastructure Command Center</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Powered by Computer Vision & Predictive Maintenance Intelligence
          </div>
        </div>
      </footer>

      {/* ALL MODALS */}
      <CitizenReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        onSuccess={() => {
          loadData();
          setActiveTab('dashboard');
        }}
      />

      <PriorityExplanationModal
        incident={selectedPrioIncident}
        onClose={() => setSelectedPrioIncident(null)}
      />

      <HumanInTheLoopModal
        incident={selectedOverrideIncident}
        onClose={() => setSelectedOverrideIncident(null)}
        onSuccess={() => loadData()}
      />

      <WhatIfSimulatorModal
        isOpen={isWhatIfOpen}
        onClose={() => setIsWhatIfOpen(false)}
      />

      <BudgetOptimizerModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
      />

      <InfrastructureDNAModal
        road={selectedDnaRoad}
        onClose={() => setSelectedDnaRoad(null)}
      />

      <DemoTourModal
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onGoToStep={(key) => setActiveTab(key)}
      />

    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
