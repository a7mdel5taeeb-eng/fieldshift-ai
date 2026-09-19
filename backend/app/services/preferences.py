"""Evidence-aligned preference presentation; no ranking or scientific weighting."""
from pydantic import BaseModel, Field

from app.schemas.domain import FarmerPriorities, ProvenanceRecord
from app.services.rotation import RotationAssessment

DIMENSIONS = ("water_conservation", "soil_health", "resilience", "productivity")
UNAVAILABLE = "PREFERENCE_EVIDENCE_UNAVAILABLE"
AVAILABLE = "PREFERENCE_EVIDENCE_AVAILABLE"


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
    return PreferenceCaptureResult(
        user_priorities=priorities,
        normalized_priorities=normalized,
        dimension_status={
            "water_conservation": UNAVAILABLE,
            "soil_health": AVAILABLE,
            "resilience": AVAILABLE,
            "productivity": UNAVAILABLE,
        },
        warnings=[warning],
        limitations=[
            "Available dimensions can foreground qualitative rotation evidence only; "
            "preference-based scenario ordering remains blocked. Scientific assessments remain unchanged."
        ],
    )


class PreferenceComparison(BaseModel):
    """A transparent presentation layer over an unchanged rotation assessment."""

    scenario_id: str
    scientific_profile: RotationAssessment
    user_priorities: FarmerPriorities
    available_preference_dimensions: list[str] = Field(default_factory=list)
    unavailable_preference_dimensions: dict[str, str] = Field(default_factory=dict)
    foregrounded_dimensions: list[str] = Field(default_factory=list)
    qualitative_alignment_descriptors: dict[str, list[str]] = Field(default_factory=dict)
    explanation: list[str] = Field(default_factory=list)
    evidence: list[ProvenanceRecord] = Field(default_factory=list)
    provenance: list[ProvenanceRecord] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)


def _soil_health_descriptors(assessment: RotationAssessment) -> list[str]:
    descriptors = [
        f"Crop diversity descriptor: {assessment.diversity_descriptors['distinct_crop_count']} distinct crop(s).",
        f"Crop-family diversity descriptor: {assessment.diversity_descriptors['distinct_family_count']} distinct family/families.",
    ]
    descriptors.extend(f"Repeated crop flag: {crop}." for crop in assessment.repeated_crop_flags)
    descriptors.extend(f"Repeated family flag: {family}." for family in assessment.repeated_family_flags)
    if assessment.legume_presence:
        descriptors.append("Sourced legume descriptor is present; this is not a quantified soil-health benefit.")
    descriptors.extend(assessment.documented_risks)
    return descriptors


def _resilience_descriptors(assessment: RotationAssessment) -> list[str]:
    descriptors = [
        f"Rotation-diversity descriptor: {assessment.diversity_descriptors['distinct_crop_count']} distinct crop(s).",
        f"Crop-family diversity descriptor: {assessment.diversity_descriptors['distinct_family_count']} distinct family/families.",
    ]
    descriptors.extend(f"Repeated crop pattern: {crop}." for crop in assessment.repeated_crop_flags)
    descriptors.extend(f"Repeated family pattern: {family}." for family in assessment.repeated_family_flags)
    if assessment.legume_presence:
        descriptors.append("Sourced legume descriptor is present; it is not a drought-tolerance or resilience claim.")
    descriptors.extend(assessment.documented_risks)
    return descriptors


def compare(assessment: RotationAssessment, priorities: FarmerPriorities) -> PreferenceComparison:
    """Foreground approved qualitative evidence without scoring, ordering, or penalties."""
    descriptors = {
        "soil_health": _soil_health_descriptors(assessment),
        "resilience": _resilience_descriptors(assessment),
    }
    unavailable = {
        "water_conservation": UNAVAILABLE,
        "productivity": UNAVAILABLE,
    }
    foregrounded = [
        dimension
        for dimension in descriptors
        if (getattr(priorities, dimension) or 0) > 0
    ]
    explanation = [
        "User priorities foreground available qualitative evidence; they do not change the scientific profile.",
        "Water conservation is unavailable: approved crop-water methodology and crop-specific parameters are not available.",
        "Productivity is unavailable: no approved yield or productivity methodology is available.",
    ]
    return PreferenceComparison(
        scenario_id=assessment.scenario_id,
        scientific_profile=assessment,
        user_priorities=priorities,
        available_preference_dimensions=list(descriptors),
        unavailable_preference_dimensions=unavailable,
        foregrounded_dimensions=foregrounded,
        qualitative_alignment_descriptors=descriptors,
        explanation=explanation,
        evidence=assessment.evidence,
        provenance=assessment.provenance,
        limitations=[
            "No numeric preference score, scenario ordering, or universal winner is produced.",
            "Unknown or unavailable evidence is not negative evidence and does not penalize a scenario.",
            *assessment.limitations,
        ],
    )
