from fastapi import APIRouter

from app.api.v1 import conversations, agents, workflows, knowledge, metrics, chat, incidents

api_router = APIRouter()

api_router.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
api_router.include_router(agents.router, prefix="/agents", tags=["agents"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["workflows"])
api_router.include_router(knowledge.router, prefix="/knowledge", tags=["knowledge"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(incidents.router, prefix="/incidents", tags=["incidents"])
