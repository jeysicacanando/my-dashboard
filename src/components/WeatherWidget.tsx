import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import WidgetCard from "./WidgetCard";

type Place = { name: string; lat: number; lon: number };
type Weather = { temperature: number; windspeed: number };
type Status = "loading" | "error" | "success";

const DEFAULT_PLACE: Place = { name: "Home", lat: 14.85, lon: 121.08 };

export default function WeatherWidget() {
  const [place, setPlace] = useState<Place>(DEFAULT_PLACE);
  const [status, setStatus] = useState<Status>("loading");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Fetch the weather whenever the place changes (or Try again is clicked)
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    async function load() {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${place.lat}&longitude=${place.lon}&current_weather=true`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setWeather({
          temperature: data.current_weather.temperature,
          windspeed: data.current_weather.windspeed,
        });
        setStatus("success");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setStatus("error");
      }
    }

    load();
    return () => controller.abort();
  }, [place, attempt]);

  // Turn a city name into coordinates
  async function handleSearch(e: FormEvent) {
    e.preventDefault();
    const name = query.trim();
    if (!name) return;

    setSearching(true);
    setSearchError("");
    try {
      const url =
        `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(name)}&count=1`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (!data.results || data.results.length === 0) {
        setSearchError(`No city found for "${name}"`);
        return;
      }

      const r = data.results[0];
      setPlace({
        name: r.country ? `${r.name}, ${r.country}` : r.name,
        lat: r.latitude,
        lon: r.longitude,
      });
      setQuery("");
    } catch {
      setSearchError("Search failed. Check your connection.");
    } finally {
      setSearching(false);
    }
  }

  return (
    <WidgetCard title="Weather">
      <form onSubmit={handleSearch} className="mb-3 flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city"
          className="min-w-0 flex-1 rounded-sm border border-line bg-transparent px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-sm border border-accent px-3 py-1.5 text-xs uppercase tracking-widest text-accent hover:bg-accent/10 disabled:opacity-50"
        >
          {searching ? "..." : "Go"}
        </button>
      </form>

      {searchError && (
        <p className="mb-2 text-xs text-red-400">{searchError}</p>
      )}

      <p className="text-xs uppercase tracking-widest opacity-70">
        {place.name}
      </p>

      {status === "loading" && (
        <p className="mt-2 text-sm opacity-70">Loading weather...</p>
      )}

      {status === "error" && (
        <div className="mt-2">
          <p className="mb-3 text-sm opacity-70">Couldn't load weather.</p>
          <button
            onClick={() => setAttempt((a) => a + 1)}
            className="rounded-sm border border-accent px-3 py-1 text-xs uppercase tracking-widest text-accent hover:bg-accent/10"
          >
            Try again
          </button>
        </div>
      )}

      {status === "success" && weather && (
        <>
          <p className="mt-1 text-3xl font-bold">{weather.temperature}°C</p>
          <p className="mt-1 text-sm opacity-70">
            Wind: {weather.windspeed} km/h
          </p>
        </>
      )}
    </WidgetCard>
  );
}