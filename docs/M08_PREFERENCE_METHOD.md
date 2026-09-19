# FieldShift AI — M08 Evidence-Backed Farmer Preference Methodology Proposal

Status: RESEARCH PROPOSAL — implementation approval required

## 1. Purpose and decision boundary

This document defines a safe boundary for the Farmer Preference Layer. It does not authorize a ranking engine, a numeric score, scientific weights, crop coefficients, yield claims, or changes to scientific application logic.

A farmer priority is a user value: it communicates which already-available evidence the farmer wants to inspect first. It is not evidence, a scientific parameter, or a claim that one scenario is objectively better.

The proposed M08 outcome is **B — preference-aligned comparison without declaring a universal winner**. The UI may group or foreground available, source-backed descriptor evidence for a selected priority. It must not sort, rank, penalize, or label scenarios as “best” until a separately approved method defines complete, comparable evidence for every evaluated dimension.

## 2. Current FieldShift inputs and limits

| Existing input | Current safe use | Limitation |
| --- | --- | --- |
| NASA POWER daily temperature, precipitation, and relative humidity | Environmental context and provenance only | The current suitability service leaves growing-period climate factors `UNKNOWN` because a local planting calendar is not approved. Current POWER integration does not implement a crop-water method. |
| SMAP SPL4SMGP V8 surface/root-zone moisture | Soil-moisture context and limitation evidence | A 9 km model/data-assimilation context product; it is not crop water requirement, irrigation requirement, or field measurement. |
| Local SoilProfile | Qualitative suitability-factor evidence where a sourced crop requirement and local input exist | Organic matter, nutrient, salinity, and water-holding data may be absent; no soil-health trend method exists. |
| Crop profiles | Family identity; sourced chickpea legume descriptor; individual crop suitability evidence | `water_requirements` are empty. No approved crop calendar, cultivar, coefficient, yield, residue, root-depth, or water-productivity record is present. |
| M07 RotationAssessment | Distinct crop/family counts, repeated crop/family flags, chickpea legume presence, sourced warnings and provenance | These are descriptors, not quantified effects, compatibility rules, or agronomic recommendations. |
| M06 Suitability results | Factor status, limiting factors, unknowns, evidence, and limitations | Suitability is not yield, productivity, crop water demand, or resilience. `UNKNOWN` is not negative evidence. |

## 3. Definitions

### Water conservation

For M08, water conservation means comparison of a documented water-demand or irrigation-requirement method for a specified crop, location, planting period, management context, and water source. It does **not** mean comparing a single SMAP soil-moisture value or assuming that a crop with lower observed moisture uses less water.

### Soil health

For M08, soil health is not a single generic crop property. It must be represented by identified soil functions or outcomes, such as soil organic matter, nutrient cycling, structure, biological activity, or erosion-related conditions, with an applicable source, baseline, measurement/indicator method, and time horizon.

### Resilience

For M08, resilience means the capacity of the agricultural system to resist, absorb, adapt to, or recover from disturbances while maintaining its relevant functions. It is not a hidden scenario score. This definition is aligned with FAO’s resilience framing for food and agricultural systems.

### Productivity

For M08, productivity means an explicitly named output measure, such as observed yield, modelled attainable yield, biomass, or water productivity, with location, season, crop/cultivar, management assumptions, units, and provenance. Suitability alone is not productivity.

## 4. Dimension assessment

### 4.1 Water conservation — INSUFFICIENT_DATA

**Authoritative method basis.** FAO’s Crop-ET0 guidance (FAO Irrigation and Drainage Paper 56) estimates reference and crop evapotranspiration from meteorological data, crop coefficients, crop growth stages, and ecological conditions. A defensible crop-water comparison therefore needs, at minimum:

- a source-backed, crop- and growth-stage-specific coefficient or another approved crop-water method;
- a location- and season-specific crop calendar/growth period;
- the meteorological inputs required by the selected method, with temporal coverage and quality control;
- effective precipitation or an approved rainfall-use method;
- irrigation-system, irrigation-schedule, and water-source assumptions where irrigation requirement is compared;
- root-zone/soil-water-balance inputs where the method needs them, including applicable soil profile and water-holding information; and
- provenance and uncertainty for every derived output.

**Existing evidence.** POWER offers only environmental context in the current product. The crop profiles have no populated `water_requirements`; no crop coefficient, crop calendar, effective-precipitation method, irrigation context, or approved soil-water-balance method exists. SMAP may remain contextual evidence about modelled soil moisture, but must not be mapped directly to crop demand or irrigation need.

