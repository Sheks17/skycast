import test from "node:test";
import assert from "node:assert/strict";
import { displayTemperature, errorMessage, isNightAt, parseForecast, parseWeather, WeatherError } from "../src/utils/weather.ts";
import { clothingAdvice, generateInsights } from "../src/utils/weatherInsights.ts";
import { loadWeather } from "../src/utils/weatherApi.ts";

const current = {
  name: "Montreal", coord: { lat: 45.5, lon: -73.6 },
  main: { temp: 50.9, feels_like: 42, humidity: 85 }, wind: { speed: 26.5 },
  sys: { country: "CA", sunrise: 1000, sunset: 2000 },
  weather: [{ main: "Rain", description: "light rain", icon: "10d" }],
};
const entry = (date: string, temp: number, main = "Clear") => ({
  dt: Date.parse(date) / 1000,
  main: { temp, temp_min: temp - 1, temp_max: temp + 1 },
  weather: [{ main, description: "clear sky", icon: "01d" }],
});
const forecast = { city: { timezone: -18000 }, list: [entry("2026-10-15T18:00:00Z", 60)] };
const locate = async () => ({ latitude: 45.5, longitude: -73.6 });
const options = () => ({ apiKey: "test-key", signal: new AbortController().signal, locate });
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status });

test("current weather preserves precision, translates descriptions, and leaves UV unavailable", () => {
  const { weather } = parseWeather(current);
  assert.equal(weather.temp, 50.9);
  assert.equal(weather.uvIndex, null);
  assert.equal(weather.descriptionFr, "pluie légère");
  assert.equal(displayTemperature(weather.temp, "C"), 11);
});

test("unknown descriptions have a French condition fallback", () => {
  const { weather } = parseWeather({ ...current, weather: [{ main: "Rain", description: "extreme rain", icon: "10d" }] });
  assert.equal(weather.descriptionFr, "pluie");
});

test("malformed current weather is rejected before rendering", () => {
  for (const data of [null, {}, { ...current, weather: [] }, { ...current, main: { ...current.main, temp: "50" } }]) {
    assert.throws(() => parseWeather(data), (error: unknown) => error instanceof WeatherError && error.code === "invalid-data");
  }
});

test("forecast aggregates all 3-hour temperatures and chooses the condition closest to city noon", () => {
  const days = parseForecast({ city: { timezone: 0 }, list: [
    entry("2026-10-15T18:00:00Z", 75, "Rain"),
    entry("2026-10-15T00:00:00Z", 39, "Clouds"),
    entry("2026-10-15T12:00:00Z", 61, "Clear"),
  ] });
  assert.deepEqual(days, [{ date: "2026-10-15", high: 75, low: 39, condition: "Clear", icon: "☀️" }]);
});

test("forecast groups by destination timezone across midnight, independent of viewer timezone", () => {
  const list = [entry("2026-10-15T00:00:00Z", 40), entry("2026-10-15T06:00:00Z", 60)];
  const west = parseForecast({ city: { timezone: -18000 }, list });
  assert.deepEqual(west.map(day => day.date), ["2026-10-14", "2026-10-15"]);
  const east = parseForecast({ city: { timezone: 19800 }, list });
  assert.deepEqual(east.map(day => [day.date, day.high, day.low]), [["2026-10-15", 60, 40]]);
});

test("forecast keeps partial days and limits results to five chronological dates", () => {
  const list = Array.from({ length: 6 }, (_, i) => entry(`2026-10-${15 + i}T21:00:00Z`, 40 + i));
  const days = parseForecast({ city: { timezone: 0 }, list: list.reverse() });
  assert.equal(days.length, 5);
  assert.equal(days[0].date, "2026-10-15");
  assert.equal(days[4].date, "2026-10-19");
});

test("missing and empty forecasts are rejected", () => {
  for (const data of [{}, { city: { timezone: 0 }, list: [] }, { ...forecast, city: {} }]) {
    assert.throws(() => parseForecast(data), WeatherError);
  }
});

test("temperature conversion rounds only at display time", () => {
  assert.equal(displayTemperature(32, "C"), 0);
  assert.equal(displayTemperature(-40, "C"), -40);
  assert.equal(displayTemperature(50.9, "F"), 51);
});

test("clothing advice uses canonical Fahrenheit and updates for language, rain, and wind", () => {
  assert.match(clothingAdvice(50, "Rain", 30, "en"), /sweater and jacket/);
  assert.match(clothingAdvice(50, "Rain", 30, "en"), /waterproof/);
  assert.match(clothingAdvice(50, "Rain", 30, "en"), /avoid umbrellas/);
  assert.match(clothingAdvice(50, "Rain", 30, "fr"), /pull et une veste/);
  assert.match(clothingAdvice(25, "Snow", 5, "en"), /warm coat/);
});

test("temperature advice thresholds do not change when units change", () => {
  for (const temp of [31.9, 32, 50, 50.1, 84.9, 85, 94.9, 95]) {
    const f = generateInsights(temp, temp, 50, 0, null, "Mist", "en", "F");
    const c = generateInsights(temp, temp, 50, 0, null, "Mist", "en", "C");
    assert.deepEqual(f.map(item => item.icon), c.map(item => item.icon));
  }
});

