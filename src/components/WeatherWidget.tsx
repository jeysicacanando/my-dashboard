import { useEffect, useState } from 'react'
import WidgetCard from './WidgetCard'
import { useLocalStorage } from '../hooks/useLocalStorage'

const DEFAULT_LOCATION = { lat: 14.52, lon: 121.05, label: 'Taguig' }
const REFRESH_MS = 20 * 60 * 1000 // 20 minutes

type Place = typeof DEFAULT_LOCATION
type Reading = {
  temp: number
  code: number
  rainChance: number | null
  fetchedAt: number
  lat: number
  lon: number
}

function describe(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mostly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Fog'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code === 85 || code === 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Unknown'
}

// Round to 2 decimals (about 1 km) so we don't store or send a precise position.
const round = (n: number) => Math.round(n * 100) / 100

export default function WeatherWidget() {
  const [location, setLocation] = useLocalStorage<Place>('weather-location', DEFAULT_LOCATION)
  const [cache, setCache] = useLocalStorage<Reading | null>('weather-cache', null)
  const [failed, setFailed] = useState(false)
  const [tick, setTick] = useState(0) // bump this to trigger a refetch
  const [geoMessage, setGeoMessage] = useState('')

  // Only use the saved reading if it belongs to the current location.
  const reading =
    cache && cache.lat === location.lat && cache.lon === location.lon ? cache : null

  // Trigger a refetch every 20 minutes and when the connection comes back.
  useEffect(() => {
    const id = setInterval(() => setTick((n) => n + 1), REFRESH_MS)
    const onOnline = () => setTick((n) => n + 1)
    window.addEventListener('online', onOnline)
    return () => {
      clearInterval(id)
      window.removeEventListener('online', onOnline)
    }
  }, [])

  // Fetch whenever the location changes or tick changes.
  useEffect(() => {
    const controller = new AbortController()

    async function load() {
      try {
        const url =
          `https://api.open-meteo.com/v1/forecast?latitude=${location.lat}&longitude=${location.lon}` +
          `&current=temperature_2m,weather_code` +
          `&daily=precipitation_probability_max&timezone=auto&forecast_days=1`

        const res = await fetch(url, { signal: controller.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = await res.json()

        const temp = data?.current?.temperature_2m
        const code = data?.current?.weather_code
        if (typeof temp !== 'number' || typeof code !== 'number') {
          throw new Error('Unexpected data')
        }

        setCache({
          temp: Math.round(temp),
          code,
          rainChance: data?.daily?.precipitation_probability_max?.[0] ?? null,
          fetchedAt: Date.now(),
          lat: location.lat,
          lon: location.lon,
        })
        setFailed(false)
      } catch {
        if (controller.signal.aborted) return
        setFailed(true)
      }
    }

    load()
    return () => controller.abort()
  }, [location.lat, location.lon, tick, setCache])

  function chooseLocation(place: Place) {
    setFailed(false)
    setLocation(place)
  }

  function locateMe() {
    if (!('geolocation' in navigator)) {
      setGeoMessage('Location is not supported on this browser.')
      return
    }
    setGeoMessage('Finding your location...')
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        chooseLocation({
          lat: round(pos.coords.latitude),
          lon: round(pos.coords.longitude),
          label: 'My location',
        })
        setGeoMessage('')
      },
      (err) => {
        setGeoMessage(
          err.code === err.PERMISSION_DENIED
            ? `Location permission was denied. Still using ${location.label}.`
            : "Couldn't get your location."
        )
      },
      { timeout: 10000, maximumAge: 10 * 60 * 1000 }
    )
  }

  function retry() {
    setFailed(false)
    setTick((n) => n + 1)
  }

  const updatedAt = reading
    ? new Date(reading.fetchedAt).toLocaleTimeString('en-PH', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''

  return (
    <WidgetCard title="Weather">
      {!reading && !failed && <p className="text-muted">Fetching weather...</p>}

      {!reading && failed && (
        <div>
          <p className="text-ink">Couldn't load the weather.</p>
          <button
            onClick={retry}
            className="mt-2 min-h-11 rounded-lg bg-accent px-4 font-medium text-void"
          >
            Retry
          </button>
        </div>
      )}

      {reading && (
        <div>
          <p className="text-4xl font-semibold text-ink">{reading.temp}°C</p>
          <p className="text-muted">{describe(reading.code)}</p>
          {reading.rainChance !== null && (
            <p className="mt-1 text-sm text-muted">
              Chance of rain today: {reading.rainChance}%
            </p>
          )}
          <p className="mt-1 text-xs text-faint">
            {location.label} · updated {updatedAt}
          </p>
          {failed && (
            <p className="mt-1 text-sm text-warn">
              Can't refresh right now. Showing saved data.
            </p>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          onClick={locateMe}
          className="min-h-11 rounded-lg border border-line px-3 text-sm text-ink"
        >
          Use my location
        </button>
        {location.label !== DEFAULT_LOCATION.label && (
          <button
            onClick={() => chooseLocation(DEFAULT_LOCATION)}
            className="min-h-11 rounded-lg px-3 text-sm text-muted underline"
          >
            Back to {DEFAULT_LOCATION.label}
          </button>
        )}
      </div>
      {geoMessage && (
        <p role="status" className="mt-2 text-sm text-muted">
          {geoMessage}
        </p>
      )}
    </WidgetCard>
  )
}