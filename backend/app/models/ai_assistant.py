from sqlalchemy import Column, Integer, String, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class AIAssistantInteraction(Base):
    __tablename__ = "ai_assistant_interactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    query = Column(Text, nullable=False)
    response = Column(Text, nullable=False)
    context_type = Column(String(50), default="general", nullable=False)  # general, concept, skill_gap, recommendations, lab
    language = Column(String(20), default="en", nullable=False)
    source_references = Column(JSON, default=list)  # list of citations/references
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="ai_interactions")
