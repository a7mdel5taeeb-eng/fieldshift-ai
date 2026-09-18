# FieldShift AI — Scientific Decision Method Specification

**Status:** ACTIVE — RESEARCH BASELINE v1.0  
**Event:** 2026 NASA International Space Apps Challenge  
**Challenge:** Field Shift: Adapting Farms with NASA Data  
**Last research review:** 2026-09-19

> This document defines the scientific reasoning boundaries for FieldShift AI.
> It does **not** authorize fabricated thresholds, crop values, weights, yield predictions, or agronomic guarantees.
> `PROJECT_RULES.md` remains authoritative.
> Data-source identities and provenance belong in `DATA_SOURCES.md`.

---

# 1. Scientific Objective

FieldShift AI is a **decision-support and scenario-comparison system**.

It must not claim to predict the future with certainty or replace a qualified agronomist.

The scientific objective is to help a farmer compare plausible crop-rotation scenarios by combining:

1. NASA environmental evidence
2. local soil information
3. crop environmental requirements
4. documented rotation/agronomic relationships
5. farmer-defined priorities

The system should answer:

- Is a candidate crop environmentally plausible at this location?
- Which environmental factors appear favorable or limiting?
- How does the soil context affect crop suitability?
- Does a proposed sequence improve crop diversification?
- Are there documented rotation benefits or risks?
- How does water availability affect the scenario?
- How do the farmer's priorities change the preferred scenario?
- What evidence supports the result?
- What is uncertain or missing?

---

# 2. Core Scientific Principle

The system must separate:

## A. Scientific evidence

Examples:

- temperature
- precipitation
- soil moisture
- soil pH
- salinity
- crop climatic requirements
- crop soil requirements
- crop family
- documented rotation relationships

from:

## B. User preferences

Examples:

- prioritize water conservation
- prioritize soil health
- prioritize resilience
- prioritize productivity

and from:

## C. Derived decision indicators

Examples:

- climate suitability
- soil suitability
- water-stress context
- rotation-diversity indicator
- evidence completeness
- scenario preference score

These three categories must never be silently mixed.

---

# 3. Scientific Architecture

The future decision pipeline should follow this order:

```text
RAW / SOURCE DATA
        ↓
QUALITY & PROVENANCE GATE
        ↓
NORMALIZED SCIENTIFIC FEATURES
        ↓
CROP SUITABILITY ASSESSMENT
        ↓
ROTATION / SEQUENCE ASSESSMENT
        ↓
WATER & RESILIENCE CONTEXT
        ↓
SCIENTIFIC SCENARIO PROFILE
        ↓
FARMER-PREFERENCE LAYER
        ↓
EXPLAINABLE COMPARISON
        ↓
UNCERTAINTY / LIMITATIONS
```

The farmer-preference layer must occur **after** scientific evidence has been calculated.

A farmer preference must not alter the underlying scientific observation.

---

# 4. Evidence Classes

Every scientific input should be mapped to one of these classes:

- `OBSERVED_OR_OFFICIAL_PRODUCT`
- `LOCAL_MEASUREMENT`
- `USER_REPORTED`
- `MODELLED_ESTIMATE`
- `REFERENCE_REQUIREMENT`
- `DERIVED_INDICATOR`

Each output must preserve enough provenance to reconstruct its inputs.

---

# 5. Quality Gate

No scenario should enter scientific evaluation until basic data checks pass.

The quality gate should eventually validate:

- coordinates
- date/time
- unit
- missing values
- fill values
- quality flags where available
- data age
- spatial resolution
- temporal resolution
- source status
- crop-record completeness
- soil-record completeness

If a required scientific input is missing:

- do not fabricate it;
- either downgrade the analysis;
- mark the result as incomplete;
- or stop the relevant calculation.

Use explicit states such as:

`DATA_UNAVAILABLE`

`INSUFFICIENT_EVIDENCE`

`NOT_EVALUATED`

---

# 6. Crop Environmental Suitability Framework

FAO Agro-Ecological Zoning (GAEZ) evaluates crop suitability using crop eco-physiological characteristics together with climatic and edaphic requirements.