**Permitted now.** Display source status, observations, and the explicit statement `WATER_CONSERVATION_EVIDENCE_UNAVAILABLE` for comparison/order. Do not compare water demand, irrigation demand, or water efficiency.

**Readiness:** `INSUFFICIENT_DATA`.

### 4.2 Soil health — READY_FOR_IMPLEMENTATION (qualitative descriptors only)

**Authoritative evidence.** FAO Conservation Agriculture’s species-diversification guidance describes crop rotation as supporting crop-specific pest/disease carry-over prevention and describes diverse rotations, roots at different depths, nutrient recycling, and related soil processes. FAO’s integrated soil-management guidance also emphasizes that rotation effects depend on zone, soils, management, climate, weeds, diseases, pests, and residue context.

**Existing evidence that can be displayed.** The M07 assessment already provides source-linked, scenario-specific descriptors:

- distinct crop count and distinct family count;
- repeated-crop and repeated-family flags with sourced warnings;
- sourced chickpea legume presence; and
- documented benefits, risks, unknowns, limitations, and provenance.

**Allowed mapping.** When a farmer selects soil health, present these descriptors side-by-side as evidence relevant to rotation diversity and carry-over risk. Explain the precise descriptor and attached source; do not translate it into “soil-health points,” a soil-health grade, a universal benefit, or an ordering rule. Legume presence is a sourced descriptor, not proof that every scenario improves soil health. Rooting diversity, organic-matter contribution, nitrogen contribution, and residue effects require crop- and context-specific sources before they can be compared.

**Additional data needed for stronger comparison.** A chosen outcome/indicator; baseline and follow-up soil measurements or an approved model; soil depth, management and residue handling; crop-specific root/residue/biological nitrogen information; time horizon; and location-appropriate applicability evidence.

**Readiness:** `READY_FOR_IMPLEMENTATION` for evidence-aligned qualitative comparison only. Ranking remains `RESEARCH_REQUIRED`.

### 4.3 Resilience — READY_FOR_IMPLEMENTATION (qualitative descriptors only)

**Authoritative evidence.** FAO identifies enhanced resilience of people, communities, and ecosystems as central to sustainable food and agriculture, and reports that diversified agroecological systems can have greater capacity to recover from disturbances and resist pest and disease attack. FAO also identifies crop rotations, including legumes, as temporal diversity and notes that diversification can strengthen ecological and socio-economic resilience.

**Existing evidence that can be displayed.** Use only the sourced M07 diversity descriptors, repeated crop/family warnings, legume descriptor, and their provenance. M06 limiting factors/unknowns may be shown separately as crop-specific available evidence, but they cannot be converted to a resilience score. The current climate assessment contains `UNKNOWN` growing-period factors and therefore cannot support claims about temperature/rainfall resilience.

**Allowed mapping.** For a resilience priority, display an evidence panel titled “rotation-diversity and risk descriptors” rather than a resilience rating. Explicitly state that the panel does not measure farm resilience, drought tolerance, or recovery capacity.

**Additional data needed for stronger comparison.** A defined disturbance set and scale; crop/cultivar sensitivity and management information; location- and crop-calendar-aligned climate exposure; water-dependence method; pest/disease context; and a sourced validation approach.

**Readiness:** `READY_FOR_IMPLEMENTATION` for transparent qualitative descriptors only. Ranking remains `RESEARCH_REQUIRED`.

### 4.4 Productivity — RESEARCH_REQUIRED

**Authoritative method basis.** FAO AquaCrop documents that crop-yield modelling requires weather data, calibrated/validated crop characteristics, soil profile characteristics, and management/irrigation inputs. Its calculation scheme distinguishes canopy development, transpiration, biomass, and harvest index. FAO GAEZ potential-yield material also distinguishes crop calendars, agro-climatic, soil, terrain, and management assumptions.

**Existing evidence.** FieldShift has no approved yield, attainable-yield, cultivar, harvest-index, water-productivity, management, or locally valid crop-calendar data. The M06 qualitative suitability result must not be used as a yield proxy.

**Permitted now.** Return `PRODUCTIVITY_EVIDENCE_UNAVAILABLE` / `PREFERENCE_EVIDENCE_UNAVAILABLE`; do not compare or infer productivity.

**Readiness:** `RESEARCH_REQUIRED`.

## 5. User-priority and evidence separation

