import { errorCode, parseForecast, parseWeather, WeatherError } from "./weather.ts";
import type { ForecastDay, WeatherData, WeatherErrorCode } from "./weather.ts";

export interface WeatherResult {
  weather: WeatherData;
  forecast: ForecastDay[];
  forecastError: WeatherErrorCode | null;
  usedFallback: boolean;
}

interface Options {
  apiKey: string | undefined;
  signal: AbortSignal;
  fetcher?: typeof fetch;
  locate: () => Promise<{ latitude: number; longitude: number }>;
}

async function request(path: string, params: Record<string, string>, options: Options): Promise<unknown> {
  options.signal.throwIfAborted();
  const query = new URLSearchParams({ ...params, appid: options.apiKey!, units: "imperial" });
  const signal = AbortSignal.any([options.signal, AbortSignal.timeout(15000)]);
  const response = await (options.fetcher ?? fetch)(`https://api.openweathermap.org/data/2.5/${path}?${query}`, { signal });
  if (!response.ok) {
    if (response.status === 404) throw new WeatherError("not-found");
    if (response.status === 401 || response.status === 403) throw new WeatherError("unauthorized");
    if (response.status === 429) throw new WeatherError("rate-limit");
    throw new WeatherError("service");
  }
  try {
    return await response.json();
  } catch {
    throw new WeatherError("invalid-data");
  }
}

export async function loadWeather(city: string | null, options: Options): Promise<WeatherResult> {
  if (!options.apiKey?.trim()) throw new WeatherError("configuration");
  let params: Record<string, string>;
  let usedFallback = false;
  if (city) {
    params = { q: city };
  } else {
    try {
      const location = await options.locate();
      params = { lat: String(location.latitude), lon: String(location.longitude) };
    } catch {
      options.signal.throwIfAborted();
      params = { q: "Montreal,CA" };
      usedFallback = true;
    }
  }
  options.signal.throwIfAborted();
  const { weather, lat, lon } = parseWeather(await request("weather", params, options));
  options.signal.throwIfAborted();
  // Forecast coordinates come from the resolved city, avoiding ambiguous name matches.
  try {
    const forecast = parseForecast(await request("forecast", { lat: String(lat), lon: String(lon) }, options));
    options.signal.throwIfAborted();
    return { weather, forecast, forecastError: null, usedFallback };
  } catch (error) {
    options.signal.throwIfAborted();
    return { weather, forecast: [], forecastError: errorCode(error), usedFallback };
  }
}
