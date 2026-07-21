from shapely.geometry import shape, mapping
from shapely.wkb import loads
from geoalchemy2.shape import to_shape
from typing import Dict, Any

def geojson_to_wkt(geojson: Dict[str, Any]) -> str:
    """
    Converts a GeoJSON geometry dictionary to a WKT string with SRID 4326.
    """
    try:
        geom = shape(geojson)
        return f"SRID=4326;{geom.wkt}"
    except Exception as e:
        raise ValueError(f"Invalid GeoJSON geometry: {str(e)}")

def wkb_to_geojson(wkb_element) -> Dict[str, Any]:
    """
    Converts a GeoAlchemy2 WKB element to a GeoJSON geometry dictionary.
    """
    if wkb_element is None:
        return {}
    try:
        # Attempt conversion using geoalchemy2 to_shape
        geom = to_shape(wkb_element)
        return mapping(geom)
    except Exception:
        try:
            # Fallback direct WKB load
            geom = loads(bytes(wkb_element.data))
            return mapping(geom)
        except Exception:
            return {}
