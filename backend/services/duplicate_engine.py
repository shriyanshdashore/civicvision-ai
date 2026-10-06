from sqlalchemy.orm import Session
from models import Incident
from services.hotspot_engine import haversine_distance

def find_existing_master_incident(
    db: Session,
    latitude: float,
    longitude: float,
    issue_type: str,
    max_distance_meters: float = 50.0
) -> Incident | None:
    """
    Checks if a reported incident is a duplicate of an existing unresolved incident.
    """
    # Fetch active incidents matching same primary issue category
    active_incidents = db.query(Incident).filter(
        Incident.primary_issue_type == issue_type,
        Incident.status.notin_(["RESOLVED", "CLOSED"]),
        Incident.is_duplicate == False
    ).all()

    for candidate in active_incidents:
        dist = haversine_distance(latitude, longitude, candidate.latitude, candidate.longitude)
        if dist <= max_distance_meters:
            return candidate

    return None
