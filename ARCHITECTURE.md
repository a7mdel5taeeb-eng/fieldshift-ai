# FieldShift AI — Technical Architecture Specification

**Status:** ACTIVE — ARCHITECTURE BASELINE v1.0  
**Event:** 2026 NASA International Space Apps Challenge  
**Challenge:** Field Shift: Adapting Farms with NASA Data  
**Architecture review date:** 2026-09-19

> This document converts the approved project rules, product requirements, data strategy, and scientific methodology into a concrete software architecture.
>
> `PROJECT_RULES.md` remains authoritative.
> `REQUIREMENTS.md`, `DATA_SOURCES.md`, and `SCIENCE_METHOD.md` define scope and scientific boundaries.
>
> This file does **not** authorize fabricated scientific logic, unverified datasets, invented crop values, or undocumented formulas.

---

# 1. Architecture Goal

FieldShift AI should be built as a transparent, modular decision-support platform where every important result can be traced from:

```text
USER INPUT
   +
NASA / EXTERNAL DATA
   ↓
NORMALIZED DATA MODELS
   ↓
SCIENTIFIC EVALUATION
   ↓
ROTATION SCENARIOS
   ↓
FARMER PREFERENCE LAYER
   ↓
EXPLANATION
   ↓
JUDGE / FARMER UI
```

The architecture must optimize for:

- scientific traceability;
- rapid hackathon development;
- modularity;
- testability;
- explainability;
- reproducibility;
- clear provenance;
- graceful failure;
- low operational complexity.

---

# 2. Recommended Technology Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- TanStack Query
- Zod for client-side schema validation
- MapLibre GL JS or Leaflet for map visualization
- Recharts for simple charts

### Decision

Use **MapLibre GL JS** if vector/raster overlays and future scientific map layers are important.

Use **Leaflet** only if MapLibre creates unnecessary implementation complexity.

Initial preference:

`MapLibre GL JS`

---

## Backend

- Python 3.12+
- FastAPI
- Pydantic v2
- httpx
- pandas
- NumPy
- xarray only when justified by a NASA data product
- rasterio / rioxarray only when raster products require them

Do not install geospatial/scientific packages until they are needed.

---

## Storage

### MVP

Use a deliberately simple storage model:

- curated crop reference data: version-controlled JSON/YAML/CSV
- local demo snapshots: version-controlled metadata + cached sample data where licensing and size permit
- runtime scientific cache: SQLite or filesystem cache
- user session data: browser/local runtime only unless persistence becomes necessary

### Later / production-scale option

- PostgreSQL
- PostGIS

PostgreSQL/PostGIS is **not required for the initial MVP** unless a real requirement emerges.

---

## Testing

### Backend

- pytest
- pytest-asyncio when required
- httpx FastAPI test client
- hypothesis only where property-based testing clearly adds value

### Frontend

- Vitest
- React Testing Library
- Playwright for critical end-to-end workflows

---

## Development Quality

- Ruff
- Black or Ruff formatting
- mypy or Pyright
- ESLint
- Prettier
- TypeScript strict mode

---

# 3. Architectural Style

Use a modular monorepo with clear boundaries.

Recommended structure:

```text
fieldshift-ai/
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── features/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── schemas/
│   │   ├── types/
│   │   └── utils/
│   └── tests/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── adapters/
│   │   ├── science/
│   │   ├── repositories/
│   │   ├── provenance/
│   │   └── utils/
│   └── tests/
│
├── data/
│   ├── reference/
│   ├── cache/
│   ├── samples/
│   └── schemas/
│
├── notebooks/
├── docs/
├── tests/
├── presentation/
│
├── PROJECT_RULES.md
├── REQUIREMENTS.md
├── DATA_SOURCES.md
├── SCIENCE_METHOD.md
├── ARCHITECTURE.md
├── AI_USAGE.md
├── TODO.md
└── README.md
```

---

# 4. High-Level System Diagram

