from sqlalchemy import Column, Integer, String, Float, ForeignKey, Text, JSON, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class CompetencyDomain(Base):
    __tablename__ = "competency_domains"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(100), unique=True, nullable=False)  # statistical, technical, digital_governance, behavioural_managerial
    description = Column(Text, nullable=True)
    display_order = Column(Integer, default=1, nullable=False)

    competencies = relationship("Competency", back_populates="domain", cascade="all, delete-orphan")

class Competency(Base):
    __tablename__ = "competencies"

    id = Column(Integer, primary_key=True, index=True)
    domain_id = Column(Integer, ForeignKey("competency_domains.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    scale_min = Column(Integer, default=1, nullable=False)
    scale_max = Column(Integer, default=4, nullable=False)
    # Proficiency rubrics with descriptions for Level 1, 2, 3, 4
    proficiency_rubric = Column(JSON, default=lambda: {
        "1": "Awareness: Basic foundational understanding of concepts and terminology.",
        "2": "Working: Can apply standard procedures and techniques under supervision.",
        "3": "Proficient: Independently manages complex statistical operations and analysis.",
        "4": "Expert: Strategic authority, designs frameworks, trains and guides other officials."
    })
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    domain = relationship("CompetencyDomain", back_populates="competencies")
    role_requirements = relationship("RoleCompetencyRequirement", back_populates="competency", cascade="all, delete-orphan")
    results = relationship("CompetencyResult", back_populates="competency", cascade="all, delete-orphan")
    course_mappings = relationship("CourseCompetencyMapping", back_populates="competency", cascade="all, delete-orphan")
    assessment_questions = relationship("AssessmentQuestion", back_populates="competency")

class RoleCompetencyRequirement(Base):
    __tablename__ = "role_competency_requirements"
    __table_args__ = (
        UniqueConstraint('job_role_id', 'competency_id', name='_role_competency_uc'),
    )

    id = Column(Integer, primary_key=True, index=True)
    job_role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    required_proficiency = Column(Float, nullable=False)  # 1.0 - 4.0
    importance = Column(String(50), default="high", nullable=False)  # critical, high, medium, desirable
    weight = Column(Float, default=1.0, nullable=False)
    prerequisites = Column(JSON, default=list)  # list of prerequisite competency codes

    job_role = relationship("JobRole", back_populates="competency_requirements")
    competency = relationship("Competency", back_populates="role_requirements")

class CompetencyResult(Base):
    __tablename__ = "competency_results"
    __table_args__ = (
        UniqueConstraint('user_id', 'competency_id', name='_user_competency_result_uc'),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    assessed_proficiency = Column(Float, nullable=False)  # 1.0 - 4.0
    confidence_score = Column(Float, default=0.85, nullable=False)  # 0.0 - 1.0
    evidence_type = Column(String(100), default="diagnostic_assessment", nullable=False)
    last_assessed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    supporting_notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="competency_results")
    competency = relationship("Competency", back_populates="results")
