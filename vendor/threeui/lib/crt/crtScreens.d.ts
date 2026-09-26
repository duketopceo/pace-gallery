export type CrtVariant = "terminal" | "cinematic" | "blue-screen" | "nintendo";
export type ScreenSurface = {
    mode: "buffer";
} | {
    mode: "cap";
    width: number;
} | {
    mode: "fixed";
    width: number;
    height: number;
};
export type CrtStyle = {
    curve: readonly [number, number];
    scanDensity: number;
    scanDepth: number;
    triadCss: number;
    grille: number;
    chroma: number;
    bar: number;
    flicker: number;
    grain: number;
    noise: number;
    vignette: number;
    mono: number;
    gain: number;
    halo: number;
    sheen: readonly [number, number, number];
    room: readonly [number, number, number];
    background: string;
    filtering: "linear" | "nearest";
    surface: ScreenSurface;
    redrawMs: number;
};
export declare const CRT_STYLES: Record<CrtVariant, CrtStyle>;
export type ScreenPainter = (context: CanvasRenderingContext2D, width: number, height: number, time: number) => void;
export declare const CRT_SCREENS: Record<Exclude<CrtVariant, "terminal">, ScreenPainter>;
//# sourceMappingURL=crtScreens.d.ts.map