# FieldShift AI — Data Sources & Provenance Specification

**Status:** ACTIVE — RESEARCH BASELINE v1.0  
**Event:** 2026 NASA International Space Apps Challenge  
**Challenge:** Field Shift: Adapting Farms with NASA Data  
**Last research review:** 2026-09-19

> This document records the current data strategy for FieldShift AI.  
> It does **not** authorize Codex to implement scientific scoring, crop recommendations, thresholds, or formulas.
> All sources must remain consistent with `PROJECT_RULES.md` and `REQUIREMENTS.md`.

---

## 1. Data Strategy

FieldShift AI will use five distinct information layers:

1. **NASA environmental evidence**
   - climate / weather context
   - rainfall
   - soil moisture
   - vegetation condition

2. **Local soil information**
   - farmer-entered or measured soil information is preferred
   - external global soil models may be used only as clearly labelled estimates/context

3. **Crop characteristics**
   - sourced crop climate/soil constraints and agronomic characteristics

4. **Farmer priorities**
   - user-provided preferences and objectives

5. **Derived indicators**
   - values computed by FieldShift AI from documented source data
   - every derived indicator must be documented later in `SCIENCE_METHOD.md`

The final decision flow should remain:

NASA observations + Local soil + Crop characteristics + Farmer priorities
→ documented derived indicators
→ scenario evaluation
→ explainable comparison

---

## 2. Source Status Vocabulary

Use only these source statuses:

- **APPROVED_FOR_PROTOTYPE** — suitable for controlled prototype integration.
- **CANDIDATE** — promising but requires integration/validation work.
- **REFERENCE_ONLY** — useful scientific/product reference but not a production data dependency.
- **RESEARCH_REQUIRED** — more scientific validation is required.
- **PENDING_OFFICIAL_2026_CONFIRMATION** — must be reconciled with the final 2026 challenge resources when NASA publishes/expands them.
- **REJECTED** — must not be used.

No source becomes scientifically approved merely because it appears in this document.

---

# 3. NASA DATA SOURCES

## DS-NASA-001 — NASA POWER Daily API

**Status:** APPROVED_FOR_PROTOTYPE  
**Provider:** NASA Prediction Of Worldwide Energy Resources (POWER)  
**Community:** Agroclimatology (AG)  
**Purpose in FieldShift AI:** Historical and recent environmental context for a selected farm location.

### Why it is useful

NASA POWER provides globally available, analysis-ready solar and meteorological data and exposes REST APIs designed for direct application use. Its Agroclimatology community is explicitly intended to support agricultural decision-support workflows.

### Candidate variables

Candidate variables include:

- air temperature
- daily minimum temperature
- daily maximum temperature
- relative humidity
- precipitation
- solar radiation

Known POWER parameter short names such as `T2M` may be used only after the exact current parameter names, units, and availability are verified through the live POWER Parameter Dictionary.

**Do not hard-code an unverified POWER parameter name.**

### Temporal characteristics

- Daily data available from 1981-01-01 to Near Real Time according to current POWER documentation.
- Daily API supports point and regional requests.
- JSON and CSV are among the available output formats.

### Spatial characteristics

POWER returns values on the original source grid.  
It must **not** be presented as farm-field-resolution data.

### Intended role

Possible approved future uses:

- temperature history
- heat-stress context
- rainfall/climate context
- humidity context
- solar context
- baseline/climatology comparison

### Access

Official POWER REST API / Data Access Viewer.

Official documentation:
https://power.larc.nasa.gov/docs/services/api/temporal/daily/

Parameter Dictionary:
https://power.larc.nasa.gov/parameters/

### Limitations

- Spatial resolution is much coarser than an individual agricultural field.
- Meteorological values can originate from assimilation/model products; they are not equivalent to a local weather station measurement.
- Near-real-time values may later be replaced by improved climate-quality products.
- API requests must be cached responsibly; repeated unnecessary requests to the same grid cell should be avoided.

### Provenance label in UI

`NASA POWER environmental data`

### Integration decision

Use POWER as the **first NASA integration** because it is globally available and technically simple enough for an MVP.

---

## DS-NASA-002 — SMAP L4 Surface & Root-Zone Soil Moisture V8

**Status:** APPROVED_FOR_PROTOTYPE_WITH_CAUTION  
**Dataset ID:** SPL4SMGP  
**Version:** 8  
**Provider:** NASA NSIDC DAAC  
**Mission:** Soil Moisture Active Passive (SMAP)  
**DOI:** 10.5067/T5RUATAQREF8

