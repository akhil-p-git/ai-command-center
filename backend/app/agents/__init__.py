from app.agents.base import BaseAgent, AgentState
from app.agents.doc_agent import DocAgent
from app.agents.incident_agent import IncidentAgent
from app.agents.slack_agent import SlackAgent

AGENTS = {
    "doc": DocAgent,
    "incident": IncidentAgent,
    "slack": SlackAgent,
}


def get_agent(agent_id: str) -> BaseAgent:
    """Get an agent instance by ID"""
    if agent_id not in AGENTS:
        raise ValueError(f"Unknown agent: {agent_id}")
    return AGENTS[agent_id]()


__all__ = [
    "BaseAgent",
    "AgentState",
    "DocAgent",
    "IncidentAgent",
    "SlackAgent",
    "AGENTS",
    "get_agent",
]
