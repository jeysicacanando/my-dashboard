import { useEffect, useState } from "react";
import WidgetCard from "./WidgetCard";

type Weather = {
  temperature: number;
  windspeed: number;
};

type Status = "loading" | "error" | "success";

export default function WeatherWidget({
  lat = 14.85,
  lon = 121.08,
}: {
  lat?: number;
  lon?: number;
}) {
  const [status, setStatus] = useState<Status>("loading");
  const [weather, setWeather] = useState<Weather | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus("loading");

    async function load() {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast` +
          `?latitude=${lat}&longitude=${lon}&current_weather=true`;
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
  }, [lat, lon, attempt]);

  if (status === "loading") {
    return (
      <WidgetCard title="WEATHER">
        <p>Loading weather...</p>
      </WidgetCard>
    );
  }

  if (status === "error" || !weather) {
    return (
      <WidgetCard title="WEATHER">
        <p>Couldn't load weather.</p>
        <button onClick={() => setAttempt(a => a + 1)}>Try again</button>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="WEATHER">
      <p style={{ fontSize: "32px", fontWeight: 700, margin: "4px 0" }}>
        {weather.temperature}°C
      </p>
      <p style={{ margin: 0 }}>Wind: {weather.windspeed} km/h</p>
    </WidgetCard>
  );
}