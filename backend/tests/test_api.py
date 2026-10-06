import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add parent directory to sys.path so backend imports work seamlessly
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from main import app

client = TestClient(app)

def test_login():
    response = client.post("/api/auth/login", json={"username": "citizen", "password": "demo123"})
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "citizen"

def test_list_incidents():
    response = client.get("/api/incidents")
    assert response.status_code == 200
    incidents = response.json()
    assert isinstance(incidents, list)
    assert len(incidents) > 0

def test_create_incident_and_ai_detection():
    payload = {
        "title": "Test Pothole on Commercial Street",
        "description": "Deep asphalt pit reported near shoping complex.",
        "primary_issue_type": "POTHOLE",
        "latitude": 12.9750,
        "longitude": 77.6020,
        "address": "Commercial Street",
        "zone_name": "Central Business District",
        "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800"
    }
    response = client.post("/api/incidents", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["report_code"].startswith("CV-")
    assert data["priority_score"] > 0
    assert len(data["detections"]) > 0
    assert data["detections"][0]["issue_type"] == "POTHOLE"

def test_duplicate_incident_grouping():
    # Submit identical report within 50m
    payload = {
        "title": "Duplicate Report of Pothole on Commercial Street",
        "description": "Second citizen reporting same pit.",
        "primary_issue_type": "POTHOLE",
        "latitude": 12.9751, # within 50m
        "longitude": 77.6021,
        "address": "Commercial Street",
        "zone_name": "Central Business District",
        "image_url": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800"
    }
    response = client.post("/api/incidents", json=payload)
    assert response.status_code == 200
    data = response.json()
    # Should be grouped under existing incident with duplicate_count >= 2
    assert data["duplicate_count"] >= 2

def test_predictive_risk_simulation():
    response = client.post("/api/simulation/risk", json={"days_delay": 30, "road_name": "MG Road"})
    assert response.status_code == 200
    data = response.json()
    assert "projected_health" in data
    assert data["days_delay"] == 30

def test_budget_optimizer():
    response = client.post("/api/simulation/budget", json={"budget_amount": 50000.0})
    assert response.status_code == 200
    data = response.json()
    assert len(data["options"]) == 3
    assert data["options"][0]["option_id"] == "OPTION_A"

def test_repair_verification():
    # Submit verification for incident 1
    payload = {
        "after_image_url": "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=800",
        "worker_notes": "Surface repaved with high compaction asphalt."
    }
    response = client.post("/api/incidents/1/verify", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] in ["VERIFIED", "FAILED"]
    assert data["verification_score"] > 0
