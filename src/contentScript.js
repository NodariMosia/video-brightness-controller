"use strict";

let brightness = 100;

function updateVideoBrightness(newBrightness) {
    if (typeof newBrightness === "number" && !isNaN(newBrightness) && newBrightness != brightness) {
        brightness = newBrightness;

        document.querySelectorAll("video").forEach((video) => {
            video.style.filter = `brightness(${brightness}%)`;
        });
    }
}

chrome.storage.sync.get(["brightness"], (result) => {
    updateVideoBrightness(result.brightness);
});

chrome.storage.onChanged.addListener((changes, area) => {
    updateVideoBrightness(changes.brightness.newValue);
});
