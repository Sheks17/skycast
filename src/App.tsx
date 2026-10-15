import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useWeather } from "./hooks/useWeather";
import { getTheme } from "./utils/weatherThemes";
import { generateInsights } from "./utils/weatherInsights";
import { displayTemperature, errorMessage, isNightAt } from "./utils/weather";
import SearchBar from "./components/SearchBar";
import HeroCard from "./components/HeroCard";
import StatPills from "./components/StatPills";
import InsightCard from "./components/InsightCard";
import ForecastStrip from "./components/ForecastStrip";
import ClothingAdvice from "./components/ClothingAdvice";

export default function App() {
  const [city, setCity] = useState<string | null>(null);
  const [lang, setLang] = useState("en");
  const [unit, setUnit] = useState<"F" | "C">("F");

  const { weather, forecast, loading, refreshing, error, forecastError, usedFallback, retry } = useWeather(city);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => { document.documentElement.lang = lang; }, [lang]);

  const toDisplay = (f: number) =>
    displayTemperature(f, unit);

  const unitSymbol = unit === "C" ? "°C" : "°F";

  const isNight = weather ? isNightAt(weather, now) : false;

  const theme = weather
    ? getTheme(weather.condition, isNight)
    : getTheme("clouds", false);

  const insights = weather
    ? generateInsights(
        weather.temp,
        weather.feelsLike,
        weather.humidity,
        weather.windSpeed,
        weather.uvIndex,
        weather.condition,
        lang,
        unit,
        isNight
      )
    : [];

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.transition = "background 2s ease";
  }, [theme.bg]);

  return (
    <main className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span
          style={{ color: theme.text, fontFamily: "Syne, sans-serif" }}
          className="text-xl font-bold"
        >
          SkyCast
        </span>
        {refreshing && <span role="status" className="text-xs" style={{ color: theme.muted }}>{lang === "fr" ? "Actualisation…" : "Refreshing…"}</span>}
      </div>

      {/* Search + controls */}
      <div className="mb-8">
        <SearchBar
          onSearch={(nextCity) => { if (nextCity === city) retry(); else setCity(nextCity); }}
          lang={lang}
          theme={theme}
          onToggleLang={() => setLang((l) => (l === "en" ? "fr" : "en"))}
        />
        <div className="flex justify-center mt-3">
          <button
            onClick={() => setUnit((u) => (u === "F" ? "C" : "F"))}
            style={{
              background: theme.pill,
              border: `1px solid ${theme.border}`,
              color: theme.text,
            }}
            className="text-xs font-mono px-4 py-1.5 rounded-full backdrop-blur-sm hover:opacity-80 transition-opacity"
          >
            {lang === "fr" ? `Passer en °${unit === "F" ? "C" : "F"}` : `Switch to °${unit === "F" ? "C" : "F"}`}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 animate-pulse" role="status">
          <span className="sr-only">{lang === "fr" ? "Chargement de la météo…" : "Loading weather…"}</span>
          <div className="h-40 rounded-2xl" style={{ background: theme.card }} />
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl" style={{ background: theme.card }} />
            ))}
          </div>
          <div className="h-32 rounded-2xl" style={{ background: theme.card }} />
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="text-center py-16" role="alert">
          <p style={{ color: theme.text }} className="font-bold text-lg mb-2">
            {lang === "fr" ? "Météo indisponible" : "Weather unavailable"}
          </p>
          <p style={{ color: theme.muted }} className="text-sm">
            {errorMessage(error, lang)}
          </p>
          <button onClick={retry} style={{ color: theme.text }} className="mt-4 text-sm underline">{lang === "fr" ? "Réessayer" : "Retry"}</button>
        </div>
      )}

      {/* Weather content */}
      {weather && !loading && !error && (
        <AnimatePresence mode="wait">
          <motion.div
            key={city ?? "geo"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            {usedFallback && <p role="status" style={{ color: theme.muted }} className="text-xs text-center">{lang === "fr" ? "Position indisponible : météo de Montréal. Recherchez votre ville ci-dessus." : "Location unavailable: showing Montreal. Search for your city above."}</p>}
            <HeroCard
              weather={weather}
              theme={theme}
              lang={lang}
              toDisplay={toDisplay}
              unitSymbol={unitSymbol}
              isNight={isNight}
            />

            <StatPills
              humidity={weather.humidity}
              windSpeed={weather.windSpeed}
              uvIndex={weather.uvIndex}
              theme={theme}
              lang={lang}
              unit={unit}
            />

            <div className="mb-6">
              <h2
                style={{ color: theme.text, fontFamily: "Syne, sans-serif" }}
                className="font-bold text-base mb-3 flex items-center gap-2"
              >
                <Sparkles size={18} strokeWidth={1.5} style={{ color: theme.muted }} />
                {lang === "fr" ? "Conseils météo" : "Weather tips"}
              </h2>
              <div className="space-y-2">
                {insights.map((insight, i) => (
                  <InsightCard key={i} insight={insight} index={i} theme={theme} />
                ))}
              </div>
            </div>

            <ForecastStrip
              forecast={forecast}
              theme={theme}
              lang={lang}
              toDisplay={toDisplay}
              unitSymbol={unitSymbol}
              error={forecastError}
              onRetry={retry}
            />

            <ClothingAdvice weather={weather} theme={theme} lang={lang} />
          </motion.div>
        </AnimatePresence>
      )}
      <footer className="text-center text-xs pb-4" style={{ color: theme.muted }}>
        {lang === "fr" ? "Données météo : " : "Weather data: "}<a href="https://openweathermap.org/" className="underline">OpenWeather</a>
      </footer>
    </main>
  );
}
