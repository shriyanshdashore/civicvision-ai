import os
import shutil
import uuid
from typing import List, Optional
from datetime import datetime

from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Query, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import Base, engine, get_db
import models
import schemas
from seed_data import seed_database
from services.ai_vision_engine import analyze_infrastructure_image
from services.priority_engine import calculate_priority_score
from services.hotspot_engine import detect_hotspots_from_incidents
from services.duplicate_engine import find_existing_master_incident
from services.repair_verification_engine import verify_repair_image
from services.predictive_engine import run_risk_simulation
from services.budget_optimizer import optimize_maintenance_budget

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

# Seed database with sample data
db_session = next(get_db())
try:
    seed_database(db_session)
finally:
    db_session.close()

app = FastAPI(
    title="CIVICVISION AI - Infrastructure Intelligence Platform",
    description="AI-Powered Public Infrastructure Intelligence & Predictive Maintenance Command Center",
    version="1.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup image upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# --- AUTH & USER ENDPOINTS ---

@app.post("/api/auth/login", response_model=schemas.TokenResponse)
def login(req: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == req.username).first()
    if not user:
        # Fallback default lookup by role
        user = db.query(models.User).filter(models.User.role == req.username).first()
    
    if not user:
        # Create quick fallback user if not found
        user = models.User(
            username=req.username,
            email=f"{req.username}@civicvision.ai",
            password_hash="demo123",
            role=req.username if req.username in ["citizen", "worker", "officer", "admin"] else "citizen",
            full_name=req.username.capitalize() + " User",
            zone="Central Business District"
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    return {
        "access_token": f"token-{user.id}-{user.role}",
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/users", response_model=List[schemas.UserResponse])
def get_users(role: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    return query.all()

# --- FILE UPLOAD ---

@app.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    ext = os.path.splitext(file.filename)[1] or ".jpg"
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    url = f"/uploads/{unique_filename}"
    return {"url": url, "filename": file.filename}

# --- INCIDENT REPORTING & MANAGEMENT ---

@app.get("/api/incidents", response_model=List[schemas.IncidentResponse])
def list_incidents(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    issue_type: Optional[str] = None,
    zone: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Incident)

    if status:
        query = query.filter(models.Incident.status == status)
    if severity:
        query = query.filter(models.Incident.severity == severity)
    if issue_type:
        query = query.filter(models.Incident.primary_issue_type == issue_type)
    if zone:
        query = query.filter(models.Incident.zone_name == zone)
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Incident.title.ilike(search_pattern)) |
            (models.Incident.report_code.ilike(search_pattern)) |
            (models.Incident.address.ilike(search_pattern))
        )

    # Order by priority score descending
    return query.order_by(models.Incident.priority_score.desc()).all()

@app.post("/api/incidents", response_model=schemas.IncidentResponse)
def create_incident(
    req: schemas.IncidentCreate,
    created_by_id: int = Query(1),
    db: Session = Depends(get_db)
):
    # 1. Duplicate Detection Check
    existing_master = find_existing_master_incident(
        db, latitude=req.latitude, longitude=req.longitude, issue_type=req.primary_issue_type
    )

    if existing_master:
        # Group under master incident
        existing_master.duplicate_count += 1
        # Recalculate priority with higher report frequency
        prio_data = calculate_priority_score(
            severity=existing_master.severity,
            estimated_area_m2=existing_master.estimated_area_m2,
            duplicate_count=existing_master.duplicate_count,
            zone_name=existing_master.zone_name,
            address=existing_master.address
        )
        existing_master.priority_score = prio_data["total_score"]
        if existing_master.priority_breakdown:
            existing_master.priority_breakdown.repeated_complaints_pts = prio_data["repeated_complaints_pts"]
            existing_master.priority_breakdown.total_score = prio_data["total_score"]
            existing_master.priority_breakdown.explanation = prio_data["explanation"]

        db.add(models.AuditLog(
            incident_id=existing_master.id,
            user_id=created_by_id,
            action="DUPLICATE_REPORTED",
            previous_state=existing_master.status,
            new_state=existing_master.status,
            notes=f"New citizen report linked to Master Incident {existing_master.report_code}. Duplicate count boosted to {existing_master.duplicate_count}."
        ))

        db.commit()
        db.refresh(existing_master)
        return existing_master

    # 2. Run AI Computer Vision Engine
    detections_data = analyze_infrastructure_image(req.primary_issue_type, req.image_url)
    primary_detection = detections_data[0]
    
    report_code = f"CV-{datetime.utcnow().year}-{db.query(models.Incident).count() + 1001}"
    
    # Calculate Priority
    prio_data = calculate_priority_score(
        severity=primary_detection["severity"],
        estimated_area_m2=primary_detection["estimated_area_m2"],
        duplicate_count=1,
        zone_name=req.zone_name,
        address=req.address
    )

    # 3. Create Incident Entity
    incident = models.Incident(
        report_code=report_code,
        title=req.title,
        description=req.description,
        primary_issue_type=req.primary_issue_type,
        status="AI_ANALYZED",
        priority_score=prio_data["total_score"],
        severity=primary_detection["severity"],
        confidence_score=primary_detection["confidence"],
        estimated_area_m2=primary_detection["estimated_area_m2"],
        latitude=req.latitude,
        longitude=req.longitude,
        address=req.address,
        zone_name=req.zone_name,
        image_url=req.image_url,
        before_image_url=req.image_url,
        created_by_id=created_by_id
    )
    db.add(incident)
    db.commit()
    db.refresh(incident)

    # 4. Save Detections
    for det in detections_data:
        db.add(models.Detection(
            incident_id=incident.id,
            issue_type=det["issue_type"],
            confidence=det["confidence"],
            bbox_x=det["bbox_x"],
            bbox_y=det["bbox_y"],
            bbox_w=det["bbox_w"],
            bbox_h=det["bbox_h"],
            severity=det["severity"],
            estimated_area_m2=det["estimated_area_m2"],
            ai_explanation=det["ai_explanation"]
        ))

    # 5. Save Priority Breakdown
    db.add(models.PriorityBreakdown(
        incident_id=incident.id,
        severity_pts=prio_data["severity_pts"],
        traffic_pts=prio_data["traffic_pts"],
        proximity_pts=prio_data["proximity_pts"],
        repeated_complaints_pts=prio_data["repeated_complaints_pts"],
        damage_size_pts=prio_data["damage_size_pts"],
        risk_trend_pts=prio_data["risk_trend_pts"],
        total_score=prio_data["total_score"],
        explanation=prio_data["explanation"]
    ))

    # 6. Audit Log
    db.add(models.AuditLog(
        incident_id=incident.id,
        user_id=created_by_id,
        action="INCIDENT_CREATED",
        previous_state=None,
        new_state="AI_ANALYZED",
        notes=f"New report {report_code} created. AI Vision Engine detected {len(detections_data)} anomaly instances."
    ))

    db.commit()
    db.refresh(incident)
    return incident

@app.get("/api/incidents/{incident_id}", response_model=schemas.IncidentResponse)
def get_incident(incident_id: int, db: Session = Depends(get_db)):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident

# --- HUMAN-IN-THE-LOOP SECOND OPINION ---

@app.post("/api/incidents/{incident_id}/override", response_model=schemas.IncidentResponse)
def officer_override_severity(
    incident_id: int,
    req: schemas.OfficerOverrideRequest,
    officer_id: int = Query(3),
    db: Session = Depends(get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    prev_severity = incident.severity
    incident.officer_severity_override = req.severity
    incident.officer_override_reason = req.override_reason
    incident.review_required = True
    
    # Recalculate priority with new severity override
    prio_data = calculate_priority_score(
        severity=req.severity,
        estimated_area_m2=incident.estimated_area_m2,
        duplicate_count=incident.duplicate_count,
        zone_name=incident.zone_name,
        address=incident.address
    )
    incident.priority_score = prio_data["total_score"]

    db.add(models.AuditLog(
        incident_id=incident.id,
        user_id=officer_id,
        action="SEVERITY_OVERRIDDEN",
        previous_state=prev_severity,
        new_state=req.severity,
        notes=f"Municipal Officer overridden severity from {prev_severity} to {req.severity}. Reason: {req.override_reason}"
    ))

    db.commit()
    db.refresh(incident)
    return incident

# --- WORK ORDER ASSIGNMENT & FIELD WORKER FLOW ---

@app.post("/api/incidents/{incident_id}/assign", response_model=schemas.WorkOrderResponse)
def assign_work_order(
    incident_id: int,
    req: schemas.WorkOrderCreate,
    officer_id: int = Query(3),
    db: Session = Depends(get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = "ASSIGNED"
    incident.assigned_to_id = req.assigned_worker_id

    work_order = models.WorkOrder(
        incident_id=incident.id,
        assigned_worker_id=req.assigned_worker_id,
        instructions=req.instructions,
        status="ASSIGNED"
    )
    db.add(work_order)

    db.add(models.AuditLog(
        incident_id=incident.id,
        user_id=officer_id,
        action="WORK_ORDER_ASSIGNED",
        previous_state="PRIORITIZED",
        new_state="ASSIGNED",
        notes=f"Work order assigned to field worker ID {req.assigned_worker_id}. Instructions: {req.instructions}"
    ))

    db.commit()
    db.refresh(work_order)
    return work_order

@app.post("/api/incidents/{incident_id}/work-status")
def update_work_status(
    incident_id: int,
    status_val: str = Query(...), # IN_PROGRESS, REPAIR_SUBMITTED
    worker_notes: Optional[str] = Query(None),
    worker_id: int = Query(2),
    db: Session = Depends(get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    prev_status = incident.status
    incident.status = status_val

    wo = db.query(models.WorkOrder).filter(models.WorkOrder.incident_id == incident_id).order_by(models.WorkOrder.id.desc()).first()
    if wo:
        wo.status = status_val
        if worker_notes:
            wo.worker_notes = worker_notes
        if status_val == "REPAIR_SUBMITTED":
            wo.completed_at = datetime.utcnow()

    db.add(models.AuditLog(
        incident_id=incident.id,
        user_id=worker_id,
        action="WORK_STATUS_UPDATED",
        previous_state=prev_status,
        new_state=status_val,
        notes=f"Field worker updated status to {status_val}. Notes: {worker_notes or 'N/A'}"
    ))

    db.commit()
    return {"message": "Work status updated successfully", "status": status_val}

# --- REPAIR VERIFICATION ENDPOINT ---

@app.post("/api/incidents/{incident_id}/verify", response_model=schemas.RepairVerificationResponse)
def submit_repair_verification(
    incident_id: int,
    req: schemas.RepairVerificationCreate,
    worker_id: int = Query(2),
    db: Session = Depends(get_db)
):
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.after_image_url = req.after_image_url
    incident.status = "AI_VERIFICATION"

    # Run AI Computer Vision Before/After Repair Verification
    verification_res = verify_repair_image(
        before_image_url=incident.before_image_url or incident.image_url,
        after_image_url=req.after_image_url,
        primary_issue=incident.primary_issue_type
    )

    v_record = models.RepairVerification(
        incident_id=incident.id,
        after_image_url=req.after_image_url,
        status=verification_res["status"],
        verification_score=verification_res["verification_score"],
        defects_detected=verification_res["defects_detected"],
        ai_explanation=verification_res["ai_explanation"]
    )
    db.add(v_record)

    if verification_res["status"] == "VERIFIED":
        incident.status = "RESOLVED"
        audit_note = f"AI Repair Verification PASSED ({verification_res['verification_score']}% match). Incident resolved."
    else:
        incident.status = "VERIFICATION_FAILED"
        audit_note = f"AI Repair Verification FAILED ({verification_res['verification_score']}% match). Re-inspection required."
        
        # Trigger system alert
        db.add(models.Alert(
            alert_type="VERIFICATION_FAILED",
            title="REPAIR VERIFICATION FAILED",
            message=f"Incident {incident.report_code} failed AI verification. Score: {verification_res['verification_score']}%.",
            severity="HIGH",
            zone=incident.zone_name,
            incident_id=incident.id
        ))

    db.add(models.AuditLog(
        incident_id=incident.id,
        user_id=worker_id,
        action="REPAIR_VERIFIED",
        previous_state="AI_VERIFICATION",
        new_state=incident.status,
        notes=audit_note
    ))

    db.commit()
    db.refresh(v_record)
    return v_record

# --- GIS MAP & HOTSPOTS & HEALTH ENDPOINTS ---

@app.get("/api/hotspots", response_model=List[schemas.HotspotResponse])
def get_hotspots(db: Session = Depends(get_db)):
    # Recalculate dynamic hotspots from active database incidents
    incidents = db.query(models.Incident).all()
    dynamic_hotspots = detect_hotspots_from_incidents(incidents)

    # Sync with DB hotspots table
    db_hotspots = db.query(models.Hotspot).all()
    if not db_hotspots and dynamic_hotspots:
        for hs in dynamic_hotspots:
            db.add(models.Hotspot(**hs))
        db.commit()
        db_hotspots = db.query(models.Hotspot).all()

    return db_hotspots

@app.get("/api/road-health", response_model=List[schemas.RoadHealthResponse])
def get_road_health(db: Session = Depends(get_db)):
    return db.query(models.RoadHealth).all()

# --- PREDICTIVE RISK SIMULATION & BUDGET OPTIMIZER ---

@app.post("/api/simulation/risk", response_model=schemas.RiskSimulationResponse)
def simulate_predictive_risk(req: schemas.RiskSimulationRequest):
    return run_risk_simulation(
        days_delay=req.days_delay,
        current_health=62,
        road_name=req.road_name or "MG Road Corridor",
        repaired_incident_ids=req.repaired_incident_ids
    )

@app.post("/api/simulation/budget", response_model=schemas.BudgetOptimizationResponse)
def optimize_budget(req: schemas.BudgetOptimizationRequest, db: Session = Depends(get_db)):
    incidents = db.query(models.Incident).all()
    return optimize_maintenance_budget(req.budget_amount, incidents)

# --- ANALYTICS, ALERTS, AUDIT LOGS ---

@app.get("/api/analytics", response_model=schemas.AnalyticsSummary)
def get_analytics_summary(db: Session = Depends(get_db)):
    total = db.query(models.Incident).count()
    critical = db.query(models.Incident).filter(models.Incident.severity == "CRITICAL").count()
    high_prio = db.query(models.Incident).filter(models.Incident.priority_score >= 75).count()
    in_prog = db.query(models.Incident).filter(models.Incident.status.in_(["ASSIGNED", "IN_PROGRESS", "AI_VERIFICATION"])).count()
    resolved = db.query(models.Incident).filter(models.Incident.status == "RESOLVED").count()

    total_verifications = db.query(models.RepairVerification).count()
    passed_verifications = db.query(models.RepairVerification).filter(models.RepairVerification.status == "VERIFIED").count()
    pass_rate = round((passed_verifications / total_verifications * 100.0), 1) if total_verifications > 0 else 94.5

    return {
        "total_incidents": total,
        "critical_incidents": critical,
        "high_priority_incidents": high_prio,
        "in_progress_incidents": in_prog,
        "resolved_incidents": resolved,
        "avg_resolution_hours": 18.4,
        "overall_health_score": 68,
        "repair_verification_pass_rate": pass_rate
    }

@app.get("/api/alerts", response_model=List[schemas.AlertResponse])
def get_alerts(db: Session = Depends(get_db)):
    return db.query(models.Alert).order_by(models.Alert.timestamp.desc()).all()

@app.get("/api/audit-logs", response_model=List[schemas.AuditLogResponse])
def get_audit_logs(db: Session = Depends(get_db)):
    return db.query(models.AuditLog).order_by(models.AuditLog.timestamp.desc()).limit(50).all()
