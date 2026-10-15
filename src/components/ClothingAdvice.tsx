import { useEffect, useState } from "react";
import type { WeatherTheme } from "../utils/weatherThemes";
import type { WeatherData } from "../utils/weather";
import { clothingAdvice } from "../utils/weatherInsights";

interface Props {
  weather: WeatherData;
  theme: WeatherTheme;
  lang: string;
}

export default function ClothingAdvice({ weather, theme, lang }: Props) {
  const [image, setImage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState(false);
  const fr = lang === "fr";
  const advice = clothingAdvice(weather.feelsLike, weather.condition, weather.windSpeed, lang);

  useEffect(() => () => { if (image) URL.revokeObjectURL(image); }, [image]);

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    if (!["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setUploadError(true);
      return;
    }
    setUploadError(false);
    setImage(URL.createObjectURL(file));
  };

  return (
    <section style={{ background: theme.card, border: `1px solid ${theme.border}`, color: theme.text }} className="rounded-2xl p-5 backdrop-blur-sm mb-8" aria-labelledby="clothing-heading">
      <h2 id="clothing-heading" className="font-syne font-bold text-base mb-3">{fr ? "Conseils vestimentaires" : "Clothing advice"}</h2>
      <p className="text-sm leading-relaxed mb-3">{advice}</p>
      <p style={{ color: theme.muted }} className="text-xs mb-4">
        {fr ? "Conseils selon la météo et la température ressentie. Ajoutez une photo pour comparer vous-même votre tenue ; elle reste sur votre appareil et n’est pas analysée." : "Advice based on the weather and feels-like temperature. Add a photo to compare your outfit yourself; it stays on your device and isn't analyzed."}
      </p>
      {image && (
        <div className="space-y-2 mb-3">
          <img src={image} alt={fr ? "Aperçu de votre tenue" : "Your outfit preview"} className="w-full max-h-64 object-contain rounded-xl" onError={() => { setImage(null); setUploadError(true); }} />
          <button onClick={() => setImage(null)} className="text-sm underline">{fr ? "Supprimer la photo" : "Remove photo"}</button>
        </div>
      )}
      <label style={{ borderColor: theme.border }} className="block text-sm cursor-pointer rounded-xl border border-dashed p-4 focus-within:outline focus-within:outline-2 focus-within:outline-offset-4">
        <span>{fr ? "Ajouter une photo facultative (10 Mo maximum)" : "Add an optional photo (up to 10 MB)"}</span>
        <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={handleUpload} className="sr-only" />
      </label>
      {uploadError && <p role="alert" className="text-sm mt-3">{fr ? "Choisissez une image JPEG, PNG, WebP, GIF ou AVIF valide de 10 Mo maximum." : "Choose a valid JPEG, PNG, WebP, GIF, or AVIF image up to 10 MB."}</p>}
    </section>
  );
}
