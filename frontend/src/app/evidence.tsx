/* eslint-disable react-refresh/only-export-components */
import { useTranslation } from "react-i18next";
export type Evidence = { source_name?: string; dataset_or_reference?: string; variable?: string; value?: string | number; unit?: string; observation_time?: string; spatial_resolution?: string; temporal_resolution?: string; url?: string; quality_notes?: string[] };

export function explainFactor(factor: string, status: string, evidence?: Evidence): string {
  const source = evidence?.source_name ?? "available evidence";
  if (status === "LIMITING") return `${factor} is LIMITING based on ${source}; inspect the documented requirement and local input.`;
  if (status === "SUITABLE") return `${factor} is SUITABLE within the documented evaluated evidence from ${source}.`;
  return `${factor} is UNKNOWN because required evidence, a crop calendar, or a sourced requirement is unavailable.`;
}

export function EvidencePanel({ evidence, limitations = [] }: { evidence: Evidence[]; limitations?: string[] }) {
  const { t } = useTranslation();
  return <section aria-label={t("evidence.section")} className="mt-4 rounded border border-slate-600 p-3"><h3 className="font-semibold">{t("evidence.heading")}</h3>{evidence.length ? evidence.map((item, index) => <article key={index} className="mt-2 text-sm"><strong>{item.source_name ?? t("evidence.sourceUnavailable")}</strong>{item.dataset_or_reference && <span> — {item.dataset_or_reference}</span>}{item.variable && <span>; {item.variable}</span>}{item.value !== undefined && <span>: {item.value} {item.unit}</span>}{item.observation_time && <span>; {t("evidence.observed")} {item.observation_time}</span>}{item.spatial_resolution && <span>; {item.spatial_resolution}</span>}{item.temporal_resolution && <span>; {item.temporal_resolution}</span>}{item.url && <a className="ml-2 text-cyan-300 underline" href={item.url}>{t("evidence.source")}</a>}{item.quality_notes?.map((note) => <p key={note}>{t("evidence.quality")}: {note}</p>)}</article>) : <p className="text-sm">{t("evidence.unavailable")}</p>}<h3 className="mt-3 font-semibold">{t("evidence.limitations")}</h3>{limitations.length ? <ul>{limitations.map((item) => <li key={item}>{item}</li>)}</ul> : <p className="text-sm">{t("evidence.noLimitations")}</p>}</section>;
}
