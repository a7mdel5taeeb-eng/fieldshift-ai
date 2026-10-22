# FieldShift AI

FieldShift AI is an evidence-based crop-rotation decision-support project for the 2026 NASA International Space Apps Challenge, "Field Shift: Adapting Farms with NASA Data."

FieldShift AI is a globally scalable agricultural decision-support platform. It is not limited to Saudi Arabia: users may evaluate locations in any country where the required NASA environmental data and approved crop/soil reference information are available. Saudi Arabia / Al-Kharj may be used only as a demonstration or validation case.

The documented product direction supports three future modes: **Analyze My Crop**, **Find Suitable Crops** (using only supported, sourced crop profiles), and **Plan Crop Rotation**. The current library contains eight sourced examples: alfalfa, barley, chickpea, lentil, maize, sorghum, soybean, and wheat. The library is not a global suitability guarantee. Economic feasibility is a future research layer and will only be shown where verified, location-, date-, currency-, and source-aware data exists; otherwise the product must report `ECONOMIC_DATA_UNAVAILABLE`.

The current application includes traceable NASA POWER context, an optional NASA SMAP SPL4SMGP Version 8 soil-moisture adapter, sourced crop profiles, factor-level soil suitability, and descriptive rotation sequences. It does not rank crop success or claim that a sequence is an agronomic recommendation.

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

The frontend uses `http://127.0.0.1:8000/api/v1` during local development. For a hosted frontend, serve the backend under the same origin at `/api/v1` or set `VITE_API_BASE_URL` in `frontend/.env.local` or the hosting build environment to a reachable backend URL. If the backend is on a different origin, add the frontend origin to the backend's comma-separated `FRONTEND_ORIGINS` setting. A static frontend deployment alone does not run the FastAPI analysis service.

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

The frontend has a **Use reference case** action and an editable observation date. The interface labels the status of POWER and SMAP separately; for a location outside the reference case, SMAP still requires a configured Earthdata token. A missing token now appears as a specific access message in the results instead of appearing as a missing measurement.

## Local soil and crop references

Local soil profiles support explicit source types and optional fields. The frontend offers the exact soil texture and drainage categories used by the curated FAO references, plus optional pH and a local salinity EC measurement in `dS/m`. The salinity comparison uses only the source's published classes where available; see `SCIENCE_METHOD.md`. Curated crop records are in `data/reference/crops/`. Use `GET /api/v1/crops`, `GET /api/v1/crops/{crop_id}`, and `POST /api/v1/soil/profile/validate`. Climate suitability remains unknown until a sourced local planting calendar and matching observation period are available; a single historical weather day is context, not a crop suitability assessment.
