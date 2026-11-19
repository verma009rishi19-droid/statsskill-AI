from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional

from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token
from app.models import User, RoleEnum, OfficialProfile, JobRole, Department, AuditLog
from app.schemas.auth import Token, LoginRequest, UserCreate, UserResponse
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(
    login_data: Optional[LoginRequest] = None,
    form_data: Optional[OAuth2PasswordRequestForm] = Depends(lambda: None),
    db: Session = Depends(get_db)
):
    # Support both JSON request body and OAuth2 form data
    email = ""
    password = ""
    if form_data and form_data.username:
        email = form_data.username
        password = form_data.password
    elif login_data:
        email = login_data.email
        password = login_data.password
    else:
        raise HTTPException(status_code=400, detail="Missing email and password credentials")

    user = db.query(User).filter(User.email == email.lower().strip()).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect official email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is deactivated")

    # Record login audit
    audit = AuditLog(
        user_id=user.id,
        action="user_login",
        resource_type="auth",
        resource_id=str(user.id),
        details={"email": user.email, "role": user.role}
    )
    db.add(audit)
    db.commit()

    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"email": user.email, "role": user.role, "name": user.full_name}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.post("/register", response_model=Token)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user_in.email.lower().strip()).first()
    if existing:
        raise HTTPException(status_code=400, detail="An account with this official email already exists")

    # Validate role assignment
    assigned_role = user_in.role if user_in.role in [RoleEnum.LEARNER, RoleEnum.TRAINER, RoleEnum.MANAGER, RoleEnum.ADMIN] else RoleEnum.LEARNER

    user = User(
        email=user_in.email.lower().strip(),
        hashed_password=get_password_hash(user_in.password),
        full_name=user_in.full_name,
        role=assigned_role,
        is_active=True,
        is_verified=True
    )
    db.add(user)
    db.flush()

    # Assign default department and job role if not provided
    dept_id = user_in.department_id
    if not dept_id:
        default_dept = db.query(Department).first()
        dept_id = default_dept.id if default_dept else None

    job_role_id = user_in.job_role_id
    if not job_role_id:
        default_role = db.query(JobRole).first()
        job_role_id = default_role.id if default_role else None

    profile = OfficialProfile(
        user_id=user.id,
        designation=user_in.designation or "Statistical Officer",
        department_id=dept_id,
        job_role_id=job_role_id,
        cadre="Subordinate Statistical Service (SSS)",
        state_posting="New Delhi",
        work_experience_years=3,
        educational_qualifications=[{"degree": "Bachelor of Statistics", "institution": "Indian Statistical Institute", "year": 2021}],
        previous_trainings=[],
        learning_preferences={"formats": ["self_paced_interactive"], "focus_areas": ["Data Verification"]},
        preferred_language="en",
        verified_by_manager=False
    )
    db.add(profile)
    db.commit()

    access_token = create_access_token(
        subject=str(user.id),
        extra_claims={"email": user.email, "role": user.role, "name": user.full_name}
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        user_id=user.id,
        email=user.email,
        full_name=user.full_name,
        role=user.role
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_active_user)):
    return current_user