### Variables of interest

- surface soil moisture
- root-zone soil moisture

### Spatial resolution

Approximately 9 km.

### Temporal resolution

3-hourly.

### Temporal coverage

2015-03-31 to present.

### Format

HDF5.

### Authentication

NASA Earthdata Login is required for direct data access.

### Intended role

Possible future uses:

- soil-moisture context
- persistent wet/dry condition indicators
- root-zone moisture trend
- drought/water-stress context
- comparison with rainfall history

### Scientific interpretation rule

SMAP L4 is a model/data-assimilation product informed by SMAP observations.  
It must not be described to users as a direct in-field soil probe measurement.

### Critical 2026 data-quality note

The current dataset page reports a geolocation issue affecting SMAP Standard and Near Real-Time datasets from **2026-05-14 through 2026-07-28**. Standard products for that period are being reprocessed.

Therefore:

- do not use that affected period blindly in a demo;
- verify reprocessing status before final use;
- document any exclusion applied.

### Official source

https://nsidc.org/data/spl4smgp/versions/8

### Intended UI provenance label

`NASA SMAP soil-moisture estimate`

### Integration decision

Use SMAP as the primary NASA soil-moisture evidence layer, but aggregate it appropriately and clearly communicate its 9 km scale.

---

## DS-NASA-003 — GPM IMERG Final Daily Precipitation V07

**Status:** CANDIDATE  
**Dataset ID:** GPM_3IMERGDF  
**Version:** 07  
**Provider:** NASA GES DISC  
**Mission / Product family:** Global Precipitation Measurement (GPM) / IMERG

### Variable of interest

- precipitation

### Spatial resolution

0.1° × 0.1° (roughly 10 km scale).

### Temporal resolution

Daily product.

### Intended role

Possible future uses:

- rainfall history
- rainfall anomaly indicators
- dry/wet period comparison
- cross-checking or complementing broader climate context

### Why this is separate from POWER

POWER is convenient for application-level climate time series.  
IMERG provides a dedicated multi-satellite precipitation product.

The project should not use both sources redundantly unless each has a documented purpose.

### Access

NASA Earthdata Search / GES DISC.

Official collection directory:
https://cmr.earthdata.nasa.gov/search/site/collections/directory/GES_DISC/gov.nasa.eosdis

### Integration decision

Do **not** integrate in the first technical milestone.

Evaluate after POWER integration.  
Approve only if it improves precipitation evidence enough to justify additional data-engineering complexity.

---

## DS-NASA-004 — HLS Vegetation Indices V2

**Status:** CANDIDATE_HIGH_VALUE  
**Provider:** NASA LP DAAC  
**Project:** Harmonized Landsat Sentinel-2 (HLS)

### Products

- HLSL30_VI.002 — Landsat-based HLS Vegetation Indices
- HLSS30_VI.002 — Sentinel-2-based HLS Vegetation Indices

### DOIs

- HLSL30_VI.002: 10.5067/HLS/HLSL30_VI.002
- HLSS30_VI.002: 10.5067/HLS/HLSS30_VI.002

### Spatial resolution

30 m.

### Observation frequency

The combined HLS system enables land observations on approximately a 2–3 day cadence, subject to acquisition and cloud/quality conditions.

### Available vegetation indices

The HLS-VI products include nine indices:

- NDVI
- EVI
- SAVI
- MSAVI
- NDMI
- NDWI
- NBR
- NBR2
- TVI

### Intended role

Potential high-value uses:

- visualize recent vegetation condition
- show field-scale spatial context
- compare vegetation history when available
- strengthen the judge-facing evidence panel
- provide a much finer spatial layer than POWER/SMAP

### Access

NASA Earthdata Search and AppEEARS.

AppEEARS:
https://appeears.earthdatacloud.nasa.gov/

### Important implementation rule

Historical HLS-VI availability must be checked at integration time.

Do not assume a complete historical archive for every date/location without testing the current catalog.

### Integration decision

Not required for the first MVP data pipeline.

Treat as the preferred **visual/scientific enhancement** after the basic decision pipeline works.

---

# 4. LOCAL SOIL INFORMATION

## DS-SOIL-001 — Farmer / Lab Soil Profile

**Status:** APPROVED_FOR_PROTOTYPE  
**Type:** User-entered local data  
**Priority:** PRIMARY local soil source

### Purpose

The challenge explicitly requires local soil information.  
The most defensible MVP approach is to allow farmers to provide known soil information rather than pretending a global model is a local measurement.