```text
┌─────────────────────────────┐
│        FARMER / JUDGE       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      React / TypeScript     │
│                             │
│ Map • Inputs • Charts       │
│ Scenario Comparison         │
│ Evidence • Explanations     │
└──────────────┬──────────────┘
               │ HTTPS / JSON
               ▼
┌─────────────────────────────┐
│          FastAPI API        │
└──────────────┬──────────────┘
               │
      ┌────────┼───────────┐
      │        │           │
      ▼        ▼           ▼
┌─────────┐ ┌─────────┐ ┌──────────────┐
│ Data    │ │ Science │ │ Scenario     │
│ Service │ │ Engine  │ │ Engine       │
└────┬────┘ └────┬────┘ └──────┬───────┘
     │           │              │
     │           └──────┬───────┘
     │                  ▼
     │          ┌───────────────┐
     │          │ Explanation   │
     │          │ Builder       │
     │          └───────────────┘
     │
     ▼
┌─────────────────────────────────────┐
│         Source Adapter Layer        │
│                                     │
│ POWER • SMAP • Local Soil • Crops  │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│ Cache / Reference Data / Provenance │
└─────────────────────────────────────┘
```

---

# 5. Core Architectural Rule

External datasets and APIs must never be consumed directly by the scientific decision code.

Use this pattern:

```text
EXTERNAL SOURCE
      ↓
SOURCE ADAPTER
      ↓
NORMALIZED DOMAIN MODEL
      ↓
SCIENCE ENGINE
```

Bad:

```text
science_engine.py
  → direct HTTP request to NASA POWER
```

Good:

```text
PowerAdapter
  → ClimateObservation[]
  → ScienceEngine
```

This separation is mandatory.

---

# 6. Core Domain Models

The backend should work with normalized domain objects.

These are conceptual schemas.

Exact fields must be refined before implementation.

---

## 6.1 Location

```text
Location

latitude
longitude
display_name
country
region
source
```

Rules:

- latitude range: -90 to +90
- longitude range: -180 to +180
- coordinates are required for NASA-source requests

---

## 6.2 FarmProfile

```text
FarmProfile

location
current_crop
planning_horizon
irrigation_context
soil_profile
farmer_priorities
```

Do not add unsupported fields simply for UI richness.

---

## 6.3 SoilProfile

```text
SoilProfile

source_type
measurement_date
depth
texture
pH
salinity
organic_matter
nitrogen
phosphorus
potassium
drainage
water_holding_capacity
provenance[]
```

All fields are optional until required by an approved scientific method.

---

## 6.4 ClimateObservation

```text
ClimateObservation

source
source_dataset
variable
value
unit
timestamp
latitude
longitude
spatial_resolution
temporal_resolution
quality
provenance
```

---

## 6.5 SoilMoistureObservation

```text
SoilMoistureObservation

source
dataset
layer
value
unit
timestamp
latitude
longitude
spatial_resolution
quality
provenance
```

`layer` may distinguish:

- surface
- root_zone

---

## 6.6 CropProfile

```text
CropProfile

id
common_name
scientific_name
family

climate_requirements
soil_requirements
water_requirements
rotation_traits

sources[]
review_status
```

No field may be populated from model memory alone.

---

## 6.7 FarmerPriorities

```text
FarmerPriorities

water_conservation
soil_health
resilience
productivity
other_approved_dimensions
```

Weights or priority values must be visible to the user.

---

## 6.8 RotationScenario

```text
RotationScenario

id
periods[]
crop_ids[]
generation_method
source_rules[]
```

---

## 6.9 ScientificScenarioProfile

```text
ScientificScenarioProfile

scenario_id

climate_assessment
soil_assessment
water_context
rotation_assessment

limiting_factors[]
benefits[]
risks[]
unknowns[]
uncertainties[]

evidence[]
```

---

## 6.10 PreferenceAdjustedResult

