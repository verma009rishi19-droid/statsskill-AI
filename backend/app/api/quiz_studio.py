import os
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.config import settings
from app.models import Document, Quiz, QuizQuestion, QuizAttempt, User
from app.schemas.quiz import (
    DocumentUploadResponse, QuizGenerateRequest, QuizGenerateResponse,
    QuizSaveRequest, QuizDetailResponse, QuizSubmitRequest,
    QuizAttemptResultResponse, QuizQuestionPublic
)
from app.services.document_service import DocumentService
from app.services.quiz_service import QuizService
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/quiz-studio", tags=["AI Quiz Studio"])

@router.post("/upload-document", response_model=DocumentUploadResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Read file content into memory for validation
    file_bytes = await file.read()
    file_size = len(file_bytes)

    valid, err_msg = DocumentService.validate_file(file.filename, file_size)
    if not valid:
        raise HTTPException(status_code=400, detail=err_msg)

    # Save to uploads directory
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    clean_filename = f"user_{current_user.id}_{int(os.times().elapsed)}_{file.filename}"
    file_path = os.path.join(settings.UPLOAD_DIR, clean_filename)

    with open(file_path, "wb") as f:
        f.write(file_bytes)

    # Extract text
    file_ext = os.path.splitext(file.filename)[1]
    try:
        extracted_text, word_count, summary = DocumentService.extract_text(file_path, file_ext)
    except Exception as e:
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(status_code=400, detail=f"Failed to process document content: {str(e)}")

    doc = Document(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        file_type=file_ext.replace(".", ""),
        file_size_bytes=file_size,
        extracted_text=extracted_text,
        word_count=word_count,
        summary=summary
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    preview = (extracted_text[:400] + "...") if len(extracted_text) > 400 else extracted_text

    return DocumentUploadResponse(
        id=doc.id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size_bytes=doc.file_size_bytes,
        word_count=doc.word_count,
        text_preview=preview,
        summary=doc.summary,
        created_at=doc.created_at
    )

@router.post("/generate", response_model=QuizGenerateResponse)
def generate_quiz_questions(
    req: QuizGenerateRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return QuizService.generate_quiz_from_document(db, req)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/save")
def save_quiz(
    save_data: QuizSaveRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        quiz = QuizService.save_quiz(db, current_user.id, save_data)
        return {
            "id": quiz.id,
            "title": quiz.title,
            "total_questions": quiz.total_questions,
            "message": "Quiz successfully generated and saved to your quiz library."
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/quizzes")
def list_quizzes(db: Session = Depends(get_db)):
    quizzes = db.query(Quiz).order_by(Quiz.created_at.desc()).all()
    results = []
    for q in quizzes:
        results.append({
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "difficulty": q.difficulty,
            "total_questions": q.total_questions,
            "competency_name": q.competency.name if q.competency else "Official Statistics",
            "created_at": q.created_at
        })
    return results

@router.get("/quizzes/{quiz_id}", response_model=QuizDetailResponse)
def get_quiz_detail(quiz_id: int, db: Session = Depends(get_db)):
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).all()
    public_questions = [
        QuizQuestionPublic(
            id=q.id,
            question_text=q.question_text,
            options=q.options,
            difficulty=q.difficulty,
            source_reference=q.source_reference
        ) for q in questions
    ]

    return QuizDetailResponse(
        id=quiz.id,
        title=quiz.title,
        description=quiz.description,
        difficulty=quiz.difficulty,
        total_questions=len(public_questions),
        competency_id=quiz.competency_id,
        competency_name=quiz.competency.name if quiz.competency else None,
        created_at=quiz.created_at,
        questions=public_questions
    )

@router.post("/submit", response_model=QuizAttemptResultResponse)
def submit_quiz_attempt(
    submission: QuizSubmitRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    try:
        return QuizService.submit_quiz_attempt(db, current_user.id, submission)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/attempts/my-history")
def get_my_quiz_attempts(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    attempts = db.query(QuizAttempt).filter(
        QuizAttempt.user_id == current_user.id
    ).order_by(QuizAttempt.completed_at.desc()).all()

    return [{
        "id": a.id,
        "quiz_id": a.quiz_id,
        "quiz_title": a.quiz.title if a.quiz else "Quiz",
        "score": a.score,
        "total_questions": a.total_questions,
        "percentage": a.percentage,
        "completed_at": a.completed_at
    } for a in attempts]
