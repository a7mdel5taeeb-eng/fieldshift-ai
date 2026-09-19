import { useEffect, useState } from "react";
import { EvidencePanel, explainFactor } from "./evidence";

const api = "http://127.0.0.1:8000/api/v1";
const steps = ["Location", "Farm & Crop", "Analysis", "Results"];
type Crop = { id: string; common_name: string; family?: string };
type ApiResult = Record<string, unknown>;

const evidence = [
  { source_name: "NASA POWER", dataset_or_reference: "POWER Daily API", temporal_resolution: "daily", url: "https://power.larc.nasa.gov/" },
  { source_name: "NASA NSIDC DAAC", dataset_or_reference: "SMAP SPL4SMGP Version 8", spatial_resolution: "9 km", temporal_resolution: "3-hourly", url: "https://nsidc.org/data/spl4smgp/versions/8", quality_notes: ["Model/data-assimilation product, not an in-field sensor."] },
];

function resultStatus(result: ApiResult | null): "Suitable" | "Needs Attention" | "Limited" | "Unknown" {
  const text = JSON.stringify(result);
  if (text.includes("LIMITING")) return "Limited";
  if (text.includes("MARGINAL")) return "Needs Attention";
  if (text.includes("SUITABLE")) return "Suitable";
  return "Unknown";
}

