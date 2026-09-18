import json
from datetime import date, datetime
from pathlib import Path

import httpx
import pytest

from app.adapters.power import MemoryCache, PowerAdapter, PowerAdapterError

FIXTURE = json.loads((Path(__file__).parent / "fixtures" / "power_daily.json").read_text())

def test_parse_preserves_units_timestamps_and_provenance() -> None:
    data = PowerAdapter().parse(FIXTURE, 24.7, 47.3, datetime.now().astimezone())
    assert len(data) == 5 and {item.unit for item in data} == {"C", "mm/day", "%"}
    assert data[0].timestamp.year == 2025 and data[0].provenance.source_name == "NASA POWER"

def test_invalid_location() -> None:
    with pytest.raises(PowerAdapterError): PowerAdapter().fetch(91, 0, date(2025,1,1), date(2025,1,2))

def test_missing_and_malformed_response() -> None:
    with pytest.raises(KeyError): PowerAdapter().parse({}, 0, 0, datetime.now())

def test_cache_behavior() -> None:
    adapter = PowerAdapter(cache=MemoryCache())
    adapter.parse = lambda *_: []  # type: ignore[method-assign]
    adapter.client = httpx.Client(transport=httpx.MockTransport(lambda _: httpx.Response(200, json=FIXTURE)))
    assert adapter.fetch(0, 0, date(2025,1,1), date(2025,1,1)) == []
    assert len(adapter.cache.values) == 1
