from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.core.database import get_db
from app.models import User, RoleEnum, AuditLog, IntegrationSetting, OfficialProfile
from app.schemas.auth import UserResponse
from app.schemas.system import AuditLogResponse, IntegrationSettingResponse
from app.api.deps import require_role

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/users")
def list_system_users(
    role: Optional[str] = Query(None),
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.MANAGER])),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.order_by(User.id).all()
    
    results = []
    for u in users:
        results.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "is_active": u.is_active,
            "is_verified": u.is_verified,
            "designation": u.profile.designation if u.profile else "N/A",
            "department": u.profile.department.name if u.profile and u.profile.department else "N/A",
            "created_at": u.created_at
        })
    return results

@router.put("/users/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    current_user: User = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    if new_role not in [RoleEnum.LEARNER, RoleEnum.TRAINER, RoleEnum.MANAGER, RoleEnum.ADMIN, RoleEnum.ANALYST]:
        raise HTTPException(status_code=400, detail="Invalid role specified")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    old_role = user.role
    user.role = new_role

    audit = AuditLog(
        user_id=current_user.id,
        action="update_user_role",
        resource_type="user",
        resource_id=str(user.id),
        details={"target_email": user.email, "old_role": old_role, "new_role": new_role}
    )
    db.add(audit)
    db.commit()

    return {"status": "success", "user_id": user.id, "new_role": user.role}

@router.get("/audit-logs", response_model=List[AuditLogResponse])
def get_audit_logs(
    limit: int = 50,
    current_user: User = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    return db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(limit).all()

@router.get("/integration-settings", response_model=List[IntegrationSettingResponse])
def get_integration_settings(
    current_user: User = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    return db.query(IntegrationSetting).all()

@router.put("/integration-settings/{service_name}")
def update_integration_setting(
    service_name: str,
    setting_update: Dict[str, Any],
    current_user: User = Depends(require_role([RoleEnum.ADMIN])),
    db: Session = Depends(get_db)
):
    setting = db.query(IntegrationSetting).filter(IntegrationSetting.service_name == service_name).first()
    if not setting:
        raise HTTPException(status_code=404, detail="Integration setting not found")

    if "is_enabled" in setting_update:
        setting.is_enabled = bool(setting_update["is_enabled"])
    if "is_demo_mode" in setting_update:
        setting.is_demo_mode = bool(setting_update["is_demo_mode"])
    if "config_data" in setting_update:
        setting.config_data = setting_update["config_data"]

    db.commit()
    return {"status": "success", "service_name": service_name}
