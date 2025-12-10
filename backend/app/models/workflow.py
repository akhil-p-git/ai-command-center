import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Workflow(Base):
    __tablename__ = "workflows"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    trigger_type = Column(String(50), nullable=False)  # webhook, slack, schedule
    n8n_workflow_id = Column(String(100), nullable=True)
    status = Column(String(20), nullable=False, default="active")  # active, inactive
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    executions = relationship("WorkflowExecution", back_populates="workflow", cascade="all, delete-orphan")
    conversations = relationship("Conversation", backref="workflow")


class WorkflowExecution(Base):
    __tablename__ = "workflow_executions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    workflow_id = Column(String(36), ForeignKey("workflows.id"), nullable=False)
    status = Column(String(20), nullable=False, default="running")  # running, completed, failed
    duration_ms = Column(Integer, nullable=True)
    agent_run_id = Column(String(36), ForeignKey("agent_runs.id"), nullable=True)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    workflow = relationship("Workflow", back_populates="executions")
    agent_run = relationship("AgentRun", back_populates="workflow_executions")
