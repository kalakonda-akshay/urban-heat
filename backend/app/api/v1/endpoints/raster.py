from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Any
import tempfile
import os

from app.api import deps
from app.models.spatial import RasterIndex
from app.schemas.spatial import RasterIndexResponse
from app.services.raster_processing import RasterProcessor
from app.utils.geo_helpers import geojson_to_wkt, wkb_to_geojson

router = APIRouter()

@router.post("/upload", response_model=RasterIndexResponse)
async def upload_raster(
    file: UploadFile = File(...),
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Upload a satellite imagery GeoTIFF (or image) and process spectral indexes (NDVI, NDBI, NDWI, LST).
    """
    # Create temp file
    suffix = os.path.splitext(file.filename)[1] or ".tif"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        # Process the image
        processed_data = RasterProcessor.process_satellite_image(tmp_path, file.filename)
        
        # Save to DB
        wkt_geom = geojson_to_wkt(processed_data["geometry"])
        db_raster = RasterIndex(
            filename=processed_data["filename"],
            ndvi_avg=processed_data["ndvi_avg"],
            ndbi_avg=processed_data["ndbi_avg"],
            ndwi_avg=processed_data["ndwi_avg"],
            lst_avg=processed_data["lst_avg"],
            grid_data=processed_data["grid_data"],
            geometry=wkt_geom
        )
        db.add(db_raster)
        db.commit()
        db.refresh(db_raster)
        
        return RasterIndexResponse(
            id=db_raster.id,
            filename=db_raster.filename,
            ndvi_avg=db_raster.ndvi_avg,
            ndbi_avg=db_raster.ndbi_avg,
            ndwi_avg=db_raster.ndwi_avg,
            lst_avg=db_raster.lst_avg,
            grid_data=db_raster.grid_data,
            geometry=wkb_to_geojson(db_raster.geometry),
            processed_at=db_raster.processed_at
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Raster processing failed: {str(e)}")
    finally:
        # Clean up temp file
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

@router.get("/", response_model=List[RasterIndexResponse])
def list_rasters(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    List all processed raster indexes.
    """
    rasters = db.query(RasterIndex).order_by(RasterIndex.processed_at.desc()).all()
    results = []
    for r in rasters:
        results.append(
            RasterIndexResponse(
                id=r.id,
                filename=r.filename,
                ndvi_avg=r.ndvi_avg,
                ndbi_avg=r.ndbi_avg,
                ndwi_avg=r.ndwi_avg,
                lst_avg=r.lst_avg,
                grid_data=r.grid_data,
                geometry=wkb_to_geojson(r.geometry),
                processed_at=r.processed_at
            )
        )
    return results