### Candidate fields

Final fields must be approved in `SCIENCE_METHOD.md`.

Potential fields:

- soil texture / type
- pH
- salinity / EC
- organic matter or soil organic carbon
- drainage information
- measured nutrient information when available

### Required metadata

Whenever possible store:

- value
- unit
- measurement/source type
- measurement date
- depth
- confidence / known vs unknown

### UI labels

Examples:

- `Farmer-provided`
- `Laboratory measurement`
- `Local record`
- `Unknown`

### Rule

Missing local values must remain missing unless an explicit estimated fallback is used.

Never silently replace missing local measurements with modeled values.

---

## DS-SOIL-002 — ISRIC SoilGrids 2.0

**Status:** CANDIDATE_CONTEXT_ONLY  
**Provider:** ISRIC — World Soil Information  
**License:** CC BY 4.0

### Coverage

Global soil-property predictions.

### Spatial resolution

250 m.

### Depths

Six standard depth intervals.

### Example available properties

- pH
- soil organic carbon
- bulk density
- sand
- silt
- clay
- cation exchange capacity
- total nitrogen
- coarse fragments

### Critical scientific limitation

ISRIC explicitly states that SoilGrids is a global model and **does not advise using it at local or farm level**.

Therefore FieldShift AI must never present SoilGrids values as measured farm soil conditions.

If used, values must be labelled:

`SoilGrids modeled estimate — contextual only`

### Technical limitation as of research review

ISRIC reports that the SoilGrids REST API is temporarily paused and the API is a beta complementary service without guaranteed uptime.

Therefore:

- do not make the MVP depend on the REST API;
- consider static demo subsets or alternative documented access methods if this source is approved later.

### Official sources

https://isric.org/explore/soilgrids
https://docs.isric.org/globaldata/soilgrids/

### Integration decision

Use only as optional context/fallback after the farmer/local soil workflow works.

---

# 5. CROP CHARACTERISTICS

## DS-CROP-001 — FAO ECOCROP / GAEZ Crop Characteristics

**Status:** CANDIDATE_REFERENCE_DATA  
**Provider:** Food and Agriculture Organization of the United Nations (FAO)

### Scope

ECOCROP contains environmental constraints/characteristics for more than 2,500 plant species.

Candidate attributes relevant to FieldShift AI include:

- temperature requirements
- rainfall ranges
- soil pH
- soil texture
- soil depth
- salinity
- drainage
- fertility
- crop cycle
- climate zone

### Important limitation

The original ECOCROP database was discontinued around 2015 and has since been incorporated into the GAEZ platform.

Use it as a structured reference source, not as the sole authority for every agronomic recommendation.

### Official sources

https://www.fao.org/land-water/resources/tools/databases/ecocrop/en
https://ecocrop.apps.fao.org/ecocrop/srv/en/home

### Integration decision

Use ECOCROP/GAEZ to help build an initial curated crop knowledge base.

Each crop included in the demo must still have its actual values reviewed and cited.

---

## DS-CROP-002 — FAO CROPWAT / FAO-56

**Status:** REFERENCE_ONLY_PENDING_SCIENCE_METHOD  
**Provider:** FAO

### Purpose

CROPWAT is a decision-support tool for crop-water and irrigation requirements based on soil, climate, and crop data.

Its calculations are based principally on:

- FAO Irrigation and Drainage Paper 56
- FAO Irrigation and Drainage Paper 33

### Potential role

FieldShift AI may later use FAO-56/CROPWAT methodology for:

- crop water requirement context
- reference evapotranspiration methodology
- irrigation-related scenario explanation

### Rule

Do not implement FAO-56 formulas or crop coefficients until they are explicitly documented and validated in `SCIENCE_METHOD.md`.

### Official source

https://www.fao.org/land-water/resources/tools/software/cropwat/en

---

# 6. CROP ROTATION / SOIL-HEALTH REFERENCES

## DS-AGRONOMY-001 — FAO Conservation Agriculture

**Status:** REFERENCE_ONLY

FAO Conservation Agriculture emphasizes:

- minimum soil disturbance
- permanent soil cover
- diversification of plant species

FAO describes crop diversification/rotation as an important component of conservation agriculture.

### Intended role

Use this as broad scientific framing for:

- why diversification matters
- soil-health narrative
- sustainable rotation rationale

### Important rule

Do not convert general conservation-agriculture principles into universal crop-to-crop rotation constraints.

