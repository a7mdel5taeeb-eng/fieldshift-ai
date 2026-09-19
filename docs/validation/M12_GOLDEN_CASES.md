# FieldShift AI — M12 Golden-Case Validation Note

Status: ACTIVE — M12 validation baseline.

## Scope

This note documents reproducible regression cases for the current, approved workflow. They validate documented behavior; they do not add scientific methodology, crop requirements, NASA observations, thresholds, scores, rankings, or recommendations.

The structured fixtures are in `backend/tests/golden/cases.json`. The demo location is a validation case only and does not limit FieldShift AI’s global scope.

## Cases

### GC-001 — Demo snapshot wheat

- Location/date: `24.7, 47.3`; `2025-01-01`.
- Crop: sourced wheat profile.
- NASA mode: `DEMO_SNAPSHOT`, using the existing validated POWER and SMAP V8 normalized snapshot.
- Soil input: controlled, explicitly farmer-provided regression input (`pH`, texture, drainage). It is not a laboratory record or a claim about the demo location.
- Expected behavior: the five POWER variables and two SMAP layers preserve source/provenance; climate and salinity remain `UNKNOWN`; supported soil factors retain their factor-level results; no limiting factor, score, or recommendation is introduced.

### GC-002 — Incomplete-evidence chickpea

- Location/date: `24.7, 47.3`; `2025-01-01`.
- Crop: sourced chickpea profile.
- NASA mode: simulated `UNAVAILABLE` to validate graceful degradation.
- Soil input: one controlled farmer-provided texture value; pH and drainage are intentionally missing.
- Expected behavior: texture can be evaluated against the sourced record; missing climate, pH, salinity, and drainage evidence remains `UNKNOWN`; the unavailable NASA sources do not turn into negative scientific evidence.

### GC-003 — Rotation descriptors and preferences

- Rotation: wheat → wheat → chickpea.
- NASA mode: `LIVE_DATA` is the documented normal-source mode; this descriptor-only case does not make an external NASA request in automated regression tests.
- Expected behavior: crop/family diversity, repeated crop/family flags, and sourced chickpea-legume presence stay stable. Soil-health and resilience priorities only foreground these qualitative descriptors. Water conservation and productivity remain `PREFERENCE_EVIDENCE_UNAVAILABLE`. No score, rank, universal winner, or crop recommendation is produced.

## Scientific consistency review

- Existing suitability thresholds and crop requirements are read from the already reviewed FAO ECOCROP crop records; this validation adds none.
- The planting calendar remains unapproved, so climate suitability factors remain `UNKNOWN`.
- No yield or productivity result is inferred from suitability.
- SMAP remains a 9 km model/data-assimilation context product, not a field sensor.
- Water-conservation comparison remains unavailable without an approved crop-water methodology; productivity remains unavailable without an approved yield/productivity methodology.
- `UNKNOWN` and `UNAVAILABLE` are asserted as explicit non-penalizing states.

## End-to-end coverage

Backend tests execute the same API endpoints used by the workflow for demo fallback, unavailable-source degradation, suitability, rotations, preferences, evidence/provenance, and source status. Existing frontend tests cover English/Arabic, LTR/RTL, source labels, evidence, and partial-failure presentation. Manual browser checks remain appropriate for final visual/mobile review.
