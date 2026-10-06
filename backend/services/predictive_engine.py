from typing import Dict, Any, List

def run_risk_simulation(
    days_delay: int,
    current_health: int,
    road_name: str = "MG Road Corridor",
    repaired_incident_ids: List[int] = None
) -> Dict[str, Any]:
    """
    Simulates future infrastructure deterioration or repair impact.
    """
    if repaired_incident_ids and len(repaired_incident_ids) > 0:
        # Repair action simulation
        num_repaired = len(repaired_incident_ids)
        health_gain = min(35, num_repaired * 8)
        projected_health = min(100, current_health + health_gain)
        priority_reduction = min(45, num_repaired * 10)
        
        return {
            "days_delay": 0,
            "current_health": current_health,
            "projected_health": projected_health,
            "expected_priority_change": -priority_reduction,
            "hotspot_expansion_risk": "MINIMAL (De-escalating)",
            "deterioration_summary": f"Executing repairs across {num_repaired} target locations eliminates high-severity structural stresses.",
            "recommended_action": f"Approve budget allocation for immediate repair of target work orders. Expected health boost: +{health_gain} pts."
        }
    else:
        # Deterioration delay simulation
        decay_factor = (days_delay / 30.0) * 15.0
        projected_health = max(10, int(current_health - decay_factor))
        priority_increase = int((days_delay / 30.0) * 18.0)
        
        if days_delay >= 60:
            expansion_risk = "CRITICAL (High Hotspot Spreading Risk)"
        elif days_delay >= 30:
            expansion_risk = "HIGH (Cluster Deterioration)"
        else:
            expansion_risk = "MODERATE"

        return {
            "days_delay": days_delay,
            "current_health": current_health,
            "projected_health": projected_health,
            "expected_priority_change": priority_increase,
            "hotspot_expansion_risk": expansion_risk,
            "deterioration_summary": (
                f"If maintenance is delayed by {days_delay} days, moisture intrusion and heavy traffic load "
                f"will degrade {road_name} infrastructure health from {current_health}/100 down to {projected_health}/100."
            ),
            "recommended_action": (
                f"Schedule preventive resurfacing within 14 days to prevent sub-base collapse and $42,000 emergency repair overhead."
            )
        }
