"""Descriptor-only crop-rotation scenarios; no ranking or compatibility inference."""
from itertools import product

from pydantic import BaseModel, Field

from app.schemas.domain import CropProfile, ProvenanceRecord, RotationScenario

ROTATION_SOURCE = ProvenanceRecord(source_name="FAO Conservation Agriculture", source_type="EXTERNAL_REFERENCE", url="https://www.fao.org/conservation-agriculture/in-practice/species-diversification/en/", citation="FAO: crop rotation can prevent carry-over of crop-specific pests and diseases.")
FAMILY_SOURCE = ProvenanceRecord(source_name="FAO", source_type="EXTERNAL_REFERENCE", url="https://www.fao.org/4/a0218e/A0218E16.htm", citation="FAO crop-rotation guidance: change plant family in rotation.")


class RotationAssessment(BaseModel):
    scenario_id: str
    periods: list[str]
    crops: list[str]
    crop_families: list[str | None]
    diversity_descriptors: dict[str, int]
    legume_presence: bool
    repeated_crop_flags: list[str]
    repeated_family_flags: list[str]
    documented_benefits: list[str] = Field(default_factory=list)
    documented_risks: list[str] = Field(default_factory=list)
    unknowns: list[str] = Field(default_factory=list)
    evidence: list[ProvenanceRecord] = Field(default_factory=list)
    provenance: list[ProvenanceRecord] = Field(default_factory=list)
    limitations: list[str] = Field(default_factory=list)


def generate(crops: list[CropProfile], horizon: int) -> list[RotationScenario]:
    if not crops:
        raise ValueError("CANDIDATE_CROPS_REQUIRED")
    if horizon < 1 or horizon > 6:
        raise ValueError("INVALID_PLANNING_HORIZON")
    periods = [f"Period {index}" for index in range(1, horizon + 1)]
    return [RotationScenario(id=f"scenario-{index + 1}", periods=periods, crop_ids=list(sequence), generation_method="enumerated_supported_crop_sequences", source_rules=[]) for index, sequence in enumerate(product((crop.id for crop in crops), repeat=horizon))]


def evaluate(scenario: RotationScenario, crops: list[CropProfile]) -> RotationAssessment:
    lookup = {crop.id: crop for crop in crops}
    if any(crop_id not in lookup for crop_id in scenario.crop_ids):
        raise ValueError("CROP_NOT_SUPPORTED")
    selected = [lookup[crop_id] for crop_id in scenario.crop_ids]
    families = [crop.family for crop in selected]
    repeated_crops = sorted({crop_id for crop_id in scenario.crop_ids if scenario.crop_ids.count(crop_id) > 1})
    repeated_families = sorted({family for family in families if family and families.count(family) > 1})
    legumes = any(bool(crop.rotation_traits.get("legume", {}).get("value")) for crop in selected)
    evidence = list({source.url: source for crop in selected for source in crop.sources}.values())
    risks: list[str] = []
    if repeated_crops:
        risks.append("Repeated crop: source notes crop rotation can prevent pest and disease carry-over.")
        evidence.append(ROTATION_SOURCE)
    if repeated_families:
        risks.append("Repeated crop family: source guidance advises changing plant family in rotation.")
        evidence.append(FAMILY_SOURCE)
    benefits = ["Chickpea is present; this is a sourced legume descriptor, not a quantified benefit."] if legumes else []
    return RotationAssessment(scenario_id=scenario.id, periods=scenario.periods, crops=scenario.crop_ids, crop_families=families, diversity_descriptors={"distinct_crop_count": len(set(scenario.crop_ids)), "distinct_family_count": len({family for family in families if family})}, legume_presence=legumes, repeated_crop_flags=repeated_crops, repeated_family_flags=repeated_families, documented_benefits=benefits, documented_risks=risks, unknowns=["No crop-pair compatibility or sequence restriction is evaluated."], evidence=evidence, provenance=evidence, limitations=["Descriptors and sourced warnings are not a rotation recommendation or score."])
