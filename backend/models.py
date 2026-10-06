from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="citizen") # citizen, worker, officer, admin
    full_name = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    zone = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    reported_incidents = relationship("Incident", foreign_keys="Incident.created_by_id", back_populates="created_by")
    assigned_incidents = relationship("Incident", foreign_keys="Incident.assigned_to_id", back_populates="assigned_to")

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)
    report_code = Column(String, unique=True, index=True, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    primary_issue_type = Column(String, index=True, nullable=False) # POTHOLE, DAMAGED_ROAD, BROKEN_STREETLIGHT, OVERFLOWING_DRAIN, etc.
    status = Column(String, default="REPORTED", index=True) # REPORTED, AI_ANALYZED, VERIFICATION_REQUIRED, PRIORITIZED, ASSIGNED, IN_PROGRESS, REPAIR_COMPLETED, AI_VERIFICATION, RESOLVED, CLOSED
    priority_score = Column(Integer, default=50, index=True)
    severity = Column(String, default="MEDIUM", index=True) # LOW, MEDIUM, HIGH, CRITICAL
    confidence_score = Column(Float, default=90.0)
    estimated_area_m2 = Column(Float, default=1.5)
    
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    address = Column(String, nullable=False)
    zone_name = Column(String, nullable=False, index=True)

    image_url = Column(String, nullable=False)
    before_image_url = Column(String, nullable=True)
    after_image_url = Column(String, nullable=True)

    is_duplicate = Column(Boolean, default=False)
    master_incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    duplicate_count = Column(Integer, default=1)

    officer_severity_override = Column(String, nullable=True)
    officer_override_reason = Column(Text, nullable=True)
    review_required = Column(Boolean, default=False)

    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    created_by = relationship("User", foreign_keys=[created_by_id], back_populates="reported_incidents")
    assigned_to = relationship("User", foreign_keys=[assigned_to_id], back_populates="assigned_incidents")
    
    detections = relationship("Detection", back_populates="incident", cascade="all, delete-orphan")
    priority_breakdown = relationship("PriorityBreakdown", uselist=False, back_populates="incident", cascade="all, delete-orphan")
    work_orders = relationship("WorkOrder", back_populates="incident", cascade="all, delete-orphan")
    verifications = relationship("RepairVerification", back_populates="incident", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="incident", cascade="all, delete-orphan")

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    issue_type = Column(String, nullable=False) # POTHOLE, ROAD_CRACK, WATER_ACCUMULATION, DAMAGED_SIDEWALK, etc.
    confidence = Column(Float, nullable=False) # e.g. 96.4
    bbox_x = Column(Float, nullable=False) # Normalized 0.0-1.0 or %
    bbox_y = Column(Float, nullable=False)
    bbox_w = Column(Float, nullable=False)
    bbox_h = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    estimated_area_m2 = Column(Float, nullable=False)
    ai_explanation = Column(Text, nullable=False)

    incident = relationship("Incident", back_populates="detections")

class PriorityBreakdown(Base):
    __tablename__ = "priority_breakdowns"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False, unique=True)
    severity_pts = Column(Integer, default=25)
    traffic_pts = Column(Integer, default=20)
    proximity_pts = Column(Integer, default=20) # Near school/hospital
    repeated_complaints_pts = Column(Integer, default=15)
    damage_size_pts = Column(Integer, default=8)
    risk_trend_pts = Column(Integer, default=6)
    total_score = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)

    incident = relationship("Incident", back_populates="priority_breakdown")

class WorkOrder(Base):
    __tablename__ = "work_orders"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    assigned_worker_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    instructions = Column(Text, nullable=False)
    status = Column(String, default="ASSIGNED") # ASSIGNED, IN_PROGRESS, REPAIR_SUBMITTED, VERIFIED, REJECTED
    worker_notes = Column(Text, nullable=True)
    assigned_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    incident = relationship("Incident", back_populates="work_orders")

class RepairVerification(Base):
    __tablename__ = "repair_verifications"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    after_image_url = Column(String, nullable=False)
    status = Column(String, nullable=False) # VERIFIED, FAILED
    verification_score = Column(Float, nullable=False) # e.g. 94.2%
    defects_detected = Column(String, nullable=True)
    ai_explanation = Column(Text, nullable=False)
    verified_at = Column(DateTime, default=datetime.utcnow)

    incident = relationship("Incident", back_populates="verifications")

class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    zone_name = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    incident_count = Column(Integer, default=1)
    risk_level = Column(String, default="HIGH") # LOW, MODERATE, HIGH, CRITICAL
    radius_meters = Column(Float, default=500.0)
    primary_category = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class RoadHealth(Base):
    __tablename__ = "road_health"

    id = Column(Integer, primary_key=True, index=True)
    road_name = Column(String, unique=True, index=True, nullable=False)
    zone_name = Column(String, nullable=False)
    health_score = Column(Integer, default=65) # 0-100
    pothole_risk = Column(Integer, default=70)
    flood_risk = Column(Integer, default=50)
    traffic_stress = Column(Integer, default=60)
    repair_history = Column(Integer, default=55)
    complaint_freq = Column(Integer, default=65)
    forecast_7d = Column(Integer, default=60)
    forecast_30d = Column(Integer, default=45)
    dna_profile_json = Column(Text, nullable=False) # JSON formatted Infrastructure DNA
    updated_at = Column(DateTime, default=datetime.utcnow)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    previous_state = Column(String, nullable=True)
    new_state = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)

    incident = relationship("Incident", back_populates="audit_logs")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String, nullable=False) # CRITICAL_INCIDENT, NEW_HOTSPOT, VERIFICATION_FAILED, REPEATED_FAILURE
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="HIGH") # LOW, MEDIUM, HIGH, CRITICAL
    zone = Column(String, nullable=True)
    incident_id = Column(Integer, nullable=True)
    is_read = Column(Boolean, default=False)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
