import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.domain import SoilProfile

client=TestClient(app)
def test_soil_source_types() -> None: assert SoilProfile(source_type="farmer_provided").source_type == "farmer_provided"
def test_invalid_soil_source() -> None:
    with pytest.raises(Exception): SoilProfile(source_type="bad")
def test_crop_endpoints() -> None:
    assert len(client.get("/api/v1/crops").json()) == 4
    assert client.get("/api/v1/crops/wheat").json()["sources"]
    assert client.get("/api/v1/crops/nope").status_code == 404
