from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class LearningPath(Base):
    __tablename__ = "learning_paths"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    target_job_role_id = Column(Integer, ForeignKey("job_roles.id", ondelete="SET NULL"), nullable=True)
    total_modules = Column(Integer, default=0, nullable=False)
    estimated_hours = Column(Float, default=0.0, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="learning_paths")
    target_job_role = relationship("JobRole")
    modules = relationship("LearningPathModule", back_populates="learning_path", cascade="all, delete-orphan", order_by="LearningPathModule.order_index")
    progress_records = relationship("UserLearningProgress", back_populates="learning_path", cascade="all, delete-orphan")

class LearningPathModule(Base):
    __tablename__ = "learning_path_modules"

    id = Column(Integer, primary_key=True, index=True)
    learning_path_id = Column(Integer, ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    order_index = Column(Integer, default=1, nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="SET NULL"), nullable=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    nssta_programme_id = Column(Integer, ForeignKey("nssta_training_programmes.id", ondelete="SET NULL"), nullable=True)
    is_mandatory = Column(Boolean, default=True, nullable=False)
    estimated_hours = Column(Float, default=2.0, nullable=False)

    learning_path = relationship("LearningPath", back_populates="modules")
    competency = relationship("Competency")
    course = relationship("Course", back_populates="learning_path_modules")
    nssta_programme = relationship("NSSTATrainingProgramme", back_populates="learning_path_modules")
    progress_records = relationship("UserLearningProgress", back_populates="module", cascade="all, delete-orphan")

class UserLearningProgress(Base):
    __tablename__ = "user_learning_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    learning_path_id = Column(Integer, ForeignKey("learning_paths.id", ondelete="CASCADE"), nullable=False)
    module_id = Column(Integer, ForeignKey("learning_path_modules.id", ondelete="CASCADE"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="SET NULL"), nullable=True)
    status = Column(String(50), default="not_started", nullable=False)  # not_started, in_progress, completed
    progress_pct = Column(Float, default=0.0, nullable=False)
    time_spent_minutes = Column(Integer, default=0, nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    verified_by_igot = Column(Boolean, default=False, nullable=False)
    notes = Column(Text, nullable=True)

    user = relationship("User", back_populates="learning_progress")
    learning_path = relationship("LearningPath", back_populates="progress_records")
    module = relationship("LearningPathModule", back_populates="progress_records")
    course = relationship("Course", back_populates="user_progress")
