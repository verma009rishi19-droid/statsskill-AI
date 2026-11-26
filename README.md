# StatSkill AI

**AI-Powered Skill Intelligence & Adaptive Capacity Building Platform for India's Official Statistical System (MoSPI · NSSTA · ISS · SSS)**

[![Live Application](https://img.shields.io/badge/Live%20App-Vercel-000000?style=for-the-badge&logo=vercel)](https://statsskill-ai.vercel.app/login)
[![Live API Docs](https://img.shields.io/badge/API%20Docs-Render%20Swagger-46E3B7?style=for-the-badge&logo=render)](https://statsskill-ai-1.onrender.com/docs)
[![API Health](https://img.shields.io/badge/API%20Status-Healthy-22c55e?style=for-the-badge&logo=fastapi)](https://statsskill-ai-1.onrender.com/health)
[![Mobile Ready](https://img.shields.io/badge/Mobile-Android%20%7C%20iOS%20%7C%20PWA-3880FF?style=for-the-badge&logo=capacitor)](frontend/android)

---

## 🌐 Live Production Deployment

| Service | Platform | URL |
|---|---|---|
| **Web Application (Frontend)** | Vercel | [https://statsskill-ai.vercel.app/login](https://statsskill-ai.vercel.app/login) |
| **REST API & Swagger Docs** | Render | [https://statsskill-ai-1.onrender.com/docs](https://statsskill-ai-1.onrender.com/docs) |
| **Health Check Endpoint** | Render | [https://statsskill-ai-1.onrender.com/health](https://statsskill-ai-1.onrender.com/health) |

> **Note**: The backend is hosted on Render's free tier and may take ~30–50 seconds to cold-start on the first request after 15 minutes of inactivity.

---

## 👥 Role-Based Access Control (RBAC) & Demo Accounts

StatSkill AI enforces JWT-authenticated, role-based access control on both the FastAPI backend and React frontend. Each role receives a dedicated dashboard, navigation, and permission boundary:

| Role | Officer Name | Email | Password | Core Capabilities |
|---|---|---|---|---|
| **Admin** | Vikram Patel | `admin@statskill.gov.in` | `Admin@2026` | User & role governance, audit logs, system settings, iGOT Karmayogi sync |
| **Manager** | Anita Desai | `manager@mospi.gov.in` | `Manager@2026` | Division skill-gap heatmap, training approvals, learning path assignments, CSV exports |
| **Learner** | Priya Sharma | `learner@mospi.gov.in` | `Learner@2026` | Competency profile, skill-gap diagnostics, adaptive learning roadmap, AI assistant |
| **Trainer** | Dr. Rajesh Kumar | `trainer@nssta.gov.in` | `Trainer@2026` | Course & curriculum authoring, NSSTA programme cohorts, AI Quiz Studio |
| **Analyst** | Kavita Nair | `analyst@mospi.gov.in` | `Analyst@2026` | Read-only macro analytics, cadre readiness trends, filtered report downloads |

---

## ✨ Platform Capabilities

- **Core Competency Intelligence**: Standardized statistical competency frameworks mapped to MoSPI / ISS / SSS roles with diagnostic proficiency assessments and automated gap scoring.
- **Adaptive Learning & Catalogues**: Personalized learning paths integrating **NSSTA** programmes and **iGOT Karmayogi** course catalogues with progress tracking.
- **AI Learning Assistant**: Grounded statistical assistant referencing official survey manuals, sampling theory, CPI/GDP methodologies, and Data Quality Assurance Frameworks (DQAF).
- **AI Quiz Studio**: Document-to-assessment pipeline (PDF, DOCX, PPTX, TXT) generating instant multiple-choice evaluations.
- **Interactive Virtual Lab**: Browser-accessible sandbox for practical statistical computing and data validation exercises.
- **Analytics & Governance**: Real-time readiness metrics, division-level heatmaps, and exportable reports.
- **Resilient Architecture**: Includes an automatic offline fallback engine so the UI remains responsive even during backend cold starts or disconnected sessions.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons, React Router v6 |
| **Backend** | Python 3.11, FastAPI, SQLAlchemy 2, Pydantic v2, PyJWT, Bcrypt, Uvicorn |
| **AI & Document Processing** | Google GenAI (`google-genai`), PyMuPDF, `python-docx`, `python-pptx`, Pandas, scikit-learn |
| **Database** | PostgreSQL (production-ready) / SQLite (zero-config default) |
| **Mobile & PWA** | Capacitor (Android & iOS), Web App Manifest |

---

## 📁 Repository Structure

```text
statsskill-ai/
├── frontend/               # React 18 + TypeScript + Vite SPA (deployed on Vercel)
│   ├── android/            # Native Android Capacitor project
│   ├── ios/                # Native iOS Xcode project
│   ├── src/
│   │   ├── app/            # Root router, RBAC route guards, app shell
│   │   ├── components/     # Reusable UI primitives and charts
│   │   ├── features/       # Auth & state contexts
│   │   ├── layouts/        # Role-specific sidebar and responsive layouts
│   │   ├── pages/          # 15 core platform modules & role dashboards
│   │   ├── services/       # Axios API client & offline fallback engine
│   │   └── types/          # Strict TypeScript interfaces
│   └── vercel.json         # SPA rewrite rules
│
├── backend/                # FastAPI REST API (deployed on Render)
│   ├── app/
│   │   ├── api/            # Modular route handlers (auth, profiles, courses, quizzes, etc.)
│   │   ├── core/           # Config, database session, JWT security, seed data
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic v2 validation schemas
│   │   └── services/       # Business logic, AI provider, document parser, lab engine
│   ├── tests/              # Pytest integration & RBAC test suite
│   └── requirements.txt    # Backend Python dependencies
│
├── scripts/                # Local PostgreSQL & utility scripts
├── render.yaml             # Render Infrastructure-as-Code Blueprint
├── vercel.json             # Root Vercel SPA configuration
└── docker-compose.yml      # Local container orchestration
```

---

## 💻 Local Development Setup

### 1. Backend (FastAPI)
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS / Linux
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API & Swagger UI: `http://127.0.0.1:8000/docs`

### 2. Frontend (Vite + React)
```bash
cd frontend
npm install
npm run dev
```
Web Application: `http://localhost:5173`

---

## ☁️ Cloud Deployment Architecture

### Frontend on Vercel
- **Root Directory**: `frontend` (or `./` via root [`vercel.json`](vercel.json))
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variable**:
  - `VITE_API_URL` = `https://statsskill-ai-1.onrender.com`

### Backend on Render
- Pre-configured via [`render.yaml`](render.yaml), [`build.sh`](build.sh), [`start.sh`](start.sh), and [`.python-version`](.python-version) (`3.11.9`).
- **Build Command**: `./build.sh` (or `pip install -r requirements.txt`)
- **Start Command**: `./start.sh` (or `uvicorn app.main:app --host 0.0.0.0 --port $PORT`)
- **Health Check Path**: `/health`

---

## 🧪 Testing & Quality Assurance

```bash
# Backend automated test suite (13 tests)
cd backend
pytest tests/ -v

# Frontend TypeScript check & production build
cd frontend
npm run lint
npm run build
```

---

## 📱 Mobile Builds (Capacitor)

```bash
cd frontend
npm run build
npx cap sync
npx cap open android   # Android Studio
npx cap open ios       # Xcode (macOS)
```

---

## 📄 License

Maintained for official statistical capacity building, training, and research aligned with India's Official Statistical System.
