from pydantic import BaseModel, Field
from typing import List, Optional, Any
from datetime import datetime

# Auth & User
class UserBase(BaseModel):
    username: str
    email: str
    full_name: str
    role: str
    zone: Optional[str] = None
    avatar: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Detection
class DetectionBase(BaseModel):
    issue_type: str
    confidence: float
    bbox_x: float
    bbox_y: float
    bbox_w: float
    bbox_h: float
    severity: str
    estimated_area_m2: float
    ai_explanation: str

class DetectionResponse(DetectionBase):
    id: int
    incident_id: int
    class Config:
        from_attributes = True

# Priority Breakdown
class PriorityBreakdownResponse(BaseModel):
    incident_id: int
    severity_pts: int
    traffic_pts: int
    proximity_pts: int
    repeated_complaints_pts: int
    damage_size_pts: int
    risk_trend_pts: int
    total_score: int
    explanation: str
    class Config:
        from_attributes = True

# Work Order & Repair Verification
class WorkOrderCreate(BaseModel):
    assigned_worker_id: int
    instructions: str

class WorkOrderResponse(BaseModel):
    id: int
    incident_id: int
    assigned_worker_id: int
    instructions: str
    status: str
    worker_notes: Optional[str] = None
    assigned_at: datetime
    completed_at: Optional[datetime] = None
    class Config:
        from_attributes = True

class RepairVerificationCreate(BaseModel):
    after_image_url: str
    worker_notes: Optional[str] = None

class RepairVerificationResponse(BaseModel):
    id: int
    incident_id: int
    after_image_url: str
    status: str
    verification_score: float
    defects_detected: Optional[str] = None
    ai_explanation: str
    verified_at: datetime
    class Config:
        from_attributes = True

# Incident
class IncidentCreate(BaseModel):
    title: str
    description: Optional[str] = None
    primary_issue_type: str
    latitude: float
    longitude: float
    address: str
    zone_name: str
    image_url: str

class OfficerOverrideRequest(BaseModel):
    severity: str
    override_reason: str

class IncidentResponse(BaseModel):
    id: int
    report_code: str
    title: str
    description: Optional[str]
    primary_issue_type: str
    status: str
    priority_score: int
    severity: str
    confidence_score: float
    estimated_area_m2: float
    latitude: float
    longitude: float
    address: str
    zone_name: str
    image_url: str
    before_image_url: Optional[str]
    after_image_url: Optional[str]
    is_duplicate: bool
    master_incident_id: Optional[int]
    duplicate_count: int
    officer_severity_override: Optional[str]
    officer_override_reason: Optional[str]
    review_required: bool
    created_by_id: int
    assigned_to_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    
    detections: List[DetectionResponse] = []
    priority_breakdown: Optional[PriorityBreakdownResponse] = None
    verifications: List[RepairVerificationResponse] = []
    
    class Config:
        from_attributes = True

# Hotspots & Road Health
class HotspotResponse(BaseModel):
    id: int
    code: str
    name: str
    zone_name: str
    latitude: float
    longitude: float
    incident_count: int
    risk_level: str
    radius_meters: float
    primary_category: str
    description: str
    created_at: datetime
    class Config:
        from_attributes = True

class RoadHealthResponse(BaseModel):
    id: int
    road_name: str
    zone_name: str
    health_score: int
    pothole_risk: int
    flood_risk: int
    traffic_stress: int
    repair_history: int
    complaint_freq: int
    forecast_7d: int
    forecast_30d: int
    dna_profile_json: str
    updated_at: datetime
    class Config:
        from_attributes = True

# Simulation & Budget
class RiskSimulationRequest(BaseModel):
    days_delay: int = 30
    road_name: Optional[str] = None
    repaired_incident_ids: List[int] = []

class RiskSimulationResponse(BaseModel):
    days_delay: int
    current_health: int
    projected_health: int
    expected_priority_change: int
    hotspot_expansion_risk: str
    deterioration_summary: str
    recommended_action: str

class BudgetOptimizationRequest(BaseModel):
    budget_amount: float
    zone_name: Optional[str] = None

class AllocationOption(BaseModel):
    option_id: str
    title: str
    description: str
    cost: float
    locations_repaired: int
    risk_reduction_pct: float
    affected_population: int
    avg_priority_reduction: int
    projected_health_gain: int
    incident_ids: List[int]

class BudgetOptimizationResponse(BaseModel):
    budget_provided: float
    options: List[AllocationOption]

# Analytics & Audit
class AnalyticsSummary(BaseModel):
    total_incidents: int
    critical_incidents: int
    high_priority_incidents: int
    in_progress_incidents: int
    resolved_incidents: int
    avg_resolution_hours: float
    overall_health_score: int
    repair_verification_pass_rate: float

class AuditLogResponse(BaseModel):
    id: int
    incident_id: Optional[int]
    user_id: Optional[int]
    action: str
    previous_state: Optional[str]
    new_state: Optional[str]
    notes: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True

class AlertResponse(BaseModel):
    id: int
    alert_type: str
    title: str
    message: str
    severity: str
    zone: Optional[str]
    incident_id: Optional[int]
    is_read: bool
    timestamp: datetime
    class Config:
        from_attributes = True
