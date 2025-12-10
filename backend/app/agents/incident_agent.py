import time
from typing import TypedDict, Optional, List
from sqlalchemy.orm import Session

from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import HumanMessage, SystemMessage

from app.agents.base import BaseAgent
from app.core.config import settings


class IncidentAgentState(TypedDict):
    """State for the IncidentAgent"""
    log_snippet: str
    severity: str  # critical, high, medium, low
    category: str
    recommended_actions: List[str]
    analysis: str


class IncidentAgent(BaseAgent):
    """Agent for classifying log snippets and proposing remediation actions"""

    def __init__(self):
        super().__init__("incident", "IncidentAgent")
        self._db: Optional[Session] = None
        self._conversation_id: Optional[str] = None

    def _create_graph(self):
        """Create the LangGraph workflow"""
        graph = StateGraph(IncidentAgentState)

        # Add nodes
        graph.add_node("classify", self._classify)
        graph.add_node("propose_actions", self._propose_actions)

        # Add edges
        graph.add_edge(START, "classify")
        graph.add_edge("classify", "propose_actions")
        graph.add_edge("propose_actions", END)

        return graph.compile()

    async def _classify(self, state: IncidentAgentState) -> dict:
        """Classify the log snippet"""
        start = time.perf_counter()
        log_snippet = state["log_snippet"]

        if not settings.ANTHROPIC_API_KEY:
            # Mock classification based on keywords
            log_lower = log_snippet.lower()
            if any(word in log_lower for word in ["error", "exception", "failed", "critical"]):
                severity = "high"
                category = "error"
            elif any(word in log_lower for word in ["warning", "warn", "deprecated"]):
                severity = "medium"
                category = "warning"
            elif any(word in log_lower for word in ["timeout", "slow", "latency"]):
                severity = "medium"
                category = "performance"
            else:
                severity = "low"
                category = "info"

            duration = int((time.perf_counter() - start) * 1000)
            self._log_step(
                "classify",
                "completed",
                duration,
                input_preview=log_snippet[:100],
                output_preview=f"Severity: {severity}, Category: {category}"
            )
            return {"severity": severity, "category": category}

        llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=settings.ANTHROPIC_API_KEY,
            max_tokens=512
        )

        system_prompt = """You are an expert DevOps engineer analyzing log snippets.
Classify the log based on:
1. Severity: critical, high, medium, or low
2. Category: error, warning, performance, security, info

Respond in this exact format:
SEVERITY: [level]
CATEGORY: [category]
ANALYSIS: [brief explanation]"""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Log snippet:\n{log_snippet}")
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
        severity = "medium"
        category = "error"
        analysis = content

        for line in content.split("\n"):
            if line.startswith("SEVERITY:"):
                severity = line.split(":", 1)[1].strip().lower()
            elif line.startswith("CATEGORY:"):
                category = line.split(":", 1)[1].strip().lower()
            elif line.startswith("ANALYSIS:"):
                analysis = line.split(":", 1)[1].strip()

        duration = int((time.perf_counter() - start) * 1000)
        self._log_step(
            "classify",
            "completed",
            duration,
            input_preview=log_snippet[:100],
            output_preview=f"Severity: {severity}, Category: {category}"
        )

        return {"severity": severity, "category": category, "analysis": analysis}

    async def _propose_actions(self, state: IncidentAgentState) -> dict:
        """Propose remediation actions based on classification"""
        start = time.perf_counter()

        severity = state.get("severity", "medium")
        category = state.get("category", "error")
        log_snippet = state["log_snippet"]

        if not settings.ANTHROPIC_API_KEY:
            # Mock actions based on category
            actions = {
                "error": [
                    "Check application logs for stack traces",
                    "Review recent deployments",
                    "Verify database connections",
                    "Check service health endpoints"
                ],
                "warning": [
                    "Monitor for escalation",
                    "Review deprecated code usage",
                    "Schedule technical debt cleanup"
                ],
                "performance": [
                    "Check system resources (CPU, memory)",
                    "Review database query performance",
                    "Check network latency",
                    "Consider scaling resources"
                ],
                "security": [
                    "Review access logs",
                    "Check for unauthorized access attempts",
                    "Verify SSL certificates",
                    "Run security scan"
                ],
                "info": [
                    "No immediate action required",
                    "Log for reference"
                ]
            }

            recommended = actions.get(category, actions["info"])
            duration = int((time.perf_counter() - start) * 1000)
            self._log_step(
                "propose_actions",
                "completed",
                duration,
                input_preview=f"Severity: {severity}, Category: {category}",
                output_preview=f"{len(recommended)} actions proposed"
            )
            return {"recommended_actions": recommended}

        llm = ChatAnthropic(
            model="claude-3-5-sonnet-20241022",
            api_key=settings.ANTHROPIC_API_KEY,
            max_tokens=512
        )

        system_prompt = f"""You are an expert DevOps engineer.
Based on a {severity} severity {category} incident, propose specific remediation actions.
List 3-5 actionable steps, ordered by priority.
Be specific and technical."""

        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Log: {log_snippet}\nSeverity: {severity}\nCategory: {category}")
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

        # Parse actions from response
        actions = []
        for line in response.content.split("\n"):
            line = line.strip()
            if line and (line[0].isdigit() or line.startswith("-") or line.startswith("•")):
                # Remove numbering/bullets
                action = line.lstrip("0123456789.-•) ").strip()
                if action:
                    actions.append(action)

        if not actions:
            actions = [response.content]

        duration = int((time.perf_counter() - start) * 1000)
        self._log_step(
            "propose_actions",
            "completed",
            duration,
            input_preview=f"Severity: {severity}, Category: {category}",
            output_preview=f"{len(actions)} actions proposed"
        )

        return {"recommended_actions": actions}

    async def _execute(
        self,
        input_text: str,
        conversation_id: Optional[str],
        db: Session
    ) -> str:
        """Execute the IncidentAgent workflow"""
        self._db = db
        self._conversation_id = conversation_id

        graph = self._create_graph()

        initial_state = {
            "log_snippet": input_text,
            "severity": "",
            "category": "",
            "recommended_actions": [],
            "analysis": ""
        }

        result = await graph.ainvoke(initial_state)

        # Format response
        response = f"""## Incident Analysis

**Severity:** {result['severity'].upper()}
**Category:** {result['category'].title()}

### Analysis
{result.get('analysis', 'Analysis completed.')}

### Recommended Actions
"""
        for i, action in enumerate(result['recommended_actions'], 1):
            response += f"{i}. {action}\n"

        return response
