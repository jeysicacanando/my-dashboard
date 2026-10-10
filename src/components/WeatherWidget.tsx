import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import WidgetCard from "./WidgetCard";

type Place = { name: string; lat: number; lon: number };
type HourItem = { time: string; temp: number; code: number; isDay: boolean };
type Weather = {
  temperature: number;
  windspeed: number;
  code: number;
  isDay: boolean;
  hours: HourItem[];
};
type Status = "loading" | "error" | "success";

// App.tsx sends one of these when you type "weather <city>" in the command bar.
// The id changes every time, so asking for the same city twice still works.
type Props = {
  request?: { city: string; id: number } | null;
};

const DEFAULT_PLACE: Place = { name: "Home", lat: 14.85, lon: 121.08 };

function describe(code: number, isDay: boolean): { icon: string; text: string } {
  if (code === 0) return { icon: isDay ? "☀️" : "🌙", text: "Clear sky" };
  if (code === 1) return { icon: isDay ? "🌤️" : "🌙", text: "Mostly clear" };
  if (code === 2) return { icon: "⛅", text: "Partly cloudy" };
  if (code === 3) return { icon: "☁️", text: "Overcast" };
  if (code === 45 || code === 48) return { icon: "🌫️", text: "Foggy" };
  if (code >= 51 && code <= 57) return { icon: "🌦️", text: "Drizzle" };
  if (code >= 61 && code <= 67) return { icon: "🌧️", text: "Rain" };
  if (code >= 71 && code <= 77) return { icon: "❄️", text: "Snow" };
  if (code >= 80 && code <= 82) return { icon: "🌧️", text: "Rain showers" };
  if (code === 85 || code === 86) return { icon: "🌨️", text: "Snow showers" };
  if (code >= 95) return { icon: "⛈️", text: "Thunderstorm" };
  return { icon: "🌡️", text: "Unknown" };
}

// Turns a city name into a Place. Throws an Error with a readable message on failure.
async function findCity(name: string): Promise<Place> {
  const url =
    `https://geocoding-api.open-meteo.com/v1/search` +
    `?name=${encodeURIComponent(name)}&count=1`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Search failed. Check your connection.");
  const data = await res.json();
  if (!data.results || data.results.length === 0) {
    throw new Error(`No city found for "${name}"`);
  }
  const r = data.results[0];
  return {
    name: r.country ? `${r.name}, ${r.country}` : r.name,
    lat: r.latitude,
    lon: r.longitude,
  };
}

export default function WeatherWidget({ request = null }: Props) {
  const [place, setPlace] = useState<Place>(() => {
    try {
      const saved = localStorage.getItem("weatherPlace");
      return saved ? (JSON.parse(saved) as Place) : DEFAULT_PLACE;
    } catch {
      return DEFAULT_PLACE;
    }
  });
  const [status, setStatus] = useState<Status>("loading");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Save the place whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem("weatherPlace", JSON.stringify(place));
    } catch {
      // storage unavailable, ignore
    }
  }, [place]);

  // Fetch the weather whenever the place changes (or Try again is clicked)
  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    async function load() {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${place.lat}&longitude=${place.lon}` +
          `&current_weather=true` +
          `&hourly=temperature_2m,weathercode` +
          `&timezone=auto&forecast_days=2`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        const cw = data.current_weather;
        const nowHour = String(cw.time).slice(0, 13) + ":00";
        const times: string[] = data.hourly.time;
        let start = times.findIndex((t) => t >= nowHour);
        if (start === -1) start = 0;

        const hours: HourItem[] = [];
        for (let i = start + 1; i <= start + 6 && i < times.length; i++) {
          const hour = Number(times[i].slice(11, 13));
          hours.push({
            time: times[i],
            temp: data.hourly.temperature_2m[i],
            code: data.hourly.weathercode[i],
            isDay: hour >= 6 && hour < 18,
          });
        }

        setWeather({
          temperature: cw.temperature,
          windspeed: cw.windspeed,
          code: cw.weathercode,
          isDay: cw.is_day === 1,
          hours,
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

  // Look up a city and make it the current place
  async function runSearch(name: string) {
    setSearching(true);
    setSearchError("");
    try {
      setPlace(await findCity(name));
      setQuery("");
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed.");
    } finally {
      setSearching(false);
    }
  }

  // The search box in the card
  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const name = query.trim();
    if (name) runSearch(name);
  }

  // A "weather <city>" command from the command bar
  useEffect(() => {
    if (request) runSearch(request.city);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const now = weather ? describe(weather.code, weather.isDay) : null;

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

      {status === "success" && weather && now && (
        <>
          <div className="mt-1 flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">
              {now.icon}
            </span>
            <div>
              <p className="text-3xl font-bold leading-none">
                {weather.temperature}°C
              </p>
              <p className="mt-1 text-sm">{now.text}</p>
            </div>
          </div>

          <p className="mt-1 text-sm opacity-70">
            Wind: {weather.windspeed} km/h
          </p>

          <div className="mt-3 grid grid-cols-3 gap-2 border-t border-line pt-3 sm:grid-cols-6">
            {weather.hours.map((h) => {
              const d = describe(h.code, h.isDay);
              return (
                <div key={h.time} className="text-center">
                  <p className="text-[10px] uppercase opacity-70">
                    {new Date(h.time).toLocaleTimeString([], {
                      hour: "numeric",
                    })}
                  </p>
                  <p className="text-lg" title={d.text}>
                    {d.icon}
                  </p>
                  <p className="text-xs">{Math.round(h.temp)}°</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </WidgetCard>
  );
}