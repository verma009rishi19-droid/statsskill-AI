import urllib.request
import urllib.error
import re
import json
import time

LIVE_BASE = "https://fast-bromine-xflff8t.tmp.now"
LOCAL_BACKEND = "http://127.0.0.1:8000"

def audit_live():
    print("=== AUDIT 1: LIVE SITE ASSETS & ROOT ===")
    try:
        t0 = time.time()
        res = urllib.request.urlopen(LIVE_BASE)
        duration = round((time.time() - t0) * 1000, 2)
        html = res.read().decode("utf-8")
        print(f"Status: {res.status} ({duration}ms), HTML Length: {len(html)}")
        
        # Check meta tags
        has_title = "<title>" in html
        has_desc = 'name="description"' in html
        has_og = 'property="og:' in html
        has_viewport = 'name="viewport"' in html
        print(f"Meta check - Title: {has_title}, Desc: {has_desc}, OG: {has_og}, Viewport: {has_viewport}")
        
        # Check assets
        assets = re.findall(r'(?:src|href)="(/assets/[^"]+)"', html)
        for a in assets:
            t_a = time.time()
            a_res = urllib.request.urlopen(LIVE_BASE + a)
            a_dur = round((time.time() - t_a) * 1000, 2)
            content = a_res.read()
            print(f"Asset: {a} -> Status: {a_res.status} ({a_dur}ms, {len(content)} bytes)")
    except Exception as e:
        print("Live root error:", e)

    print("\n=== AUDIT 2: DEEP LINK REFRESH (SPA ROUTING) ===")
    routes = [
        "/",
        "/login",
        "/profile",
        "/assessments",
        "/skill-gaps",
        "/learning-paths",
        "/courses",
        "/nssta",
        "/assistant",
        "/quiz-studio",
        "/virtual-lab",
        "/my-learning",
        "/assessment-history",
        "/analytics",
        "/settings",
        "/admin"
    ]
    for r in routes:
        url = LIVE_BASE + r
        try:
            res = urllib.request.urlopen(url)
            print(f"Route {r:20} -> {res.status} OK")
        except urllib.error.HTTPError as e:
            print(f"Route {r:20} -> {e.code} {e.reason} (SPA 404 BUG!)")
        except Exception as e:
            print(f"Route {r:20} -> Error: {e}")

    print("\n=== AUDIT 3: LOCAL BACKEND API ENDPOINTS ===")
    endpoints = [
        ("GET", "/health", None, False),
        ("GET", "/docs", None, False),
        ("GET", "/openapi.json", None, False),
        ("POST", "/api/v1/auth/login", {"email": "learner@mospi.gov.in", "password": "Learner@2026"}, False),
        ("POST", "/api/v1/auth/login", {"email": "wrong@mospi.gov.in", "password": "wrong"}, False),
        ("GET", "/api/v1/profiles/me", None, True),
        ("GET", "/api/v1/competencies/domains", None, False),
        ("GET", "/api/v1/competencies/results/me", None, True),
        ("GET", "/api/v1/skill-gaps/my-analysis", None, True),
        ("GET", "/api/v1/learning-paths/my-path", None, True),
        ("GET", "/api/v1/courses", None, False),
        ("GET", "/api/v1/nssta/programmes", None, False),
        ("GET", "/api/v1/assessments", None, True),
        ("GET", "/api/v1/analytics/department", None, True),
        ("GET", "/api/v1/admin/users", None, True),
    ]

    # Get tokens for learner and admin
    def get_token(email, pwd):
        req = urllib.request.Request(
            f"{LOCAL_BACKEND}/api/v1/auth/login",
            data=json.dumps({"email": email, "password": pwd}).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST"
        )
        try:
            r = urllib.request.urlopen(req)
            data = json.loads(r.read().decode("utf-8"))
            return data["access_token"]
        except Exception as e:
            return None

    learner_token = get_token("learner@mospi.gov.in", "Learner@2026")
    admin_token = get_token("admin@statskill.gov.in", "Admin@2026")

    for method, path, body, requires_auth in endpoints:
        headers = {}
        data = None
        if body:
            headers["Content-Type"] = "application/json"
            data = json.dumps(body).encode("utf-8")
        if requires_auth:
            token = admin_token if "/admin" in path else learner_token
            if token:
                headers["Authorization"] = f"Bearer {token}"

        t0 = time.time()
        url = LOCAL_BACKEND + path
        try:
            req = urllib.request.Request(url, data=data, headers=headers, method=method)
            res = urllib.request.urlopen(req)
            dur = round((time.time() - t0) * 1000, 2)
            print(f"{method:4} {path:35} -> {res.status} ({dur}ms)")
        except urllib.error.HTTPError as e:
            dur = round((time.time() - t0) * 1000, 2)
            print(f"{method:4} {path:35} -> {e.code} {e.reason} ({dur}ms)")
        except Exception as e:
            print(f"{method:4} {path:35} -> Error: {e}")

if __name__ == "__main__":
    audit_live()
