from typing import Dict, Any

def calculate_priority_score(
    severity: str,
    estimated_area_m2: float,
    duplicate_count: int = 1,
    zone_name: str = "Vijay Nagar, Indore",
    address: str = ""
) -> Dict[str, Any]:
    """
    Computes an explainable 0-100 Priority Score for public infrastructure incidents in Indore.
    """
    # 1. Base Severity Points (max 25)
    severity_map = {
        "CRITICAL": 25,
        "HIGH": 20,
        "MEDIUM": 14,
        "LOW": 8
    }
    severity_pts = severity_map.get(severity.upper(), 14)

    # 2. Traffic Intensity Points (max 20)
    high_traffic_keywords = [
        "ab road", "vijay nagar", "palasia", "rajwada", "bhawarkua", 
        "super corridor", "moti tabela", "bypass", "regal square", "choti gwaltoli"
    ]
    address_lower = (address + " " + zone_name).lower()
    if any(k in address_lower for k in high_traffic_keywords):
        traffic_pts = 20
    else:
        traffic_pts = 12

    # 3. Proximity to Schools / Hospitals / Emergency Corridors (max 20)
    sensitive_keywords = [
        "school", "hospital", "my hospital", "chaitanya", "bombay hospital", 
        "choithram", "davit", "iim", "iit", "market", "rajwada", "station"
    ]
    if any(k in address_lower for k in sensitive_keywords) or "indore" in address_lower or "square" in address_lower:
        proximity_pts = 20
    else:
        proximity_pts = 10

    # 4. Repeated Complaints Points (max 15)
    repeated_complaints_pts = min(15, (duplicate_count - 1) * 3 + (5 if duplicate_count > 1 else 0))
    if duplicate_count == 1:
        repeated_complaints_pts = 5

    # 5. Damage Size Points (max 8)
    if estimated_area_m2 >= 5.0:
        damage_size_pts = 8
    elif estimated_area_m2 >= 2.0:
        damage_size_pts = 6
    elif estimated_area_m2 >= 1.0:
        damage_size_pts = 4
    else:
        damage_size_pts = 2

    # 6. Risk Trend Points (max 6)
    risk_trend_pts = 6 if severity in ["HIGH", "CRITICAL"] else 3

    total_score = min(100, severity_pts + traffic_pts + proximity_pts + repeated_complaints_pts + damage_size_pts + risk_trend_pts)

    explanation = (
        f"Priority Score {total_score}/100 calculated via CivicVision AI Rules Engine: "
        f"Base Severity ({severity}): +{severity_pts}pts | "
        f"Indore Transit Corridor Stress: +{traffic_pts}pts | "
        f"Proximity to Key Public Zones: +{proximity_pts}pts | "
        f"Citizen Report Frequency ({duplicate_count} reports): +{repeated_complaints_pts}pts | "
        f"Affected Damage Surface ({estimated_area_m2}m²): +{damage_size_pts}pts | "
        f"Deterioration Trend: +{risk_trend_pts}pts."
    )

    return {
        "severity_pts": severity_pts,
        "traffic_pts": traffic_pts,
        "proximity_pts": proximity_pts,
        "repeated_complaints_pts": repeated_complaints_pts,
        "damage_size_pts": damage_size_pts,
        "risk_trend_pts": risk_trend_pts,
        "total_score": total_score,
        "explanation": explanation
    }
