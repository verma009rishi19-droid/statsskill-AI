from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, RoleEnum
from app.schemas.competency import SkillGapAnalysisResponse
from app.services.competency_service import CompetencyService
from app.api.deps import get_current_active_user, require_role

router = APIRouter(prefix="/skill-gaps", tags=["Skill Gaps"])

@router.get("/my-analysis", response_model=SkillGapAnalysisResponse)
def get_my_skill_gaps(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return CompetencyService.get_user_skill_gaps(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{user_id}", response_model=SkillGapAnalysisResponse)
def get_user_skill_gaps_for_manager(
    user_id: int,
    current_user: User = Depends(require_role([RoleEnum.MANAGER, RoleEnum.ADMIN, RoleEnum.TRAINER])),
    db: Session = Depends(get_db)
):
    try:
        return CompetencyService.get_user_skill_gaps(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
