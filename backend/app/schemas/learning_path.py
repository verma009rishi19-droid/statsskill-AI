from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class LearningPathModuleResponse(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    order_index: int
    competency_id: Optional[int] = None
    competency_name: Optional[str] = None
    course_id: Optional[int] = None
    course_title: Optional[str] = None
    course_url: Optional[str] = None
    course_provider: Optional[str] = None
    nssta_programme_id: Optional[int] = None
    nssta_title: Optional[str] = None
    is_mandatory: bool
    estimated_hours: float
    status: str = "not_started"  # not_started, in_progress, completed
    progress_pct: float = 0.0

    class Config:
        from_attributes = True

class LearningPathResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: Optional[str] = None
    target_job_role_id: Optional[int] = None
    total_modules: int
    completed_modules: int = 0
    progress_pct: float = 0.0
    estimated_hours: float
    created_at: datetime
    modules: List[LearningPathModuleResponse] = []

    class Config:
        from_attributes = True

class UpdateModuleProgressRequest(BaseModel):
    module_id: int
    status: str  # in_progress, completed
    progress_pct: float
    time_spent_minutes: Optional[int] = 0
    notes: Optional[str] = None
