from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    job_role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="SET NULL"), nullable=True)
    domain_id = Column(Integer, ForeignKey("competency_domains.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(String(50), default="intermediate", nullable=False)  # foundational, intermediate, advanced, mixed
    time_limit_minutes = Column(Integer, default=30, nullable=False)
    passing_score_pct = Column(Float, default=60.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    job_role = relationship("JobRole", back_populates="assessments")
    questions = relationship("AssessmentQuestion", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")

class AssessmentQuestion(Base):
    __tablename__ = "assessment_questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="CASCADE"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # ["Option A", "Option B", "Option C", "Option D"]
    correct_option_index = Column(Integer, nullable=False)  # 0, 1, 2, or 3
    explanation = Column(Text, nullable=False)
    difficulty = Column(String(50), default="intermediate", nullable=False)
    points = Column(Integer, default=1, nullable=False)

    assessment = relationship("Assessment", back_populates="questions")
    competency = relationship("Competency", back_populates="assessment_questions")
    responses = relationship("AssessmentResponse", back_populates="question", cascade="all, delete-orphan")

class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assessment_id = Column(Integer, ForeignKey("assessments.id", ondelete="CASCADE"), nullable=False)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    score = Column(Float, default=0.0, nullable=False)
    max_score = Column(Float, default=0.0, nullable=False)
    percentage = Column(Float, default=0.0, nullable=False)
    passed = Column(Boolean, default=False, nullable=False)
    status = Column(String(50), default="in_progress", nullable=False)  # in_progress, completed, timed_out
    competency_breakdown = Column(JSON, default=dict)  # {competency_id: {score: x, max: y, pct: z, assigned_level: l}}

    user = relationship("User", back_populates="assessment_attempts")
    assessment = relationship("Assessment", back_populates="attempts")
    responses = relationship("AssessmentResponse", back_populates="attempt", cascade="all, delete-orphan")

class AssessmentResponse(Base):
    __tablename__ = "assessment_responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("assessment_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("assessment_questions.id", ondelete="CASCADE"), nullable=False)
    selected_option_index = Column(Integer, nullable=True)  # None if skipped
    is_correct = Column(Boolean, default=False, nullable=False)
    points_awarded = Column(Float, default=0.0, nullable=False)
    time_taken_seconds = Column(Integer, default=0, nullable=False)

    attempt = relationship("AssessmentAttempt", back_populates="responses")
    question = relationship("AssessmentQuestion", back_populates="responses")
