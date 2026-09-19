import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import countries from "i18n-iso-countries";
import arCountries from "i18n-iso-countries/langs/ar.json";
import enCountries from "i18n-iso-countries/langs/en.json";
import { EvidencePanel } from "./evidence";
import { reverseGeocode, searchPlaces, type Place } from "../location/geocoding";

const api = "http://127.0.0.1:8000/api/v1";
const stepKeys = ["location", "farmCrop", "analysis", "results"] as const;
const stageKeys = ["weather", "soil", "water", "cropConditions", "rotationContext"] as const;
countries.registerLocale(enCountries);
countries.registerLocale(arCountries);
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
  const [countryCode, setCountryCode] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationKind, setLocationKind] = useState<"gps" | "search" | "manual" | "">("");
  const [isLocating, setIsLocating] = useState(false);
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
  const countryNames = countries.getNames(i18n.language === "ar" ? "ar" : "en", { select: "official" });
  const countryOptions = Object.entries(countryNames).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name, i18n.language));

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
  const selectPlace = (place: Place, kind: "gps" | "search") => { setLat(place.latitude); setLon(place.longitude); setCountry(place.country ?? country); setCountryCode(place.countryCode ?? countryCode); setPlaceQuery(place.label); setPlaces([]); setLocationKind(kind); setLocationMessage(kind === "gps" ? t("locationUX.detected") : t("locationUX.ready")); };
  const updateCountry = (name: string) => { const entry = countryOptions.find((item) => item.name === name); setCountry(name); setCountryCode(entry?.code ?? ""); setPlaceQuery(""); setPlaces([]); setLat(""); setLon(""); setLocationKind(""); setLocationMessage(""); };
  const useCurrentLocation = () => {
    if (!navigator.geolocation) { setLocationMessage(t("locationUX.unavailable")); return; }
    setIsLocating(true); setLocationMessage(t("locationUX.locating"));
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = String(position.coords.latitude); const longitude = String(position.coords.longitude);
      try { const resolved = await reverseGeocode(latitude, longitude); if (resolved) selectPlace(resolved, "gps"); else selectPlace({ label: `${latitude}, ${longitude}`, latitude, longitude }, "gps"); } catch { selectPlace({ label: `${latitude}, ${longitude}`, latitude, longitude }, "gps"); }
      setIsLocating(false);
    }, (positionError) => { setIsLocating(false); setLocationMessage(positionError.code === 1 ? t("locationUX.permissionDenied") : positionError.code === 3 ? t("locationUX.timeout") : t("locationUX.unavailable")); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };
  const findPlaces = async () => { if (!placeQuery.trim()) return; try { const results = await searchPlaces(placeQuery, countryCode || undefined); setPlaces(results); setLocationMessage(results.length ? "" : t("locationUX.notFound")); } catch { setLocationMessage(t("locationUX.searchUnavailable")); } };
  const updateManualCoordinate = (type: "lat" | "lon", value: string) => { const nextLat = type === "lat" ? value : lat; const nextLon = type === "lon" ? value : lon; setLat(nextLat); setLon(nextLon); setLocationKind("manual"); const valid = Number.isFinite(Number(nextLat)) && Number.isFinite(Number(nextLon)) && Number(nextLat) >= -90 && Number(nextLat) <= 90 && Number(nextLon) >= -180 && Number(nextLon) <= 180; setLocationMessage(valid ? t("locationUX.manual") : t("locationUX.invalid")); };
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
    {step === 0 && <section className="hero-card"><div><p className="section-kicker">{t("steps.locationKicker")}</p><h2>{t("locationUX.heading")}</h2><p>{t("location.description")}</p></div><div className="location-card"><button className="primary-button gps-button" onClick={useCurrentLocation} disabled={isLocating}>{isLocating ? t("locationUX.locating") : t("locationUX.gps")}</button><p className="helper">{t("locationUX.privacy")}</p><p className="or-divider">{t("locationUX.or")}</p><label>{t("locationUX.countrySearch")}<input aria-label={t("locationUX.countrySearch")} list="countries" value={country} onChange={(event) => updateCountry(event.target.value)} /><datalist id="countries">{countryOptions.map((item) => <option key={item.code} value={item.name} />)}</datalist></label><label>{t("locationUX.place")}<div className="place-search"><input aria-label={t("locationUX.place")} value={placeQuery} onChange={(event) => setPlaceQuery(event.target.value)} placeholder={t("locationUX.placePlaceholder")} /><button className="secondary-button" onClick={findPlaces}>{t("locationUX.search")}</button></div></label>{places.map((place) => <button className="place-option" key={`${place.latitude}-${place.longitude}`} onClick={() => selectPlace(place, "search")}>{place.label}</button>)}{(locationMessage || locationKind) && <p className="location-status" role="status">{locationMessage}</p>}<p className="helper">{t("locationUX.selected")}: {placeQuery || "—"}</p><details><summary>{t("locationUX.advanced")}</summary><div className="input-grid"><label>{t("location.latitude")}<input aria-label={t("location.latitude")} inputMode="decimal" value={lat} onChange={(event) => updateManualCoordinate("lat", event.target.value)} /></label><label>{t("location.longitude")}<input aria-label={t("location.longitude")} inputMode="decimal" value={lon} onChange={(event) => updateManualCoordinate("lon", event.target.value)} /></label></div><p className="helper">{t("locationUX.manualNote")}</p></details><p className="helper">{t("locationUX.attribution")}</p></div></section>}
    {step === 1 && <section className="step-panel"><div><p className="section-kicker">{t("steps.farmKicker")}</p><h2>{t("farm.heading")}</h2><p>{t("farm.description")}</p></div><div className="farm-grid"><article className="input-card"><h3>{t("farm.conditions")}</h3><p>{t("farm.conditionsDescription")}</p><label>{t("farm.sourceType")}<select aria-label={t("farm.sourceType")} value={soil.source_type} onChange={(event) => setSoil({ ...soil, source_type: event.target.value })}>{["laboratory_measurement", "farmer_provided", "local_record", "modeled_estimate", "unknown"].map((source) => <option key={source} value={source}>{t(`farm.sources.${source}`)}</option>)}</select></label><div className="input-grid compact"><label>{t("farm.texture")}<input aria-label={t("farm.texture")} value={soil.texture} onChange={(event) => setSoil({ ...soil, texture: event.target.value })} /></label><label>{t("farm.ph")}<input aria-label={t("farm.ph")} value={soil.pH} onChange={(event) => setSoil({ ...soil, pH: event.target.value })} /></label><label>{t("farm.drainage")}<input aria-label={t("farm.drainage")} value={soil.drainage} onChange={(event) => setSoil({ ...soil, drainage: event.target.value })} /></label></div></article><article className="input-card"><h3>{t("farm.crops")}</h3><p>{t("farm.cropsDescription")}</p><div className="crop-list">{crops.map((crop) => <label className="crop-option" key={crop.id}><input type="checkbox" checked={selected.includes(crop.id)} onChange={() => toggleCrop(crop.id)} /><span>{crop.common_name}<small>{crop.family ?? t("farm.supportedCrop")}</small></span></label>)}</div></article><article className="input-card priorities"><h3>{t("farm.priorities")}</h3><p>{t("farm.prioritiesDescription")}</p>{Object.entries(priorities).map(([key, value]) => <label className="priority" key={key}><span>{t(`farm.priority.${key}`)} <strong>{new Intl.NumberFormat(i18n.language).format(value)}</strong></span><input aria-label={t(`farm.priority.${key}`)} type="range" min="0" max="10" value={value} onChange={(event) => setPriorities({ ...priorities, [key]: Number(event.target.value) })} /></label>)}<p className="helper">{t("farm.priorityNote")}</p></article></div></section>}
    {step === 2 && <section className="analysis-card" aria-live="polite"><div className="analysis-orbit" aria-hidden="true">◌</div><p className="section-kicker">{t("steps.analysisKicker")}</p><h2>{isAnalyzing ? t("analysis.loading") : t("analysis.ready")}</h2><p>{t("analysis.description")}</p><ul className="analysis-stages">{stageKeys.map((name) => <li key={name}><span aria-hidden="true">✓</span>{t(`analysis.${name}`)}</li>)}</ul>{!isAnalyzing && <button className="primary-button" onClick={runAnalysis}>{t("analysis.button")}</button>}<details><summary>{t("analysis.sources")}</summary><p>{t("analysis.sourceNote")}</p></details></section>}
    {step === 3 && <section className="results-panel"><div><p className="section-kicker">{t("steps.resultsKicker")}</p><h2>{t("results.heading")}</h2><p>{t("results.description")}</p></div><div className="result-grid">{fieldCards.map(([title, status, description]) => <article className="result-card" key={title}><p>{title}</p><h3 className={`status ${status.toLowerCase()}`}>{statusText(status)}</h3><span>{description}</span></article>)}</div><div className="results-columns"><article className="result-detail"><h3>{t("results.rotationOptions")}</h3><p>{scenarios ? t("results.rotationAvailable") : t("results.rotationEmpty")}</p></article><article className="result-detail"><h3>{t("results.why")}</h3><p>{suitability ? cropExplanation : t("results.whyEmpty")}</p></article></div><details className="evidence-details"><summary>{t("results.evidence")}</summary><EvidencePanel evidence={evidence} limitations={[t("evidence.missingCalendar"), t("evidence.smap"), t("evidence.preference"), t("evidence.compatibility")]} /><pre>{JSON.stringify({ environment, moisture, suitability, scenarios }, null, 2)}</pre></details></section>}
    <nav className="step-actions" aria-label={t("steps.navigation")}><button className="secondary-button" disabled={!step || isAnalyzing} onClick={() => setStep(step - 1)}>{t("actions.back")}</button>{step < 2 && <button className="primary-button" onClick={() => setStep(step + 1)}>{step === 0 ? t("actions.toFarm") : t("actions.toAnalysis")}</button>}{step === 2 && !isAnalyzing && <button className="secondary-button" onClick={() => setStep(3)}>{t("actions.viewResults")}</button>}{step === 3 && <button className="secondary-button" onClick={() => setStep(0)}>{t("actions.startAnother")}</button>}</nav>
  </section></main>;
}
