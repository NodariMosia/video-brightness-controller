declare global {
    /**
     * Currently supported media tags by the extension.
     */
    type SupportedMediaTag = "video" | "img";

    /**
     * Settings object for the extension.
     */
    type BrightnessControllerSettings = Record<SupportedMediaTag, number>;

    type MediaBrightnessController = {
        input: HTMLInputElement;
        display: HTMLElement;
        mediaTag: SupportedMediaTag;
        updateMediaBrightness: (
            /** @type {number} */ brightness: number,
            /** @type {boolean} */ setInputValue: boolean
        ) => void;
    };
}

export {};
