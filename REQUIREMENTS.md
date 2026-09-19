# FieldShift AI — Product Requirements Specification
========================================================

Status: ACTIVE
Version: 1.0

Event:
2026 NASA International Space Apps Challenge

Challenge:
Field Shift: Adapting Farms with NASA Data

--------------------------------------------------------
1. PRODUCT VISION
--------------------------------------------------------

FieldShift AI is an evidence-based crop-rotation decision-support
platform designed to help farmers explore how different crop-rotation
strategies may perform under changing environmental conditions.

The system must combine four primary information domains:

1. NASA Earth observation data
2. Local soil information
3. Crop characteristics
4. Farmer priorities

The product must transform these inputs into understandable,
traceable, and explainable crop-rotation scenarios.

FieldShift AI is NOT intended to replace agronomists or provide
unqualified agricultural guarantees.

It is a decision-support and scenario-exploration tool.

The product is globally location-configurable. It is not limited to Saudi Arabia; a demonstration location in Saudi Arabia / Al-Kharj does not define the product's target geography.

FieldShift AI supports three future user modes: **Analyze My Crop**, **Find Suitable Crops**, and **Plan Crop Rotation**. NASA environmental data, local/available soil, water/soil-moisture context, crop requirements, and farmer priorities remain the inputs to scientific analysis; alternatives, rotations, and any later economic feasibility layer must preserve sources and limitations.

Country selection, location/farm selection, and latitude/longitude representation are required product-context capabilities. A future map-based selector must remain globally configurable; scientific analysis must use the selected coordinates and only available local/regional evidence.

The initial wheat, barley, chickpea, and alfalfa records are validated MVP examples, not a product limitation. Future crops may be added without rebuilding the application only when their CropProfile has adequate verified scientific and provenance data. No crop is assumed valid in every country.

Economic feasibility is a future `RESEARCH_REQUIRED` layer. It may use only location-, date-, currency-, and source-aware market, yield, input, water, energy, labor, or production-cost data. Where reliable evidence is unavailable, the system must return `ECONOMIC_DATA_UNAVAILABLE`; it must not estimate or fabricate profit.

Alternative-crop comparison is `RESEARCH_REQUIRED`. It may evaluate only supported sourced CropProfiles and must not use an unrestricted AI-generated recommendation system or unapproved ranking formula.

--------------------------------------------------------
2. PRIMARY USER
--------------------------------------------------------

Primary user:

Farmer / agricultural decision maker.

Secondary potential users:

- agricultural advisors
- researchers
- educators
- sustainability planners

The MVP must prioritize the farmer experience.

--------------------------------------------------------
3. CORE USER JOURNEY
--------------------------------------------------------

The target user journey is:

SELECT LOCATION
        ↓
DEFINE FARM CONTEXT
        ↓
PROVIDE / SELECT SOIL INFORMATION
        ↓
SELECT CURRENT / CANDIDATE CROPS
        ↓
DEFINE FARMER PRIORITIES
        ↓
RETRIEVE RELEVANT NASA OBSERVATIONS
        ↓
ANALYZE ENVIRONMENTAL CONDITIONS
        ↓
GENERATE VALID ROTATION SCENARIOS
        ↓
EVALUATE SCENARIOS
        ↓
COMPARE ALTERNATIVES
        ↓
EXPLAIN RESULTS
        ↓
EXPLORE "WHAT-IF" OPTIONS

The system must preserve traceability from the final result back to
the data and assumptions used.

--------------------------------------------------------
4. MVP — MUST HAVE REQUIREMENTS
--------------------------------------------------------

FR-001 — LOCATION SELECTION

The user must be able to define the geographic location of the farm
or agricultural area being evaluated.

The architecture should support coordinates and/or map-based
selection.

Exact geographic implementation will be determined during the
architecture phase.

Acceptance Criteria:

- A location can be selected.
- The selected location is visible to the user.
- The location can be passed to the data layer.
- Invalid or unsupported locations produce a clear error.

--------------------------------------------------------

FR-002 — FARM PROFILE

The user must be able to define basic farm context required by the
approved decision methodology.

The final fields must be determined by scientific requirements.

Potential fields may include:

- current crop
- planning horizon
- irrigation context
- farm conditions

