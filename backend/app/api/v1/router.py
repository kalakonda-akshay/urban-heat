from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    zones,
    raster,
    ml,
    recommendations,
    reports,
    bhuvan
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(zones.router, prefix="/zones", tags=["Spatial Zones"])
api_router.include_router(raster.router, prefix="/raster", tags=["Raster Indices"])
api_router.include_router(ml.router, prefix="/ml", tags=["Machine Learning"])
api_router.include_router(recommendations.router, prefix="/recommendations", tags=["Mitigation Recommendations"])
api_router.include_router(reports.router, prefix="/reports", tags=["Reporting & Exports"])
api_router.include_router(bhuvan.router, prefix="/bhuvan", tags=["Bhuvan Data Fetcher"])
