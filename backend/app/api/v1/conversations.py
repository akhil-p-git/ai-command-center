from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.database import get_db
from app.models import Conversation, Message
from app.schemas import (
    ConversationCreate, ConversationResponse, ConversationDetail,
    ConversationListResponse, MessageResponse
)

router = APIRouter()


@router.get("", response_model=ConversationListResponse)
async def list_conversations(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    channel: Optional[str] = None,
    agent_id: Optional[str] = None,
    status: Optional[str] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Conversation)

    if channel:
        query = query.filter(Conversation.channel == channel)
    if agent_id:
        query = query.filter(Conversation.agent_id == agent_id)
    if status:
        query = query.filter(Conversation.status == status)
    if date_from:
        query = query.filter(Conversation.created_at >= date_from)
    if date_to:
        query = query.filter(Conversation.created_at <= date_to)

    total = query.count()
    conversations = query.order_by(Conversation.created_at.desc()).offset(skip).limit(limit).all()

    items = []
    for conv in conversations:
        message_count = db.query(func.count(Message.id)).filter(Message.conversation_id == conv.id).scalar()
        latest_message = db.query(Message).filter(
            Message.conversation_id == conv.id
        ).order_by(Message.created_at.desc()).first()

        items.append(ConversationResponse(
            id=conv.id,
            channel=conv.channel,
            agent_id=conv.agent_id,
            workflow_id=conv.workflow_id,
            status=conv.status,
            metadata_=conv.metadata_,
            created_at=conv.created_at,
            updated_at=conv.updated_at,
            message_count=message_count,
            latest_message=latest_message.content[:100] if latest_message else None
        ))

    return ConversationListResponse(items=items, total=total, skip=skip, limit=limit)


@router.get("/{conversation_id}", response_model=ConversationDetail)
async def get_conversation(conversation_id: str, db: Session = Depends(get_db)):
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    messages = db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc()).all()

    message_responses = [
        MessageResponse(
            id=m.id,
            conversation_id=m.conversation_id,
            role=m.role,
            content=m.content,
            tokens=m.tokens,
            latency_ms=m.latency_ms,
            tool_name=m.tool_name,
            created_at=m.created_at
        ) for m in messages
    ]

    total_tokens = sum(m.tokens or 0 for m in messages)
    total_latency = sum(m.latency_ms or 0 for m in messages)

    return ConversationDetail(
        id=conversation.id,
        channel=conversation.channel,
        agent_id=conversation.agent_id,
        workflow_id=conversation.workflow_id,
        status=conversation.status,
        metadata_=conversation.metadata_,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=len(messages),
        latest_message=messages[-1].content[:100] if messages else None,
        messages=message_responses,
        total_tokens=total_tokens,
        total_latency_ms=total_latency
    )


@router.post("", response_model=ConversationResponse)
async def create_conversation(data: ConversationCreate, db: Session = Depends(get_db)):
    conversation = Conversation(
        channel=data.channel,
        agent_id=data.agent_id,
        workflow_id=data.workflow_id,
        metadata_=data.metadata_
    )
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return ConversationResponse(
        id=conversation.id,
        channel=conversation.channel,
        agent_id=conversation.agent_id,
        workflow_id=conversation.workflow_id,
        status=conversation.status,
        metadata_=conversation.metadata_,
        created_at=conversation.created_at,
        updated_at=conversation.updated_at,
        message_count=0,
        latest_message=None
    )
