# FieldShift AI — Project Rules

Status: ACTIVE
Version: 1.0
Event: 2026 NASA International Space Apps Challenge
Challenge: Field Shift: Adapting Farms with NASA Data

## 1. Mission

FieldShift AI is an evidence-based agricultural decision-support system.

FieldShift AI is a globally scalable agricultural decision-intelligence platform that helps farmers understand what they can grow, whether a selected crop is suitable, which environmental and soil constraints matter, which supported alternatives may be more appropriate, how crop rotations can be planned, and—only where verified economic data exists—whether options are economically attractive.

FieldShift AI is a globally scalable platform, not a Saudi Arabia-only product. Users may evaluate agricultural locations in any country where required NASA environmental data and crop/soil reference information are available. Saudi Arabia / Al-Kharj is a possible demonstration or validation case only.

Its purpose is to help farmers explore crop-rotation strategies by
combining:

1. NASA Earth observation data
2. Local soil information
3. Crop characteristics
4. Farmer priorities

The system should help users understand trade-offs related to:
- soil health
- water conservation
- changing environmental conditions
- agricultural resilience

The project is NOT a generic farming dashboard.

NASA Earth observation data must materially influence the analysis or
recommendations produced by the system.

Economic feasibility is an additional, source-aware decision-support layer; it must never replace the NASA, soil, crop-science, or crop-rotation core.

## 2. Core Product Principle

Every major feature must answer at least one of these questions:

- Does it help a farmer understand changing environmental conditions?
- Does it meaningfully use NASA Earth observation data?
- Does it improve crop-rotation decision making?
- Does it incorporate soil conditions?
- Does it incorporate crop characteristics?
- Does it incorporate farmer priorities?
- Does it help evaluate soil health, water conservation, or resilience?
- Does it make the scientific reasoning more understandable?

Features that answer NONE of these questions are not MVP priorities.

## 3. Evidence First

No scientific or agricultural claim may be invented.

Never invent:

- NASA datasets
- NASA observations
- API responses
- dataset variables
- scientific formulas
- scoring weights
- agricultural thresholds
- crop properties
- soil properties
- citations
- model accuracy
- research results

If verified evidence is unavailable, mark the requirement:

SOURCE REQUIRED

or:

PENDING OFFICIAL 2026 CONFIRMATION

Do not silently substitute assumptions for evidence.

## 4. NASA Data Rule

NASA data must be part of the functional reasoning of the solution,
not merely decorative content.

Using a NASA map, image, logo, or visualization alone does NOT satisfy
this project rule.

For every NASA dataset eventually approved for use, DATA_SOURCES.md
must document:

- dataset name
- NASA mission/program/provider
- official source URL
- variables used
- spatial resolution
- temporal resolution
- geographic coverage
- access method/API
- preprocessing
- role in FieldShift AI
- known limitations
- citation
- licensing/usage information when applicable

No dataset may enter production logic until documented and approved.

## 5. Data Provenance

Every external data source must be traceable.

The system should distinguish whenever applicable between:

- satellite/observational data
- measured local data
- user-entered data
- externally sourced reference data
- derived values
- estimated values
- model-generated outputs

Estimated or derived information must never be presented as direct
measurement.

## 6. Scientific Method

Scientific logic belongs in SCIENCE_METHOD.md.

Any decision rule, formula, scoring system, weighting scheme,
transformation, threshold, or agricultural recommendation must have:

- purpose
- inputs
- method
- source/evidence
- assumptions
- limitations
- validation approach

Codex must not create scientific formulas simply to make the
application function.

If scientific methodology has not been approved, implement interfaces
or placeholders rather than fabricated logic.

## 7. Explainability

FieldShift AI must not behave as a black-box recommendation generator.

Recommendations should eventually explain:

- why a rotation was suggested
- which environmental observations influenced it
- which soil characteristics influenced it
- which crop characteristics influenced it
- how farmer priorities affected the result
- important risks or limitations
- uncertainty where appropriate

## 8. Farmer Priorities

The architecture must support different farmer objectives.

Examples may eventually include:

- water conservation
- soil health
- climate resilience
- crop productivity
- economic considerations

These examples are conceptual until their scientific and product
definitions are approved.

Do not assign weights yet.

## 9. Scenario Comparison

