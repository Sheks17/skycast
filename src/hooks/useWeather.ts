import { useState, useEffect } from "react";

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
  sunrise: number;
  sunset: number;
  uvIndex: number;
}

export interface ForecastDay {
  date: string;
  day: string;
  high: number;
  low: number;
  condition: string;
  icon: string;
}

const API_KEY = import.meta.env.VITE_OPENWEATHER_KEY;

function getWeatherIcon(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("mist") || c.includes("fog") || c.includes("haze")) return "🌫️";
  if (c.includes("cloud")) return "⛅";
  if (c.includes("clear")) return "☀️";
  return "🌤️";
}

// Translate common OpenWeather descriptions to French
function translateDescription(description: string): string {
  const translations: Record<string, string> = {
    "clear sky": "ciel dégagé",
    "few clouds": "quelques nuages",
    "scattered clouds": "nuages épars",
    "broken clouds": "nuages fragmentés",
    "overcast clouds": "ciel couvert",
    "light rain": "pluie légère",
    "moderate rain": "pluie modérée",
    "heavy intensity rain": "pluie forte",
    "very heavy rain": "pluie très forte",
    "light snow": "neige légère",
    "moderate snow": "neige modérée",
    "heavy snow": "neige forte",
    "thunderstorm": "orage",
    "thunderstorm with light rain": "orage avec pluie légère",
    "thunderstorm with rain": "orage avec pluie",
    "drizzle": "bruine",
    "light intensity drizzle": "bruine légère",
    "mist": "brume",
    "fog": "brouillard",
    "haze": "brume sèche",
    "smoke": "fumée",
    "dust": "poussière",
    "partly cloudy": "partiellement nuageux",
  };
  return translations[description.toLowerCase()] || description;
}

async function fetchByCoords(lat: number, lon: number) {
  const [weatherRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=imperial`),
  ]);
  return { weatherRes, forecastRes };
}

async function fetchByCity(city: string) {
  const [weatherRes, forecastRes] = await Promise.all([
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=imperial`),
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=imperial`),
  ]);
  return { weatherRes, forecastRes };
}

export function useWeather(city: string | null) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        let weatherRes: Response;
        let forecastRes: Response;

        if (!city) {
          // Use geolocation
          const position = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 })
          );
          const { latitude, longitude } = position.coords;
          ({ weatherRes, forecastRes } = await fetchByCoords(latitude, longitude));
        } else {
          ({ weatherRes, forecastRes } = await fetchByCity(city));
        }

        if (!weatherRes.ok) throw new Error("City not found");

        const weatherData = await weatherRes.json();
        const forecastData = await forecastRes.json();

        const description = weatherData.weather[0].description;

        setWeather({
          city: weatherData.name,
          country: weatherData.sys.country,
          temp: Math.round(weatherData.main.temp),
          feelsLike: Math.round(weatherData.main.feels_like),
          humidity: weatherData.main.humidity,
          windSpeed: Math.round(weatherData.wind.speed),
          condition: weatherData.weather[0].main,
          description,
          descriptionFr: translateDescription(description),
          sunrise: weatherData.sys.sunrise,
          sunset: weatherData.sys.sunset,
          uvIndex: 5,
        });

        // Parse forecast — one entry per day around noon
        const days: ForecastDay[] = [];
        const seen = new Set<string>();

        forecastData.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000);
          const dayKey = date.toDateString();
          const hour = date.getHours();

          if (!seen.has(dayKey) && hour >= 11 && hour <= 14) {
            seen.add(dayKey);
            days.push({
              date: dayKey,
              day: date.toLocaleDateString("en-US", { weekday: "short" }),
              high: Math.round(item.main.temp_max),
              low: Math.round(item.main.temp_min),
              condition: item.weather[0].main,
              icon: getWeatherIcon(item.weather[0].main),
            });
          }
        });

        setForecast(days.slice(0, 5));
      } catch (err: any) {
        // Geolocation failed — fall back to Montreal
        if (!city) {
          try {
            const { weatherRes, forecastRes } = await fetchByCity("Montreal");
            const weatherData = await weatherRes.json();
            const forecastData = await forecastRes.json();
            const description = weatherData.weather[0].description;

            setWeather({
              city: weatherData.name,
              country: weatherData.sys.country,
              temp: Math.round(weatherData.main.temp),
              feelsLike: Math.round(weatherData.main.feels_like),
              humidity: weatherData.main.humidity,
              windSpeed: Math.round(weatherData.wind.speed),
              condition: weatherData.weather[0].main,
              description,
              descriptionFr: translateDescription(description),
              sunrise: weatherData.sys.sunrise,
              sunset: weatherData.sys.sunset,
              uvIndex: 5,
            });

            const days: ForecastDay[] = [];
            const seen = new Set<string>();
            forecastData.list.forEach((item: any) => {
              const date = new Date(item.dt * 1000);
              const dayKey = date.toDateString();
              const hour = date.getHours();
              if (!seen.has(dayKey) && hour >= 11 && hour <= 14) {
                seen.add(dayKey);
                days.push({
                  date: dayKey,
                  day: date.toLocaleDateString("en-US", { weekday: "short" }),
                  high: Math.round(item.main.temp_max),
                  low: Math.round(item.main.temp_min),
                  condition: item.weather[0].main,
                  icon: getWeatherIcon(item.weather[0].main),
                });
              }
            });
            setForecast(days.slice(0, 5));
          } catch {
            setError("Unable to load weather");
          }
        } else {
          setError(err.message || "Something went wrong");
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [city]);

  return { weather, forecast, loading, error };
}