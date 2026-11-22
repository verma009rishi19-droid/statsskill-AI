# StatSkill AI

**AI-Powered Skill Intelligence and Personalized Learning Platform for India's Official Statistical System**

Built for MoSPI / NSSTA capacity building — competency assessments, skill-gap analysis, personalized learning paths, AI quiz generation, and virtual statistical labs.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Live%20Deployment-black?style=for-the-badge&logo=vercel)](https://rapid-harp-u5u9w8m.tmp.now)
[![GitHub Repository](https://img.shields.io/badge/GitHub-Repository-blue?style=for-the-badge&logo=github)](https://github.com/verma009rishi19-droid/statsskill-AI)
[![Mobile Ready](https://img.shields.io/badge/Mobile-Android%20%7C%20iOS%20%7C%20PWA-teal?style=for-the-badge)](https://rapid-harp-u5u9w8m.tmp.now)

---

## 🌐 Live Application Deployment
- **Live Vercel Web App**: [https://rapid-harp-u5u9w8m.tmp.now](https://rapid-harp-u5u9w8m.tmp.now)
- **Claim & Connect to Vercel Account**: [Claim Deployment Link](https://vercel.com/claim-deployment?code=506257cc-e614-4124-a161-5283f64c4e74)

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+

### 1. Database
```bash
python scripts/manage_postgres.py start
```

### 2. Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

### Demo Accounts
| Role | Email | Password |
|------|-------|----------|
| Learner | learner@mospi.gov.in | Learner@2026 |
| Trainer | trainer@nssta.gov.in | Trainer@2026 |
| Manager | manager@mospi.gov.in | Manager@2026 |
| Admin | admin@statskill.gov.in | Admin@2026 |

---

## Architecture

```
statskill-ai/
├── frontend/          # React + TypeScript + Vite + Tailwind
│   └── src/
│       ├── pages/     # 15 page components
│       ├── components/# Navbar, Sidebar
│       ├── features/  # Auth context
│       ├── services/  # Axios API client
│       └── types/     # TypeScript interfaces
├── backend/           # Python + FastAPI + SQLAlchemy
│   └── app/
│       ├── api/       # 16 route modules
│       ├── models/    # 8 SQLAlchemy model files
│       ├── schemas/   # Pydantic schemas
│       ├── services/  # Business logic + AI provider
│       └── core/      # Config, security, seed data
├── scripts/           # PostgreSQL management
└── docs/              # Documentation
```

## Features

1. **Overview Dashboard** — KPI cards, radar charts, bar charts, priority recommendations
2. **Competency Profile** — Qualifications, training records, assessed competencies
3. **Diagnostic Assessment** — Timed MCQ engine with competency scoring
4. **Skill Gap Analysis** — Gap calculation with priority scoring formula
5. **Personalized Learning Paths** — Module stepper with progress tracking
6. **Course Catalogue** — Filterable iGOT/NSSTA course cards
7. **NSSTA Programmes** — TPAC-approved training with batch schedules
8. **AI Learning Assistant** — Contextual chat on statistical topics
9. **AI Quiz Studio** — Upload documents, generate MCQs, take quizzes
10. **Virtual Labs** — SQL sandbox, CPI calculator, Python data validator
11. **My Learning** — Progress summary across all learning activities
12. **Assessment History** — Complete attempt records
13. **Analytics & Reports** — Department analytics + predictive workforce
14. **Settings** — Profile management with qualifications editor
15. **Administration** — User management, integrations, audit logs

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide |
| Backend | Python, FastAPI, SQLAlchemy, Pydantic, Alembic |
| Database | PostgreSQL 18 |
| AI | Gemini API (with local fallback) |
| Documents | PyMuPDF, python-docx, python-pptx |

## Tests

```bash
cd backend && python -m pytest tests/ -v
```

---

*Ministry of Statistics & Programme Implementation • National Statistical Systems Training Academy*
