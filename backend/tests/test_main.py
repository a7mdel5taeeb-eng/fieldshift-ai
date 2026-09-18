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
