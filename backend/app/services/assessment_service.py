from sqlalchemy.orm import Session
from typing import List, Dict, Any, Tuple
from datetime import datetime, timezone

from app.models import (
    Assessment, AssessmentQuestion, AssessmentAttempt, AssessmentResponse,
    Competency, CompetencyResult, User
)
from app.schemas.assessment import (
    AssessmentSubmitRequest, AssessmentAttemptResultResponse,
    QuestionResultReview, CompetencyScoreBreakdown
)

class AssessmentService:
    @staticmethod
    def submit_assessment(
        db: Session,
        user_id: int,
        submission: AssessmentSubmitRequest
    ) -> AssessmentAttemptResultResponse:
        assessment = db.query(Assessment).filter(Assessment.id == submission.assessment_id).first()
        if not assessment:
            raise ValueError("Assessment not found")

        questions = db.query(AssessmentQuestion).filter(
            AssessmentQuestion.assessment_id == assessment.id
        ).all()
        q_map = {q.id: q for q in questions}

        response_map = {r.question_id: r for r in submission.responses}

        total_points = 0.0
        earned_points = 0.0

        competency_stats: Dict[int, Dict[str, Any]] = {}
        reviews: List[QuestionResultReview] = []
        attempt_responses: List[AssessmentResponse] = []

        now = datetime.now(timezone.utc)

        # Create attempt placeholder
        attempt = AssessmentAttempt(
            user_id=user_id,
            assessment_id=assessment.id,
            started_at=now,
            completed_at=now,
            status="completed"
        )
        db.add(attempt)
        db.flush()

        for q in questions:
            total_points += q.points
            comp_id = q.competency_id
            if comp_id not in competency_stats:
                comp = db.query(Competency).filter(Competency.id == comp_id).first()
                competency_stats[comp_id] = {
                    "name": comp.name if comp else "General",
                    "earned": 0.0,
                    "total": 0.0,
                    "correct": 0,
                    "count": 0
                }
            competency_stats[comp_id]["total"] += q.points
            competency_stats[comp_id]["count"] += 1

            sub_ans = response_map.get(q.id)
            selected_idx = sub_ans.selected_option_index if sub_ans else None
            time_spent = sub_ans.time_taken_seconds if sub_ans else 0

            is_correct = (selected_idx is not None) and (selected_idx == q.correct_option_index)
            pts = float(q.points) if is_correct else 0.0
            earned_points += pts

            if is_correct:
                competency_stats[comp_id]["earned"] += pts
                competency_stats[comp_id]["correct"] += 1

            resp = AssessmentResponse(
                attempt_id=attempt.id,
                question_id=q.id,
                selected_option_index=selected_idx,
                is_correct=is_correct,
                points_awarded=pts,
                time_taken_seconds=time_spent
            )
            attempt_responses.append(resp)

            reviews.append(QuestionResultReview(
                question_id=q.id,
                question_text=q.question_text,
                options=q.options,
                selected_option_index=selected_idx,
                correct_option_index=q.correct_option_index,
                is_correct=is_correct,
                explanation=q.explanation,
                points_awarded=pts,
                competency_name=competency_stats[comp_id]["name"]
            ))

        db.add_all(attempt_responses)

        percentage = round((earned_points / total_points * 100.0), 1) if total_points > 0 else 0.0
        passed = percentage >= assessment.passing_score_pct

        attempt.score = earned_points
        attempt.max_score = total_points
        attempt.percentage = percentage
        attempt.passed = passed

        # Process competency results and breakdown
        strengths: List[str] = []
        improvements: List[str] = []
        breakdowns: List[CompetencyScoreBreakdown] = []
        comp_breakdown_json = {}

        for comp_id, stats in competency_stats.items():
            pct = round((stats["earned"] / stats["total"] * 100.0), 1) if stats["total"] > 0 else 0.0
            
            # Map percentage to 1.0 - 4.0 proficiency scale
            # >=85% -> 3.5 - 4.0
            # 70-84% -> 3.0
            # 50-69% -> 2.0 - 2.5
            # <50% -> 1.0 - 1.5
            if pct >= 85:
                assigned_level = 3.8
                label = "Level 4: Expert / Proficient"
                status = "Mastered"
                strengths.append(f"{stats['name']} ({pct}% mastery)")
            elif pct >= 70:
                assigned_level = 3.0
                label = "Level 3: Proficient / Operational"
                status = "Competent"
                strengths.append(f"{stats['name']} ({pct}% mastery)")
            elif pct >= 50:
                assigned_level = 2.0
                label = "Level 2: Working Knowledge"
                status = "Needs Practice"
                improvements.append(f"{stats['name']} ({pct}% score - foundational gap)")
            else:
                assigned_level = 1.0
                label = "Level 1: Foundational / Awareness"
                status = "Critical Gap"
                improvements.append(f"{stats['name']} ({pct}% score - urgent training needed)")

            breakdowns.append(CompetencyScoreBreakdown(
                competency_id=comp_id,
                competency_name=stats["name"],
                score=stats["earned"],
                max_score=stats["total"],
                percentage=pct,
                assigned_proficiency=assigned_level,
                proficiency_label=label,
                status=status
            ))

            comp_breakdown_json[str(comp_id)] = {
                "score": stats["earned"],
                "max": stats["total"],
                "pct": pct,
                "assigned_level": assigned_level
            }

            # Update or create official's CompetencyResult in DB
            comp_res = db.query(CompetencyResult).filter(
                CompetencyResult.user_id == user_id,
                CompetencyResult.competency_id == comp_id
            ).first()

            notes = f"Assessed via '{assessment.title}'. Scored {pct}% ({stats['correct']}/{stats['count']} questions correct)."

            if comp_res:
                # Weighted update or max evidence
                comp_res.assessed_proficiency = assigned_level
                comp_res.confidence_score = min(0.95, round(0.70 + (stats["count"] * 0.05), 2))
                comp_res.evidence_type = "diagnostic_assessment"
                comp_res.last_assessed_at = now
                comp_res.supporting_notes = notes
            else:
                comp_res = CompetencyResult(
                    user_id=user_id,
                    competency_id=comp_id,
                    assessed_proficiency=assigned_level,
                    confidence_score=min(0.95, round(0.70 + (stats["count"] * 0.05), 2)),
                    evidence_type="diagnostic_assessment",
                    last_assessed_at=now,
                    supporting_notes=notes
                )
                db.add(comp_res)

        attempt.competency_breakdown = comp_breakdown_json
        db.commit()

        return AssessmentAttemptResultResponse(
            attempt_id=attempt.id,
            assessment_id=assessment.id,
            assessment_title=assessment.title,
            user_id=user_id,
            score=earned_points,
            max_score=total_points,
            percentage=percentage,
            passed=passed,
            status=attempt.status,
            started_at=attempt.started_at,
            completed_at=attempt.completed_at,
            strengths=strengths,
            areas_for_improvement=improvements,
            competency_breakdown=breakdowns,
            question_reviews=reviews
        )