Exact rotation rules must come from crop-specific, region-relevant agronomic evidence.

### Official source

https://www.fao.org/conservation-agriculture/

---

# 7. APPROVED MVP DATA STACK — CURRENT RECOMMENDATION

The first working MVP should intentionally remain small.

## Required first-wave sources

### A. NASA POWER
For:
- temperature / environmental history
- basic climate context

### B. NASA SMAP
For:
- surface/root-zone soil-moisture evidence

### C. Farmer-entered local soil profile
For:
- actual local soil context

### D. Curated crop knowledge base
Initially:
- only a small number of crops
- every property cited
- no fabricated crop data

### E. Farmer priorities
User input, not external data.

This is sufficient to prove the core challenge flow:

NASA DATA
+ LOCAL SOIL
+ CROP CHARACTERISTICS
+ FARMER PRIORITIES
→ ROTATION SCENARIOS
→ EXPLAINABLE COMPARISON

---

# 8. SECOND-WAVE ENHANCEMENTS

Only after the core pipeline works:

1. **HLS-VI**
   - 30 m vegetation evidence / visualization

2. **GPM IMERG**
   - dedicated satellite precipitation evidence

3. **SoilGrids**
   - optional contextual soil estimate only

4. Additional local/regional datasets
   - only after licensing, provenance, scientific value, and relevance are verified

---

# 9. DATA PROVENANCE CONTRACT

Every value entering the system must carry enough metadata to answer:

- What is this value?
- What is its unit?
- Where did it come from?
- Is it measured, observed, modeled, user-entered, estimated, or derived?
- What spatial scale does it represent?
- What time/date does it represent?
- What quality/limitation is important?
- Can a judge reproduce or trace it?

Recommended internal provenance categories:

- `NASA_OBSERVATION_OR_PRODUCT`
- `LOCAL_MEASUREMENT`
- `USER_INPUT`
- `EXTERNAL_REFERENCE`
- `MODELED_ESTIMATE`
- `DERIVED_INDICATOR`
- `AI_GENERATED_EXPLANATION`

AI-generated text must never be confused with scientific source data.

---

# 10. DATA QUALITY RULES

The backend must eventually validate:

- missing values
- fill values
- units
- valid ranges from official product documentation
- quality flags where provided
- timestamps
- coordinate reference systems
- spatial scale
- stale cache
- failed retrievals

Never convert a failed retrieval into synthetic scientific data.

If data cannot be retrieved:

`DATA_UNAVAILABLE`

must be preferable to a fabricated value.

---

# 11. SPATIAL-SCALE RULE

Do not imply more precision than the source provides.

Examples:

- a 9 km SMAP value cannot be called a soil-moisture measurement of one exact field;
- a coarse NASA POWER grid cannot be presented as an on-farm weather station reading;
- a 250 m SoilGrids model prediction cannot be presented as a soil laboratory result.

The UI must disclose scale when it affects interpretation.

---

# 12. INITIAL DEMO-AREA RULE

A demo region must not be selected only because it is convenient.

Before locking the demo location, verify:

- NASA POWER coverage
- SMAP valid coverage
- availability/quality of local soil information
- suitability of candidate crops
- availability of any HLS imagery intended for the demo
- absence of known dataset-quality issues for the chosen period

Saudi Arabia / Al-Kharj may be evaluated as a candidate demo region, but is **not yet scientifically locked** by this document.

Status:

`RESEARCH_REQUIRED`

---

# 13. DATA CACHE POLICY

External scientific APIs should not be queried unnecessarily during a live judge demo.

Future architecture should support:

- source adapters
- local/cache layer
- timestamps
- provenance metadata
- reproducible demo snapshots
- refresh controls

Cached values must retain the original source and acquisition metadata.

---

# 14. SOURCE ADAPTER PRINCIPLE

Do not couple scientific logic directly to external APIs.

Future architecture should expose normalized internal interfaces such as:

- `ClimateObservation`
- `SoilMoistureObservation`
- `SoilProfile`
- `CropProfile`

External systems should be accessed through adapters.

Example concept only:

`POWER Adapter → normalized ClimateObservation`

`SMAP Adapter → normalized SoilMoistureObservation`

This will allow the system to replace or add sources without rewriting the decision engine.

---

# 15. SCIENCE METHOD BOUNDARY

`DATA_SOURCES.md` answers:

**What evidence can we use?**

`SCIENCE_METHOD.md` must answer:

**How do we convert that evidence into a defensible decision?**

Do not put undocumented scoring formulas into `DATA_SOURCES.md`.

