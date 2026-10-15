import { displayTemperature } from "./weather.ts";

export interface Insight {
  icon: string;
  text: string;
}

// Temperatures are always Fahrenheit internally; units only affect display.
export function generateInsights(
  temp: number, feelsLike: number, humidity: number, windSpeed: number,
  uvIndex: number | null, condition: string, lang: string, unit: string, night = false,
): Insight[] {
  const insights: Insight[] = [];
  const fr = lang === "fr";
  const cond = condition.toLowerCase();
  const u = unit === "C" ? "°C" : "°F";
  const shown = displayTemperature(temp, unit);
  const feels = displayTemperature(feelsLike, unit);
  const wind = Math.round(unit === "C" ? windSpeed * 1.609344 : windSpeed);
  const windUnit = unit === "C" ? "km/h" : "mph";
  const add = (icon: string, en: string, french: string) => insights.push({ icon, text: fr ? french : en });

  // Hazard-related conditions appear first and are never truncated.
  if (cond.includes("thunder")) {
    add("⚡", "Thunderstorms reported — stay indoors and avoid open areas.", "Orages signalés — restez à l’intérieur et évitez les espaces dégagés.");
  } else if (cond.includes("tornado")) {
    add("!", "Tornado conditions reported — seek shelter and check official local alerts.", "Tornade signalée — mettez-vous à l’abri et consultez les alertes locales officielles.");
  } else if (cond.includes("snow")) {
    add("❄", "Snow reported — allow extra travel time and wear waterproof boots.", "Neige signalée — prévoyez plus de temps pour vos déplacements et portez des bottes imperméables.");
  } else if (cond.includes("rain") || cond.includes("drizzle")) {
    add("☂", windSpeed >= 25 ? "Rain and strong wind — choose a waterproof jacket instead of an umbrella." : "Rain reported — bring a waterproof layer or umbrella.",
      windSpeed >= 25 ? "Pluie et vent fort — privilégiez une veste imperméable plutôt qu’un parapluie." : "Pluie signalée — prenez un vêtement imperméable ou un parapluie.");
  }

  if (temp >= 95) add("↑°", `Hot at ${shown}${u} — plan breaks from the heat.`, `Il fait chaud à ${shown}${u} — prévoyez des pauses au frais.`);
  else if (temp <= 32) add("↓°", `Freezing at ${shown}${u} — wear warm layers.`, `Températures glaciales à ${shown}${u} — portez plusieurs couches chaudes.`);
  else if (temp >= 85) add("↑°", `Warm at ${shown}${u} — choose light clothing.`, `Il fait chaud à ${shown}${u} — choisissez des vêtements légers.`);
  else if (temp <= 50) add("↓°", `Cool at ${shown}${u} — bring a jacket.`, `Il fait frais à ${shown}${u} — prenez une veste.`);

  if (windSpeed >= 25) add(windUnit, `Strong winds at ${wind} ${windUnit} — secure loose items and avoid umbrellas.`, `Vents forts à ${wind} ${windUnit} — attachez les objets mobiles et évitez les parapluies.`);
  else if (windSpeed >= 15) add(windUnit, `Wind at ${wind} ${windUnit} — consider a wind-resistant layer.`, `Vent à ${wind} ${windUnit} — pensez à un coupe-vent.`);

  if (Math.abs(temp - feelsLike) >= 8) add(u, `Feels like ${feels}${u} — dress for how it feels outside.`, `Ressenti de ${feels}${u} — adaptez votre tenue à la température ressentie.`);
  if (uvIndex !== null && !night && uvIndex >= 5) add("UV", `UV index ${uvIndex} — consider sun protection when outdoors.`, `Indice UV de ${uvIndex} — pensez à vous protéger du soleil à l’extérieur.`);
  if (humidity >= 80) add("H₂O", `High humidity at ${humidity}% — choose breathable fabrics.`, `Humidité élevée à ${humidity}% — choisissez des tissus respirants.`);
  else if (humidity <= 25) add("DRY", `Low humidity at ${humidity}% — the air is dry.`, `Faible humidité à ${humidity}% — l’air est sec.`);

  if (cond.includes("cloud")) add("☁", "Cloudy now — check the forecast before heading out.", "Ciel nuageux actuellement — consultez les prévisions avant de sortir.");
  else if (cond.includes("clear")) add(night ? "☾" : "☀", night ? "Clear skies tonight — check the temperature before heading out." : "Clear skies now — conditions can change later.", night ? "Ciel dégagé ce soir — vérifiez la température avant de sortir." : "Ciel dégagé actuellement — les conditions peuvent évoluer.");
  if (!insights.length) add("°", `Currently ${shown}${u} — check the forecast when planning your day.`, `Il fait actuellement ${shown}${u} — consultez les prévisions pour organiser votre journée.`);
  return insights;
}

export function clothingAdvice(feelsLikeF: number, condition: string, windSpeed: number, lang: string): string {
  const fr = lang === "fr";
  const cond = condition.toLowerCase();
  const advice = [feelsLikeF >= 85
    ? (fr ? "Portez des vêtements légers et respirants." : "Wear light, breathable clothing.")
    : feelsLikeF >= 65
      ? (fr ? "Un t-shirt et une veste légère conviennent à cette température." : "A t-shirt and light jacket suit this temperature.")
      : feelsLikeF >= 45
        ? (fr ? "Superposez les couches avec un pull et une veste." : "Layer up with a sweater and jacket.")
        : (fr ? "Portez un manteau chaud, une écharpe et des gants." : "Wear a warm coat, scarf, and gloves.")];
  if (cond.includes("thunder") || cond.includes("tornado")) advice.push(fr ? "Mettez-vous à l’abri et consultez les alertes locales officielles." : "Seek shelter and check official local alerts.");
  if (cond.includes("rain") || cond.includes("drizzle")) advice.push(fr ? "Ajoutez une couche imperméable." : "Add a waterproof outer layer.");
  if (cond.includes("snow")) advice.push(fr ? "Choisissez des bottes imperméables." : "Choose waterproof boots.");
  if (windSpeed >= 25) advice.push(fr ? "Prévoyez un coupe-vent et évitez les parapluies." : "Choose a wind-resistant layer and avoid umbrellas.");
  return advice.join(" ");
}