FAO ECOCROP provides environmental crop descriptors such as:

- temperature
- rainfall
- soil pH
- soil texture
- soil depth
- soil salinity
- drainage
- fertility

FieldShift AI should follow this general scientific pattern:

```text
ENVIRONMENTAL CONDITIONS
        versus
CROP REQUIREMENT ENVELOPE
        ↓
FACTOR-LEVEL SUITABILITY
        ↓
OVERALL CROP SUITABILITY PROFILE
```

This is the project's preferred scientific direction.

---

# 7. Factor-Level Suitability

For each crop and each approved environmental/soil factor:

1. retrieve the observed or supplied environmental value;
2. retrieve the verified crop requirement range;
3. compare the condition to the crop requirement;
4. produce an interpretable factor assessment.

Conceptual labels may include:

- `SUITABLE`
- `MARGINAL`
- `LIMITING`
- `UNKNOWN`

Exact numeric thresholds must come from the crop source or an explicitly documented methodology.

Do not invent intermediate boundaries.

---

# 8. Limiting-Factor Principle

FAO soil-suitability guidance describes approaches where overall suitability can be determined either through:

- a multiplicative combination of factor ratings; or
- the most limiting factor.

FieldShift AI should initially prefer a **transparent limiting-factor approach** for scientific suitability because it is easy to explain to a farmer and avoids hiding a severe constraint inside an average.

Conceptual rule:

> A severe, well-supported environmental or soil limitation should remain visible and must not disappear because other factors score highly.

Example concept only:

```text
Temperature: Suitable
Rainfall: Suitable
Soil pH: Limiting
Salinity: Suitable

Overall:
"Potentially limited by soil pH"
```

No numeric score is authorized by this example.

---

# 9. Future Continuous Suitability Scores

A continuous suitability index may be added later only if:

- the crop requirement source provides adequate numerical ranges;
- the interpolation method is scientifically justified;
- optimal and absolute ranges are distinguished;
- the method is documented and tested.

Possible methods include:

- piecewise membership functions;
- multiplicative factor ratings;
- minimum-factor rating.

No curve shape, coefficient, or cutoff is approved yet.

Status:

`RESEARCH_REQUIRED`

---

# 10. Climate Suitability

Climate suitability should eventually consider only variables that are:

- available from an approved source;
- meaningful to the selected crop;
- supported by crop requirement records.

Initial candidate factors:

- temperature
- precipitation

Additional candidates:

- humidity
- solar radiation
- growing-season conditions

Do not add variables simply because NASA POWER exposes them.

Every climate factor must have a documented role.

---

# 11. Temperature Assessment

NASA POWER can provide temperature context.

Crop temperature requirements may come from FAO ECOCROP/GAEZ or another approved agronomic source.

The initial temperature method should:

1. define the crop's relevant growing period;
2. summarize temperature observations over that period;
3. compare them with verified crop requirements;
4. report favorable and limiting periods;
5. preserve extremes when they are agronomically relevant.

A simple annual average temperature is not sufficient for crop suitability.

Exact growing-season definitions remain crop-specific.

Status:

`CROP-SPECIFIC RESEARCH REQUIRED`

---

# 12. Precipitation Assessment

Precipitation should be considered in relation to:

- crop growing period;
- rain-fed vs irrigated context;
- seasonal distribution;
- soil/water context.

Annual rainfall alone must not automatically determine suitability.

NASA POWER may provide the first climate precipitation series.

GPM IMERG may later be added when dedicated precipitation evidence adds value.

---

# 13. Soil Moisture Assessment

NASA SMAP may provide:

- surface soil-moisture context;
- root-zone soil-moisture context.

Scientific interpretation rules:

- SMAP is not an in-field probe;
- its spatial scale must be visible;
- L4 values are model/data-assimilation products;
- short-term values must not be treated as exact field measurements.

Preferred scientific use:

- moisture trend/context;
- persistent dry/wet periods;
- relative water-stress evidence;
- cross-checking rainfall behavior.

Do not convert SMAP directly into irrigation amounts without a documented water-balance method.

