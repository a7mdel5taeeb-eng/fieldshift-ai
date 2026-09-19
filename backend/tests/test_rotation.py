import pytest

from app.repositories.crops import CropRepository
from app.schemas.domain import RotationScenario
from app.services.rotation import evaluate, generate


def test_generation_uses_generic_three_period_horizon() -> None:
    scenarios = generate([CropRepository().get("wheat"), CropRepository().get("chickpea")], 3)
    assert len(scenarios) == 8 and scenarios[0].periods == ["Period 1", "Period 2", "Period 3"]


def test_repeated_crop_family_and_legume_descriptors_preserve_evidence() -> None:
    result = evaluate(RotationScenario(id="x", periods=["Period 1", "Period 2", "Period 3"], crop_ids=["wheat", "wheat", "chickpea"]), CropRepository().list())
    assert result.repeated_crop_flags == ["wheat"] and result.repeated_family_flags == ["Poaceae"]
    assert result.legume_presence and result.provenance and "score" not in result.model_dump()


def test_empty_or_unsupported_crops_are_rejected() -> None:
    with pytest.raises(ValueError):
        generate([], 3)
    with pytest.raises(ValueError):
        evaluate(RotationScenario(id="x", crop_ids=["unknown"]), CropRepository().list())
