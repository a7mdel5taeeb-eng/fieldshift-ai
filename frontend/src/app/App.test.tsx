import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { App } from "./App";
import { EvidencePanel } from "./evidence";
import { PreferenceAlignmentSummary } from "./preference-alignment";
import i18n from "../i18n";

const sourceStatus = (text: string) => screen.getByText((_, element) => Boolean(element?.classList.contains("source-status") && element.textContent?.includes(text)));

afterEach(async () => {
  window.localStorage.clear();
  await i18n.changeLanguage("en");
});

describe("App", () => {
  it("starts with the farmer-facing location journey", () => {
    render(<App />);

    expect(screen.getByRole("heading", { name: "FieldShift AI" })).toBeInTheDocument();
    expect(screen.getByText("Smarter crop decisions powered by NASA Earth data.")).toBeInTheDocument();
    expect(screen.getByText("Where is your farm?")).toBeInTheDocument();
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Location");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Farm & Crop");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Analysis");
    expect(screen.getByLabelText("Farm planning progress")).toHaveTextContent("Results");
  });

  it("switches to Arabic, activates RTL, and preserves the selected language", async () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Search country"), { target: { value: "Jordan" } });

    fireEvent.click(screen.getByRole("button", { name: "العربية" }));

    expect(await screen.findByText("قرارات محاصيل أذكى مدعومة ببيانات ناسا لرصد الأرض.")).toBeInTheDocument();
    expect(screen.getByText("الموقع")).toBeInTheDocument();
    expect(screen.getByLabelText("ابحث عن البلد")).toHaveValue("Jordan");
    await waitFor(() => expect(document.documentElement.dir).toBe("rtl"));
    expect(document.documentElement.lang).toBe("ar");
    expect(window.localStorage.getItem("fieldshift-language")).toBe("ar");
  });

  it("restores English LTR without resetting the workflow", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "العربية" }));
    await screen.findByText("أين تقع مزرعتك؟");
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(await screen.findByText("Where is your farm?")).toBeInTheDocument();
    await waitFor(() => expect(document.documentElement.dir).toBe("ltr"));
    expect(document.documentElement.lang).toBe("en");
  });

  it("shows translated status labels in the Arabic results view", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "العربية" }));
    await screen.findByText("أين تقع مزرعتك؟");
    fireEvent.click(screen.getByRole("button", { name: "المتابعة إلى المزرعة والمحصول" }));
    fireEvent.click(screen.getByRole("button", { name: "المتابعة إلى التحليل" }));
    fireEvent.click(screen.getByRole("button", { name: "عرض النتائج" }));

    expect(await screen.findAllByText("غير معروف")).not.toHaveLength(0);
  });

  it("shows every English source-status label in evidence", () => {
    render(<EvidencePanel evidence={[]} sourceStatuses={[
      { source_name: "NASA POWER", status: "LIVE_DATA" },
      { source_name: "SMAP cache", status: "CACHED_DATA" },
      { source_name: "SMAP demo", status: "DEMO_SNAPSHOT" },
      { source_name: "SMAP", status: "UNAVAILABLE" },
    ]} />);

    expect(sourceStatus("Live NASA data")).toBeInTheDocument();
    expect(sourceStatus("Cached data")).toBeInTheDocument();
    expect(sourceStatus("Demo snapshot")).toBeInTheDocument();
    expect(sourceStatus("Unavailable")).toBeInTheDocument();
  });

  it("shows Arabic source-status labels", async () => {
    await i18n.changeLanguage("ar");
    render(<EvidencePanel evidence={[]} sourceStatuses={[
      { source_name: "NASA POWER", status: "LIVE_DATA" },
      { source_name: "SMAP", status: "DEMO_SNAPSHOT" },
      { source_name: "Missing source", status: "UNAVAILABLE" },
    ]} />);

    expect(sourceStatus("بيانات ناسا المباشرة")).toBeInTheDocument();
    expect(sourceStatus("بيانات العرض التجريبي")).toBeInTheDocument();
    expect(sourceStatus("غير متوفر")).toBeInTheDocument();
  });

  it("keeps mixed POWER and SMAP source states separate", () => {
    render(<EvidencePanel evidence={[]} sourceStatuses={[
      { source_name: "NASA POWER", status: "LIVE_DATA" },
      { source_name: "SMAP", status: "DEMO_SNAPSHOT" },
    ]} />);

    expect(sourceStatus("NASA POWER: Live NASA data")).toBeInTheDocument();
    expect(sourceStatus("SMAP: Demo snapshot")).toBeInTheDocument();
  });

  it("presents qualitative preference evidence without a winner or score", () => {
    render(<PreferenceAlignmentSummary priorities={{ water_conservation: 4, soil_health: 3, resilience: 2, productivity: 1 }} comparisons={[{
      scenario_id: "scenario-1",
      foregrounded_dimensions: ["soil_health", "resilience"],
      unavailable_preference_dimensions: { water_conservation: "PREFERENCE_EVIDENCE_UNAVAILABLE", productivity: "PREFERENCE_EVIDENCE_UNAVAILABLE" },
    }]} />);

    expect(screen.getByText("More aligned with your stated priorities")).toBeInTheDocument();
    expect(screen.getByText(/Soil Health: qualitative rotation evidence is shown/)).toBeInTheDocument();
    expect(screen.getByText(/Resilience: qualitative rotation-diversity evidence is shown/)).toBeInTheDocument();
    expect(screen.getByText(/Water Conservation: PREFERENCE_EVIDENCE_UNAVAILABLE/)).toBeInTheDocument();
    expect(screen.getByText(/Productivity: PREFERENCE_EVIDENCE_UNAVAILABLE/)).toBeInTheDocument();
    expect(screen.queryByText(/best|winner|optimal/i)).not.toBeInTheDocument();
  });

  it("changes the foregrounded presentation when a user changes priorities", () => {
    const base = { water_conservation: 0, soil_health: 0, resilience: 0, productivity: 0 };
    const { rerender } = render(<PreferenceAlignmentSummary priorities={{ ...base, soil_health: 5 }} comparisons={[{
      scenario_id: "scenario-1", foregrounded_dimensions: ["soil_health"], unavailable_preference_dimensions: {},
    }]} />);

    expect(screen.getByText(/Soil Health: qualitative rotation evidence is shown/)).toBeInTheDocument();
    rerender(<PreferenceAlignmentSummary priorities={{ ...base, resilience: 5 }} comparisons={[{
      scenario_id: "scenario-1", foregrounded_dimensions: ["resilience"], unavailable_preference_dimensions: {},
    }]} />);
    expect(screen.getByText(/Resilience: qualitative rotation-diversity evidence is shown/)).toBeInTheDocument();
  });

  it("translates qualitative preference presentation into Arabic", async () => {
    await i18n.changeLanguage("ar");
    render(<PreferenceAlignmentSummary priorities={{ water_conservation: 1, soil_health: 1, resilience: 1, productivity: 1 }} comparisons={[{
      scenario_id: "scenario-1",
      foregrounded_dimensions: ["soil_health", "resilience"],
      unavailable_preference_dimensions: { water_conservation: "PREFERENCE_EVIDENCE_UNAVAILABLE", productivity: "PREFERENCE_EVIDENCE_UNAVAILABLE" },
    }]} />);

    expect(screen.getByText("أكثر اتساقًا مع أولوياتك المعلنة")).toBeInTheDocument();
    expect(screen.getByText(/صحة التربة: تظهر أدلة تناوب نوعية/)).toBeInTheDocument();
    expect(screen.getByText(/ترشيد استهلاك المياه: PREFERENCE_EVIDENCE_UNAVAILABLE/)).toBeInTheDocument();
  });
});
