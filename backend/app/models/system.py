from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="system", nullable=False)  # assessment, recommendation, system, sync
    is_read = Column(Boolean, default=False, nullable=False)
    action_url = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="notifications")

class IntegrationSetting(Base):
    __tablename__ = "integration_settings"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), unique=True, nullable=False)  # igot_karmayogi, nssta_api, parichay_sso
    is_enabled = Column(Boolean, default=True, nullable=False)
    is_demo_mode = Column(Boolean, default=True, nullable=False)
    config_data = Column(JSON, default=dict)
    status = Column(String(50), default="healthy", nullable=False)  # healthy, warning, error, demo_mode
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

class SyncLog(Base):
    __tablename__ = "sync_logs"

    id = Column(Integer, primary_key=True, index=True)
    service_name = Column(String(100), nullable=False)
    sync_type = Column(String(100), nullable=False)  # courses, enrollments, completions, competency_framework
    records_synced = Column(Integer, default=0, nullable=False)
    status = Column(String(50), default="success", nullable=False)  # success, failed, partial
    details = Column(JSON, default=dict)
    started_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False)  # login, assessment_submitted, quiz_created, profile_updated, admin_change
    resource_type = Column(String(100), nullable=False)  # user, assessment, competency, quiz, system
    resource_id = Column(String(100), nullable=True)
    ip_address = Column(String(50), nullable=True)
    details = Column(JSON, default=dict)
    timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="audit_logs")
