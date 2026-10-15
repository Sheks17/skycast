import { Droplets, Wind, Sun } from "lucide-react";
import type { WeatherTheme } from "../utils/weatherThemes";

interface Props {
  humidity: number;
  windSpeed: number;
  uvIndex: number | null;
  theme: WeatherTheme;
  lang: string;
  unit: string;
}

export default function StatPills({ humidity, windSpeed, uvIndex, theme, lang, unit }: Props) {
  const stats = [
    {
      icon: <Droplets size={22} strokeWidth={1.5} />,
      value: `${humidity}%`,
      label: lang === "fr" ? "Humidité" : "Humidity",
    },
    {
      icon: <Wind size={22} strokeWidth={1.5} />,
      value: `${Math.round(unit === "C" ? windSpeed * 1.609344 : windSpeed)} ${unit === "C" ? "km/h" : "mph"}`,
      label: lang === "fr" ? "Vent" : "Wind",
    },
    {
      icon: <Sun size={22} strokeWidth={1.5} />,
      value: uvIndex === null ? (lang === "fr" ? "Indisponible" : "Unavailable") : `${uvIndex}`,
      label: lang === "fr" ? "Indice UV" : "UV Index",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-3 mb-6">
      {stats.map((s) => (
        <div
          key={s.label}
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
          className="rounded-2xl px-2 py-4 text-center backdrop-blur-sm min-w-0"
        >
          <div className="flex justify-center mb-2" style={{ color: theme.muted }}>
            {s.icon}
          </div>
          <div className="font-bold text-xs sm:text-sm font-mono break-words">{s.value}</div>
          <div style={{ color: theme.muted }} className="text-xs mt-0.5">
            {s.label}
          </div>
        </div>
      ))}
    </div>
  );
}
