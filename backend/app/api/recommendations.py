from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import User, RoleEnum
from app.schemas.course_training import PersonalizedRecommendationsResponse
from app.services.recommendation_service import RecommendationService
from app.api.deps import get_current_active_user, require_role

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])

@router.get("/my-recommendations", response_model=PersonalizedRecommendationsResponse)
def get_my_recommendations(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return RecommendationService.get_personalized_recommendations(db, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/user/{user_id}", response_model=PersonalizedRecommendationsResponse)
def get_user_recommendations_for_manager(
    user_id: int,
    current_user: User = Depends(require_role([RoleEnum.MANAGER, RoleEnum.ADMIN, RoleEnum.TRAINER])),
    db: Session = Depends(get_db)
):
    try:
        return RecommendationService.get_personalized_recommendations(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
