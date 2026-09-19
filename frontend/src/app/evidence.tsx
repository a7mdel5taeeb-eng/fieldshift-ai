import { useTranslation } from "react-i18next";
import { normalizeSourceStatus, type SourceStatus } from "./source-status";

type Evidence = Record<string, unknown>;
const names: Record<string, string> = { T2M: "Average temperature", T2M_MIN: "Minimum temperature", T2M_MAX: "Maximum temperature", PRECTOTCORR: "Rainfall", RH2M: "Relative humidity", surface: "Surface soil moisture", root_zone: "Root-zone soil moisture" };

export function explainFactor(factor: string, status: string, evidence?: Evidence): string {
  const source = evidence?.source_name ?? "available evidence";
  if (status !== "UNKNOWN") return `${factor} is ${status} within the documented evaluated evidence from ${source}.`;
  return `${factor} is UNKNOWN because required evidence, a crop calendar, or a sourced requirement is unavailable.`;
}

function observations(value: Evidence | null): Evidence[] { return Array.isArray(value?.data) ? value.data as Evidence[] : []; }
function sourceStatus(value: Evidence | null): SourceStatus { return normalizeSourceStatus(value?.source_status); }
function humanName(value: unknown) { return names[String(value)] ?? String(value ?? "Observation"); }

function SourceBadge({ name, status }: { name: string; status: SourceStatus }) {
  const { t } = useTranslation();
  return <p className="source-status"><strong>{name}</strong>: {t(`sourceStatus.${status}`)}</p>;
}

export function EvidencePanel({ power = null, smap = null, suitability = null, sourceStatuses = [] }: { power?: Evidence | null; smap?: Evidence | null; suitability?: Evidence | null; evidence?: Evidence[]; sourceStatuses?: Array<{ source_name: string; status: SourceStatus | string | undefined }> }) {
  const { t } = useTranslation();
  const powerData = observations(power);
  const smapData = observations(smap);
  const factors = (suitability?.factor_results ?? []) as Evidence[];
  const sourceLink = (data: Evidence[]): string | undefined => {
    const url = (data[0]?.provenance as Evidence | undefined)?.url;
    return typeof url === "string" ? url : undefined;
  };
  return <section className="evidence-panel" aria-label={t("evidence.section")}>
    <h3>{t("evidence.heading")}</h3>{sourceStatuses.map((item) => <SourceBadge key={item.source_name} name={item.source_name} status={normalizeSourceStatus(item.status)} />)}
    <article className="evidence-card"><h4>NASA POWER</h4><SourceBadge name="NASA POWER" status={sourceStatus(power)} /><p>{t("farmerResults.evidence.powerDataset")}</p>{powerData.length ? <ul>{powerData.map((item) => <li key={String(item.variable)}><strong>{humanName(item.variable)}</strong>: {String(item.value)} {String(item.unit)} — {t("evidence.observed")} {String(item.timestamp).slice(0, 10)}</li>)}</ul> : <p>{t("evidence.unavailable")}</p>}<p className="card-note">{t("farmerResults.evidence.powerLimitation")}</p>{sourceLink(powerData) && <a href={sourceLink(powerData)}>{t("evidence.source")}</a>}</article>
    <article className="evidence-card"><h4>NASA SMAP</h4><SourceBadge name="NASA SMAP" status={sourceStatus(smap)} /><p>SPL4SMGP Version 8</p>{smapData.length ? <ul>{smapData.map((item) => <li key={String(item.layer)}><strong>{humanName(item.layer)}</strong>: {String(item.value)} {String(item.unit)} — {t("evidence.observed")} {String(item.timestamp)}</li>)}</ul> : <p>{t("evidence.unavailable")}</p>}<p>{t("farmerResults.evidence.smapScale")}</p><p className="card-note">{t("farmerResults.evidence.smapLimitation")}</p>{sourceLink(smapData) && <a href={sourceLink(smapData)}>{t("evidence.source")}</a>}</article>
    <article className="evidence-card"><h4>{t("farmerResults.evidence.cropTitle")}</h4>{factors.length ? <ul>{factors.map((factor) => <li key={String(factor.factor)}><strong>{t(`farmerResults.factor.${String(factor.factor)}`)}</strong>: {t(`results.statuses.${String(factor.status)}`)}{factor.limitation ? <small> — {String(factor.limitation)}</small> : null}</li>)}</ul> : <p>{t("evidence.unavailable")}</p>}</article>
    <details><summary>{t("farmerResults.evidence.scientificDetails")}</summary><div className="scientific-details">{[...powerData, ...smapData].map((item, index) => { const provenance = item.provenance as Record<string, string | string[] | undefined> | undefined; return <article key={`${String(item.variable ?? item.layer)}-${index}`}><strong>{humanName(item.variable ?? item.layer)}</strong><p>{t("farmerResults.evidence.dataset")}: {String(item.source_dataset ?? item.dataset ?? provenance?.dataset_or_reference ?? "—")}</p><p>{t("farmerResults.evidence.resolution")}: {String(item.spatial_resolution ?? provenance?.spatial_resolution ?? "—")}; {t("farmerResults.evidence.temporal")}: {String(item.temporal_resolution ?? provenance?.temporal_resolution ?? "—")}</p>{provenance?.citation && <p>{t("farmerResults.evidence.reference")}: {String(provenance.citation)}</p>}{provenance?.retrieved_at && <p>{t("farmerResults.evidence.retrieved")}: {String(provenance.retrieved_at)}</p>}{Array.isArray(provenance?.processing_steps) && provenance.processing_steps.length > 0 && <p>{t("farmerResults.evidence.processing")}: {provenance.processing_steps.join("; ")}</p>}{Array.isArray(provenance?.quality_notes) && provenance.quality_notes.length > 0 && <p>{t("evidence.quality")}: {provenance.quality_notes.join("; ")}</p>}</article>; })}</div></details>
  </section>;
}
