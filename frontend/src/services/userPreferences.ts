const PREFERENCES_STORAGE_KEY = "precious-metals-portfolio:user-preferences";

type Preferences = Record<string, unknown>;

function readPreferences(): Preferences {
  try {
    const stored = window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!stored) {
      return {};
    }

    const parsed: unknown = JSON.parse(stored);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Preferences)
      : {};
  } catch {
    return {};
  }
}

function writePreferences(preferences: Preferences): void {
  try {
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify(preferences),
    );
  } catch {
    // Storage can be unavailable in private browsing or restricted contexts.
  }
}

export function getUserPreference<T>(key: string, fallback: T): T {
  const value = readPreferences()[key];
  return value === undefined ? fallback : (value as T);
}

export function setUserPreference<T>(key: string, value: T): void {
  writePreferences({ ...readPreferences(), [key]: value });
}

export function removeUserPreference(key: string): void {
  const preferences = readPreferences();
  delete preferences[key];
  writePreferences(preferences);
}