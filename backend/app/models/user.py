from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class RoleEnum:
    LEARNER = "learner"
    TRAINER = "trainer"
    MANAGER = "manager"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default=RoleEnum.LEARNER, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    profile = relationship("OfficialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    competency_results = relationship("CompetencyResult", back_populates="user", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="user", cascade="all, delete-orphan")
    quiz_attempts = relationship("QuizAttempt", back_populates="user", cascade="all, delete-orphan")
    learning_paths = relationship("LearningPath", back_populates="user", cascade="all, delete-orphan")
    learning_progress = relationship("UserLearningProgress", back_populates="user", cascade="all, delete-orphan")
    ai_interactions = relationship("AIAssistantInteraction", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="user")

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    job_roles = relationship("JobRole", back_populates="department", cascade="all, delete-orphan")
    profiles = relationship("OfficialProfile", back_populates="department")

class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    cadre = Column(String(100), default="ISS", nullable=False)  # ISS, SSS, Contract, DES
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    department = relationship("Department", back_populates="job_roles")
    profiles = relationship("OfficialProfile", back_populates="job_role")
    competency_requirements = relationship("RoleCompetencyRequirement", back_populates="job_role", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="job_role")

class OfficialProfile(Base):
    __tablename__ = "official_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    designation = Column(String(255), nullable=False)
    department_id = Column(Integer, ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    job_role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="SET NULL"), nullable=True)
    employee_code = Column(String(100), unique=True, nullable=True)
    current_assignment = Column(Text, nullable=True)
    cadre = Column(String(100), default="ISS", nullable=False)
    state_posting = Column(String(100), default="New Delhi", nullable=False)
    educational_qualifications = Column(JSON, default=list)  # list of degrees/certifications
    work_experience_years = Column(Integer, default=5, nullable=False)
    previous_trainings = Column(JSON, default=list)  # list of completed trainings
    learning_preferences = Column(JSON, default=lambda: {"formats": ["online", "hands_on"], "pace": "moderate"})
    preferred_language = Column(String(20), default="en", nullable=False)  # "en", "hi"
    career_objectives = Column(Text, nullable=True)
    verified_by_manager = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="profile")
    department = relationship("Department", back_populates="profiles")
    job_role = relationship("JobRole", back_populates="profiles")
