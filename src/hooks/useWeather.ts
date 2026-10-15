import { useState, useEffect } from "react";
import { loadWeather } from "../utils/weatherApi.ts";
import type { WeatherResult } from "../utils/weatherApi.ts";
import { errorCode } from "../utils/weather.ts";
import type { WeatherErrorCode } from "../utils/weather.ts";

interface Snapshot {
  city: string | null;
  revision: number;
  result: WeatherResult | null;
  error: WeatherErrorCode | null;
}

function locate(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation unavailable"));
    navigator.geolocation.getCurrentPosition(
      position => resolve(position.coords), reject, { timeout: 8000, maximumAge: 600000 },
    );
  });
}

export function useWeather(city: string | null) {
  const [revision, setRevision] = useState(0);
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    loadWeather(city, { apiKey: import.meta.env.VITE_OPENWEATHER_KEY, signal: controller.signal, locate })
      .then(result => {
        if (!controller.signal.aborted) setSnapshot({ city, revision, result, error: null });
      })
      .catch(error => {
        if (!controller.signal.aborted) setSnapshot({ city, revision, result: null, error: errorCode(error) });
      });
    return () => controller.abort();
  }, [city, revision]);

  useEffect(() => {
    const timer = window.setInterval(() => setRevision(value => value + 1), 10 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  // Hide another city's result immediately, but preserve the current page and
  // photo preview during a background refresh of the same city.
  const current = snapshot?.city === city ? snapshot : null;
  const refreshing = current?.revision !== revision;
  return {
    weather: current?.result?.weather ?? null,
    forecast: current?.result?.forecast ?? [],
    forecastError: current?.result?.forecastError ?? null,
    usedFallback: current?.result?.usedFallback ?? false,
    loading: !current || (refreshing && !current.result),
    refreshing: Boolean(current?.result && refreshing),
    error: refreshing ? null : current?.error ?? null,
    retry: () => setRevision(value => value + 1),
  };
}
