from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class OverviewMetrics(BaseModel):
    total_conversations: int
    total_requests: int
    success_rate: float
    avg_latency_ms: float
    error_rate: float
    tokens_used: int
    estimated_cost_usd: float
    active_agents: int


class TimeseriesPoint(BaseModel):
    timestamp: datetime
    value: float


class TimeseriesResponse(BaseModel):
    metric: str
    period: str
    data: List[TimeseriesPoint]


class TokenStats(BaseModel):
    total_tokens: int
    total_cost_usd: float
    by_model: dict