```text
PreferenceAdjustedResult

scenario_id
scientific_profile
farmer_priorities
preference_method
preference_result
explanation
```

Scientific evidence must remain unchanged when user weights change.

---

# 7. Provenance Model

Every decision-relevant value must carry provenance.

Recommended shape:

```text
ProvenanceRecord

source_name
source_type
dataset_or_reference
url
citation
retrieved_at
observation_time
license
spatial_resolution
temporal_resolution
processing_steps[]
quality_notes[]
```

The backend must be able to answer:

```text
Where did this number come from?
```

without relying on developer memory.

---

# 8. NASA Source Adapter Architecture

Adapters must live in:

```text
backend/app/adapters/
```

Initial candidates:

```text
power_adapter.py
smap_adapter.py
hls_adapter.py
gpm_adapter.py
```

Only POWER and SMAP belong in the first implementation wave.

HLS and GPM remain inactive until explicitly approved.

---

# 9. POWER Adapter

Responsibility:

- construct valid POWER API requests;
- verify requested parameters;
- retrieve climate data;
- normalize units where explicitly defined;
- preserve raw metadata;
- convert responses into `ClimateObservation`;
- cache responses;
- return structured errors.

The adapter must NOT:

- decide crop suitability;
- rank scenarios;
- interpret agronomic meaning;
- fabricate missing values.

---

# 10. SMAP Adapter

Responsibility:

- retrieve approved SMAP product data;
- handle Earthdata authentication if required;
- extract location/time-relevant values;
- preserve quality metadata;
- normalize into `SoilMoistureObservation`;
- cache data;
- expose resolution/limitations.

The adapter must be designed so a known problematic date range can be blocked or flagged.

Do not hide known source-quality warnings.

---

# 11. Local Soil Adapter

Local soil information may come from:

- user input;
- uploaded structured record in a later phase;
- curated demo profile;
- validated external source.

Implement a normalized interface so all sources produce:

```text
SoilProfile
```

The source type must always remain visible.

---

# 12. Crop Repository

Initial crop knowledge should not require a database server.

Recommended approach:

```text
data/reference/crops/
  wheat.yaml
  barley.yaml
  chickpea.yaml
  ...
```

or JSON.

Each crop record must contain:

- source references;
- review status;
- data provenance;
- scientific name;
- family;
- approved requirement fields.

Benefits:

- easy review;
- easy Git versioning;
- reproducible;
- judge-friendly;
- no database dependency.

---

# 13. Science Engine

Location:

```text
backend/app/science/
```

Suggested modules:

```text
climate.py
soil.py
water.py
rotation.py
uncertainty.py
suitability.py
```

The Science Engine receives normalized data.

It must never contain:

- HTTP clients;
- API keys;
- UI logic;
- direct database queries.

---

# 14. Suitability Engine

Conceptual interface:

```text
evaluate_crop(
    crop_profile,
    climate_context,
    soil_profile
) -> CropSuitabilityAssessment
```

Initial output should emphasize:

- suitability classes;
- limiting factors;
- unknowns;
- evidence.

Do not force a single percentage score in v1.

---

# 15. Rotation Engine

Location:

```text
backend/app/science/rotation.py
```

Responsibilities:

- represent candidate sequences;
- apply approved rotation constraints;
- detect repeated crop/family patterns;
- expose diversity descriptors;
- expose documented benefits and risks.

The engine must NOT invent pairwise crop compatibility.

---

# 16. Scenario Generator

Separate scenario generation from scenario evaluation.

Suggested service:

```text
backend/app/services/scenario_generator.py
```

Purpose:

- generate combinations from approved candidate crops;
- respect planning horizon;
- apply hard constraints only when scientifically approved;
- prevent impossible duplicates if rules prohibit them.

Generation does not equal recommendation.

---

# 17. Scenario Evaluation Service

Suggested service:

```text
backend/app/services/scenario_evaluator.py
```

Pipeline:

```text
RotationScenario
   ↓
individual crop assessments
   ↓
rotation assessment
   ↓
water/environment context
   ↓
uncertainty
   ↓
ScientificScenarioProfile
```

---

# 18. Farmer Preference Layer

Suggested module:

```text
backend/app/services/preference_service.py
```

Input:

- scientifically plausible scenarios;
- explicit user priorities.

Output:

- preference-adjusted comparison.

The preference layer must be isolated from the Science Engine.

That separation allows the system to show:

> "Scientifically, scenarios A and B are both plausible.
> Because you prioritized water conservation, A is shown first."

This is preferable to pretending A is universally "better."

---

# 19. Explanation Layer

Suggested service:

```text
backend/app/services/explanation_service.py
```

Version 1 should be deterministic and template-based.

Example:

```text
"This scenario is shown as suitable because the selected crops match
the evaluated temperature and soil ranges. Root-zone moisture evidence
indicates persistent dry conditions. The sequence includes crop-family
diversification. Water conservation was your highest priority."
```

This explanation must be built from structured evidence.

---

# 20. Generative AI Architecture

Generative AI is **optional** and must not be required for the core demo.

If added:

```text
Structured Scientific Result
          ↓
AI Explanation Adapter
          ↓
Plain-Language Explanation
```

Never:

```text
Raw User Prompt
       ↓
AI
       ↓
Crop Recommendation
```

AI failure must not break the scientific workflow.

---

# 21. Backend API Design

Use versioned endpoints.

Base:

```text
/api/v1
```

Recommended initial endpoints:

```text
GET  /health
GET  /meta

POST /locations/validate

GET  /crops
GET  /crops/{crop_id}

POST /environment/context
POST /soil/profile/validate

POST /scenarios/generate
POST /scenarios/evaluate
POST /scenarios/compare

GET  /sources
GET  /sources/{source_id}
```

Optional later:

```text
POST /reports
POST /explanations
```

---

# 22. API Contract Principle

Each API response should contain:

```text
data
provenance
warnings
limitations
errors
```

when relevant.

Scientific endpoints must not return unexplained bare numbers.

---

# 23. Example API Error Model

```text
{
  "error": {
    "code": "NASA_DATA_UNAVAILABLE",
    "message": "...",
    "source": "NASA POWER",
    "retryable": true
  }
}
```

Other useful codes:

```text
INVALID_LOCATION
INSUFFICIENT_EVIDENCE
CROP_NOT_SUPPORTED
SOIL_DATA_INCOMPLETE
SOURCE_AUTH_FAILED
SOURCE_RATE_LIMITED
SOURCE_QUALITY_WARNING
SCIENCE_METHOD_NOT_AVAILABLE
```

---

# 24. External Failure Strategy

If NASA POWER fails:

- show source unavailable;
- use cache if valid;
- do not synthesize weather.

If SMAP fails:

- climate analysis may continue;
- moisture evidence is marked unavailable.

If optional AI fails:

- deterministic explanation remains available.

The system should degrade gracefully.

---

# 25. Cache Architecture

NASA APIs must not be repeatedly called for identical requests.

Recommended cache key:

```text
source
dataset
latitude_grid_or_point
longitude_grid_or_point
parameters
date_range
version
```

Cache metadata must include:

- created_at;
- source;
- original request;
- source version;
- expiry policy.

---

# 26. Demo Snapshot Mode

For hackathon judging, support a reproducible demo mode.

Purpose:

- avoid live API outages;
- avoid rate limits;
- preserve exact evidence;
- allow offline presentation if necessary.

Architecture:

```text
LIVE SOURCE
     ↓
validated fetch
     ↓
snapshot
     ↓
DEMO CACHE
```

Demo snapshots must still preserve the original NASA provenance.

Do not fabricate sample scientific data.

---

# 27. Configuration

Use environment variables for:

- API credentials;
- NASA Earthdata credentials;
- API base URLs;
- cache directory;
- feature flags;
- optional AI provider configuration.

Provide:

```text
.env.example
```

Never commit:

```text
.env
credentials
tokens
secrets
```

---

# 28. Frontend Architecture

Use feature-oriented organization.

Recommended:

```text
frontend/src/features/
  location/
  farm-profile/
  soil/
  crops/
  priorities/
  environment/
  scenarios/
  comparison/
  evidence/
  explanation/
```

Avoid a giant global components folder with business logic mixed into generic UI.

---

# 29. Core Pages

Initial product flow:

```text
/
  Landing / Challenge introduction

/analyze
  Guided farm setup

/environment
  NASA environmental context

/scenarios
  Generated crop-rotation scenarios

/compare
  Scenario comparison

/evidence
  Data sources and scientific evidence
```

A multi-step single-page workflow is also acceptable if it improves demo speed.

---

# 30. Recommended Judge Demo UX

Prefer a guided workflow:

```text
STEP 1
Select location

STEP 2
Farm & soil context

STEP 3
Candidate crops

STEP 4
Farmer priorities

STEP 5
NASA environmental evidence

STEP 6
Rotation scenarios

STEP 7
Compare

STEP 8
Why?
```

A judge should reach the main result in approximately 1–2 minutes.

---

# 31. Map Design

The map should serve a scientific purpose.

It may show:

- selected farm location;
- NASA data coverage/context;
- HLS layer later;
- approximate source resolution.

Do not add a map merely for visual appeal.

The UI should make coarse-vs-fine data scale understandable.

---

# 32. Chart Strategy

Initial charts should be simple:

- temperature over time;
- precipitation over time;
- soil moisture over time;
- historical vs recent context.

Charts must include:

- units;
- source;
- date range;
- warnings/limitations where needed.

Avoid 3D or decorative charts.

---

# 33. Scenario Comparison UI

Recommended card/table structure:

```text
Scenario A
Wheat → Legume → Barley

Climate
Soil
Water Context
Rotation Diversity
Limiting Factors
Evidence Completeness
Farmer Preference Match
```

Do not show unsupported numeric precision.

---

# 34. Evidence Drawer / Panel

Every major result should have:

```text
View Evidence
```

The evidence panel should show:

- source;
- variable;
- time range;
- spatial scale;
- source link;
- transformation;
- known limitations.

This is a key NASA judging feature.

---

# 35. State Management

Prefer:

- TanStack Query for server state;
- local React state for UI controls;
- URL state where it improves reproducibility/shareability.

Do not introduce Redux unless complexity actually requires it.

---

# 36. Frontend Validation

Use Zod for user-input validation.

Validation messages should distinguish:

- invalid;
- missing;
- scientifically unavailable.

Example:

Bad:

`Error`

Better:

`Soil pH was not provided. This factor will not be evaluated.`

---

# 37. Accessibility

Minimum expectations:

- keyboard usable;
- semantic HTML;
- visible focus;
- sufficient contrast;
- charts not dependent only on color;
- meaningful labels;
- responsive layout.

---

# 38. Internationalization

English is the primary project language for NASA judging.

Architecture should not block future localization.

Do not build multilingual content in the initial MVP unless time permits.

---

# 39. Backend Layering

Recommended dependency flow:

```text
API
 ↓
Services
 ↓
Science / Domain
 ↓
Repositories / Adapters
```

Do not create circular dependencies.

---

# 40. Dependency Direction

Allowed:

```text
API → Services
Services → Science
Services → Adapters
Science → Domain Models
Adapters → Domain Models
```

Avoid:

```text
Science → API
Science → HTTP client
Science → React/UI
```

---

# 41. Repository Pattern

Use repositories only where they simplify testability.

Examples:

```text
CropRepository
CacheRepository
```

Do not build enterprise-style abstraction layers with no real need.

---

# 42. Logging

Backend logs should include:

- request identifier;
- source adapter;
- retrieval status;
- cache hit/miss;
- warnings;
- failures.

Never log:

- credentials;
- tokens;
- sensitive user information.

---

# 43. Scientific Audit Trail

For each evaluated scenario, preserve:

```text
input snapshot
source versions
retrieval times
scientific method version
crop record versions
warnings
limitations
result
```

For MVP, this may be returned in response metadata rather than persisted permanently.

---

# 44. Method Versioning

Scientific methods should eventually expose a version identifier:

```text
method_version: "science-v1"
```

If formulas change later, results remain traceable to the method used.

---

# 45. Crop Data Versioning

Every curated crop record should include:

```text
record_version
reviewed_at
source_ids
```

This prevents invisible scientific changes.

---

# 46. Testing Architecture

Tests should mirror architecture boundaries.

Example:

```text
backend/tests/
  unit/
    science/
    services/
    adapters/
  integration/
    api/
    adapters/
  fixtures/

frontend/tests/
  unit/
  integration/
  e2e/
```

---

# 47. Unit Tests

Required areas:

- input validation;
- data normalization;
- unit conversions;
- suitability factor logic;
- rotation rule logic;
- uncertainty propagation;
- provenance preservation.

---

# 48. Adapter Contract Tests

Each source adapter should have contract tests verifying:

- response parsing;
- missing data handling;
- error handling;
- provenance mapping;
- unit extraction;
- quality warning extraction.

Use saved fixtures where live APIs would make tests unstable.

---

# 49. Integration Tests

Important integration flows:

```text
Location
→ NASA data adapters
→ normalized observations
→ scientific context
```

and:

```text
Farm profile
→ scenario generation
→ evaluation
→ comparison
```

---

# 50. End-to-End Test

At least one automated judge-style workflow should eventually exist:

```text
Select demo location
→ enter soil
→ choose crops
→ priorities
→ generate scenarios
→ compare
→ inspect evidence
```

---

# 51. Golden Scientific Tests

The golden cases defined in `SCIENCE_METHOD.md` should be stored as fixtures.

Recommended:

```text
tests/fixtures/golden_cases/
```

Code changes must not alter approved expected classifications without explicit review.

---

# 52. Security Architecture

MVP security requirements:

- no secrets in repository;
- strict input validation;
- restricted outbound requests;
- safe error messages;
- CORS configured explicitly;
- upload support disabled until required;
- no arbitrary code execution;
- no user-auth requirement for MVP.

---

# 53. Authentication

Authentication is out of scope for MVP.

A hackathon judge should not need to create an account.

If later added, it must not block the public demo workflow.

---

# 54. Data Privacy

Avoid collecting personal information.

The scientific workflow should only require:

- approximate farm location;
- soil/crop context;
- priorities.

Do not ask for names, phone numbers, or identity unless a future feature truly requires them.

---

# 55. Performance Budget

Targets should remain pragmatic.

Suggested MVP goals:

- frontend first meaningful render: fast on normal broadband;
- cached scenario workflow: a few seconds;
- live NASA requests: display progress and source status;
- heavy data processing: asynchronous only if required.

Do not optimize prematurely.

---

# 56. Background Jobs

Do not introduce Celery/Redis initially.

If a scientific process later takes too long, consider:

- FastAPI background tasks;
- a lightweight job abstraction;
- then a queue only if truly necessary.

---

# 57. Database Decision Rule

Do not add PostgreSQL simply because it is "professional."

Add a database server only if the product needs:

- persistent user projects;
- many stored analyses;
- complex geographic querying;
- collaboration;
- large indexed datasets.

For MVP, filesystem + SQLite/cache + curated files is sufficient.

---

# 58. Deployment Strategy

Preferred MVP deployment:

## Frontend

Static hosting platform.

Examples:

- Vercel
- Netlify
- Cloudflare Pages

## Backend

Container-friendly Python hosting.

Examples:

