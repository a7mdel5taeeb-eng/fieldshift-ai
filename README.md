# FieldShift AI

FieldShift AI is an evidence-based crop-rotation decision-support project for the 2026 NASA International Space Apps Challenge, "Field Shift: Adapting Farms with NASA Data."

FieldShift AI is a globally scalable agricultural decision-support platform. It is not limited to Saudi Arabia: users may evaluate locations in any country where the required NASA environmental data and approved crop/soil reference information are available. Saudi Arabia / Al-Kharj may be used only as a demonstration or validation case.

The documented product direction supports three future modes: **Analyze My Crop**, **Find Suitable Crops** (using only supported, sourced crop profiles), and **Plan Crop Rotation**. The current wheat, barley, chickpea, and alfalfa records are MVP examples, not a global crop limitation. Economic feasibility is a future research layer and will only be shown where verified, location-, date-, currency-, and source-aware data exists; otherwise the product must report `ECONOMIC_DATA_UNAVAILABLE`.

The current application includes traceable NASA POWER context and an optional NASA SMAP SPL4SMGP Version 8 soil-moisture adapter. It contains no scientific decision logic or crop recommendations.

## Prerequisites

- Node.js 20 or later
- npm 10 or later
- Python 3.12 or later

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Additional commands:

```bash
npm run lint
npm run test
npm run typecheck
npm run build
```

### Languages and localization

The frontend supports English (LTR) and Arabic (RTL). Static translations live in `frontend/src/i18n/locales/`, and `frontend/src/i18n/index.ts` configures i18next with English as the fallback language. The selected language is stored locally in the browser; it does not change scientific data, API values, or units.

To add a language, add a locale JSON file, register it in `frontend/src/i18n/index.ts`, and add its direction-aware selector label. Keep API enums and official NASA dataset identifiers unchanged; translate only the user-facing label or explanation around them.

### Farm location

Farm location can be selected with browser GPS, a searchable global country/place flow, or manual coordinates. Scientific requests continue to use only latitude and longitude. Place search and optional GPS reverse-geocoding use the user-triggered, rate-limited Nominatim service with OpenStreetMap attribution; it is not used for autocomplete and can be changed with `VITE_GEOCODING_BASE_URL`.

## Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
uvicorn app.main:app --reload
```

Additional commands:

```bash
pytest
ruff check .
```

The local API health check is available at `http://127.0.0.1:8000/api/v1/health`.

## NASA SMAP soil-moisture context

The optional SMAP adapter uses the NSIDC DAAC SPL4SMGP Version 8 HDF5 product. With a locally configured Earthdata bearer token, it uses NASA CMR to discover one matching official V8 granule for the requested coordinates and date range; no manual granule URL is required. It reads the official `sm_surface` (0–5 cm) and `sm_rootzone` (0–100 cm) variables in `m3 m-3`, reporting them as 3-hourly, 9 km model/data-assimilation context—not field measurements. The source has a reported geolocation issue from 2026-05-14 through 2026-07-28; Standard data for that period are being reprocessed. See the [official NSIDC collection](https://nsidc.org/data/spl4smgp/versions/8).

Use only an uncommitted local `.env` for `NASA_EARTHDATA_TOKEN`; it takes precedence over the legacy `NASA_EARTHDATA_USERNAME`, `NASA_EARTHDATA_PASSWORD`, and `SMAP_GRANULE_URL` fallback. The backend reads the local root `.env` without overwriting environment-provided values. Never commit credentials.

## Demo snapshot mode

Set `ENABLE_DEMO_SNAPSHOTS=true` only for the documented judge-demo case: latitude `24.7`, longitude `47.3`, and `2025-01-01`. If a live POWER or SMAP request for that case fails, the backend returns the validated normalized sample in `data/samples/demo/nasa_demo_snapshot.json` with `source_status: DEMO_SNAPSHOT`; otherwise live success is `LIVE_DATA` and unavailable data is `UNAVAILABLE`. The snapshot contains five NASA POWER variables and SMAP V8 surface/root-zone moisture, captured from real NASA retrievals without credentials or raw granules. It is explicitly not live data. For an offline demo, start the backend with the flag enabled, use the documented location/date, and inspect the evidence view for provenance and limitations. Disable the flag for ordinary live-data use.

## Local soil and crop references

Local soil profiles support explicit source types and optional fields only; no suitability evaluation is performed. Curated crop identity/provenance records are in `data/reference/crops/`. Use `GET /api/v1/crops`, `GET /api/v1/crops/{crop_id}`, and `POST /api/v1/soil/profile/validate`.
