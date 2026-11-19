import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
import app.models  # Ensures all models are registered with Base.metadata
from app.services.seed_service import seed_database

# Routers
from app.routers import (
    auth,
    caregivers,
    employers,
    employment,
    salary,
    plans,
    policies,
    premiums,
    risk_assessment,
    claims,
    claim_documents,
    ai_assistant,
    notifications,
    admin,
    analytics,
)

def init_db():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Initialize on startup
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title=settings.APP_NAME,
    description="CareGap AI – AI-Powered Dual Income Protection Platform for Professional Caregivers (Option A: Medical Incapacity & Option B: Involuntary Job Loss)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Checks
@app.get("/")
def root():
    return {
        "app": settings.APP_NAME,
        "status": "healthy",
        "version": "1.0.0",
        "disclaimer": "Academic Insurance Technology Prototype. Not an actual regulated insurance offering."
    }

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY)
    }

# Register Routers
app.include_router(auth.router)
app.include_router(caregivers.router)
app.include_router(employers.router)
app.include_router(employment.router)
app.include_router(salary.router)
app.include_router(plans.router)
app.include_router(policies.router)
app.include_router(premiums.router)
app.include_router(risk_assessment.router)
app.include_router(claims.router)
app.include_router(claim_documents.router)
app.include_router(ai_assistant.router)
app.include_router(notifications.router)
app.include_router(admin.router)
app.include_router(analytics.router)
