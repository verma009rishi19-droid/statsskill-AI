from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.models import User, RoleEnum
from app.schemas.analytics import (
    LearnerDashboardMetrics, DepartmentAnalyticsResponse,
    PredictiveWorkforceAnalyticsResponse
)
from app.services.analytics_service import AnalyticsService
from app.api.deps import get_current_active_user, require_role

router = APIRouter(prefix="/analytics", tags=["Analytics & Reports"])

@router.get("/learner-dashboard", response_model=LearnerDashboardMetrics)
def get_learner_dashboard_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return AnalyticsService.get_learner_dashboard_metrics(db, current_user.id)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/department", response_model=DepartmentAnalyticsResponse)
def get_department_analytics(
    department_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # If user is learner, defaults to their department; if manager/admin, allows choosing
    dept_id = department_id
    if current_user.role == RoleEnum.LEARNER and current_user.profile:
        dept_id = current_user.profile.department_id

    return AnalyticsService.get_department_analytics(db, dept_id)

@router.get("/predictive-workforce", response_model=PredictiveWorkforceAnalyticsResponse)
def get_predictive_workforce_analysis(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    return AnalyticsService.get_predictive_workforce_analytics(db)
