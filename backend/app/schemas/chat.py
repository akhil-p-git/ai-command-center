from typing import Optional, List
from pydantic import BaseModel
from app.schemas.agent import AgentStep


class ChatRequest(BaseModel):
    message: str
    agent_id: Optional[str] = None
    conversation_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    agent_id: str
    steps: List[AgentStep] = []
    tokens_used: int = 0
    latency_ms: int = 0
