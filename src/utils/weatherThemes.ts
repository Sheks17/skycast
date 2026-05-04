export interface WeatherTheme {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  pill: string;
}

export function getTheme(condition: string, isNight: boolean): WeatherTheme {
  if (isNight) {
    return {
      bg: "linear-gradient(160deg, #0d1b2a 0%, #1a1d35 100%)",
      card: "rgba(255,255,255,0.06)",
      text: "#e8e8e8",
      muted: "rgba(255,255,255,0.5)",
      border: "rgba(255,255,255,0.1)",
      pill: "rgba(255,255,255,0.08)",
    };
  }

  switch (condition.toLowerCase()) {
    case "clear":
      return {
        bg: "linear-gradient(160deg, #f7941d 0%, #ffd200 100%)",
        card: "rgba(255,255,255,0.18)",
        text: "#1a1a1a",
        muted: "rgba(0,0,0,0.5)",
        border: "rgba(255,255,255,0.3)",
        pill: "rgba(255,255,255,0.2)",
      };
    case "rain":
    case "drizzle":
      return {
        bg: "linear-gradient(160deg, #1a2a4a 0%, #2d4a7a 100%)",
        card: "rgba(255,255,255,0.08)",
        text: "#e8f0ff",
        muted: "rgba(255,255,255,0.5)",
        border: "rgba(255,255,255,0.12)",
        pill: "rgba(255,255,255,0.1)",
      };
    case "snow":
      return {
        bg: "linear-gradient(160deg, #c9d6e3 0%, #e8f0f7 100%)",
        card: "rgba(255,255,255,0.3)",
        text: "#1a2a3a",
        muted: "rgba(0,0,0,0.4)",
        border: "rgba(255,255,255,0.5)",
        pill: "rgba(255,255,255,0.25)",
      };
    case "thunderstorm":
      return {
        bg: "linear-gradient(160deg, #0a0a0f 0%, #1a0a2e 100%)",
        card: "rgba(255,255,255,0.06)",
        text: "#e8e8ff",
        muted: "rgba(255,255,255,0.4)",
        border: "rgba(255,255,255,0.08)",
        pill: "rgba(255,255,255,0.06)",
      };
    default: // clouds, mist, haze
      return {
        bg: "linear-gradient(160deg, #4a5568 0%, #718096 100%)",
        card: "rgba(255,255,255,0.1)",
        text: "#f0f0f0",
        muted: "rgba(255,255,255,0.55)",
        border: "rgba(255,255,255,0.15)",
        pill: "rgba(255,255,255,0.1)",
      };
  }
}