- Render
- Railway
- Fly.io
- comparable service

Final provider selection is not locked by this document.

---

# 59. Docker

Docker is recommended for reproducibility after the first working local version exists.

Do not let Docker setup delay the scientific MVP.

Eventually provide:

```text
Dockerfile
docker-compose.yml
```

only if useful.

---

# 60. CI Architecture

After core setup, GitHub Actions should run:

```text
backend lint
backend type-check
backend tests
frontend lint
frontend type-check
frontend tests
```

Later:

```text
e2e smoke test
```

---

# 61. Git Branch Strategy

Keep branching simple.

Recommended:

```text
main
feature/*
fix/*
docs/*
science/*
data/*
```

Avoid complicated release-flow branching during hackathon development.

---

# 62. Commit Convention

Recommended prefixes:

```text
feat:
fix:
docs:
science:
data:
test:
refactor:
chore:
```

Examples:

```text
data: add POWER adapter contract
science: add crop limiting-factor evaluation
feat: add scenario comparison page
test: add golden climate suitability fixture
```

---

# 63. Feature Flags

Optional scientific layers should be feature-flagged.

Potential flags:

```text
ENABLE_SMAP
ENABLE_HLS
ENABLE_GPM
ENABLE_AI_EXPLANATIONS
ENABLE_DEMO_SNAPSHOTS
```

This protects the core demo from optional integration failures.

---

# 64. Architecture Milestones

## Milestone A — Foundation

- frontend skeleton
- backend skeleton
- health endpoint
- lint/test configuration
- environment configuration

No scientific logic yet.

---

## Milestone B — Domain Models

Implement validated schemas for:

- location
- soil
- crop
- observations
- scenarios
- provenance

---

## Milestone C — POWER Integration

Implement:

- adapter
- normalization
- caching
- tests
- sample retrieval

---

## Milestone D — Local Soil + Crop Repository

Implement:

- soil input model
- curated crop records
- provenance

---

## Milestone E — SMAP Integration

Implement:

- approved data access
- normalization
- quality warnings
- caching
- tests

---

## Milestone F — Scientific Suitability

Implement only approved methods from `SCIENCE_METHOD.md`.

Start with:

- factor-level classifications
- limiting factors
- unknown handling

---

## Milestone G — Rotation Engine

Implement:

- scenario representation
- diversity descriptors
- sourced constraints only

---

## Milestone H — Preference Layer

Implement explicit user-priority aggregation.

No hidden default scientific weights.

---

## Milestone I — Frontend Decision Flow

Build:

- location
- farm context
- soil
- crops
- priorities
- scenarios
- comparison
- evidence

---

## Milestone J — Judge Demo

Add:

- demo snapshot
- polished evidence panel
- explanation
- limitations
- reproducible scenario

---

## Milestone K — Optional Enhancements

Only if time remains:

- HLS
- GPM
- AI explanation
- report export
- multilingual UI

---

# 65. MVP Architecture Definition

The MVP is architecturally complete when:

```text
User selects a location
        ↓
POWER data is retrieved or loaded from valid cache
        ↓
Local soil profile is available
        ↓
Supported crop profiles are loaded
        ↓
Candidate rotation scenarios are generated
        ↓
Scientific suitability is evaluated
        ↓
SMAP moisture context is included if available
        ↓
Farmer priorities adjust scenario ordering
        ↓
Scenarios are compared
        ↓
Evidence and limitations are visible
```

---

# 66. Non-Goals

Do not architect for:

- millions of users;
- enterprise tenancy;
- blockchain;
- microservices;
- Kubernetes;
- event streaming;
- complex authentication;
- payment systems;
- autonomous farming control.

These do not improve NASA challenge performance.

---

# 67. Monolith Decision

Use a **modular monolith**.

One frontend.

One backend.

Internal modules with strong boundaries.

This is the correct level of complexity for the challenge.

Do not split adapters/science into independent services.

