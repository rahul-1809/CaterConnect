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
└── docs/                     # Design documents
```

---

## Quick Start

### 1. Set up Supabase (Database)

1. Create a free project at **[supabase.com](https://supabase.com)**
2. Go to **Settings → Database → Connection string → URI tab**
3. Copy the connection string — it looks like:
   ```
   postgresql://postgres.[project-ref]:[password]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```

### 2. Configure the backend

```bash
cd backend

# Copy the env template
cp .env.example .env

# Edit .env and fill in:
# - DATABASE_URL  → your Supabase connection string (replace postgresql:// with postgresql+asyncpg://)
# - SUPABASE_URL  → https://[project-ref].supabase.co
# - SUPABASE_ANON_KEY → from Supabase → Settings → API
# - SECRET_KEY    → any long random string
```

> **Important:** Change `postgresql://` to `postgresql+asyncpg://` in the connection string.

### 3. Run with Docker (Recommended)

```bash
# From the project root
docker compose up

# Services:
# Backend API:   http://localhost:8000
# API Docs:      http://localhost:8000/docs   ← Interactive API explorer
# Customer App:  http://localhost:3000
# Admin App:     http://localhost:3001
# Redis:         localhost:6379
```

### 4. Run without Docker (Faster dev)

**Backend:**
```bash
cd backend
pip install -e ".[dev]"
cp .env.example .env    # fill in your Supabase URL
uvicorn app.main:app --reload --port 8000
```

**Customer frontend:**
```bash
cd frontend/customer
npm install
npm run dev    # http://localhost:3000
```

**Admin frontend:**
```bash
cd frontend/admin
npm install
npm run dev -- -p 3001    # http://localhost:3001
```

**Redis only (for rate limiting):**
```bash
docker compose up redis
```

### 5. Run database migrations

```bash
cd backend
alembic upgrade head
```

---

## What you should see right now

| URL | What you see |
|---|---|
| `http://localhost:8000/api/v1/health` | `{"status":"ok","app":"CaterConnect",...}` |
| `http://localhost:8000/docs` | Interactive Swagger API docs |
| `http://localhost:3000` | Default Next.js page (UI built in Phase 4) |
| `http://localhost:3001` | Default Next.js page (Admin UI in Phase 3) |

> The customer and admin UIs will be fully built as part of the implementation phases. Right now they show the default Next.js welcome page.

---

## Running Tests

```bash
cd backend

# Unit tests (no database needed)
pytest tests/test_phase1_foundation.py -v

# All tests (requires Supabase DATABASE_URL in .env)
pytest tests/ -v
```

---

## Implementation Phases

| Phase | Name | Status |
|---|---|---|
| 0 | Requirements & Product Foundation | ✅ Complete |
| 1 | Project Foundation | ✅ Complete |
| 2 | Authentication | 🔄 Next |
| 3 | Caterer Catalog Management | ⏳ Pending |
| 4 | Customer Browsing Experience | ⏳ Pending |
| 5 | Event Planner & Menu Builder | ⏳ Pending |
| 6 | Pricing & Estimate Engine | ⏳ Pending |
| 7 | Budget Recommendation | ⏳ Pending |
| 8 | Quotation Request Workflow | ⏳ Pending |
| 9 | Final Quotation | ⏳ Pending |
| 10 | Booking & Payments | ⏳ Pending |
| 11 | Dashboards | ⏳ Pending |
| 12–15 | AI, Multilingual, Voice | ⏳ Pending |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, FastAPI, SQLAlchemy 2.x, Alembic |
| Database | **Supabase** (PostgreSQL) |
| Cache | Redis |
| Customer Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Admin Frontend | Next.js 15, TypeScript, Tailwind CSS |
| Testing | pytest, Playwright, Vitest |
| Infrastructure | Docker, docker-compose, GitHub Actions |
| Deployment | Supabase (DB), Railway/Render (backend), Vercel (frontend) |
