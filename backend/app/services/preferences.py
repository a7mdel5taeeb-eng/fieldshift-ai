"""User-preference capture only; no scientific or scenario-ordering mapping."""
from pydantic import BaseModel, Field

from app.schemas.domain import FarmerPriorities

DIMENSIONS = ("water_conservation", "soil_health", "resilience", "productivity")
UNAVAILABLE = "PREFERENCE_EVIDENCE_UNAVAILABLE"


class PreferenceCaptureResult(BaseModel):
    user_priorities: FarmerPriorities
    normalized_priorities: dict[str, float]
    dimension_status: dict[str, str]
    warnings: list[str] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)


def capture(priorities: FarmerPriorities) -> PreferenceCaptureResult:
    values = {dimension: getattr(priorities, dimension) or 0.0 for dimension in DIMENSIONS}
    total = sum(values.values())
    normalized = {dimension: value / total for dimension, value in values.items()} if total else {dimension: 0.0 for dimension in DIMENSIONS}
    warning = "No preference values were provided; normalized values are zero." if not total else "User preferences are not scientific weights."
    return PreferenceCaptureResult(user_priorities=priorities, normalized_priorities=normalized, dimension_status={dimension: UNAVAILABLE for dimension in DIMENSIONS}, warnings=[warning], limitations=["Preference-based scenario ordering is blocked until source-backed mappings are approved. Scientific assessments remain unchanged."])
