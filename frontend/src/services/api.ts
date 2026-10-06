import { 
  Incident, User, Hotspot, RoadHealth, AnalyticsSummary, Alert, AuditLog, 
  RiskSimulationResponse, BudgetOptimizationResponse, RepairVerification
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`API Error ${res.status}: ${errText}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: async (username: string) => {
    return fetchJson<{ access_token: string; user: User }>(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password: 'demo123' })
    });
  },

  getUsers: async (role?: string) => {
    const query = role ? `?role=${role}` : '';
    return fetchJson<User[]>(`${API_BASE}/users${query}`);
  },

  // Incidents
  getIncidents: async (filters?: { status?: string; severity?: string; issue_type?: string; zone?: string; search?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.issue_type) params.append('issue_type', filters.issue_type);
    if (filters?.zone) params.append('zone', filters.zone);
    if (filters?.search) params.append('search', filters.search);
    
    const queryString = params.toString() ? `?${params.toString()}` : '';
    return fetchJson<Incident[]>(`${API_BASE}/incidents${queryString}`);
  },

  getIncidentById: async (id: number) => {
    return fetchJson<Incident>(`${API_BASE}/incidents/${id}`);
  },

  createIncident: async (data: {
    title: string;
    description?: string;
    primary_issue_type: string;
    latitude: number;
    longitude: number;
    address: string;
    zone_name: string;
    image_url: string;
  }, userId = 1) => {
    return fetchJson<Incident>(`${API_BASE}/incidents?created_by_id=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  },

  overrideSeverity: async (incidentId: number, severity: string, override_reason: string, officerId = 3) => {
    return fetchJson<Incident>(`${API_BASE}/incidents/${incidentId}/override?officer_id=${officerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ severity, override_reason })
    });
  },

  assignWorkOrder: async (incidentId: number, assignedWorkerId: number, instructions: string, officerId = 3) => {
    return fetchJson<any>(`${API_BASE}/incidents/${incidentId}/assign?officer_id=${officerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_worker_id: assignedWorkerId, instructions })
    });
  },

  updateWorkStatus: async (incidentId: number, statusVal: string, workerNotes?: string, workerId = 2) => {
    const notesParam = workerNotes ? `&worker_notes=${encodeURIComponent(workerNotes)}` : '';
    return fetchJson<any>(`${API_BASE}/incidents/${incidentId}/work-status?status_val=${statusVal}${notesParam}&worker_id=${workerId}`, {
      method: 'POST'
    });
  },

  verifyRepair: async (incidentId: number, afterImageUrl: string, workerNotes?: string, workerId = 2) => {
    return fetchJson<RepairVerification>(`${API_BASE}/incidents/${incidentId}/verify?worker_id=${workerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ after_image_url: afterImageUrl, worker_notes: workerNotes })
    });
  },

  // Hotspots & Health
  getHotspots: async () => {
    return fetchJson<Hotspot[]>(`${API_BASE}/hotspots`);
  },

  getRoadHealth: async () => {
    return fetchJson<RoadHealth[]>(`${API_BASE}/road-health`);
  },

  // Simulations
  runRiskSimulation: async (daysDelay: number, roadName?: string, repairedIds: number[] = []) => {
    return fetchJson<RiskSimulationResponse>(`${API_BASE}/simulation/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days_delay: daysDelay, road_name: roadName, repaired_incident_ids: repairedIds })
    });
  },

  optimizeBudget: async (budgetAmount: number, zoneName?: string) => {
    return fetchJson<BudgetOptimizationResponse>(`${API_BASE}/simulation/budget`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ budget_amount: budgetAmount, zone_name: zoneName })
    });
  },

  // Analytics, Alerts, Logs
  getAnalytics: async () => {
    return fetchJson<AnalyticsSummary>(`${API_BASE}/analytics`);
  },

  getAlerts: async () => {
    return fetchJson<Alert[]>(`${API_BASE}/alerts`);
  },

  getAuditLogs: async () => {
    return fetchJson<AuditLog[]>(`${API_BASE}/audit-logs`);
  },

  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return fetchJson<{ url: string; filename: string }>(`${API_BASE}/upload`, {
      method: 'POST',
      body: formData
    });
  }
};
