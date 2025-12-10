# AI Command Center

An admin dashboard for monitoring and managing AI agents, workflows, and conversations. Built with FastAPI, React, LangGraph, and integrates with n8n for workflow automation.

## Features

- **Overview Dashboard**: KPI cards, charts, and activity feed
- **Conversations Explorer**: Browse and filter conversations with message history
- **Agents Management**: View agent stats, graph visualizations, and recent runs
- **Workflows**: Monitor n8n workflow executions
- **Knowledge Management**: Vector store collections and test query interface
- **Live Chat**: Test agents with real-time step visualization
- **Settings**: API key management and environment configuration

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│    Backend      │────▶│    n8n          │
│  React + MUI    │     │    FastAPI      │     │   Workflows     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │  SQLite + ChromaDB  │
                    │   (Data + Vectors)  │
                    └─────────────────────┘
```

## Tech Stack

**Backend:**
- FastAPI + Python 3.11
- LangGraph + LangChain for AI agents
- ChromaDB for vector storage
- SQLAlchemy + SQLite

**Frontend:**
- React 19 + TypeScript
- Material UI (MUI)
- React Query + React Router
- Recharts for visualizations

**Infrastructure:**
- Docker + Docker Compose
- n8n for workflow automation
- GitHub Actions CI/CD

## Local Development

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker (optional, for containerized setup)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # or .venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp ../.env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the server
uvicorn app.main:app --reload
```

Backend will be available at http://localhost:8000

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at http://localhost:5173

### Docker Setup (Full Stack)

```bash
cd infrastructure

# Start all services
docker-compose up -d

# Or with development volumes
docker-compose -f docker-compose.dev.yml up -d
```

Services:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- n8n: http://localhost:5678

## Deployment to Render

This project includes a `render.yaml` blueprint for easy deployment to [Render](https://render.com).

### One-Click Deploy

1. Push this repository to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click "New" → "Blueprint"
4. Connect your GitHub repository
5. Render will detect `render.yaml` and create the services

### Manual Setup

#### Backend (Web Service)

1. Create a new Web Service on Render
2. Connect your repository
3. Settings:
   - **Runtime**: Docker
   - **Dockerfile Path**: `./infrastructure/Dockerfile.backend`
   - **Docker Context**: `.`
   - **Health Check Path**: `/health`
4. Environment Variables:
   - `ANTHROPIC_API_KEY`: Your Anthropic API key (required)
   - `DATABASE_URL`: `sqlite:///./data/app.db`
   - `CORS_ORIGINS`: `["https://your-frontend-url.onrender.com"]`
   - `DEBUG`: `false`
5. Add a Disk:
   - **Mount Path**: `/app/data`
   - **Size**: 1 GB

#### Frontend (Static Site)

1. Create a new Static Site on Render
2. Connect your repository
3. Settings:
   - **Build Command**: `cd frontend && npm ci && npm run build`
   - **Publish Directory**: `frontend/dist`
4. Environment Variables:
   - `VITE_API_URL`: `https://your-backend-url.onrender.com/api/v1`
   - `NODE_VERSION`: `20`
5. Add Rewrite Rule:
   - **Source**: `/*`
   - **Destination**: `/index.html`

### Post-Deployment

1. Update CORS_ORIGINS on backend with your actual frontend URL
2. Test the health endpoint: `https://your-backend-url.onrender.com/health`
3. Access the dashboard at your frontend URL

## Environment Variables

### Backend

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | (required) |
| `DATABASE_URL` | SQLite database path | `sqlite:///./app.db` |
| `CORS_ORIGINS` | Allowed origins (JSON array) | `["http://localhost:5173"]` |
| `DEBUG` | Enable debug mode | `true` |
| `N8N_URL` | n8n instance URL | `http://localhost:5678` |

### Frontend

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:8000/api/v1` |
| `VITE_N8N_URL` | n8n URL (for external links) | `http://localhost:5678` |

## API Documentation

When running locally, access the interactive API docs at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
.
├── backend/
│   ├── app/
│   │   ├── api/v1/          # API routes
│   │   ├── agents/          # LangGraph agents
│   │   ├── core/            # Config, database
│   │   ├── middleware/      # Request metrics
│   │   ├── models/          # SQLAlchemy models
│   │   └── schemas/         # Pydantic schemas
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # API client
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   └── contexts/        # React contexts
│   └── package.json
├── infrastructure/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   ├── docker-compose.yml
│   └── nginx.conf
├── render.yaml              # Render deployment blueprint
└── README.md
```

## License

MIT
