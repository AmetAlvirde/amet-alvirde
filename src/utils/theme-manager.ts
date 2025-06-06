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

// Pure functions for theme logic
const getSystemTheme = (): ActualTheme =>
  window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";

const getActualTheme = (preference: ThemePreference): ActualTheme =>
  preference === "system" ? getSystemTheme() : (preference as ActualTheme);

const getCurrentPreference = (): ThemePreference =>
  (document.documentElement.getAttribute(
    "data-theme-preference"
  ) as ThemePreference | null) || "system";

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

  // TypeScript now knows all elements are non-null
  return elements as ThemeElements;
};

// Theme update functions
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

// Theme action functions
const toggleManualTheme = (elements: ThemeElements): void => {
  const currentTheme = getCurrentTheme();
  const newTheme: ActualTheme = currentTheme === "light" ? "dark" : "light";

  localStorage.setItem("theme", newTheme);
  updateThemeUI(newTheme, elements);
};

const setSystemTheme = (elements: ThemeElements): void => {
  localStorage.setItem("theme", "system");
  updateThemeUI("system", elements);
};

// Event handler factory
const createThemeToggleHandler = (elements: ThemeElements) => () =>
  toggleManualTheme(elements);

const createSystemThemeHandler = (elements: ThemeElements) => () =>
  setSystemTheme(elements);

const createSystemThemeChangeHandler =
  (elements: ThemeElements) => (): void => {
    const currentPreference = getCurrentPreference();
    if (currentPreference === "system") {
      updateThemeUI("system", elements);
    }
  };

// Event listener setup
const setupEventListeners = (elements: ThemeElements): void => {
  const { themeToggle, systemThemeToggle } = elements;

  themeToggle.addEventListener("click", createThemeToggleHandler(elements));
  systemThemeToggle.addEventListener(
    "click",
    createSystemThemeHandler(elements)
  );

  window
    .matchMedia("(prefers-color-scheme: light)")
    .addEventListener("change", createSystemThemeChangeHandler(elements));
};

// Main initialization function
export const initializeThemeManager = (): void => {
  try {
    const elements = getRequiredElements();
    const currentPreference = getCurrentPreference();

    // Set initial UI state
    updateThemeUI(currentPreference, elements);

    // Setup event listeners
    setupEventListeners(elements);
  } catch (error) {
    console.error("Failed to initialize theme manager:", error);
  }
};

// Export individual functions for testing or granular usage
export {
  getSystemTheme,
  getActualTheme,
  getCurrentPreference,
  getCurrentTheme,
  updateThemeUI,
  toggleManualTheme,
  setSystemTheme,
};
