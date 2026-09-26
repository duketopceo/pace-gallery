import { type CrtStyle, type CrtVariant } from "./crtScreens";
export declare const CRT_VARIANTS: readonly ["terminal", "cinematic", "blue-screen", "nintendo"];
export type CrtOptions = {
    variant: CrtVariant;
    speed: number;
    typeSpeed: number;
    motion: number;
    brightness: number;
    opacity: number;
    hue: number;
    saturation: number;
};
export declare const CRT_DEFAULTS: CrtOptions;
export declare const crtStyle: (variant: CrtVariant) => CrtStyle;
export declare function createCrtRenderer(host: HTMLElement, canvas: HTMLCanvasElement, getOptions: () => CrtOptions): {
    resize: () => void;
    render(now: number): void;
    dispose(): void;
};
//# sourceMappingURL=crtRenderer.d.ts.map