export function App() {
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
    fetch(`${api}/crops`).then((response) => response.ok ? response.json() : Promise.reject()).then(setCrops).catch(() => setError("The crop library is unavailable right now."));
  }, []);

  const post = async (path: string, body: unknown): Promise<ApiResult> => {
    const response = await fetch(`${api}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!response.ok) throw new Error("Request failed");
    return response.json() as Promise<ApiResult>;
  };

  const runAnalysis = async () => {
    if (!selected[0]) { setError("Choose at least one supported crop before starting analysis."); setStep(1); return; }
    setError(""); setIsAnalyzing(true); setStep(2);
    const location = { latitude: Number(lat), longitude: Number(lon), start_date: "2025-01-01", end_date: "2025-01-03" };
    try {
      const [nextEnvironment, nextMoisture, nextSuitability, nextScenarios] = await Promise.all([
        post("/environment/context", location), post("/soil-moisture/context", location),
        post("/suitability/evaluate", { crop_id: selected[0], soil: { ...soil, pH: soil.pH ? Number(soil.pH) : null } }),
        post("/scenarios/generate", { candidate_crop_ids: selected, planning_horizon: 3 }),
      ]);
      setEnvironment(nextEnvironment); setMoisture(nextMoisture); setSuitability(nextSuitability); setScenarios(nextScenarios); setStep(3);
    } catch { setError("We could not complete the analysis. Please check the location and try again."); } finally { setIsAnalyzing(false); }
  };

  const toggleCrop = (cropId: string) => setSelected(selected.includes(cropId) ? selected.filter((id) => id !== cropId) : [...selected, cropId]);
  const currentStatus = resultStatus(suitability);
  const fieldCards = [
    ["Weather", environment ? "Available" : "Unknown", "NASA Earth data provides local weather context."],
    ["Soil", soil.texture || soil.pH || soil.drainage ? "Available" : "Unknown", "Your farm details are kept separate from observations."],
    ["Water", moisture ? "Available" : "Unknown", "Water context is shown with its source and limitations."],
    ["Crop suitability", currentStatus, explainFactor("Crop conditions", currentStatus === "Limited" ? "LIMITING" : currentStatus === "Suitable" ? "SUITABLE" : "UNKNOWN")],
  ];

  return <main className="app-shell"><section className="app-container">
    <header className="app-header"><p className="eyebrow">FIELD-SHIFT · 2026 NASA SPACE APPS CHALLENGE</p><h1>FieldShift AI</h1><p className="lede">Smarter crop decisions powered by NASA Earth data.</p></header>
    <ol className="progress" aria-label="Farm planning progress">{steps.map((name, index) => <li key={name} aria-current={index === step ? "step" : undefined} className={index === step ? "active" : index < step ? "complete" : ""}><span>{index + 1}</span>{name}</li>)}</ol>
    {error && <p className="alert" role="alert">{error}</p>}
    {step === 0 && <section className="hero-card"><div><p className="section-kicker">Step 1 · Location</p><h2>Start with your farm</h2><p>Choose a country for context, then enter the coordinates used for environmental analysis.</p></div><div className="location-card"><div className="location-icon" aria-hidden="true">⌖</div><div><h3>Select your farm location</h3><p>Works anywhere supported data and crop references are available.</p></div><div className="input-grid"><label>Country or region<input aria-label="Country" value={country} onChange={(event) => setCountry(event.target.value)} placeholder="Optional" /></label><label>Latitude<input aria-label="Latitude" inputMode="decimal" value={lat} onChange={(event) => setLat(event.target.value)} /></label><label>Longitude<input aria-label="Longitude" inputMode="decimal" value={lon} onChange={(event) => setLon(event.target.value)} /></label></div><p className="helper">Map selection is planned for a future update. Scientific requests use your coordinates.</p></div></section>}
    {step === 1 && <section className="step-panel"><div><p className="section-kicker">Step 2 · Farm & Crop</p><h2>Tell us about your farm</h2><p>Share only the details you know. Missing information stays clearly marked as unknown.</p></div><div className="farm-grid"><article className="input-card"><h3>Farm conditions</h3><p>Help us understand the soil information you have available.</p><label>How was this soil information recorded?<select aria-label="Soil source type" value={soil.source_type} onChange={(event) => setSoil({ ...soil, source_type: event.target.value })}>{["laboratory_measurement", "farmer_provided", "local_record", "modeled_estimate", "unknown"].map((source) => <option key={source}>{source.replaceAll("_", " ")}</option>)}</select></label><div className="input-grid compact"><label>Soil texture<input aria-label="texture" value={soil.texture} onChange={(event) => setSoil({ ...soil, texture: event.target.value })} /></label><label>pH, if known<input aria-label="pH" value={soil.pH} onChange={(event) => setSoil({ ...soil, pH: event.target.value })} /></label><label>Drainage<input aria-label="drainage" value={soil.drainage} onChange={(event) => setSoil({ ...soil, drainage: event.target.value })} /></label></div></article><article className="input-card"><h3>Crop selection</h3><p>Choose supported crops to explore. This small MVP library can grow with sourced profiles.</p><div className="crop-list">{crops.map((crop) => <label className="crop-option" key={crop.id}><input type="checkbox" checked={selected.includes(crop.id)} onChange={() => toggleCrop(crop.id)} /><span>{crop.common_name}<small>{crop.family ?? "Supported crop"}</small></span></label>)}</div></article><article className="input-card priorities"><h3>Farmer priorities</h3><p>These priorities describe what matters most to you. They do not change the underlying scientific assessment.</p>{Object.entries(priorities).map(([key, value]) => <label className="priority" key={key}><span>{key.replaceAll("_", " ")} <strong>{value}</strong></span><input aria-label={key} type="range" min="0" max="10" value={value} onChange={(event) => setPriorities({ ...priorities, [key]: Number(event.target.value) })} /></label>)}<p className="helper">Preference evidence is unavailable for scenario ordering, so options are not ranked by these controls.</p></article></div></section>}
    {step === 2 && <section className="analysis-card" aria-live="polite"><div className="analysis-orbit" aria-hidden="true">◌</div><p className="section-kicker">Step 3 · Analysis</p><h2>{isAnalyzing ? "Analyzing your farm..." : "Ready to analyze your farm"}</h2><p>We bring together the available environmental context, your farm inputs, and supported crop records.</p><ul className="analysis-stages">{["Weather", "Soil", "Water", "Crop Conditions", "Rotation Context"].map((name) => <li key={name}><span aria-hidden="true">✓</span>{name}</li>)}</ul>{!isAnalyzing && <button className="primary-button" onClick={runAnalysis}>Analyze my farm</button>}<details><summary>View Data Sources</summary><p>Uses NASA Earth observation data where available. NASA POWER and SMAP source details, units, provenance, and limitations are shown in the evidence view after analysis.</p></details></section>}
    {step === 3 && <section className="results-panel"><div><p className="section-kicker">Step 4 · Results</p><h2>Your farm context</h2><p>Simple highlights first. Open the evidence view whenever you want the supporting details.</p></div><div className="result-grid">{fieldCards.map(([title, status, description]) => <article className="result-card" key={title}><p>{title}</p><h3 className={`status ${status.toLowerCase().replaceAll(" ", "-")}`}>{status}</h3><span>{description}</span></article>)}</div><div className="results-columns"><article className="result-detail"><h3>Rotation options</h3><p>{scenarios ? "Available scenarios use supported crops and sourced rotation context. No option is labelled as the best." : "Run an analysis to see available rotation options."}</p></article><article className="result-detail"><h3>Why this result?</h3><p>{suitability ? explainFactor("Crop suitability", currentStatus === "Limited" ? "LIMITING" : currentStatus === "Suitable" ? "SUITABLE" : "UNKNOWN") : "Results remain unknown until the available evidence is analyzed."}</p></article></div><details className="evidence-details"><summary>View Evidence & Scientific Details</summary><EvidencePanel evidence={evidence} limitations={["Missing crop calendar can leave climate suitability UNKNOWN.", "SMAP is a 9 km model/data-assimilation context product.", "PREFERENCE_EVIDENCE_UNAVAILABLE: preferences do not reorder scenarios.", "Crop-pair compatibility evidence is not evaluated."]} /><pre>{JSON.stringify({ environment, moisture, suitability, scenarios }, null, 2)}</pre></details></section>}
    <nav className="step-actions" aria-label="Step navigation"><button className="secondary-button" disabled={!step || isAnalyzing} onClick={() => setStep(step - 1)}>Back</button>{step < 2 && <button className="primary-button" onClick={() => setStep(step + 1)}>{step === 0 ? "Continue to farm & crop" : "Continue to analysis"}</button>}{step === 2 && !isAnalyzing && <button className="secondary-button" onClick={() => setStep(3)}>View results</button>}{step === 3 && <button className="secondary-button" onClick={() => setStep(0)}>Start another farm</button>}</nav>
  </section></main>;
}
