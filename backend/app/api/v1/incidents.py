from datetime import datetime, timezone
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import uuid

router = APIRouter()

# Simple in-memory storage for demo (or add Incident model)
incidents_store = []

class IncidentCreate(BaseModel):
    log_snippet: str
    severity: str
    category: str
    recommended_actions: List[str]
    conversation_id: Optional[str] = None

class IncidentResponse(BaseModel):
    id: str
    log_snippet: str
    severity: str
    category: str
    recommended_actions: List[str]
    conversation_id: Optional[str]
    created_at: str

@router.post("", response_model=IncidentResponse)
async def create_incident(data: IncidentCreate):
    incident = {
        "id": str(uuid.uuid4()),
        "log_snippet": data.log_snippet,
        "severity": data.severity,
        "category": data.category,
        "recommended_actions": data.recommended_actions,
        "conversation_id": data.conversation_id,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    incidents_store.append(incident)
    return incident

@router.get("", response_model=List[IncidentResponse])
async def list_incidents():
    return incidents_store[-50:]  # Last 50