---

# 14. Local Soil Suitability

Local soil information must be evaluated independently from coarse satellite/environmental context.

Candidate crop-soil factors include:

- texture
- pH
- salinity
- drainage
- depth
- fertility-related properties

Only use a factor when:

- the soil value is available;
- the crop requirement is sourced;
- the method for comparing them is documented.

Unknown soil factors remain `UNKNOWN`.

---

# 15. Soil Data Hierarchy

Where conflicting soil information exists, provenance must be visible.

Preferred hierarchy for local decision support:

1. recent laboratory / field measurement
2. trusted local official record
3. farmer-provided known value
4. contextual modeled estimate

A modeled global product must never silently overwrite a local measurement.

This hierarchy is a project governance rule, not a claim that every local measurement is automatically accurate.

---

# 16. Crop Rotation Scientific Rationale

FAO Conservation Agriculture identifies species diversification and varied crop sequences as core conservation-agriculture principles.

Documented benefits of crop rotation can include:

- improved diversity of soil biological activity;
- exploration of different soil depths;
- recycling of nutrients;
- improved use/distribution of soil water and nutrients;
- reduced carry-over of crop-specific pests and diseases;
- nitrogen fixation when suitable legumes are included;
- improved humus/soil organic matter processes in appropriate systems.

These are general principles.

They must not be converted into universal pairwise crop rules without crop-specific evidence.

---

# 17. Rotation Sequence Model

Each candidate rotation should be represented explicitly as a sequence:

```text
RotationScenario
  ├── period_1: Crop A
  ├── period_2: Crop B
  ├── period_3: Crop C
  └── metadata
```

The sequence assessment should be separate from individual crop suitability.

A crop may be individually suitable but form a poor sequence under specific agronomic conditions.

---

# 18. Rotation Diversity Indicator

The system may calculate a transparent diversity descriptor.

Candidate descriptors:

- number of distinct crops;
- number of crop families;
- presence of legumes;
- repeated consecutive crop/family occurrences.

These are descriptive indicators, not automatically "good" or "bad" scores.

Any conversion into a score requires documented evidence.

---

# 19. Consecutive-Crop / Family Rules

The system should eventually identify crop-specific sequence risks such as:

- repeated crop;
- repeated botanical family;
- pest/disease carry-over;
- nutrient-demand patterns;
- incompatible planting windows.

However:

No universal penalty value is authorized.

Pairwise or family-level rules must be sourced from credible agronomic references appropriate to the crop and, where necessary, region.

Status:

`RESEARCH_REQUIRED`

---

# 20. Legume / Nitrogen-Fixation Logic

FAO sources support the role of legumes in crop rotations and biological nitrogen fixation.

However, FieldShift AI must not claim:

- a fixed amount of nitrogen added;
- a guaranteed fertilizer reduction;
- a guaranteed yield increase

without crop-, management-, and location-specific evidence.

The initial system may safely explain:

`This rotation includes a legume, which may support nitrogen cycling when appropriate biological fixation conditions are present.`

Quantitative nitrogen credits require additional evidence.

---

# 21. Previous-Crop Water Carryover

FAO guidance notes that in dry environments, water removed by the preceding crop can materially affect the following crop.

Therefore rotation evaluation should eventually account for:

- rooting depth;
- water use;
- residual soil moisture;
- timing between crops.

This is especially important in arid/semi-arid demonstration regions.

Exact carryover equations are not approved yet.

Status:

`RESEARCH_REQUIRED`

---

# 22. Water Requirement Framework

FAO Irrigation and Drainage Paper 56 provides the established framework for estimating reference and crop evapotranspiration.

Conceptually:

```text
Weather → Reference ET
Reference ET + Crop Coefficient → Crop ET
Crop ET + Rainfall / Soil Water Context → Water Requirement Context
```

FieldShift AI should use FAO-56 methodology rather than inventing a water-demand equation.

However, implementation is NOT authorized until:

- required meteorological inputs are confirmed;
- crop coefficients are sourced;
- growth stages are defined;
- irrigation/rain-fed assumptions are defined;
- units and time steps are validated.

