import time
from typing import TypedDict, Optional, List
from sqlalchemy.orm import Session

from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.base import BaseAgent
from app.core.config import settings


class SlackAgentState(TypedDict):
    """State for the SlackAgent"""
    conversation_text: str
    summary: str
    action_items: List[str]
    key_decisions: List[str]


class SlackAgent(BaseAgent):
    """Agent for summarizing conversations and extracting action items"""

    def __init__(self):
        super().__init__("slack", "SlackAgent")
        self._db: Optional[Session] = None
        self._conversation_id: Optional[str] = None

    def _create_graph(self):
        """Create the LangGraph workflow"""
        graph = StateGraph(SlackAgentState)

        # Add nodes
        graph.add_node("summarize", self._summarize)
        graph.add_node("extract_actions", self._extract_actions)

        # Add edges
        graph.add_edge(START, "summarize")
        graph.add_edge("summarize", "extract_actions")
        graph.add_edge("extract_actions", END)

        return graph.compile()

    async def _summarize(self, state: SlackAgentState) -> dict:
        """Summarize the conversation"""
        start = time.perf_counter()
        conversation_text = state["conversation_text"]

        if not settings.ANTHROPIC_API_KEY:
            # Mock summary
            word_count = len(conversation_text.split())
            summary = f"[Mock Summary] This conversation contains approximately {word_count} words. It appears to discuss project-related topics. Key participants engaged in a productive discussion about implementation details and next steps."

            duration = int((time.perf_counter() - start) * 1000)
            self._log_step(
                "summarize",
                "completed",
                duration,
                input_preview=conversation_text[:100],
                output_preview=summary[:100]
            )
            return {"summary": summary}

        llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=settings.ANTHROPIC_API_KEY,
            max_tokens=512
        )

        system_prompt = """You are an expert at summarizing conversations.
Create a concise summary that captures:
1. Main topics discussed
2. Key points made
3. Overall outcome/conclusion

Keep the summary to 2-3 paragraphs maximum."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Conversation:\n{conversation_text}")
        ]

        response = await llm.ainvoke(messages)

        # Track tokens
        if hasattr(response, 'usage_metadata'):
            self._track_tokens(
                "claude-3-5-sonnet-20241022",
                response.usage_metadata.get('input_tokens', 0),
                response.usage_metadata.get('output_tokens', 0),
                self._conversation_id,
                self._db
            )

        duration = int((time.perf_counter() - start) * 1000)
        self._log_step(
            "summarize",
            "completed",
            duration,
            input_preview=conversation_text[:100],
            output_preview=response.content[:100]
        )

        return {"summary": response.content}

    async def _extract_actions(self, state: SlackAgentState) -> dict:
        """Extract action items and key decisions"""
        start = time.perf_counter()
        conversation_text = state["conversation_text"]
        summary = state.get("summary", "")

        if not settings.ANTHROPIC_API_KEY:
            # Mock action items
            action_items = [
                "Review and approve the proposed changes",
                "Schedule follow-up meeting for next week",
                "Update documentation with new requirements",
                "Share findings with the team"
            ]
            key_decisions = [
                "Agreed to proceed with the proposed approach",
                "Timeline set for end of sprint"
            ]

            duration = int((time.perf_counter() - start) * 1000)
            self._log_step(
                "extract_actions",
                "completed",
                duration,
                input_preview=f"Summary length: {len(summary)} chars",
                output_preview=f"{len(action_items)} actions, {len(key_decisions)} decisions"
            )
            return {"action_items": action_items, "key_decisions": key_decisions}

        llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=settings.ANTHROPIC_API_KEY,
            max_tokens=512
        )

        system_prompt = """You are an expert at identifying action items and decisions from conversations.
Extract:
1. ACTION ITEMS: Tasks that need to be done (format: "- [owner if mentioned]: task")
2. KEY DECISIONS: Important decisions made during the conversation

Format your response as:
ACTION ITEMS:
- item 1
- item 2

KEY DECISIONS:
- decision 1
- decision 2"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Conversation:\n{conversation_text}\n\nSummary:\n{summary}")
        ]

        response = await llm.ainvoke(messages)

        # Track tokens
        if hasattr(response, 'usage_metadata'):
            self._track_tokens(
                "claude-3-5-sonnet-20241022",
                response.usage_metadata.get('input_tokens', 0),
                response.usage_metadata.get('output_tokens', 0),
                self._conversation_id,
                self._db
            )

        # Parse response
        content = response.content
        action_items = []
        key_decisions = []
        current_section = None

        for line in content.split("\n"):
            line = line.strip()
            if "ACTION ITEMS" in line.upper():
                current_section = "actions"
            elif "KEY DECISIONS" in line.upper() or "DECISIONS" in line.upper():
                current_section = "decisions"
            elif line.startswith("-") or line.startswith("•"):
                item = line.lstrip("-•").strip()
                if item:
                    if current_section == "actions":
                        action_items.append(item)
                    elif current_section == "decisions":
                        key_decisions.append(item)

        duration = int((time.perf_counter() - start) * 1000)
        self._log_step(
            "extract_actions",
            "completed",
            duration,
            input_preview=f"Summary length: {len(summary)} chars",
            output_preview=f"{len(action_items)} actions, {len(key_decisions)} decisions"
        )

        return {"action_items": action_items, "key_decisions": key_decisions}

    async def _execute(
        self,
        input_text: str,
        conversation_id: Optional[str],
        db: Session
    ) -> str:
        """Execute the SlackAgent workflow"""
        self._db = db
        self._conversation_id = conversation_id

        graph = self._create_graph()

        initial_state = {
            "conversation_text": input_text,
            "summary": "",
            "action_items": [],
            "key_decisions": []
        }

        result = await graph.ainvoke(initial_state)

        # Format response
        response = f"""## Conversation Summary

{result['summary']}

### Action Items
"""
        if result['action_items']:
            for item in result['action_items']:
                response += f"- [ ] {item}\n"
        else:
            response += "No action items identified.\n"

        response += "\n### Key Decisions\n"
        if result['key_decisions']:
            for decision in result['key_decisions']:
                response += f"- {decision}\n"
        else:
            response += "No key decisions identified.\n"

        return response
