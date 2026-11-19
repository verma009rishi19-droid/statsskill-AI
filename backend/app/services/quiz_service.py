from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.models import (
    Document, Quiz, QuizQuestion, QuizAttempt, QuizResponse, Competency
)
from app.schemas.quiz import (
    QuizGenerateRequest, QuizGenerateResponse, QuizSaveRequest,
    QuizSubmitRequest, QuizAttemptResultResponse, QuizQuestionReview, QuestionDraft
)
from app.services.ai_provider import get_ai_provider

class QuizService:
    @staticmethod
    def generate_quiz_from_document(
        db: Session,
        req: QuizGenerateRequest
    ) -> QuizGenerateResponse:
        doc = db.query(Document).filter(Document.id == req.document_id).first()
        if not doc:
            raise ValueError("Document not found")

        comp_name = "Official Statistics"
        if req.competency_id:
            comp = db.query(Competency).filter(Competency.id == req.competency_id).first()
            if comp:
                comp_name = comp.name

        ai_provider = get_ai_provider()
        provider_name = "gemini_api" if ai_provider.__class__.__name__ == "GeminiAIProvider" else "curated_domain_extractor"

        questions = ai_provider.generate_quiz_questions(
            document_text=doc.extracted_text or "",
            num_questions=req.num_questions,
            competency_name=comp_name,
            difficulty=req.difficulty or "intermediate",
            language=req.target_language
        )

        title = f"Quiz: {comp_name} ({req.difficulty.title() if req.difficulty else 'Intermediate'})"

        return QuizGenerateResponse(
            document_id=doc.id,
            title=title,
            difficulty=req.difficulty or "intermediate",
            generated_questions=questions,
            generation_source=provider_name
        )

    @staticmethod
    def save_quiz(
        db: Session,
        creator_id: int,
        save_data: QuizSaveRequest
    ) -> Quiz:
        quiz = Quiz(
            document_id=save_data.document_id,
            creator_id=creator_id,
            title=save_data.title,
            description=save_data.description or f"AI-generated quiz based on uploaded document.",
            competency_id=save_data.competency_id,
            difficulty=save_data.difficulty,
            total_questions=len(save_data.questions),
            source_language="en"
        )
        db.add(quiz)
        db.flush()

        questions: List[QuizQuestion] = []
        for q in save_data.questions:
            questions.append(QuizQuestion(
                quiz_id=quiz.id,
                competency_id=q.competency_id or save_data.competency_id,
                question_text=q.question_text,
                options=q.options,
                correct_option_index=q.correct_option_index,
                explanation=q.explanation,
                source_reference=q.source_reference,
                difficulty=q.difficulty
            ))
        db.add_all(questions)
        db.commit()
        db.refresh(quiz)
        return quiz

    @staticmethod
    def submit_quiz_attempt(
        db: Session,
        user_id: int,
        submission: QuizSubmitRequest
    ) -> QuizAttemptResultResponse:
        quiz = db.query(Quiz).filter(Quiz.id == submission.quiz_id).first()
        if not quiz:
            raise ValueError("Quiz not found")

        questions = db.query(QuizQuestion).filter(QuizQuestion.quiz_id == quiz.id).all()
        q_map = {q.id: q for q in questions}

        ans_map = {a.question_id: a.selected_option_index for a in submission.answers}

        score = 0
        total_questions = len(questions)
        reviews: List[QuizQuestionReview] = []
        responses: List[QuizResponse] = []

        now = datetime.now(timezone.utc)
        attempt = QuizAttempt(
            user_id=user_id,
            quiz_id=quiz.id,
            score=0,
            total_questions=total_questions,
            percentage=0.0,
            completed_at=now
        )
        db.add(attempt)
        db.flush()

        for q in questions:
            selected_idx = ans_map.get(q.id, -1)
            is_correct = (selected_idx == q.correct_option_index)
            if is_correct:
                score += 1

            resp = QuizResponse(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_option_index=selected_idx,
                is_correct=is_correct
            )
            responses.append(resp)

            reviews.append(QuizQuestionReview(
                question_id=q.id,
                question_text=q.question_text,
                options=q.options,
                selected_option_index=selected_idx,
                correct_option_index=q.correct_option_index,
                is_correct=is_correct,
                explanation=q.explanation,
                source_reference=q.source_reference
            ))

        db.add_all(responses)

        percentage = round((score / total_questions * 100.0), 1) if total_questions > 0 else 0.0
        attempt.score = score
        attempt.percentage = percentage

        db.commit()

        return QuizAttemptResultResponse(
            attempt_id=attempt.id,
            quiz_id=quiz.id,
            quiz_title=quiz.title,
            score=score,
            total_questions=total_questions,
            percentage=percentage,
            passed=percentage >= 60.0,
            completed_at=now,
            question_reviews=reviews
        )
