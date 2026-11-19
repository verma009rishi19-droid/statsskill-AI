from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone

from app.core.database import get_db
from app.models import (
    LearningPath, LearningPathModule, UserLearningProgress, User, Course, NSSTATrainingProgramme
)
from app.schemas.learning_path import (
    LearningPathResponse, LearningPathModuleResponse, UpdateModuleProgressRequest
)
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/learning-paths", tags=["Learning Paths"])

@router.get("/my-path", response_model=LearningPathResponse)
def get_my_learning_path(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    lp = db.query(LearningPath).filter(
        LearningPath.user_id == current_user.id,
        LearningPath.is_active == True
    ).first()

    if not lp:
        # If no custom learning path exists yet, return empty structure or auto-generate from template
        return LearningPathResponse(
            id=0,
            user_id=current_user.id,
            title="Personalized Learning Path",
            description="Take an assessment or view recommendations to initialize your learning path.",
            total_modules=0,
            completed_modules=0,
            progress_pct=0.0,
            estimated_hours=0.0,
            created_at=datetime.now(timezone.utc),
            modules=[]
        )

    # Get user progress for modules
    progress_records = db.query(UserLearningProgress).filter(
        UserLearningProgress.learning_path_id == lp.id,
        UserLearningProgress.user_id == current_user.id
    ).all()
    prog_map = {p.module_id: p for p in progress_records}

    module_responses = []
    completed_count = 0
    for m in lp.modules:
        p = prog_map.get(m.id)
        status = p.status if p else "not_started"
        pct = p.progress_pct if p else 0.0
        if status == "completed":
            completed_count += 1

        module_responses.append(LearningPathModuleResponse(
            id=m.id,
            title=m.title,
            description=m.description,
            order_index=m.order_index,
            competency_id=m.competency_id,
            competency_name=m.competency.name if m.competency else None,
            course_id=m.course_id,
            course_title=m.course.title if m.course else None,
            course_url=m.course.external_url if m.course else None,
            course_provider=m.course.provider if m.course else None,
            nssta_programme_id=m.nssta_programme_id,
            nssta_title=m.nssta_programme.title if m.nssta_programme else None,
            is_mandatory=m.is_mandatory,
            estimated_hours=m.estimated_hours,
            status=status,
            progress_pct=pct
        ))

    total_count = len(lp.modules)
    path_pct = round((completed_count / total_count * 100.0), 1) if total_count > 0 else 0.0

    return LearningPathResponse(
        id=lp.id,
        user_id=lp.user_id,
        title=lp.title,
        description=lp.description,
        target_job_role_id=lp.target_job_role_id,
        total_modules=total_count,
        completed_modules=completed_count,
        progress_pct=path_pct,
        estimated_hours=lp.estimated_hours,
        created_at=lp.created_at,
        modules=module_responses
    )

@router.put("/modules/{module_id}/progress")
def update_module_progress(
    module_id: int,
    req: UpdateModuleProgressRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    module = db.query(LearningPathModule).filter(LearningPathModule.id == module_id).first()
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")

    prog = db.query(UserLearningProgress).filter(
        UserLearningProgress.module_id == module_id,
        UserLearningProgress.user_id == current_user.id
    ).first()

    now = datetime.now(timezone.utc)
    if not prog:
        prog = UserLearningProgress(
            user_id=current_user.id,
            learning_path_id=module.learning_path_id,
            module_id=module_id,
            course_id=module.course_id,
            status=req.status,
            progress_pct=req.progress_pct,
            time_spent_minutes=req.time_spent_minutes or 0,
            completed_at=now if req.status == "completed" else None,
            notes=req.notes
        )
        db.add(prog)
    else:
        prog.status = req.status
        prog.progress_pct = req.progress_pct
        if req.time_spent_minutes:
            prog.time_spent_minutes += req.time_spent_minutes
        if req.status == "completed" and not prog.completed_at:
            prog.completed_at = now
        if req.notes:
            prog.notes = req.notes

    db.commit()
    return {"status": "success", "module_status": prog.status, "progress_pct": prog.progress_pct}
