import pytest
from pydantic import ValidationError

from app.repositories.crops import CropRepository
from app.schemas.domain import FarmerPriorities, RotationScenario
from app.services.preferences import AVAILABLE, UNAVAILABLE, capture, compare
from app.services.rotation import evaluate


def test_preferences_normalize_transparently() -> None:
    result = capture(FarmerPriorities(water_conservation=2, soil_health=2))
    assert result.normalized_priorities["water_conservation"] == 0.5
    assert result.dimension_status == {
        "water_conservation": UNAVAILABLE,
        "soil_health": AVAILABLE,
        "resilience": AVAILABLE,
        "productivity": UNAVAILABLE,
    }


def test_negative_preference_is_rejected() -> None:
    with pytest.raises(ValidationError): FarmerPriorities(productivity=-1)


def test_zero_total_is_safe_and_has_no_scientific_ordering() -> None:
    result = capture(FarmerPriorities())
    assert set(result.normalized_priorities.values()) == {0.0}
    assert "Scientific assessments remain unchanged." in result.limitations[0]


def test_qualitative_soil_health_and_resilience_preserve_rotation_evidence() -> None:
    assessment = evaluate(
        RotationScenario(id="preference", crop_ids=["wheat", "wheat", "chickpea"]),
        CropRepository().list(),
    )
    result = compare(assessment, FarmerPriorities(soil_health=5, resilience=2))

    assert result.foregrounded_dimensions == ["soil_health", "resilience"]
    assert "soil_health" in result.available_preference_dimensions
    assert "resilience" in result.available_preference_dimensions
    assert any("Repeated crop flag: wheat." == item for item in result.qualitative_alignment_descriptors["soil_health"])
    assert any("Repeated family pattern: Poaceae." == item for item in result.qualitative_alignment_descriptors["resilience"])
    assert any("Sourced legume descriptor" in item for item in result.qualitative_alignment_descriptors["soil_health"])
    assert result.scientific_profile == assessment
    assert result.evidence == assessment.evidence and result.provenance == assessment.provenance


def test_unavailable_dimensions_do_not_penalize_unknown_or_create_a_score() -> None:
    assessment = evaluate(RotationScenario(id="unknown", crop_ids=["wheat"]), CropRepository().list())
    result = compare(assessment, FarmerPriorities(water_conservation=3, productivity=4))
    dumped = result.model_dump()

    assert result.foregrounded_dimensions == []
    assert result.unavailable_preference_dimensions == {
        "water_conservation": UNAVAILABLE,
        "productivity": UNAVAILABLE,
    }
    assert assessment.unknowns == result.scientific_profile.unknowns
    assert "score" not in dumped
    assert "best" not in str(dumped).lower()
    assert "does not penalize a scenario" in result.limitations[1]


def test_changing_priority_changes_only_foregrounding_not_scientific_profile() -> None:
    assessment = evaluate(RotationScenario(id="priority", crop_ids=["wheat", "chickpea"]), CropRepository().list())
    soil = compare(assessment, FarmerPriorities(soil_health=1))
    resilience = compare(assessment, FarmerPriorities(resilience=9))

    assert soil.foregrounded_dimensions == ["soil_health"]
    assert resilience.foregrounded_dimensions == ["resilience"]
    assert soil.scientific_profile == resilience.scientific_profile == assessment
