import { useState } from "react";
import { useTranslation } from "react-i18next";

type Crop = { id: string; common_name: string; scientific_name?: string; family?: string; sources?: Array<{ source_name: string; url?: string }> };
type Soil = { source_type: string; texture: string; pH: string; drainage: string; salinity: string };
type Priorities = { water_conservation: number; soil_health: number; resilience: number; productivity: number };

export function FarmStep({ crops, selected, onToggleCrop, soil, onSoilChange, priorities, onPrioritiesChange }: {
  crops: Crop[];
  selected: string[];
  onToggleCrop: (cropId: string) => void;
  soil: Soil;
  onSoilChange: (next: Soil) => void;
  priorities: Priorities;
  onPrioritiesChange: (next: Priorities) => void;
}) {
  const { t, i18n } = useTranslation();
  const [query, setQuery] = useState("");
  const filtered = crops.filter((crop) => `${crop.common_name} ${crop.scientific_name ?? ""} ${t(`workspace.cropNames.${crop.id}`, { defaultValue: "" })}`.toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const cropName = (crop: Crop) => t(`workspace.cropNames.${crop.id}`, { defaultValue: crop.common_name });

  return <section className="step-panel farm-step">
    <div className="step-heading"><p className="section-kicker">{t("steps.farmKicker")}</p><h2>{t("farm.heading")}</h2><p>{t("farm.description")}</p></div>
    <div className="farm-grid">
      <article className="input-card soil-input-card">
        <p className="card-index">01 / {t("farm.conditions")}</p><h3>{t("farm.conditions")}</h3><p>{t("farm.conditionsDescription")}</p>
        <label>{t("farm.sourceType")}<select value={soil.source_type} onChange={(event) => onSoilChange({ ...soil, source_type: event.target.value })}>{["laboratory_measurement", "farmer_provided", "local_record", "modeled_estimate", "unknown"].map((source) => <option key={source} value={source}>{t(`farm.sources.${source}`)}</option>)}</select></label>
        <div className="input-grid compact">
          <label>{t("farm.texture")}<select value={soil.texture} onChange={(event) => onSoilChange({ ...soil, texture: event.target.value })}><option value="">{t("workspace.notKnown")}</option>{["heavy", "medium", "light", "organic"].map((value) => <option key={value} value={value}>{t(`workspace.texture.${value}`)}</option>)}</select></label>
          <label>{t("farm.ph")}<input type="number" min="0" max="14" step="0.1" value={soil.pH} onChange={(event) => onSoilChange({ ...soil, pH: event.target.value })} placeholder={t("workspace.notKnown")} /></label>
          <label>{t("farm.drainage")}<select value={soil.drainage} onChange={(event) => onSoilChange({ ...soil, drainage: event.target.value })}><option value="">{t("workspace.notKnown")}</option>{[["well (dry spells)", "well"], ["excessive (dry/moderately dry)", "excessive"], ["poorly (saturated >50% of year)", "poorly"]].map(([value, key]) => <option key={value} value={value}>{t(`workspace.drainage.${key}`)}</option>)}</select></label>
          <label>{t("salinityUX.label")}<input type="number" min="0" step="0.1" value={soil.salinity} onChange={(event) => onSoilChange({ ...soil, salinity: event.target.value })} placeholder={t("workspace.notKnown")} /></label>
        </div><p className="field-help">{t("workspace.soilHelp")}</p>
      </article>
      <article className="input-card crop-input-card">
        <p className="card-index">02 / {t("farm.crops")}</p><div className="card-title-row"><h3>{t("farm.crops")}</h3><span className="count-badge" dir="ltr">{selected.length} / 4</span></div><p>{t("workspace.cropLibrary", { count: crops.length })}</p>
        <label className="crop-search-label">{t("workspace.searchCrops")}<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("workspace.searchCropsPlaceholder")} /></label>
        <div className="crop-list" role="group" aria-label={t("farm.crops")}>
          {filtered.map((crop) => <label className="crop-option" key={crop.id}><input type="checkbox" checked={selected.includes(crop.id)} disabled={selected.length >= 4 && !selected.includes(crop.id)} onChange={() => onToggleCrop(crop.id)} /><span><strong>{cropName(crop)}</strong><small dir="ltr">{crop.scientific_name ?? crop.family ?? ""}</small></span><span className="crop-source">FAO</span></label>)}
        </div><p className="field-help">{t("workspace.cropHelp")}</p>
      </article>
      <article className="input-card priorities">
        <p className="card-index">03 / {t("farm.priorities")}</p><h3>{t("farm.priorities")}</h3><p>{t("farm.prioritiesDescription")}</p>
        <div className="priority-grid">{(Object.keys(priorities) as Array<keyof Priorities>).map((key) => <label className="priority" key={key}><span>{t(`farm.priority.${key}`)} <strong>{new Intl.NumberFormat(i18n.language).format(priorities[key])}</strong></span><input aria-label={t(`farm.priority.${key}`)} type="range" min="0" max="10" value={priorities[key]} onChange={(event) => onPrioritiesChange({ ...priorities, [key]: Number(event.target.value) })} /></label>)}</div>
        <p className="field-help">{t("farmerResults.preferences.supported")} {t("farmerResults.preferences.unavailable")}</p>
      </article>
    </div>
  </section>;
}
