"""Transparent, non-numeric factor assessments backed by crop-record evidence."""
from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

from app.schemas.domain import CropProfile, ProvenanceRecord, SoilProfile

Status = Literal["SUITABLE", "MARGINAL", "LIMITING", "UNKNOWN"]


class FactorResult(BaseModel):
    factor: str
    status: Status
    evidence: list[ProvenanceRecord] = Field(default_factory=list)
    limitation: str | None = None


class CropSuitabilityResult(BaseModel):
    crop_id: str
    climate_assessment: list[FactorResult]
    soil_assessment: list[FactorResult]
    factor_results: list[FactorResult]
    overall_assessment: Literal["potentially_limited", "no_documented_limitation", "unknown"]
    limiting_factors: list[str]
    unknown_factors: list[str]
    evidence: list[ProvenanceRecord]
    provenance: list[ProvenanceRecord]
    assumptions: list[str]
    limitations: list[str]


def _unknown(factor: str, reason: str, evidence: list[ProvenanceRecord]) -> FactorResult:
    return FactorResult(factor=factor, status="UNKNOWN", evidence=evidence, limitation=reason)


def classify_numeric(factor: str, value: float | None, requirement: dict[str, Any] | None, evidence: list[ProvenanceRecord]) -> FactorResult:
    if value is None or not requirement or "optimum" not in requirement or "absolute" not in requirement:
        return _unknown(factor, "Local value or sourced crop requirement is unavailable.", evidence)
    optimum, absolute = requirement["optimum"], requirement["absolute"]
    if absolute["min"] <= value <= absolute["max"]:
        return FactorResult(factor=factor, status="SUITABLE" if optimum["min"] <= value <= optimum["max"] else "MARGINAL", evidence=evidence)
    return FactorResult(factor=factor, status="LIMITING", evidence=evidence)


def classify_category(factor: str, value: str | None, requirement: dict[str, Any] | None, evidence: list[ProvenanceRecord]) -> FactorResult:
    if not value or not requirement or "optimum" not in requirement or "absolute" not in requirement:
        return _unknown(factor, "Local value or sourced crop requirement is unavailable.", evidence)
    normalized = value.strip().lower()
    optimum = {item.lower() for item in requirement["optimum"]}
    absolute = {item.lower() for item in requirement["absolute"]}
    if normalized in optimum:
        return FactorResult(factor=factor, status="SUITABLE", evidence=evidence)
    if normalized in absolute:
        return FactorResult(factor=factor, status="MARGINAL", evidence=evidence)
    return FactorResult(factor=factor, status="LIMITING", evidence=evidence)


def evaluate(crop: CropProfile, soil: SoilProfile) -> CropSuitabilityResult:
    evidence = crop.sources
    # Crop calendars are not approved, so arbitrary NASA POWER date ranges are not climate suitability inputs.
    climate = [_unknown("temperature", "Crop-specific growing-period timing is not documented." , evidence), _unknown("precipitation", "Crop-specific growing-period timing is not documented.", evidence)]
    requirements = crop.soil_requirements
    soil_results = [
        classify_numeric("soil_pH", soil.pH, requirements.get("ph"), evidence),
        classify_category("soil_texture", soil.texture, requirements.get("texture"), evidence),
        _unknown("salinity", "Local salinity units are not represented in the current soil-input schema.", evidence),
        classify_category("drainage", soil.drainage, requirements.get("drainage"), evidence),
    ]
    factors = climate + soil_results
    limiting = [item.factor for item in factors if item.status == "LIMITING"]
    unknown = [item.factor for item in factors if item.status == "UNKNOWN"]
    overall = "potentially_limited" if limiting else "no_documented_limitation" if len(unknown) < len(factors) else "unknown"
    return CropSuitabilityResult(crop_id=crop.id, climate_assessment=climate, soil_assessment=soil_results, factor_results=factors, overall_assessment=overall, limiting_factors=limiting, unknown_factors=unknown, evidence=evidence, provenance=[*evidence, *soil.provenance], assumptions=[], limitations=["No crop calendar is approved; climate factors remain UNKNOWN.", "No numerical suitability score or recommendation is produced."])
