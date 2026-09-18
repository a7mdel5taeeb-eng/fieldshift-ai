# FieldShift AI — Implementation Roadmap & TODO

**Status:** ACTIVE — EXECUTION PLAN v1.0  
**Event:** 2026 NASA International Space Apps Challenge  
**Challenge:** Field Shift: Adapting Farms with NASA Data  
**Last updated:** 2026-09-19

> This file converts the approved project governance, requirements, data strategy, scientific methodology, and architecture into an executable development roadmap.
>
> `PROJECT_RULES.md` is authoritative.
>
> Codex must work on **one approved milestone at a time** and must not silently start later milestones.

---

# 1. Execution Rules

Before every implementation task, Codex must read:

1. `PROJECT_RULES.md`
2. `REQUIREMENTS.md`
3. `DATA_SOURCES.md`
4. `SCIENCE_METHOD.md`
5. `ARCHITECTURE.md`
6. `TODO.md`

For each task:

```text
READ
→ PLAN
→ IMPLEMENT
→ TEST
→ DOCUMENT
→ REPORT
→ STOP
```

Do not continue to the next milestone without explicit approval.

---

# 2. Status Vocabulary

Use only these statuses:

- `NOT_STARTED`
- `IN_PROGRESS`
- `BLOCKED`
- `RESEARCH_REQUIRED`
- `READY_FOR_REVIEW`
- `DONE`
- `DEFERRED`
- `PENDING_OFFICIAL_2026_CONFIRMATION`

---

# 3. Global Definition of Done

A task is complete only when, where applicable:

- implementation matches approved architecture;
- no project rule is violated;
- validation exists;
- tests pass;
- provenance is preserved;
- errors are handled;
- documentation is updated;
- no secrets are committed;
- no scientific assumption is invented;
- Git status is reviewed;
- only intended files changed.

---

# 4. Milestone Overview

```text
M00 Governance & Research Baseline        DONE
M01 Technical Foundation                 NOT_STARTED
M02 Core Domain Models                   NOT_STARTED
M03 NASA POWER Integration               NOT_STARTED
M04 Local Soil + Crop Reference Layer    NOT_STARTED
M05 NASA SMAP Integration                NOT_STARTED
M06 Scientific Suitability Engine        RESEARCH_REQUIRED
M07 Rotation Scenario Engine             RESEARCH_REQUIRED
M08 Farmer Preference Layer              NOT_STARTED
M09 Frontend Decision Workflow           NOT_STARTED
M10 Evidence & Explainability             NOT_STARTED
M11 Demo Snapshot & Reliability           NOT_STARTED
M12 Validation & Golden Cases             NOT_STARTED
M13 Submission Preparation                NOT_STARTED
M14 Optional Enhancements                 DEFERRED
```

---

# 5. M00 — Governance & Research Baseline

**Status:** DONE

Completed:

- Git repository initialized
- GitHub repository created
- `PROJECT_RULES.md`
- `REQUIREMENTS.md`
- `DATA_SOURCES.md`
- `SCIENCE_METHOD.md`
- `ARCHITECTURE.md`
- initial governance/science commits
- primary branch renamed to `main`
- GitHub `origin` configured

Repository:

`https://github.com/a7mdel5taeeb-eng/fieldshift-ai`

---

# 6. M01 — Technical Foundation

**Status:** DONE

## Objective

Create the minimal working technical skeleton.

No NASA integration.
No scientific logic.
No crop recommendation logic.

## Tasks

### M01-T01 — Frontend Initialization

Create:

- React
- TypeScript
- Vite

Requirements:

- TypeScript strict mode
- clean base project
- remove unnecessary demo boilerplate
- preserve approved repository structure

Status:

`DONE`

---

### M01-T02 — Frontend Styling Foundation

Add:

- Tailwind CSS
- basic global styles
- accessible typography foundation
- responsive layout foundation

Do not create final visual design yet.

Status:

`DONE`

---

### M01-T03 — Frontend Quality Tools

Configure:

- ESLint
- Prettier
- Vitest
- React Testing Library

