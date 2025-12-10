import time
import json
from typing import Callable
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.concurrency import iterate_in_threadpool
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.metrics import RequestMetric, TokenUsage

class RequestMetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.perf_counter()
        
        # Process request
        try:
            response = await call_next(request)
            status_code = response.status_code
        except Exception as e:
            status_code = 500
            raise e
        finally:
            # Calculate duration
            duration_ms = (time.perf_counter() - start_time) * 1000
            
            # Log to DB (in a separate session/thread ideally, but here sync for simplicity)
            # We filter out health checks and options to reduce noise
            if request.url.path != "/health" and request.method != "OPTIONS":
                self.log_request(
                    path=request.url.path,
                    method=request.method,
                    status_code=status_code,
                    duration_ms=duration_ms,
                    user_agent=request.headers.get("user-agent"),
                    request_id=str(request.state.request_id) if hasattr(request.state, "request_id") else ""
                )
                
                # Add header
                if 'response' in locals():
                    response.headers["X-Process-Time-Ms"] = f"{duration_ms:.2f}"

        return response

    def log_request(self, path, method, status_code, duration_ms, user_agent, request_id):
        try:
            db = SessionLocal()
            metric = RequestMetric(
                request_id=request_id,
                path=path,
                method=method,
                status_code=status_code,
                duration_ms=duration_ms,
                user_agent=user_agent
            )
            db.add(metric)
            db.commit()
            db.close()
        except Exception as e:
            print(f"Failed to log request metric: {e}")


class TokenTrackingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        response = await call_next(request)
        
        # Only check JSON responses from chat/agent endpoints
        if (
            response.headers.get("content-type") == "application/json" 
            and ("/chat" in request.url.path or "/agent" in request.url.path)
        ):
            # We need to read the body, which consumes it, so we must reconstruct it
            response_body = [chunk async for chunk in response.body_iterator]
            response.body_iterator = iterate_in_threadpool(iter(response_body))
            
            try:
                body_content = b"".join(response_body).decode()
                data = json.loads(body_content)
                
                # Look for token usage data
                # Expected format: { ..., "tokens_used": 123, "model": "claude-...", ... }
                if isinstance(data, dict):
                    tokens = data.get("tokens_used")
                    model = data.get("model") or "unknown"
                    cost = data.get("cost_usd")
                    
                    if tokens:
                        self.log_tokens(
                            model=model,
                            total_tokens=tokens,
                            cost_usd=cost,
                            agent_run_id=data.get("agent_run_id"),
                            conversation_id=data.get("conversation_id")
                        )
            except Exception:
                pass  # Ignore parsing errors
                
        return response

    def log_tokens(self, model, total_tokens, cost_usd, agent_run_id, conversation_id):
        try:
            db = SessionLocal()
            usage = TokenUsage(
                model=model,
                total_tokens=total_tokens,
                cost_usd=cost_usd,
                agent_run_id=agent_run_id,
                conversation_id=conversation_id
            )
            db.add(usage)
            db.commit()
            db.close()
        except Exception as e:
            print(f"Failed to log token usage: {e}")

