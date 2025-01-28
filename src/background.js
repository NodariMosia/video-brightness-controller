"use strict";

chrome.commands.onCommand.addListener((command) => {
    if (
        command === "increase-all-brightness" ||
        command === "decrease-all-brightness" ||
        command === "reset-all-brightness"
    ) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.sendMessage(tabs[0].id, command);
            }
        });
    }
});