1. Preserve entered and normalized preferences as user-controlled values only.
2. Evaluate and store scientific/rotation evidence independently, with provenance, source status, limitations, and unknowns.
3. For each selected priority, show only evidence that has the readiness and coverage required by this document.
4. State whether the priority has available qualitative evidence, unavailable evidence, or unknown scenario evidence.
5. Never change a scientific factor result, NASA observation, provenance record, or uncertainty when a user changes a priority.

No multiplication, weighted sum, score, threshold, default priority, or hidden tie-break is proposed or authorized.

## 6. Missing-data rules

- `UNKNOWN`, `UNAVAILABLE`, and missing evidence are not negative evidence and must not reduce a scenario’s standing.
- A dimension with unavailable evidence is displayed as unavailable and excluded from any future qualified comparison statement; it is not converted to zero.
- If one scenario has a descriptor and another lacks evidence, show the asymmetry and provenance. Do not infer that the second scenario is worse.
- Productivity remains unavailable independently; it must not block the display of available soil-health or resilience descriptors.
- Source outages preserve their source status and limitation. Demo/cached observations retain their own provenance and must not be described as live data.

## 7. Proposed comparison and explanation method

### Allowed now: evidence-aligned comparison

The product may let a farmer select one or more priorities and then organize the comparison view into separate evidence sections:

- **Soil health:** rotation diversity, repetition flags, chickpea-legume descriptor, documented risks/benefits, and limitations.
- **Resilience:** the same rotation-diversity/risk descriptors, clearly scoped as partial evidence rather than a resilience measure.
- **Water conservation:** unavailable until an approved crop-water methodology and inputs exist.
- **Productivity:** unavailable until an approved productivity/yield methodology and inputs exist.

Every section must show: the user priority label, the scenario-specific evidence, the source/provenance, the limitation, and an explicit absence/unknown state where relevant. The result is a comparison aid, not a recommendation or universal winner.

### Not allowed now

- ordering scenarios by a total preference score;
- declaring a scenario “best,” “more water efficient,” “better for soil health,” “more resilient,” or “more productive”;
- using SMAP soil moisture as crop water requirement;
- deriving water demand from precipitation, suitability, or a crop family without an approved method;
- treating legumes, diversity, or non-repetition as universally beneficial in all soils, climates, and management systems;
- inferring yield from suitability; and
- treating missing evidence as a penalty.

## 8. Conditions for any future ordering

Scenario ordering is **not currently defensible**. It may be reconsidered only after a separate approved methodology defines: the dimensions being compared; complete and comparable source-backed evidence; scenario coverage and eligibility; treatment of uncertainty/missingness; no-data behavior; explainable tie/partial-order behavior; validation cases; and a review of location/crop applicability. Any numerical aggregation would require explicit project approval and source-backed scientific justification.

## 9. Sources consulted

- FAO. [Crop Evapotranspiration (Crop-ET0)](https://www.fao.org/land-water/land/land-governance-and-planning/land-resources-planning-toolbox/detail/crop-evapotranspiration-%28crop-et0%29/en) — FAO Irrigation and Drainage Paper 56 method overview.
- FAO. [Species diversification — Crop rotation](https://www.fao.org/conservation-agriculture/in-practice/species-diversification/en/) — rotation, diversity, roots, nutrients, and pest/disease carry-over context.
- FAO. [Resilience — The 10 Elements of Agroecology](https://www.fao.org/agroecology/overview/the-10-elements-of-agroecology/resilience/en) and [Diversity](https://www.fao.org/agroecology/overview/the-10-elements-of-agroecology/diversity/en) — resilience and diversification framing.
- FAO. [AquaCrop input requirements](https://www.fao.org/aquacrop/overview/input-requirements/) and [calculation scheme](https://www.fao.org/aquacrop/overview/calculation-scheme/) — yield-model inputs and model components.
- FAO. [GAEZ agro-climatic potential yield](https://data.fao.org/catalog/dataset/gaez-v5-master-config/resource/d15c9f34-1ae0-400e-835d-7a0134ed26db) — crop-calendar, soil, climate, and management assumptions in potential-yield context.

## 10. Unresolved research questions

1. Which crop-water methodology, coefficients/parameters, and effective-precipitation method are appropriate for each supported crop and location?
2. What local crop calendar and irrigation-context model can be sourced globally with sufficient granularity?
3. Which measured soil-health outcomes and time horizon will FieldShift support?
4. Which resilience disturbances and system boundary are relevant to the product’s intended use?
5. Which yield/productivity evidence source and validation design are appropriate without presenting modelled output as observed yield?
6. Whether a future validated method should use qualified ordering, a partial order, or continue with comparison without a winner.
