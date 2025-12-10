from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import Conversation, AgentRun, RequestMetric, TokenUsage
from app.schemas import OverviewMetrics, TimeseriesResponse, TimeseriesPoint, TokenStats
from app.api.v1.agents import AGENT_DEFINITIONS

router = APIRouter()


@router.get("/overview", response_model=OverviewMetrics)
async def get_overview_metrics(db: Session = Depends(get_db)):
    # Total conversations
    total_conversations = db.query(func.count(Conversation.id)).scalar()

    # Total requests (from metrics table)
    total_requests = db.query(func.count(RequestMetric.id)).scalar()

    # Success rate (conversations completed vs total)
    completed = db.query(func.count(Conversation.id)).filter(
        Conversation.status == "completed"
    ).scalar()
    success_rate = round((completed / total_conversations) * 100, 1) if total_conversations > 0 else 100.0

    # Average latency from request metrics
    avg_latency = db.query(func.avg(RequestMetric.duration_ms)).scalar() or 0.0

    # Error rate (failed conversations + failed requests)
    failed_conversations = db.query(func.count(Conversation.id)).filter(
        Conversation.status == "failed"
    ).scalar()
    failed_requests = db.query(func.count(RequestMetric.id)).filter(
        RequestMetric.status_code >= 400
    ).scalar()
    total_items = total_conversations + total_requests
    error_rate = round(((failed_conversations + failed_requests) / total_items) * 100, 1) if total_items > 0 else 0.0

    # Token usage
    tokens_used = db.query(func.sum(TokenUsage.total_tokens)).scalar() or 0

    # Estimated cost
    estimated_cost = db.query(func.sum(TokenUsage.cost_usd)).scalar() or 0.0

    # Active agents (agents with at least one run)
    active_agents = len(AGENT_DEFINITIONS)

    return OverviewMetrics(
        total_conversations=total_conversations,
        total_requests=total_requests,
        success_rate=success_rate,
        avg_latency_ms=round(avg_latency, 1),
        error_rate=error_rate,
        tokens_used=tokens_used,
        estimated_cost_usd=round(estimated_cost, 4),
        active_agents=active_agents
    )


@router.get("/timeseries", response_model=TimeseriesResponse)
async def get_timeseries(
    metric: str = Query(..., description="Metric name: requests, errors, latency"),
    period: str = Query("24h", description="Time period: 1h, 24h, 7d"),
    db: Session = Depends(get_db)
):
    # Calculate time range
    now = datetime.now(timezone.utc)
    if period == "1h":
        start_time = now - timedelta(hours=1)
        bucket_minutes = 5
    elif period == "24h":
        start_time = now - timedelta(hours=24)
        bucket_minutes = 60
    elif period == "7d":
        start_time = now - timedelta(days=7)
        bucket_minutes = 360  # 6 hours
    else:
        start_time = now - timedelta(hours=24)
        bucket_minutes = 60

    # Generate time buckets
    data = []
    current = start_time
    while current < now:
        bucket_end = current + timedelta(minutes=bucket_minutes)

        if metric == "requests":
            value = db.query(func.count(RequestMetric.id)).filter(
                RequestMetric.timestamp >= current,
                RequestMetric.timestamp < bucket_end
            ).scalar() or 0
        elif metric == "errors":
            value = db.query(func.count(RequestMetric.id)).filter(
                RequestMetric.timestamp >= current,
                RequestMetric.timestamp < bucket_end,
                RequestMetric.status_code >= 400
            ).scalar() or 0
        elif metric == "latency":
            value = db.query(func.avg(RequestMetric.duration_ms)).filter(
                RequestMetric.timestamp >= current,
                RequestMetric.timestamp < bucket_end
            ).scalar() or 0
        else:
            value = 0

        data.append(TimeseriesPoint(timestamp=current, value=float(value)))
        current = bucket_end

    return TimeseriesResponse(metric=metric, period=period, data=data)


@router.get("/tokens", response_model=TokenStats)
async def get_token_stats(db: Session = Depends(get_db)):
    total_tokens = db.query(func.sum(TokenUsage.total_tokens)).scalar() or 0
    total_cost = db.query(func.sum(TokenUsage.cost_usd)).scalar() or 0.0

    # Group by model
    by_model_query = db.query(
        TokenUsage.model,
        func.sum(TokenUsage.total_tokens).label("tokens"),
        func.sum(TokenUsage.cost_usd).label("cost")
    ).group_by(TokenUsage.model).all()

    by_model = {
        row.model: {"tokens": row.tokens or 0, "cost": round(row.cost or 0, 4)}
        for row in by_model_query
    }

    return TokenStats(
        total_tokens=total_tokens,
        total_cost_usd=round(total_cost, 4),
        by_model=by_model
    )


@router.get("/agents/{agent_id}")
async def get_agent_metrics(agent_id: str, db: Session = Depends(get_db)):
    """Get aggregated metrics for a specific agent"""
    
    # Check if agent exists in definitions (optional, but good practice)
    # if agent_id not in AGENT_DEFINITIONS:
    #     raise HTTPException(status_code=404, detail="Agent not found")

    # Total runs
    total_runs = db.query(func.count(AgentRun.id)).filter(
        AgentRun.agent_id == agent_id
    ).scalar()

    # Success rate
    completed_runs = db.query(func.count(AgentRun.id)).filter(
        AgentRun.agent_id == agent_id,
        AgentRun.status == "completed"
    ).scalar()
    success_rate = round((completed_runs / total_runs) * 100, 1) if total_runs > 0 else 0.0

    # Avg latency
    avg_latency = db.query(func.avg(AgentRun.duration_ms)).filter(
        AgentRun.agent_id == agent_id,
        AgentRun.duration_ms.isnot(None)
    ).scalar() or 0.0

    # Total tokens
    # Note: AgentRun has tokens_used, or we can use TokenUsage table joined by agent_run_id
    total_tokens = db.query(func.sum(AgentRun.tokens_used)).filter(
        AgentRun.agent_id == agent_id
    ).scalar() or 0

    return {
        "agent_id": agent_id,
        "totalRuns": total_runs,
        "successRate": success_rate,
        "avgLatencyMs": round(avg_latency, 1),
        "totalTokens": total_tokens
    }
