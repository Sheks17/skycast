import { errorMessage } from "../utils/weather";
import type { ForecastDay, WeatherErrorCode } from "../utils/weather";
import type { WeatherTheme } from "../utils/weatherThemes";

interface Props {
  forecast: ForecastDay[];
  theme: WeatherTheme;
  lang: string;
  toDisplay: (f: number) => number;
  unitSymbol: string;
  error: WeatherErrorCode | null;
  onRetry: () => void;
}

export default function ForecastStrip({ forecast, theme, lang, toDisplay, unitSymbol, error, onRetry }: Props) {
  const fr = lang === "fr";
  return (
    <section className="mb-6" aria-labelledby="forecast-heading">
      <h2 id="forecast-heading" style={{ color: theme.text }} className="font-syne font-bold text-base mb-2">
        {fr ? "Prévisions sur 5 jours" : "5-day forecast"}
      </h2>
      {error ? (
        <div role="status" style={{ color: theme.text }} className="text-sm mb-4">
          <p>{fr ? "Prévisions indisponibles. " : "Forecast unavailable. "}{errorMessage(error, lang)}</p>
          <button onClick={onRetry} className="underline mt-2">{fr ? "Réessayer" : "Retry forecast"}</button>
        </div>
      ) : (
        <>
          <p style={{ color: theme.muted }} className="text-xs mb-3">
            {fr ? "Min/max des relevés prévus toutes les 3 heures, selon l’heure de la ville. Journées partielles possibles ; icône proche de midi." : "Highs/lows from available 3-hour forecasts in the city’s local time. Days may be partial; icons show conditions near noon."}
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2" tabIndex={0} aria-label={fr ? "Prévisions quotidiennes, défilement horizontal" : "Daily forecast, scroll horizontally"}>
            {forecast.map(day => {
              const date = new Date(`${day.date}T12:00:00Z`);
              const locale = fr ? "fr-FR" : "en-US";
              return (
                <div key={day.date} style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.text, minWidth: "82px" }} className="flex-shrink-0 rounded-2xl p-3 text-center backdrop-blur-sm">
                  <time dateTime={day.date} title={date.toLocaleDateString(locale, { timeZone: "UTC" })} style={{ color: theme.muted }} className="text-xs font-mono mb-1 block">
                    {date.toLocaleDateString(locale, { weekday: "short", timeZone: "UTC" })}
                    <span className="block text-[10px]">{date.toLocaleDateString(locale, { month: "numeric", day: "numeric", timeZone: "UTC" })}</span>
                  </time>
                  <p className="text-xl mb-1" aria-hidden="true">{day.icon}</p>
                  <p className="text-xs font-bold"><span className="sr-only">{fr ? "Maximum : " : "High: "}</span>{toDisplay(day.high)}{unitSymbol}</p>
                  <p style={{ color: theme.muted }} className="text-xs"><span className="sr-only">{fr ? "Minimum : " : "Low: "}</span>{toDisplay(day.low)}{unitSymbol}</p>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
