import pytest
from fastapi.testclient import TestClient
import sys
import os

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app
from app.core.database import SessionLocal
from app.models import User, Competency, Assessment, Course, NSSTATrainingProgramme

@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c

def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "StatSkill AI" in data["system"]

def test_auth_login_learner(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "learner@mospi.gov.in",
        "password": "Learner@2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["role"] == "learner"
    assert data["full_name"] == "Ramesh Kumar"

def test_auth_login_admin(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "admin@statskill.gov.in",
        "password": "Admin@2026"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["role"] == "admin"

def test_auth_invalid_password(client):
    response = client.post("/api/v1/auth/login", json={
        "email": "learner@mospi.gov.in",
        "password": "WrongPassword123"
    })
    assert response.status_code == 401

def test_get_profile(client):
    # Login as learner
    login_res = client.post("/api/v1/auth/login", json={
        "email": "learner@mospi.gov.in",
        "password": "Learner@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/profiles/me", headers=headers)
    assert res.status_code == 200
    profile = res.json()
    assert profile["designation"] == "Senior Statistical Officer"
    assert "CPI" in profile["current_assignment"]

def test_competency_framework(client):
    res = client.get("/api/v1/competencies/domains")
    assert res.status_code == 200
    domains = res.json()
    assert len(domains) >= 4
    domain_codes = [d["code"] for d in domains]
    assert "statistical" in domain_codes
    assert "technical" in domain_codes
    assert "digital_governance" in domain_codes

def test_skill_gap_analysis(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "learner@mospi.gov.in",
        "password": "Learner@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/skill-gaps/my-analysis", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["job_role_title"] == "Senior Statistical Officer - Price Statistics"
    assert data["total_required_competencies"] > 0
    assert data["unassessed_count"] > 0  # Unassessed competencies exist
    assert any(g["status_label"] == "Assessment needed" for g in data["gaps"])

def test_personalized_recommendations(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "learner@mospi.gov.in",
        "password": "Learner@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    res = client.get("/api/v1/recommendations/my-recommendations", headers=headers)
    assert res.status_code == 200
    data = res.json()
    assert data["total_recommendations"] > 0
    # Must reference actual iGOT or NSSTA records
    for rec in data["recommendations"]:
        assert rec["provider"] in ["iGOT Karmayogi", "National Statistical Systems Training Academy (NSSTA)", "National Statistical Systems Training Academy (NSSTA), Greater Noida", "NSSTA"]
        assert len(rec["why_recommended"]) > 10

def test_course_catalogue(client):
    res = client.get("/api/v1/courses")
    assert res.status_code == 200
    courses = res.json()
    assert len(courses) >= 6

def test_nssta_programmes(client):
    res = client.get("/api/v1/nssta/programmes")
    assert res.status_code == 200
    progs = res.json()
    assert len(progs) >= 3
    assert all(p["tpac_approval_status"] == "verified_recommended" for p in progs)

def test_igot_adapter_status(client):
    res = client.get("/api/v1/igot/status")
    assert res.status_code == 200
    data = res.json()
    assert data["is_demo_mode"] is True
    assert len(data["official_access_requirements"]) > 0

def test_diagnostic_assessment_flow(client):
    login_res = client.post("/api/v1/auth/login", json={
        "email": "learner@mospi.gov.in",
        "password": "Learner@2026"
    })
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Fetch assessment detail
    assessments = client.get("/api/v1/assessments").json()
    assert len(assessments) > 0
    aid = assessments[0]["id"]

    detail = client.get(f"/api/v1/assessments/{aid}").json()
    assert len(detail["questions"]) > 0

    # Submit answers
    submission = {
        "assessment_id": aid,
        "responses": [
            {"question_id": q["id"], "selected_option_index": 1, "time_taken_seconds": 15}
            for q in detail["questions"]
        ]
    }
    submit_res = client.post("/api/v1/assessments/submit", json=submission, headers=headers)
    assert submit_res.status_code == 200
    result = submit_res.json()
    assert "score" in result
    assert "percentage" in result
    assert len(result["competency_breakdown"]) > 0
    assert len(result["question_reviews"]) > 0
