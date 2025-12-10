from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import Workflow, WorkflowExecution
from app.schemas import (
    WorkflowCreate, WorkflowResponse, WorkflowDetail,
    WorkflowExecutionResponse, WorkflowExecutionListResponse, WorkflowListResponse
)

router = APIRouter()


@router.get("", response_model=WorkflowListResponse)
async def list_workflows(db: Session = Depends(get_db)):
    workflows = db.query(Workflow).order_by(Workflow.created_at.desc()).all()

    items = []
    for wf in workflows:
        executions = db.query(WorkflowExecution).filter(
            WorkflowExecution.workflow_id == wf.id
        ).all()

        execution_count = len(executions)
        successful = sum(1 for e in executions if e.status == "completed")
        success_rate = round((successful / execution_count) * 100, 1) if execution_count > 0 else 0.0

        last_execution = db.query(WorkflowExecution).filter(
            WorkflowExecution.workflow_id == wf.id
        ).order_by(WorkflowExecution.created_at.desc()).first()

        items.append(WorkflowResponse(
            id=wf.id,
            name=wf.name,
            trigger_type=wf.trigger_type,
            n8n_workflow_id=wf.n8n_workflow_id,
            status=wf.status,
            created_at=wf.created_at,
            execution_count=execution_count,
            success_rate=success_rate,
            last_run=last_execution.created_at if last_execution else None
        ))

    return WorkflowListResponse(items=items, total=len(items))


@router.get("/{workflow_id}", response_model=WorkflowDetail)
async def get_workflow(workflow_id: str, db: Session = Depends(get_db)):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    executions = db.query(WorkflowExecution).filter(
        WorkflowExecution.workflow_id == workflow_id
    ).order_by(WorkflowExecution.created_at.desc()).limit(10).all()

    execution_count = db.query(func.count(WorkflowExecution.id)).filter(
        WorkflowExecution.workflow_id == workflow_id
    ).scalar()

    all_executions = db.query(WorkflowExecution).filter(
        WorkflowExecution.workflow_id == workflow_id
    ).all()
    successful = sum(1 for e in all_executions if e.status == "completed")
    success_rate = round((successful / execution_count) * 100, 1) if execution_count > 0 else 0.0

    last_execution = executions[0] if executions else None

    recent_executions = [
        WorkflowExecutionResponse(
            id=e.id,
            workflow_id=e.workflow_id,
            status=e.status,
            duration_ms=e.duration_ms,
            agent_run_id=e.agent_run_id,
            conversation_id=e.conversation_id,
            created_at=e.created_at
        ) for e in executions
    ]

    return WorkflowDetail(
        id=workflow.id,
        name=workflow.name,
        trigger_type=workflow.trigger_type,
        n8n_workflow_id=workflow.n8n_workflow_id,
        status=workflow.status,
        created_at=workflow.created_at,
        execution_count=execution_count,
        success_rate=success_rate,
        last_run=last_execution.created_at if last_execution else None,
        recent_executions=recent_executions
    )


@router.get("/{workflow_id}/runs", response_model=WorkflowExecutionListResponse)
async def get_workflow_executions(
    workflow_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    workflow = db.query(Workflow).filter(Workflow.id == workflow_id).first()
    if not workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")

    query = db.query(WorkflowExecution).filter(WorkflowExecution.workflow_id == workflow_id)

    if status:
        query = query.filter(WorkflowExecution.status == status)

    total = query.count()
    executions = query.order_by(WorkflowExecution.created_at.desc()).offset(skip).limit(limit).all()

    items = [
        WorkflowExecutionResponse(
            id=e.id,
            workflow_id=e.workflow_id,
            status=e.status,
            duration_ms=e.duration_ms,
            agent_run_id=e.agent_run_id,
            conversation_id=e.conversation_id,
            created_at=e.created_at
        ) for e in executions
    ]

    return WorkflowExecutionListResponse(items=items, total=total, skip=skip, limit=limit)


@router.post("", response_model=WorkflowResponse)
async def create_workflow(data: WorkflowCreate, db: Session = Depends(get_db)):
    workflow = Workflow(
        name=data.name,
        trigger_type=data.trigger_type,
        n8n_workflow_id=data.n8n_workflow_id
    )
    db.add(workflow)
    db.commit()
    db.refresh(workflow)

    return WorkflowResponse(
        id=workflow.id,
        name=workflow.name,
        trigger_type=workflow.trigger_type,
        n8n_workflow_id=workflow.n8n_workflow_id,
        status=workflow.status,
        created_at=workflow.created_at,
        execution_count=0,
        success_rate=0.0,
        last_run=None
    )
