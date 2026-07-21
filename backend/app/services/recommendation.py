from typing import List, Dict, Any

class RecommendationEngine:
    @staticmethod
    def generate_recommendations(lst: float, ndvi: float, ndbi: float, ndwi: float, risk_score: float) -> List[Dict[str, Any]]:
        """
        Processes remote sensing indices and heat risk parameters to output specific spatial recommendations.
        """
        recommendations = []

        # Rule 1: Tree Plantation
        # High LST and Low vegetation cover
        if lst > 34.0 and ndvi < 0.25:
            priority = "Critical" if risk_score > 0.75 else ("High" if risk_score > 0.5 else "Medium")
            recommendations.append({
                "mitigation_type": "Tree Plantation",
                "description": f"Urban tree canopy enhancement recommended. Current NDVI ({ndvi:.2f}) is below target threshold, combined with high surface temperature ({lst:.1f}°C). Planting broadleaf native trees can decrease surface temperatures by 2-4°C.",
                "priority": priority
            })

        # Rule 2: Cool Roofs
        # High built-up index and High LST
        if ndbi > 0.35 and lst > 35.0:
            priority = "Critical" if risk_score > 0.8 else ("High" if risk_score > 0.6 else "Medium")
            recommendations.append({
                "mitigation_type": "Cool Roofs",
                "description": f"High density urban built-up area detected (NDBI: {ndbi:.2f}). Retrofitting residential and commercial buildings with high-albedo cool roofs or green roofs is recommended to mitigate building heat absorption.",
                "priority": priority
            })

        # Rule 3: Water Body Restoration
        # Low NDWI in dry or heat-prone zones
        if ndwi < -0.1 and risk_score > 0.6:
            priority = "High" if risk_score > 0.75 else "Medium"
            recommendations.append({
                "mitigation_type": "Water Body Restoration",
                "description": "Restoration of local micro-waterbodies or creation of bioswales recommended. Adding water bodies leverages evaporative cooling to regulate local climate temperatures.",
                "priority": priority
            })

        # Rule 4: Green Corridors
        # High built-up ratio with low vegetation connectivity
        if ndbi > 0.4 and ndvi < 0.15:
            recommendations.append({
                "mitigation_type": "Green Corridors",
                "description": "Establish continuous linear green belts or landscaped roadsides. Green corridors break up urban heat islands and connect isolated ecological hubs.",
                "priority": "High"
            })

        # Rule 5: Open Spaces
        # Extreme Risk with moderate build-ups
        if risk_score > 0.75:
            priority = "Critical" if risk_score > 0.85 else "High"
            recommendations.append({
                "mitigation_type": "Open Spaces",
                "description": "Develop pocket parks, community gardens, or unpaved public plazas. Open spaces reduce convective heat retention and support nighttime radiative cooling.",
                "priority": priority
            })

        # Default fallback if nothing triggered (rare)
        if not recommendations:
            recommendations.append({
                "mitigation_type": "Tree Plantation",
                "description": "Routine urban landscaping and shade tree planting to maintain stable thermal profiles.",
                "priority": "Low"
            })

        return recommendations

recommendation_engine = RecommendationEngine()
