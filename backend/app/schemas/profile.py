from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime

class DepartmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    code: str
    description: Optional[str] = None

class JobRoleResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    department_id: int
    title: str
    code: str
    description: Optional[str] = None
    cadre: str

class OfficialProfileUpdate(BaseModel):
    designation: Optional[str] = None
    department_id: Optional[int] = None
    job_role_id: Optional[int] = None
    current_assignment: Optional[str] = None
    state_posting: Optional[str] = None
    work_experience_years: Optional[int] = None
    educational_qualifications: Optional[List[Dict[str, Any]]] = None
    previous_trainings: Optional[List[Dict[str, Any]]] = None
    learning_preferences: Optional[Dict[str, Any]] = None
    preferred_language: Optional[str] = None
    career_objectives: Optional[str] = None

class OfficialProfileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    designation: str
    department_id: Optional[int] = None
    job_role_id: Optional[int] = None
    employee_code: Optional[str] = None
    current_assignment: Optional[str] = None
    cadre: str
    state_posting: str
    educational_qualifications: List[Any] = []
    work_experience_years: int
    previous_trainings: List[Any] = []
    learning_preferences: Dict[str, Any] = {}
    preferred_language: str
    career_objectives: Optional[str] = None
    verified_by_manager: bool
    created_at: datetime
    updated_at: datetime

    department: Optional[DepartmentResponse] = None
    job_role: Optional[JobRoleResponse] = None
