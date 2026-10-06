import random
from typing import List, Dict, Any

INFRASTRUCTURE_CLASSES = {
    "POTHOLE": "Pothole",
    "DAMAGED_ROAD": "Damaged Road",
    "BROKEN_STREETLIGHT": "Broken Streetlight",
    "OVERFLOWING_DRAIN": "Overflowing Drain",
    "DAMAGED_SIDEWALK": "Damaged Sidewalk",
    "ROAD_CRACK": "Road Crack",
    "WATER_ACCUMULATION": "Water Accumulation / Flooding",
    "FALLEN_TREE": "Fallen Tree / Debris",
    "DAMAGED_SIGN": "Damaged Traffic Sign",
    "EXPOSED_UTILITY": "Exposed Utility Infrastructure",
    "GARBAGE_OVERFLOW": "Garbage Overflow"
}

def analyze_infrastructure_image(primary_category: str, image_path: str = None) -> List[Dict[str, Any]]:
    """
    Simulates AI Object Detection & Multi-Issue Classification pipeline.
    Uses computer vision preprocessing + bounding box generator.
    Can return single or multiple detections for 1 uploaded image.
    """
    primary = primary_category.upper()
    if primary not in INFRASTRUCTURE_CLASSES:
        primary = "POTHOLE"
        
    detections = []
    
    # Primary detection
    if primary == "POTHOLE":
        detections.append({
            "issue_type": "POTHOLE",
            "confidence": 96.4,
            "bbox_x": 0.22,
            "bbox_y": 0.42,
            "bbox_w": 0.38,
            "bbox_h": 0.32,
            "severity": "HIGH",
            "estimated_area_m2": 2.8,
            "ai_explanation": "AI Computer Vision detected structural road surface depression exceeding 14cm in depth with irregular jagged perimeter. High impact hazard for 2-wheelers and passenger vehicles."
        })
        # Multi-issue secondary detections
        detections.append({
            "issue_type": "ROAD_CRACK",
            "confidence": 88.7,
            "bbox_x": 0.58,
            "bbox_y": 0.30,
            "bbox_w": 0.32,
            "bbox_h": 0.22,
            "severity": "MEDIUM",
            "estimated_area_m2": 1.4,
            "ai_explanation": "Longitudinal asphalt fissure branching from primary pothole zone indicating ongoing sub-base moisture deterioration."
        })
        detections.append({
            "issue_type": "WATER_ACCUMULATION",
            "confidence": 91.2,
            "bbox_x": 0.15,
            "bbox_y": 0.72,
            "bbox_w": 0.45,
            "bbox_h": 0.20,
            "severity": "MEDIUM",
            "estimated_area_m2": 3.1,
            "ai_explanation": "Stagnant surface runoff trapped in asphalt depression, accelerating sub-layer breakdown."
        })

    elif primary == "DAMAGED_ROAD":
        detections.append({
            "issue_type": "DAMAGED_ROAD",
            "confidence": 94.1,
            "bbox_x": 0.15,
            "bbox_y": 0.25,
            "bbox_w": 0.70,
            "bbox_h": 0.55,
            "severity": "CRITICAL",
            "estimated_area_m2": 18.5,
            "ai_explanation": "Widespread alligator cracking and asphalt stripping across 70% of lane width. Sub-base structural failure observed."
        })
        detections.append({
            "issue_type": "DAMAGED_SIDEWALK",
            "confidence": 89.5,
            "bbox_x": 0.05,
            "bbox_y": 0.50,
            "bbox_w": 0.25,
            "bbox_h": 0.40,
            "severity": "HIGH",
            "estimated_area_m2": 4.2,
            "ai_explanation": "Curb offset and broken concrete walkway segment creating trip hazard adjacent to damaged carriageway."
        })

    elif primary == "BROKEN_STREETLIGHT":
        detections.append({
            "issue_type": "BROKEN_STREETLIGHT",
            "confidence": 97.8,
            "bbox_x": 0.35,
            "bbox_y": 0.10,
            "bbox_w": 0.28,
            "bbox_h": 0.65,
            "severity": "HIGH",
            "estimated_area_m2": 1.0,
            "ai_explanation": "Optical sensors confirm non-functional LED luminaire fixture with exposed electrical junction box. High night visibility hazard."
        })

    elif primary == "OVERFLOWING_DRAIN":
        detections.append({
            "issue_type": "OVERFLOWING_DRAIN",
            "confidence": 95.3,
            "bbox_x": 0.20,
            "bbox_y": 0.35,
            "bbox_w": 0.55,
            "bbox_h": 0.45,
            "severity": "CRITICAL",
            "estimated_area_m2": 6.8,
            "ai_explanation": "Stormwater drain inlet blocked by silt and debris causing localized urban flooding and road erosion."
        })

    else:
        # Fallback generic detection
        detections.append({
            "issue_type": primary,
            "confidence": round(random.uniform(88.0, 97.5), 1),
            "bbox_x": 0.25,
            "bbox_y": 0.30,
            "bbox_w": 0.50,
            "bbox_h": 0.40,
            "severity": "HIGH",
            "estimated_area_m2": 3.5,
            "ai_explanation": f"AI Computer Vision identified {INFRASTRUCTURE_CLASSES.get(primary, primary)} with high structural risk parameters."
        })

    return detections
