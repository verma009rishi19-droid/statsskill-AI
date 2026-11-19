from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class LearnerDashboardMetrics(BaseModel):
    user_id: int
    full_name: str
    designation: str
    department_name: str
    job_role_title: str
    assessed_competencies_count: int
    unassessed_competencies_count: int
    critical_gaps_count: int
    active_learning_paths_count: int
    learning_path_progress_pct: float
    total_learning_hours: float
    quizzes_attempted_count: int
    average_quiz_score_pct: float
    next_recommended_action: str
    competency_radar_data: List[Dict[str, Any]]  # [{competency: "Price Stat", current: 2.5, required: 3.5}]
    recent_activity: List[Dict[str, Any]]

class DepartmentAnalyticsResponse(BaseModel):
    department_id: Optional[int] = None
    department_name: str
    total_officials: int
    assessed_officials_count: int
    assessment_coverage_pct: float
    top_skill_gaps: List[Dict[str, Any]]
    competency_domain_averages: List[Dict[str, Any]]
    training_participation_rate_pct: float
    learning_path_completion_rate_pct: float

class WorkforceSkillTrend(BaseModel):
    competency_name: str
    domain: str
    current_demand_index: float
    forecasted_growth_pct: float
    criticality: str
    driver: str  # e.g., "Digital Census & Survey Automation", "SDG 2030 Tier reporting"

class PredictiveWorkforceAnalyticsResponse(BaseModel):
    analysis_date: str
    baseline_officials_analyzed: int
    data_sufficiency_status: str  # "sufficient_for_trend_projection" or "descriptive_baseline"
    methodology_notes: str
    emerging_competency_trends: List[WorkforceSkillTrend]
    departmental_training_priorities: List[Dict[str, Any]]
    resource_gap_hotspots: List[Dict[str, Any]]