Status:

`DONE`

---

### M01-T04 — Backend Initialization

Create FastAPI backend with:

- application entry point
- `/api/v1/health`
- `/api/v1/meta`

No scientific endpoints yet.

Status:

`DONE`

---

### M01-T05 — Backend Environment

Configure:

- Python environment
- FastAPI
- Uvicorn
- Pydantic
- httpx
- pytest
- Ruff

Only install dependencies required for foundation.

Status:

`DONE`

---

### M01-T06 — Environment Configuration

Create:

- `.env.example`
- safe environment loading pattern
- feature flag placeholders

No credentials.

Status:

`DONE`

---

### M01-T07 — Basic CORS

Configure CORS for local frontend/backend development only.

Avoid permissive production assumptions.

Status:

`DONE`

---

### M01-T08 — Foundation Tests

Required tests:

- backend health endpoint
- backend meta endpoint
- frontend smoke test

Status:

`DONE`

---

### M01-T09 — Foundation Documentation

Update:

- `README.md`
- local development instructions
- frontend start command
- backend start command
- test commands

Status:

`DONE`

---

### M01-T10 — Foundation Git Checkpoint

Before commit:

- tests pass
- lint passes
- type checks pass
- working tree reviewed

Commit message:

```text
chore: initialize FieldShift AI application foundation
```

Status:

`DONE`

---

## M01 Definition of Done

The milestone is DONE only when:

```text
frontend starts
backend starts
GET /api/v1/health returns success
GET /api/v1/meta returns project metadata
frontend test passes
backend tests pass
lint passes
no scientific logic exists
no NASA API calls exist
no secrets exist
```

---

# 7. M02 — Core Domain Models

**Status:** NOT_STARTED

## Objective

Implement normalized typed schemas before external integrations.

## Tasks

### M02-T01 — Location Model

Implement:

- latitude
- longitude
- display name
- country / region optional metadata

Validate coordinate ranges.

Status:

`NOT_STARTED`

---

### M02-T02 — ProvenanceRecord

Implement normalized provenance schema.

Fields should support:

- source
- dataset
- citation
- URL
- retrieval timestamp
- observation timestamp
- spatial resolution
- temporal resolution
- processing steps
- quality notes

Status:

`NOT_STARTED`

---

### M02-T03 — ClimateObservation

Implement normalized environmental observation schema.

Status:

`NOT_STARTED`

---

### M02-T04 — SoilMoistureObservation

Support:

- surface
- root-zone

Status:

`NOT_STARTED`

---

### M02-T05 — SoilProfile

All scientific fields optional until approved method requires them.

Status:

`NOT_STARTED`

---

### M02-T06 — CropProfile

Include:

- identity
- scientific name
- family
- requirement containers
- source IDs
- review status

No actual crop values yet.

Status:

`NOT_STARTED`

---

### M02-T07 — FarmerPriorities

Implement structure only.

No default scientific weights.

Status:

`NOT_STARTED`

---

### M02-T08 — RotationScenario

Implement sequence model.

Status:

`NOT_STARTED`

---

### M02-T09 — ScientificScenarioProfile

Implement result structure without invented scoring.

Status:

`NOT_STARTED`

---

### M02-T10 — Schema Tests

Test:

- validation
- serialization
- missing values
- invalid coordinates
- provenance preservation

Status:

`NOT_STARTED`

---

## M02 Definition of Done

All core domain models exist and pass tests.

No external API calls.
No scientific scoring.

---

# 8. M03 — NASA POWER Integration

**Status:** NOT_STARTED

## Objective

Build the first real NASA data connection.

## Research Gate

Before coding:

- verify live POWER API base URL;
- verify current parameter names;
- verify units;
- verify request limits;
- verify daily endpoint behavior;
- verify one candidate demo location.

Do not use model-memory parameter names without verification.

---

### M03-T01 — POWER Research Note

Record verified:

- endpoint
- parameters
- units
- response format
- date handling
- known limits

Update `DATA_SOURCES.md` only if corrections are required.

Status:

`NOT_STARTED`

---

