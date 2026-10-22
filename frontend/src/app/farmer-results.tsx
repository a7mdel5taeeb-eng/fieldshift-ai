import { useState } from "react";
import { useTranslation } from "react-i18next";
import { normalizeSourceStatus } from "./source-status";

type DataResult = Record<string, unknown> | null;
type Priorities = Record<"water_conservation" | "soil_health" | "resilience" | "productivity", number>;
type Factor = { factor: string; status: "SUITABLE" | "MARGINAL" | "LIMITING" | "UNKNOWN"; limitation?: string };
type ScenarioProfile = {
  scenario_id: string;
  scientific_profile: { crops: string[]; diversity_descriptors: Record<string, number>; legume_presence: boolean; repeated_crop_flags: string[]; repeated_family_flags: string[] };
  foregrounded_dimensions: string[];
};

const powerNames: Record<string, string> = { T2M: "temperature", T2M_MIN: "temperatureMin", T2M_MAX: "temperatureMax", PRECTOTCORR: "rainfall", RH2M: "humidity" };
const factorNames: Record<string, string> = { temperature: "temperature", precipitation: "rainfall", soil_pH: "soilPh", soil_texture: "soilTexture", salinity: "salinity", drainage: "drainage" };

function observations(result: DataResult): Array<Record<string, unknown>> {
  return Array.isArray(result?.data) ? result.data as Array<Record<string, unknown>> : [];
}

function formatObservation(item: Record<string, unknown>, locale: string, maximumFractionDigits: number) {
  const value = typeof item.value === "number" ? new Intl.NumberFormat(locale, { maximumFractionDigits }).format(item.value) : item.value ?? "—";
  return `${value} ${item.unit ?? ""}`.trim();
}