Status:

`RESEARCH_REQUIRED BEFORE IMPLEMENTATION`

---

# 23. Water-Conservation Indicator

The project may eventually compare scenarios on water demand.

A scientifically defensible water indicator should preferably be derived from:

- FAO-56 crop evapotranspiration methodology;
- approved weather inputs;
- crop-stage coefficients;
- rainfall and soil-water context.

Until that pipeline exists:

Do not display statements such as:

`Rotation B saves 18% water`

unless calculated from a documented methodology.

Use qualitative labels only when properly supported.

---

# 24. HLS Vegetation Evidence

NASA HLS Vegetation Indices can provide 30 m vegetation-condition information.

NASA describes:

- NDVI / EVI as useful for vegetation health/greenness;
- NDMI / NDWI for moisture/water-related vegetation condition;
- SAVI / MSAVI as useful where exposed soil or sparse vegetation affects interpretation.

Potential FieldShift role:

- judge-facing environmental evidence;
- recent/historical vegetation-condition context;
- detecting changing land/vegetation conditions.

HLS indices should not directly determine crop rotation without a documented causal method.

They are evidence layers, not automatic recommendations.

---

# 25. Environmental Trend Analysis

The challenge explicitly concerns changing conditions.

The system should compare current/recent conditions with a relevant historical baseline.

Preferred conceptual structure:

```text
historical baseline
        ↓
recent period
        ↓
difference / anomaly
        ↓
trend evidence
```

Potential variables:

- temperature
- precipitation
- soil moisture
- vegetation condition

Exact baseline periods and statistical tests must be selected later.

Avoid claiming a long-term climate trend from a very short time series.

---

# 26. Anomaly vs Trend

The system must distinguish:

- **anomaly** — a departure from a defined baseline;
- **trend** — a sustained directional change over time.

These terms must not be used interchangeably.

A single unusual season is not sufficient evidence of a climate trend.

Statistical trend methodology remains:

`RESEARCH_REQUIRED`

---

# 27. Decision Layer Separation

FieldShift AI should maintain two distinct outputs:

## Scientific Scenario Profile

Describes evidence-based characteristics:

- climate suitability
- soil suitability
- moisture/water context
- rotation diversity
- documented rotation benefits/risks
- uncertainty
- missing evidence

## Preference-Adjusted Scenario Ranking

Uses farmer priorities to order or highlight scenarios.

This separation is essential.

A user preference must not modify scientific facts.

---

# 28. Farmer Preference Model

A farmer may place different importance on objectives such as:

- water conservation
- soil health
- resilience
- productivity

The future preference engine may use an explicit multi-criteria decision method.

A simple weighted-sum utility model is technically possible, but it must be clearly described as:

`user preference aggregation`

not:

`scientific truth`.

Weights must come from the user or a documented decision protocol.

Codex must never invent default scientific weights.

---

# 29. Preference Weighting Rules

If sliders are used:

- the UI should show the weights;
- weights should be editable;
- the sum should be normalized transparently;
- changing a weight should visibly change only the preference layer;
- the underlying scientific evidence should remain unchanged.

Default weights, if needed for a demo, must be explicitly labeled as demo defaults and not scientific recommendations.

---

# 30. Scenario Exclusion vs Ranking

The engine must distinguish between:

### Hard exclusion

A scenario is not evaluated/recommended because a documented hard constraint is violated.

and:

### Soft ranking difference

A scenario remains plausible but performs differently on one or more objectives.

Hard exclusions require particularly strong evidence.

Do not turn a preference into a hard scientific exclusion.

---

# 31. Scientific Output Format

Every evaluated scenario should eventually return a structured result similar to:

```text
ScientificScenarioProfile

Climate:
  status
  evidence
  limiting_factors

Soil:
  status
  evidence
  limiting_factors

Water:
  status
  evidence

Rotation:
  diversity
  documented_benefits
  documented_risks

DataQuality:
  completeness
  limitations

PreferenceLayer:
  farmer_priorities
  preference_result

Explanation:
  why_this_result
```