The product should be designed to support comparison of alternative
crop-rotation strategies rather than returning only one unexplained
answer.

Potential comparisons may include environmental suitability,
water-related indicators, soil effects, resilience, risks, and other
approved metrics.

Exact metrics remain subject to scientific validation.

Scientific/agronomic suitability and economic attractiveness must remain separate, explainable outputs. They must not be collapsed into one unexplained score.

## 10. AI Usage

AI is an assisting technology, not an authority for scientific truth.

AI may eventually assist with:

- explanation
- summarization
- interaction
- pattern discovery
- development assistance

AI must NOT fabricate:

- NASA observations
- agricultural evidence
- citations
- scientific conclusions
- dataset values

All project AI usage must be documented in AI_USAGE.md.

AI-generated code, data, media, or other content must be disclosed
where required by the applicable NASA Space Apps submission rules.

## 11. Source and Attribution Rule

Every external resource used by the project must be documented.

This includes, where applicable:

- datasets
- APIs
- research papers
- code
- libraries
- images
- icons
- maps
- text
- models
- AI tools
- third-party services

Do not assume that "free" or "open source" means attribution is
unnecessary.

## 12. Open Source and Licensing

The project must remain suitable for the NASA Space Apps open-source
submission requirements.

Do not add assets, datasets, software, or other materials whose
licensing prevents compliant public distribution of the project.

Licensing must be reviewed before final submission.

Final project license selection must be explicitly approved by the
project team.

## 13. NASA Branding

Do not use NASA branding in a way that suggests NASA endorsement,
authorization, sponsorship, or ownership of FieldShift AI.

Do not add NASA logos, mission identifiers, or branding assets without
checking the applicable official usage rules.

NASA data attribution and NASA branding are separate concerns.

## 14. Privacy and Sensitive Information

Do not commit:

- API keys
- passwords
- tokens
- private credentials
- personally identifiable information
- confidential information

Secrets must use environment variables and must never enter Git.

## 15. Engineering Rules

The project will favor:

- modular architecture
- reproducibility
- testability
- clear data provenance
- documented interfaces
- maintainability
- graceful failure
- accessibility
- transparent reasoning

Do not over-engineer the MVP.

Do not implement nonessential authentication, admin dashboards,
payments, social features, or decorative features unless explicitly
approved.

## 16. Repository Governance

Before implementing a task, Codex must consult:

1. PROJECT_RULES.md
2. REQUIREMENTS.md
3. TODO.md
4. DATA_SOURCES.md when data is involved
5. SCIENCE_METHOD.md when scientific logic is involved
6. ARCHITECTURE.md when architectural changes are involved
7. AI_USAGE.md when AI is involved

PROJECT_RULES.md has governance priority if another internal document
conflicts with it.

Do not silently change project scope.

## 17. Development Workflow

Work must proceed through approved milestones.

Do not implement future milestones simply because they are technically
possible.

For every significant implementation task:

READ → PLAN → IMPLEMENT → TEST → DOCUMENT → REPORT

Do not proceed to the next milestone without approval.

## 18. Definition of Done

A feature is not complete merely because it runs.

Where applicable it must also have:

- documented purpose
- traceable data sources
- scientific justification
- tests
- error handling
- limitations
- user-facing explanation
- updated documentation

## 19. NASA Submission Readiness

Throughout development, preserve the information required to explain:

- the problem
- the proposed solution
- how the solution addresses Field Shift
- how NASA data is used
- how other data is used
- scientific methodology
- technology used
- AI usage
- project limitations
- sources and attribution
- team contribution
- final demo

Do not wait until submission weekend to reconstruct this information.

## 20. Submission Rules Versioning

The official 2026 Project Submission Guide and final challenge
resources may change or be published later.

Therefore:

- Never treat previous-year submission details as automatically valid
  for 2026.
- Previous NASA Space Apps guides may be used for planning only.
- Requirements specific to 2026 must be verified against official
  2026 materials when available.
- Mark unresolved items:
  PENDING OFFICIAL 2026 CONFIRMATION

## 21. Stop Conditions

Codex must stop and request clarification when:

- a scientific source is missing
- required data provenance is unknown
- two project documents conflict
- implementation requires an unapproved assumption
- licensing is unclear
- NASA compliance is uncertain
- scope would materially change

Do not solve uncertainty by inventing information.
