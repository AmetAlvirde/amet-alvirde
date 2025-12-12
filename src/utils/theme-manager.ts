// Theme types
export type ThemePreference = "light" | "dark" | "system";
export type ActualTheme = "light" | "dark";

// Verified theme elements type (all non-null after validation)
type ThemeElements = {
  lightThemeButton: HTMLButtonElement;
  systemThemeButton: HTMLButtonElement;
  darkThemeButton: HTMLButtonElement;
  monogram: HTMLImageElement;
};

// DOM element selectors
const SELECTORS = {
  lightThemeButton: "#light-theme-button",
  systemThemeButton: "#system-theme-button",
  darkThemeButton: "#dark-theme-button",
  monogram: "#monogram",
  favicon: 'link[rel="icon"]:not([media])',
} as const;

// Safe localStorage operations
const safeLocalStorageGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeLocalStorageSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Silent fail - theme will still work, just won't persist
  }
};

// Core theme functions (coordinated with inline script)
const getSystemTheme = (): ActualTheme =>
  window.matchMedia?.("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";

const getActualTheme = (preference: ThemePreference): ActualTheme =>
  preference === "system" ? getSystemTheme() : (preference as ActualTheme);

// Read current state (set by inline script or previous interactions)
const getCurrentPreference = (): ThemePreference =>
  (document.documentElement.getAttribute(
    "data-theme-preference"
  ) as ThemePreference) ||
  (safeLocalStorageGet("theme") as ThemePreference) ||
  "system";

const getCurrentTheme = (): ActualTheme | null =>
  document.documentElement.getAttribute("data-theme") as ActualTheme | null;

// DOM utility functions
const getRequiredElements = (): ThemeElements => {
  const elements = {
    lightThemeButton: document.querySelector(
      SELECTORS.lightThemeButton
    ) as HTMLButtonElement | null,
    systemThemeButton: document.querySelector(
      SELECTORS.systemThemeButton
    ) as HTMLButtonElement | null,
    darkThemeButton: document.querySelector(
      SELECTORS.darkThemeButton
    ) as HTMLButtonElement | null,
    monogram: document.querySelector(
      SELECTORS.monogram
    ) as HTMLImageElement | null,
  };

  const missingElements = Object.entries(elements)
    .filter(([_, element]) => !element)
    .map(([key]) => key);

  if (missingElements.length > 0) {
    throw new Error(`Theme elements not found: ${missingElements.join(", ")}`);
  }

  return elements as ThemeElements;
};

// UI update functions
const updateFavicon = (theme: ActualTheme): void => {
  const favicon = document.querySelector(
    SELECTORS.favicon
  ) as HTMLLinkElement | null;
  if (favicon) {
    favicon.href =
      theme === "light" ? "/favicon-light-mode.svg" : "/favicon-dark-mode.svg";
  }
};

const updateThemeIcons = (
  actualTheme: ActualTheme,
  elements: ThemeElements
): void => {
  const { monogram } = elements;

  if (actualTheme === "light") {
    monogram.setAttribute("src", "monogram-light-mode.svg");
  } else {
    monogram.setAttribute("src", "monogram-dark-mode.svg");
  }
};

const updateButtonStates = (
  preference: ThemePreference,
  elements: ThemeElements
): void => {
  const { lightThemeButton, systemThemeButton, darkThemeButton } = elements;

  // Remove active state from all buttons
  lightThemeButton.classList.remove("active");
  systemThemeButton.classList.remove("active");
  darkThemeButton.classList.remove("active");

  // Add active state to current preference
  const activeButton =
    preference === "light"
      ? lightThemeButton
      : preference === "dark"
      ? darkThemeButton
      : systemThemeButton;
  activeButton.classList.add("active");
};

const updateDocumentAttributes = (
  preference: ThemePreference,
  actualTheme: ActualTheme
): void => {
  document.documentElement.setAttribute("data-theme", actualTheme);
  document.documentElement.setAttribute("data-theme-preference", preference);
};

// Complete UI update (coordinates all visual changes)
const updateThemeUI = (
  preference: ThemePreference,
  elements: ThemeElements
): void => {
  const actualTheme = getActualTheme(preference);

  updateDocumentAttributes(preference, actualTheme);
  updateThemeIcons(actualTheme, elements);
  updateFavicon(actualTheme);
  updateButtonStates(preference, elements);
};

// User action handlers
const setLightTheme = (elements: ThemeElements): void => {
  safeLocalStorageSet("theme", "light");
  updateThemeUI("light", elements);
};

const setSystemTheme = (elements: ThemeElements): void => {
  safeLocalStorageSet("theme", "system");
  updateThemeUI("system", elements);
};

const setDarkTheme = (elements: ThemeElements): void => {
  safeLocalStorageSet("theme", "dark");
  updateThemeUI("dark", elements);
};

// Event handlers
const createLightHandler = (elements: ThemeElements) => () =>
  setLightTheme(elements);
const createSystemHandler = (elements: ThemeElements) => () =>
  setSystemTheme(elements);
const createDarkHandler = (elements: ThemeElements) => () =>
  setDarkTheme(elements);

const createSystemChangeHandler = (elements: ThemeElements) => (): void => {
  const currentPreference = getCurrentPreference();
  if (currentPreference === "system") {
    updateThemeUI("system", elements);
  }
};

// Event listener setup
const setupEventListeners = (elements: ThemeElements): void => {
  const { lightThemeButton, systemThemeButton, darkThemeButton } = elements;

  const lightHandler = createLightHandler(elements);
  const systemHandler = createSystemHandler(elements);
  const darkHandler = createDarkHandler(elements);

  // Make buttons focusable
  lightThemeButton.setAttribute("tabindex", "0");
  systemThemeButton.setAttribute("tabindex", "0");
  darkThemeButton.setAttribute("tabindex", "0");

  // Click events
  lightThemeButton.addEventListener("click", lightHandler);
  systemThemeButton.addEventListener("click", systemHandler);
  darkThemeButton.addEventListener("click", darkHandler);

  // Keyboard events (Enter or Space to activate)
  const handleKeyPress = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      (event.target as HTMLButtonElement).click();
    }
  };

  // Attach keyboard handlers to all buttons
  [lightThemeButton, systemThemeButton, darkThemeButton].forEach(button => {
    button.addEventListener("keydown", handleKeyPress);
  });

  // Listen for system theme changes
  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", createSystemChangeHandler(elements));
};

// Main initialization
export const initializeThemeManager = (): void => {
  try {
    const elements = getRequiredElements();
    const currentPreference = getCurrentPreference();

    // Sync UI with current state (inline script already set the theme)
    updateThemeUI(currentPreference, elements);

    // Setup interactive functionality
    setupEventListeners(elements);
  } catch (error) {
    console.error("Failed to initialize theme manager:", error);
  }
};

// Export functions for external use
export {
  getSystemTheme,
  getActualTheme,
  getCurrentPreference,
  getCurrentTheme,
  updateThemeUI,
  setLightTheme,
  setSystemTheme,
  setDarkTheme,
};
