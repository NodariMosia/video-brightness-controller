"use strict";

import "./popup.css";

const DEFAULT_BRIGHTNESS_VALUE = 100;
const UPDATE_DEBOUNCE_DELAY = 25;

/** @type {BrightnessControllerSettings} */
const settings = {
    video: DEFAULT_BRIGHTNESS_VALUE,
    img: DEFAULT_BRIGHTNESS_VALUE,
};

document.addEventListener("DOMContentLoaded", load);

function load() {
    /** @type {HTMLElement | null} */
    const resetButton = document.getElementById("resetButton");

    if (!resetButton) {
        return;
    }

    const controllers = [
        createMediaBrightnessController("video"),
        createMediaBrightnessController("img"),
    ].filter((controller) => !!controller);

    chrome.storage.local.get(["settings"], (result) => {
        controllers.forEach((controller) => {
            const initialValue = result.settings?.[controller.mediaTag] ?? DEFAULT_BRIGHTNESS_VALUE;

            controller.updateMediaBrightness(initialValue, true);

            controller.input.oninput = (event) => {
                if (event.target instanceof HTMLInputElement) {
                    controller.updateMediaBrightness(event.target.valueAsNumber, false);
                }
            };

            controller.input.onblur = () => {
                controller.display.classList.remove("show");
            };
        });

        resetButton.onclick = () => {
            controllers.forEach((controller) => {
                controller?.updateMediaBrightness(DEFAULT_BRIGHTNESS_VALUE, true);
            });
        };
    });
}

/**
 * @param {SupportedMediaTag} mediaTag
 * @returns {MediaBrightnessController | null}
 */
function createMediaBrightnessController(mediaTag) {
    /** @type {HTMLElement | null} */
    const input = document.getElementById(`${mediaTag}BrightnessInput`);
    /** @type {HTMLElement | null} */
    const display = document.getElementById(`${mediaTag}BrightnessDisplay`);

    if (!input || !display || !(input instanceof HTMLInputElement)) {
        return null;
    }

    /**
     * @param {number} brightness
     * @param {boolean} setInputValue
     */
    const updateMediaBrightness = (brightness, setInputValue) => {
        settings[mediaTag] = brightness;

        chrome.storage.local.set({ settings });

        if (setInputValue) input.valueAsNumber = brightness;

        display.textContent = `${brightness}`;
        display.style.left = brightness / 2 + "%";
        display.classList.add("show");
    };

    return {
        input,
        display,
        mediaTag,
        updateMediaBrightness: debounce(updateMediaBrightness, UPDATE_DEBOUNCE_DELAY),
    };
}

/**
 * @template {(...args: any[]) => any} T
 * @param {T} callback
 * @param {number} delayInMS
 * @returns {T}
 */
function debounce(callback, delayInMS) {
    /** @type {number | undefined} */
    let timeoutId;

    return /** @type {T} */ (
        (...args) => {
            window.clearTimeout(timeoutId);
            timeoutId = window.setTimeout(() => callback(...args), delayInMS);
        }
    );
}
