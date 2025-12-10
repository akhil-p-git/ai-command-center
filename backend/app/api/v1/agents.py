from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import AgentRun
from app.schemas import (
    AgentInfo, AgentStats, AgentDetail, AgentListResponse,
    AgentRunResponse, AgentRunListResponse, AgentStep
)

router = APIRouter()

# Hardcoded agent definitions
AGENT_DEFINITIONS = {
    "doc": AgentInfo(
        id="doc",
        name="DocAgent",
        description="RAG agent for answering questions from documents",
        type="rag",
        version="1.0.0",
        graph_nodes=["START", "retrieve_docs", "generate_response", "END"],
        graph_edges=[
            {"from": "START", "to": "retrieve_docs"},
            {"from": "retrieve_docs", "to": "generate_response"},
            {"from": "generate_response", "to": "END"}
        ]
    ),
    "incident": AgentInfo(
        id="incident",
        name="IncidentAgent",
        description="Classifies log snippets and proposes remediation actions",
        type="classification",
        version="1.0.0",
        graph_nodes=["START", "classify", "propose_actions", "END"],
        graph_edges=[
            {"from": "START", "to": "classify"},
            {"from": "classify", "to": "propose_actions"},
            {"from": "propose_actions", "to": "END"}
        ]
    ),
    "slack": AgentInfo(
        id="slack",
        name="SlackAgent",
        description="Summarizes conversations and extracts action items",
        type="summarization",
        version="1.0.0",
        graph_nodes=["START", "summarize", "extract_actions", "END"],
        graph_edges=[
            {"from": "START", "to": "summarize"},
            {"from": "summarize", "to": "extract_actions"},
            {"from": "extract_actions", "to": "END"}
        ]
    )
}


def get_agent_stats(agent_id: str, db: Session) -> AgentStats:
    runs = db.query(AgentRun).filter(AgentRun.agent_id == agent_id).all()
    total_runs = len(runs)

    if total_runs == 0:
        return AgentStats(
            total_runs=0,
            success_rate=0.0,
            avg_latency_ms=0.0,
            total_tokens=0
        )

    successful = sum(1 for r in runs if r.status == "completed")
    total_latency = sum(r.duration_ms or 0 for r in runs)
    total_tokens = sum(r.tokens_used or 0 for r in runs)

    return AgentStats(
        total_runs=total_runs,
        success_rate=round((successful / total_runs) * 100, 1) if total_runs > 0 else 0.0,
        avg_latency_ms=round(total_latency / total_runs, 1) if total_runs > 0 else 0.0,
        total_tokens=total_tokens
    )


@router.get("", response_model=AgentListResponse)
async def list_agents(db: Session = Depends(get_db)):
    items = []
    for agent_id, agent_info in AGENT_DEFINITIONS.items():
        stats = get_agent_stats(agent_id, db)

        # Get last run time
        last_run = db.query(AgentRun).filter(
            AgentRun.agent_id == agent_id
        ).order_by(AgentRun.created_at.desc()).first()

        items.append(AgentDetail(
            id=agent_info.id,
            name=agent_info.name,
            description=agent_info.description,
            type=agent_info.type,
            version=agent_info.version,
            graph_nodes=agent_info.graph_nodes,
            graph_edges=agent_info.graph_edges,
            stats=stats,
            last_deployed=last_run.created_at if last_run else None
        ))

    return AgentListResponse(items=items)


@router.get("/{agent_id}", response_model=AgentDetail)
async def get_agent(agent_id: str, db: Session = Depends(get_db)):
    if agent_id not in AGENT_DEFINITIONS:
        raise HTTPException(status_code=404, detail="Agent not found")

    agent_info = AGENT_DEFINITIONS[agent_id]
    stats = get_agent_stats(agent_id, db)

    last_run = db.query(AgentRun).filter(
        AgentRun.agent_id == agent_id
    ).order_by(AgentRun.created_at.desc()).first()

    return AgentDetail(
        id=agent_info.id,
        name=agent_info.name,
        description=agent_info.description,
        type=agent_info.type,
        version=agent_info.version,
        graph_nodes=agent_info.graph_nodes,
        graph_edges=agent_info.graph_edges,
        stats=stats,
        last_deployed=last_run.created_at if last_run else None
    )


@router.get("/{agent_id}/runs", response_model=AgentRunListResponse)
async def get_agent_runs(
    agent_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if agent_id not in AGENT_DEFINITIONS:
        raise HTTPException(status_code=404, detail="Agent not found")

    query = db.query(AgentRun).filter(AgentRun.agent_id == agent_id)

    if status:
        query = query.filter(AgentRun.status == status)

    total = query.count()
    runs = query.order_by(AgentRun.created_at.desc()).offset(skip).limit(limit).all()

    items = [
        AgentRunResponse(
            id=run.id,
            agent_id=run.agent_id,
            conversation_id=run.conversation_id,
            status=run.status,
            duration_ms=run.duration_ms,
            error=run.error,
            steps=[AgentStep(**s) for s in (run.steps or [])],
            tokens_used=run.tokens_used,
            created_at=run.created_at
        ) for run in runs
    ]

    return AgentRunListResponse(items=items, total=total, skip=skip, limit=limit)
