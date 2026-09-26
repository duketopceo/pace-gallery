export type RetroPixelOptions = {
    pixelSize: number;
    noise: number;
    levels: number;
    speed: number;
};
export declare const RETRO_PIXEL_DEFAULTS: RetroPixelOptions;
export declare function createRetroPixelField(canvas: HTMLCanvasElement, getOptions: () => RetroPixelOptions): {
    resize: (cssWidth: number, cssHeight: number) => void;
    render: (now?: number) => void;
    dispose: () => void;
};
//# sourceMappingURL=retroPixelField.d.ts.map