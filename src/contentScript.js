"use strict";

const DEFAULT_BRIGHTNESS_VALUE = 100;
const BRIGHTNESS_VALUE_STEP = 5;

/** @type {BrightnessControllerSettings} */
const settingsCache = {
    video: DEFAULT_BRIGHTNESS_VALUE,
    img: DEFAULT_BRIGHTNESS_VALUE,
};

/** @type {HTMLStyleElement | undefined} */
let styleElement;

chrome.storage.local.get(["settings"], (result) => {
    updateSupportedMediaBrightnesses(result.settings);
});

chrome.storage.onChanged.addListener((changes) => {
    updateSupportedMediaBrightnesses(changes.settings?.newValue);
});

/**
 * @param {BrightnessControllerSettings | undefined} newSettings
 */
function updateSupportedMediaBrightnesses(newSettings) {
    if (!newSettings) {
        return;
    }

    let hasChanges = false;

    for (const key in newSettings) {
        if (!Object.prototype.hasOwnProperty.call(settingsCache, key)) {
            continue;
        }

        const mediaTag = /** @type {SupportedMediaTag} */ (key);
        const brightness = newSettings[mediaTag];

        if (typeof brightness !== "number" || isNaN(brightness)) {
            continue;
        }

        if (brightness == settingsCache[mediaTag]) {
            continue;
        }

        hasChanges = true;
        settingsCache[mediaTag] = brightness;
    }

    if (!hasChanges) {
        return;
    }

    const newStyles = Object.entries(settingsCache)
        .map(([elementTag, brightness]) => `${elementTag} {filter:brightness(${brightness}%)}`)
        .join(" ");

    updateStyleTagInDocumentHead(newStyles);
}

/**
 * @param {string} newStyles
 */
function updateStyleTagInDocumentHead(newStyles) {
    if (!styleElement) {
        styleElement = document.createElement("style");
        styleElement.id = "media-brightness-controller-style";
        styleElement.textContent = newStyles;
        document.head.prepend(styleElement);
    } else {
        styleElement.textContent = newStyles;
    }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    const newSettings = { ...settingsCache };

    if (message === "increase-all-brightness") {
        newSettings.video = Math.min(200, newSettings.video + BRIGHTNESS_VALUE_STEP);
        newSettings.img = Math.min(200, newSettings.img + BRIGHTNESS_VALUE_STEP);
    } else if (message === "decrease-all-brightness") {
        newSettings.video = Math.max(0, newSettings.video - BRIGHTNESS_VALUE_STEP);
        newSettings.img = Math.max(0, newSettings.img - BRIGHTNESS_VALUE_STEP);
    } else if (message === "reset-all-brightness") {
        newSettings.video = DEFAULT_BRIGHTNESS_VALUE;
        newSettings.img = DEFAULT_BRIGHTNESS_VALUE;
    }

    chrome.storage.local.set({ settings: newSettings });

    sendResponse({});
});
