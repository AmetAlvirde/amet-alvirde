export const THEME_STORAGE_KEY = "theme";

export const THEME_PREFERENCES = ["light", "dark", "system"] as const;

export type ThemePreference = (typeof THEME_PREFERENCES)[number];
export type ActualTheme = "light" | "dark";

export const FAVICON_SELECTOR = 'link[rel="icon"]:not([media])';

export const FAVICON_TARGETS = {
  light: "/favicon-light-mode.svg",
  dark: "/favicon-dark-mode.svg",
} as const;

export const normalizeThemePreference = (
  candidate: string | null | undefined,
): ThemePreference =>
  candidate === "light" || candidate === "dark" || candidate === "system"
    ? candidate
    : "system";

export const resolveActualTheme = (
  preference: ThemePreference,
  systemPrefersDark: boolean,
): ActualTheme => {
  if (preference === "light") {
    return "light";
  }

  if (preference === "dark") {
    return "dark";
  }

  return systemPrefersDark ? "dark" : "light";
};

export const getDocumentThemeAttributes = (
  preference: ThemePreference,
  actualTheme: ActualTheme,
) => ({
  dataTheme: actualTheme,
  dataThemePreference: preference,
  isDarkClass: actualTheme === "dark",
});

export const getFaviconTarget = (theme: ActualTheme): string =>
  FAVICON_TARGETS[theme];
