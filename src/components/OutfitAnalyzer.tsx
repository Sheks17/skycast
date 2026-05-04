import { useState } from "react";
import { WeatherTheme } from "../utils/weatherThemes";
import { WeatherData } from "../hooks/useWeather";

interface Props {
  weather: WeatherData;
  theme: WeatherTheme;
  lang: string;
  unit: string;
}

function analyzeOutfit(temp: number, condition: string, lang: string, unit: string): string {
  const isFr = lang === "fr";
  const cond = condition.toLowerCase();

  // Convert to F for comparison if needed
  const tempF = unit === "C" ? (temp * 9 / 5) + 32 : temp;

  if (tempF >= 85) {
    return isFr
      ? "Il fait très chaud — portez des vêtements légers et respirants. Évitez les couches."
      : "It's very hot — wear light, breathable clothing. Skip the layers entirely.";
  }
  if (tempF >= 65 && tempF < 85) {
    if (cond.includes("rain")) {
      return isFr
        ? "Temps doux mais pluvieux — une veste imperméable légère est parfaite."
        : "Mild but rainy — a light waterproof jacket is perfect today.";
    }
    return isFr
      ? "Température agréable — un t-shirt avec une veste légère fera l'affaire."
      : "Nice temperature — a t-shirt with a light jacket is the perfect combo.";
  }
  if (tempF >= 45 && tempF < 65) {
    return isFr
      ? "Il fait frais — superposez les couches. Un pull et une veste sont recommandés."
      : "It's cool — layer up. A sweater and jacket combo is recommended.";
  }
  return isFr
    ? "Il fait froid — portez un manteau chaud, une écharpe et des gants."
    : "It's cold — wear a warm coat, scarf, and gloves before heading out.";
}

export default function OutfitAnalyzer({ weather, theme, lang, unit }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setAnalyzing(true);
      setResult(null);
      setTimeout(() => {
        setResult(analyzeOutfit(weather.temp, weather.condition, lang, unit));
        setAnalyzing(false);
      }, 1800);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      style={{ background: theme.card, border: `1px solid ${theme.border}` }}
      className="rounded-2xl p-5 backdrop-blur-sm mb-8"
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl"></span>
        <h2
          style={{ color: theme.text, fontFamily: "Syne, sans-serif" }}
          className="font-bold text-base"
        >
          {lang === "fr" ? "Analyseur de tenue" : "Outfit Analyzer"}
        </h2>
      </div>

      {!image ? (
        <label className="cursor-pointer block">
          <div
            style={{
              border: `2px dashed ${theme.border}`,
              color: theme.muted,
            }}
            className="rounded-xl p-8 text-center hover:opacity-80 transition-opacity"
          >
            <div className="text-4xl mb-2">📸</div>
            <p className="text-sm">
              {lang === "fr"
                ? "Téléchargez une photo de votre tenue"
                : "Upload a photo of your outfit"}
            </p>
            <p className="text-xs mt-1 opacity-60">
              {lang === "fr"
                ? "Recevez des conseils basés sur la météo"
                : "Get weather-based clothing advice"}
            </p>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="hidden"
          />
        </label>
      ) : (
        <div className="space-y-3">
          <img
            src={image}
            alt="Your outfit"
            className="w-full max-h-48 object-cover rounded-xl"
          />
          {analyzing && (
            <div
              style={{ color: theme.muted }}
              className="text-sm text-center animate-pulse py-2"
            >
              {lang === "fr" ? "Analyse en cours..." : "Analyzing your outfit..."}
            </div>
          )}
          {result && (
            <div
              style={{
                background: theme.pill,
                border: `1px solid ${theme.border}`,
                color: theme.text,
              }}
              className="rounded-xl p-4 text-sm leading-relaxed"
            >
               {result}
            </div>
          )}
          <button
            onClick={() => { setImage(null); setResult(null); }}
            style={{ color: theme.muted }}
            className="text-xs hover:opacity-80 transition-opacity"
          >
            {lang === "fr" ? "← Réessayer" : "← Try another"}
          </button>
        </div>
      )}
    </div>
  );
}