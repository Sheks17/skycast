import { useState } from "react";
import { WeatherTheme } from "../utils/weatherThemes";

interface Props {
  onSearch: (city: string) => void;
  lang: string;
  theme: WeatherTheme;
  onToggleLang: () => void;
}

export default function SearchBar({ onSearch, lang, theme, onToggleLang }: Props) {
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) onSearch(input.trim());
  };

  return (
    <div className="flex items-center gap-3 w-full max-w-xl mx-auto">
      <form onSubmit={handleSubmit} className="flex-1 relative">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={lang === "fr" ? "Rechercher une ville..." : "Search city..."}
          style={{
            background: theme.card,
            border: `1px solid ${theme.border}`,
            color: theme.text,
          }}
          className="w-full rounded-full px-5 py-2.5 text-sm outline-none backdrop-blur-sm placeholder-opacity-60 transition-all"
        />
        {input && (
          <button
            type="button"
            onClick={() => setInput("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
            style={{ color: theme.text }}
          >
            ✕
          </button>
        )}
      </form>

      <button
        onClick={onToggleLang}
        style={{
          background: theme.pill,
          border: `1px solid ${theme.border}`,
          color: theme.text,
        }}
        className="text-xs font-mono px-4 py-2.5 rounded-full whitespace-nowrap backdrop-blur-sm hover:opacity-80 transition-opacity"
      >
        {lang === "en" ? "EN / FR" : "FR / EN"}
      </button>
    </div>
  );
}