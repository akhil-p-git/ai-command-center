import time
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models import Conversation, Message, AgentRun
from app.schemas import ChatRequest, ChatResponse, AgentStep

router = APIRouter()


@router.post("", response_model=ChatResponse)
async def chat(data: ChatRequest, db: Session = Depends(get_db)):
    start_time = time.perf_counter()

    # Default to doc agent if not specified
    agent_id = data.agent_id or "doc"

    # Validate agent exists
    from app.api.v1.agents import AGENT_DEFINITIONS
    if agent_id not in AGENT_DEFINITIONS:
        raise HTTPException(status_code=400, detail=f"Unknown agent: {agent_id}")

    # Get or create conversation
    conversation_id = data.conversation_id
    if conversation_id:
        conversation = db.query(Conversation).filter(
            Conversation.id == conversation_id
        ).first()
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
    else:
        conversation = Conversation(
            channel="chat",
            agent_id=agent_id,
            status="active"
        )
        db.add(conversation)
        db.commit()
        db.refresh(conversation)
        conversation_id = conversation.id

    # Save user message
    user_message = Message(
        conversation_id=conversation_id,
        role="user",
        content=data.message
    )
    db.add(user_message)
    db.commit()

    # Run the agent
    try:
        from app.agents import get_agent
        agent = get_agent(agent_id)
        result = await agent.run(data.message, conversation_id, db)

        # Calculate timing
        duration_ms = int((time.perf_counter() - start_time) * 1000)

        # Save assistant message
        assistant_message = Message(
            conversation_id=conversation_id,
            role="assistant",
            content=result["response"],
            tokens=result.get("tokens_used", 0),
            latency_ms=duration_ms
        )
        db.add(assistant_message)

        # Update conversation
        conversation.status = "completed"
        conversation.updated_at = datetime.now(timezone.utc)
        db.commit()

        return ChatResponse(
            response=result["response"],
            conversation_id=conversation_id,
            agent_id=agent_id,
            steps=result.get("steps", []),
            tokens_used=result.get("tokens_used", 0),
            latency_ms=duration_ms
        )

    except Exception as e:
        # Save error and update conversation status
        conversation.status = "failed"
        db.commit()

        # Create error agent run
        agent_run = AgentRun(
            agent_id=agent_id,
            conversation_id=conversation_id,
            status="failed",
            error=str(e),
            duration_ms=int((time.perf_counter() - start_time) * 1000)
        )
        db.add(agent_run)
        db.commit()

        raise HTTPException(status_code=500, detail=f"Agent error: {str(e)}")
