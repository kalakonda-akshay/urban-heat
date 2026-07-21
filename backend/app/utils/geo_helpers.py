"""
geo_helpers.py - lightweight geometry utilities (no shapely/geoalchemy2 required).
Works with plain Python dicts for GeoJSON.
"""
from typing import Dict, Any


def geojson_to_wkt(geojson: Dict[str, Any]) -> str:
    """
    Convert a simple GeoJSON Polygon to WKT string.
    Supports Polygon type only (sufficient for ward-level data).
    """
    if geojson is None:
        return ""
    try:
        geom_type = geojson.get("type", "")
        coords = geojson.get("coordinates", [])
        if geom_type == "Polygon" and coords:
            ring = coords[0]
            pts = ", ".join(f"{x} {y}" for x, y in ring)
            return f"SRID=4326;POLYGON(({pts}))"
        return ""
    except Exception:
        return ""


def wkb_to_geojson(value: Any) -> Dict[str, Any]:
    """
    If the value is already a dict (JSON column), return it directly.
    """
    if value is None:
        return {}
    if isinstance(value, dict):
        return value
    return {}
