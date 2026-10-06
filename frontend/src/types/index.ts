export type UserRole = 'citizen' | 'worker' | 'officer' | 'admin';

export interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: UserRole;
  zone?: string;
  avatar?: string;
}

export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 
  | 'REPORTED' 
  | 'AI_ANALYZED' 
  | 'VERIFICATION_REQUIRED' 
  | 'PRIORITIZED' 
  | 'ASSIGNED' 
  | 'IN_PROGRESS' 
  | 'REPAIR_COMPLETED' 
  | 'AI_VERIFICATION' 
  | 'RESOLVED' 
  | 'CLOSED'
  | 'VERIFICATION_FAILED';

export interface Detection {
  id: number;
  incident_id: number;
  issue_type: string;
  confidence: number;
  bbox_x: number;
  bbox_y: number;
  bbox_w: number;
  bbox_h: number;
  severity: SeverityLevel;
  estimated_area_m2: number;
  ai_explanation: string;
}

export interface PriorityBreakdown {
  incident_id: number;
  severity_pts: number;
  traffic_pts: number;
  proximity_pts: number;
  repeated_complaints_pts: number;
  damage_size_pts: number;
  risk_trend_pts: number;
  total_score: number;
  explanation: string;
}

export interface WorkOrder {
  id: number;
  incident_id: number;
  assigned_worker_id: number;
  instructions: string;
  status: string;
  worker_notes?: string;
  assigned_at: string;
  completed_at?: string;
}

export interface RepairVerification {
  id: number;
  incident_id: number;
  after_image_url: string;
  status: 'VERIFIED' | 'FAILED';
  verification_score: number;
  defects_detected?: string;
  ai_explanation: string;
  verified_at: string;
}

export interface Incident {
  id: number;
  report_code: string;
  title: string;
  description?: string;
  primary_issue_type: string;
  status: IncidentStatus;
  priority_score: number;
  severity: SeverityLevel;
  confidence_score: number;
  estimated_area_m2: number;
  latitude: number;
  longitude: number;
  address: string;
  zone_name: string;
  image_url: string;
  before_image_url?: string;
  after_image_url?: string;
  is_duplicate: boolean;
  master_incident_id?: number;
  duplicate_count: number;
  officer_severity_override?: SeverityLevel;
  officer_override_reason?: string;
  review_required: boolean;
  created_by_id: number;
  assigned_to_id?: number;
  created_at: string;
  updated_at: string;
  detections: Detection[];
  priority_breakdown?: PriorityBreakdown;
  verifications?: RepairVerification[];
}

export interface Hotspot {
  id: number;
  code: string;
  name: string;
  zone_name: string;
  latitude: number;
  longitude: number;
  incident_count: number;
  risk_level: SeverityLevel;
  radius_meters: number;
  primary_category: string;
  description: string;
  created_at: string;
}

export interface RoadHealth {
  id: number;
  road_name: string;
  zone_name: string;
  health_score: number;
  pothole_risk: number;
  flood_risk: number;
  traffic_stress: number;
  repair_history: number;
  complaint_freq: number;
  forecast_7d: number;
  forecast_30d: number;
  dna_profile_json: string;
  updated_at: string;
}

export interface RiskSimulationResponse {
  days_delay: number;
  current_health: number;
  projected_health: number;
  expected_priority_change: number;
  hotspot_expansion_risk: string;
  deterioration_summary: string;
  recommended_action: string;
}

export interface AllocationOption {
  option_id: string;
  title: string;
  description: string;
  cost: number;
  locations_repaired: number;
  risk_reduction_pct: number;
  affected_population: number;
  avg_priority_reduction: number;
  projected_health_gain: number;
  incident_ids: number[];
}

export interface BudgetOptimizationResponse {
  budget_provided: number;
  options: AllocationOption[];
}

export interface AnalyticsSummary {
  total_incidents: number;
  critical_incidents: number;
  high_priority_incidents: number;
  in_progress_incidents: number;
  resolved_incidents: number;
  avg_resolution_hours: number;
  overall_health_score: number;
  repair_verification_pass_rate: number;
}

export interface AuditLog {
  id: number;
  incident_id?: number;
  user_id?: number;
  action: string;
  previous_state?: string;
  new_state?: string;
  notes?: string;
  timestamp: string;
}

export interface Alert {
  id: number;
  alert_type: string;
  title: string;
  message: string;
  severity: SeverityLevel;
  zone?: string;
  incident_id?: number;
  is_read: boolean;
  timestamp: string;
}
