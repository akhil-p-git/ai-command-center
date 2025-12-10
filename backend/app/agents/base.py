import time
from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import TypedDict, Optional, List, Any
from sqlalchemy.orm import Session

from app.models import AgentRun, TokenUsage
from app.schemas import AgentStep


class AgentState(TypedDict, total=False):
    """Base state for all agents"""
    input: str
    messages: List[dict]
    context: str
    response: str
    steps: List[dict]
    error: Optional[str]
    tokens_used: int


class BaseAgent(ABC):
    """Base class for all LangGraph agents"""

    def __init__(self, agent_id: str, name: str):
        self.agent_id = agent_id
        self.name = name
        self._steps: List[AgentStep] = []
        self._tokens_used: int = 0
        self._start_time: float = 0

    def _log_step(
        self,
        name: str,
        status: str = "completed",
        duration_ms: Optional[int] = None,
        input_preview: Optional[str] = None,
        output_preview: Optional[str] = None
    ):
        """Log a step in the agent's execution"""
        step = AgentStep(
            name=name,
            status=status,
            duration_ms=duration_ms,
            input_preview=input_preview[:200] if input_preview else None,
            output_preview=output_preview[:200] if output_preview else None
        )
        self._steps.append(step)

    def _save_run(
        self,
        conversation_id: Optional[str],
        db: Session,
        status: str = "completed",
        error: Optional[str] = None
    ) -> AgentRun:
        """Save the agent run to the database"""
        duration_ms = int((time.perf_counter() - self._start_time) * 1000)

        agent_run = AgentRun(
            agent_id=self.agent_id,
            conversation_id=conversation_id,
            status=status,
            duration_ms=duration_ms,
            error=error,
            steps=[s.model_dump() for s in self._steps],
            tokens_used=self._tokens_used
        )
        db.add(agent_run)
        db.commit()
        db.refresh(agent_run)
        return agent_run

    def _track_tokens(
        self,
        model: str,
        input_tokens: int,
        output_tokens: int,
        conversation_id: Optional[str],
        db: Session
    ):
        """Track token usage and cost"""
        total_tokens = input_tokens + output_tokens
        self._tokens_used += total_tokens

        # Cost estimation (Claude 3.5 Sonnet pricing)
        cost_per_input = 3.0 / 1_000_000  # $3 per 1M input tokens
        cost_per_output = 15.0 / 1_000_000  # $15 per 1M output tokens
        cost = (input_tokens * cost_per_input) + (output_tokens * cost_per_output)

        token_usage = TokenUsage(
            model=model,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            total_tokens=total_tokens,
            cost_usd=cost,
            conversation_id=conversation_id
        )
        db.add(token_usage)
        db.commit()

    async def run(
        self,
        input_text: str,
        conversation_id: Optional[str],
        db: Session
    ) -> dict:
        """Run the agent and return results"""
        self._steps = []
        self._tokens_used = 0
        self._start_time = time.perf_counter()

        try:
            result = await self._execute(input_text, conversation_id, db)
            self._save_run(conversation_id, db, status="completed")
            return {
                "response": result,
                "steps": self._steps,
                "tokens_used": self._tokens_used
            }
        except Exception as e:
            self._save_run(conversation_id, db, status="failed", error=str(e))
            raise

    @abstractmethod
    async def _execute(
        self,
        input_text: str,
        conversation_id: Optional[str],
        db: Session
    ) -> str:
        """Execute the agent logic - to be implemented by subclasses"""
        pass
