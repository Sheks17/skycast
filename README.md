# SkyCast — Weather & Clothing Advice

SkyCast is a responsive weather app with English/French controls, weather-based themes, daily forecast summaries, and practical clothing advice.

[Deployment URL](https://skycast-jade.vercel.app/) · [Repository](https://github.com/Sheks17/skycast)

## Features

- Current weather, feels-like temperature, humidity, and wind from OpenWeather.
- City search (add a country code for ambiguous names, e.g. `Paris,FR`).
- Browser geolocation, with an explicit Montreal fallback when location is unavailable.
- Fahrenheit/mph and Celsius/km/h display modes; calculations retain the original precision.
- English/French labels, advice, errors, and weather descriptions.
- Five daily forecast summaries, grouped using the destination city's UTC offset.
- Clear, cloudy, rainy, snowy, stormy, and night themes with reduced-motion support.
- Rule-based weather tips and clothing advice based on feels-like temperature.
- Optional local outfit photo preview. Photos are not analyzed or uploaded.
- Distinct error messages, retry controls, request cancellation, and refresh every ten minutes.

## Data boundaries

There is no generative AI or image-recognition service. Weather tips use explicit rules; clothing advice depends on weather, not photo contents. The advice updates when the weather or language changes.

The selected OpenWeather endpoints do not provide UV readings. The UI displays **Unavailable**, and no UV advice is generated without a measurement.

Forecast highs/lows are the maximum/minimum temperatures among the available three-hour samples for each city-local calendar day. These are not official daily extremes, and the first/last day may be partial. Icons represent the sample closest to city-local noon. The API provides a fixed UTC offset, so a future daylight-saving transition within the forecast window is not modeled.

French descriptions use a local dictionary with translated condition-category fallbacks. Weather tips describe current conditions; they do not claim to be official severe-weather alerts or infer that cloudy skies guarantee no rain.

## Stack

React 19 · TypeScript 6 · Vite 8 · Tailwind CSS 3 · Framer Motion · Lucide React

This is a client-side app with no backend, account system, or database. Language and unit settings are held in memory. Typography uses Syne, DM Sans, and DM Mono from Google Fonts.

## Local development

Use **Node.js 24** (recommended) or **Node.js 22.13+** and npm.

```sh
npm ci
```

Copy `.env.example` to `.env`, then replace the placeholder with your OpenWeather API key:

```dotenv
VITE_OPENWEATHER_KEY=your_openweather_api_key
```

```sh
npm run dev
```

Vite normally serves the app at `http://localhost:5173`. Restart the development server after changing environment variables.

The API key is a Vite client environment variable and is visible in the browser bundle and weather requests. `.env` files are ignored by Git. To keep a provider credential private, a server-side proxy would be needed.

## Validation

```sh
npm run lint
npm test
npm run build
npm run preview
```

Tests use Node's built-in test runner and deterministic API fixtures; they do not need an API key. They cover forecast aggregation and timezone boundaries, temperature conversion, advice behavior, response validation, errors, fallback location, partial failures, and cancellation. The production build type-checks application code, Vite configuration, and tests with strict checks.

GitHub Actions runs lint, tests, and the production build on pushes and pull requests. Browser checks against a real API still depend on connectivity and a valid key.

## Architecture

```text
src/
  App.tsx                     Application state, layout, language and theme
  components/
    SearchBar.tsx             City input and language control
    HeroCard.tsx              Current conditions
    StatPills.tsx             Humidity, wind and UV availability
    InsightCard.tsx           Animated weather tip
    ForecastStrip.tsx         Daily forecast summaries and partial errors
    ClothingAdvice.tsx        Weather advice and local photo preview
  hooks/useWeather.ts         Request lifecycle, cancellation, retry and refresh
  utils/
    weather.ts                Types, API validation, forecast aggregation and units
    weatherApi.ts             HTTP requests and geolocation fallback
    weatherInsights.ts        Rule-based weather and clothing advice
    weatherThemes.ts          Theme tokens
```

## Deployment

For Vercel, use the Vite preset, build command `npm run build`, output directory `dist`, and Node.js 24. Configure `VITE_OPENWEATHER_KEY` before building; changing it requires a new deployment. Automatic deployment on pushes depends on the project's Vercel Git integration settings.

This repository does not include deployment credentials or verify the live Vercel project configuration.

## Design and screenshots

The original design was developed in Figma. Historical screenshots are kept in `screenshots/`; labels and behavior in those images may predate the accuracy fixes.

## Possible future additions

Hourly forecast presentation, official weather alerts, saved wardrobe items, PWA installation, push notifications, and a real UV data source are not implemented.

## Author

**Shekina Uchegbulem** — [Portfolio](https://shekinauchegbulem.com) · [GitHub](https://github.com/Sheks17) · [LinkedIn](https://linkedin.com/in/shekina-uchegbulem-72a685136)

## License

MIT (as declared by the original project).
