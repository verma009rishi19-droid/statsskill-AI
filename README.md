# StatSkill AI

An AI-powered skill intelligence and adaptive competency development platform tailored for capacity building in India's Official Statistical System (MoSPI / NSSTA).

[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github)](https://github.com/verma009rishi19-droid/statsskill-AI)
[![Local Development](https://img.shields.io/badge/Local%20App-http%3A%2F%2Flocalhost%3A5173-success?style=for-the-badge&logo=vite)](http://localhost:5173)
[![Mobile Ready](https://img.shields.io/badge/Mobile-Android%20%7C%20iOS%20%7C%20PWA-3880FF?style=for-the-badge&logo=capacitor)](frontend/android)

---

## 💻 Local Testing & Access
- **Web Application**: [http://localhost:5173](http://localhost:5173) (or [http://127.0.0.1:5173](http://127.0.0.1:5173))
- **FastAPI Backend & Interactive API Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Supported Platforms**: Desktop Browser, Mobile (PWA/Capacitor on Android & iOS)

---

## 👥 Seeded Demo Accounts (Role-Based Access Control)

Each role is equipped with an independent, specialized dashboard and verified permissions:

| Role | Name | Official Email | Password | Primary Capabilities |
|---|---|---|---|---|
| **Admin** | Vikram Patel | `admin@statskill.gov.in` | `Admin@2026` | Multi-role user governance, audit trail logs, system integrations, iGOT sync |
| **Manager** | Anita Desai | `manager@mospi.gov.in` | `Manager@2026` | Division readiness heatmap, training nomination approvals, officer assignments, CSV exports |
| **Learner** | Priya Sharma | `learner@mospi.gov.in` | `Learner@2026` | Diagnostic assessments, competency gap radar, adaptive learning roadmap, AI assistant |
| **Trainer** | Dr. Rajesh Kumar | `trainer@nssta.gov.in` | `Trainer@2026` | Course & curriculum authoring, NSSTA batch management, AI quiz studio generator |
| **Analyst** | Kavita Nair | `analyst@mospi.gov.in` | `Analyst@2026` | Read-only statistical governance reports, predictive workforce forecasts, macro analytics |

---

## Key Highlights

- **Competency Intelligence**: Standardized competency frameworks mapped across national statistical roles (SSS/ISS cadres).
- **Skill Gap Diagnostics**: Diagnostic assessments with instant analytics, scorecards, and development recommendations.
- **AI-Powered Learning Assistance**: Grounded queries citing official statistical manuals, sampling methodologies, and survey standards.
- **Instant Quiz Engine**: Direct document-to-assessment pipeline generating multiple-choice evaluations with immediate review.
- **Cross-Platform Native Shells**: Full mobile responsiveness plus configured Capacitor native projects for Android and iOS.

---

## Repository Structure

```text
statsskill-ai/
├── frontend/             # React 18 + TypeScript + Vite + Tailwind CSS
│   ├── android/          # Native Android Capacitor workspace
│   ├── ios/              # Native iOS Xcode workspace
│   ├── src/              # Application source code
│   │   ├── app/          # Root application and route configuration
│   │   ├── components/   # Reusable UI components and navigation
│   │   ├── features/     # State management and context providers
│   │   ├── layouts/      # Responsive multi-device layouts
│   │   ├── pages/        # Core platform modules and dashboards
│   │   ├── services/     # Typed API clients
│   │   └── types/        # TypeScript data definitions
│   └── public/           # Static assets, Web App Manifest, Service Worker
│
├── backend/              # FastAPI application server
│   ├── app/
│   │   ├── api/          # Modular API endpoints
│   │   ├── core/         # Settings, database session, authentication
│   │   ├── models/       # Relational database models
│   │   ├── schemas/      # Pydantic data validation schemas
│   │   └── services/     # Business logic, AI integration, and assessment engine
│   ├── requirements.txt  # Python package specifications
│   └── tests/            # Automated test suite
│
├── scripts/              # Database initialization and management utilities
└── docker-compose.yml    # Container orchestration specification
```

---

## Local Development Setup

### 1. Backend Service
```bash
cd backend
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux / macOS:
# source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The REST API documentation will be accessible at: `http://127.0.0.1:8000/docs`

### 2. Frontend Web Application
```bash
cd frontend
npm install
npm run dev
```

The web application will be accessible at: `http://localhost:5173`

---

## ⚡ Deployment on Vercel

The application is fully prepared for Vercel deployment supporting **both** the frontend Single Page Application (SPA) and the Python FastAPI Serverless Backend:

### Option 1: Full-Stack on Vercel (Frontend + Serverless API)
Deploy the entire application under a single Vercel project:
1. Log in to [Vercel](https://vercel.com/) and click **Add New...** > **Project**.
2. Select and import your GitHub repository: `https://github.com/verma009rishi19-droid/statsskill-AI.git`.
3. Keep the **Root Directory** as `./` (default).
4. Vercel will automatically detect [`vercel.json`](vercel.json):
   - **Frontend**: Built via `cd frontend && npm install && npm run build` and served from `frontend/dist`.
   - **Backend API**: Hosted as Python Serverless Functions via [`api/index.py`](api/index.py) routing `/api/*`, `/docs`, `/openapi.json`, and `/health`.
5. *(Optional)* Set environment variables in Vercel:
   - `SECRET_KEY`: Random 32+ character string
   - `DATABASE_URL`: Connection string for PostgreSQL (e.g. Neon, Supabase) or omit to use `/tmp/statskill_ai.db` SQLite.
6. Click **Deploy**.

### Option 2: Frontend-Only on Vercel (Connected to Render Backend)
1. Import repository on Vercel.
2. Set **Root Directory** to `frontend`.
3. Add Environment Variable:
   - `VITE_API_URL`: Your backend URL (e.g. `https://statskill-ai-backend.onrender.com`).
4. Click **Deploy**.

---

## 🚀 Cloud Deployment on Render

This repository includes a pre-configured [`render.yaml`](render.yaml) Blueprint that provisions and connects both the **FastAPI Backend Web Service** and the **React Static Site**:

### Method A: One-Click Render Blueprint (Recommended)
1. Log in to your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** > **Blueprint**.
3. Connect your GitHub repository: `https://github.com/verma009rishi19-droid/statsskill-AI.git`.
4. Render automatically parses `render.yaml` and sets up:
   - **`statskill-ai-backend`**: Python FastAPI Web Service (`uvicorn app.main:app`)
   - **`statskill-ai-frontend`**: React Static Site with SPA rewrites
5. Click **Apply**. Both services will build and deploy with linked environment variables.

### Method B: Manual Service Creation on Render
- **Backend (Web Service)**:
  - **Root Directory**: `backend`
  - **Environment**: `Python 3`
  - **Build Command**: `pip install -r requirements.txt`
  - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
  - **Health Check Path**: `/health`
- **Frontend (Static Site)**:
  - **Root Directory**: `frontend`
  - **Build Command**: `npm install && npm run build`
  - **Publish Directory**: `dist`
  - **Rewrites Rule**: `/*` → `/index.html`
  - **Environment Variable**: `VITE_API_URL` set to your backend Render URL (e.g. `https://statskill-ai-backend.onrender.com`)

---

## Mobile Deployment (Android & iOS)

The mobile client is built using Capacitor:

```bash
cd frontend

# Build production web bundle
npm run build

# Synchronize assets with native projects
npx cap sync

# Open Android Studio
npx cap open android

# Open Xcode (macOS only)
npx cap open ios
```

---

## Testing & Quality Assurance

Run the automated backend test suite:
```bash
cd backend
pytest tests/ -v
```

Run frontend static type validation:
```bash
cd frontend
npm run build
```

---

## License

This repository is maintained for educational and training purposes aligned with official statistical system capacity development.
