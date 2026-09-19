import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { EvidencePanel } from "./evidence";

const api = "http://127.0.0.1:8000/api/v1";
const stepKeys = ["location", "farmCrop", "analysis", "results"] as const;
const stageKeys = ["weather", "soil", "water", "cropConditions", "rotationContext"] as const;
type Crop = { id: string; common_name: string; family?: string };
type ApiResult = Record<string, unknown>;
type Status = "SUITABLE" | "MARGINAL" | "LIMITING" | "UNKNOWN" | "AVAILABLE";

function resultStatus(result: ApiResult | null): Status {
  const text = JSON.stringify(result);
  if (text.includes("LIMITING")) return "LIMITING";
  if (text.includes("MARGINAL")) return "MARGINAL";
  if (text.includes("SUITABLE")) return "SUITABLE";
  return "UNKNOWN";
}

export function App() {
  const { t, i18n } = useTranslation();
  const evidence = [
    { source_name: "NASA POWER", dataset_or_reference: "POWER Daily API", temporal_resolution: "daily", url: "https://power.larc.nasa.gov/" },
    { source_name: "NASA NSIDC DAAC", dataset_or_reference: "SMAP SPL4SMGP Version 8", spatial_resolution: "9 km", temporal_resolution: "3-hourly", url: "https://nsidc.org/data/spl4smgp/versions/8", quality_notes: [t("evidence.smapQuality")] },
  ];
  const [step, setStep] = useState(0);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState("24.7");
  const [lon, setLon] = useState("47.3");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [environment, setEnvironment] = useState<ApiResult | null>(null);
  const [moisture, setMoisture] = useState<ApiResult | null>(null);
  const [suitability, setSuitability] = useState<ApiResult | null>(null);
  const [scenarios, setScenarios] = useState<ApiResult | null>(null);
  const [soil, setSoil] = useState({ source_type: "unknown", texture: "", pH: "", drainage: "" });
  const [priorities, setPriorities] = useState({ water_conservation: 0, soil_health: 0, resilience: 0, productivity: 0 });

  useEffect(() => {
    document.documentElement.lang = i18n.language === "ar" ? "ar" : "en";
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    fetch(`${api}/crops`).then((response) => response.ok ? response.json() : Promise.reject()).then(setCrops).catch(() => setError(t("errors.cropLibrary")));
  }, [t]);

  const changeLanguage = async (language: "en" | "ar") => {
    await i18n.changeLanguage(language);
    window.localStorage.setItem("fieldshift-language", language);
  };
  const post = async (path: string, body: unknown): Promise<ApiResult> => {
    const response = await fetch(`${api}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error("Request failed");
    return response.json() as Promise<ApiResult>;
  };
  const runAnalysis = async () => {
    if (!selected[0]) { setError(t("errors.chooseCrop")); setStep(1); return; }
    setError(""); setIsAnalyzing(true); setStep(2);
    const location = { latitude: Number(lat), longitude: Number(lon), start_date: "2025-01-01", end_date: "2025-01-03" };
    try {
      const [nextEnvironment, nextMoisture, nextSuitability, nextScenarios] = await Promise.all([
        post("/environment/context", location), post("/soil-moisture/context", location),
        post("/suitability/evaluate", { crop_id: selected[0], soil: { ...soil, pH: soil.pH ? Number(soil.pH) : null } }),
        post("/scenarios/generate", { candidate_crop_ids: selected, planning_horizon: 3 }),
      ]);
      setEnvironment(nextEnvironment); setMoisture(nextMoisture); setSuitability(nextSuitability); setScenarios(nextScenarios); setStep(3);
    } catch { setError(t("errors.analysis")); } finally { setIsAnalyzing(false); }
  };

  const toggleCrop = (cropId: string) => setSelected(selected.includes(cropId) ? selected.filter((id) => id !== cropId) : [...selected, cropId]);
  const cropStatus = resultStatus(suitability);
  const statusText = (status: Status) => t(`results.statuses.${status}`);
  const cropExplanation = cropStatus === "SUITABLE" ? t("results.explanations.suitable") : cropStatus === "LIMITING" ? t("results.explanations.limiting") : t("results.explanations.unknown");
  const fieldCards: [string, Status, string][] = [
    [t("results.weather"), environment ? "AVAILABLE" : "UNKNOWN", t("results.weatherDescription")],
    [t("results.soil"), soil.texture || soil.pH || soil.drainage ? "AVAILABLE" : "UNKNOWN", t("results.soilDescription")],
    [t("results.water"), moisture ? "AVAILABLE" : "UNKNOWN", t("results.waterDescription")],
    [t("results.cropSuitability"), cropStatus, cropExplanation],
  ];

  return <main className="app-shell"><section className="app-container">
    <header className="app-header"><div className="header-row"><p className="eyebrow">{t("app.eyebrow")}</p><fieldset className="language-switcher" aria-label={t("language.label")}><legend>{t("language.label")}</legend><button type="button" aria-pressed={i18n.language !== "ar"} onClick={() => changeLanguage("en")}>{t("language.english")}</button><button type="button" aria-pressed={i18n.language === "ar"} onClick={() => changeLanguage("ar")}>{t("language.arabic")}</button></fieldset></div><h1>{t("app.title")}</h1><p className="lede">{t("app.subtitle")}</p></header>
    <ol className="progress" aria-label={t("steps.progress")}>{stepKeys.map((name, index) => <li key={name} aria-current={index === step ? "step" : undefined} className={index === step ? "active" : index < step ? "complete" : ""}><span>{index + 1}</span>{t(`steps.${name}`)}</li>)}</ol>
    {error && <p className="alert" role="alert">{error}</p>}
    {step === 0 && <section className="hero-card"><div><p className="section-kicker">{t("steps.locationKicker")}</p><h2>{t("location.heading")}</h2><p>{t("location.description")}</p></div><div className="location-card"><div className="location-icon" aria-hidden="true">⌖</div><div><h3>{t("location.cardTitle")}</h3><p>{t("location.cardDescription")}</p></div><div className="input-grid"><label>{t("location.country")}<input aria-label={t("location.country")} value={country} onChange={(event) => setCountry(event.target.value)} placeholder={t("location.optional")} /></label><label>{t("location.latitude")}<input aria-label={t("location.latitude")} inputMode="decimal" value={lat} onChange={(event) => setLat(event.target.value)} /></label><label>{t("location.longitude")}<input aria-label={t("location.longitude")} inputMode="decimal" value={lon} onChange={(event) => setLon(event.target.value)} /></label></div><p className="helper">{t("location.mapNote")}</p></div></section>}
    {step === 1 && <section className="step-panel"><div><p className="section-kicker">{t("steps.farmKicker")}</p><h2>{t("farm.heading")}</h2><p>{t("farm.description")}</p></div><div className="farm-grid"><article className="input-card"><h3>{t("farm.conditions")}</h3><p>{t("farm.conditionsDescription")}</p><label>{t("farm.sourceType")}<select aria-label={t("farm.sourceType")} value={soil.source_type} onChange={(event) => setSoil({ ...soil, source_type: event.target.value })}>{["laboratory_measurement", "farmer_provided", "local_record", "modeled_estimate", "unknown"].map((source) => <option key={source} value={source}>{t(`farm.sources.${source}`)}</option>)}</select></label><div className="input-grid compact"><label>{t("farm.texture")}<input aria-label={t("farm.texture")} value={soil.texture} onChange={(event) => setSoil({ ...soil, texture: event.target.value })} /></label><label>{t("farm.ph")}<input aria-label={t("farm.ph")} value={soil.pH} onChange={(event) => setSoil({ ...soil, pH: event.target.value })} /></label><label>{t("farm.drainage")}<input aria-label={t("farm.drainage")} value={soil.drainage} onChange={(event) => setSoil({ ...soil, drainage: event.target.value })} /></label></div></article><article className="input-card"><h3>{t("farm.crops")}</h3><p>{t("farm.cropsDescription")}</p><div className="crop-list">{crops.map((crop) => <label className="crop-option" key={crop.id}><input type="checkbox" checked={selected.includes(crop.id)} onChange={() => toggleCrop(crop.id)} /><span>{crop.common_name}<small>{crop.family ?? t("farm.supportedCrop")}</small></span></label>)}</div></article><article className="input-card priorities"><h3>{t("farm.priorities")}</h3><p>{t("farm.prioritiesDescription")}</p>{Object.entries(priorities).map(([key, value]) => <label className="priority" key={key}><span>{t(`farm.priority.${key}`)} <strong>{new Intl.NumberFormat(i18n.language).format(value)}</strong></span><input aria-label={t(`farm.priority.${key}`)} type="range" min="0" max="10" value={value} onChange={(event) => setPriorities({ ...priorities, [key]: Number(event.target.value) })} /></label>)}<p className="helper">{t("farm.priorityNote")}</p></article></div></section>}
    {step === 2 && <section className="analysis-card" aria-live="polite"><div className="analysis-orbit" aria-hidden="true">◌</div><p className="section-kicker">{t("steps.analysisKicker")}</p><h2>{isAnalyzing ? t("analysis.loading") : t("analysis.ready")}</h2><p>{t("analysis.description")}</p><ul className="analysis-stages">{stageKeys.map((name) => <li key={name}><span aria-hidden="true">✓</span>{t(`analysis.${name}`)}</li>)}</ul>{!isAnalyzing && <button className="primary-button" onClick={runAnalysis}>{t("analysis.button")}</button>}<details><summary>{t("analysis.sources")}</summary><p>{t("analysis.sourceNote")}</p></details></section>}
    {step === 3 && <section className="results-panel"><div><p className="section-kicker">{t("steps.resultsKicker")}</p><h2>{t("results.heading")}</h2><p>{t("results.description")}</p></div><div className="result-grid">{fieldCards.map(([title, status, description]) => <article className="result-card" key={title}><p>{title}</p><h3 className={`status ${status.toLowerCase()}`}>{statusText(status)}</h3><span>{description}</span></article>)}</div><div className="results-columns"><article className="result-detail"><h3>{t("results.rotationOptions")}</h3><p>{scenarios ? t("results.rotationAvailable") : t("results.rotationEmpty")}</p></article><article className="result-detail"><h3>{t("results.why")}</h3><p>{suitability ? cropExplanation : t("results.whyEmpty")}</p></article></div><details className="evidence-details"><summary>{t("results.evidence")}</summary><EvidencePanel evidence={evidence} limitations={[t("evidence.missingCalendar"), t("evidence.smap"), t("evidence.preference"), t("evidence.compatibility")]} /><pre>{JSON.stringify({ environment, moisture, suitability, scenarios }, null, 2)}</pre></details></section>}
    <nav className="step-actions" aria-label={t("steps.navigation")}><button className="secondary-button" disabled={!step || isAnalyzing} onClick={() => setStep(step - 1)}>{t("actions.back")}</button>{step < 2 && <button className="primary-button" onClick={() => setStep(step + 1)}>{step === 0 ? t("actions.toFarm") : t("actions.toAnalysis")}</button>}{step === 2 && !isAnalyzing && <button className="secondary-button" onClick={() => setStep(3)}>{t("actions.viewResults")}</button>}{step === 3 && <button className="secondary-button" onClick={() => setStep(0)}>{t("actions.startAnother")}</button>}</nav>
  </section></main>;
}
