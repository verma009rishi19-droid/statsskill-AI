from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import Course, CourseCompetencyMapping
from app.schemas.course_training import CourseResponse, CourseCompetencyMappingResponse

router = APIRouter(prefix="/courses", tags=["Courses"])

@router.get("", response_model=List[CourseResponse])
def list_courses(
    provider: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Course).filter(Course.is_active == True)
    if provider:
        query = query.filter(Course.provider.ilike(f"%{provider}%"))
    if difficulty:
        query = query.filter(Course.difficulty_level == difficulty)
    if search:
        query = query.filter(Course.title.ilike(f"%{search}%") | Course.description.ilike(f"%{search}%"))

    courses = query.order_by(Course.title).all()
    results = []
    for c in courses:
        mappings = db.query(CourseCompetencyMapping).filter(CourseCompetencyMapping.course_id == c.id).all()
        mapping_responses = [
            CourseCompetencyMappingResponse(
                competency_id=m.competency_id,
                competency_name=m.competency.name if m.competency else "Official Stat",
                target_proficiency=m.target_proficiency,
                coverage_weight=m.coverage_weight
            ) for m in mappings
        ]
        results.append(CourseResponse(
            id=c.id,
            title=c.title,
            provider=c.provider,
            provider_course_id=c.provider_course_id,
            external_url=c.external_url,
            description=c.description,
            duration_hours=c.duration_hours,
            difficulty_level=c.difficulty_level,
            language=c.language,
            format=c.format,
            thumbnail_url=c.thumbnail_url,
            is_active=c.is_active,
            competencies_covered=mapping_responses
        ))
    return results

@router.get("/{course_id}", response_model=CourseResponse)
def get_course_detail(course_id: int, db: Session = Depends(get_db)):
    c = db.query(Course).filter(Course.id == course_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Course not found")
    
    mappings = db.query(CourseCompetencyMapping).filter(CourseCompetencyMapping.course_id == c.id).all()
    mapping_responses = [
        CourseCompetencyMappingResponse(
            competency_id=m.competency_id,
            competency_name=m.competency.name if m.competency else "Official Stat",
            target_proficiency=m.target_proficiency,
            coverage_weight=m.coverage_weight
        ) for m in mappings
    ]
    return CourseResponse(
        id=c.id,
        title=c.title,
        provider=c.provider,
        provider_course_id=c.provider_course_id,
        external_url=c.external_url,
        description=c.description,
        duration_hours=c.duration_hours,
        difficulty_level=c.difficulty_level,
        language=c.language,
        format=c.format,
        thumbnail_url=c.thumbnail_url,
        is_active=c.is_active,
        competencies_covered=mapping_responses
    )