The following remain intentionally unresolved:

- scoring equations
- normalization
- thresholds
- weights
- rotation compatibility rules
- soil-health score
- resilience score
- water-conservation score
- uncertainty propagation

Status for all:

`RESEARCH_REQUIRED`

---

# 16. 2026 CHALLENGE RESOURCE RECONCILIATION

The currently available 2026 challenge material provides the Field Shift challenge summary, but the project must remain ready to reconcile this document with any expanded challenge-specific data/resources and final participant guidance NASA publishes later.

When expanded official 2026 Field Shift resources become available:

1. compare them against this document;
2. add NASA-recommended datasets where relevant;
3. remove conflicting assumptions;
4. update source statuses;
5. document the change in Git.

Current status:

`PENDING_OFFICIAL_2026_CONFIRMATION`

---

# 17. DATA-SOURCE DEFINITION OF DONE

A data source is ready for production logic only when:

- official source identified
- variables identified
- units verified
- spatial resolution documented
- temporal resolution documented
- coverage documented
- access method tested
- authentication requirements known
- quality flags understood where applicable
- citation recorded
- usage/license conditions reviewed
- known limitations documented
- provenance mapping implemented
- at least one test sample successfully retrieved
- scientific purpose approved

Until then it remains `CANDIDATE`.

---

# 18. CURRENT IMPLEMENTATION ORDER

Recommended order for future milestones:

1. Verify live NASA POWER API parameters.
2. Retrieve a small POWER sample for one candidate location.
3. Verify SMAP V8 access and retrieve a sample.
4. Define normalized environmental data schema.
5. Design local soil input schema.
6. Select initial demo crops and research each crop.
7. Build crop source records.
8. Write `SCIENCE_METHOD.md`.
9. Only then implement the scenario scoring/decision engine.
10. Add HLS-VI and/or GPM only if they improve the final decision or judge experience.

---

# 19. PROHIBITIONS

Codex must NOT:

- invent missing NASA observations;
- invent crop characteristics;
- invent soil measurements;
- invent API response examples and treat them as real;
- create scientific thresholds from intuition;
- use SoilGrids as if it were a local soil test;
- mix source data and derived values without provenance;
- label model output as direct satellite measurement when it is not;
- select datasets purely because they are easy to code;
- add more datasets without a documented purpose.

---

# 20. RESEARCH BASELINE REFERENCES

## NASA

1. NASA Space Apps Challenge 2026 — Field Shift: Adapting Farms with NASA Data  
   https://www.spaceappschallenge.org/2026/challenges/field-shift-adapting-farms-with-nasa-data/

2. NASA POWER — Daily API  
   https://power.larc.nasa.gov/docs/services/api/temporal/daily/

3. NASA POWER — Agroclimatology community  
   https://power.larc.nasa.gov/docs/methodology/communities/

4. NASA POWER — Parameter Dictionary  
   https://power.larc.nasa.gov/parameters/

5. SMAP L4 Global 3-hourly 9 km Surface and Root Zone Soil Moisture V8  
   https://nsidc.org/data/spl4smgp/versions/8  
   DOI: 10.5067/T5RUATAQREF8

6. GPM IMERG collections — NASA GES DISC / CMR  
   https://cmr.earthdata.nasa.gov/search/site/collections/directory/GES_DISC/gov.nasa.eosdis

7. HLS Vegetation Indices products  
   HLSL30_VI.002 — DOI: 10.5067/HLS/HLSL30_VI.002  
   HLSS30_VI.002 — DOI: 10.5067/HLS/HLSS30_VI.002

8. NASA AppEEARS  
   https://appeears.earthdatacloud.nasa.gov/

## Soil

9. ISRIC SoilGrids  
   https://isric.org/explore/soilgrids

10. SoilGrids documentation  
    https://docs.isric.org/globaldata/soilgrids/

## Crop / Agronomy

11. FAO ECOCROP  
    https://www.fao.org/land-water/resources/tools/databases/ecocrop/en

12. FAO CROPWAT  
    https://www.fao.org/land-water/resources/tools/software/cropwat/en

13. FAO Conservation Agriculture  
    https://www.fao.org/conservation-agriculture/

---

# 21. FINAL RULE

The objective is not to collect the largest number of datasets.

The objective is to use the **smallest defensible set of high-value sources** that makes the crop-rotation decision:

- relevant,
- explainable,
- reproducible,
- scientifically traceable,
- and clearly powered by NASA Earth data.
