from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class CompetencyDomainResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    description: Optional[str] = None
    display_order: int

class CompetencyResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    domain_id: int
    name: str
    code: str
    description: Optional[str] = None
    scale_min: int
    scale_max: int
    proficiency_rubric: Dict[str, str] = {}

class RoleCompetencyRequirementResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_role_id: int
    competency_id: int
    required_proficiency: float
    importance: str
    weight: float
    prerequisites: List[str] = []
    competency: Optional[CompetencyResponse] = None

class CompetencyResultResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    competency_id: int
    assessed_proficiency: float
    confidence_score: float
    evidence_type: str
    last_assessed_at: datetime
    supporting_notes: Optional[str] = None
    competency: Optional[CompetencyResponse] = None

class SkillGapItem(BaseModel):
    competency_id: int
    competency_name: str
    competency_code: str
    domain_name: str
    domain_code: str
    required_proficiency: float
    current_proficiency: Optional[float] = None
    is_assessed: bool
    status_label: str  # "Assessment needed", "Proficient", "Skill Gap"
    gap: float  # max(0, required - current) or 0 if unassessed
    importance: str  # critical, high, medium, desirable
    priority: str  # High, Medium, Low, None
    priority_score: float
    last_assessed_at: Optional[datetime] = None
    evidence_type: Optional[str] = None
    supporting_evidence: Optional[str] = None
    recommended_action: str

class SkillGapAnalysisResponse(BaseModel):
    user_id: int
    job_role_title: str
    department_name: str
    total_required_competencies: int
    assessed_count: int
    unassessed_count: int
    competencies_with_gaps: int
    average_gap: float
    critical_gaps_count: int
    high_priority_gaps_count: int
    gaps: List[SkillGapItem]
