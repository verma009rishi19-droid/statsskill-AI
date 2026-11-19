from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Text, JSON, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(50), nullable=False)  # pdf, docx, pptx, txt
    file_size_bytes = Column(Integer, nullable=False)
    extracted_text = Column(Text, nullable=True)
    word_count = Column(Integer, default=0, nullable=False)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="documents")
    quizzes = relationship("Quiz", back_populates="document", cascade="all, delete-orphan")

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="SET NULL"), nullable=True)
    creator_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="SET NULL"), nullable=True)
    difficulty = Column(String(50), default="intermediate", nullable=False)  # foundational, intermediate, advanced
    total_questions = Column(Integer, default=5, nullable=False)
    source_language = Column(String(20), default="en", nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    document = relationship("Document", back_populates="quizzes")
    competency = relationship("Competency")
    questions = relationship("QuizQuestion", back_populates="quiz", cascade="all, delete-orphan")
    attempts = relationship("QuizAttempt", back_populates="quiz", cascade="all, delete-orphan")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"

    id = Column(Integer, primary_key=True, index=True)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id", ondelete="SET NULL"), nullable=True)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)  # exactly 4 options
    correct_option_index = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=False)
    source_reference = Column(String(255), nullable=True)  # e.g., "Page 4, Section 2.1"
    difficulty = Column(String(50), default="intermediate", nullable=False)

    quiz = relationship("Quiz", back_populates="questions")
    competency = relationship("Competency")
    responses = relationship("QuizResponse", back_populates="question", cascade="all, delete-orphan")

class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    quiz_id = Column(Integer, ForeignKey("quizzes.id", ondelete="CASCADE"), nullable=False)
    score = Column(Integer, default=0, nullable=False)
    total_questions = Column(Integer, default=0, nullable=False)
    percentage = Column(Float, default=0.0, nullable=False)
    completed_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="quiz_attempts")
    quiz = relationship("Quiz", back_populates="attempts")
    responses = relationship("QuizResponse", back_populates="attempt", cascade="all, delete-orphan")

class QuizResponse(Base):
    __tablename__ = "quiz_responses"

    id = Column(Integer, primary_key=True, index=True)
    attempt_id = Column(Integer, ForeignKey("quiz_attempts.id", ondelete="CASCADE"), nullable=False)
    question_id = Column(Integer, ForeignKey("quiz_questions.id", ondelete="CASCADE"), nullable=False)
    selected_option_index = Column(Integer, nullable=False)
    is_correct = Column(Boolean, default=False, nullable=False)

    attempt = relationship("QuizAttempt", back_populates="responses")
    question = relationship("QuizQuestion", back_populates="responses")