Do not implement unvalidated fields as scientific requirements yet.

Acceptance Criteria:

- Farm context can be entered or selected.
- Inputs are validated.
- The profile can be passed to the decision engine.

--------------------------------------------------------

FR-003 — SOIL INFORMATION

The system must incorporate local soil information.

Potential soil attributes may include:

- soil type
- pH
- organic matter
- salinity
- water-holding characteristics
- nutrient-related information

These are candidate attributes only.

Their use must be validated in SCIENCE_METHOD.md and DATA_SOURCES.md.

The system must distinguish between:

- measured soil data
- external soil datasets
- user-entered soil data
- estimated soil properties

Acceptance Criteria:

- Soil information can influence scenario evaluation.
- Soil data provenance is identifiable.
- Missing soil information is handled explicitly.
- Estimated values are never presented as measurements.

--------------------------------------------------------

FR-004 — NASA EARTH OBSERVATION INTEGRATION

NASA Earth observation data must materially contribute to the
decision-support process.

Potential environmental variables may include:

- precipitation
- temperature
- soil moisture
- vegetation conditions
- evapotranspiration
- drought-related indicators
- land-surface conditions

These variables are NOT approved datasets or final requirements yet.

DATA_SOURCES.md must determine the actual NASA products used.

Acceptance Criteria:

- At least one approved NASA data source influences functional analysis.
- NASA data provenance is visible.
- NASA data is not used merely as decoration.
- Missing NASA data produces graceful handling.
- Derived values can be distinguished from observations.

--------------------------------------------------------

FR-005 — CROP KNOWLEDGE BASE

The system must maintain structured characteristics for supported
crops.

Potential characteristics may include:

- crop family
- season
- water demand
- heat tolerance
- drought tolerance
- soil compatibility
- rotation characteristics
- nutrient relationships

No crop characteristic may be invented.

Acceptance Criteria:

- Crop properties have traceable sources.
- Unsupported crops are identified clearly.
- Crop information can be consumed by the decision engine.

--------------------------------------------------------

FR-006 — FARMER PRIORITIES

The user must be able to communicate what matters most for the
decision.

Potential objectives include:

- water conservation
- soil health
- resilience
- productivity
- economic considerations

Exact priorities and weighting mechanisms require scientific/product
approval.

Acceptance Criteria:

- The system can capture multiple priorities.
- Priorities can influence scenario evaluation.
- The system can explain how priorities affected results.

--------------------------------------------------------

FR-007 — ROTATION SCENARIO GENERATION

The system must support multi-season or multi-year crop-rotation
scenarios.

The engine must not simply recommend a single crop.

It should explore sequences of crops over an approved planning
horizon.

Example conceptual structure:

Season/Year 1 → Crop A
Season/Year 2 → Crop B
Season/Year 3 → Crop C

This example does not represent an agricultural recommendation.

Acceptance Criteria:

- Multiple rotation scenarios can be represented.
- Invalid scenarios can be rejected when supported by validated rules.
- Scenario generation logic is documented.
- No fabricated agricultural rules are permitted.

--------------------------------------------------------

FR-008 — SCENARIO EVALUATION

Each approved rotation scenario must be evaluated against documented
criteria.

Candidate dimensions may include:

- environmental suitability
- water-related considerations
- soil implications
- resilience
- farmer priorities
- risk

Exact metrics, formulas, thresholds, and weights are NOT defined yet.

They must be documented and validated in SCIENCE_METHOD.md.

Acceptance Criteria:

- Evaluation is reproducible.
- Inputs are traceable.
- Methodology is documented.
- Results expose uncertainty and limitations where appropriate.

--------------------------------------------------------

FR-009 — SCENARIO COMPARISON

Users must be able to compare at least two crop-rotation strategies.

The comparison should make trade-offs understandable.

Acceptance Criteria:

- Multiple scenarios can be viewed together.
- Major differences are visible.
- Comparison dimensions have documented meaning.
- The UI must not imply false scientific precision.

--------------------------------------------------------

FR-010 — EXPLAINABLE RESULTS

Every recommendation or scenario score must provide an explanation.

The explanation should identify, where applicable:

