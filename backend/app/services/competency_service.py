from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone

from app.models import (
    User, OfficialProfile, JobRole, Competency, RoleCompetencyRequirement,
    CompetencyResult, CompetencyDomain
)
from app.schemas.competency import SkillGapItem, SkillGapAnalysisResponse

class CompetencyService:
    @staticmethod
    def get_user_skill_gaps(db: Session, user_id: int) -> SkillGapAnalysisResponse:
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.profile:
            raise ValueError("User or official profile not found")

        profile = user.profile
        job_role = profile.job_role
        
        # If user has no job role assigned, fallback to first available or empty
        if not job_role:
            job_role = db.query(JobRole).first()
            if not job_role:
                return SkillGapAnalysisResponse(
                    user_id=user_id,
                    job_role_title="Not Assigned",
                    department_name="Not Assigned",
                    total_required_competencies=0,
                    assessed_count=0,
                    unassessed_count=0,
                    competencies_with_gaps=0,
                    average_gap=0.0,
                    critical_gaps_count=0,
                    high_priority_gaps_count=0,
                    gaps=[]
                )

        # Load requirements for the official's job role
        requirements = db.query(RoleCompetencyRequirement).filter(
            RoleCompetencyRequirement.job_role_id == job_role.id
        ).all()

        # Load official's existing assessed results
        results = db.query(CompetencyResult).filter(
            CompetencyResult.user_id == user_id
        ).all()
        results_map = {r.competency_id: r for r in results}

        gap_items: List[SkillGapItem] = []
        total_gap_sum = 0.0
        assessed_count = 0
        unassessed_count = 0
        gaps_count = 0
        critical_gaps_count = 0
        high_priority_gaps_count = 0

        for req in requirements:
            comp = req.competency
            domain = comp.domain
            required_prof = req.required_proficiency
            importance = req.importance.lower()
            weight = req.weight

            res = results_map.get(comp.id)

            if res is None:
                # Unassessed competency
                unassessed_count += 1
                priority = "High" if importance in ["critical", "high"] else "Medium"
                priority_score = 1.0 * weight * (3.0 if importance == "critical" else 2.0 if importance == "high" else 1.0)
                
                if priority == "High":
                    high_priority_gaps_count += 1

                gap_items.append(SkillGapItem(
                    competency_id=comp.id,
                    competency_name=comp.name,
                    competency_code=comp.code,
                    domain_name=domain.name,
                    domain_code=domain.code,
                    required_proficiency=required_prof,
                    current_proficiency=None,
                    is_assessed=False,
                    status_label="Assessment needed",
                    gap=0.0,
                    importance=importance,
                    priority=priority,
                    priority_score=priority_score,
                    last_assessed_at=None,
                    evidence_type=None,
                    supporting_evidence="No diagnostic assessment or verified credential recorded yet.",
                    recommended_action="Take the diagnostic assessment to establish baseline capability."
                ))
            else:
                # Assessed competency
                assessed_count += 1
                curr_prof = res.assessed_proficiency
                gap = max(0.0, round(required_prof - curr_prof, 2))

                if gap > 0:
                    gaps_count += 1
                    total_gap_sum += gap

                    # Priority calculation based on gap magnitude, weight and importance
                    mult = 3.0 if importance == "critical" else 2.0 if importance == "high" else 1.0
                    priority_score = gap * weight * mult

                    if gap >= 1.0 or importance == "critical":
                        priority = "High"
                        high_priority_gaps_count += 1
                        if importance == "critical":
                            critical_gaps_count += 1
                        action = "Immediate enrollment in targeted NSSTA or iGOT certified training recommended."
                    elif gap >= 0.5:
                        priority = "Medium"
                        action = "Complete practical learning modules and practice quizzes."
                    else:
                        priority = "Low"
                        action = "Review refresher materials and micro-learning modules."

                    status_label = "Skill Gap"
                else:
                    priority = "None"
                    priority_score = 0.0
                    status_label = "Proficient"
                    action = "Maintain proficiency through peer mentorship and advanced topics."

                gap_items.append(SkillGapItem(
                    competency_id=comp.id,
                    competency_name=comp.name,
                    competency_code=comp.code,
                    domain_name=domain.name,
                    domain_code=domain.code,
                    required_proficiency=required_prof,
                    current_proficiency=curr_prof,
                    is_assessed=True,
                    status_label=status_label,
                    gap=gap,
                    importance=importance,
                    priority=priority,
                    priority_score=priority_score,
                    last_assessed_at=res.last_assessed_at,
                    evidence_type=res.evidence_type,
                    supporting_evidence=res.supporting_notes or f"Evaluated via {res.evidence_type.replace('_', ' ')}.",
                    recommended_action=action
                ))

        # Sort gaps: Unassessed & High Priority first, then by priority score descending
        gap_items.sort(key=lambda x: (
            0 if x.status_label == "Skill Gap" and x.priority == "High" else
            1 if x.status_label == "Assessment needed" else
            2 if x.status_label == "Skill Gap" else 3,
            -x.priority_score
        ))

        avg_gap = round(total_gap_sum / assessed_count, 2) if assessed_count > 0 else 0.0

        return SkillGapAnalysisResponse(
            user_id=user_id,
            job_role_title=job_role.title,
            department_name=profile.department.name if profile.department else "General Administration",
            total_required_competencies=len(requirements),
            assessed_count=assessed_count,
            unassessed_count=unassessed_count,
            competencies_with_gaps=gaps_count,
            average_gap=avg_gap,
            critical_gaps_count=critical_gaps_count,
            high_priority_gaps_count=high_priority_gaps_count,
            gaps=gap_items
        )
