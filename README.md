# FieldShift AI

FieldShift AI is an evidence-based crop-rotation decision-support project for the 2026 NASA International Space Apps Challenge, "Field Shift: Adapting Farms with NASA Data."

The current technical foundation contains no NASA API integration, scientific decision logic, crop datasets, or crop recommendations.

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

## Local soil and crop references

Local soil profiles support explicit source types and optional fields only; no suitability evaluation is performed. Curated crop identity/provenance records are in `data/reference/crops/`. Use `GET /api/v1/crops`, `GET /api/v1/crops/{crop_id}`, and `POST /api/v1/soil/profile/validate`.
