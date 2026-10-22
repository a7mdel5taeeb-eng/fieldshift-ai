import { useState } from "react";
import { useTranslation } from "react-i18next";
import { BrandMark } from "./brand-mark";

const lenses = ["climate", "soil", "rotation"] as const;
type Lens = typeof lenses[number];

function FieldDiagram({ active, label }: { active: Lens; label: string }) {
  return <div className={`field-diagram field-diagram--${active}`} role="img" aria-label={label}>
    <svg viewBox="0 0 620 560" fill="none" aria-hidden="true">
      <defs>
        <pattern id="field-dots" width="13" height="13" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#283942" fillOpacity=".19" /></pattern>
        <clipPath id="field-boundary"><path d="M109 77 478 48 564 202 504 478 211 520 57 341Z" /></clipPath>
      </defs>
      <path className="field-boundary" d="M109 77 478 48 564 202 504 478 211 520 57 341Z" />
      <g clipPath="url(#field-boundary)">
        <path className="field-sector field-sector--climate" d="M0 0h680v245L345 302 42 190Z" />
        <path className="field-sector field-sector--soil" d="M0 192 345 302l-98 300H0Z" />
        <path className="field-sector field-sector--rotation" d="m345 302 335-77v375H247Z" />
        <path d="M0 0h680v600H0z" fill="url(#field-dots)" />
        <path d="M-32 128c156-46 239-14 365-67S522 51 663 30M-31 159c169-47 249-13 372-67S536 78 667 55M-27 189c180-48 259-10 385-68S541 109 663 82M-38 403c164-61 233-25 340-66s221-15 366-74M-30 434c172-59 239-27 350-68s219-16 361-73M-20 465c177-62 244-25 359-70s215-13 354-75M-20 498c180-64 251-28 370-74s208-10 349-73" stroke="#23353c" strokeOpacity=".32" strokeWidth="2" />
        <path d="M0 192 345 302l-98 300M345 302l335-77" stroke="#23353c" strokeWidth="4" />
        <path d="M-16 283 341 399l343-90M-4 316l337 110 354-89M-3 347l329 109 367-88" stroke="#fff8e8" strokeOpacity=".33" strokeWidth="3" strokeDasharray="9 13" />
      </g>
      <path d="M109 77 478 48 564 202 504 478 211 520 57 341Z" stroke="#27353b" strokeWidth="4" />
      <circle className="field-pin field-pin--climate" cx="344" cy="177" r="14" /><circle className="field-pin field-pin--soil" cx="188" cy="364" r="14" /><circle className="field-pin field-pin--rotation" cx="434" cy="378" r="14" />
      <path d="M344 177 400 134h120M188 364 100 400H25M434 378l84 43h98" stroke="#283942" strokeWidth="2" />
    </svg>
    <span className="field-diagram-label field-diagram-label--climate">01 / NASA POWER</span>
    <span className="field-diagram-label field-diagram-label--soil">02 / NASA SMAP + LOCAL</span>
    <span className="field-diagram-label field-diagram-label--rotation">03 / FAO + ROTATION</span>
    <span className="diagram-disclaimer">{label}</span>
  </div>;
}

export function IntroExperience({ onEnter }: { onEnter: () => void }) {
  const { t, i18n } = useTranslation();
  const [activeLens, setActiveLens] = useState<Lens>("climate");
  const changeLanguage = async (language: "en" | "ar") => {
    await i18n.changeLanguage(language);
    window.localStorage.setItem("fieldshift-language", language);
  };

  return <main className="atlas-page">
    <header className="atlas-header">
      <div className="atlas-brand"><BrandMark /><span>FieldShift <em>AI</em></span><small>{t("atlas.brandNote")}</small></div>
      <div className="atlas-top-actions"><span>{t("atlas.edition")}</span><div className="intro-language" aria-label={t("language.label")}><button type="button" aria-pressed={i18n.language !== "ar"} onClick={() => changeLanguage("en")}>EN</button><button type="button" aria-pressed={i18n.language === "ar"} onClick={() => changeLanguage("ar")}>عربي</button></div></div>
    </header>
    <section className="atlas-hero">
      <div className="atlas-copy">
        <p className="atlas-overline"><span className="atlas-asterisk" aria-hidden="true">✳</span>{t("atlas.overline")}</p>
        <h1>{t("atlas.titleOne")} <span>{t("atlas.titleTwo")}</span></h1>
        <p className="atlas-lede">{t("atlas.description")}</p>
        <div className="atlas-actions"><button type="button" className="atlas-start" onClick={onEnter}>{t("experience.start")}<span aria-hidden="true">↗</span></button><a href="#field-lenses" className="atlas-explore">{t("atlas.explore")} <span aria-hidden="true">↓</span></a></div>
        <p className="atlas-caution">{t("atlas.caution")}</p>
      </div>
      <div className="atlas-visual">
        <div className="atlas-visual-top"><span>{t("atlas.diagramKicker")}</span><span>FS — 001</span></div>
        <FieldDiagram active={activeLens} label={t("atlas.diagramLabel")} />
        <div className="atlas-visual-bottom"><span>{t("atlas.diagramFoot")}</span><span>01 / 03</span></div>
      </div>
    </section>
    <section id="field-lenses" className="atlas-lenses" aria-label={t("atlas.lensesTitle")}>
      <div className="atlas-lenses-heading"><p>{t("atlas.lensesKicker")}</p><h2>{t("atlas.lensesTitle")}</h2></div>
      <div className="atlas-lens-controls" role="group" aria-label={t("atlas.lensesTitle")}>{lenses.map((lens, index) => <button key={lens} type="button" aria-pressed={activeLens === lens} onClick={() => setActiveLens(lens)}><span>0{index + 1}</span><strong>{t(`atlas.lenses.${lens}.title`)}</strong></button>)}</div>
      <div className="atlas-lens-explanation" aria-live="polite"><span>{t("atlas.activeLens")}</span><p>{t(`atlas.lenses.${activeLens}.description`)}</p></div>
    </section>
    <footer className="atlas-footer"><span>{t("atlas.footerLeft")}</span><span>NASA POWER · NASA SMAP · FAO ECOCROP</span></footer>
  </main>;
}
