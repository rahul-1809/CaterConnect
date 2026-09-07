# CaterConnect

> An interactive catering planning, quotation, and booking platform for a local catering business — enhanced with an AI and multilingual voice assistant.

## Repository Structure

```
CaterConnect/
├── backend/                  # FastAPI + Python backend
│   ├── app/
│   │   ├── api/              # HTTP route handlers
│   │   ├── core/             # Config, DB, logging, security
│   │   ├── domain/           # Business rules (per domain)
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── services/         # Application service layer
│   │   ├── repositories/     # Data access layer
│   │   ├── pricing/          # Deterministic pricing engine
│   │   ├── ai/               # AI orchestration
│   │   └── integrations/     # OTP, payments, notifications, AI providers
│   ├── alembic/              # Database migrations
│   └── tests/                # pytest test suite
│
├── frontend/
│   ├── customer/             # Customer-facing Next.js app (port 3000)
│   └── admin/                # Caterer admin Next.js app (port 3001)
│
├── docker/                   # Docker support files
├── docker-compose.yml        # Local development environment
└── docs/                     # Design documents (planning.md etc.)
```

## Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for frontend development without Docker)
- Python 3.11+ (for backend development without Docker)

### With Docker (Recommended)

```bash
# Start all services
docker compose up

# Services:
# Backend API:        http://localhost:8000
# API Docs:           http://localhost:8000/docs
# Customer App:       http://localhost:3000
# Admin App:          http://localhost:3001
# PostgreSQL:         localhost:5432
# Redis:              localhost:6379
```

### Backend only (without Docker)

```bash
cd backend

# Install dependencies
pip install -e ".[dev]"

# Copy and configure environment
cp .env.example .env

# Run migrations (requires PostgreSQL running)
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend (Customer)

```bash
cd frontend/customer
npm install
npm run dev          # http://localhost:3000
```

### Frontend (Admin)

```bash
cd frontend/admin
npm install
npm run dev          # http://localhost:3001
```

## Running Tests

```bash
# Backend unit tests (no DB needed)
cd backend
pytest tests/ -m "not asyncio" -v

# Backend integration tests (requires PostgreSQL)
pytest tests/ -v

# Frontend tests
cd frontend/customer
npm test
```

## Implementation Phases

| Phase | Name | Status |
|---|---|---|
| 0 | Requirements & Product Foundation | ✅ Complete |
| 1 | Project Foundation | ✅ Complete |
| 2 | Authentication | 🔄 Next |
| 3–15 | ... | ⏳ Pending |

## Tech Stack

- **Backend**: Python 3.11, FastAPI, SQLAlchemy 2.x, Alembic, PostgreSQL, Redis
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Testing**: pytest, Playwright, Vitest
- **Infrastructure**: Docker, docker-compose
