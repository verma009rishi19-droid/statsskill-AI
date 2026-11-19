from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import List

from app.core.database import get_db
from app.models import AIAssistantInteraction, User
from app.schemas.assistant import ChatQueryRequest, ChatQueryResponse, SourceCitation
from app.services.ai_provider import get_ai_provider
from app.services.competency_service import CompetencyService
from app.api.deps import get_current_active_user

router = APIRouter(prefix="/assistant", tags=["AI Learning Assistant"])

@router.post("/chat", response_model=ChatQueryResponse)
def chat_with_assistant(
    req: ChatQueryRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    profile = current_user.profile
    gap_summary = CompetencyService.get_user_skill_gaps(db, current_user.id)
    gaps_list = [{"name": g.competency_name, "gap": g.gap, "priority": g.priority} for g in gap_summary.gaps if g.gap > 0]

    context_data = {
        "designation": profile.designation if profile else "Statistical Official",
        "department": profile.department.name if profile and profile.department else "MoSPI",
        "job_role": profile.job_role.title if profile and profile.job_role else "Statistical Officer",
        "cadre": profile.cadre if profile else "SSS",
        "gaps": gaps_list
    }

    ai_provider = get_ai_provider()
    result = ai_provider.generate_assistant_response(
        query=req.query,
        context_data=context_data,
        language=req.language or "en"
    )

    now = datetime.now(timezone.utc)
    interaction = AIAssistantInteraction(
        user_id=current_user.id,
        query=req.query,
        response=result["response"],
        context_type=req.context_type or "general",
        language=req.language or "en",
        source_references=result.get("sources", []),
        created_at=now
    )
    db.add(interaction)
    db.commit()

    citations = [
        SourceCitation(
            title=s.get("title", "Official Reference"),
            source=s.get("source", "Statistical Guidelines"),
            snippet=s.get("snippet", "")
        ) for s in result.get("sources", [])
    ]

    return ChatQueryResponse(
        query=req.query,
        response=result["response"],
        language=req.language or "en",
        context_type=req.context_type or "general",
        confidence=result.get("confidence", "high"),
        sources=citations,
        suggested_followups=result.get("followups", []),
        created_at=now
    )

@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    interactions = db.query(AIAssistantInteraction).filter(
        AIAssistantInteraction.user_id == current_user.id
    ).order_by(AIAssistantInteraction.created_at.desc()).limit(15).all()

    return [{
        "id": i.id,
        "query": i.query,
        "response": i.response,
        "context_type": i.context_type,
        "language": i.language,
        "created_at": i.created_at
    } for i in interactions]
