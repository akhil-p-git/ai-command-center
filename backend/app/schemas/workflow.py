from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class WorkflowCreate(BaseModel):
    name: str
    trigger_type: str
    n8n_workflow_id: Optional[str] = None


class WorkflowResponse(BaseModel):
    id: str
    name: str
    trigger_type: str
    n8n_workflow_id: Optional[str] = None
    status: str
    created_at: datetime
    execution_count: int = 0
    success_rate: float = 0.0
    last_run: Optional[datetime] = None

    class Config:
        from_attributes = True


class WorkflowExecutionResponse(BaseModel):
    id: str
    workflow_id: str
    status: str
    duration_ms: Optional[int] = None
    agent_run_id: Optional[str] = None
    conversation_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class WorkflowExecutionListResponse(BaseModel):
    items: List[WorkflowExecutionResponse]
    total: int
    skip: int
    limit: int


class WorkflowDetail(WorkflowResponse):
    recent_executions: List[WorkflowExecutionResponse] = []


class WorkflowListResponse(BaseModel):
    items: List[WorkflowResponse]
    total: int
