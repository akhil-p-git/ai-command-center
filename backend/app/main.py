import time
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import engine, Base
from app.api.v1 import api_router
from app.middleware.metrics import RequestMetricsMiddleware, TokenTrackingMiddleware

# Import models to ensure they are registered with Base
from app.models import (  # noqa: F401
    Conversation, Message, AgentRun, Workflow, WorkflowExecution,
    KnowledgeCollection, KnowledgeChunk, RequestMetric, TokenUsage
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown: cleanup if needed


app = FastAPI(
    title=settings.APP_NAME,
    description="Admin dashboard for monitoring and managing AI agents and workflows",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Metrics middleware
app.add_middleware(RequestMetricsMiddleware)
app.add_middleware(TokenTrackingMiddleware)


# Health check endpoint
@app.get("/health", tags=["health"])
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": settings.APP_NAME,
    }


# Seed endpoint (for demo purposes)
@app.post("/api/v1/admin/seed", tags=["admin"])
async def seed_demo_data():
    """Seed the database with demo data for demonstration purposes."""
    from app.scripts.seed_demo_data import seed_demo_data as run_seed
    try:
        run_seed()
        return {"status": "success", "message": "Demo data seeded successfully"}
    except Exception as e:
        return {"status": "error", "message": str(e)}


# Include API router
app.include_router(api_router, prefix="/api/v1")
