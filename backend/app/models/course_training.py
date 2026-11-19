from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    provider = Column(String(100), default="iGOT Karmayogi", nullable=False)  # "iGOT Karmayogi", "NSSTA", "MoSPI Internal"
    provider_course_id = Column(String(100), nullable=True)  # external ID for iGOT/NSSTA
    external_url = Column(String(500), nullable=False)
    description = Column(Text, nullable=False)
    duration_hours = Column(Float, default=4.0, nullable=False)
    difficulty_level = Column(String(50), default="intermediate", nullable=False)  # foundational, intermediate, advanced
    language = Column(String(20), default="English", nullable=False)
    format = Column(String(50), default="online_self_paced", nullable=False)  # online_self_paced, webinar, residential
    thumbnail_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    competency_mappings = relationship("CourseCompetencyMapping", back_populates="course", cascade="all, delete-orphan")
    learning_path_modules = relationship("LearningPathModule", back_populates="course")
    user_progress = relationship("UserLearningProgress", back_populates="course")

class CourseCompetencyMapping(Base):
    __tablename__ = "course_competency_mappings"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    target_proficiency = Column(Float, default=3.0, nullable=False)  # target level 1.0 - 4.0
    coverage_weight = Column(Float, default=1.0, nullable=False)  # how thoroughly it covers the competency

    course = relationship("Course", back_populates="competency_mappings")
    competency = relationship("Competency", back_populates="course_mappings")

class NSSTATrainingProgramme(Base):
    __tablename__ = "nssta_training_programmes"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    source_organization = Column(String(255), default="National Statistical Systems Training Academy (NSSTA)", nullable=False)
    tpac_approval_status = Column(String(50), default="verified_recommended", nullable=False)  # verified_recommended, pending_review, archived
    tpac_reference_number = Column(String(100), nullable=True)  # e.g. "TPAC/NSSTA/2026/04"
    competencies_covered = Column(JSON, default=list)  # list of competency codes/names
    target_job_roles = Column(JSON, default=list)  # list of eligible job role codes/titles
    eligibility_criteria = Column(Text, nullable=True)
    prerequisites = Column(Text, nullable=True)
    duration_days = Column(Integer, default=5, nullable=False)
    delivery_format = Column(String(100), default="residential_at_nssta", nullable=False)  # residential_at_nssta, online, hybrid
    schedule_dates = Column(JSON, default=list)  # list of batch dates: [{"batch": 1, "start": "...", "end": "..."}]
    official_url = Column(String(500), nullable=True)
    source_reference = Column(String(255), default="NSSTA Annual Training Calendar 2026-27", nullable=False)
    last_verified_date = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    learning_path_modules = relationship("LearningPathModule", back_populates="nssta_programme")
