from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import User, OfficialProfile, Department, JobRole
from app.schemas.profile import (
    OfficialProfileResponse, OfficialProfileUpdate,
    DepartmentResponse, JobRoleResponse
)
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/profiles", tags=["Profiles"])

@router.get("/me", response_model=OfficialProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(OfficialProfile).filter(OfficialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Official profile not found")
    return profile

@router.put("/me", response_model=OfficialProfileResponse)
def update_my_profile(
    profile_in: OfficialProfileUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = db.query(OfficialProfile).filter(OfficialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Official profile not found")

    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/departments", response_model=List[DepartmentResponse])
def list_departments(db: Session = Depends(get_db)):
    return db.query(Department).order_by(Department.name).all()

@router.get("/job-roles", response_model=List[JobRoleResponse])
def list_job_roles(db: Session = Depends(get_db)):
    return db.query(JobRole).order_by(JobRole.title).all()
