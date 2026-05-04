import { ForecastDay } from "../hooks/useWeather";
import { WeatherTheme } from "../utils/weatherThemes";

interface Props {
  forecast: ForecastDay[];
  theme: WeatherTheme;
  lang: string;
  toDisplay: (f: number) => number;
  unitSymbol: string;
}

const FR_DAYS: Record<string, string> = {
  Mon: "Lun", Tue: "Mar", Wed: "Mer",
  Thu: "Jeu", Fri: "Ven", Sat: "Sam", Sun: "Dim",
};

export default function ForecastStrip({ forecast, theme, lang, toDisplay, unitSymbol }: Props) {
  return (
    <div className="mb-6">
      <h2
        style={{ color: theme.text, fontFamily: "Syne, sans-serif" }}
        className="font-bold text-base mb-3"
      >
        {lang === "fr" ? "Prévisions 5 jours" : "5-Day Forecast"}
      </h2>
      <div
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: "none" }}
      >
        {forecast.map((day) => (
          <div
            key={day.date}
            style={{
              background: theme.card,
              border: `1px solid ${theme.border}`,
              color: theme.text,
              minWidth: "72px",
            }}
            className="flex-shrink-0 rounded-2xl p-3 text-center backdrop-blur-sm"
          >
            <p style={{ color: theme.muted }} className="text-xs font-mono mb-1">
              {lang === "fr" ? FR_DAYS[day.day] || day.day : day.day}
            </p>
            <p className="text-xl mb-1">{day.icon}</p>
            <p className="text-xs font-bold">{toDisplay(day.high)}{unitSymbol}</p>
            <p style={{ color: theme.muted }} className="text-xs">
              {toDisplay(day.low)}{unitSymbol}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}