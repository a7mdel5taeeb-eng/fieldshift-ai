import { useTranslation } from "react-i18next";
import { BrandMark } from "./brand-mark";

export function IntroExperience({ onEnter }: { onEnter: () => void }) {
  const { t, i18n } = useTranslation();
  const changeLanguage = async (language: "en" | "ar") => {
    await i18n.changeLanguage(language);
    window.localStorage.setItem("fieldshift-language", language);
  };

  return <main className="intro-page">
    <div className="intro-grain" aria-hidden="true" />
    <header className="intro-topbar">
      <div className="intro-brand"><BrandMark /><span>FieldShift <em>AI</em></span></div>
      <div className="intro-top-actions"><span className="intro-top-note">{t("experience.researchLabel")}</span><div className="intro-language" aria-label={t("language.label")}><button type="button" aria-pressed={i18n.language !== "ar"} onClick={() => changeLanguage("en")}>EN</button><button type="button" aria-pressed={i18n.language === "ar"} onClick={() => changeLanguage("ar")}>عربي</button></div></div>
    </header>
    <section className="intro-main">
      <div className="intro-copy">
        <p className="intro-kicker"><span className="signal-dot" />{t("experience.eyebrow")}</p>
        <h1>{t("experience.titleFirst")}<br /><span>{t("experience.titleSecond")}</span></h1>
        <p className="intro-description">{t("experience.description")}</p>
        <div className="intro-buttons"><button type="button" className="intro-primary" onClick={onEnter}>{t("experience.start")}<span aria-hidden="true">↗</span></button><a href="#how-it-works" className="intro-secondary">{t("experience.explore")}<span aria-hidden="true">↓</span></a></div>
        <p className="intro-source-note">{t("experience.sourceNote")}</p>
      </div>
      <div className="earth-stage" role="img" aria-label={t("experience.earthLabel")}>
        <div className="earth-halo earth-halo-one" /><div className="earth-halo earth-halo-two" />
        <div className="earth-sphere"><svg viewBox="0 0 500 500" fill="none" aria-hidden="true">
          <defs><clipPath id="earth-clip"><circle cx="250" cy="250" r="225" /></clipPath><linearGradient id="earth-sea" x1="45" y1="82" x2="440" y2="460"><stop stopColor="#225C56" /><stop offset=".55" stopColor="#0F3F43" /><stop offset="1" stopColor="#08272E" /></linearGradient><radialGradient id="earth-light"><stop stopColor="#8AE2AD" stopOpacity=".28" /><stop offset="1" stopColor="#8AE2AD" stopOpacity="0" /></radialGradient></defs>
          <circle cx="250" cy="250" r="225" fill="url(#earth-sea)" stroke="#A0C9AC" strokeOpacity=".38" strokeWidth="2" />
          <g clipPath="url(#earth-clip)" stroke="#A9D9BE" strokeOpacity=".18" strokeWidth="1"><ellipse cx="250" cy="250" rx="80" ry="225" /><ellipse cx="250" cy="250" rx="158" ry="225" /><path d="M25 250h450M46 160h408M46 340h408M105 80h290M105 420h290" /></g>
          <g clipPath="url(#earth-clip)" fill="#5CBE83" fillOpacity=".78" stroke="#A6E5A3" strokeOpacity=".24" strokeWidth="2">
            <path d="M66 129c35-32 75-40 101-33l35 16 2 25-25 17-6 24-32 12-18 37-24-12-11-31-33-5-15-25Z" />
            <path d="M168 246c18 4 42 23 48 51l-9 23 9 27-31 66-22 17-11-19 7-28-20-26-5-37-14-25 15-35Z" />
            <path d="M225 130c48-48 116-58 167-39l30 20-17 33-37 10-15 25-36 4-20 25-24-7-8-34-22-10-30 10-19-18Z" />
            <path d="M258 211c28-23 67-26 88-8l12 39-14 42-24 11-10 31-27 33-14-24-17-22-18-54 5-31Z" />
            <path d="M385 337c31-10 65-3 87 20l15 40-40 29-45-5-32-28 7-37Z" />
          </g>
          <circle cx="250" cy="250" r="225" fill="url(#earth-light)" />
          <circle cx="250" cy="250" r="225" stroke="#C5F1C9" strokeOpacity=".38" strokeWidth="2" />
        </svg></div>
        <div className="earth-orbit"><span /><span /><span /></div>
        <div className="earth-callout callout-one"><small>01 / NASA POWER</small><strong>{t("experience.calloutClimate")}</strong></div>
        <div className="earth-callout callout-two"><small>02 / NASA SMAP</small><strong>{t("experience.calloutWater")}</strong></div>
        <div className="earth-callout callout-three"><small>03 / FAO ECOCROP</small><strong>{t("experience.calloutCrops")}</strong></div>
      </div>
    </section>
    <section id="how-it-works" className="intro-process" aria-label={t("experience.processTitle")}><div className="intro-process-heading"><p className="intro-kicker">{t("experience.processKicker")}</p><h2>{t("experience.processTitle")}</h2></div><div className="intro-process-grid"><article><span>01</span><h3>{t("experience.processLocation")}</h3><p>{t("experience.processLocationText")}</p></article><article><span>02</span><h3>{t("experience.processEvidence")}</h3><p>{t("experience.processEvidenceText")}</p></article><article><span>03</span><h3>{t("experience.processDecision")}</h3><p>{t("experience.processDecisionText")}</p></article></div></section>
  </main>;
}
