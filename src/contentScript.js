"use strict";

/** @type {BrightnessControllerSettings} */
const settingsCache = {
    video: 100,
    img: 100,
};

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

        settingsCache[mediaTag] = brightness;

        document.querySelectorAll(mediaTag).forEach((video) => {
            video.style.filter = `brightness(${brightness}%)`;
        });
    }
}