- relevant NASA observations
- soil factors
- crop characteristics
- farmer priorities
- benefits
- risks
- limitations
- uncertainty

Acceptance Criteria:

A user must be able to answer:

"Why did FieldShift AI show me this result?"

without needing to inspect source code.

--------------------------------------------------------

FR-011 — NASA DATA TRANSPARENCY

The application must provide a way to identify which NASA data
products contributed to an analysis.

Acceptance Criteria:

The user or judge can determine:

- what NASA data was used
- what it represented
- how it influenced the analysis
- its source

--------------------------------------------------------

FR-012 — DATA SOURCE TRANSPARENCY

The application must expose or link to appropriate information about
external datasets and scientific sources.

Acceptance Criteria:

- Sources are traceable.
- External resources are attributed.
- Licensing information is documented in the repository.

--------------------------------------------------------

FR-013 — LIMITATIONS

The system must clearly communicate important limitations.

Examples:

- missing data
- geographic limitations
- temporal limitations
- scientific assumptions
- model uncertainty
- unsupported crops
- incomplete soil information

Acceptance Criteria:

The system must not present uncertain outputs as guaranteed outcomes.

--------------------------------------------------------

FR-014 — ERROR HANDLING

The application must fail gracefully when:

- NASA data cannot be retrieved
- location is invalid
- soil data is incomplete
- crop information is unavailable
- an external service is unavailable
- analysis cannot be completed reliably

The system must never fabricate substitute scientific data to avoid
an error.

--------------------------------------------------------

FR-015 — DEMONSTRATION SCENARIO

The MVP must contain at least one scientifically documented
demonstration scenario suitable for explaining the complete workflow
to judges.

The location and crops for the demonstration are NOT approved yet.

They must be selected after data availability and scientific
suitability are evaluated.

--------------------------------------------------------
5. SHOULD HAVE REQUIREMENTS
--------------------------------------------------------

SR-001 — INTERACTIVE MAP

The product should provide geographic visualization for the selected
farm and relevant environmental information.

--------------------------------------------------------

SR-002 — ENVIRONMENTAL TRENDS

The product should visualize relevant historical environmental
conditions when supported by approved NASA datasets.

Potential examples:

- rainfall trend
- temperature trend
- soil moisture trend
- vegetation condition

--------------------------------------------------------

SR-003 — WHAT-IF ANALYSIS

Users should be able to modify priorities or rotation choices and
observe how scenario evaluation changes.

--------------------------------------------------------

SR-004 — EVIDENCE PANEL

The product should include an evidence view showing the important
observations and sources supporting an analysis.

--------------------------------------------------------

SR-005 — RESPONSIVE EXPERIENCE

The application should work effectively on:

- desktop
- tablet
- common mobile screen sizes

Desktop is the primary judging/demo experience.

--------------------------------------------------------
6. COULD HAVE REQUIREMENTS
--------------------------------------------------------

CR-001 — NATURAL LANGUAGE EXPLANATION

AI may generate simplified explanations of already-computed,
evidence-based results.

AI must not independently invent scientific conclusions.

--------------------------------------------------------

CR-002 — FARMER ASSISTANT

A conversational interface may help users understand:

- environmental trends
- scenario differences
- terminology
- existing computed recommendations

It must remain grounded in approved project data.

--------------------------------------------------------

CR-003 — REPORT EXPORT

The system may generate a concise farm scenario report containing:

- selected conditions
- NASA evidence
- compared rotations
- results
- sources
- limitations

--------------------------------------------------------

CR-004 — MULTILINGUAL INTERFACE

The architecture may support localization.

English must remain fully supported for NASA judging and submission
materials.

--------------------------------------------------------
7. OUT OF SCOPE FOR MVP
--------------------------------------------------------

Unless later approved, the following are outside MVP scope:

- payment systems
- commercial subscriptions
- social network features
- marketplace
- complex user account systems
- large administration dashboards
- IoT hardware integration
- autonomous farm control
- automatic irrigation control
- automatic machinery control
- guaranteed yield prediction
- guaranteed financial prediction
- replacing professional agronomic advice

--------------------------------------------------------
8. DATA REQUIREMENTS
--------------------------------------------------------

All production data sources must eventually be documented in:

DATA_SOURCES.md

