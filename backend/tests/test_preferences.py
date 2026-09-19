import pytest
from pydantic import ValidationError

from app.schemas.domain import FarmerPriorities
from app.services.preferences import UNAVAILABLE, capture


def test_preferences_normalize_transparently() -> None:
    result = capture(FarmerPriorities(water_conservation=2, soil_health=2))
    assert result.normalized_priorities["water_conservation"] == 0.5
    assert all(status == UNAVAILABLE for status in result.dimension_status.values())


def test_negative_preference_is_rejected() -> None:
    with pytest.raises(ValidationError): FarmerPriorities(productivity=-1)


def test_zero_total_is_safe_and_has_no_scientific_ordering() -> None:
    result = capture(FarmerPriorities())
    assert set(result.normalized_priorities.values()) == {0.0}
    assert "Scientific assessments remain unchanged." in result.limitations[0]
