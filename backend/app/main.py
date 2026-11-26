import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import Base, engine
import app.models  # load models
from app.core.seed_data import seed_all

from app.api.auth import router as auth_router
from app.api.profiles import router as profiles_router
from app.api.competencies import router as competencies_router
from app.api.assessments import router as assessments_router
from app.api.skill_gaps import router as skill_gaps_router
from app.api.recommendations import router as recommendations_router
from app.api.courses import router as courses_router
from app.api.nssta import router as nssta_router
from app.api.igot import router as igot_router
from app.api.learning_paths import router as learning_paths_router
from app.api.quiz_studio import router as quiz_studio_router
from app.api.assistant import router as assistant_router
from app.api.analytics import router as analytics_router
from app.api.admin import router as admin_router
from app.api.notifications import router as notifications_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    # Ensure uploads dir exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    # Seed data if empty
    try:
        seed_all()
    except Exception as e:
        print(f"Seed note: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_origin_regex=r"https://.*(\.vercel\.app|\.onrender\.com|\.tmp\.now)",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all API routers
api_prefix = settings.API_V1_STR
app.include_router(auth_router, prefix=api_prefix)
app.include_router(profiles_router, prefix=api_prefix)
app.include_router(competencies_router, prefix=api_prefix)
app.include_router(assessments_router, prefix=api_prefix)
app.include_router(skill_gaps_router, prefix=api_prefix)
app.include_router(recommendations_router, prefix=api_prefix)
app.include_router(courses_router, prefix=api_prefix)
app.include_router(nssta_router, prefix=api_prefix)
app.include_router(igot_router, prefix=api_prefix)
app.include_router(learning_paths_router, prefix=api_prefix)
app.include_router(quiz_studio_router, prefix=api_prefix)
app.include_router(assistant_router, prefix=api_prefix)
app.include_router(analytics_router, prefix=api_prefix)
app.include_router(admin_router, prefix=api_prefix)
app.include_router(notifications_router, prefix=api_prefix)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "system": "StatSkill AI",
        "version": settings.VERSION,
        "database": "connected (PostgreSQL statskill_ai_db)"
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to StatSkill AI - AI-Powered Skill Intelligence and Personalized Learning Platform for India's Official Statistical System",
        "api_docs": "/docs",
        "version": settings.VERSION
    }
