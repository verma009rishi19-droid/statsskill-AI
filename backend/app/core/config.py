import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "StatSkill AI"
    PROJECT_DESCRIPTION: str = "AI-Powered Skill Intelligence and Personalized Learning Platform for India's Official Statistical System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database — defaults to SQLite for local dev (no server needed)
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite:///./statskill_ai.db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "statskill_ai_super_secret_jwt_key_2026_production_ready")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000"
    ]
    
    # AI & Integrations
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
    
    # iGOT Karmayogi Integration
    IGOT_API_BASE_URL: str = os.getenv("IGOT_API_BASE_URL", "https://api.igotkarmayogi.gov.in/v1")
    IGOT_API_KEY: str = os.getenv("IGOT_API_KEY", "")
    IGOT_CLIENT_ID: str = os.getenv("IGOT_CLIENT_ID", "")
    IGOT_DEMO_MODE: bool = os.getenv("IGOT_DEMO_MODE", "true").lower() == "true"
    
    # File Storage
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads")
    MAX_UPLOAD_SIZE_MB: int = 25
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
