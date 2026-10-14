const extensionApi = globalThis.browser || globalThis.chrome;
const adBlockAttribute = "data-betterlook-ad-block";
const fontAttribute = "data-betterlook-font";
const colorSchemeAttribute = "data-betterlook-scheme";
const colorShadeAttribute = "data-betterlook-shade";
const siteFonts = new Set(["default", "arial", "verdana", "trebuchet", "georgia", "comic-sans", "courier"]);
const colorSchemes = new Set(["grayscale", "purple", "orange", "blue", "green", "red"]);
const colorShades = new Set(["dark", "medium", "light", "gradient"]);
let currentColorScheme = "grayscale";
let currentColorShade = "dark";

function setAdBlockPageState(enabled) {
  const applyState = () => {
    if (enabled) {
      document.documentElement.setAttribute(adBlockAttribute, "enabled");
    } else {
      document.documentElement.removeAttribute(adBlockAttribute);
    }
  };

  if (document.documentElement) {
    applyState();
  } else {
    document.addEventListener("DOMContentLoaded", applyState, { once: true });
  }
}

function setSiteFont(font) {
  if (!siteFonts.has(font)) {
    console.warn("Ignoring an unsupported BetterLook font setting.");
    return;
  }

  const applyFont = () => {
    if (font === "default") {
      document.documentElement.removeAttribute(fontAttribute);
    } else {
      document.documentElement.setAttribute(fontAttribute, font);
    }
  };

  if (document.documentElement) {
    applyFont();
  } else {
    document.addEventListener("DOMContentLoaded", applyFont, { once: true });
  }
}

function setColorScheme(scheme, shade) {
  if (!colorSchemes.has(scheme) || !colorShades.has(shade)) {
    console.warn("Ignoring an unsupported BetterLook color scheme or shade.");
    return;
  }

  currentColorScheme = scheme;
  currentColorShade = shade;
  const applyScheme = () => {
    document.documentElement.setAttribute(colorSchemeAttribute, scheme);
    document.documentElement.setAttribute(colorShadeAttribute, shade);
  };

  if (document.documentElement) {
    applyScheme();
  } else {
    document.addEventListener("DOMContentLoaded", applyScheme, { once: true });
  }
}

extensionApi.storage.local.get(["adBlockEnabled", "siteFont", "siteColorScheme", "siteColorShade"])
  .then(({ adBlockEnabled = false, siteFont = "default", siteColorScheme = "grayscale", siteColorShade = "dark" }) => {
    setAdBlockPageState(adBlockEnabled);
    setSiteFont(siteFont);
    setColorScheme(siteColorScheme, siteColorShade);
  })
  .catch((error) => {
    console.error("Could not load the BetterLook page ad-blocker setting:", error);
  });

extensionApi.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local") {
    if (changes.adBlockEnabled) {
      setAdBlockPageState(changes.adBlockEnabled.newValue === true);
    }

    if (changes.siteFont) {
      setSiteFont(changes.siteFont.newValue || "default");
    }

    if (changes.siteColorScheme || changes.siteColorShade) {
      setColorScheme(
        changes.siteColorScheme ? changes.siteColorScheme.newValue || "grayscale" : currentColorScheme,
        changes.siteColorShade ? changes.siteColorShade.newValue || "dark" : currentColorShade
      );
    }
  }
});
