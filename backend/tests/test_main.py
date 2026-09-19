from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_success() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_meta_returns_project_metadata() -> None:
    response = client.get("/api/v1/meta")

    assert response.status_code == 200
    assert response.json() == {
        "project_name": "FieldShift AI",
        "version": "0.1.0",
        "challenge_name": "Field Shift: Adapting Farms with NASA Data",
    }


def test_soil_moisture_context_fails_without_credentials() -> None:
    response = client.post("/api/v1/soil-moisture/context", json={"latitude": 24.7, "longitude": 47.3, "start_date": "2025-01-01", "end_date": "2025-01-02"})

    assert response.status_code == 200
    assert response.json()["errors"] == ["SMAP_AUTH_CONFIG_REQUIRED"]