export function FarmerResults({ environment, moisture, suitability, scenarios, priorities, soil, onImproveInputs = () => {}, onLoadReferenceCase = () => {} }: { environment: DataResult; moisture: DataResult; suitability: DataResult; scenarios: ScenarioProfile[]; priorities: Priorities; soil: { source_type: string; texture: string; pH: string; drainage: string; salinity?: string }; onImproveInputs?: () => void; onLoadReferenceCase?: () => void }) {
  const { t, i18n } = useTranslation();
  const [scenarioPage, setScenarioPage] = useState(0);
  const [activeScenarioId, setActiveScenarioId] = useState("");
  const [pathView, setPathView] = useState<"varied" | "all">("varied");
  const climate = observations(environment);
  const water = observations(moisture);
  const factors = (suitability?.factor_results ?? []) as Factor[];
  const factor = (name: string) => factors.find((item) => item.factor === name);
  const status = (value: unknown) => t(`results.statuses.${String(value ?? "UNKNOWN")}`);
  const sourceLabel = (result: DataResult) => t(`sourceStatus.${normalizeSourceStatus(result?.source_status)}`);
  const sourceClass = (result: DataResult) => normalizeSourceStatus(result?.source_status).toLowerCase();
  const smapError = Array.isArray(moisture?.errors) ? String(moisture.errors[0] ?? "") : "";
  const smapMessage = smapError === "SMAP_AUTH_CONFIG_REQUIRED" || smapError === "SMAP_AUTHORIZATION_FAILED" ? t("resultGuide.smapAuth") : smapError === "SMAP_LOCATION_OUTSIDE_COVERAGE" ? t("resultGuide.smapCoverage") : smapError === "SMAP_GRANULE_NOT_FOUND" ? t("resultGuide.smapNotFound") : t("resultGuide.smapOther");
  const factorReason = (reason: string) => reason.startsWith("CLIMATE_GROWING_PERIOD_UNDEFINED") ? t("resultGuide.calendarMissing") : reason.toLowerCase().includes("salinity") ? t("salinityUX.missing") : reason.includes("Local value or sourced crop requirement is unavailable") ? t("resultGuide.localOrReferenceMissing") : reason.replace(/^[A-Z_]+:\s*/, "");
  const cropName = (id: string) => t(`workspace.cropNames.${id}`, { defaultValue: id });
  const drainageKey: Record<string, string> = { "well (dry spells)": "well", "excessive (dry/moderately dry)": "excessive", "poorly (saturated >50% of year)": "poorly" };
  const variedScenarios = scenarios.filter((scenario) => scenario.scientific_profile.repeated_crop_flags.length === 0);
  const canFilterVariety = variedScenarios.length > 0 && variedScenarios.length < scenarios.length;
  const displayedScenarios = pathView === "varied" && canFilterVariety ? variedScenarios : scenarios;
  const pageCount = Math.max(1, Math.ceil(displayedScenarios.length / 6));
  const currentPage = Math.min(scenarioPage, pageCount - 1);
  const visibleScenarios = displayedScenarios.slice(currentPage * 6, currentPage * 6 + 6);
  const activeScenario = visibleScenarios.find((scenario) => scenario.scenario_id === activeScenarioId) ?? visibleScenarios[0];
  const unknownFactors = factors.filter((item) => item.status === "UNKNOWN").length;
  const missing = (name: string) => factor(name)?.status === "UNKNOWN";
  const actions = [
    missing("soil_pH") && t("farmerResults.actions.ph"),
    missing("soil_texture") && t("farmerResults.actions.texture"),
    missing("drainage") && t("farmerResults.actions.drainage"),
    missing("salinity") && !soil.salinity && t("salinityUX.action"),
    missing("temperature") && t("farmerResults.actions.calendar"),
    !water.length && t("farmerResults.actions.water"),
  ].filter(Boolean) as string[];
  const isArabic = i18n.language.startsWith("ar");
  const hasLocalSoil = Boolean(soil.pH || soil.texture || soil.drainage || soil.salinity);
  const hasRotationChoice = scenarios.some((scenario) => new Set(scenario.scientific_profile.crops).size > 1);
  const readinessTitle = unknownFactors ? (isArabic ? "القرار غير جاهز بعد — وهذه هي الخطوات التي ستجعله مفيدًا" : "This decision is not ready yet — here is what will make it useful") : (isArabic ? "الأدلة المتاحة جاهزة للمراجعة" : "The available evidence is ready to review");
  const smapFix = isArabic ? "بيانات SMAP المباشرة تحتاج ربط NASA Earthdata لهذا الموقع. يمكنك مراجعة الحالة الموثقة الآن، أو إعداد الرمز في الخادم لبيانات موقعك." : "Live SMAP for this location needs NASA Earthdata configured on the server. Review the documented case now, or configure the server token for your location.";
  const singleCropNote = isArabic ? "لم نعرض تناوبًا مكررًا لنفس المحصول. أضف محصولًا ثانيًا مختلفًا لاستكشاف مسارات تناوب حقيقية." : "We did not display a repeated single-crop rotation. Add a different second crop to explore meaningful rotation paths.";

  return <>
    <section className="farm-summary" aria-label={t("farmerResults.summaryTitle")}><div><p className="section-kicker">{t("farmerResults.summaryKicker")}</p><h2>{t("farmerResults.summaryTitle")}</h2><p>{t("farmerResults.summaryText")}</p></div><div className="summary-readout"><span>{t("decisionBoard.readout")}</span><strong>{t("decisionBoard.unknownCount", { count: unknownFactors })}</strong><p>{t("farmerResults.summaryNote")}</p></div></section>
    <section className="decision-readiness" aria-label={readinessTitle}><div><p className="section-kicker">{isArabic ? "قبل اتخاذ قرار" : "Before making a decision"}</p><h3>{readinessTitle}</h3><p>{unknownFactors ? (isArabic ? "نعرض لك ما ينقص بدل تحويل النقص إلى توصية وهمية. ابدأ بأقصر خطوة لها أثر على هذا التحليل." : "Missing evidence is shown instead of being converted into a false recommendation. Start with the shortest action that improves this analysis.") : (isArabic ? "راجع المصادر والقيود قبل اتخاذ قرار ميداني." : "Review the sources and limitations before making a field decision.")}</p></div><div className="readiness-actions"><div className={hasLocalSoil ? "readiness-item ready" : "readiness-item"}><span>{hasLocalSoil ? "✓" : "01"}</span><p><strong>{isArabic ? "بيانات التربة" : "Soil inputs"}</strong><small>{hasLocalSoil ? (isArabic ? "تم إدخال بعض حقائق التربة المحلية." : "Some local soil facts are available.") : (isArabic ? "أضف pH أو نسيج التربة أو الصرف لتقييم عوامل المحصول." : "Add pH, texture, or drainage to evaluate crop factors.")}</small></p></div><div className={water.length ? "readiness-item ready" : "readiness-item"}><span>{water.length ? "✓" : "02"}</span><p><strong>NASA SMAP</strong><small>{water.length ? (isArabic ? "يتوفر سياق رطوبة التربة لهذا التشغيل." : "Soil-moisture context is available for this run.") : smapFix}</small></p></div><div className={hasRotationChoice ? "readiness-item ready" : "readiness-item"}><span>{hasRotationChoice ? "✓" : "03"}</span><p><strong>{isArabic ? "خيار تناوب" : "Rotation choice"}</strong><small>{hasRotationChoice ? (isArabic ? "توجد محاصيل مختلفة لاستكشاف مسار تناوب." : "Different crops are available to explore a rotation path.") : singleCropNote}</small></p></div><div className="readiness-buttons"><button type="button" className="primary-button" onClick={onImproveInputs}>{isArabic ? "حسّن مدخلات المزرعة" : "Improve farm inputs"}</button>{!water.length && <button type="button" className="secondary-button" onClick={onLoadReferenceCase}>{isArabic ? "افتح حالة SMAP الموثقة" : "Open documented SMAP case"}</button>}</div></div></section>
    <section className="source-overview" aria-label={t("resultGuide.sourceOverview")}><div className="source-overview-heading"><div><p className="section-kicker">{t("resultGuide.sourceOverview")}</p><p>{t("resultGuide.sourceOverviewNote")}</p></div></div><div className="source-overview-grid">
      <article><span className="source-symbol">☼</span><div><strong>NASA POWER</strong><small>{t("resultGuide.climate")}</small></div><span className={`source-pill ${sourceClass(environment)}`}>{sourceLabel(environment)}</span></article>
      <article><span className="source-symbol">≈</span><div><strong>NASA SMAP</strong><small>{t("resultGuide.moisture")}</small></div><span className={`source-pill ${sourceClass(moisture)}`}>{sourceLabel(moisture)}</span></article>
      <article><span className="source-symbol">◈</span><div><strong>FAO ECOCROP</strong><small>{t("resultGuide.cropReference")}</small></div><span className={`source-pill ${suitability ? "reference-available" : "unavailable"}`}>{suitability ? t("resultGuide.cropReferenceAvailable") : t("resultGuide.cropReferenceMissing")}</span></article>
    </div></section>
    <div className="farmer-card-grid">
      <article className="farmer-card"><h3>{t("farmerResults.weather.title")}</h3>{climate.length ? <><p>{t("farmerResults.weather.known", { status: sourceLabel(environment) })}</p><ul>{climate.map((item) => <li key={String(item.variable)}><strong>{t(`farmerResults.weather.${powerNames[String(item.variable)] ?? "observation"}`)}</strong>: {formatObservation(item, i18n.language, 2)}</li>)}</ul><p className="card-note">{t("farmerResults.weather.note")}</p></> : <p>{t("farmerResults.weather.unavailable")}</p>}</article>
      <article className="farmer-card"><h3>{t("farmerResults.soil.title")}</h3>{soil.pH || soil.texture || soil.drainage || soil.salinity ? <><p>{t("farmerResults.soil.known", { source: t(`farm.sources.${soil.source_type}`) })}</p><ul>{soil.pH && <li>{t("farmerResults.factor.soilPh")}: {soil.pH}</li>}{soil.texture && <li>{t("farmerResults.factor.soilTexture")}: {t(`workspace.texture.${soil.texture}`, { defaultValue: soil.texture })}</li>}{soil.drainage && <li>{t("farmerResults.factor.drainage")}: {drainageKey[soil.drainage] ? t(`workspace.drainage.${drainageKey[soil.drainage]}`) : soil.drainage}</li>}{soil.salinity && <li>{t("salinityUX.label")}: {soil.salinity}</li>}</ul></> : <><p>{t("farmerResults.soil.incomplete")}</p><p className="card-action">{t("farmerResults.soil.action")}</p></>}</article>
      <article className="farmer-card"><h3>{t("farmerResults.water.title")}</h3>{water.length ? <><p>{t("farmerResults.water.known", { status: sourceLabel(moisture) })}</p><ul>{water.map((item) => <li key={String(item.layer)}><strong>{t(`farmerResults.water.${item.layer === "root_zone" ? "root" : "surface"}`)}</strong>: {formatObservation(item, i18n.language, 3)}</li>)}</ul><p className="card-note">{t("farmerResults.water.note")}</p></> : <><p>{t("farmerResults.water.unavailable")}</p><p className="data-explanation">{smapMessage}</p></>}</article>
      <article className="farmer-card"><h3>{t("farmerResults.suitability.title")}</h3><p>{t("farmerResults.suitability.intro")}</p><ul className="factor-list">{factors.map((item) => <li key={item.factor}><strong>{t(`farmerResults.factor.${factorNames[item.factor] ?? item.factor}`)}</strong><span className={`plain-status ${item.status.toLowerCase()}`}>{status(item.status)}</span><small>{item.limitation ? t("farmerResults.factor.unknownReason", { reason: factorReason(item.limitation) }) : t("farmerResults.factor.evaluated")}</small></li>)}</ul></article>
      <article className="farmer-card rotation-card"><div className="rotation-heading"><div><p className="section-kicker">{t("decisionBoard.pathKicker")}</p><h3>{t("farmerResults.rotation.title")}</h3><p>{hasRotationChoice ? (scenarios.length ? t("resultGuide.scenarioCount", { count: scenarios.length }) : t("farmerResults.rotation.empty")) : singleCropNote}</p></div>{hasRotationChoice && canFilterVariety && <div className="path-filters" role="group" aria-label={t("decisionBoard.pathFilterLabel")}><button type="button" aria-pressed={pathView === "varied"} onClick={() => { setPathView("varied"); setScenarioPage(0); setActiveScenarioId(""); }}>{t("decisionBoard.variedPaths", { count: variedScenarios.length })}</button><button type="button" aria-pressed={pathView === "all"} onClick={() => { setPathView("all"); setScenarioPage(0); setActiveScenarioId(""); }}>{t("decisionBoard.allPaths", { count: scenarios.length })}</button></div>}</div>{hasRotationChoice && canFilterVariety && <p className="path-filter-note">{t("decisionBoard.filterNote")}</p>}
        {hasRotationChoice && activeScenario && <><div className="rotation-selector" role="group" aria-label={t("decisionBoard.choosePath")}>{visibleScenarios.map((scenario, index) => <button type="button" key={scenario.scenario_id} aria-pressed={activeScenario.scenario_id === scenario.scenario_id} onClick={() => setActiveScenarioId(scenario.scenario_id)}><span>{String(currentPage * 6 + index + 1).padStart(2, "0")}</span><strong>{scenario.scientific_profile.crops.map(cropName).join(" → ")}</strong></button>)}</div>
        <div className="rotation-focus" aria-live="polite"><div className="rotation-focus-head"><span>{t("decisionBoard.openPath")}</span><strong>{activeScenario.scientific_profile.crops.map(cropName).join(" → ")}</strong></div><ol className="rotation-timeline">{activeScenario.scientific_profile.crops.map((crop, index) => <li key={`${activeScenario.scenario_id}-${index}`}><span>0{index + 1}</span><strong>{cropName(crop)}</strong></li>)}</ol><div className="rotation-findings"><p>{t("farmerResults.rotation.diversity", { crops: activeScenario.scientific_profile.diversity_descriptors.distinct_crop_count, families: activeScenario.scientific_profile.diversity_descriptors.distinct_family_count })}</p>{activeScenario.scientific_profile.legume_presence && <p>{t("workspace.legumePresent")}</p>}{activeScenario.scientific_profile.repeated_crop_flags.length > 0 && <p className="warning">{t("farmerResults.rotation.repeatedCrop", { crops: activeScenario.scientific_profile.repeated_crop_flags.map(cropName).join(", ") })}</p>}{activeScenario.scientific_profile.repeated_family_flags.length > 0 && <p className="warning">{t("farmerResults.rotation.repeatedFamily", { families: activeScenario.scientific_profile.repeated_family_flags.join(", ") })}</p>}{activeScenario.foregrounded_dimensions.length > 0 && <p>{t("farmerResults.rotation.aligned", { dimensions: activeScenario.foregrounded_dimensions.map((dimension) => t(`farm.priority.${dimension}`)).join(", ") })}</p>}</div></div></>}
        {hasRotationChoice && displayedScenarios.length > 6 && <nav className="scenario-pagination" aria-label={t("farmerResults.rotation.title")}><button type="button" className="secondary-button" disabled={currentPage === 0} onClick={() => setScenarioPage(currentPage - 1)}>{t("resultGuide.previousPage")}</button><span>{t("resultGuide.scenarioPage", { from: currentPage * 6 + 1, to: Math.min((currentPage + 1) * 6, displayedScenarios.length), count: displayedScenarios.length })}</span><button type="button" className="secondary-button" disabled={currentPage >= pageCount - 1} onClick={() => setScenarioPage(currentPage + 1)}>{t("resultGuide.nextPage")}</button></nav>}{!hasRotationChoice && <div className="rotation-empty-state"><strong>{isArabic ? "لا يوجد تناوب حقيقي بمحصول واحد" : "A single crop is not a real rotation"}</strong><p>{isArabic ? "أضف محصولًا مختلفًا من صفحة المزرعة، ثم سيعرض لك النظام مسارات تناوب قابلة للمقارنة بدل تكرار اسم المحصول." : "Add a different crop on the farm page to compare meaningful rotation paths instead of repeating the same crop."}</p><button type="button" className="secondary-button" onClick={onImproveInputs}>{isArabic ? "أضف محصولًا مختلفًا" : "Add a different crop"}</button></div>}</article>
    </div>
    <section className="next-steps"><h3>{t("farmerResults.actions.title")}</h3>{actions.length ? <ul>{actions.map((action) => <li key={action}>{action}</li>)}</ul> : <p>{t("farmerResults.actions.none")}</p>}<div className="preference-support"><strong>{t("farmerResults.preferences.title")}</strong><p>{t("farmerResults.preferences.supported", { soil: priorities.soil_health, resilience: priorities.resilience })}</p><p>{t("farmerResults.preferences.unavailable")}</p></div></section>
  </>;
}
