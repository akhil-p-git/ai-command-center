from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel


class MessageCreate(BaseModel):
    role: str
    content: str
    tool_name: Optional[str] = None


class MessageResponse(BaseModel):
    id: str
    conversation_id: str
    role: str
    content: str
    tokens: Optional[int] = None
    latency_ms: Optional[int] = None
    tool_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationCreate(BaseModel):
    channel: str = "chat"
    agent_id: Optional[str] = None
    workflow_id: Optional[str] = None
    metadata_: Optional[dict] = None


class ConversationResponse(BaseModel):
    id: str
    channel: str
    agent_id: Optional[str] = None
    workflow_id: Optional[str] = None
    status: str
    metadata_: Optional[dict] = None
    created_at: datetime
    updated_at: datetime
    message_count: int = 0
    latest_message: Optional[str] = None

    class Config:
        from_attributes = True


class ConversationDetail(ConversationResponse):
    messages: List[MessageResponse] = []
    total_tokens: int = 0
    total_latency_ms: int = 0


class ConversationListResponse(BaseModel):
    items: List[ConversationResponse]
    total: int
    skip: int
    limit: int
