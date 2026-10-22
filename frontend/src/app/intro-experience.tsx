import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrandMark } from "./brand-mark";

const evidenceItems = [
  { number: "01", key: "climate" },
  { number: "02", key: "soil" },
  { number: "03", key: "rotation" },
] as const;
type EvidenceKey = (typeof evidenceItems)[number]["key"];

function SignalIcon({ kind }: { kind: EvidenceKey }) {
  if (kind === "climate") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15a5 5 0 0 0 7.7 4.2A5.5 5.5 0 1 0 18 9.1 4.3 4.3 0 0 0 10 10.5 4.5 4.5 0 0 0 3 15Z" /><path d="M6 5v3m6-6v3m6 1v3" /></svg>;
  if (kind === "soil") return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3s6 6.3 6 11a6 6 0 1 1-12 0c0-4.7 6-11 6-11Z" /><path d="M9 16c.5 1.1 1.4 1.7 2.8 1.8" /></svg>;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 8h12m0 0-3-3m3 3-3 3M20 16H8m0 0 3-3m-3 3 3 3" /></svg>;
}

export function IntroExperience({ onEnter }: { onEnter: () => void }) {
  const { t, i18n } = useTranslation();
  const [activeEvidence, setActiveEvidence] = useState<EvidenceKey>("climate");
  const changeLanguage = async (language: "en" | "ar") => {
    await i18n.changeLanguage(language);
    window.localStorage.setItem("fieldshift-language", language);
  };
  const active = evidenceItems.find((item) => item.key === activeEvidence)!;
  return <main className="signal-page">
    <header className="signal-header">
      <button className="signal-brand" type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="FieldShift home"><BrandMark /><span>FieldShift</span><i>AI</i></button>
      <div className="signal-header-meta"><span className="signal-status"><b /> {t("atlas.brandNote")}</span><div className="signal-language" aria-label={t("language.label")}><button type="button" aria-pressed={i18n.language !== "ar"} onClick={() => changeLanguage("en")}>EN</button><button type="button" aria-pressed={i18n.language === "ar"} onClick={() => changeLanguage("ar")}>ع</button></div></div>
    </header>
    <section className="signal-hero">
      <div className="signal-hero-image" aria-hidden="true"><img src="/images/fieldshift-aerial-hero-v1.png" alt="" /><div className="signal-image-wash" /></div>
      <div className="signal-hero-content"><p className="signal-kicker"><span>◒</span>{t("experience.researchLabel")}</p><h1>{t("experience.titleFirst")} <em>{t("experience.titleSecond")}</em></h1><p className="signal-lede">{t("experience.description")}</p><div className="signal-actions"><button type="button" className="signal-primary" onClick={onEnter}>{t("experience.start")} <span aria-hidden="true">→</span></button><a href="#evidence" className="signal-secondary">{t("experience.explore")} <span aria-hidden="true">↓</span></a></div></div>
      <aside className="signal-readout" aria-label="FieldShift data sources"><div className="signal-readout-top"><span>{t("atlas.edition")}</span><span>01 — 03</span></div><div className="signal-readout-location"><span className="signal-location-dot" /><div><small>{t("locationUX.selected")}</small><strong>24.700° N · 47.300° E</strong><p>{t("workspace.samplePlace")}</p></div></div><div className="signal-readout-divider" /><div className="signal-source"><span>NASA POWER</span><strong>{t("experience.calloutClimate")}</strong><p>{t("atlas.lenses.climate.description")}</p></div><div className="signal-source"><span>NASA SMAP</span><strong>{t("experience.calloutWater")}</strong><p>{t("atlas.lenses.soil.description")}</p></div><div className="signal-readout-foot"><span>◉</span>{t("experience.sourceNote")}</div></aside>
      <div className="signal-scroll-cue"><span>{t("atlas.explore")}</span><i /></div>
    </section>
    <section id="evidence" className="signal-evidence"><div className="signal-evidence-intro"><p className="signal-kicker">01 / {t("atlas.lensesKicker")}</p><h2>{t("atlas.lensesTitle")}</h2><p>{t("atlas.caution")}</p></div><div className="signal-evidence-board"><div className="signal-evidence-tabs" role="tablist" aria-label={t("atlas.lensesTitle")}>{evidenceItems.map((item) => <button key={item.key} type="button" role="tab" aria-selected={activeEvidence === item.key} onClick={() => setActiveEvidence(item.key)}><span>{item.number}</span><SignalIcon kind={item.key} /><strong>{t(`atlas.lenses.${item.key}.title`)}</strong></button>)}</div><div className="signal-evidence-detail" aria-live="polite"><div><span>{active.number} / {t("atlas.activeLens")}</span><h3>{t(`atlas.lenses.${active.key}.title`)}</h3><p>{t(`atlas.lenses.${active.key}.description`)}</p></div><button type="button" onClick={onEnter}>{t("experience.start")} <span aria-hidden="true">→</span></button></div></div></section>
    <footer className="signal-footer"><span>FieldShift AI</span><span>{t("atlas.footerLeft")}</span><span>NASA POWER · NASA SMAP · FAO ECOCROP</span></footer>
  </main>;
}