This is an interface concept, not implementation code.

---

# 32. Explainability Contract

Every decision-relevant indicator should be able to produce:

1. What was evaluated?
2. Which data was used?
3. What source produced the data?
4. What method was used?
5. What result was obtained?
6. What factor limited the result?
7. What assumptions were made?
8. What uncertainty remains?

A judge should be able to move from:

`Result → Method → Evidence → Source`

without reading the source code.

---

# 33. Uncertainty Framework

FieldShift AI must communicate uncertainty rather than hide it.

Uncertainty may arise from:

- coarse spatial resolution;
- modelled vs measured inputs;
- missing soil measurements;
- crop-data generalization;
- temporal gaps;
- cloud/quality issues;
- stale data;
- incomplete rotation evidence;
- assumptions about irrigation or management.

The first MVP should use transparent qualitative uncertainty descriptors.

Do not invent statistical confidence intervals.

---

# 34. Evidence Completeness

The system may show a data-completeness indicator.

It must describe **how complete the evidence is**, not the probability that a recommendation is correct.

For example:

- strong source coverage;
- partial source coverage;
- insufficient evidence.

Exact thresholds for these labels must be documented before implementation.

---

# 35. No False Precision

The interface must avoid outputs that imply unsupported precision.

Avoid:

`Best rotation = 87.43%`

unless the meaning of 87.43 is rigorously defined and validated.

Prefer:

- clear suitability classes;
- limiting-factor explanations;
- transparent component indicators;
- preference-based ranking when appropriate.

---

# 36. Yield Prediction Boundary

Yield prediction is outside the initial scientific MVP.

GAEZ includes attainable-yield and suitability products, but FieldShift AI should not claim farm-level yield predictions unless a separate validated yield methodology is implemented.

Status:

`DEFERRED`

---

# 37. Economic Prediction Boundary

Economic return, profit, commodity prices, and cost optimization are outside the initial scientific MVP unless robust local economic sources are added.

Do not create synthetic financial benefits.

Status:

`DEFERRED`

---

# 38. Soil-Health Boundary

"Soil health" is multidimensional.

Do not collapse it into a single invented number.

For the initial MVP, soil-health reasoning should be presented through documented component evidence, such as:

- crop diversification;
- legume inclusion;
- root diversity;
- known soil constraints;
- local soil condition;
- documented rotation benefits.

A composite Soil Health Score may only be added after a validated methodology is found.

Status:

`RESEARCH_REQUIRED`

---

# 39. Resilience Boundary

"Resilience" must not be an unexplained score.

The initial MVP should express resilience through observable or documented dimensions, for example:

- tolerance to environmental constraints;
- water-related risk;
- diversity of crop sequence;
- exposure to changing temperature/rainfall conditions.

A composite resilience score is not yet approved.

---

# 40. Recommended MVP Scientific Engine

The first defensible MVP should use this architecture:

## Stage 1 — Crop Feasibility

For each candidate crop:

- climate requirement check;
- soil requirement check;
- evidence and limiting factors.

## Stage 2 — Rotation Rule Check

For each candidate sequence:

- repeated crop/family flags;
- diversity descriptors;
- legume presence;
- crop-specific sourced compatibility rules where available.

## Stage 3 — Environmental Context

Use NASA data to show:

- temperature context;
- precipitation context;
- soil-moisture context.

## Stage 4 — Water Context

Initially descriptive.

Upgrade to FAO-56 quantitative analysis only after scientific inputs are complete.

## Stage 5 — Farmer Preference Layer

Rank or emphasize scientifically plausible scenarios according to user priorities.

## Stage 6 — Explanation

Show:

- why;
- evidence;
- limitations;
- uncertainty.

This is preferred over building a black-box machine-learning recommendation model.

---

# 41. Why the MVP Should NOT Start With Machine Learning

The current challenge can be solved more defensibly with transparent environmental and agronomic reasoning.

A machine-learning model should only be added if:

- a valid target variable exists;
- sufficient training data exists;
- the training population matches the intended use;
- performance can be validated;
- the model improves the decision;
- explainability remains adequate.

