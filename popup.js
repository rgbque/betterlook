const extensionApi = globalThis.browser || globalThis.chrome;
const adBlockToggle = document.getElementById("adBlockToggle");
const adBlockStatus = document.getElementById("adBlockStatus");
const siteFontSelect = document.getElementById("siteFont");
const fontStatus = document.getElementById("fontStatus");
const colorSchemeSelect = document.getElementById("siteColorScheme");
const colorShadeSelect = document.getElementById("siteColorShade");
const colorSchemeStatus = document.getElementById("colorSchemeStatus");
const colorSchemes = {
  grayscale: "Grayscale",
  purple: "Purple",
  orange: "Orange",
  blue: "Blue",
  green: "Green",
  red: "Red"
};
const colorShades = ["dark", "medium", "light", "gradient"];
const siteFonts = {
  default: "Better16's default font",
  arial: "Arial",
  verdana: "Verdana",
  trebuchet: "Trebuchet MS",
  georgia: "Georgia",
  "comic-sans": "Comic Sans MS",
  courier: "Courier New"
};

function updateFontStatus(font) {
  fontStatus.textContent = font === "default"
    ? `Using ${siteFonts.default}.`
    : `Using ${siteFonts[font]} on Better16.`;
}

function updateColorSchemeStatus() {
  const scheme = colorSchemeSelect.value;
  const shade = colorShadeSelect.value;
  colorSchemeStatus.textContent = `Using the ${shade} ${colorSchemes[scheme]} color scheme.`;
}

async function loadAdBlockState() {
  const { adBlockEnabled = false } = await extensionApi.storage.local.get("adBlockEnabled");
  adBlockToggle.checked = adBlockEnabled;
  adBlockStatus.textContent = adBlockEnabled ? "Enabled." : "Disabled.";
}

adBlockToggle.addEventListener("change", async () => {
  adBlockToggle.disabled = true;

  try {
    await extensionApi.storage.local.set({ adBlockEnabled: adBlockToggle.checked });
    adBlockStatus.textContent = adBlockToggle.checked ? "On across websites." : "Off.";
  } catch (error) {
    adBlockToggle.checked = !adBlockToggle.checked;
    const reason = error instanceof Error ? error.message : String(error);
    adBlockStatus.textContent = `Could not update the ad-blocker setting: ${reason}`;
    console.error("Could not update the BetterLook ad blocker:", error);
  } finally {
    adBlockToggle.disabled = false;
  }
});

loadAdBlockState().catch((error) => {
  adBlockToggle.disabled = true;
  adBlockStatus.textContent = "Could not load the ad-blocker setting.";
  console.error("Could not load the BetterLook ad-blocker setting:", error);
});

extensionApi.storage.local.get("siteFont")
  .then(({ siteFont = "default" }) => {
    siteFontSelect.value = Object.hasOwn(siteFonts, siteFont) ? siteFont : "default";
    siteFontSelect.dataset.savedFont = siteFontSelect.value;
    updateFontStatus(siteFontSelect.value);
  })
  .catch((error) => {
    siteFontSelect.disabled = true;
    fontStatus.textContent = "Could not load the font setting.";
    console.error("Could not load the BetterLook font setting:", error);
  });

siteFontSelect.addEventListener("change", async () => {
  const previousFont = siteFontSelect.dataset.savedFont || "default";
  const selectedFont = siteFontSelect.value;
  siteFontSelect.disabled = true;

  try {
    await extensionApi.storage.local.set({ siteFont: selectedFont });
    siteFontSelect.dataset.savedFont = selectedFont;
    updateFontStatus(selectedFont);
  } catch (error) {
    siteFontSelect.value = previousFont;
    const reason = error instanceof Error ? error.message : String(error);
    fontStatus.textContent = `Could not update the font: ${reason}`;
    console.error("Could not update the BetterLook font setting:", error);
  } finally {
    siteFontSelect.disabled = false;
  }
});

extensionApi.storage.local.get(["siteColorScheme", "siteColorShade"])
  .then(({ siteColorScheme = "grayscale", siteColorShade = "dark" }) => {
    colorSchemeSelect.value = Object.hasOwn(colorSchemes, siteColorScheme)
      ? siteColorScheme
      : "grayscale";
    colorShadeSelect.value = colorShades.includes(siteColorShade) ? siteColorShade : "dark";
    colorSchemeSelect.dataset.savedScheme = colorSchemeSelect.value;
    colorShadeSelect.dataset.savedShade = colorShadeSelect.value;
    updateColorSchemeStatus();
  })
  .catch((error) => {
    colorSchemeSelect.disabled = true;
    colorShadeSelect.disabled = true;
    colorSchemeStatus.textContent = "Could not load the color scheme.";
    console.error("Could not load the BetterLook color scheme:", error);
  });

colorSchemeSelect.addEventListener("change", async () => {
  const previousScheme = colorSchemeSelect.dataset.savedScheme || "grayscale";
  const selectedScheme = colorSchemeSelect.value;
  colorSchemeSelect.disabled = true;

  try {
    await extensionApi.storage.local.set({ siteColorScheme: selectedScheme });
    colorSchemeSelect.dataset.savedScheme = selectedScheme;
    updateColorSchemeStatus();
  } catch (error) {
    colorSchemeSelect.value = previousScheme;
    const reason = error instanceof Error ? error.message : String(error);
    colorSchemeStatus.textContent = `Could not update the color scheme: ${reason}`;
    console.error("Could not update the BetterLook color scheme:", error);
  } finally {
    colorSchemeSelect.disabled = false;
  }
});

colorShadeSelect.addEventListener("change", async () => {
  const previousShade = colorShadeSelect.dataset.savedShade || "dark";
  const selectedShade = colorShadeSelect.value;
  colorShadeSelect.disabled = true;

  try {
    await extensionApi.storage.local.set({ siteColorShade: selectedShade });
    colorShadeSelect.dataset.savedShade = selectedShade;
    updateColorSchemeStatus();
  } catch (error) {
    colorShadeSelect.value = previousShade;
    const reason = error instanceof Error ? error.message : String(error);
    colorSchemeStatus.textContent = `Could not update the color shade: ${reason}`;
    console.error("Could not update the BetterLook color shade:", error);
  } finally {
    colorShadeSelect.disabled = false;
  }
});

document.getElementById("supportBtn").addEventListener("click", () => {
  extensionApi.tabs.create({
    url: "https://better16.xyz/catalog/37162/BetterLook-Donation"
  });
});
