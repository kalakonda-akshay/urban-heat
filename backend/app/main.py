from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1.router import api_router

# Import all models so SQLAlchemy knows about them for create_all
from app.models import spatial, user  # noqa: F401


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database tables on startup."""
    try:
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables initialized successfully.")
    except Exception as e:
        print(f"⚠️ Database initialization warning: {str(e)}")
    yield
    # Shutdown logic (if any) goes here


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# CORS — allow all origins (frontend on Vercel + local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {
        "status": "online",
        "message": f"Welcome to the {settings.PROJECT_NAME} API. Docs: /docs"
    }


@app.get("/health")
@app.get("/api/v1/health")
def health():
    return {"status": "ok", "service": settings.PROJECT_NAME}
