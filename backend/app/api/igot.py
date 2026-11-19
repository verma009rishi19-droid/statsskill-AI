from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import SyncLog, RoleEnum, User
from app.schemas.system import SyncLogResponse
from app.services.igot_service import IGOTKarmayogiAdapter
from app.api.deps import get_current_active_user, require_role

router = APIRouter(prefix="/igot", tags=["iGOT Karmayogi Integration"])

@router.get("/status")
def get_igot_status(db: Session = Depends(get_db)):
    adapter = IGOTKarmayogiAdapter(db)
    return adapter.get_status()

@router.post("/sync")
def trigger_igot_sync(
    current_user: User = Depends(require_role([RoleEnum.ADMIN, RoleEnum.TRAINER])),
    db: Session = Depends(get_db)
):
    adapter = IGOTKarmayogiAdapter(db)
    return adapter.sync_catalog()

@router.get("/logs", response_model=List[SyncLogResponse])
def get_igot_sync_logs(db: Session = Depends(get_db)):
    return db.query(SyncLog).filter(
        SyncLog.service_name == "igot_karmayogi"
    ).order_by(SyncLog.started_at.desc()).limit(20).all()