test("storm advice is prioritized and never lost behind other conditions", () => {
  const tips = generateInsights(100, 110, 90, 35, 9, "Thunderstorm", "en", "F");
  assert.equal(tips[0].icon, "⚡");
  assert.ok(tips.length > 3);
});

test("missing UV and night conditions do not produce fabricated sun advice", () => {
  const tips = generateInsights(70, 70, 50, 0, null, "Clear", "en", "F", true);
  assert.equal(tips.some(tip => tip.icon === "UV"), false);
  assert.match(tips[0].text, /tonight/);
});

test("clouds do not imply a dry forecast and rain advice does not conflict with strong wind", () => {
  const cloudy = generateInsights(70, 70, 50, 0, null, "Clouds", "en", "F");
  assert.doesNotMatch(cloudy.map(t => t.text).join(" "), /no rain|leave the umbrella/);
  const rainy = generateInsights(70, 70, 50, 30, null, "Rain", "en", "C");
  assert.match(rainy[0].text, /instead of an umbrella/);
  assert.ok(rainy.some(t => t.text.includes("48 km/h")));
});

test("night changes at sunrise/sunset with API-icon fallback for missing sun times", () => {
  const { weather } = parseWeather(current);
  assert.equal(isNightAt(weather, 999000), true);
  assert.equal(isNightAt(weather, 1000000), false);
  assert.equal(isNightAt(weather, 2000000), true);
  assert.equal(isNightAt({ ...weather, sunrise: null, sunset: null, night: true }, 1500000), true);
});

test("missing API key fails without requesting location or the network", async () => {
  await assert.rejects(loadWeather(null, { ...options(), apiKey: "", locate: async () => { assert.fail("should not locate"); } }),
    (error: unknown) => error instanceof WeatherError && error.code === "configuration");
});

test("geolocation denial uses Montreal and forecast uses resolved coordinates", async () => {
  const urls: URL[] = [];
  const fetcher: typeof fetch = async input => {
    urls.push(new URL(String(input)));
    return json(urls.length === 1 ? current : forecast);
  };
  const result = await loadWeather(null, { ...options(), locate: async () => { throw new Error("denied"); }, fetcher });
  assert.equal(result.usedFallback, true);
  assert.equal(urls[0].searchParams.get("q"), "Montreal,CA");
  assert.equal(urls[1].searchParams.get("lat"), "45.5");
  assert.equal(urls[1].searchParams.has("q"), false);
});

test("successful geolocation uses coordinates without a fallback", async () => {
  const urls: URL[] = [];
  const fetcher: typeof fetch = async input => {
    urls.push(new URL(String(input)));
    return json(urls.length === 1 ? current : forecast);
  };
  const result = await loadWeather(null, { ...options(), fetcher });
  assert.equal(result.usedFallback, false);
  assert.equal(urls[0].searchParams.get("lat"), "45.5");
});

test("HTTP failures have distinct codes and never trigger a Montreal fallback", async () => {
  for (const [status, code] of [[404, "not-found"], [401, "unauthorized"], [403, "unauthorized"], [429, "rate-limit"], [500, "service"]] as const) {
    let calls = 0;
    const fetcher: typeof fetch = async () => { calls++; return json({}, status); };
    await assert.rejects(loadWeather(null, { ...options(), fetcher }),
      (error: unknown) => error instanceof WeatherError && error.code === code);
    assert.equal(calls, 1);
    assert.ok(errorMessage(code, "fr").length > 0);
  }
});

test("forecast failure preserves valid current weather", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => ++calls === 1 ? json(current) : json({}, 429);
  const result = await loadWeather("Montreal", { ...options(), fetcher });
  assert.equal(result.weather.city, "Montreal");
  assert.deepEqual(result.forecast, []);
  assert.equal(result.forecastError, "rate-limit");
});

test("invalid JSON is surfaced as a data error", async () => {
  const fetcher: typeof fetch = async () => new Response("not JSON");
  await assert.rejects(loadWeather("Montreal", { ...options(), fetcher }),
    (error: unknown) => error instanceof WeatherError && error.code === "invalid-data");
});

test("aborted geolocation cannot start a stale request", async () => {
  const controller = new AbortController();
  const fetcher: typeof fetch = async () => { assert.fail("stale request started"); };
  const pending = loadWeather(null, { ...options(), signal: controller.signal, fetcher, locate: async () => {
    controller.abort();
    return { latitude: 1, longitude: 2 };
  } });
  await assert.rejects(pending, { name: "AbortError" });
});

test("a superseded request cannot return success even if the transport ignores abort", async () => {
  const controller = new AbortController();
  let calls = 0;
  const fetcher: typeof fetch = async () => {
    calls++;
    if (calls === 2) controller.abort();
    return json(calls === 1 ? current : forecast);
  };
  await assert.rejects(loadWeather("Montreal", { ...options(), signal: controller.signal, fetcher }), { name: "AbortError" });
});
