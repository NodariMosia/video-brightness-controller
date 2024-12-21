"use strict";

import "./popup.css";

const DEFAULT_BRIGHTNESS_VALUE = 100;
const UPDATE_DEBOUNCE_DELAY = 25;

document.addEventListener("DOMContentLoaded", () => {
    /** @type {HTMLInputElement | null} */
    const brightnessInput = document.getElementById("brightnessInput");
    /** @type {HTMLElement | null} */
    const brightnessDisplay = document.getElementById("brightnessDisplay");
    /** @type {HTMLButtonElement | null} */
    const resetButton = document.getElementById("reset");

    if (!brightnessInput || !brightnessDisplay || !resetButton) {
        return;
    }

    /** @type {(brightness: number, setInputValue: boolean) => void} brightness */
    const updateBrightness = debounce((brightness, setInputValue) => {
        chrome.storage.sync.set({ brightness });

        if (setInputValue) brightnessInput.value = brightness;

        brightnessDisplay.textContent = brightness;
        brightnessDisplay.style.left = brightness / 2 + "%";
        brightnessDisplay.classList.add("show");
    }, UPDATE_DEBOUNCE_DELAY);

    chrome.storage.sync.get(["brightness"], (result) => {
        updateBrightness(result.brightness ?? DEFAULT_BRIGHTNESS_VALUE, true);

        brightnessInput.addEventListener("input", (event) => {
            updateBrightness(parseInt(event.target.value), false);
        });

        brightnessInput.addEventListener("blur", () => {
            brightnessDisplay.classList.remove("show");
        });

        resetButton.addEventListener("click", () => {
            updateBrightness(DEFAULT_BRIGHTNESS_VALUE, true);
        });
    });
});

/**
 * @param {Function} callback
 * @param {number} delayInMS
 */
function debounce(callback, delayInMS) {
    let timeoutId = null;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => callback(...args), delayInMS);
    };
}
