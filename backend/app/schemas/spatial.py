from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class SpatialZoneBase(BaseModel):
    name: str
    description: Optional[str] = None

class SpatialZoneCreate(SpatialZoneBase):
    # GeoJSON geometry dictionary
    geometry: Dict[str, Any]

class SpatialZoneResponse(SpatialZoneBase):
    id: int
    geometry: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class RasterIndexBase(BaseModel):
    filename: str
    ndvi_avg: Optional[float] = None
    ndbi_avg: Optional[float] = None
    ndwi_avg: Optional[float] = None
    lst_avg: Optional[float] = None
    grid_data: Optional[List[Dict[str, Any]]] = None

class RasterIndexCreate(RasterIndexBase):
    geometry: Dict[str, Any]

class RasterIndexResponse(RasterIndexBase):
    id: int
    processed_at: datetime
    geometry: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class MLPredictionBase(BaseModel):
    model_name: str
    heat_risk_score: float
    heat_category: str
    heat_vulnerability: float

class MLPredictionCreate(MLPredictionBase):
    zone_id: Optional[int] = None
    geometry: Dict[str, Any]

class MLPredictionResponse(MLPredictionBase):
    id: int
    zone_id: Optional[int] = None
    geometry: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


class MitigationRecommendationBase(BaseModel):
    mitigation_type: str
    description: str
    priority: str

class MitigationRecommendationCreate(MitigationRecommendationBase):
    prediction_id: Optional[int] = None
    zone_id: Optional[int] = None
    geometry: Dict[str, Any]

class MitigationRecommendationResponse(MitigationRecommendationBase):
    id: int
    prediction_id: Optional[int] = None
    zone_id: Optional[int] = None
    geometry: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True


# Aggregated Ward metrics
class WardReportMetric(BaseModel):
    zone_id: int
    zone_name: str
    avg_lst: float
    avg_ndvi: float
    avg_ndbi: float
    avg_ndwi: float
    avg_heat_risk: float
    vulnerability_index: float
    dominant_category: str
    recommended_actions: List[str]
    geometry: Dict[str, Any]
