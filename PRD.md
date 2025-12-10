# AI Command Center - Product Requirements Document

## 1. Product Overview

The product is an "AI Command Center" web app: an admin-style dashboard with a beautiful React UI where you can monitor, debug, and manage AI agents and workflows (LangGraph/LangChain) that are orchestrated by n8n and powered by Claude via API.

It is explicitly designed to demonstrate skills across agentic AI, Python, React, n8n, Docker, basic CI/CD, and cloud deployment.

## 2. Goals and Non-Goals

### Goals

- **Show end-to-end capability:**
  - Multi-agent system using LangGraph/LangChain (RAG + tools)
  - React admin dashboard with a polished UI
  - n8n workflows integrated with the agents
  - Containerized backend + frontend, CI/CD, and deployed to a public URL using a free/cheap Docker-friendly host

- **Provide enough observability** to debug and talk about LLM/agent behavior

### Non-Goals

- Full production hardening (multi-tenant, SSO, rate limiting, billing)
- Heavy AWS MLOps (SageMaker, Bedrock) for this iteration; conceptually describe how to swap them in

## 3. Target Users and Top Use Cases

### Target Users

"AI/Platform engineer" (you, or hiring managers evaluating you) who wants to:
- Inspect agent runs and workflows
- Test prompts and knowledge bases
- See metrics, errors, and basic evaluations

### Key Use Cases

1. **Explore Conversations**
   - Filter and search past conversations
   - Open a conversation to see messages, tool calls, and workflow context

2. **Inspect Agents and Workflows**
   - View list of agents, their status, recent performance, and traces
   - View n8n workflows and their recent invocations

3. **Run Live Tests**
   - Start a new chat in the dashboard, send a query, watch agent steps and tools in real time

4. **Basic Observability**
   - See latency, error rate, and usage metrics at a glance

## 4. Feature Requirements

### 4.1 Dashboard Layout

**Top Bar**
- App name, environment badge (Dev/Prod), user avatar (can be mock)

**Left Sidebar**
- Sections: "Overview", "Conversations", "Agents", "Workflows", "Knowledge", "Settings"

**Main Panels per Section**

| Section | Required Panels |
|---------|-----------------|
| Overview | KPI cards, small charts, recent activity feed |
| Conversations | Filter/search list + conversation detail viewer |
| Agents | Agents table + agent detail with graph steps/traces |
| Workflows | n8n workflows list + executions for selected workflow |
| Knowledge | Collections list + test query panel |
| Settings | API keys (local only), model selection, feature flags, environment switch mock |

### 4.2 Conversation Explorer

**Filter by:**
- Date range, channel (Slack/Webhook), agent, success/failure

**Conversation Detail:**
- Message list (user, assistant, tool messages)
- Metadata panel: model, latency, tokens, cost estimate, n8n workflow ID if applicable
- Timeline of steps for agent run (states traversed in LangGraph)

### 4.3 Agents View

**Agents List:**
- Columns: Name, Version, Description, Type, Last Deployed, Success Rate, Avg Latency

**Agent Detail:**
- Simple graph visualization of states (even a static diagram / list)
- Recent runs: list with status, duration, errors, link to conversation

**Agents to Implement for Demo:**
1. **DocAgent**: RAG over a small docs folder
2. **IncidentAgent**: Given a log snippet, classify severity and propose actions
3. **SlackAgent**: Summarize conversation and produce action items

### 4.4 Workflows (n8n)

**Workflows List:**
- Name, Trigger type (Webhook/Slack), Status, Last Run, Success Rate

**Workflow Detail:**
- Table of last N executions with status and duration
- Link back to associated conversation / agent run ID when available

**Demo Workflows (at least 2):**
1. Webhook → call backend `/agent/chat` → return response
2. Slack (or simulated) → classification → create "incident" record (in DB) via backend

### 4.5 Knowledge Management

**Collections Table:**
- Name, Number of documents, Vector count, Last indexed

**Test Query Box:**
- Enter query, show top 3 chunks with similarity scores and source filenames

### 4.6 Observability & Metrics

**Overview Charts:**
- Requests over time
- Error rate over time
- Avg latency over time

**Metrics per Agent:**
- Tokens, latency, simple eval scores (can be manual)

## 5. Tech Stack

### Frontend
- React + TypeScript
- UI library: Material UI (MUI) templates for dashboard layout
- Routing: React Router
- State/query: React Query or equivalent for API calls

