from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from geoalchemy2 import Geometry
from app.core.database import Base

class SpatialZone(Base):
    __tablename__ = "spatial_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    geometry = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    predictions = relationship("MLPrediction", back_populates="zone", cascade="all, delete-orphan")
    recommendations = relationship("MitigationRecommendation", back_populates="zone", cascade="all, delete-orphan")


class RasterIndex(Base):
    __tablename__ = "raster_indices"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
    # Store aggregated metrics: e.g. min, max, average indices (NDVI, NDBI, NDWI, LST)
    ndvi_avg = Column(Float, nullable=True)
    ndbi_avg = Column(Float, nullable=True)
    ndwi_avg = Column(Float, nullable=True)
    lst_avg = Column(Float, nullable=True)
    
    # Grid analysis stats stored as JSON (e.g., list of grid points and scores)
    grid_data = Column(JSON, nullable=True)
    # Area geometry
    geometry = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=True)


class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("spatial_zones.id", ondelete="CASCADE"), nullable=True)
    model_name = Column(String, nullable=False) # 'Random Forest' or 'XGBoost'
    heat_risk_score = Column(Float, nullable=False) # 0.0 to 1.0 or 0 to 100
    heat_category = Column(String, nullable=False) # 'Low', 'Medium', 'High', 'Extreme'
    heat_vulnerability = Column(Float, nullable=False) # 0.0 to 1.0
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    # Prediction geometry overlay
    geometry = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=False)

    zone = relationship("SpatialZone", back_populates="predictions")
    recommendations = relationship("MitigationRecommendation", back_populates="prediction", cascade="all, delete-orphan")


class MitigationRecommendation(Base):
    __tablename__ = "mitigation_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("ml_predictions.id", ondelete="CASCADE"), nullable=True)
    zone_id = Column(Integer, ForeignKey("spatial_zones.id", ondelete="CASCADE"), nullable=True)
    
    # Mitigation types: 'Tree Plantation', 'Green Corridors', 'Cool Roofs', 'Water Body Restoration', 'Open Spaces'
    mitigation_type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, default="Medium") # 'Low', 'Medium', 'High', 'Critical'
    
    geometry = Column(Geometry(geometry_type='POLYGON', srid=4326), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    zone = relationship("SpatialZone", back_populates="recommendations")
    prediction = relationship("MLPrediction", back_populates="recommendations")
