from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from app.models import (
    User, Course, CourseCompetencyMapping, NSSTATrainingProgramme,
    Competency, RoleCompetencyRequirement, CompetencyResult
)
from app.schemas.course_training import (
    PersonalizedRecommendationsResponse, RecommendationItem
)
from app.services.competency_service import CompetencyService

class RecommendationService:
    @staticmethod
    def get_personalized_recommendations(
        db: Session,
        user_id: int
    ) -> PersonalizedRecommendationsResponse:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.profile:
            raise ValueError("User or official profile not found")

        gap_analysis = CompetencyService.get_user_skill_gaps(db, user_id)
        
        # Filter gaps where gap > 0 or unassessed
        target_gaps = [g for g in gap_analysis.gaps if g.gap > 0 or not g.is_assessed]
        
        # Sort targets by priority score descending
        target_gaps.sort(key=lambda x: -x.priority_score)

        top_priority_gap = target_gaps[0].competency_name if target_gaps else None

        recommendations: List[RecommendationItem] = []
        seen_resource_ids = set()

        for g in target_gaps:
            comp_id = g.competency_id
            comp_name = g.competency_name
            comp_code = g.competency_code
            gap_val = g.gap
            is_unassessed = not g.is_assessed

            # 1. Look for mapped iGOT / Portal Courses
            course_mappings = db.query(CourseCompetencyMapping).filter(
                CourseCompetencyMapping.competency_id == comp_id
            ).all()

            for cm in course_mappings:
                course = cm.course
                if not course or not course.is_active:
                    continue
                rec_id = f"course_{course.id}"
                if rec_id in seen_resource_ids:
                    continue
                seen_resource_ids.add(rec_id)

                if is_unassessed:
                    priority_label = "High Priority" if g.importance in ["critical", "high"] else "Foundational"
                    why = f"This competency is required for your role ({user.profile.job_role.title if user.profile.job_role else 'Official'}), but currently unassessed. Completing this course establishes verified capability."
                else:
                    priority_label = "High Priority" if gap_val >= 1.0 or g.importance == "critical" else "Medium Priority"
                    why = f"Directly addresses your assessed {gap_val:.1f} proficiency gap in {comp_name}. Targets Level {cm.target_proficiency:.1f} operational competence."

                objectives = [
                    f"Master core official statistical standards for {comp_name}.",
                    f"Implement automated validation checks and compliant data transformations.",
                    f"Achieve Target Level {cm.target_proficiency:.1f} proficiency required by your cadre."
                ]

                recommendations.append(RecommendationItem(
                    id=rec_id,
                    resource_type="igot_course",
                    title=course.title,
                    provider=course.provider,
                    external_url=course.external_url,
                    addressed_competency_name=comp_name,
                    addressed_competency_code=comp_code,
                    gap_magnitude=gap_val,
                    priority_level=priority_label,
                    why_recommended=why,
                    learning_objectives=objectives,
                    prerequisites=f"Familiarity with basic official statistics and job-role protocols.",
                    estimated_duration=f"{course.duration_hours} hours (Self-paced)",
                    expected_outcome=f"Attain verified working proficiency in {comp_name} and reduce role gap to zero.",
                    format="Online Self-Paced (iGOT Karmayogi)"
                ))

            # 2. Look for verified NSSTA TPAC-recommended Training Programmes
            nssta_progs = db.query(NSSTATrainingProgramme).filter(
                NSSTATrainingProgramme.tpac_approval_status == "verified_recommended"
            ).all()

            for p in nssta_progs:
                if comp_code in (p.competencies_covered or []):
                    rec_id = f"nssta_{p.id}"
                    if rec_id in seen_resource_ids:
                        continue
                    seen_resource_ids.add(rec_id)

                    why = f"Verified NSSTA TPAC-recommended residential capacity building programme directly covering {comp_name} with expert faculty from MoSPI & ISI."

                    objectives = [
                        f"In-depth classroom, lab, and practical case-study problem solving on {comp_name}.",
                        "Hands-on exercises adhering to international and national statistical manuals.",
                        "Inter-state and inter-divisional knowledge exchange with statistical officers across India."
                    ]

                    recommendations.append(RecommendationItem(
                        id=rec_id,
                        resource_type="nssta_programme",
                        title=p.title,
                        provider=p.source_organization,
                        external_url=p.official_url,
                        addressed_competency_name=comp_name,
                        addressed_competency_code=comp_code,
                        gap_magnitude=gap_val,
                        priority_level="High Priority" if g.importance in ["critical", "high"] else "Medium Priority",
                        why_recommended=why,
                        learning_objectives=objectives,
                        prerequisites=p.prerequisites or "Active service in Indian Statistical System.",
                        estimated_duration=f"{p.duration_days} Days ({p.delivery_format.replace('_', ' ').title()})",
                        expected_outcome="Official certification from NSSTA and institutional credit toward promotional benchmark.",
                        format=f"Residential / Classroom ({p.tpac_reference_number or 'TPAC Approved'})"
                    ))

        return PersonalizedRecommendationsResponse(
            user_id=user_id,
            job_role=user.profile.job_role.title if user.profile.job_role else "Official",
            total_recommendations=len(recommendations),
            top_priority_gap=top_priority_gap,
            recommendations=recommendations
        )
