from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models import Assessment, AssessmentQuestion, AssessmentAttempt, User
from app.schemas.assessment import (
    AssessmentSummaryResponse, AssessmentDetailResponse,
    AssessmentSubmitRequest, AssessmentAttemptResultResponse,
    AssessmentQuestionPublic
)
from app.services.assessment_service import AssessmentService
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("", response_model=List[AssessmentSummaryResponse])
def list_assessments(db: Session = Depends(get_db)):
    assessments = db.query(Assessment).filter(Assessment.is_active == True).all()
    summaries = []
    for a in assessments:
        q_count = db.query(AssessmentQuestion).filter(AssessmentQuestion.assessment_id == a.id).count()
        summaries.append(AssessmentSummaryResponse(
            id=a.id,
            title=a.title,
            description=a.description,
            job_role_id=a.job_role_id,
            difficulty=a.difficulty,
            time_limit_minutes=a.time_limit_minutes,
            passing_score_pct=a.passing_score_pct,
            total_questions=q_count,
            created_at=a.created_at
        ))
    return summaries

@router.get("/{assessment_id}", response_model=AssessmentDetailResponse)
def get_assessment_detail(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(
        Assessment.id == assessment_id,
        Assessment.is_active == True
    ).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions = db.query(AssessmentQuestion).filter(
        AssessmentQuestion.assessment_id == assessment.id
    ).all()

    # Public question list does NOT expose correct_option_index or explanation
    public_questions = [
        AssessmentQuestionPublic(
            id=q.id,
            competency_id=q.competency_id,
            question_text=q.question_text,
            options=q.options,
            difficulty=q.difficulty,
            points=q.points
        ) for q in questions
    ]

    return AssessmentDetailResponse(
        id=assessment.id,
        title=assessment.title,
        description=assessment.description,
        job_role_id=assessment.job_role_id,
        domain_id=assessment.domain_id,
        difficulty=assessment.difficulty,
        time_limit_minutes=assessment.time_limit_minutes,
        passing_score_pct=assessment.passing_score_pct,
        is_active=assessment.is_active,
        total_questions=len(public_questions),
        questions=public_questions
    )

@router.post("/submit", response_model=AssessmentAttemptResultResponse)
def submit_assessment(
    submission: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        result = AssessmentService.submit_assessment(db, current_user.id, submission)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/attempts/my-history")
def get_my_assessment_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    attempts = db.query(AssessmentAttempt).filter(
        AssessmentAttempt.user_id == current_user.id
    ).order_by(AssessmentAttempt.started_at.desc()).all()

    output = []
    for a in attempts:
        output.append({
            "id": a.id,
            "assessment_id": a.assessment_id,
            "assessment_title": a.assessment.title if a.assessment else "Assessment",
            "score": a.score,
            "max_score": a.max_score,
            "percentage": a.percentage,
            "passed": a.passed,
            "status": a.status,
            "started_at": a.started_at,
            "completed_at": a.completed_at
        })
    return output
