import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FarmerResults } from "./farmer-results";
import { EvidencePanel } from "./evidence";

const suitability = { factor_results: [
  { factor: "temperature", status: "UNKNOWN", limitation: "Growing-period timing is not defined." },
  { factor: "soil_pH", status: "SUITABLE" },
] };

describe("farmer decision-value presentation", () => {
  it("guides a farmer when local soil information is missing and keeps factors separate", () => {
    render(<FarmerResults environment={null} moisture={null} suitability={suitability} scenarios={[]} priorities={{ water_conservation: 0, soil_health: 0, resilience: 0, productivity: 0 }} soil={{ source_type: "unknown", texture: "", pH: "", drainage: "" }} />);
    expect(screen.getByText("Soil information is incomplete.")).toBeInTheDocument();
    expect(screen.getByText("Add soil information to improve this assessment.")).toBeInTheDocument();
    expect(screen.getByText("Temperature")).toBeInTheDocument();
    expect(screen.getByText("Soil pH")).toBeInTheDocument();
    expect(screen.getByText("What can I do next?")).toBeInTheDocument();
  });

  it("shows human-readable POWER and SMAP evidence with collapsed scientific details", () => {
    render(<EvidencePanel power={{ source_status: "DEMO_SNAPSHOT", data: [{ variable: "T2M", value: 12.2, unit: "C", timestamp: "2025-01-01T00:00:00Z", provenance: { url: "https://power.larc.nasa.gov" } }] }} smap={{ source_status: "LIVE_DATA", data: [{ layer: "surface", value: 0.2, unit: "m3 m-3", timestamp: "2024-12-31T21:00:00Z", provenance: { url: "https://nsidc.org" } }] }} />);
    expect(screen.getAllByText("Average temperature")).not.toHaveLength(0);
    expect(screen.getAllByText("Surface soil moisture")).not.toHaveLength(0);
    expect(screen.getByText((_, element) => Boolean(element?.classList.contains("source-status") && element.textContent === "NASA POWER: Demo snapshot"))).toBeInTheDocument();
    expect(screen.getByText("Scientific Details")).toBeInTheDocument();
    expect(screen.queryByText(/\{\s*"data"/)).not.toBeInTheDocument();
  });

  it("lets farmers inspect a rotation path without ranking it", () => {
    const scenarios = [
      { scenario_id: "one", scientific_profile: { crops: ["wheat", "lentil", "barley"], diversity_descriptors: { distinct_crop_count: 3, distinct_family_count: 2 }, legume_presence: true, repeated_crop_flags: [], repeated_family_flags: [] }, foregrounded_dimensions: [] },
      { scenario_id: "two", scientific_profile: { crops: ["maize", "soybean", "sorghum"], diversity_descriptors: { distinct_crop_count: 3, distinct_family_count: 2 }, legume_presence: true, repeated_crop_flags: [], repeated_family_flags: [] }, foregrounded_dimensions: [] },
    ];
    render(<FarmerResults environment={null} moisture={null} suitability={suitability} scenarios={scenarios} priorities={{ water_conservation: 0, soil_health: 0, resilience: 0, productivity: 0 }} soil={{ source_type: "unknown", texture: "", pH: "", drainage: "" }} />);
    const first = screen.getByRole("button", { name: /Wheat → Lentil → Barley/ });
    const second = screen.getByRole("button", { name: /Maize → Soybean → Sorghum/ });
    expect(first).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(second);
    expect(second).toHaveAttribute("aria-pressed", "true");
    expect(first).toHaveAttribute("aria-pressed", "false");
    expect(screen.getByText("OPEN PATH")).toBeInTheDocument();
    expect(screen.queryByText(/best|winner|optimal/i)).not.toBeInTheDocument();
  });

  it("makes the descriptive variety filter reversible", () => {
    const scenarios = [
      { scenario_id: "repeated", scientific_profile: { crops: ["wheat", "wheat", "wheat"], diversity_descriptors: { distinct_crop_count: 1, distinct_family_count: 1 }, legume_presence: false, repeated_crop_flags: ["wheat"], repeated_family_flags: ["Poaceae"] }, foregrounded_dimensions: [] },
      { scenario_id: "varied", scientific_profile: { crops: ["wheat", "lentil", "barley"], diversity_descriptors: { distinct_crop_count: 3, distinct_family_count: 2 }, legume_presence: true, repeated_crop_flags: [], repeated_family_flags: [] }, foregrounded_dimensions: [] },
    ];
    render(<FarmerResults environment={null} moisture={null} suitability={suitability} scenarios={scenarios} priorities={{ water_conservation: 0, soil_health: 0, resilience: 0, productivity: 0 }} soil={{ source_type: "unknown", texture: "", pH: "", drainage: "" }} />);
    expect(screen.queryByRole("button", { name: /Wheat → Wheat → Wheat/ })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /All paths/ }));
    expect(screen.getByRole("button", { name: /Wheat → Wheat → Wheat/ })).toBeInTheDocument();
  });
});
