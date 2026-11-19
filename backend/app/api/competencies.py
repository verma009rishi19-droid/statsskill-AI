from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import CompetencyDomain, Competency, RoleCompetencyRequirement, CompetencyResult, User
from app.schemas.competency import (
    CompetencyDomainResponse, CompetencyResponse,
    RoleCompetencyRequirementResponse, CompetencyResultResponse
)
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/competencies", tags=["Competencies"])

@router.get("/domains", response_model=List[CompetencyDomainResponse])
def get_domains(db: Session = Depends(get_db)):
    return db.query(CompetencyDomain).order_by(CompetencyDomain.display_order).all()

@router.get("", response_model=List[CompetencyResponse])
def get_competencies(
    domain_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Competency)
    if domain_id:
        query = query.filter(Competency.domain_id == domain_id)
    return query.order_by(Competency.name).all()

@router.get("/role-requirements/{role_id}", response_model=List[RoleCompetencyRequirementResponse])
def get_role_requirements(role_id: int, db: Session = Depends(get_db)):
    return db.query(RoleCompetencyRequirement).filter(
        RoleCompetencyRequirement.job_role_id == role_id
    ).all()

@router.get("/my-results", response_model=List[CompetencyResultResponse])
def get_my_competency_results(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return db.query(CompetencyResult).filter(
        CompetencyResult.user_id == current_user.id
    ).order_by(CompetencyResult.last_assessed_at.desc()).all()
