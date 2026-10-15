export interface WeatherData {
  city: string;
  country: string;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  descriptionFr: string;
  sunrise: number | null;
  sunset: number | null;
  night: boolean;
  uvIndex: number | null;
}

export interface ForecastDay {
  date: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

export type WeatherErrorCode = "configuration" | "not-found" | "unauthorized" | "rate-limit" | "network" | "service" | "invalid-data";

export class WeatherError extends Error {
  code: WeatherErrorCode;
  constructor(code: WeatherErrorCode) {
    super(code);
    this.code = code;
  }
}

export function errorCode(error: unknown): WeatherErrorCode {
  return error instanceof WeatherError ? error.code : "network";
}

export function errorMessage(code: WeatherErrorCode, lang: string): string {
  const messages: Record<WeatherErrorCode, [string, string]> = {
    configuration: ["Weather isn't configured yet. Please contact the site owner.", "La météo n’est pas encore configurée. Contactez le propriétaire du site."],
    "not-found": ["City not found. Check the spelling or add a country code.", "Ville introuvable. Vérifiez l’orthographe ou ajoutez un code de pays."],
    unauthorized: ["The weather service couldn't authenticate. Please contact the site owner.", "Le service météo n’a pas pu s’authentifier. Contactez le propriétaire du site."],
    "rate-limit": ["The weather service is busy. Please try again later.", "Le service météo est occupé. Réessayez plus tard."],
    network: ["Couldn't connect to the weather service. Check your connection and retry.", "Connexion au service météo impossible. Vérifiez votre connexion et réessayez."],
    service: ["The weather service is temporarily unavailable. Please retry.", "Le service météo est temporairement indisponible. Réessayez."],
    "invalid-data": ["The weather service returned incomplete data. Please retry.", "Le service météo a renvoyé des données incomplètes. Réessayez."],
  };
  return messages[code][lang === "fr" ? 1 : 0];
}

export function getWeatherIcon(condition: string, night = false): string {
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (["mist", "fog", "haze", "smoke", "dust", "sand", "ash"].some(value => c.includes(value))) return "🌫️";
  if (c.includes("cloud")) return night ? "☁️" : "⛅";
  if (c.includes("clear")) return night ? "🌙" : "☀️";
  return "🌤️";
}

const frenchConditions: Record<string, string> = {
  Clear: "ciel dégagé", Clouds: "nuageux", Rain: "pluie", Drizzle: "bruine",
  Snow: "neige", Thunderstorm: "orage", Mist: "brume", Fog: "brouillard",
  Haze: "brume sèche", Smoke: "fumée", Dust: "poussière", Sand: "sable",
  Ash: "cendres volcaniques", Squall: "rafales", Tornado: "tornade",
};

const frenchDescriptions: Record<string, string> = {
  "clear sky": "ciel dégagé", "few clouds": "quelques nuages",
  "scattered clouds": "nuages épars", "broken clouds": "nuages fragmentés",
  "overcast clouds": "ciel couvert", "light rain": "pluie légère",
  "moderate rain": "pluie modérée", "heavy intensity rain": "pluie forte",
  "very heavy rain": "pluie très forte", "light snow": "neige légère",
  "heavy snow": "neige forte", "thunderstorm with rain": "orage avec pluie",
  "thunderstorm with light rain": "orage avec pluie légère",
  "light intensity drizzle": "bruine légère",
};

// API data enters as unknown so malformed responses cannot silently become UI values.
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new WeatherError("invalid-data");
  return value as Record<string, unknown>;
}
function number(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new WeatherError("invalid-data");
  return value;
}
function string(value: unknown): string {
  if (typeof value !== "string" || !value) throw new WeatherError("invalid-data");
  return value;
}
function condition(value: unknown) {
  if (!Array.isArray(value) || !value.length) throw new WeatherError("invalid-data");
  const item = record(value[0]);
  return { main: string(item.main), description: string(item.description), icon: string(item.icon) };
}

export function parseWeather(value: unknown) {
  const data = record(value);
  const main = record(data.main);
  const sys = record(data.sys);
  const wind = record(data.wind);
  const coords = record(data.coord);
  const current = condition(data.weather);
  const weather: WeatherData = {
    city: string(data.name), country: typeof sys.country === "string" ? sys.country : "",
    temp: number(main.temp), feelsLike: number(main.feels_like),
    humidity: number(main.humidity), windSpeed: number(wind.speed),
    condition: current.main, description: current.description,
    descriptionFr: frenchDescriptions[current.description.toLowerCase()] ?? frenchConditions[current.main] ?? "conditions variables",
    sunrise: sys.sunrise == null ? null : number(sys.sunrise),
    sunset: sys.sunset == null ? null : number(sys.sunset),
    night: current.icon.endsWith("n"),
    // These OpenWeather endpoints do not include UV measurements.
    uvIndex: null,
  };
  return { weather, lat: number(coords.lat), lon: number(coords.lon) };
}

export function parseForecast(value: unknown): ForecastDay[] {
  const data = record(value);
  const offset = number(record(data.city).timezone);
  if (!Array.isArray(data.list) || !data.list.length) throw new WeatherError("invalid-data");
  const days = new Map<string, ForecastDay & { noonDistance: number }>();
  const entries = data.list.map(value => {
    const item = record(value);
    const main = record(item.main);
    return { dt: number(item.dt), temp: number(main.temp), condition: condition(item.weather).main };
  }).sort((a, b) => a.dt - b.dt);
  for (const item of entries) {
    // UTC getters on the offset date avoid using the viewer's timezone.
    const local = new Date((item.dt + offset) * 1000);
    const date = local.toISOString().slice(0, 10);
    const noonDistance = Math.abs(local.getUTCHours() + local.getUTCMinutes() / 60 - 12);
    const day = days.get(date);
    if (!day) {
      days.set(date, { date, high: item.temp, low: item.temp, condition: item.condition, icon: getWeatherIcon(item.condition), noonDistance });
    } else {
      day.high = Math.max(day.high, item.temp);
      day.low = Math.min(day.low, item.temp);
      if (noonDistance < day.noonDistance) {
        day.condition = item.condition;
        day.icon = getWeatherIcon(item.condition);
        day.noonDistance = noonDistance;
      }
    }
  }
  return Array.from(days.values()).slice(0, 5).map(day => ({
    date: day.date, high: day.high, low: day.low, condition: day.condition, icon: day.icon,
  }));
}

export function displayTemperature(fahrenheit: number, unit: string): number {
  return Math.round(unit === "C" ? (fahrenheit - 32) * 5 / 9 : fahrenheit);
}

export function isNightAt(weather: WeatherData, now: number): boolean {
  if (weather.sunrise === null || weather.sunset === null) return weather.night;
  return now / 1000 < weather.sunrise || now / 1000 >= weather.sunset;
}
