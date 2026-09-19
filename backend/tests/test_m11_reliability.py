from collections.abc import Callable

from fastapi.testclient import TestClient

import app.main as main
from app.adapters.power import PowerAdapterError
from app.adapters.smap import SmapAdapterError

client = TestClient(main.app)
DEMO_REQUEST = {
    "latitude": 24.7,
    "longitude": 47.3,
    "start_date": "2025-01-01",
    "end_date": "2025-01-01",
}


def power_failure(*_args: object, **_kwargs: object) -> list[object]:
    raise PowerAdapterError("OFFLINE_TEST")


def smap_failure(*_args: object, **_kwargs: object) -> list[object]:
    raise SmapAdapterError("OFFLINE_TEST")


def power_live_fixture(*_args: object, **_kwargs: object) -> list[object]:
    return main.demo_snapshot.power()


def smap_live_fixture(*_args: object, **_kwargs: object) -> list[object]:
    return main.demo_snapshot.smap()


def context_statuses() -> tuple[dict[str, object], dict[str, object]]:
    power = client.post("/api/v1/environment/context", json=DEMO_REQUEST)
    smap = client.post("/api/v1/soil-moisture/context", json=DEMO_REQUEST)
    assert power.status_code == smap.status_code == 200
    return power.json(), smap.json()


def test_offline_demo_uses_validated_snapshot_without_credentials(monkeypatch) -> None:
    monkeypatch.setenv("ENABLE_DEMO_SNAPSHOTS", "true")
    monkeypatch.delenv("NASA_EARTHDATA_TOKEN", raising=False)
    monkeypatch.delenv("NASA_EARTHDATA_USERNAME", raising=False)
    monkeypatch.delenv("NASA_EARTHDATA_PASSWORD", raising=False)
    monkeypatch.setattr(main.power_adapter, "fetch", power_failure)
    monkeypatch.setattr(main.smap_adapter, "fetch", smap_failure)

    power, smap = context_statuses()

    assert power["source_status"] == smap["source_status"] == "DEMO_SNAPSHOT"
    assert len(power["data"]) == 5
    assert len(smap["data"]) == 2
    assert power["data"][0]["provenance"]["source_name"] == "NASA POWER"
    assert smap["data"][0]["provenance"]["citation"] == "DOI: 10.5067/T5RUATAQREF8"
    assert smap["data"][0]["timestamp"] == "2024-12-31T21:00:00Z"


def test_mixed_live_power_and_demo_smap_keep_source_statuses_separate(monkeypatch) -> None:
    monkeypatch.setenv("ENABLE_DEMO_SNAPSHOTS", "true")
    monkeypatch.setattr(main.power_adapter, "fetch", power_live_fixture)
    monkeypatch.setattr(main.smap_adapter, "fetch", smap_failure)

    power, smap = context_statuses()

    assert power["source_status"] == "LIVE_DATA"
    assert smap["source_status"] == "DEMO_SNAPSHOT"
    assert power["data"][0]["provenance"]["source_name"] == "NASA POWER"
    assert smap["data"][0]["provenance"]["source_name"] == "NASA NSIDC DAAC"


def test_mixed_demo_power_and_live_smap_keep_source_statuses_separate(monkeypatch) -> None:
    monkeypatch.setenv("ENABLE_DEMO_SNAPSHOTS", "true")
    monkeypatch.setattr(main.power_adapter, "fetch", power_failure)
    monkeypatch.setattr(main.smap_adapter, "fetch", smap_live_fixture)

    power, smap = context_statuses()

    assert power["source_status"] == "DEMO_SNAPSHOT"
    assert smap["source_status"] == "LIVE_DATA"
    assert power["data"] and smap["data"]


def test_live_power_remains_available_when_smap_is_unavailable(monkeypatch) -> None:
    monkeypatch.setenv("ENABLE_DEMO_SNAPSHOTS", "false")
    monkeypatch.setattr(main.power_adapter, "fetch", power_live_fixture)
    monkeypatch.setattr(main.smap_adapter, "fetch", smap_failure)

    power, smap = context_statuses()

    assert power["source_status"] == "LIVE_DATA"
    assert len(power["data"]) == 5
    assert smap["source_status"] == "UNAVAILABLE"
    assert smap["data"] == []


def test_demo_power_remains_available_when_smap_snapshot_is_unavailable(monkeypatch) -> None:
    monkeypatch.setenv("ENABLE_DEMO_SNAPSHOTS", "true")
    monkeypatch.setattr(main.power_adapter, "fetch", power_failure)
    monkeypatch.setattr(main.smap_adapter, "fetch", smap_failure)
    matches: Callable[..., bool] = iter((True, False)).__next__
    monkeypatch.setattr(main.demo_snapshot, "matches", lambda *_args: matches())

    power, smap = context_statuses()

    assert power["source_status"] == "DEMO_SNAPSHOT"
    assert len(power["data"]) == 5
    assert smap["source_status"] == "UNAVAILABLE"
    assert smap["data"] == []


def test_live_mode_uses_adapter_results_without_snapshot_fallback(monkeypatch) -> None:
    monkeypatch.setenv("ENABLE_DEMO_SNAPSHOTS", "false")
    monkeypatch.setattr(main.power_adapter, "fetch", power_live_fixture)
    monkeypatch.setattr(main.smap_adapter, "fetch", smap_live_fixture)

    power, smap = context_statuses()

    assert power["source_status"] == smap["source_status"] == "LIVE_DATA"
    assert len(power["data"]) == 5 and len(smap["data"]) == 2
