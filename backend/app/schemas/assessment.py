from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class AssessmentQuestionPublic(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    competency_id: int
    question_text: str
    options: List[str]
    difficulty: str
    points: int

class AssessmentDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    job_role_id: Optional[int] = None
    domain_id: Optional[int] = None
    difficulty: str
    time_limit_minutes: int
    passing_score_pct: float
    is_active: bool
    total_questions: int
    questions: List[AssessmentQuestionPublic] = []

class AssessmentSummaryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: Optional[str] = None
    job_role_id: Optional[int] = None
    difficulty: str
    time_limit_minutes: int
    passing_score_pct: float
    total_questions: int
    created_at: datetime

class QuestionAnswerSubmission(BaseModel):
    question_id: int
    selected_option_index: Optional[int] = None  # None if skipped
    time_taken_seconds: Optional[int] = 0

class AssessmentSubmitRequest(BaseModel):
    assessment_id: int
    responses: List[QuestionAnswerSubmission]

class QuestionResultReview(BaseModel):
    question_id: int
    question_text: str
    options: List[str]
    selected_option_index: Optional[int]
    correct_option_index: int
    is_correct: bool
    explanation: str
    points_awarded: float
    competency_name: str

class CompetencyScoreBreakdown(BaseModel):
    competency_id: int
    competency_name: str
    score: float
    max_score: float
    percentage: float
    assigned_proficiency: float
    proficiency_label: str
    status: str

class AssessmentAttemptResultResponse(BaseModel):
    attempt_id: int
    assessment_id: int
    assessment_title: str
    user_id: int
    score: float
    max_score: float
    percentage: float
    passed: bool
    status: str
    started_at: datetime
    completed_at: datetime
    strengths: List[str]
    areas_for_improvement: List[str]
    competency_breakdown: List[CompetencyScoreBreakdown]
    question_reviews: List[QuestionResultReview]
