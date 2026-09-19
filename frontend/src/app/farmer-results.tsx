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

function formatObservation(item: Record<string, unknown>) {
  return `${item.value ?? "—"} ${item.unit ?? ""}`.trim();
}

export function FarmerResults({ environment, moisture, suitability, scenarios, priorities, soil }: { environment: DataResult; moisture: DataResult; suitability: DataResult; scenarios: ScenarioProfile[]; priorities: Priorities; soil: { source_type: string; texture: string; pH: string; drainage: string } }) {
  const { t } = useTranslation();
  const climate = observations(environment);
  const water = observations(moisture);
  const factors = ((suitability?.factor_results ?? []) as Factor[]).map((item) => ({ ...item, limitation: item.limitation?.replace(/^[A-Z_]+:\s*/, "") }));
  const factor = (name: string) => factors.find((item) => item.factor === name);
  const status = (value: unknown) => t(`results.statuses.${String(value ?? "UNKNOWN")}`);
  const sourceLabel = (result: DataResult) => t(`sourceStatus.${normalizeSourceStatus(result?.source_status)}`);
  const missing = (name: string) => factor(name)?.status === "UNKNOWN";
  const actions = [
    missing("soil_pH") && t("farmerResults.actions.ph"),
    missing("soil_texture") && t("farmerResults.actions.texture"),
    missing("drainage") && t("farmerResults.actions.drainage"),
    missing("temperature") && t("farmerResults.actions.calendar"),
    !water.length && t("farmerResults.actions.water"),
  ].filter(Boolean) as string[];

  return <>
    <section className="farm-summary" aria-label={t("farmerResults.summaryTitle")}><div><p className="section-kicker">{t("farmerResults.summaryKicker")}</p><h2>{t("farmerResults.summaryTitle")}</h2><p>{t("farmerResults.summaryText")}</p></div><p className="summary-note">{t("farmerResults.summaryNote")}</p></section>
    <div className="farmer-card-grid">
      <article className="farmer-card"><h3>{t("farmerResults.weather.title")}</h3>{climate.length ? <><p>{t("farmerResults.weather.known", { status: sourceLabel(environment) })}</p><ul>{climate.map((item) => <li key={String(item.variable)}><strong>{t(`farmerResults.weather.${powerNames[String(item.variable)] ?? "observation"}`)}</strong>: {formatObservation(item)}</li>)}</ul><p className="card-note">{t("farmerResults.weather.note")}</p></> : <p>{t("farmerResults.weather.unavailable")}</p>}</article>
      <article className="farmer-card"><h3>{t("farmerResults.soil.title")}</h3>{soil.pH || soil.texture || soil.drainage ? <><p>{t("farmerResults.soil.known", { source: t(`farm.sources.${soil.source_type}`) })}</p><ul>{soil.pH && <li>{t("farmerResults.factor.soilPh")}: {soil.pH}</li>}{soil.texture && <li>{t("farmerResults.factor.soilTexture")}: {soil.texture}</li>}{soil.drainage && <li>{t("farmerResults.factor.drainage")}: {soil.drainage}</li>}</ul></> : <><p>{t("farmerResults.soil.incomplete")}</p><p className="card-action">{t("farmerResults.soil.action")}</p></>}</article>
      <article className="farmer-card"><h3>{t("farmerResults.water.title")}</h3>{water.length ? <><p>{t("farmerResults.water.known", { status: sourceLabel(moisture) })}</p><ul>{water.map((item) => <li key={String(item.layer)}><strong>{t(`farmerResults.water.${item.layer === "root_zone" ? "root" : "surface"}`)}</strong>: {formatObservation(item)}</li>)}</ul><p className="card-note">{t("farmerResults.water.note")}</p></> : <p>{t("farmerResults.water.unavailable")}</p>}</article>
      <article className="farmer-card"><h3>{t("farmerResults.suitability.title")}</h3><p>{t("farmerResults.suitability.intro")}</p><ul className="factor-list">{factors.map((item) => <li key={item.factor}><strong>{t(`farmerResults.factor.${factorNames[item.factor] ?? item.factor}`)}</strong><span className={`plain-status ${item.status.toLowerCase()}`}>{status(item.status)}</span><small>{item.limitation ? t("farmerResults.factor.unknownReason", { reason: item.limitation }) : t("farmerResults.factor.evaluated")}</small></li>)}</ul></article>
      <article className="farmer-card rotation-card"><h3>{t("farmerResults.rotation.title")}</h3>{scenarios.length ? scenarios.map((scenario) => <div className="rotation-scenario" key={scenario.scenario_id}><strong>{scenario.scientific_profile.crops.join(" → ")}</strong><p>{t("farmerResults.rotation.diversity", { crops: scenario.scientific_profile.diversity_descriptors.distinct_crop_count, families: scenario.scientific_profile.diversity_descriptors.distinct_family_count })}</p>{scenario.scientific_profile.legume_presence && <p>{t("farmerResults.rotation.legume")}</p>}{scenario.scientific_profile.repeated_crop_flags.length > 0 && <p className="warning">{t("farmerResults.rotation.repeatedCrop", { crops: scenario.scientific_profile.repeated_crop_flags.join(", ") })}</p>}{scenario.scientific_profile.repeated_family_flags.length > 0 && <p className="warning">{t("farmerResults.rotation.repeatedFamily", { families: scenario.scientific_profile.repeated_family_flags.join(", ") })}</p>}{scenario.foregrounded_dimensions.length > 0 && <p>{t("farmerResults.rotation.aligned", { dimensions: scenario.foregrounded_dimensions.map((dimension) => t(`farm.priority.${dimension}`)).join(", ") })}</p>}</div>) : <p>{t("farmerResults.rotation.empty")}</p>}</article>
    </div>
    <section className="next-steps"><h3>{t("farmerResults.actions.title")}</h3>{actions.length ? <ul>{actions.map((action) => <li key={action}>{action}</li>)}</ul> : <p>{t("farmerResults.actions.none")}</p>}<div className="preference-support"><strong>{t("farmerResults.preferences.title")}</strong><p>{t("farmerResults.preferences.supported", { soil: priorities.soil_health, resilience: priorities.resilience })}</p><p>{t("farmerResults.preferences.unavailable")}</p></div></section>
  </>;
}
