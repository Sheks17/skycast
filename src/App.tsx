import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useWeather } from "./hooks/useWeather";
import { getTheme } from "./utils/weatherThemes";
import { generateInsights } from "./utils/aiInsights";
import SearchBar from "./components/SearchBar";
import HeroCard from "./components/HeroCard";
import StatPills from "./components/StatPills";
import InsightCard from "./components/InsightCard";
import ForecastStrip from "./components/ForecastStrip";
import OutfitAnalyzer from "./components/OutfitAnalyzer";

export default function App() {
  const [city, setCity] = useState<string | null>(null);
  const [lang, setLang] = useState("en");
  const [unit, setUnit] = useState<"F" | "C">("F");

  const { weather, forecast, loading, error } = useWeather(city);

  const toDisplay = (f: number) =>
    unit === "C" ? Math.round((f - 32) * 5 / 9) : f;

  const unitSymbol = unit === "C" ? "°C" : "°F";

  const isNight = weather
    ? Date.now() / 1000 > weather.sunset || Date.now() / 1000 < weather.sunrise
    : false;

  const theme = weather
    ? getTheme(weather.condition, isNight)
    : getTheme("clouds", false);

  const insights = weather
    ? generateInsights(
        toDisplay(weather.temp),
        toDisplay(weather.feelsLike),
        weather.humidity,
        weather.windSpeed,
        weather.uvIndex,
        weather.condition,
        lang,
        unit
      )
    : [];

  useEffect(() => {
    document.body.style.background = theme.bg;
    document.body.style.transition = "background 2s ease";
  }, [theme.bg]);

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span
          style={{ color: theme.text, fontFamily: "Syne, sans-serif" }}
          className="text-xl font-bold"
        >
          SkyCast
        </span>
      </div>

      {/* Search + controls */}
      <div className="mb-8">
        <SearchBar
          onSearch={setCity}
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
            {unit === "F" ? "Switch to °C" : "Passer en °F"}
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="space-y-4 animate-pulse">
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
        <div className="text-center py-16">
          <p style={{ color: theme.text }} className="font-bold text-lg mb-2">
            {lang === "fr" ? "Ville introuvable" : "City not found"}
          </p>
          <p style={{ color: theme.muted }} className="text-sm">
            {lang === "fr"
              ? "Vérifiez l'orthographe et réessayez."
              : "Check the spelling and try again."}
          </p>
        </div>
      )}

      {/* Weather content */}
      {weather && !loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={city ?? "geo"}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <HeroCard
              weather={weather}
              theme={theme}
              lang={lang}
              toDisplay={toDisplay}
              unitSymbol={unitSymbol}
            />

            <StatPills
              humidity={weather.humidity}
              windSpeed={weather.windSpeed}
              uvIndex={weather.uvIndex}
              theme={theme}
              lang={lang}
            />

            <div className="mb-6">
              <h2
                style={{ color: theme.text, fontFamily: "Syne, sans-serif" }}
                className="font-bold text-base mb-3 flex items-center gap-2"
              >
                <Sparkles size={18} strokeWidth={1.5} style={{ color: theme.muted }} />
                {lang === "fr" ? "Conseils IA" : "AI Insights"}
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
            />

            <OutfitAnalyzer weather={weather} theme={theme} lang={lang} unit={unit} />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}