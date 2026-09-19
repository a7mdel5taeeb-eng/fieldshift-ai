import { useState } from "react";
export function App() {
  const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100 sm:px-10">
      <section className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold tracking-[0.18em] text-cyan-300 uppercase">
          2026 NASA Space Apps Challenge
        </p>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">FieldShift AI</h1>
        <p className="mt-6 text-lg text-slate-300">NASA POWER environmental context.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2"><input aria-label="Latitude" defaultValue="24.7" className="rounded p-3 text-slate-900"/><input aria-label="Longitude" defaultValue="47.3" className="rounded p-3 text-slate-900"/><input aria-label="Start date" type="date" defaultValue="2025-01-01" className="rounded p-3 text-slate-900"/><input aria-label="End date" type="date" defaultValue="2025-01-03" className="rounded p-3 text-slate-900"/></div>
        <button onClick={() => { setLoading(true); setError(""); setTimeout(() => { setLoading(false); setError("Connect the local backend to load data."); }, 100); }} className="mt-4 rounded bg-cyan-300 px-4 py-2 font-semibold text-slate-950">Load NASA Data</button>
        {loading && <p className="mt-3">Loading NASA POWER data…</p>}{error && <p role="alert" className="mt-3">{error}</p>}
        <p className="mt-6 text-sm text-slate-400">Source: NASA POWER. Values are source-native resolution, not field measurements.</p>
        <section className="mt-10 border-t border-slate-700 pt-6" aria-labelledby="smap-heading">
          <h2 id="smap-heading" className="text-2xl font-semibold">NASA SMAP soil-moisture context</h2>
          <p className="mt-3 text-slate-300">Surface (0–5 cm) and root-zone (0–100 cm) moisture are available as volumetric values when an authorized source granule is configured.</p>
          <p className="mt-3 text-sm text-slate-400">Source: NASA SMAP SPL4SMGP Version 8 · 3-hourly · 9 km EASE-Grid 2.0 · not a field sensor measurement.</p>
          <p className="mt-2 text-sm text-amber-200">Quality notice: 2026-05-14 to 2026-07-28 has a reported geolocation issue; Standard products are being reprocessed.</p>
          <p className="mt-2 text-sm text-slate-400">Loading and unavailable states are supported by the soil-moisture endpoint. Status: unavailable until NASA Earthdata access and an authorized SMAP granule are configured locally.</p>
        </section>
      </section>
    </main>
  );
}
