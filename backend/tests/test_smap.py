import json
from datetime import date, datetime, timezone
from pathlib import Path

import h5py
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
    with pytest.raises(SmapAdapterError, match="SMAP_AUTH_CONFIG_REQUIRED"):
        SmapAdapter().fetch(24.7, 47.3, date(2025, 1, 1), date(2025, 1, 2))


def test_quality_window_warning() -> None:
    assert quality_warnings(date(2026, 5, 14), date(2026, 5, 14))


def test_hdf5_parse_extracts_nearest_published_cell(tmp_path: Path) -> None:
    source_path = tmp_path / "granule.h5"
    with h5py.File(source_path, "w") as source:
        source.attrs["RangeBeginningDateTime"] = "2025-01-01T01:30:00Z"
        source.create_dataset("cell_lat", data=np.array([[24.6, 24.7]]))
        source.create_dataset("cell_lon", data=np.array([[47.2, 47.3]]))
        source.create_dataset("sm_surface", data=np.array([[0.1, 0.2]]))
        source.create_dataset("sm_rootzone", data=np.array([[0.3, 0.4]]))

    data = SmapAdapter().parse_hdf5(source_path.read_bytes(), 24.7, 47.3, datetime.now(timezone.utc))

    assert {item.value for item in data} == {0.2, 0.4}
