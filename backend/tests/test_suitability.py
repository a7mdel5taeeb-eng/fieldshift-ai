from app.repositories.crops import CropRepository
from app.schemas.domain import SoilProfile
from app.services.suitability import classify_numeric, evaluate


def test_sourced_ph_inside_optimum_is_suitable() -> None:
    crop = CropRepository().get("wheat")
    assert classify_numeric("soil_pH", 6.5, crop.soil_requirements["ph"], crop.sources).status == "SUITABLE"


def test_sourced_ph_outside_absolute_is_limiting() -> None:
    crop = CropRepository().get("wheat")
    result = evaluate(crop, SoilProfile(pH=9))
    assert "soil_pH" in result.limiting_factors


def test_missing_soil_is_unknown_and_no_score_exists() -> None:
    result = evaluate(CropRepository().get("chickpea"), SoilProfile())
    assert "soil_pH" in result.unknown_factors
    assert "score" not in result.model_dump()


def test_multiple_factor_result_preserves_provenance() -> None:
    result = evaluate(CropRepository().get("alfalfa"), SoilProfile(pH=7, texture="light", drainage="well (dry spells)"))
    assert len(result.factor_results) == 6
    assert result.provenance[0].source_name == "FAO ECOCROP"


def test_local_salinity_uses_only_documented_fao_classes() -> None:
    wheat = CropRepository().get("wheat")
    assert next(item for item in evaluate(wheat, SoilProfile(salinity=3.9)).factor_results if item.factor == "salinity").status == "SUITABLE"
    assert next(item for item in evaluate(wheat, SoilProfile(salinity=7)).factor_results if item.factor == "salinity").status == "MARGINAL"
    assert next(item for item in evaluate(wheat, SoilProfile(salinity=11)).factor_results if item.factor == "salinity").status == "LIMITING"
    assert next(item for item in evaluate(wheat, SoilProfile()).factor_results if item.factor == "salinity").status == "UNKNOWN"
