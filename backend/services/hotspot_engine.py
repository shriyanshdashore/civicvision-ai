import math
from typing import List, Dict, Any

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculates distance between two lat/lon coordinates in meters."""
    R = 6371000  # Radius of Earth in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    return R * c

def detect_hotspots_from_incidents(incidents: List[Any], radius_meters: float = 500.0) -> List[Dict[str, Any]]:
    """
    DBSCAN-style spatial clustering algorithm to discover infrastructure hotspots.
    """
    if not incidents:
        return []

    clusters = []
    visited = set()

    for i, inc1 in enumerate(incidents):
        if inc1.id in visited:
            continue

        neighbors = []
        for j, inc2 in enumerate(incidents):
            dist = haversine_distance(inc1.latitude, inc1.longitude, inc2.latitude, inc2.longitude)
            if dist <= radius_meters:
                neighbors.append(inc2)

        if len(neighbors) >= 2: # Cluster threshold
            for n in neighbors:
                visited.add(n.id)

            avg_lat = sum(n.latitude for n in neighbors) / len(neighbors)
            avg_lon = sum(n.longitude for n in neighbors) / len(neighbors)
            count = len(neighbors)
            
            # Count severity
            critical_count = sum(1 for n in neighbors if n.severity in ["HIGH", "CRITICAL"] or n.priority_score >= 75)
            
            if count >= 5 or critical_count >= 3:
                risk_level = "CRITICAL"
            elif count >= 3:
                risk_level = "HIGH"
            else:
                risk_level = "MODERATE"

            zone = neighbors[0].zone_name if hasattr(neighbors[0], 'zone_name') else "Central Zone"
            primary_cat = neighbors[0].primary_issue_type if hasattr(neighbors[0], 'primary_issue_type') else "POTHOLE"

            clusters.append({
                "code": f"HOTSPOT-#{len(clusters)+1:02d}",
                "name": f"{zone} High Density Cluster",
                "zone_name": zone,
                "latitude": round(avg_lat, 6),
                "longitude": round(avg_lon, 6),
                "incident_count": count,
                "risk_level": risk_level,
                "radius_meters": radius_meters,
                "primary_category": primary_cat,
                "description": f"{count} active incidents detected within {int(radius_meters)}m window in {zone}. High cluster vulnerability."
            })

    return clusters
