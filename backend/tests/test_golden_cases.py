"""Structured M12 regression checks for approved golden-case fixtures."""
import json
from pathlib import Path

from fastapi.testclient import TestClient

import app.main as main
from app.adapters.power import PowerAdapterError
from app.adapters.smap import SmapAdapterError
from app.repositories.crops import CropRepository
from app.schemas.domain import FarmerPriorities, RotationScenario, SoilProfile
from app.services.preferences import compare
from app.services.rotation import evaluate as evaluate_rotation
from app.services.rotation import generate
from app.services.suitability import evaluate as evaluate_suitability

CASES = {
    case["id"]: case
    for case in json.loads((Path(__file__).parent / "golden" / "cases.json").read_text())["cases"]
}
CLIENT = TestClient(main.app)


def power_failure(*_args: object, **_kwargs: object) -> list[object]:
    raise PowerAdapterError("GOLDEN_CASE_SOURCE_UNAVAILABLE")


def smap_failure(*_args: object, **_kwargs: object) -> list[object]:
    raise SmapAdapterError("GOLDEN_CASE_SOURCE_UNAVAILABLE")


def request_payload(case: dict[str, object]) -> dict[str, object]:
    location = case["location"]
    dates = case["date_range"]
    assert isinstance(location, dict) and isinstance(dates, dict)
    return {
        "latitude": location["latitude"],
        "longitude": location["longitude"],
        "start_date": dates["start"],
        "end_date": dates["end"],
    }


def factor_statuses(result: object) -> dict[str, str]:
    return {item.factor: item.status for item in result.factor_results}  # type: ignore[attr-defined]


def output_keys(value: object) -> set[str]:
    if isinstance(value, dict):
        return set(value).union(*(output_keys(item) for item in value.values()))
    if isinstance(value, list):
        return set().union(*(output_keys(item) for item in value)) if value else set()
    return set()


def test_golden_case_fixtures_validate_against_existing_domain_models() -> None:
    repository = CropRepository()
    for case in CASES.values():
        location = case["location"]
        assert isinstance(location, dict)
        assert -90 <= float(location["latitude"]) <= 90
        assert -180 <= float(location["longitude"]) <= 180
        if "crop_id" in case:
            assert repository.get(str(case["crop_id"]))
            assert SoilProfile.model_validate(case["soil_profile"])
        if "rotation" in case:
            assert RotationScenario.model_validate(case["rotation"])
            assert FarmerPriorities.model_validate(case["priorities"])


def test_gc001_demo_snapshot_preserves_nasa_provenance_and_factor_results(monkeypatch) -> None:
    case = CASES["GC-001-demo-snapshot-wheat"]
    expected = case["expected"]
    assert isinstance(expected, dict)
    monkeypatch.setenv("ENABLE_DEMO_SNAPSHOTS", "true")
    monkeypatch.setattr(main.power_adapter, "fetch", power_failure)
    monkeypatch.setattr(main.smap_adapter, "fetch", smap_failure)

    power = CLIENT.post("/api/v1/environment/context", json=request_payload(case)).json()
    smap = CLIENT.post("/api/v1/soil-moisture/context", json=request_payload(case)).json()
    suitability = evaluate_suitability(
        CropRepository().get(str(case["crop_id"])), SoilProfile.model_validate(case["soil_profile"])
    )

    assert power["source_status"] == expected["source_statuses"]["power"]
    assert smap["source_status"] == expected["source_statuses"]["smap"]
    assert [item["variable"] for item in power["data"]] == expected["power_variables"]
    assert [item["layer"] for item in smap["data"]] == expected["smap_layers"]
    assert power["data"][0]["provenance"]["source_name"] == expected["provenance"]["power_source"]
    assert smap["data"][0]["provenance"]["citation"] == f"DOI: {expected['provenance']['smap_doi']}"
    assert factor_statuses(suitability) == expected["factor_statuses"]
    assert suitability.limiting_factors == expected["limiting_factors"]
    assert suitability.unknown_factors == expected["unknown_factors"]
    assert suitability.overall_assessment == expected["overall_assessment"]
    assert suitability.provenance[0].source_name == expected["provenance"]["crop_source"]


def test_gc002_unavailable_sources_and_missing_evidence_remain_explicit(monkeypatch) -> None:
    case = CASES["GC-002-incomplete-evidence-chickpea"]
    expected = case["expected"]
    assert isinstance(expected, dict)
    monkeypatch.setenv("ENABLE_DEMO_SNAPSHOTS", "false")
    monkeypatch.setattr(main.power_adapter, "fetch", power_failure)
    monkeypatch.setattr(main.smap_adapter, "fetch", smap_failure)

    power = CLIENT.post("/api/v1/environment/context", json=request_payload(case)).json()
    smap = CLIENT.post("/api/v1/soil-moisture/context", json=request_payload(case)).json()
    suitability = evaluate_suitability(
        CropRepository().get(str(case["crop_id"])), SoilProfile.model_validate(case["soil_profile"])
    )

    assert power["source_status"] == expected["source_statuses"]["power"] and power["data"] == []
    assert smap["source_status"] == expected["source_statuses"]["smap"] and smap["data"] == []
    assert factor_statuses(suitability) == expected["factor_statuses"]
    assert suitability.limiting_factors == expected["limiting_factors"]
    assert suitability.unknown_factors == expected["unknown_factors"]
    assert suitability.overall_assessment == expected["overall_assessment"]
    assert all(status != "LIMITING" for status in factor_statuses(suitability).values())
    limitations = " ".join(item.limitation or "" for item in suitability.factor_results)
    assert all(token in limitations for token in expected["required_limitations"])


def test_gc003_rotation_and_preference_descriptors_have_no_ranking() -> None:
    case = CASES["GC-003-rotation-descriptors"]
    expected = case["expected"]
    assert isinstance(expected, dict)
    scenario = RotationScenario.model_validate(case["rotation"])
    assessment = evaluate_rotation(scenario, CropRepository().list())
    preference = compare(assessment, FarmerPriorities.model_validate(case["priorities"]))
    generated = generate([CropRepository().get("wheat"), CropRepository().get("chickpea")], 3)
    dumped = preference.model_dump()

    assert len(generated) == 8
    assert assessment.diversity_descriptors == expected["diversity_descriptors"]
    assert assessment.repeated_crop_flags == expected["repeated_crop_flags"]
    assert assessment.repeated_family_flags == expected["repeated_family_flags"]
    assert assessment.legume_presence is expected["legume_presence"]
    assert preference.foregrounded_dimensions == expected["preference_foregrounded_dimensions"]
    assert preference.unavailable_preference_dimensions == expected["preference_unavailable_dimensions"]
    assert preference.scientific_profile == assessment
    assert preference.evidence == assessment.evidence and preference.provenance == assessment.provenance
    assert all(key not in output_keys(dumped) for key in expected["prohibited_output_keys"])

