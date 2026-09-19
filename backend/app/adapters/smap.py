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
CMR_GRANULES_URL = "https://cmr.earthdata.nasa.gov/search/granules.json"
SMAP_SHORT_NAME = "SPL4SMGP"
SMAP_VERSION = "008"
SMAP_VARIABLES = {"sm_surface": SoilMoistureLayer.SURFACE, "sm_rootzone": SoilMoistureLayer.ROOT_ZONE}
QUALITY_ISSUE_START = date(2026, 5, 14)
QUALITY_ISSUE_END = date(2026, 7, 28)


class SmapAdapterError(RuntimeError):
    """A source-access or source-format failure, never a synthetic fallback."""


class SmapCache:
    def __init__(self) -> None:
        self.values: dict[str, list[SoilMoistureObservation]] = {}


def load_local_environment(path: Path | None = None) -> None:
    """Load a local, ignored .env without overwriting process configuration.

    Values are deliberately never logged or returned. Deployment environments
    can provide the same variables directly and take precedence.
    """
    environment_file = path or Path(__file__).resolve().parents[3] / ".env"
    if not environment_file.is_file():
        return
    for line in environment_file.read_text(encoding="utf-8").splitlines():
        candidate = line.strip()
        if not candidate or candidate.startswith("#") or "=" not in candidate:
            continue
        name, value = candidate.split("=", 1)
        name = name.strip()
        if name:
            os.environ.setdefault(name, value.strip().strip('"').strip("'"))


class SmapAdapter:
    def __init__(self, client: httpx.Client | None = None, cache: SmapCache | None = None) -> None:
        self.client = client or httpx.Client(timeout=30, follow_redirects=True)
        self.cache = cache or SmapCache()

    def fetch(self, latitude: float, longitude: float, start_date: date, end_date: date) -> list[SoilMoistureObservation]:
        if not -85.0445664 <= latitude <= 85.0445664 or not -180 <= longitude <= 180:
            raise SmapAdapterError("SMAP_LOCATION_OUTSIDE_COVERAGE")
        token = os.getenv("NASA_EARTHDATA_TOKEN")
        url = os.getenv("SMAP_GRANULE_URL")
        username = os.getenv("NASA_EARTHDATA_USERNAME")
        password = os.getenv("NASA_EARTHDATA_PASSWORD")
        if not token and (not url or not username or not password):
            raise SmapAdapterError("SMAP_AUTH_CONFIG_REQUIRED")
        key = f"SMAP:{latitude}:{longitude}:{start_date.isoformat()}:{end_date.isoformat()}"
        if key in self.cache.values:
            return self.cache.values[key]
        try:
            if token:
                url = self._discover_granule(latitude, longitude, start_date, end_date, token)
                response = self.client.get(url, headers={"Authorization": f"Bearer {token}"})
            else:
                response = self.client.get(url, auth=(username, password))
            response.raise_for_status()
            observations = self.parse_hdf5(response.content, latitude, longitude, datetime.now(timezone.utc))
        except httpx.HTTPStatusError as error:
            if error.response.status_code in {401, 403}:
                raise SmapAdapterError("SMAP_AUTHORIZATION_FAILED") from error
            raise SmapAdapterError("SMAP_GRANULE_ACCESS_FAILED") from error
        except (OSError, httpx.HTTPError, KeyError, TypeError, ValueError) as error:
            raise SmapAdapterError("NASA_DATA_UNAVAILABLE") from error
        self.cache.values[key] = observations
        return observations

    def _discover_granule(
        self, latitude: float, longitude: float, start_date: date, end_date: date, token: str
    ) -> str:
        """Discover one official V8 granule using CMR; never require a saved URL."""
        temporal = f"{start_date.isoformat()}T00:00:00Z,{end_date.isoformat()}T23:59:59Z"
        response = self.client.get(
            CMR_GRANULES_URL,
            params={
                "short_name": SMAP_SHORT_NAME,
                "version": SMAP_VERSION,
                "temporal": temporal,
                "point": f"{longitude},{latitude}",
                "page_size": 1,
            },
            headers={"Authorization": f"Bearer {token}", "Accept": "application/json"},
        )
        response.raise_for_status()
        entries = response.json().get("feed", {}).get("entry", [])
        if not entries:
            raise SmapAdapterError("SMAP_GRANULE_NOT_FOUND")
        for link in entries[0].get("links", []):
            href = link.get("href", "")
            if link.get("rel", "").endswith("data#") and ".h5" in href.lower():
                return href
        raise SmapAdapterError("SMAP_GRANULE_NOT_FOUND")

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
        if not value and "Metadata/Extent" in source:
            value = source["Metadata/Extent"].attrs.get("rangeBeginningDateTime")
        if isinstance(value, bytes):
            value = value.decode()
        if not value:
            raise KeyError("RangeBeginningDateTime")
        return datetime.fromisoformat(str(value).replace("Z", "+00:00"))

    def _observations(self, source: h5py.File, row: int, column: int, latitude: float, longitude: float, timestamp: datetime, retrieved_at: datetime) -> list[SoilMoistureObservation]:
        datasets = {name: self._variable_dataset(source, name) for name in SMAP_VARIABLES}
        values = {name: float(dataset[row, column]) for name, dataset in datasets.items()}
        units = {name: self._dataset_unit(dataset) for name, dataset in datasets.items()}
        return self._from_values(values, latitude, longitude, timestamp, retrieved_at, units)

    def _variable_dataset(self, source: h5py.File, variable: str) -> h5py.Dataset:
        """Support the documented V8 Geophysical_Data group and compact fixtures."""
        path = f"Geophysical_Data/{variable}"
        if path in source:
            return source[path]
        return source[variable]

    def _dataset_unit(self, dataset: h5py.Dataset) -> str:
        unit = dataset.attrs.get("units")
        if isinstance(unit, bytes):
            unit = unit.decode()
        if not unit:
            raise KeyError("units")
        return str(unit)

    def _from_values(self, values: dict[str, Any], latitude: float, longitude: float, timestamp: datetime, retrieved_at: datetime, units: dict[str, str] | None = None) -> list[SoilMoistureObservation]:
        result: list[SoilMoistureObservation] = []
        for variable, layer in SMAP_VARIABLES.items():
            if variable not in values:
                raise KeyError(variable)
            result.append(SoilMoistureObservation(source="NASA SMAP", dataset=SMAP_DATASET, layer=layer, value=float(values[variable]), unit=(units or {}).get(variable, "m3 m-3"), timestamp=timestamp, latitude=latitude, longitude=longitude, spatial_resolution="9 km", quality="source-native; inspect source QA metadata", provenance=ProvenanceRecord(source_name="NASA NSIDC DAAC", source_type="NASA_OBSERVATION_OR_PRODUCT", dataset_or_reference=SMAP_DATASET, url=SMAP_URL, citation=f"SMAP L4 Geophysical Data V8, DOI: {SMAP_DOI}", retrieved_at=retrieved_at, observation_time=timestamp, spatial_resolution="9 km EASE-Grid 2.0", temporal_resolution="3-hourly", processing_steps=["Nearest published 9 km grid cell selected"], quality_notes=["Model/data-assimilation product; not a field measurement", "Known geolocation issue: 2026-05-14 through 2026-07-28; Standard products are being reprocessed."])))
        return result


def quality_warnings(start_date: date, end_date: date) -> list[str]:
    if start_date <= QUALITY_ISSUE_END and end_date >= QUALITY_ISSUE_START:
        return ["SMAP geolocation issue affects 2026-05-14 through 2026-07-28; Standard products are being reprocessed."]
    return []