Do not use AI/ML merely to make the project appear advanced.

---

# 42. AI Boundary

Generative AI may explain already-calculated evidence.

It must not be the source of:

- crop constraints;
- scientific thresholds;
- rotation compatibility;
- NASA observations;
- water requirements;
- soil measurements.

Preferred pattern:

```text
Scientific engine produces structured evidence
                    ↓
AI converts evidence to understandable language
```

Not:

```text
Prompt → AI guesses the best crop
```

---

# 43. Validation Strategy

Validation must occur at multiple levels.

## A. Data validation

Confirm that retrieved source values match official samples/metadata.

## B. Unit validation

Ensure units are consistent before comparison.

## C. Crop-record validation

Manually verify initial demo crop records against source documents.

## D. Rule validation

Every rotation rule must link to evidence.

## E. Case validation

Create known demonstration cases reviewed manually.

## F. Regression validation

A code change must not silently alter previously approved scientific outcomes.

---

# 44. Golden Scientific Test Cases

Before the decision engine is considered stable, create a small set of reviewed "golden cases".

Each case should record:

- location;
- time period;
- local soil inputs;
- candidate crops;
- farmer priorities;
- source data snapshot;
- expected factor classifications;
- expected limiting factors;
- known uncertainties.

Do not define expected final scores until scoring methodology is approved.

---

# 45. Demo Region Strategy

Saudi Arabia / Al-Kharj remains a strong candidate for the demo because water and heat constraints make the challenge easy to communicate.

However, the demo location should be locked only after confirming:

- NASA POWER data quality;
- SMAP coverage;
- suitable demo time periods;
- relevant crops;
- local/regional crop evidence;
- soil-input strategy.

The location is not scientifically approved by this file alone.

Status:

`RESEARCH_REQUIRED`

---

# 46. Initial Crop Set Strategy

Do not begin with dozens of crops.

Select approximately 3–6 crops for the first scientific prototype.

Selection criteria should include:

- relevance to the demo region;
- sufficient FAO/credible crop requirement data;
- meaningful rotation contrast;
- at least one potential legume where locally relevant;
- differing water/environmental profiles;
- clear crop-family metadata.

The actual crops must be researched before approval.

---

# 47. Candidate Crop Research Record

Each approved crop should eventually have:

```text
CropProfile

Identity:
  common_name
  scientific_name
  crop_family

GrowingPeriod:
  planting_window
  growth_duration

ClimateRequirements:
  temperature
  rainfall
  other approved factors

SoilRequirements:
  pH
  texture
  salinity
  drainage
  depth

Water:
  crop coefficients if approved
  growth stages if approved

Rotation:
  family
  legume flag
  rooting information
  sourced sequence constraints

Sources:
  citations
  license
  review date
```

No field may be populated from model memory alone.

---

# 48. Candidate Scientific Indicators

The following indicators are permitted for research/design, not yet approved for numeric implementation:

- climate suitability class;
- soil suitability class;
- limiting-factor list;
- soil-moisture anomaly/context;
- rainfall anomaly/context;
- temperature anomaly/context;
- crop-family diversity;
- legume presence;
- repeated-family warning;
- water-demand context;
- data completeness;
- qualitative uncertainty.

Composite numeric scores remain:

`RESEARCH_REQUIRED`

---

# 49. Decision Hierarchy

The recommended decision hierarchy is:

```text
1. Is there enough evidence to evaluate?
2. Is the individual crop environmentally plausible?
3. Are there hard documented constraints?
4. What are the key limiting factors?
5. How does the rotation sequence compare agronomically?
6. What water/environmental pressures are present?
7. Which plausible scenario better matches farmer priorities?
8. What uncertainty remains?
```

This hierarchy should guide both backend architecture and UI design.

---

# 50. Scientific Language Rules

Use:

- `suggests`
- `indicates`
- `appears more suitable under the evaluated conditions`
- `may support`
- `potential limitation`
- `based on available data`

Avoid unsupported wording such as:

