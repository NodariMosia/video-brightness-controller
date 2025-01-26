"use strict";

/** @type {BrightnessControllerSettings} */
const settingsCache = {
    video: 100,
    img: 100,
};

/** @type {HTMLStyleElement | undefined} */
let styleElement;

chrome.storage.sync.get(["settings"], (result) => {
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
