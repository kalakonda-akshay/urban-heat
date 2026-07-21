from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from app.services.bhuvan_service import BhuvanService

router = APIRouter()

class BhuvanFetchRequest(BaseModel):
    min_lat: float
    min_lon: float
    max_lat: float
    max_lon: float

@router.post("/fetch")
def fetch_bhuvan_data(payload: BhuvanFetchRequest) -> Dict[str, Any]:
    """
    API endpoint connecting to the Bhuvan service parser.
    Fetches real/cached coordinates grids and outputs calculated index parameters.
    """
    try:
        data = BhuvanService.fetch_satellite_data(
            min_lat=payload.min_lat,
            min_lon=payload.min_lon,
            max_lat=payload.max_lat,
            max_lon=payload.max_lon
        )
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Bhuvan fetch failed: {str(e)}")
