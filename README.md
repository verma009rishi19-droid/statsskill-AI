# StatSkill AI

An AI-powered skill intelligence and adaptive competency development platform tailored for capacity building in India's Official Statistical System (MoSPI / NSSTA).

[![Repository](https://img.shields.io/badge/GitHub-Repository-181717?style=flat&logo=github)](https://github.com/verma009rishi19-droid/statsskill-AI)
[![Frontend](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript%20%7C%20Vite-61DAFB?style=flat&logo=react)](frontend/)
[![Backend](https://img.shields.io/badge/Backend-FastAPI%20%7C%20Python-009688?style=flat&logo=fastapi)](backend/)
[![Mobile](https://img.shields.io/badge/Mobile-Android%20%7C%20iOS%20%7C%20Capacitor-3880FF?style=flat&logo=capacitor)](frontend/android)

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
