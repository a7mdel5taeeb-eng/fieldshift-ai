"""NASA SMAP SPL4SMGP Version 8 adapter.

The product is a 9 km, three-hourly model/data-assimilation estimate.  It is
not represented as a field-level sensor measurement.
"""
from __future__ import annotations

import os
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Any

import h5py
import httpx

from app.schemas.domain import ProvenanceRecord, SoilMoistureLayer, SoilMoistureObservation

SMAP_DATASET = "SPL4SMGP Version 8"
SMAP_URL = "https://nsidc.org/data/spl4smgp/versions/8"
SMAP_DOI = "10.5067/T5RUATAQREF8"
SMAP_VARIABLES = {"sm_surface": SoilMoistureLayer.SURFACE, "sm_rootzone": SoilMoistureLayer.ROOT_ZONE}
QUALITY_ISSUE_START = date(2026, 5, 14)
QUALITY_ISSUE_END = date(2026, 7, 28)


class SmapAdapterError(RuntimeError):
    """A source-access or source-format failure, never a synthetic fallback."""


class SmapCache:
    def __init__(self) -> None:
        self.values: dict[str, list[SoilMoistureObservation]] = {}


class SmapAdapter:
    def __init__(self, client: httpx.Client | None = None, cache: SmapCache | None = None) -> None:
        self.client = client or httpx.Client(timeout=30, follow_redirects=True)
        self.cache = cache or SmapCache()

    def fetch(self, latitude: float, longitude: float, start_date: date, end_date: date) -> list[SoilMoistureObservation]:
        if not -85.0445664 <= latitude <= 85.0445664 or not -180 <= longitude <= 180:
            raise SmapAdapterError("SMAP_LOCATION_OUTSIDE_COVERAGE")
        url = os.getenv("SMAP_GRANULE_URL")
        username = os.getenv("NASA_EARTHDATA_USERNAME")
        password = os.getenv("NASA_EARTHDATA_PASSWORD")
        if not url or not username or not password:
            raise SmapAdapterError("SMAP_AUTH_CONFIG_REQUIRED")
        key = f"SMAP:{latitude}:{longitude}:{start_date.isoformat()}:{end_date.isoformat()}:{url}"
        if key in self.cache.values:
            return self.cache.values[key]
        try:
            response = self.client.get(url, auth=(username, password))
            response.raise_for_status()
            observations = self.parse_hdf5(response.content, latitude, longitude, datetime.now(timezone.utc))
        except (OSError, httpx.HTTPError, KeyError, TypeError, ValueError) as error:
            raise SmapAdapterError("NASA_DATA_UNAVAILABLE") from error
        self.cache.values[key] = observations
        return observations

    def parse_hdf5(self, contents: bytes, latitude: float, longitude: float, retrieved_at: datetime) -> list[SoilMoistureObservation]:
        temporary = Path(os.getenv("TEMP", ".")) / f"fieldshift-smap-{id(contents)}.h5"
        try:
            temporary.write_bytes(contents)
            with h5py.File(temporary, "r") as source:
                row, column = self._nearest_cell(source, latitude, longitude)
                timestamp = self._timestamp(source)
                return self._observations(source, row, column, latitude, longitude, timestamp, retrieved_at)
        finally:
            temporary.unlink(missing_ok=True)

    def parse_fixture(self, payload: dict[str, Any], retrieved_at: datetime) -> list[SoilMoistureObservation]:
        timestamp = datetime.fromisoformat(payload["timestamp"].replace("Z", "+00:00"))
        return self._from_values(payload["variables"], payload["latitude"], payload["longitude"], timestamp, retrieved_at)

    def _nearest_cell(self, source: h5py.File, latitude: float, longitude: float) -> tuple[int, int]:
        # SPL4SMGP publishes cell_lat/cell_lon coordinates; nearest-cell selection preserves its 9 km scale.
        import numpy as np

        distance = (source["cell_lat"][:] - latitude) ** 2 + (source["cell_lon"][:] - longitude) ** 2
        return tuple(int(index) for index in np.unravel_index(np.nanargmin(distance), distance.shape))

    def _timestamp(self, source: h5py.File) -> datetime:
        value = source.attrs.get("RangeBeginningDateTime")
        if isinstance(value, bytes):
            value = value.decode()
        if not value:
            raise KeyError("RangeBeginningDateTime")
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))

    def _observations(self, source: h5py.File, row: int, column: int, latitude: float, longitude: float, timestamp: datetime, retrieved_at: datetime) -> list[SoilMoistureObservation]:
        values = {name: float(source[name][row, column]) for name in SMAP_VARIABLES}
        return self._from_values(values, latitude, longitude, timestamp, retrieved_at)

    def _from_values(self, values: dict[str, Any], latitude: float, longitude: float, timestamp: datetime, retrieved_at: datetime) -> list[SoilMoistureObservation]:
        result: list[SoilMoistureObservation] = []
        for variable, layer in SMAP_VARIABLES.items():
            if variable not in values:
                raise KeyError(variable)
            result.append(SoilMoistureObservation(source="NASA SMAP", dataset=SMAP_DATASET, layer=layer, value=float(values[variable]), unit="m3 m-3", timestamp=timestamp, latitude=latitude, longitude=longitude, spatial_resolution="9 km", quality="source-native; inspect source QA metadata", provenance=ProvenanceRecord(source_name="NASA NSIDC DAAC", source_type="NASA_OBSERVATION_OR_PRODUCT", dataset_or_reference=SMAP_DATASET, url=SMAP_URL, citation=f"SMAP L4 Geophysical Data V8, DOI: {SMAP_DOI}", retrieved_at=retrieved_at, observation_time=timestamp, spatial_resolution="9 km EASE-Grid 2.0", temporal_resolution="3-hourly", processing_steps=["Nearest published 9 km grid cell selected"], quality_notes=["Model/data-assimilation product; not a field measurement", "Known geolocation issue: 2026-05-14 through 2026-07-28; Standard products are being reprocessed."])))
        return result


def quality_warnings(start_date: date, end_date: date) -> list[str]:
    if start_date <= QUALITY_ISSUE_END and end_date >= QUALITY_ISSUE_START:
        return ["SMAP geolocation issue affects 2026-05-14 through 2026-07-28; Standard products are being reprocessed."]
    return []
