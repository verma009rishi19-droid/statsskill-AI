from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ChatQueryRequest(BaseModel):
    query: str
    context_type: Optional[str] = "general"  # general, concept, skill_gap, recommendations, lab
    language: Optional[str] = "en"  # "en", "hi"

class SourceCitation(BaseModel):
    title: str
    source: str
    snippet: str

class ChatQueryResponse(BaseModel):
    query: str
    response: str
    language: str
    context_type: str
    confidence: str  # "high", "medium", "moderate_uncertainty"
    sources: List[SourceCitation] = []
    suggested_followups: List[str] = []
    created_at: datetime
