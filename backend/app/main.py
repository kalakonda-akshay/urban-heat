from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

# Connect and create tables
try:
    # Attempt to load spatial extensions if missing
    with engine.connect() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
        conn.commit()
    
    # Generate tables
    Base.metadata.create_all(bind=engine)
    print("Database tables initialized successfully.")
except Exception as e:
    print(f"Database initialization warning (PostGIS check failed or DB unreachable): {str(e)}")

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS configuration
origins = [
    "http://localhost:5173", # Vite default
    "http://127.0.0.1:5173",
    "http://localhost",
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "message": f"Welcome to the {settings.PROJECT_NAME} API Portal. Access docs at /docs."
    }

@app.get("/health")
@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}
