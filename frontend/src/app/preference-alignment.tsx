import { useTranslation } from "react-i18next";

type Priorities = Record<"water_conservation" | "soil_health" | "resilience" | "productivity", number>;
type Comparison = {
  scenario_id: string;
  foregrounded_dimensions: string[];
  unavailable_preference_dimensions: Record<string, string>;
};

export function PreferenceAlignmentSummary({ priorities, comparisons }: { priorities: Priorities; comparisons: Comparison[] }) {
  const { t } = useTranslation();
  const selected = Object.entries(priorities).filter(([, value]) => value > 0);
  const selectedDimensions = new Set(comparisons.flatMap((comparison) => comparison.foregrounded_dimensions));

  return <span className="preference-alignment" aria-label={t("preferenceComparison.heading")}>
    <strong>{t("preferenceComparison.heading")}</strong><br />
    <span>{t("preferenceComparison.note")}</span><br />
    {selected.length
      ? selected.map(([dimension, value]) => <span key={dimension}>{t(`farm.priority.${dimension}`)}: {value}<br /></span>)
      : <span>{t("preferenceComparison.noneSelected")}<br /></span>}
    <span>{selectedDimensions.has("soil_health") ? t("preferenceComparison.soilAvailable") : t("preferenceComparison.soilNotForegrounded")}</span><br />
    <span>{selectedDimensions.has("resilience") ? t("preferenceComparison.resilienceAvailable") : t("preferenceComparison.resilienceNotForegrounded")}</span><br />
    <span>{t("preferenceComparison.waterUnavailable")}</span><br />
    <span>{t("preferenceComparison.productivityUnavailable")}</span><br />
    {comparisons.map((comparison) => <span key={comparison.scenario_id}>{comparison.scenario_id}: {comparison.foregrounded_dimensions.length ? t("preferenceComparison.scenarioEvidence", { dimensions: comparison.foregrounded_dimensions.map((dimension) => t(`farm.priority.${dimension}`)).join(", ") }) : t("preferenceComparison.scenarioNoEvidence")}<br /></span>)}
  </span>;
}
