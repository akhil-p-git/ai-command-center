import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    agent_id = Column(String(50), nullable=False)
    conversation_id = Column(String(36), ForeignKey("conversations.id"), nullable=True)
    status = Column(String(20), nullable=False, default="running")  # running, completed, failed
    duration_ms = Column(Integer, nullable=True)
    error = Column(Text, nullable=True)
    steps = Column(JSON, nullable=True)  # Array of step objects
    tokens_used = Column(Integer, nullable=True, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    conversation = relationship("Conversation", back_populates="agent_runs")
    workflow_executions = relationship("WorkflowExecution", back_populates="agent_run")
