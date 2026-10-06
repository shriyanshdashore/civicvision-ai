import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { 
  Building2, ShieldAlert, Map, PlusCircle, Wrench, 
  TrendingUp, DollarSign, Bell, Play, CheckCircle2, ChevronDown, Sparkles
} from 'lucide-react';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReportModal: () => void;
  onStartDemoTour: () => void;
  unreadAlertsCount?: number;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  setActiveTab,
  onOpenReportModal,
  onStartDemoTour,
  unreadAlertsCount = 3
}) => {
  const { role, switchRole } = useAuth();
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const roles: { key: UserRole; label: string; desc: string; icon: any }[] = [
    { key: 'citizen', label: 'Citizen', desc: 'Report & track local issues', icon: PlusCircle },
    { key: 'worker', label: 'Field Worker', desc: 'Assigned repairs & AI verification', icon: Wrench },
    { key: 'officer', label: 'Municipal Officer', desc: 'Command center, budget & review', icon: Building2 },
    { key: 'admin', label: 'Admin', desc: 'System config & audit logs', icon: ShieldAlert }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/85 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-white/20">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent">
                  CIVICVISION
                </span>
                <span className="text-[10px] font-bold bg-cyan-500/15 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/30">
                  INDORE AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">
                Smart City Command Center
              </p>
            </div>
          </div>

          {/* Navigation Tabs (Segmented Control Pill Bar) */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Command Center</span>
            </button>

            <button
              onClick={() => setActiveTab('map')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'map'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Map className="w-3.5 h-3.5 text-cyan-400" />
              <span>GIS Radar</span>
            </button>

            <button
              onClick={() => setActiveTab('predictive')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'predictive'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              <span>What-If Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('budget')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'budget'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-cyan-400" />
              <span>Budget Optimizer</span>
            </button>

            {role === 'worker' && (
              <button
                onClick={() => setActiveTab('worker')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'worker'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 text-amber-400" />
                <span>Field Portal</span>
              </button>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2.5 shrink-0">
            
            {/* Primary Action: Report Issue Button */}
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/35 transition-all hover:scale-[1.02] active:scale-95 border border-cyan-400/30"
            >
              <PlusCircle className="w-4 h-4 text-cyan-100" />
              <span>Report Issue</span>
            </button>

            {/* Hackathon Demo Tour Button */}
            <button
              onClick={onStartDemoTour}
              className="hidden sm:flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-850 text-cyan-300 border border-cyan-500/40 text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-sm"
              title="Launch 3-5 minute guided product workflow demo"
            >
              <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
              <span>Demo Tour</span>
            </button>

            {/* Alerts Center Bell */}
            <button
              onClick={() => setActiveTab('alerts')}
              className="relative p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900/80 border border-slate-800 transition-all hover:border-slate-700"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-red-500 text-white font-extrabold text-[10px] flex items-center justify-center animate-pulse shadow-md shadow-red-500/50">
                  {unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Role Switcher Selector */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-850 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs text-slate-200 transition-all shadow-sm"
              >
                <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-extrabold text-[11px] text-cyan-300">
                  {role.charAt(0).toUpperCase()}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-bold text-white capitalize leading-none text-xs">{role}</div>
                  <div className="text-[10px] text-slate-400 font-medium leading-tight">Active Role</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-[11px] font-bold text-slate-400 border-b border-slate-800 mb-1 flex items-center justify-between">
                    <span>SWITCH USER ROLE</span>
                    <span className="text-cyan-400">RBAC DEMO</span>
                  </div>
                  {roles.map((r) => {
                    const Icon = r.icon;
                    const isSelected = role === r.key;
                    return (
                      <button
                        key={r.key}
                        onClick={() => {
                          switchRole(r.key);
                          setShowRoleMenu(false);
                          if (r.key === 'worker') setActiveTab('worker');
                        }}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                          isSelected ? 'bg-cyan-500/15 border border-cyan-500/40 text-white' : 'hover:bg-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-xs flex items-center gap-1.5">
                            <span>{r.label}</span>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                          </div>
                          <div className="text-[11px] text-slate-400 font-medium">{r.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
};
