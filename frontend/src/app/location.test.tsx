import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import i18n from "../i18n";
import { App } from "./App";

const coordinates = { latitude: 31.2, longitude: 29.9 } as GeolocationCoordinates;

afterEach(async () => { vi.unstubAllGlobals(); window.localStorage.clear(); await i18n.changeLanguage("en"); });

describe("farmer-friendly location selection", () => {
  it("shows GPS, handles success, and keeps real coordinates", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: (success: PositionCallback) => success({ coords: coordinates } as GeolocationPosition) } });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Use My Current Location" }));
    expect(await screen.findByText("Current location detected")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Advanced location options"));
    expect(screen.getByLabelText("Latitude")).toHaveValue("31.2");
    expect(screen.getByLabelText("Longitude")).toHaveValue("29.9");
  });

  it("reports denied and unavailable GPS without fabricating coordinates", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => [] }));
    Object.defineProperty(navigator, "geolocation", { configurable: true, value: { getCurrentPosition: (_success: PositionCallback, failure: PositionErrorCallback) => failure({ code: 1 } as GeolocationPositionError) } });
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Use My Current Location" }));
    expect(await screen.findByText(/Location permission was denied/)).toBeInTheDocument();
  });

  it("searches a global country/place selector and makes a selected place authoritative", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: true, json: async () => [] }).mockResolvedValueOnce({ ok: true, json: async () => [{ display_name: "Alexandria, Egypt", lat: "31.2001", lon: "29.9187", address: { country: "Egypt", country_code: "eg" } }] }));
    render(<App />);
    const country = screen.getByLabelText("Search country");
    fireEvent.change(country, { target: { value: "Egypt" } });
    expect(country).toHaveValue("Egypt");
    fireEvent.change(screen.getByLabelText("City / Region / Place"), { target: { value: "Alexandria" } });
    fireEvent.click(screen.getByRole("button", { name: "Search place" }));
    fireEvent.click(await screen.findByRole("button", { name: "Alexandria, Egypt" }));
    fireEvent.click(screen.getByText("Advanced location options"));
    expect(screen.getByLabelText("Latitude")).toHaveValue("31.2001");
    expect(screen.getByLabelText("Longitude")).toHaveValue("29.9187");
    fireEvent.change(screen.getByLabelText("Latitude"), { target: { value: "30" } });
    await waitFor(() => expect(screen.getByText("Manual location")).toBeInTheDocument());
  });
});
