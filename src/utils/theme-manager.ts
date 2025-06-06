// Theme types
export type ThemePreference = "light" | "dark" | "system";
export type ActualTheme = "light" | "dark";

// Verified theme elements type (all non-null after validation)
type ThemeElements = {
  themeToggle: HTMLButtonElement;
  systemThemeToggle: HTMLButtonElement;
  sunIcon: HTMLElement;
  moonIcon: HTMLElement;
  monogram: HTMLImageElement;
};

// DOM element selectors
const SELECTORS = {
  themeToggle: "#theme-toggle",
  systemThemeToggle: "#system-theme-toggle",
  sunIcon: "#sun-icon",
  moonIcon: "#moon-icon",
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
    themeToggle: document.querySelector(
      SELECTORS.themeToggle
    ) as HTMLButtonElement | null,
    systemThemeToggle: document.querySelector(
      SELECTORS.systemThemeToggle
    ) as HTMLButtonElement | null,
    sunIcon: document.querySelector(SELECTORS.sunIcon) as HTMLElement | null,
    moonIcon: document.querySelector(SELECTORS.moonIcon) as HTMLElement | null,
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
  const { sunIcon, moonIcon, monogram } = elements;

  if (actualTheme === "light") {
    sunIcon.classList.remove("hidden");
    moonIcon.classList.add("hidden");
    monogram.setAttribute("src", "monogram-light-mode.svg");
  } else {
    sunIcon.classList.add("hidden");
    moonIcon.classList.remove("hidden");
    monogram.setAttribute("src", "monogram-dark-mode.svg");
  }
};

const updateButtonStates = (
  preference: ThemePreference,
  elements: ThemeElements
): void => {
  const { themeToggle, systemThemeToggle } = elements;

  // Remove active state from all buttons
  themeToggle.classList.remove("active");
  systemThemeToggle.classList.remove("active");

  // Add active state to current preference
  const activeButton =
    preference === "system" ? systemThemeToggle : themeToggle;
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
const toggleManualTheme = (elements: ThemeElements): void => {
  const currentTheme = getCurrentTheme();
  const newTheme: ActualTheme = currentTheme === "light" ? "dark" : "light";

  safeLocalStorageSet("theme", newTheme);
  updateThemeUI(newTheme, elements);
};

const setSystemTheme = (elements: ThemeElements): void => {
  safeLocalStorageSet("theme", "system");
  updateThemeUI("system", elements);
};

// Event handlers
const createToggleHandler = (elements: ThemeElements) => () =>
  toggleManualTheme(elements);
const createSystemHandler = (elements: ThemeElements) => () =>
  setSystemTheme(elements);

const createSystemChangeHandler = (elements: ThemeElements) => (): void => {
  const currentPreference = getCurrentPreference();
  if (currentPreference === "system") {
    updateThemeUI("system", elements);
  }
};

// Event listener setup
const setupEventListeners = (elements: ThemeElements): void => {
  const { themeToggle, systemThemeToggle } = elements;

  const toggleHandler = createToggleHandler(elements);
  const systemHandler = createSystemHandler(elements);

  // Make buttons focusable
  themeToggle.setAttribute("tabindex", "0");
  systemThemeToggle.setAttribute("tabindex", "0");

  // Click events
  themeToggle.addEventListener("click", toggleHandler);
  systemThemeToggle.addEventListener("click", systemHandler);

  // Keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter") {
      event.preventDefault();
      systemHandler(); // Enter = system theme
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === " ") {
      event.preventDefault();
      toggleHandler(); // Space = toggle theme
    }
  };

  // Attach keyboard handlers to both buttons
  [themeToggle, systemThemeToggle].forEach(button => {
    button.addEventListener("keydown", handleKeyDown);
    button.addEventListener("keyup", handleKeyUp);
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
  toggleManualTheme,
  setSystemTheme,
};
