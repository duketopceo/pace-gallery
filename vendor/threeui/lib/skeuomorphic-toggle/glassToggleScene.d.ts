import type { ToggleMode } from "./toggleMode";
export type GlassToggleSceneOptions = {
    canvas: HTMLCanvasElement;
    mode: ToggleMode;
    speed: number;
    on: boolean;
};
export type GlassToggleScene = {
    setMode: (mode: ToggleMode) => void;
    setSpeed: (speed: number) => void;
    setSize: (size: number) => void;
    setOn: (on: boolean) => void;
    setPointer: (x: number, y: number) => void;
    resize: (width: number, height: number) => void;
    measureSwitch: () => {
        width: number;
        height: number;
    };
    dispose: () => void;
};
export declare function createGlassToggleScene({ canvas, mode, speed, on, }: GlassToggleSceneOptions): GlassToggleScene;
//# sourceMappingURL=glassToggleScene.d.ts.map