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

    let hasChanges = false;
    let newStyles = "";

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

        newStyles += newStyles ? " " : "";
        newStyles += `${mediaTag} {filter: brightness(${brightness}%)}`;
    }

    if (hasChanges) {
        updateStyleTagInDocumentHead(newStyles);
    }
}

/**
 * @param {string} newStyles
 */
function updateStyleTagInDocumentHead(newStyles) {
    const styleTag = document.getElementById("media-brightness-controller-style");

    if (!styleTag) {
        const style = document.createElement("style");
        style.id = "media-brightness-controller-style";
        style.textContent = newStyles;
        document.head.appendChild(style);
    } else {
        styleTag.textContent = newStyles;
    }
}
