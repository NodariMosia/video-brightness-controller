declare global {
    type SupportedMediaTag = "video" | "img";

    type BrightnessControllerSettings = Record<SupportedMediaTag, number>;

    type MediaBrightnessController = {
        input: HTMLInputElement;
        display: HTMLElement;
        mediaTag: SupportedMediaTag;
        updateMediaBrightness: (brightness: number, setInputValue: boolean) => void;
    };
}

export {};
