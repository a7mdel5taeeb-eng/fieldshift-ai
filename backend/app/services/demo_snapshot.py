"""Validated, explicitly opt-in NASA demo snapshot loader."""
import json
from datetime import datetime
from pathlib import Path

from app.schemas.domain import ClimateObservation, ProvenanceRecord, SoilMoistureObservation

PATH = Path(__file__).parents[3] / "data/samples/demo/nasa_demo_snapshot.json"


def enabled() -> bool:
    return __import__("os").environ.get("ENABLE_DEMO_SNAPSHOTS", "false").lower() == "true"


def matches(latitude: float, longitude: float, start: str, end: str) -> bool:
    value = json.loads(PATH.read_text())
    case = value["demo_case"]
    return latitude == case["latitude"] and longitude == case["longitude"] and start == end == case["requested_date"]


def power() -> list[ClimateObservation]:
    value = json.loads(PATH.read_text()); case = value["demo_case"]; meta = value["provenance"]["power"]
    retrieved = datetime.fromisoformat(value["retrieved_at"])
    return [ClimateObservation(source="NASA POWER", source_dataset=meta["dataset"], variable=x["variable"], value=x["value"], unit=x["unit"], timestamp=datetime.fromisoformat(case["requested_date"]), latitude=case["latitude"], longitude=case["longitude"], spatial_resolution=meta["spatial_resolution"], temporal_resolution=meta["temporal_resolution"], quality="DEMO_SNAPSHOT", provenance=ProvenanceRecord(source_name=meta["source_name"], source_type="NASA_OBSERVATION_OR_PRODUCT", dataset_or_reference=meta["dataset"], url=meta["url"], retrieved_at=retrieved, observation_time=datetime.fromisoformat(case["requested_date"]), spatial_resolution=meta["spatial_resolution"], temporal_resolution=meta["temporal_resolution"], quality_notes=meta["quality_notes"] + ["DEMO_SNAPSHOT"])) for x in value["power"]]


def smap() -> list[SoilMoistureObservation]:
    value = json.loads(PATH.read_text()); case = value["demo_case"]; meta = value["provenance"]["smap"]
    return [SoilMoistureObservation(source="NASA SMAP", dataset=meta["dataset"], layer=x["layer"], value=x["value"], unit=x["unit"], timestamp=datetime.fromisoformat(x["observation_timestamp"].replace("Z", "+00:00")), latitude=case["latitude"], longitude=case["longitude"], spatial_resolution="9 km", quality="DEMO_SNAPSHOT", provenance=ProvenanceRecord(source_name=meta["source_name"], source_type="NASA_OBSERVATION_OR_PRODUCT", dataset_or_reference=meta["dataset"], url=meta["url"], citation=f"DOI: {meta['doi']}", retrieved_at=datetime.fromisoformat(value["retrieved_at"]), observation_time=datetime.fromisoformat(x["observation_timestamp"].replace("Z", "+00:00")), spatial_resolution=meta["spatial_resolution"], temporal_resolution=meta["temporal_resolution"], processing_steps=meta["processing_steps"], quality_notes=meta["quality_notes"] + ["DEMO_SNAPSHOT"])) for x in value["smap"]]