Every approved source must include:

- provider
- official name
- URL
- purpose
- variables
- units
- spatial resolution where applicable
- temporal resolution where applicable
- coverage
- access mechanism
- preprocessing
- limitations
- citation
- licensing / usage information

No production dataset is approved merely by appearing in this
requirements document.

--------------------------------------------------------
9. SCIENTIFIC REQUIREMENTS
--------------------------------------------------------

SCIENCE_METHOD.md must eventually define:

- environmental indicators
- crop compatibility logic
- rotation constraints
- scenario evaluation methodology
- normalization
- scoring
- weights
- thresholds
- uncertainty
- validation
- assumptions
- limitations

Until those items are scientifically supported, they must remain
unimplemented or use clearly labeled non-scientific placeholders.

--------------------------------------------------------
10. NON-FUNCTIONAL REQUIREMENTS
--------------------------------------------------------

NFR-001 — TRACEABILITY

A final analysis should be traceable from:

Output
→ methodology
→ input
→ dataset
→ source.

--------------------------------------------------------

NFR-002 — REPRODUCIBILITY

Given the same version of:

- inputs
- datasets
- methodology
- configuration

the deterministic parts of the system should reproduce the same
results.

--------------------------------------------------------

NFR-003 — PERFORMANCE

The demonstration workflow should provide results within a practical
interactive timeframe.

Performance targets will be established after data architecture is
known.

--------------------------------------------------------

NFR-004 — ACCESSIBILITY

Core workflows should follow common web accessibility practices.

Important information must not depend solely on color.

--------------------------------------------------------

NFR-005 — SECURITY

No secrets or credentials may be committed to Git.

External credentials must use environment configuration.

--------------------------------------------------------

NFR-006 — RESILIENCE

Failures in optional external services should not unnecessarily crash
the entire application.

--------------------------------------------------------

NFR-007 — DOCUMENTATION

Major modules, data transformations, scientific logic, and APIs must
be documented.

--------------------------------------------------------
11. JUDGE EXPERIENCE
--------------------------------------------------------

The MVP should allow a judge to understand the core value quickly.

The ideal demonstration path is:

1. Select a farm location.
2. Show environmental context derived from NASA data.
3. Show soil/crop context.
4. Select farmer priorities.
5. Generate multiple rotation scenarios.
6. Compare scenarios.
7. Inspect the explanation.
8. Inspect NASA evidence and sources.
9. Change one priority.
10. Show how the decision changes.

The experience should emphasize:

DATA → REASONING → DECISION → EXPLANATION.

--------------------------------------------------------
12. PRODUCT SUCCESS CONDITIONS
--------------------------------------------------------

The MVP is successful when it can demonstrate that:

1. NASA Earth observation data materially influences analysis.
2. Soil information influences analysis.
3. Crop characteristics influence analysis.
4. Farmer priorities influence analysis.
5. Multiple crop rotations can be explored.
6. Alternatives can be compared.
7. Results are explainable.
8. Scientific sources are traceable.
9. Limitations are visible.
10. The workflow directly addresses the Field Shift challenge.

--------------------------------------------------------
13. REQUIREMENT PRIORITY
--------------------------------------------------------

Priority order:

P0:
NASA challenge relevance
Scientific validity
NASA data integration
Data provenance
Rotation decision support

P1:
Scenario comparison
Explainability
Farmer priorities
Judge-friendly visualization

P2:
AI assistance
Advanced visualization
Export
Localization

Visual polish must never take priority over scientific validity or
challenge relevance.

--------------------------------------------------------
14. REQUIREMENT STATUS RULE
--------------------------------------------------------

Use these statuses in future requirements:

APPROVED
RESEARCH REQUIRED
SOURCE REQUIRED
PENDING OFFICIAL 2026 CONFIRMATION
DEFERRED
REJECTED

Do not silently convert an uncertain requirement into APPROVED.

--------------------------------------------------------
15. CHANGE CONTROL
--------------------------------------------------------

Any future change that materially affects:

- project mission
- scientific methodology
- NASA data usage
- crop-rotation logic
- MVP scope
- NASA compliance

must be reflected in the relevant governance documents.

PROJECT_RULES.md remains authoritative if a conflict occurs.
