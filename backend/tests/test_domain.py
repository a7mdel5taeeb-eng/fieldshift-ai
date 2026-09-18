from datetime import datetime, timezone

import pytest
from pydantic import ValidationError

from app.schemas.domain import (
    CropProfile,
    Location,
    ProvenanceRecord,
    RotationScenario,
    ScientificScenarioProfile,
    SoilMoistureObservation,
    SoilProfile,
)


def provenance() -> ProvenanceRecord:
    return ProvenanceRecord(source_name="Test source", source_type="USER_INPUT")


def test_location_validates_and_serializes() -> None:
    location = Location(latitude=24.0, longitude=47.0, country="Saudi Arabia")
    assert Location.model_validate(location.model_dump()) == location


@pytest.mark.parametrize(("field", "value"), [("latitude", 91), ("longitude", -181)])
def test_location_rejects_out_of_range_coordinates(field: str, value: float) -> None:
    payload = {"latitude": 24.0, "longitude": 47.0, field: value}
    with pytest.raises(ValidationError):
        Location.model_validate(payload)


def test_soil_profile_allows_missing_scientific_fields() -> None:
    assert SoilProfile().model_dump()["pH"] is None


def test_provenance_is_preserved() -> None:
    record = provenance()
    assert SoilProfile(provenance=[record]).provenance[0] == record


def test_soil_moisture_layer_validation() -> None:
    observation = SoilMoistureObservation(
        source="test", dataset="test", layer="surface", timestamp=datetime.now(timezone.utc),
        latitude=0, longitude=0, provenance=provenance(),
    )
    assert observation.layer == "surface"
    with pytest.raises(ValidationError):
        SoilMoistureObservation.model_validate({**observation.model_dump(), "layer": "invalid"})


def test_crop_profile_has_empty_requirement_containers() -> None:
    crop = CropProfile(id="candidate", common_name="Candidate")
    assert crop.climate_requirements == {} and crop.soil_requirements == {}


def test_rotation_scenario_serializes() -> None:
    scenario = RotationScenario(id="s1", periods=["year_1"], crop_ids=["candidate"])
    assert RotationScenario.model_validate_json(scenario.model_dump_json()) == scenario


def test_scientific_profile_has_no_numeric_score() -> None:
    profile = ScientificScenarioProfile(unknowns=["Missing evidence"])
    assert "score" not in profile.model_dump()
