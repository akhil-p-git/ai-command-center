"""
Seed script to populate the database with demo data for showcasing the AI Command Center.

Run from the backend directory:
    python -m app.scripts.seed_demo_data
"""

import sys
import os
import random
from datetime import datetime, timezone, timedelta

# Add backend directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal, engine, Base
from app.models import (
    Conversation, Message, AgentRun, Workflow, WorkflowExecution,
    RequestMetric, TokenUsage
)


def seed_demo_data():
    """Populate the database with realistic demo data."""

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        print("Seeding demo data...")

        # Clear existing data (optional - comment out to append)
        print("  Clearing existing data...")
        db.query(Message).delete()
        db.query(AgentRun).delete()
        db.query(WorkflowExecution).delete()
        db.query(Conversation).delete()
        db.query(Workflow).delete()
        db.query(RequestMetric).delete()
        db.query(TokenUsage).delete()
        db.commit()

        # Seed Workflows
        print("  Creating workflows...")
        workflows = [
            Workflow(
                id="wf-doc-qa",
                name="Document Q&A Pipeline",
                n8n_workflow_id="n8n-123",
                trigger_type="webhook",
                status="active",
                created_at=datetime.now(timezone.utc) - timedelta(days=30)
            ),
            Workflow(
                id="wf-incident",
                name="Incident Response Flow",
                n8n_workflow_id="n8n-456",
                trigger_type="event",
                status="active",
                created_at=datetime.now(timezone.utc) - timedelta(days=25)
            ),
            Workflow(
                id="wf-slack-summary",
                name="Slack Daily Summary",
                n8n_workflow_id="n8n-789",
                trigger_type="schedule",
                status="active",
                created_at=datetime.now(timezone.utc) - timedelta(days=20)
            ),
        ]
        for wf in workflows:
            db.add(wf)
        db.commit()

        # Sample conversation topics
        doc_topics = [
            ("How do I reset my password?", "To reset your password, go to Settings > Security > Reset Password. You'll receive an email with a reset link."),
            ("What are the API rate limits?", "Our API has a rate limit of 100 requests per minute for free tier and 1000 for premium."),
            ("How to set up webhooks?", "Navigate to Integrations > Webhooks, click 'Add Webhook', enter your URL, and select the events you want to subscribe to."),
            ("What payment methods are accepted?", "We accept Visa, MasterCard, American Express, and PayPal. Enterprise customers can also pay via invoice."),
            ("How to export my data?", "Go to Settings > Data Management > Export. You can export in CSV, JSON, or Excel format."),
        ]

        incident_topics = [
            ("ERROR: Connection timeout to database", "Database connection restored. Root cause: Network latency spike."),
            ("WARNING: High CPU usage on server-03", "Scaled horizontally by adding 2 more instances. CPU now stable at 45%."),
            ("CRITICAL: SSL certificate expiring", "Certificate renewed and deployed. Expires in 365 days."),
            ("ERROR: Authentication service 503", "Service restarted. Memory leak in auth module identified and patched."),
        ]

        slack_topics = [
            "Team standup discussion about Q4 roadmap priorities",
            "Product review meeting notes from design team",
            "Engineering sync on microservices migration",
            "Customer feedback analysis from support tickets",
        ]

        agents = ["doc", "incident", "slack"]
        statuses = ["completed", "completed", "completed", "completed", "failed"]  # 80% success rate

        now = datetime.now(timezone.utc)

        # Create conversations and agent runs over the past 7 days
        print("  Creating conversations, messages, and agent runs...")
        for days_ago in range(7, -1, -1):
            # Create 5-15 conversations per day
            num_conversations = random.randint(5, 15)

            for _ in range(num_conversations):
                timestamp = now - timedelta(
                    days=days_ago,
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59)
                )

                agent_id = random.choice(agents)
                status = random.choice(statuses)

                # Create conversation
                conv = Conversation(
                    channel=random.choice(["chat", "slack", "webhook"]),
                    agent_id=agent_id,
                    status=status,
                    created_at=timestamp,
                    updated_at=timestamp + timedelta(minutes=random.randint(1, 5))
                )
                db.add(conv)
                db.flush()  # Get the ID

                # Create messages based on agent type
                if agent_id == "doc":
                    topic = random.choice(doc_topics)
                    user_msg = topic[0]
                    assistant_msg = topic[1]
                elif agent_id == "incident":
                    topic = random.choice(incident_topics)
                    user_msg = topic[0]
                    assistant_msg = topic[1]
                else:
                    topic = random.choice(slack_topics)
                    user_msg = f"Please summarize: {topic}"
                    assistant_msg = f"Summary: The team discussed {topic.lower()}. Key action items were identified and assigned to respective owners."

                # User message
                db.add(Message(
                    conversation_id=conv.id,
                    role="user",
                    content=user_msg,
                    tokens=random.randint(10, 50),
                    created_at=timestamp
                ))

                # Assistant message
                assistant_tokens = random.randint(100, 500)
                latency = random.randint(200, 2000)
                db.add(Message(
                    conversation_id=conv.id,
                    role="assistant",
                    content=assistant_msg if status == "completed" else "Error: Unable to process request.",
                    tokens=assistant_tokens,
                    latency_ms=latency,
                    created_at=timestamp + timedelta(seconds=latency/1000)
                ))

                # Create agent run
                agent_run = AgentRun(
                    agent_id=agent_id,
                    conversation_id=conv.id,
                    status=status,
                    duration_ms=latency + random.randint(100, 500),
                    error="Timeout error" if status == "failed" else None,
                    tokens_used=assistant_tokens + random.randint(10, 50),
                    steps=[
                        {"step_name": "retrieve_docs" if agent_id == "doc" else "classify" if agent_id == "incident" else "summarize",
                         "duration_ms": random.randint(50, 200)},
                        {"step_name": "generate_response" if agent_id == "doc" else "propose_actions" if agent_id == "incident" else "extract_actions",
                         "duration_ms": random.randint(100, 300)},
                    ],
                    created_at=timestamp
                )
                db.add(agent_run)
                db.flush()

                # Create token usage record
                input_tokens = random.randint(50, 200)
                output_tokens = assistant_tokens
                db.add(TokenUsage(
                    model="claude-3-5-sonnet-20241022",
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    total_tokens=input_tokens + output_tokens,
                    cost_usd=(input_tokens * 0.000003) + (output_tokens * 0.000015),
                    agent_run_id=agent_run.id,
                    conversation_id=conv.id,
                    timestamp=timestamp
                ))

        db.commit()

        # Create request metrics (simulating API traffic)
        print("  Creating request metrics...")
        api_paths = [
            "/api/v1/chat",
            "/api/v1/conversations",
            "/api/v1/agents",
            "/api/v1/metrics/overview",
            "/api/v1/knowledge/query",
        ]

        for days_ago in range(7, -1, -1):
            # Create 50-200 requests per day
            num_requests = random.randint(50, 200)

            for _ in range(num_requests):
                timestamp = now - timedelta(
                    days=days_ago,
                    hours=random.randint(0, 23),
                    minutes=random.randint(0, 59),
                    seconds=random.randint(0, 59)
                )

                # 95% success rate for API requests
                status_code = 200 if random.random() < 0.95 else random.choice([400, 404, 500])

                db.add(RequestMetric(
                    request_id=f"req-{random.randint(10000, 99999)}",
                    path=random.choice(api_paths),
                    method=random.choice(["GET", "POST"]),
                    status_code=status_code,
                    duration_ms=random.uniform(50, 500) if status_code == 200 else random.uniform(10, 100),
                    timestamp=timestamp,
                    user_agent="Mozilla/5.0 (AI Command Center Dashboard)"
                ))

        db.commit()

        # Print summary
        conv_count = db.query(Conversation).count()
        msg_count = db.query(Message).count()
        run_count = db.query(AgentRun).count()
        metric_count = db.query(RequestMetric).count()
        token_count = db.query(TokenUsage).count()

        print(f"\nDemo data seeded successfully!")
        print(f"  - Conversations: {conv_count}")
        print(f"  - Messages: {msg_count}")
        print(f"  - Agent Runs: {run_count}")
        print(f"  - Request Metrics: {metric_count}")
        print(f"  - Token Usage Records: {token_count}")
        print(f"  - Workflows: {len(workflows)}")

    except Exception as e:
        print(f"Error seeding data: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    seed_demo_data()
