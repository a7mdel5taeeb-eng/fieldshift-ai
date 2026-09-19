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


def test_suitability_endpoint_returns_qualitative_factors() -> None:
    response = client.post("/api/v1/suitability/evaluate", json={"crop_id": "wheat", "soil": {"pH": 6.5}})

    assert response.status_code == 200
    assert response.json()["overall_assessment"] == "no_documented_limitation"
    assert "score" not in response.json()


def test_scenario_endpoints() -> None:
    generated = client.post("/api/v1/scenarios/generate", json={"candidate_crop_ids": ["wheat", "chickpea"], "planning_horizon": 3})
    assert generated.status_code == 200 and len(generated.json()) == 8
    evaluated = client.post("/api/v1/scenarios/evaluate", json={"scenario": generated.json()[0]})
    assert evaluated.status_code == 200 and "score" not in evaluated.json()


def test_preference_capture_endpoint() -> None:
    response = client.post("/api/v1/preferences/capture", json={"priorities": {"water_conservation": 3, "soil_health": 1}})
    assert response.status_code == 200 and response.json()["normalized_priorities"]["water_conservation"] == 0.75
