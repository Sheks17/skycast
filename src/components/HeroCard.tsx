import { MapPin } from "lucide-react";
import { WeatherData } from "../hooks/useWeather";
import { WeatherTheme } from "../utils/weatherThemes";

interface Props {
  weather: WeatherData;
  theme: WeatherTheme;
  lang: string;
  toDisplay: (f: number) => number;
  unitSymbol: string;
}

function getConditionIcon(condition: string): string {
  const c = condition.toLowerCase();
  if (c.includes("thunder")) return "⛈️";
  if (c.includes("rain") || c.includes("drizzle")) return "🌧️";
  if (c.includes("snow")) return "❄️";
  if (c.includes("mist") || c.includes("fog")) return "🌫️";
  if (c.includes("cloud")) return "⛅";
  if (c.includes("clear")) return "☀️";
  return "🌤️";
}

export default function HeroCard({ weather, theme, lang, toDisplay, unitSymbol }: Props) {
  const description = lang === "fr" ? weather.descriptionFr : weather.description;

  return (
    <div className="text-center py-8">
      <div className="flex items-center justify-center gap-2 mb-1">
        <MapPin size={16} strokeWidth={1.5} style={{ color: theme.muted }} />
        <h1
          style={{ color: theme.text, fontFamily: "Syne, sans-serif" }}
          className="text-2xl font-bold"
        >
          {weather.city}, {weather.country}
        </h1>
      </div>

      <p style={{ color: theme.muted }} className="text-sm mb-6 capitalize">
        {getConditionIcon(weather.condition)} {description}
      </p>

      <div
        style={{
          color: theme.text,
          fontFamily: "Syne, sans-serif",
          fontWeight: 100,
          fontSize: "clamp(80px, 18vw, 140px)",
          lineHeight: 1,
        }}
      >
        {toDisplay(weather.temp)}{unitSymbol}
      </div>

      <p style={{ color: theme.muted }} className="text-sm mt-3">
        {lang === "fr" ? "Ressenti" : "Feels like"} {toDisplay(weather.feelsLike)}{unitSymbol}
      </p>
    </div>
  );
}