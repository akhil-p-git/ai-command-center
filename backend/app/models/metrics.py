import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, Float
from app.core.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class RequestMetric(Base):
    __tablename__ = "request_metrics"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    request_id = Column(String(36), nullable=False)
    path = Column(String(255), nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer, nullable=False)
    duration_ms = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user_agent = Column(String(500), nullable=True)


class TokenUsage(Base):
    __tablename__ = "token_usage"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    model = Column(String(100), nullable=False)
    input_tokens = Column(Integer, nullable=False, default=0)
    output_tokens = Column(Integer, nullable=False, default=0)
    total_tokens = Column(Integer, nullable=False, default=0)
    cost_usd = Column(Float, nullable=True)
    agent_run_id = Column(String(36), nullable=True)
    conversation_id = Column(String(36), nullable=True)
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
