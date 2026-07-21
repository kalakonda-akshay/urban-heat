from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any, Optional
from pydantic import BaseModel

from app.api import deps
from app.models.spatial import SpatialZone, MLPrediction, RasterIndex
from app.schemas.spatial import MLPredictionResponse
from app.services.ml_prediction import ml_predictor
from app.utils.geo_helpers import wkb_to_geojson, geojson_to_wkt

router = APIRouter()

class PredictRequest(BaseModel):
    lst: float
    ndvi: float
    ndbi: float
    ndwi: float
    model_name: Optional[str] = "Random Forest"
    zone_id: Optional[int] = None

@router.post("/predict", response_model=MLPredictionResponse)
def predict_heat_vulnerability(
    payload: PredictRequest,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Run machine learning model (Random Forest / XGBoost) to predict Heat Risk, Category, and Vulnerability.
    If zone_id is provided, the output is saved in the database associated with the zone's boundaries.
    """
    # Calculate predictions
    metrics = ml_predictor.predict_heat_metrics(
        lst=payload.lst,
        ndvi=payload.ndvi,
        ndbi=payload.ndbi,
        ndwi=payload.ndwi,
        model_name=payload.model_name
    )
    
    geom = None
    if payload.zone_id:
        zone = db.query(SpatialZone).filter(SpatialZone.id == payload.zone_id).first()
        if not zone:
            raise HTTPException(status_code=404, detail="Zone not found")
        geom = zone.geometry
    else:
        # Generate a fallback square geometry around Bangalore if no zone provided
        # so it displays on the map
        fallback_geojson = {
            "type": "Polygon",
            "coordinates": [[
                [77.58, 12.93],
                [77.60, 12.93],
                [77.60, 12.95],
                [77.58, 12.95],
                [77.58, 12.93]
            ]]
        }
        geom = geojson_to_wkt(fallback_geojson)
        
    db_prediction = MLPrediction(
        zone_id=payload.zone_id,
        model_name=payload.model_name,
        heat_risk_score=metrics["heat_risk_score"],
        heat_category=metrics["heat_category"],
        heat_vulnerability=metrics["heat_vulnerability"],
        geometry=geom
    )
    
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)
    
    return MLPredictionResponse(
        id=db_prediction.id,
        zone_id=db_prediction.zone_id,
        model_name=db_prediction.model_name,
        heat_risk_score=db_prediction.heat_risk_score,
        heat_category=db_prediction.heat_category,
        heat_vulnerability=db_prediction.heat_vulnerability,
        geometry=wkb_to_geojson(db_prediction.geometry),
        created_at=db_prediction.created_at
    )

@router.post("/train")
def train_models(
    current_user: Any = Depends(deps.get_current_active_admin)
) -> Any:
    """
    Retrain the ML models with the latest processed features. Admin only.
    """
    try:
        result = ml_predictor.train_models()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model training failed: {str(e)}")

@router.get("/predictions", response_model=List[MLPredictionResponse])
def list_predictions(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    List all saved ML predictions.
    """
    predictions = db.query(MLPrediction).order_by(MLPrediction.created_at.desc()).all()
    results = []
    for p in predictions:
        results.append(
            MLPredictionResponse(
                id=p.id,
                zone_id=p.zone_id,
                model_name=p.model_name,
                heat_risk_score=p.heat_risk_score,
                heat_category=p.heat_category,
                heat_vulnerability=p.heat_vulnerability,
                geometry=wkb_to_geojson(p.geometry),
                created_at=p.created_at
            )
        )
    return results
