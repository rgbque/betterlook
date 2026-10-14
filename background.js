const extensionApi = globalThis.browser || globalThis.chrome;
const adNetworkPatterns = [
  "*://better16.xyz/images/Ads/*",
  "*://www.better16.xyz/images/Ads/*",
  "*://*.doubleclick.net/*",
  "*://*.googlesyndication.com/*",
  "*://*.googleadservices.com/*",
  "*://*.googletagservices.com/*",
  "*://*.adnxs.com/*",
  "*://*.adsrvr.org/*",
  "*://*.adform.net/*",
  "*://*.taboola.com/*",
  "*://*.outbrain.com/*",
  "*://*.amazon-adsystem.com/*",
  "*://*.criteo.com/*",
  "*://*.scorecardresearch.com/*",
  "*://*.quantserve.com/*"
];
let blockingListenerAttached = false;

function isBetter16Url(value) {
  if (!value) {
    return false;
  }

  try {
    const hostname = new URL(value).hostname;
    return hostname === "better16.xyz" || hostname.endsWith(".better16.xyz");
  } catch {
    return false;
  }
}

function blockAdRequests(details) {
  const sourceUrl = details.documentUrl || details.originUrl || details.initiator;
  return isBetter16Url(sourceUrl) ? { cancel: true } : {};
}

async function refreshBlockingListener() {
  const { adBlockEnabled = false } = await extensionApi.storage.local.get("adBlockEnabled");

  if (adBlockEnabled && !blockingListenerAttached) {
    extensionApi.webRequest.onBeforeRequest.addListener(
      blockAdRequests,
      {
        urls: adNetworkPatterns,
        types: ["script", "image", "sub_frame", "xmlhttprequest", "stylesheet", "media", "font", "object", "ping"]
      },
      ["blocking"]
    );
    blockingListenerAttached = true;
  } else if (!adBlockEnabled && blockingListenerAttached) {
    extensionApi.webRequest.onBeforeRequest.removeListener(blockAdRequests);
    blockingListenerAttached = false;
  }
}

function refreshBlockingListenerWithLogging() {
  refreshBlockingListener().catch((error) => {
    console.error("Could not update the BetterLook ad blocker:", error);
  });
}

extensionApi.runtime.onStartup.addListener(refreshBlockingListenerWithLogging);
extensionApi.runtime.onInstalled.addListener(refreshBlockingListenerWithLogging);
extensionApi.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === "local" && changes.adBlockEnabled) {
    refreshBlockingListenerWithLogging();
  }
});
extensionApi.permissions.onRemoved.addListener(refreshBlockingListenerWithLogging);
refreshBlockingListenerWithLogging();
