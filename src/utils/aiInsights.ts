export interface Insight {
  icon: string;
  text: string;
}

export function generateInsights(
  temp: number,
  feelsLike: number,
  humidity: number,
  windSpeed: number,
  uvIndex: number,
  condition: string,
  lang: string,
  unit: string
): Insight[] {
  const insights: Insight[] = [];
  const isFr = lang === "fr";
  const u = unit === "C" ? "°C" : "°F";

  if (temp >= (unit === "C" ? 35 : 95)) {
    insights.push({
      icon: "↑°",
      text: isFr
        ? `Il fait ${temp}${u} — restez hydraté et évitez le soleil direct.`
        : `It's ${temp}${u} — stay hydrated and avoid direct sun exposure.`,
    });
  } else if (temp >= (unit === "C" ? 29 : 85)) {
    insights.push({
      icon: "↑°",
      text: isFr
        ? `Belle journée chaude à ${temp}${u} — portez des vêtements légers.`
        : `Warm day at ${temp}${u} — light clothing and stay hydrated.`,
    });
  } else if (temp <= (unit === "C" ? 0 : 32)) {
    insights.push({
      icon: "↓°",
      text: isFr
        ? `Températures glaciales à ${temp}${u} — couvrez-vous bien.`
        : `Freezing at ${temp}${u} — bundle up with layers and protect extremities.`,
    });
  } else if (temp <= (unit === "C" ? 10 : 50)) {
    insights.push({
      icon: "↓°",
      text: isFr
        ? `Il fait frais à ${temp}${u} — une veste est recommandée.`
        : `Cool at ${temp}${u} — a jacket is recommended today.`,
    });
  }

  const diff = Math.abs(temp - feelsLike);
  if (diff >= (unit === "C" ? 4 : 8)) {
    insights.push({
      icon: u,
      text: isFr
        ? `Ça ressemble à ${feelsLike}${u} — ${feelsLike < temp ? "le vent refroidit" : "l'humidité réchauffe"} l'air.`
        : `Feels like ${feelsLike}${u} — ${feelsLike < temp ? "wind chill making it colder" : "humidity making it feel warmer"} than it is.`,
    });
  }

  if (uvIndex >= 8) {
    insights.push({
      icon: "UV",
      text: isFr
        ? `Indice UV élevé à ${uvIndex} — appliquez SPF 50+ et portez des lunettes.`
        : `UV index is very high at ${uvIndex} — apply SPF 50+ and wear sunglasses.`,
    });
  } else if (uvIndex >= 5) {
    insights.push({
      icon: "SPF",
      text: isFr
        ? `Indice UV à ${uvIndex} — appliquez de la crème solaire avant de sortir.`
        : `UV index at ${uvIndex} — apply SPF 30+ if heading out for more than 20 minutes.`,
    });
  }

  if (humidity >= 80) {
    insights.push({
      icon: "H2O",
      text: isFr
        ? `Humidité élevée à ${humidity}% — ça semblera plus chaud. Privilégiez les tissus respirants.`
        : `High humidity at ${humidity}% — it'll feel warmer. Light breathable fabrics are your friend.`,
    });
  } else if (humidity <= 25) {
    insights.push({
      icon: "DRY",
      text: isFr
        ? `Air très sec à ${humidity}% d'humidité — hydratez-vous davantage.`
        : `Very dry air at ${humidity}% humidity — drink extra water and moisturize.`,
    });
  }

  if (windSpeed >= 25) {
    insights.push({
      icon: "mph",
      text: isFr
        ? `Vents forts à ${windSpeed} mph — évitez les parapluies, tenez vos affaires.`
        : `Strong winds at ${windSpeed} mph — skip the umbrella, hold onto loose items.`,
    });
  } else if (windSpeed >= 15) {
    insights.push({
      icon: "mph",
      text: isFr
        ? `Vent modéré à ${windSpeed} mph — il fera plus frais qu'il n'y paraît.`
        : `Moderate wind at ${windSpeed} mph — it'll feel cooler than the temperature suggests.`,
    });
  }

  const cond = condition.toLowerCase();
  if (cond.includes("rain") || cond.includes("drizzle")) {
    insights.push({
      icon: "☂",
      text: isFr
        ? "Pluie prévue — n'oubliez pas votre parapluie avant de partir."
        : "Rain expected today — don't leave home without an umbrella.",
    });
  } else if (cond.includes("snow")) {
    insights.push({
      icon: "❄",
      text: isFr
        ? "Neige prévue — prévoyez plus de temps pour vos déplacements."
        : "Snow expected — allow extra travel time and wear waterproof boots.",
    });
  } else if (cond.includes("thunderstorm")) {
    insights.push({
      icon: "⚡",
      text: isFr
        ? "Orages prévus — restez à l'intérieur si possible."
        : "Thunderstorms expected — stay indoors if possible and avoid open areas.",
    });
  } else if (cond.includes("clear") && temp > (unit === "C" ? 15 : 60)) {
    insights.push({
      icon: "UV",
      text: isFr
        ? "Ciel dégagé — parfait pour une sortie en plein air."
        : "Clear skies — perfect day for outdoor activities.",
    });
  } else if (cond.includes("cloud")) {
    insights.push({
      icon: "☁",
      text: isFr
        ? "Nuages épars — pas de pluie prévue, vous pouvez laisser le parapluie."
        : "Cloudy but no rain expected — you can leave the umbrella at home.",
    });
  }

  return insights.slice(0, 3);
}