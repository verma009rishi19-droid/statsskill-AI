from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class CourseCompetencyMappingResponse(BaseModel):
    competency_id: int
    competency_name: str
    target_proficiency: float
    coverage_weight: float

class CourseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    provider: str
    provider_course_id: Optional[str] = None
    external_url: str
    description: str
    duration_hours: float
    difficulty_level: str
    language: str
    format: str
    thumbnail_url: Optional[str] = None
    is_active: bool
    competencies_covered: List[CourseCompetencyMappingResponse] = []

class NSSTATrainingProgrammeResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    source_organization: str
    tpac_approval_status: str
    tpac_reference_number: Optional[str] = None
    competencies_covered: List[str] = []
    target_job_roles: List[str] = []
    eligibility_criteria: Optional[str] = None
    prerequisites: Optional[str] = None
    duration_days: int
    delivery_format: str
    schedule_dates: List[Dict[str, Any]] = []
    official_url: Optional[str] = None
    source_reference: str
    last_verified_date: datetime

class RecommendationItem(BaseModel):
    id: str  # e.g. "course_1" or "nssta_2"
    resource_type: str  # "igot_course", "nssta_programme", "practice_quiz"
    title: str
    provider: str
    external_url: Optional[str] = None
    addressed_competency_name: str
    addressed_competency_code: str
    gap_magnitude: float
    priority_level: str  # "High Priority", "Medium Priority", "Foundational"
    why_recommended: str
    learning_objectives: List[str]
    prerequisites: str
    estimated_duration: str
    expected_outcome: str
    format: str

class PersonalizedRecommendationsResponse(BaseModel):
    user_id: int
    job_role: str
    total_recommendations: int
    top_priority_gap: Optional[str] = None
    recommendations: List[RecommendationItem]
