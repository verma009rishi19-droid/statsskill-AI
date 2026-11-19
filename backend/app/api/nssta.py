from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models import NSSTATrainingProgramme
from app.schemas.course_training import NSSTATrainingProgrammeResponse

router = APIRouter(prefix="/nssta", tags=["NSSTA Training Programmes"])

@router.get("/programmes", response_model=List[NSSTATrainingProgrammeResponse])
def list_nssta_programmes(
    delivery_format: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(NSSTATrainingProgramme).filter(
        NSSTATrainingProgramme.tpac_approval_status == "verified_recommended"
    )
    if delivery_format:
        query = query.filter(NSSTATrainingProgramme.delivery_format == delivery_format)
    if search:
        query = query.filter(
            NSSTATrainingProgramme.title.ilike(f"%{search}%") |
            NSSTATrainingProgramme.eligibility_criteria.ilike(f"%{search}%")
        )

    return query.order_by(NSSTATrainingProgramme.title).all()

@router.get("/programmes/{programme_id}", response_model=NSSTATrainingProgrammeResponse)
def get_nssta_programme(programme_id: int, db: Session = Depends(get_db)):
    prog = db.query(NSSTATrainingProgramme).filter(
        NSSTATrainingProgramme.id == programme_id
    ).first()
    if not prog:
        raise HTTPException(status_code=404, detail="NSSTA Training Programme not found")
    return prog
