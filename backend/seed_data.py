import json
from datetime import datetime
from sqlalchemy.orm import Session
import models
from services.priority_engine import calculate_priority_score

def seed_database(db: Session):
    # Check if users already exist
    if db.query(models.User).first():
        return

    print("Seeding CivicVision AI database with Indore Smart City Dataset...")

    # 1. Create Users for all 4 Roles
    users = [
        models.User(
            username="citizen",
            email="citizen@civicvision.ai",
            password_hash="demo123",
            role="citizen",
            full_name="Aarav Sharma",
            zone="Vijay Nagar, Indore",
            avatar="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
        ),
        models.User(
            username="worker",
            email="worker@civicvision.ai",
            password_hash="demo123",
            role="worker",
            full_name="Rajesh Kumar (Indore Field Lead)",
            zone="AB Road Division",
            avatar="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150"
        ),
        models.User(
            username="officer",
            email="officer@civicvision.ai",
            password_hash="demo123",
            role="officer",
            full_name="Er. Indore Municipal Corporation (IMC)",
            zone="Indore Citywide Command",
            avatar="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150"
        ),
        models.User(
            username="admin",
            email="admin@civicvision.ai",
            password_hash="demo123",
            role="admin",
            full_name="Indore Command Controller",
            zone="IMC Central Office",
            avatar="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150"
        )
    ]
    db.add_all(users)
    db.commit()

    citizen_user = db.query(models.User).filter_by(role="citizen").first()
    worker_user = db.query(models.User).filter_by(role="worker").first()

    # 2. Seed Incidents positioned across Indore
    sample_incidents = [
        {
            "report_code": "CV-IND-1001",
            "title": "Severe Multi-Pothole Crater on AB Road",
            "description": "Deep asphalt depression with jagged edges on AB Road near Industry House Square causing traffic bottleneck.",
            "primary_issue_type": "POTHOLE",
            "status": "PRIORITIZED",
            "severity": "CRITICAL",
            "confidence_score": 96.4,
            "estimated_area_m2": 3.8,
            "latitude": 22.7244,
            "longitude": 75.8850,
            "address": "AB Road, Near Palasia Square, Indore",
            "zone_name": "AB Road Transit Corridor",
            "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
            "before_image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
            "duplicate_count": 14,
            "created_by_id": citizen_user.id
        },
        {
            "report_code": "CV-IND-1002",
            "title": "Stormwater Drain Overflow at Rajwada Market",
            "description": "Culvert inlet clogged with silt and debris causing localized surface runoff near historic Rajwada Palace.",
            "primary_issue_type": "OVERFLOWING_DRAIN",
            "status": "ASSIGNED",
            "severity": "CRITICAL",
            "confidence_score": 95.3,
            "estimated_area_m2": 6.5,
            "latitude": 22.7196,
            "longitude": 75.8577,
            "address": "Rajwada Chowk, Old City, Indore",
            "zone_name": "Rajwada Heritage Zone",
            "image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
            "before_image_url": "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
            "duplicate_count": 9,
            "created_by_id": citizen_user.id,
            "assigned_to_id": worker_user.id
        },
        {
            "report_code": "CV-IND-1003",
            "title": "Non-Functional LED Streetlight Line on Super Corridor",
            "description": "Continuous dark zone of 5 broken luminaire poles on Super Corridor near MR10 bridge.",
            "primary_issue_type": "BROKEN_STREETLIGHT",
            "status": "IN_PROGRESS",
            "severity": "HIGH",
            "confidence_score": 97.8,
            "estimated_area_m2": 1.0,
            "latitude": 22.7480,
            "longitude": 75.8450,
            "address": "Super Corridor, Near TCS SEZ Square, Indore",
            "zone_name": "Super Corridor Tech Hub",
            "image_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800",
            "before_image_url": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?w=800",
            "duplicate_count": 4,
            "created_by_id": citizen_user.id,
            "assigned_to_id": worker_user.id
        },
        {
            "report_code": "CV-IND-1004",
            "title": "Asphalt Surface Stripping at Vijay Nagar Square",
            "description": "Severe binder stripping and alligator cracking across BRTS lane near C21 Mall.",
            "primary_issue_type": "DAMAGED_ROAD",
            "status": "AI_VERIFICATION",
            "severity": "HIGH",
            "confidence_score": 94.1,
            "estimated_area_m2": 14.2,
            "latitude": 22.7533,
            "longitude": 75.8937,
            "address": "Vijay Nagar Square, AB Road Flyover Ramp, Indore",
            "zone_name": "Vijay Nagar Commercial Hub",
            "image_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800",
            "before_image_url": "https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800",
            "after_image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
            "duplicate_count": 6,
            "created_by_id": citizen_user.id,
            "assigned_to_id": worker_user.id
        },
        {
            "report_code": "CV-IND-1005",
            "title": "Road Pit Near Bhawarkua Student Complex",
            "description": "Deep asphalt hole near coaching hub bus stop creating hazard for 2-wheelers.",
            "primary_issue_type": "POTHOLE",
            "status": "RESOLVED",
            "severity": "HIGH",
            "confidence_score": 98.2,
            "estimated_area_m2": 2.1,
            "latitude": 22.6912,
            "longitude": 75.8665,
            "address": "Bhawarkua Main Square, Ring Road, Indore",
            "zone_name": "Bhawarkua Education Zone",
            "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
            "before_image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800",
            "after_image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
            "duplicate_count": 8,
            "created_by_id": citizen_user.id,
            "assigned_to_id": worker_user.id
        }
    ]

    for data in sample_incidents:
        inc = models.Incident(**data)
        prio_data = calculate_priority_score(
            severity=inc.severity,
            estimated_area_m2=inc.estimated_area_m2,
            duplicate_count=inc.duplicate_count,
            zone_name=inc.zone_name,
            address=inc.address
        )
        inc.priority_score = prio_data["total_score"]
        db.add(inc)
        db.commit()
        db.refresh(inc)

        db.add(models.PriorityBreakdown(
            incident_id=inc.id,
            severity_pts=prio_data["severity_pts"],
            traffic_pts=prio_data["traffic_pts"],
            proximity_pts=prio_data["proximity_pts"],
            repeated_complaints_pts=prio_data["repeated_complaints_pts"],
            damage_size_pts=prio_data["damage_size_pts"],
            risk_trend_pts=prio_data["risk_trend_pts"],
            total_score=prio_data["total_score"],
            explanation=prio_data["explanation"]
        ))

        db.add(models.Detection(
            incident_id=inc.id,
            issue_type=inc.primary_issue_type,
            confidence=inc.confidence_score,
            bbox_x=0.22, bbox_y=0.40, bbox_w=0.38, bbox_h=0.32,
            severity=inc.severity,
            estimated_area_m2=inc.estimated_area_m2,
            ai_explanation=f"CivicVision AI Computer Vision detected structural anomaly in Indore."
        ))

        if inc.status in ["ASSIGNED", "IN_PROGRESS", "AI_VERIFICATION", "RESOLVED"]:
            db.add(models.WorkOrder(
                incident_id=inc.id,
                assigned_worker_id=worker_user.id,
                instructions="IMC maintenance team deployed. Repave surface with cold-mix asphalt.",
                status="COMPLETED" if inc.status in ["AI_VERIFICATION", "RESOLVED"] else "IN_PROGRESS",
                worker_notes="Asphalt compacted and leveled on site."
            ))

        if inc.status in ["AI_VERIFICATION", "RESOLVED"]:
            db.add(models.RepairVerification(
                incident_id=inc.id,
                after_image_url=inc.after_image_url or "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
                status="VERIFIED",
                verification_score=96.4,
                defects_detected="None. Complete patch level compaction.",
                ai_explanation="AI Before/After image comparison confirmed 100% surface quality restoration."
            ))

        db.add(models.AuditLog(
            incident_id=inc.id,
            user_id=citizen_user.id,
            action="INCIDENT_CREATED",
            previous_state=None,
            new_state=inc.status,
            notes=f"Incident {inc.report_code} logged in Indore GIS Radar."
        ))

    # 3. Seed Indore Hotspots
    hotspots = [
        models.Hotspot(
            code="HOTSPOT-IND-#01",
            name="AB Road - Palasia High Density Defect Cluster",
            zone_name="AB Road Transit Corridor",
            latitude=22.7244,
            longitude=75.8850,
            incident_count=17,
            risk_level="CRITICAL",
            radius_meters=500.0,
            primary_category="POTHOLE",
            description="17 active road surface defects clustered within 500m of Palasia Square on AB Road, Indore."
        ),
        models.Hotspot(
            code="HOTSPOT-IND-#02",
            name="Rajwada Market Flood Vulnerability Zone",
            zone_name="Rajwada Heritage Zone",
            latitude=22.7196,
            longitude=75.8577,
            incident_count=11,
            risk_level="HIGH",
            radius_meters=500.0,
            primary_category="OVERFLOWING_DRAIN",
            description="11 drainage blockages and water accumulation points near historic Rajwada Palace."
        )
    ]
    db.add_all(hotspots)

    # 4. Seed Indore Road Health Data
    roads = [
        models.RoadHealth(
            road_name="AB Road Arterial Corridor",
            zone_name="AB Road Transit Corridor",
            health_score=62,
            pothole_risk=82,
            flood_risk=67,
            traffic_stress=88,
            repair_history=58,
            complaint_freq=81,
            forecast_7d=55,
            forecast_30d=40,
            dna_profile_json=json.dumps({
                "vulnerabilities": ["Heavy iBus transit stress", "Sub-base moisture penetration", "Intersection spalling"],
                "pothole_tendency": 85,
                "flood_vulnerability": 68,
                "deterioration_speed": "HIGH",
                "recommended_fix": "Mill & Overlay 50mm Asphalt"
            })
        ),
        models.RoadHealth(
            road_name="Rajwada Old City Road",
            zone_name="Rajwada Heritage Zone",
            health_score=54,
            pothole_risk=65,
            flood_risk=88,
            traffic_stress=80,
            repair_history=45,
            complaint_freq=76,
            forecast_7d=48,
            forecast_30d=32,
            dna_profile_json=json.dumps({
                "vulnerabilities": ["Narrow heritage drainage capacity", "High market pedestrian load"],
                "pothole_tendency": 62,
                "flood_vulnerability": 92,
                "deterioration_speed": "CRITICAL",
                "recommended_fix": "Drainage enlargement & permeable concrete installation"
            })
        ),
        models.RoadHealth(
            road_name="Super Corridor Expressway",
            zone_name="Super Corridor Tech Hub",
            health_score=78,
            pothole_risk=42,
            flood_risk=35,
            traffic_stress=85,
            repair_history=75,
            complaint_freq=45,
            forecast_7d=74,
            forecast_30d=65,
            dna_profile_json=json.dumps({
                "vulnerabilities": ["High speed heavy freight wear", "Smart lighting maintenance"],
                "pothole_tendency": 40,
                "flood_vulnerability": 30,
                "deterioration_speed": "LOW",
                "recommended_fix": "Smart lighting audit & periodic micro-surfacing"
            })
        )
    ]
    db.add_all(roads)

    # 5. Seed Alerts
    alerts = [
        models.Alert(
            alert_type="CRITICAL_INCIDENT",
            title="CRITICAL DEFECT IN INDORE",
            message="CV-IND-1001 on AB Road reached Priority Score 94/100 (High traffic & near Palasia Square).",
            severity="CRITICAL",
            zone="AB Road Transit Corridor",
            incident_id=1,
            is_read=False
        ),
        models.Alert(
            alert_type="NEW_HOTSPOT",
            title="NEW HOTSPOT CLUSTER IN INDORE",
            message="HOTSPOT-IND-#01 created: 17 incidents clustered within 500m of Palasia Square.",
            severity="HIGH",
            zone="AB Road Transit Corridor",
            incident_id=None,
            is_read=False
        )
    ]
    db.add_all(alerts)

    db.commit()
    print("Indore Smart City database seeding completed!")