---

# 68. Scientific Reproducibility

A demo result should eventually be reproducible using:

```text
location
farm input
crop data version
NASA source/version
date range
science method version
farmer priorities
```

---

# 69. Raw Data Policy

Do not commit large raw NASA datasets to Git.

Allowed:

- tiny test fixtures;
- small licensed demo samples;
- metadata;
- checksums;
- provenance records.

Large source data belongs outside Git.

---

# 70. Generated Data Policy

Derived data must record:

- generating method;
- input source IDs;
- method version;
- generation timestamp.

---

# 71. Unit Policy

Use explicit units everywhere.

Never assume a number's unit based on variable name.

Internally choose consistent units only after verifying source units.

Conversions must be tested.

---

# 72. Time Policy

Use ISO 8601 timestamps.

Preserve source timezone/UTC meaning.

Do not silently shift dates.

Agricultural seasons must eventually be location-aware.

---

# 73. Coordinate Policy

Use WGS84 latitude/longitude for normalized location input unless a source requires transformation.

Any transformation must be explicit and tested.

---

# 74. Scientific Error vs Technical Error

Separate:

## Technical error

Example:

NASA API unavailable.

## Scientific insufficiency

Example:

soil salinity unknown.

The UI should communicate these differently.

---

# 75. Frontend Scientific Status Types

Recommended UI statuses:

```text
AVAILABLE
PARTIAL
UNAVAILABLE
UNKNOWN
LIMITING
MARGINAL
SUITABLE
NOT_EVALUATED
```

Exact scientific meanings come from `SCIENCE_METHOD.md`.

---

# 76. Data Freshness

Each external observation must expose:

- observation time;
- retrieval time.

The user should be able to tell whether data is recent or historical.

---

# 77. Offline Demo Readiness

Before submission weekend, the core demo must work from validated cached snapshots.

Live mode should enhance the demo, not determine whether the demo works at all.

---

# 78. Architecture Review Gate

Before Codex begins implementation:

1. `PROJECT_RULES.md` approved
2. `REQUIREMENTS.md` approved
3. `DATA_SOURCES.md` approved
4. `SCIENCE_METHOD.md` approved
5. `ARCHITECTURE.md` approved
6. `TODO.md` updated with implementation milestones

Only then should framework installation and code generation begin.

---

# 79. First Implementation Package

When implementation starts, the first coding task should be small:

```text
Initialize:
- React/Vite/TypeScript frontend
- FastAPI backend
- health endpoint
- base config
- linting
- formatting
- test skeleton

No NASA API integration.
No science engine.
No crop logic.
```

This establishes the technical foundation safely.

---

# 80. Second Implementation Package

Then implement domain schemas only:

```text
Location
ProvenanceRecord
ClimateObservation
SoilProfile
CropProfile
FarmerPriorities
RotationScenario
```

Still no scientific formulas.

---

# 81. Third Implementation Package

Then implement POWER adapter.

Only after:

- live parameter names verified;
- a sample request tested;
- response units confirmed.

---

# 82. Architectural Definition of Done

A technical feature is complete only when:

- architecture boundary respected;
- types/schema defined;
- validation implemented;
- errors handled;
- provenance preserved;
- tests added;
- docs updated;
- no scientific assumption added;
- no secret added;
- no unrelated files modified.

---

# 83. Final Architecture Principle

FieldShift AI should remain:

```text
SMALL ENOUGH TO FINISH
MODULAR ENOUGH TO GROW
SCIENTIFIC ENOUGH TO TRUST
TRANSPARENT ENOUGH TO EXPLAIN
ROBUST ENOUGH TO DEMO
```

The architecture must support the challenge story:

```text
NASA DATA
   +
LOCAL FARM CONTEXT
   +
CROP SCIENCE
   +
FARMER PRIORITIES
        ↓
EXPLAINABLE ROTATION DECISIONS
```

That story is more important than technical complexity.
