# FieldShift AI

FieldShift AI is an evidence-based crop-rotation decision-support project for the 2026 NASA International Space Apps Challenge, "Field Shift: Adapting Farms with NASA Data."

FieldShift AI is a globally scalable agricultural decision-support platform. It is not limited to Saudi Arabia: users may evaluate locations in any country where the required NASA environmental data and approved crop/soil reference information are available. Saudi Arabia / Al-Kharj may be used only as a demonstration or validation case.

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

The optional SMAP adapter uses the NSIDC DAAC SPL4SMGP Version 8 HDF5 product through a locally configured Earthdata Login and an authorized direct granule URL. It reads the official `sm_surface` (0–5 cm) and `sm_rootzone` (0–100 cm) variables in `m3 m-3`, reporting them as 3-hourly, 9 km model/data-assimilation context—not field measurements. The source has a reported geolocation issue from 2026-05-14 through 2026-07-28; Standard data for that period are being reprocessed. See the [official NSIDC collection](https://nsidc.org/data/spl4smgp/versions/8).

Use only an uncommitted local `.env` for `NASA_EARTHDATA_USERNAME`, `NASA_EARTHDATA_PASSWORD`, and `SMAP_GRANULE_URL`; never commit credentials.

## Local soil and crop references

Local soil profiles support explicit source types and optional fields only; no suitability evaluation is performed. Curated crop identity/provenance records are in `data/reference/crops/`. Use `GET /api/v1/crops`, `GET /api/v1/crops/{crop_id}`, and `POST /api/v1/soil/profile/validate`.
