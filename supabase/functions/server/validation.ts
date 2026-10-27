const ROUTE_MODES = new Set([
  "car", "pedestrian", "transit", "scooter", "carpool", "motorcycle",
  "taxi", "delivery", "bike", "tourist", "parent", "boat", "plane",
  "helicopter", "horse",
]);

const PREFERENCE_KEYS = new Set([
  "homeAddress", "workAddress", "avoidTolls", "avoidHighways",
  "avoidDifficultIntersections", "avoidFerries", "preferredModes",
  "voiceGuidance", "trafficAlerts", "accidentAlerts", "constructionAlerts",
  "policeAlerts", "speedCameraAlerts", "theme", "units", "selectedCountry",
  "selectedLanguage",
]);

export function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function cleanPreferences(value: unknown): Record<string, unknown> | null {
  if (!isPlainObject(value)) return null;
  const clean: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(value)) {
    if (!PREFERENCE_KEYS.has(key)) continue;
    if (
      ["homeAddress", "workAddress", "selectedCountry", "selectedLanguage"].includes(key)
      && (typeof entry !== "string" || entry.length > 500)
    ) return null;
    if (
      ["avoidTolls", "avoidHighways", "avoidDifficultIntersections", "avoidFerries",
       "voiceGuidance", "trafficAlerts", "accidentAlerts", "constructionAlerts",
       "policeAlerts", "speedCameraAlerts"].includes(key)
      && typeof entry !== "boolean"
    ) return null;
    if (key === "theme" && !["light", "dark", "auto"].includes(String(entry))) return null;
    if (key === "units" && !["metric", "imperial"].includes(String(entry))) return null;
    if (
      key === "preferredModes"
      && (!Array.isArray(entry) || entry.length > 15
        || entry.some((mode) => typeof mode !== "string" || !ROUTE_MODES.has(mode)))
    ) return null;
    clean[key] = entry;
  }
  return clean;
}

export function cleanRoute(value: unknown) {
  if (!isPlainObject(value)) return null;
  const { origin, destination, mode, duration, distance, country, language } = value;
  if (
    typeof origin !== "string" || !origin.trim() || origin.length > 500
    || typeof destination !== "string" || !destination.trim() || destination.length > 500
    || typeof mode !== "string" || !ROUTE_MODES.has(mode)
  ) return null;
  if (duration !== undefined && (typeof duration !== "number" || !Number.isFinite(duration) || duration < 0)) return null;
  if (distance !== undefined && (typeof distance !== "number" || !Number.isFinite(distance) || distance < 0)) return null;
  if (country !== undefined && (typeof country !== "string" || country.length > 10)) return null;
  if (language !== undefined && (typeof language !== "string" || language.length > 20)) return null;

  return {
    origin: origin.trim(),
    destination: destination.trim(),
    mode,
    ...(duration === undefined ? {} : { duration }),
    ...(distance === undefined ? {} : { distance }),
    ...(country === undefined ? {} : { country }),
    ...(language === undefined ? {} : { language }),
  };
}
