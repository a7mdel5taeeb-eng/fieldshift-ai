"""Transport-safe domain models; scientific interpretation belongs to later milestones."""
from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any

from pydantic import BaseModel, Field


class Location(BaseModel):
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    display_name: str | None = None
    country: str | None = None
    region: str | None = None


class ProvenanceRecord(BaseModel):
    source_name: str
    source_type: str
    dataset_or_reference: str | None = None
    url: str | None = None
    citation: str | None = None
    retrieved_at: datetime | None = None
    observation_time: datetime | None = None
    license: str | None = None
    spatial_resolution: str | None = None
    temporal_resolution: str | None = None
    processing_steps: list[str] = Field(default_factory=list)
    quality_notes: list[str] = Field(default_factory=list)


class ClimateObservation(BaseModel):
    source: str
    source_dataset: str
    variable: str
    value: float | None = None
    unit: str | None = None
    timestamp: datetime
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    spatial_resolution: str | None = None
    temporal_resolution: str | None = None
    quality: str | None = None
    provenance: ProvenanceRecord


class SoilMoistureLayer(StrEnum):
    SURFACE = "surface"
    ROOT_ZONE = "root_zone"


class SoilMoistureObservation(BaseModel):
    source: str
    dataset: str
    layer: SoilMoistureLayer
    value: float | None = None
    unit: str | None = None
    timestamp: datetime
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    spatial_resolution: str | None = None
    quality: str | None = None
    provenance: ProvenanceRecord


class SoilProfile(BaseModel):
    source_type: str | None = Field(
        default=None,
        pattern="^(laboratory_measurement|farmer_provided|local_record|modeled_estimate|unknown)$",
    )
    measurement_date: datetime | None = None
    depth: str | None = None
    texture: str | None = None
    pH: float | None = None
    salinity: float | None = None
    organic_matter: float | None = None
    nitrogen: float | None = None
    phosphorus: float | None = None
    potassium: float | None = None
    drainage: str | None = None
    water_holding_capacity: float | None = None
    provenance: list[ProvenanceRecord] = Field(default_factory=list)


class SoilSourceType(StrEnum):
    LABORATORY_MEASUREMENT = "laboratory_measurement"
    FARMER_PROVIDED = "farmer_provided"
    LOCAL_RECORD = "local_record"
    MODELED_ESTIMATE = "modeled_estimate"
    UNKNOWN = "unknown"


class CropProfile(BaseModel):
    id: str
    common_name: str
    scientific_name: str | None = None
    family: str | None = None
    climate_requirements: dict[str, Any] = Field(default_factory=dict)
    soil_requirements: dict[str, Any] = Field(default_factory=dict)
    water_requirements: dict[str, Any] = Field(default_factory=dict)
    rotation_traits: dict[str, Any] = Field(default_factory=dict)
    sources: list[ProvenanceRecord] = Field(default_factory=list)
    review_status: str | None = None


class FarmerPriorities(BaseModel):
    water_conservation: float | None = None
    soil_health: float | None = None
    resilience: float | None = None
    productivity: float | None = None


class RotationScenario(BaseModel):
    id: str
    periods: list[str] = Field(default_factory=list)
    crop_ids: list[str] = Field(default_factory=list)
    generation_method: str | None = None
    source_rules: list[str] = Field(default_factory=list)


class ScientificScenarioProfile(BaseModel):
    climate_assessment: dict[str, Any] | None = None
    soil_assessment: dict[str, Any] | None = None
    water_context: dict[str, Any] | None = None
    rotation_assessment: dict[str, Any] | None = None
    limiting_factors: list[str] = Field(default_factory=list)
    benefits: list[str] = Field(default_factory=list)
    risks: list[str] = Field(default_factory=list)
    unknowns: list[str] = Field(default_factory=list)
    uncertainties: list[str] = Field(default_factory=list)
    evidence: list[ProvenanceRecord] = Field(default_factory=list)