- `guarantees`
- `will increase yield`
- `will save X% water`
- `perfect crop`
- `best crop`
- `risk-free`
- `scientifically proven for this farm`

unless a specific claim is directly supported.

---

# 51. Current Scientific Decisions

The following decisions are approved at methodology level:

1. Use a transparent rule/evidence-based MVP before machine learning.
2. Separate scientific suitability from farmer preference.
3. Prefer visible limiting factors over opaque averages.
4. Use NASA observations/products as environmental evidence.
5. Treat local soil information separately from coarse environmental products.
6. Use FAO crop requirement frameworks for crop-environment compatibility.
7. Use FAO conservation-agriculture evidence to frame diversification/rotation benefits.
8. Use FAO-56 if quantitative crop-water calculations are later implemented.
9. Explain every decision.
10. Expose uncertainty and source limitations.

---

# 52. Unresolved Scientific Questions

These remain research tasks:

- exact demo crops;
- exact crop calendars;
- exact suitability interpolation functions;
- optimal vs absolute crop-range treatment;
- precipitation sufficiency method;
- water-balance method;
- FAO-56 input completeness;
- crop coefficients;
- soil-moisture anomaly baseline;
- trend methodology;
- exact rotation compatibility rules;
- quantitative soil-health metric;
- quantitative resilience metric;
- quantitative scenario score;
- preference aggregation implementation;
- uncertainty classes;
- demo-region agronomic validation.

These must not be silently resolved by Codex.

---

# 53. Scientific Definition of Done

A scientific feature is ready only when:

- the question is defined;
- inputs are documented;
- units are verified;
- source data are approved;
- crop/agronomic evidence is cited;
- method is documented;
- assumptions are explicit;
- limitations are explicit;
- output semantics are defined;
- tests exist;
- at least one reviewed example exists;
- no fabricated value is required;
- UI language matches the evidence strength.

---

# 54. Research Baseline Sources

## FAO / Crop Suitability

1. FAO Global Agro-Ecological Zoning (GAEZ)  
   https://www.fao.org/gaez/en

2. FAO GAEZ v5  
   https://www.fao.org/gaez/gaezv5/en

3. FAO ECOCROP  
   https://www.fao.org/geospatial/data-and-tools/data-portals/ecocrop/

4. ECOCROP application  
   https://ecocrop.apps.fao.org/ecocrop/srv/en/home

5. FAO Soil Suitability — Semi-Quantitative Approach  
   https://www.fao.org/soils-portal/soil-assessment/a-semi-quantitative-approach/en/

## FAO / Crop Rotation & Soil

6. FAO Conservation Agriculture — Species Diversification  
   https://www.fao.org/conservation-agriculture/in-practice/species-diversification/en/

7. FAO Conservation Agriculture  
   https://www.fao.org/conservation-agriculture/

8. FAO guidance on cropping sequence  
   https://www.fao.org/4/y5146e/y5146e0a.htm

## FAO / Water

9. FAO Irrigation and Drainage Paper 56 — Crop Evapotranspiration  
   https://www.fao.org/4/x0490e/x0490e0r.htm

10. FAO CROPWAT  
    https://www.fao.org/land-water/resources/tools/software/cropwat/en

## NASA

11. NASA POWER Agroclimatology  
    https://power.larc.nasa.gov/docs/methodology/communities/

12. NASA SMAP Mission  
    https://science.nasa.gov/mission/smap/

13. NASA HLS Vegetation Indices  
    https://science.nasa.gov/mission/landsat/hls-vegetation-indices/

---

# 55. Final Scientific Rule

FieldShift AI must prefer a **smaller, transparent, defensible scientific model** over a more impressive but unsupported model.

The project wins scientifically when a farmer or judge can see:

```text
WHAT DATA?
        ↓
WHAT DOES IT MEAN?
        ↓
WHAT LIMITS THIS CROP?
        ↓
WHY DOES THIS ROTATION HELP OR HURT?
        ↓
HOW DID MY PRIORITIES CHANGE THE COMPARISON?
        ↓
WHAT DON'T WE KNOW?
```

Every future scientific implementation must preserve this chain.
