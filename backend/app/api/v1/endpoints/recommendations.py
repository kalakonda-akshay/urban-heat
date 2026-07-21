from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Any
from pydantic import BaseModel

from app.api import deps
from app.models.spatial import MLPrediction, MitigationRecommendation
from app.schemas.spatial import MitigationRecommendationResponse
from app.services.recommendation import recommendation_engine
from app.utils.geo_helpers import wkb_to_geojson

router = APIRouter()

class RecommendRequest(BaseModel):
    prediction_id: int

@router.post("/", response_model=List[MitigationRecommendationResponse])
def generate_recommendations_for_prediction(
    payload: RecommendRequest,
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    Generate mitigation recommendations for a given machine learning prediction.
    Calculates spatial options based on heat score levels and saves them to the DB.
    """
    pred = db.query(MLPrediction).filter(MLPrediction.id == payload.prediction_id).first()
    if not pred:
        raise HTTPException(status_code=404, detail="Prediction record not found")
        
    # Infer biophysical indices based on heat risk categories
    # to evaluate recommendation rules
    if pred.heat_category == "Extreme":
        lst, ndvi, ndbi, ndwi = 41.5, 0.08, 0.65, -0.25
    elif pred.heat_category == "High":
        lst, ndvi, ndbi, ndwi = 36.2, 0.18, 0.48, -0.15
    elif pred.heat_category == "Medium":
        lst, ndvi, ndbi, ndwi = 31.8, 0.35, 0.25, -0.05
    else:
        lst, ndvi, ndbi, ndwi = 26.5, 0.55, 0.12, 0.15
        
    recommendations_list = recommendation_engine.generate_recommendations(
        lst=lst, ndvi=ndvi, ndbi=ndbi, ndwi=ndwi, risk_score=pred.heat_risk_score
    )
    
    saved_records = []
    for rec in recommendations_list:
        db_rec = MitigationRecommendation(
            prediction_id=pred.id,
            zone_id=pred.zone_id,
            mitigation_type=rec["mitigation_type"],
            description=rec["description"],
            priority=rec["priority"],
            geometry=pred.geometry # Share prediction boundary geometry
        )
        db.add(db_rec)
        db.commit()
        db.refresh(db_rec)
        saved_records.append(db_rec)
        
    results = []
    for r in saved_records:
        results.append(
            MitigationRecommendationResponse(
                id=r.id,
                prediction_id=r.prediction_id,
                zone_id=r.zone_id,
                mitigation_type=r.mitigation_type,
                description=r.description,
                priority=r.priority,
                geometry=wkb_to_geojson(r.geometry),
                created_at=r.created_at
            )
        )
    return results

@router.get("/", response_model=List[MitigationRecommendationResponse])
def list_recommendations(
    db: Session = Depends(deps.get_db),
    current_user: Any = Depends(deps.get_current_user)
) -> Any:
    """
    List all generated mitigation recommendations.
    """
    recs = db.query(MitigationRecommendation).order_by(MitigationRecommendation.created_at.desc()).all()
    results = []
    for r in recs:
        results.append(
            MitigationRecommendationResponse(
                id=r.id,
                prediction_id=r.prediction_id,
                zone_id=r.zone_id,
                mitigation_type=r.mitigation_type,
                description=r.description,
                priority=r.priority,
                geometry=wkb_to_geojson(r.geometry),
                created_at=r.created_at
            )
        )
    return results
