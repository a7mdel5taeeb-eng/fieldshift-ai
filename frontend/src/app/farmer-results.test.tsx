import { render, screen } from "@testing-library/react";
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
});
