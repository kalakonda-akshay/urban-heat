from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any

from app.api import deps
from app.models.spatial import SpatialZone
from app.schemas.spatial import SpatialZoneCreate, SpatialZoneResponse
from app.utils.geo_helpers import geojson_to_wkt, wkb_to_geojson

router = APIRouter()

@router.post("/", response_model=SpatialZoneResponse)
def create_zone(
    *,
    db: Session = Depends(deps.get_db),
    zone_in: SpatialZoneCreate,
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Create a new spatial zone.
    """
    try:
        wkt_geom = geojson_to_wkt(zone_in.geometry)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
        
    db_zone = SpatialZone(
        name=zone_in.name,
        description=zone_in.description,
        geometry=wkt_geom
    )
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    
    # Map back to response
    return SpatialZoneResponse(
        id=db_zone.id,
        name=db_zone.name,
        description=db_zone.description,
        geometry=wkb_to_geojson(db_zone.geometry),
        created_at=db_zone.created_at
    )

@router.get("/", response_model=List[SpatialZoneResponse])
def list_zones(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    List all spatial zones.
    """
    zones = db.query(SpatialZone).all()
    results = []
    for zone in zones:
        results.append(
            SpatialZoneResponse(
                id=zone.id,
                name=zone.name,
                description=zone.description,
                geometry=wkb_to_geojson(zone.geometry),
                created_at=zone.created_at
            )
        )
    return results

@router.delete("/{zone_id}")
def delete_zone(
    zone_id: int,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Delete a spatial zone. Only Admins can perform this action.
    """
    zone = db.query(SpatialZone).filter(SpatialZone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return {"status": "success", "message": f"Zone {zone_id} deleted."}
