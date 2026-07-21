from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.core.database import Base

# Note: Geometry columns replaced with JSON for Render free tier compatibility
# (PostGIS extension not available on Render free PostgreSQL)
# Geometry data stored as GeoJSON-compatible dict in JSON columns.

class SpatialZone(Base):
    __tablename__ = "spatial_zones"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    description = Column(String, nullable=True)
    geometry = Column(JSON, nullable=True)  # GeoJSON Polygon dict
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    predictions = relationship("MLPrediction", back_populates="zone", cascade="all, delete-orphan")
    recommendations = relationship("MitigationRecommendation", back_populates="zone", cascade="all, delete-orphan")


class RasterIndex(Base):
    __tablename__ = "raster_indices"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    processed_at = Column(DateTime(timezone=True), server_default=func.now())
    ndvi_avg = Column(Float, nullable=True)
    ndbi_avg = Column(Float, nullable=True)
    ndwi_avg = Column(Float, nullable=True)
    lst_avg = Column(Float, nullable=True)
    grid_data = Column(JSON, nullable=True)
    geometry = Column(JSON, nullable=True)  # GeoJSON Polygon dict


class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True)
    zone_id = Column(Integer, ForeignKey("spatial_zones.id", ondelete="CASCADE"), nullable=True)
    model_name = Column(String, nullable=False)
    heat_risk_score = Column(Float, nullable=False)
    heat_category = Column(String, nullable=False)
    heat_vulnerability = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    geometry = Column(JSON, nullable=True)  # GeoJSON Polygon dict

    zone = relationship("SpatialZone", back_populates="predictions")
    recommendations = relationship("MitigationRecommendation", back_populates="prediction", cascade="all, delete-orphan")


class MitigationRecommendation(Base):
    __tablename__ = "mitigation_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    prediction_id = Column(Integer, ForeignKey("ml_predictions.id", ondelete="CASCADE"), nullable=True)
    zone_id = Column(Integer, ForeignKey("spatial_zones.id", ondelete="CASCADE"), nullable=True)
    mitigation_type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    priority = Column(String, default="Medium")
    geometry = Column(JSON, nullable=True)  # GeoJSON Polygon dict
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    zone = relationship("SpatialZone", back_populates="recommendations")
    prediction = relationship("MLPrediction", back_populates="recommendations")
