import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import countries from "i18n-iso-countries";
import arCountries from "i18n-iso-countries/langs/ar.json";
import enCountries from "i18n-iso-countries/langs/en.json";
import { EvidencePanel } from "./evidence";
import { FarmerResults } from "./farmer-results";
import { BrandMark } from "./brand-mark";
import { IntroExperience } from "./intro-experience";
import { FarmStep } from "./farm-step";
import { FieldContext } from "./field-context";
import { reverseGeocode, searchPlaces, type Place } from "../location/geocoding";

const api = import.meta.env.VITE_API_BASE_URL ?? (import.meta.env.DEV ? "http://127.0.0.1:8000/api/v1" : "/api/v1");
const stepKeys = ["location", "farmCrop", "analysis", "results"] as const;
const stageKeys = ["weather", "soil", "water", "cropConditions", "rotationContext"] as const;
countries.registerLocale(enCountries);
countries.registerLocale(arCountries);
type Crop = { id: string; common_name: string; family?: string };
type ApiResult = Record<string, unknown>;

export function App() {
  const { t, i18n } = useTranslation();
  const [showIntro, setShowIntro] = useState(true);
  const [step, setStep] = useState(0);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [country, setCountry] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [placeQuery, setPlaceQuery] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [locationMessage, setLocationMessage] = useState("");
  const [locationKind, setLocationKind] = useState<"gps" | "search" | "manual" | "">("");
  const [isLocating, setIsLocating] = useState(false);
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [observationDate, setObservationDate] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [environment, setEnvironment] = useState<ApiResult | null>(null);
  const [moisture, setMoisture] = useState<ApiResult | null>(null);
  const [suitability, setSuitability] = useState<ApiResult | null>(null);
  const [, setScenarios] = useState<ApiResult | null>(null);
  const [preferenceComparisons, setPreferenceComparisons] = useState<Array<Record<string, unknown>>>([]);
  const [analysisWarnings, setAnalysisWarnings] = useState<string[]>([]);
  const [soil, setSoil] = useState({ source_type: "unknown", texture: "", pH: "", drainage: "", salinity: "" });
  const [priorities, setPriorities] = useState({ water_conservation: 0, soil_health: 0, resilience: 0, productivity: 0 });
  const countryNames = countries.getNames(i18n.language === "ar" ? "ar" : "en", { select: "official" });
  const countryOptions = Object.entries(countryNames).map(([code, name]) => ({ code, name })).sort((a, b) => a.name.localeCompare(b.name, i18n.language));
  const validLocation = lat.trim() !== "" && lon.trim() !== "" && Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)) && Number(lat) >= -90 && Number(lat) <= 90 && Number(lon) >= -180 && Number(lon) <= 180;

  useEffect(() => {
    document.documentElement.lang = i18n.language === "ar" ? "ar" : "en";
    document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
  }, [i18n.language]);

  useEffect(() => {
    fetch(`${api}/crops`).then((response) => response.ok ? response.json() : Promise.reject()).then(setCrops).catch(() => setError(i18n.t("errors.cropLibrary")));
  }, [i18n]);

  const changeLanguage = async (language: "en" | "ar") => {
    await i18n.changeLanguage(language);
    window.localStorage.setItem("fieldshift-language", language);
  };
  const post = async <T = ApiResult>(path: string, body: unknown): Promise<T> => {
    const response = await fetch(`${api}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json() as Promise<T>;
  };
  const runAnalysis = async () => {
    if (!selected[0]) { setError(t("errors.chooseCrop")); setStep(1); return; }
    if (!validLocation) { setError(t("locationUX.invalid")); setStep(0); return; }
    if (!observationDate) { setError(t("observationUX.dateRequired")); setStep(0); return; }
    setError(""); setIsAnalyzing(true); setStep(2); setEnvironment(null); setMoisture(null); setSuitability(null); setScenarios(null); setPreferenceComparisons([]); setAnalysisWarnings([]);
    const location = { latitude: Number(lat), longitude: Number(lon), start_date: observationDate, end_date: observationDate };
    try {
      const results = await Promise.allSettled([
        post("/environment/context", location), post("/soil-moisture/context", location),
        post("/suitability/evaluate", { crop_id: selected[0], soil: { ...soil, pH: soil.pH ? Number(soil.pH) : null, salinity: soil.salinity ? Number(soil.salinity) : null } }),
        post("/scenarios/generate", { candidate_crop_ids: selected, planning_horizon: 3 }),
      ]);
      const warnings: string[] = [];
      const [power, smap, nextSuitability, nextScenarios] = results;
      if (power.status === "fulfilled") { setEnvironment(power.value); if (Array.isArray(power.value.errors) && power.value.errors.length) warnings.push(t("errors.powerUnavailable")); } else warnings.push(t("errors.powerUnavailable"));
      if (smap.status === "fulfilled") { setMoisture(smap.value); if (Array.isArray(smap.value.errors) && smap.value.errors.length) warnings.push(t("errors.smapUnavailable")); } else warnings.push(t("errors.smapUnavailable"));
      if (nextSuitability.status === "fulfilled") setSuitability(nextSuitability.value); else warnings.push(t("errors.suitabilityUnavailable"));
      if (nextScenarios.status === "fulfilled") {
        try {
          const comparisons = await post<Array<Record<string, unknown>>>("/preferences/compare", { scenarios: nextScenarios.value, priorities });
          setPreferenceComparisons(comparisons);
          setScenarios({ generated_scenarios: nextScenarios.value, preference_comparisons: comparisons });
        } catch { warnings.push(t("evidence.preference")); setScenarios(nextScenarios.value); }
      } else warnings.push(t("errors.rotationUnavailable"));
      setAnalysisWarnings(warnings); setError(results.every((result) => result.status === "rejected") ? t("errors.analysis") : ""); setStep(3);
    } catch { setError(t("errors.analysis")); } finally { setIsAnalyzing(false); }
  };

  const toggleCrop = (cropId: string) => {
    if (!selected.includes(cropId) && selected.length >= 4) { setError(t("workspace.maxCrops")); return; }
    setError("");
    setSelected(selected.includes(cropId) ? selected.filter((id) => id !== cropId) : [...selected, cropId]);
  };
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

  if (showIntro) return <IntroExperience onEnter={() => setShowIntro(false)} />;

  return <main className="app-shell"><section className="app-container">
    <header className="app-header"><div className="header-row"><div className="brand-lockup"><span className="brand-mark"><BrandMark /></span><div><p className="eyebrow">{t("app.eyebrow")}</p><span className="brand-caption">{t("experience.researchLabel")}</span></div></div><fieldset className="language-switcher" aria-label={t("language.label")}><legend>{t("language.label")}</legend><button type="button" aria-pressed={i18n.language !== "ar"} onClick={() => changeLanguage("en")}>{t("language.english")}</button><button type="button" aria-pressed={i18n.language === "ar"} onClick={() => changeLanguage("ar")}>{t("language.arabic")}</button></fieldset></div><h1>{t("app.title")}</h1><p className="lede">{t("app.subtitle")}</p></header>
    <ol className="progress" aria-label={t("steps.progress")}>{stepKeys.map((name, index) => <li key={name} aria-current={index === step ? "step" : undefined} className={index === step ? "active" : index < step ? "complete" : ""}><span>{index + 1}</span>{t(`steps.${name}`)}</li>)}</ol>
    <div className="workspace-layout">
    <FieldContext step={step} latitude={lat} longitude={lon} observationDate={observationDate} selectedCrops={selected} soilSource={soil.source_type} />
    <div className="workspace-main">
    {error && <p className="alert" role="alert">{error}</p>}
    {step === 0 && <section className="hero-card"><div><p className="section-kicker">{t("steps.locationKicker")}</p><h2>{t("locationUX.heading")}</h2><p>{t("location.description")}</p></div><div className="location-card"><button className="primary-button gps-button" onClick={useCurrentLocation} disabled={isLocating}>{isLocating ? t("locationUX.locating") : t("locationUX.gps")}</button><p className="helper">{t("locationUX.privacy")}</p><p className="or-divider">{t("locationUX.or")}</p><label>{t("locationUX.countrySearch")}<input aria-label={t("locationUX.countrySearch")} list="countries" value={country} onChange={(event) => updateCountry(event.target.value)} /><datalist id="countries">{countryOptions.map((item) => <option key={item.code} value={item.name} />)}</datalist></label><label>{t("locationUX.place")}<div className="place-search"><input aria-label={t("locationUX.place")} value={placeQuery} onChange={(event) => setPlaceQuery(event.target.value)} placeholder={t("locationUX.placePlaceholder")} /><button className="secondary-button" onClick={findPlaces}>{t("locationUX.search")}</button></div></label>{places.map((place) => <button className="place-option" key={`${place.latitude}-${place.longitude}`} onClick={() => selectPlace(place, "search")}>{place.label}</button>)}{(locationMessage || locationKind) && <p className="location-status" role="status">{locationMessage}</p>}<p className="helper">{t("locationUX.selected")}: {placeQuery || "—"}</p><details><summary>{t("locationUX.advanced")}</summary><div className="input-grid"><label>{t("location.latitude")}<input aria-label={t("location.latitude")} inputMode="decimal" value={lat} onChange={(event) => updateManualCoordinate("lat", event.target.value)} /></label><label>{t("location.longitude")}<input aria-label={t("location.longitude")} inputMode="decimal" value={lon} onChange={(event) => updateManualCoordinate("lon", event.target.value)} /></label></div><p className="helper">{t("locationUX.manualNote")}</p></details><p className="helper">{t("locationUX.attribution")}</p></div></section>}
    {step === 0 && <section className="sample-strip"><div><p className="section-kicker">{t("workspace.sampleKicker")}</p><h3>{t("workspace.sampleTitle")}</h3><p>{t("workspace.sampleDescription")}</p><button type="button" className="secondary-button" onClick={() => { setLat("24.7"); setLon("47.3"); setObservationDate("2025-01-01"); setCountry(i18n.language === "ar" ? "السعودية" : "Saudi Arabia"); setCountryCode("SA"); setPlaceQuery(t("workspace.samplePlace")); setLocationKind("manual"); setLocationMessage(t("workspace.sampleSelected")); }}>{t("workspace.loadSample")}</button></div><label>{t("workspace.observationDate")}<input type="date" value={observationDate} onChange={(event) => setObservationDate(event.target.value)} /><small>{t("workspace.dateNote")}</small></label></section>}
    {step === 1 && <FarmStep crops={crops} selected={selected} onToggleCrop={toggleCrop} soil={soil} onSoilChange={setSoil} priorities={priorities} onPrioritiesChange={setPriorities} />}
    {step === 2 && <section className="analysis-card" aria-live="polite"><div className="analysis-orbit" aria-hidden="true">◌</div><p className="section-kicker">{t("steps.analysisKicker")}</p><h2>{isAnalyzing ? t("analysis.loading") : t("analysis.ready")}</h2><p>{t("analysis.description")}</p><ul className="analysis-stages">{stageKeys.map((name) => <li key={name}><span aria-hidden="true">✓</span>{t(`analysis.${name}`)}</li>)}</ul>{!isAnalyzing && <button className="primary-button" onClick={runAnalysis}>{t("analysis.button")}</button>}<details><summary>{t("analysis.sources")}</summary><p>{t("analysis.sourceNote")}</p></details></section>}
    {step === 3 && <section className="results-panel">{analysisWarnings.length > 0 && <ul className="alert" aria-label={t("farmerResults.warnings")} >{analysisWarnings.map((warning) => <li key={warning}>{warning}</li>)}</ul>}<FarmerResults environment={environment} moisture={moisture} suitability={suitability} scenarios={preferenceComparisons as never[]} priorities={priorities} soil={soil} /><details className="evidence-details"><summary>{t("results.evidence")}</summary><EvidencePanel power={environment} smap={moisture} suitability={suitability} /></details></section>}
    <nav className="step-actions" aria-label={t("steps.navigation")}><button className="secondary-button" disabled={!step || isAnalyzing} onClick={() => setStep(step - 1)}>{t("actions.back")}</button>{step < 2 && <button className="primary-button" disabled={step === 0 && (!validLocation || !observationDate)} onClick={() => setStep(step + 1)}>{step === 0 ? t("actions.toFarm") : t("actions.toAnalysis")}</button>}{step === 2 && !isAnalyzing && <button className="secondary-button" onClick={() => setStep(3)}>{t("actions.viewResults")}</button>}{step === 3 && <button className="secondary-button" onClick={() => setStep(0)}>{t("actions.startAnother")}</button>}</nav>
    </div></div>
  </section></main>;
}
