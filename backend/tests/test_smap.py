import json
from datetime import date, datetime, timezone
from pathlib import Path

import h5py
import httpx
import numpy as np
import pytest

from app.adapters.smap import SmapAdapter, SmapAdapterError, quality_warnings

FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "smap_geophysical.json").read_text())


def test_fixture_parse_preserves_layers_units_and_provenance() -> None:
    data = SmapAdapter().parse_fixture(FIXTURE, datetime.now(timezone.utc))
    assert {item.layer.value for item in data} == {"surface", "root_zone"}
    assert {item.unit for item in data} == {"m3 m-3"}
    assert all(item.provenance.dataset_or_reference == "SPL4SMGP Version 8" for item in data)


def test_missing_variable_is_rejected() -> None:
    with pytest.raises(KeyError):
        SmapAdapter().parse_fixture({**FIXTURE, "variables": {}}, datetime.now(timezone.utc))


def test_unconfigured_access_fails_gracefully(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.delenv("SMAP_GRANULE_URL", raising=False)
    monkeypatch.delenv("NASA_EARTHDATA_TOKEN", raising=False)
    monkeypatch.delenv("NASA_EARTHDATA_USERNAME", raising=False)
    monkeypatch.delenv("NASA_EARTHDATA_PASSWORD", raising=False)
    with pytest.raises(SmapAdapterError, match="SMAP_AUTH_CONFIG_REQUIRED"):
        SmapAdapter().fetch(24.7, 47.3, date(2025, 1, 1), date(2025, 1, 2))


def test_quality_window_warning() -> None:
    assert quality_warnings(date(2026, 5, 14), date(2026, 5, 14))


def test_hdf5_parse_extracts_nearest_published_cell(tmp_path: Path) -> None:
    source_path = tmp_path / "granule.h5"
    with h5py.File(source_path, "w") as source:
        extent = source.create_group("Metadata").create_group("Extent")
        extent.attrs["rangeBeginningDateTime"] = "2025-01-01T01:30:00Z"
        source.create_dataset("cell_lat", data=np.array([[24.6, 24.7]]))
        source.create_dataset("cell_lon", data=np.array([[47.2, 47.3]]))
        geophysical = source.create_group("Geophysical_Data")
        surface = geophysical.create_dataset("sm_surface", data=np.array([[0.1, 0.2]]))
        rootzone = geophysical.create_dataset("sm_rootzone", data=np.array([[0.3, 0.4]]))
        surface.attrs["units"] = "m3 m-3"
        rootzone.attrs["units"] = "m3 m-3"

    data = SmapAdapter().parse_hdf5(source_path.read_bytes(), 24.7, 47.3, datetime.now(timezone.utc))

    assert {item.value for item in data} == {0.2, 0.4}


def test_token_discovers_official_granule_and_uses_bearer_auth() -> None:
    calls: list[httpx.Request] = []

    def handler(request: httpx.Request) -> httpx.Response:
        calls.append(request)
        if "cmr.earthdata.nasa.gov" in request.url.host:
            return httpx.Response(
                200,
                json={"feed": {"entry": [{"links": [{"rel": "http://esipfed.org/ns/fedsearch/1.1/data#", "href": "https://example.test/granule.h5"}]}]}},
            )
        return httpx.Response(200, content=b"fixture")

    adapter = SmapAdapter(client=httpx.Client(transport=httpx.MockTransport(handler)))
    adapter.parse_hdf5 = lambda *_: []  # type: ignore[method-assign]
    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setenv("NASA_EARTHDATA_TOKEN", "test-token")
        data = adapter.fetch(24.7, 47.3, date(2025, 1, 1), date(2025, 1, 1))

    assert data == []
    assert len(calls) == 2
    assert all(call.headers["authorization"] == "Bearer test-token" for call in calls)
    assert "short_name=SPL4SMGP" in str(calls[0].url)


def test_token_discovery_reports_missing_granule() -> None:
    adapter = SmapAdapter(client=httpx.Client(transport=httpx.MockTransport(lambda request: httpx.Response(200, json={"feed": {"entry": []}}))))
    with pytest.MonkeyPatch.context() as monkeypatch:
        monkeypatch.setenv("NASA_EARTHDATA_TOKEN", "test-token")
        with pytest.raises(SmapAdapterError, match="SMAP_GRANULE_NOT_FOUND"):
            adapter.fetch(24.7, 47.3, date(2025, 1, 1), date(2025, 1, 1))