### M03-T02 — PowerAdapter

Implement adapter under:

```text
backend/app/adapters/
```

Responsibilities:

- request construction
- retrieval
- parsing
- normalized output
- structured errors
- provenance
- caching interface

Status:

`NOT_STARTED`

---

### M03-T03 — POWER Fixtures

Create tiny saved response fixtures for tests.

Do not commit large NASA datasets.

Status:

`NOT_STARTED`

---

### M03-T04 — POWER Adapter Tests

Test:

- successful parse
- invalid location
- missing variable
- source failure
- unit metadata
- provenance

Status:

`NOT_STARTED`

---

### M03-T05 — Environment Context Endpoint

Create:

```text
POST /api/v1/environment/context
```

Initial endpoint may expose raw normalized climate context only.

No crop recommendations.

Status:

`NOT_STARTED`

---

### M03-T06 — POWER UI Prototype

Display:

- selected location
- date range
- temperature
- precipitation
- source
- units
- limitations

Status:

`NOT_STARTED`

---

## M03 Definition of Done

A judge/developer can select a valid location and retrieve traceable NASA POWER environmental context.

---

# 9. M04 — Local Soil + Crop Reference Layer

**Status:** NOT_STARTED

## Objective

Build the non-NASA inputs required by the challenge.

---

### M04-T01 — Soil Input Schema

Implement user-entered/local soil workflow.

Clearly distinguish:

- measured
- farmer provided
- local record
- unknown

Status:

`NOT_STARTED`

---

### M04-T02 — Soil Validation

Validate:

- units
- ranges only where authoritative ranges are available
- missing values
- source type

Do not invent agronomic thresholds.

Status:

`NOT_STARTED`

---

### M04-T03 — Initial Crop Research

Select 3–6 demo crops.

Status:

`RESEARCH_REQUIRED`

Selection must consider:

- demo-region relevance
- credible source coverage
- crop-family diversity
- meaningful rotation contrast
- water/environment contrast
- at least one locally relevant legume if scientifically appropriate

---

### M04-T04 — Crop Reference Files

Create version-controlled curated crop records.

Recommended location:

```text
data/reference/crops/
```

Every value must include source provenance.

Status:

`NOT_STARTED`

---

### M04-T05 — CropRepository

Implement read-only crop repository.

Status:

`NOT_STARTED`

---

### M04-T06 — Crop API

Create:

```text
GET /api/v1/crops
GET /api/v1/crops/{crop_id}
```

Status:

`NOT_STARTED`

---

## M04 Definition of Done

Local soil input works and approved crop profiles can be loaded with traceable sources.

---

# 10. M05 — NASA SMAP Integration

**Status:** NOT_STARTED

## Objective

Add NASA soil-moisture evidence.

---

### M05-T01 — SMAP Access Verification

Verify:

- dataset/version
- authentication
- access method
- fields
- units
- quality flags
- geolocation issue status
- sample location retrieval

Status:

`NOT_STARTED`

---

### M05-T02 — Earthdata Credential Pattern

Add secure configuration mechanism.

No credentials committed.

Status:

`NOT_STARTED`

---

### M05-T03 — SmapAdapter

Implement normalized adapter.

Status:

`NOT_STARTED`

---

### M05-T04 — SMAP Quality Warnings

Explicitly support known source warnings.

Status:

`NOT_STARTED`

---

### M05-T05 — SMAP Tests

Use small fixtures.

Status:

`NOT_STARTED`

---

### M05-T06 — Moisture UI

Show:

- surface/root-zone context
- timestamp
- spatial resolution
- source
- warning if relevant

Status:

`NOT_STARTED`

---

## M05 Definition of Done

SMAP data can be retrieved or loaded from validated cache and shown as correctly labelled moisture context.

---

# 11. M06 — Scientific Suitability Engine

**Status:** RESEARCH_REQUIRED

## Objective

Convert approved evidence into transparent crop-factor assessments.

Do not start before crop records and methodology are sufficiently complete.

---

### M06-T01 — Crop Requirement Review

For each demo crop verify:

