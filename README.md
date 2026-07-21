# UrbanHeatAI - Heat Mitigation & Risk Assessment Platform

UrbanHeatAI is a production-ready geospatial full-stack application built for the **ISRO BAH 2026 Challenge**. It monitors, calculates, and predicts Urban Heat Islands (UHI), Land Surface Temperatures (LST), and provides automated mitigation recommendations based on satellite image spectral analysis and machine learning.

## Features

1.  **Biophysical Spectral Indexes**: Automatically uploads satellite band images (GeoTIFFs) to calculate NDVI (Vegetation), NDBI (Built-up), NDWI (Water), and LST (Land Surface Temperature).
2.  **Machine Learning Predictive Modeling**: Fits Scikit-learn (Random Forest) and XGBoost estimators using raster-derived biophysical parameters to predict **Heat Risk Score**, **Heat Category** (Low, Medium, High, Extreme), and **Heat Vulnerability**.
3.  **Heuristics Recommendation Engine**: Outputs spatial overlays recommending mitigations like **Tree Plantation**, **Green Corridors**, **Cool Roofs**, **Water Body Restoration**, and **Open Spaces** with priority rankings.
4.  **Interactive GIS Interface**: Leaflet-based spatial dashboard with geocoding city search, drawing polygon borders, real-time coordinate logging, and GeoJSON boundaries export.
5.  **Analytics & reporting**: Visualizes spatial trends using interactive Recharts diagrams, with structured **PDF reports** and **CSV datasets** downloads.
6.  **Premium Space-Telemetry Design System**: Sleek glassmorphic theme with space-inspired grid telemetry lines, shimmering skeletons, and notification toasts.

## Technology Stack

*   **Frontend**: React (Vite) + TypeScript + Tailwind CSS + Leaflet (map) + Recharts (charts)
*   **Backend**: FastAPI + SQLAlchemy + PostGIS + Rasterio + GeoPandas + OpenCV + Scikit-Learn + XGBoost + Fpdf2
*   **Database**: PostgreSQL 16 + PostGIS spatial extensions
*   **DevOps**: Docker Compose Orchestration

## Setup & Running the Application

### Prerequisites

*   Docker Desktop installed.
*   Node.js (for local frontend development optional, Docker handles everything).

### Start the Services

From the root directory, execute:

```bash
docker compose up --build
```

This launches:
*   **Database**: `localhost:5432` (PostgreSQL with PostGIS)
*   **FastAPI Backend**: `localhost:8000` (API documentation accessible at `/docs`)
*   **React Frontend**: `localhost:5173` (Vite dev server)

### Default Credentials & Test Users

*   **Administrator**: `admin@urbanheatai.gov.in` / `urbanheatsecretpass` (auto-escalates to admin role based on prefix)
*   **Standard User**: `user@urbanheatai.gov.in` / `urbanheatsecretpass`

## Live Data Integration vs. Mocks (Provenance)

The platform is configured with an active Bhuvan satellite telemetry pipeline to make it production-ready for the ISRO BAH Hackathon.

1. **Bhuvan Satellite Telemetry (LIVE)**:
   - **Bhuvan WMS Fetch**: Active backend parser that contacts NRSC Bhuvan public WMS capabilities endpoint (`https://bhuvan-vec1.nrsc.gov.in/bhuvan/wms`) when searching/pointing coordinates.
   - **Disk Caching**: Successful WMS metadata structures (satellite platform pass times, sensor types, processing levels) are cached locally to `backend/app/cache/bhuvan_cache.json`.
   - **Offline Fallback**: If the server is offline or Bhuvan services time out, it loads cached data (marked as `LOCAL_CACHE` origin) or simulated mocks (marked as `OFFLINE_MOCK` origin) to guarantee stable showcases.

2. **Biophysical Calculations (LIVE)**:
   - NDVI, NDBI, NDWI and LST averages are calculated server-side based on boundary coordinates grids.

3. **Forecast & Alert Engine (LIVE Logic)**:
   - Alert thresholds are re-evaluated server-side against computed LST indices. Notification delivery triggers dispatch reports with accurate system timestamps.
