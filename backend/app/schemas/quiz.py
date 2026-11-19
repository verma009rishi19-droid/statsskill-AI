from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class DocumentUploadResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    file_size_bytes: int
    word_count: int
    text_preview: str
    summary: Optional[str] = None
    created_at: datetime

class QuestionDraft(BaseModel):
    question_text: str
    options: List[str]  # exactly 4 options
    correct_option_index: int  # 0 to 3
    explanation: str
    difficulty: str
    competency_id: Optional[int] = None
    competency_name: Optional[str] = None
    source_reference: Optional[str] = None

class QuizGenerateRequest(BaseModel):
    document_id: int
    competency_id: Optional[int] = None
    difficulty: Optional[str] = "intermediate"  # foundational, intermediate, advanced
    num_questions: int = 5
    target_language: str = "en"

class QuizGenerateResponse(BaseModel):
    document_id: int
    title: str
    difficulty: str
    generated_questions: List[QuestionDraft]
    generation_source: str  # "gemini_api" or "curated_domain_extractor"

class QuizSaveRequest(BaseModel):
    document_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    competency_id: Optional[int] = None
    difficulty: str = "intermediate"
    questions: List[QuestionDraft]

class QuizQuestionPublic(BaseModel):
    id: int
    question_text: str
    options: List[str]
    difficulty: str
    source_reference: Optional[str] = None

    class Config:
        from_attributes = True

class QuizDetailResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    difficulty: str
    total_questions: int
    competency_id: Optional[int] = None
    competency_name: Optional[str] = None
    created_at: datetime
    questions: List[QuizQuestionPublic] = []

    class Config:
        from_attributes = True

class QuizSubmissionAnswer(BaseModel):
    question_id: int
    selected_option_index: int

class QuizSubmitRequest(BaseModel):
    quiz_id: int
    answers: List[QuizSubmissionAnswer]

class QuizQuestionReview(BaseModel):
    question_id: int
    question_text: str
    options: List[str]
    selected_option_index: int
    correct_option_index: int
    is_correct: bool
    explanation: str
    source_reference: Optional[str] = None

class QuizAttemptResultResponse(BaseModel):
    attempt_id: int
    quiz_id: int
    quiz_title: str
    score: int
    total_questions: int
    percentage: float
    passed: bool
    completed_at: datetime
    question_reviews: List[QuizQuestionReview]
