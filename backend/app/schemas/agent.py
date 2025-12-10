from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel


class AgentStep(BaseModel):
    name: str
    status: str  # pending, running, completed, failed
    duration_ms: Optional[int] = None
    input_preview: Optional[str] = None
    output_preview: Optional[str] = None


class AgentRunCreate(BaseModel):
    agent_id: str
    conversation_id: Optional[str] = None


class AgentRunResponse(BaseModel):
    id: str
    agent_id: str
    conversation_id: Optional[str] = None
    status: str
    duration_ms: Optional[int] = None
    error: Optional[str] = None
    steps: Optional[List[AgentStep]] = None
    tokens_used: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AgentRunListResponse(BaseModel):
    items: List[AgentRunResponse]
    total: int
    skip: int
    limit: int


class AgentInfo(BaseModel):
    id: str
    name: str
    description: str
    type: str  # rag, classification, summarization
    version: str
    graph_nodes: List[str]
    graph_edges: List[dict]


class AgentStats(BaseModel):
    total_runs: int
    success_rate: float
    avg_latency_ms: float
    total_tokens: int


class AgentDetail(AgentInfo):
    stats: AgentStats
    last_deployed: Optional[datetime] = None


class AgentListResponse(BaseModel):
    items: List[AgentDetail]
