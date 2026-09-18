"""NASA POWER Daily API adapter using verified AG-community parameters."""
from datetime import date, datetime
from typing import Any

import httpx

from app.schemas.domain import ClimateObservation, ProvenanceRecord

POWER_URL = "https://power.larc.nasa.gov/api/temporal/daily/point"
COMMUNITY = "AG"
PARAMETERS = ("T2M", "T2M_MIN", "T2M_MAX", "PRECTOTCORR", "RH2M")


class PowerAdapterError(RuntimeError):
    pass


class MemoryCache:
    def __init__(self) -> None:
        self.values: dict[str, list[ClimateObservation]] = {}


class PowerAdapter:
    def __init__(self, client: httpx.Client | None = None, cache: MemoryCache | None = None) -> None:
        self.client = client or httpx.Client(timeout=20)
        self.cache = cache or MemoryCache()

    def fetch(self, latitude: float, longitude: float, start_date: date, end_date: date) -> list[ClimateObservation]:
        if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
            raise PowerAdapterError("INVALID_LOCATION")
        key = f"POWER:AG:{latitude}:{longitude}:{start_date:%Y%m%d}:{end_date:%Y%m%d}:{','.join(PARAMETERS)}:UTC"
        if key in self.cache.values:
            return self.cache.values[key]
        params = {"parameters": ",".join(PARAMETERS), "community": COMMUNITY, "longitude": longitude, "latitude": latitude, "start": start_date.strftime("%Y%m%d"), "end": end_date.strftime("%Y%m%d"), "format": "JSON", "time-standard": "UTC"}
        try:
            response = self.client.get(POWER_URL, params=params)
            response.raise_for_status()
            observations = self.parse(response.json(), latitude, longitude, datetime.now().astimezone())
        except (httpx.HTTPError, ValueError, KeyError, TypeError) as error:
            raise PowerAdapterError("NASA_DATA_UNAVAILABLE") from error
        self.cache.values[key] = observations
        return observations

    def parse(self, payload: dict[str, Any], latitude: float, longitude: float, retrieved_at: datetime) -> list[ClimateObservation]:
        values = payload["properties"]["parameter"]
        definitions = payload["parameters"]
        header = payload["header"]
        result: list[ClimateObservation] = []
        for parameter in PARAMETERS:
            if parameter not in values or parameter not in definitions:
                raise KeyError(parameter)
            for stamp, value in values[parameter].items():
                result.append(ClimateObservation(source="NASA POWER", source_dataset="POWER Daily API", variable=parameter, value=None if value == header.get("fill_value") else value, unit=definitions[parameter]["units"], timestamp=datetime.strptime(stamp, "%Y%m%d"), latitude=latitude, longitude=longitude, spatial_resolution="source native resolution", temporal_resolution="daily", quality="source-native", provenance=ProvenanceRecord(source_name="NASA POWER", source_type="NASA_OBSERVATION_OR_PRODUCT", dataset_or_reference="POWER Daily API", url=POWER_URL, retrieved_at=retrieved_at, observation_time=datetime.strptime(stamp, "%Y%m%d"), spatial_resolution="source native resolution", temporal_resolution="daily", quality_notes=[f"API {header['api']['version']}", "Values are not field-resolution measurements"])))
        return result
