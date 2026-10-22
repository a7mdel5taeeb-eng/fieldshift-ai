import { useTranslation } from "react-i18next";

type FieldContextProps = {
  step: number;
  latitude: string;
  longitude: string;
  observationDate: string;
  selectedCrops: string[];
  soilSource: string;
};

export function FieldContext({ step, latitude, longitude, observationDate, selectedCrops, soilSource }: FieldContextProps) {
  const { t } = useTranslation();
  const hasPlace = latitude.trim() !== "" && longitude.trim() !== "";
  const cropNames = selectedCrops.map((crop) => t(`workspace.cropNames.${crop}`, { defaultValue: crop }));

  return <aside className="field-context" aria-label={t("fieldContext.title")}>
    <div className="field-context-head"><span>FS / 0{step + 1}</span><span>{t("fieldContext.liveNote")}</span></div>
    <div className="field-context-glyph" aria-hidden="true"><span /><span /><span /><i /></div>
    <p className="field-context-kicker">{t("fieldContext.title")}</p>
    <h2>{t(`fieldContext.stage${step}`)}</h2>
    <p className="field-context-description">{t(`fieldContext.stage${step}Note`)}</p>
    <dl>
      <div><dt>{t("fieldContext.site")}</dt><dd dir="ltr">{hasPlace ? `${latitude}, ${longitude}` : t("fieldContext.pending")}</dd></div>
      <div><dt>{t("fieldContext.date")}</dt><dd dir="ltr">{observationDate || t("fieldContext.pending")}</dd></div>
      <div><dt>{t("fieldContext.crops")}</dt><dd>{cropNames.length ? cropNames.join(" · ") : t("fieldContext.pending")}</dd></div>
      <div><dt>{t("fieldContext.soil")}</dt><dd>{soilSource !== "unknown" ? t(`farm.sources.${soilSource}`) : t("fieldContext.notSupplied")}</dd></div>
    </dl>
    <p className="field-context-foot">{t("fieldContext.foot")}</p>
  </aside>;
}