- temperature
- rainfall
- soil requirements
- source
- applicability

Status:

`RESEARCH_REQUIRED`

---

### M06-T02 — Suitability Classes

Define scientifically justified semantics for:

- `SUITABLE`
- `MARGINAL`
- `LIMITING`
- `UNKNOWN`

Status:

`RESEARCH_REQUIRED`

---

### M06-T03 — Climate Assessment

Implement approved factor-level classification.

Status:

`BLOCKED` until M06-T01/T02 complete.

---

### M06-T04 — Soil Assessment

Implement approved factor-level classification.

Status:

`BLOCKED`

---

### M06-T05 — Limiting-Factor Logic

Implement transparent limiting-factor output.

Status:

`BLOCKED`

---

### M06-T06 — Suitability Tests

Create reviewed cases.

Status:

`BLOCKED`

---

## M06 Definition of Done

The engine can explain why a crop appears suitable, marginal, limiting, or unknown without fabricated precision.

---

# 12. M07 — Rotation Scenario Engine

**Status:** RESEARCH_REQUIRED

## Objective

Generate and evaluate crop sequences.

---

### M07-T01 — Planning Horizon

Define initial demo horizon.

Status:

`RESEARCH_REQUIRED`

---

### M07-T02 — Rotation Rule Research

Research:

- repeated crops
- crop family repetition
- legumes
- rooting patterns
- sequence constraints

Status:

`RESEARCH_REQUIRED`

---

### M07-T03 — Scenario Generator

Generate sequences from supported crops.

Status:

`BLOCKED`

---

### M07-T04 — Diversity Descriptors

Implement descriptive indicators only.

Status:

`BLOCKED`

---

### M07-T05 — Sourced Rotation Warnings

Implement only verified rules.

Status:

`BLOCKED`

---

### M07-T06 — Rotation Tests

Status:

`BLOCKED`

---

## M07 Definition of Done

Multiple rotation scenarios can be generated and compared using sourced rules and transparent descriptors.

---

# 13. M08 — Farmer Preference Layer

**Status:** NOT_STARTED

## Objective

Allow user priorities to affect ordering without changing scientific facts.

---

### M08-T01 — Priority UI Model

Candidate categories:

- water conservation
- soil health
- resilience
- productivity

Status:

`NOT_STARTED`

---

### M08-T02 — Preference Method

Choose explicit aggregation method.

No hidden scientific weights.

Status:

`RESEARCH_REQUIRED`

---

### M08-T03 — Preference Service

Status:

`BLOCKED`

---

### M08-T04 — Preference Explanation

Explain how user priorities changed scenario ordering.

Status:

`BLOCKED`

---

## M08 Definition of Done

Changing user priorities changes only the preference layer, not the underlying scientific evidence.

---

# 14. M09 — Frontend Decision Workflow

**Status:** NOT_STARTED

## Objective

Create the complete farmer/judge journey.

---

### M09-T01 — Location Step

Status:

`NOT_STARTED`

### M09-T02 — Farm Context Step

Status:

`NOT_STARTED`

### M09-T03 — Soil Step

Status:

`NOT_STARTED`

### M09-T04 — Crop Selection Step

Status:

`NOT_STARTED`

### M09-T05 — Farmer Priorities Step

Status:

`NOT_STARTED`

### M09-T06 — NASA Environment Step

Status:

`NOT_STARTED`

### M09-T07 — Scenario Results Step

Status:

`NOT_STARTED`

### M09-T08 — Comparison Step

Status:

`NOT_STARTED`

### M09-T09 — Responsive / Accessibility Pass

Status:

`NOT_STARTED`

---

## M09 Definition of Done

A judge can complete the core workflow in approximately 1–2 minutes.

---

# 15. M10 — Evidence & Explainability

**Status:** NOT_STARTED

## Objective

Make every result traceable.

---

### M10-T01 — Evidence Panel

Show:

- source
- dataset
- date
- units
- spatial resolution
- processing
- limitations

Status:

`NOT_STARTED`

---

### M10-T02 — Deterministic Explanation Builder