### Backend
- Python 3.11+
- FastAPI as the main HTTP server
- LangChain + LangGraph for agents and RAG
- Vector store: local (e.g., Chroma/FAISS/Qdrant – Qdrant aligns with n8n kit)
- Storage: SQLite/Postgres (SQLite is enough for demo)

### Orchestration / Tools
- n8n self-hosted (Docker)
- Claude API (via Claude Max) as primary LLM

### DevOps / Infra
- Docker for backend and, optionally, frontend
- Docker Compose for local multi-service dev
- GitHub Actions for CI:
  - Run tests
  - Build images
- Deployment target:
  - Free-tier Docker host such as Render (web service using Dockerfile)

## 6. System Architecture (High Level)

```
React app (browser) → FastAPI backend → LLM + vector store
```

**n8n:**
- Exposes webhooks and/or listens to external channels
- Calls FastAPI for agent actions (e.g., `/agent/chat`, `/incident/create`)

**Backend:**
- Defines LangGraph graphs for agents; stores traces and metrics in DB

## 7. Build Instructions (Step-by-Step)

### Step 1: Repo and Project Layout

Create a mono-repo with:
- `/frontend` – React app
- `/backend` – FastAPI + LangChain/LangGraph
- `/infrastructure` – Dockerfiles, docker-compose, k8s manifests (if you add them), CI configs

### Step 2: Backend Skeleton

1. Initialize FastAPI
2. Define models/tables:
   - Conversations, Messages, AgentRuns, Workflows, KnowledgeCollections, KnowledgeChunks
3. Implement endpoints:
   - `POST /api/chat` – simple single-agent endpoint
   - `POST /api/agents/{agent_id}/chat` – for specific agent
   - `GET /api/conversations` and `GET /api/conversations/{id}`
   - `GET /api/agents`, `GET /api/agents/{id}`
   - `GET /api/workflows`, `GET /api/workflows/{id}/runs`
   - `GET /api/metrics/overview`
4. Implement LangGraph graphs:
   - Use LangGraph's state + nodes + edges pattern to create DocAgent, IncidentAgent, SlackAgent
5. Implement RAG:
   - Ingest a few markdown/PDF docs, chunk them, embed via Claude (or other provider), store in vector DB

### Step 3: n8n Workflows

1. Deploy n8n with Docker Compose alongside backend (local)
2. Create workflows:
   - Webhook → HTTP Request node to backend `/api/chat` → Respond to caller
   - (Optional) Slack trigger → HTTP Request to `/api/agents/incident/chat` → log incident via backend
3. Configure workflows to send metadata (workflow ID, run ID) that backend logs with each conversation/agent run

### Step 4: Frontend Implementation

1. Scaffold React + TS app; install MUI
2. Implement layout:
   - AppBar + Drawer (sidebar) + main content
3. Pages:
   - **Overview**: fetch `/api/metrics/overview` and `/api/conversations?limit=10`
   - **Conversations**: list and detail view
   - **Agents**: list + detail with recent runs
   - **Workflows**: list + runs
   - **Knowledge**: list collections + test query UI
   - **Settings**: simple form wired to local config endpoints
4. Chat UI:
   - Use a chat kit or build custom components
   - Input box + messages list; show status and agent steps

### Step 5: Metrics & Observability

1. Add middleware in FastAPI to record:
   - Request start/end time, path, status
   - Tokens used and provider cost estimation per request
2. Store metrics in DB and expose via `/api/metrics/*`
3. Frontend: charts on Overview and Agent detail pages

### Step 6: Docker, CI, Deployment

1. Dockerfiles:
   - `backend/Dockerfile` – Python, install dependencies, run uvicorn
   - `frontend/Dockerfile` – build React, serve via nginx or a simple Node static server
2. Docker Compose for local development:
   - Services: backend, frontend, db, n8n, vector DB (if separate)
3. GitHub Actions:
   - On push: run backend tests, build Docker images
4. Deployment:
   - Create a Render (or similar) service for backend Docker image and a static site for frontend build

## 8. Acceptance Criteria

User can:
- [ ] Open dashboard at a public URL
- [ ] Start a chat, get an answer, and see agent steps
- [ ] Browse past conversations and see metadata (latency, tokens, workflow ID)
- [ ] View agents list and open an agent to see recent runs
- [ ] View at least one n8n workflow and its executions in the UI
- [ ] View basic metrics charts (requests, errors, latency)

---

**Next Steps:** Turn this PRD into a set of GitHub issues to track progress and keep scope tight.