Implement explanations from structured evidence.

Status:

`NOT_STARTED`

---

### M10-T03 — Limitation Panel

Status:

`NOT_STARTED`

---

### M10-T04 — Scientific Language Review

Ensure UI avoids unsupported certainty.

Status:

`NOT_STARTED`

---

## M10 Definition of Done

A judge can answer:

```text
Why did FieldShift AI show this result?
```

without reading source code.

---

# 16. M11 — Demo Snapshot & Reliability

**Status:** NOT_STARTED

## Objective

Ensure the demo works even if live APIs fail.

---

### M11-T01 — Cache Layer

Status:

`NOT_STARTED`

---

### M11-T02 — Validated Demo Snapshot

Create a small reproducible NASA-data snapshot.

Status:

`NOT_STARTED`

---

### M11-T03 — Demo Mode

Feature flag:

```text
ENABLE_DEMO_SNAPSHOTS
```

Status:

`NOT_STARTED`

---

### M11-T04 — Graceful Degradation

Test:

- POWER offline
- SMAP offline
- partial soil data
- unsupported crop
- optional AI failure

Status:

`NOT_STARTED`

---

## M11 Definition of Done

Core demonstration remains usable when an external service fails.

---

# 17. M12 — Validation & Golden Cases

**Status:** NOT_STARTED

## Objective

Create confidence in scientific and technical behavior.

---

### M12-T01 — Golden Case 1

Status:

`NOT_STARTED`

### M12-T02 — Golden Case 2

Status:

`NOT_STARTED`

### M12-T03 — Golden Case 3

Status:

`NOT_STARTED`

### M12-T04 — Regression Suite

Status:

`NOT_STARTED`

### M12-T05 — Manual Scientific Review

Status:

`NOT_STARTED`

---

# 18. M13 — NASA Submission Preparation

**Status:** NOT_STARTED

## Objective

Prepare a judge-ready and submission-ready project.

---

### M13-T01 — Final README

Must explain:

- problem
- challenge
- solution
- NASA data
- science
- architecture
- demo
- installation
- sources
- limitations
- AI usage
- license

Status:

`NOT_STARTED`

---

### M13-T02 — AI Usage Documentation

Finalize `AI_USAGE.md`.

Status:

`NOT_STARTED`

---

### M13-T03 — Submission Requirements Review

Re-check official 2026 requirements.

Status:

`PENDING_OFFICIAL_2026_CONFIRMATION`

---

### M13-T04 — Demo Video / Slides

Prepare within final official submission limits.

Status:

`PENDING_OFFICIAL_2026_CONFIRMATION`

---

### M13-T05 — Final Source Audit

Verify:

- datasets
- libraries
- images
- icons
- AI tools
- references
- licenses

Status:

`NOT_STARTED`

---

### M13-T06 — Open Source License Review

Status:

`NOT_STARTED`

---

### M13-T07 — Final Public Deployment

Status:

`NOT_STARTED`

---

# 19. M14 — Optional Enhancements

**Status:** DEFERRED

Only start if the core project is stable.

Possible:

- HLS vegetation layer
- GPM IMERG
- AI natural-language explanation
- report export
- Arabic localization
- advanced maps
- SoilGrids context
- additional crops

No optional enhancement may delay the core NASA challenge workflow.

---

# 20. Immediate Next Action

The next approved implementation milestone is:

```text
M01 — Technical Foundation
```

Codex must implement **M01 only** after explicit approval.

Within M01, implement tasks in this order:

```text
M01-T01
M01-T02
M01-T03
M01-T04
M01-T05
M01-T06
M01-T07
M01-T08
M01-T09
M01-T10
```

Do not start M02 automatically.

---

# 21. Final Execution Rule

The project should move forward by completing the smallest safe task that increases confidence.

Never trade:

- scientific validity,
- provenance,
- explainability,
- testability,

for speed or visual complexity.

The roadmap priority is:

```text
CORRECT
→ TRACEABLE
→ WORKING
→ TESTED
→ EXPLAINABLE
→ POLISHED
```
