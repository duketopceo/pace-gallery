import type { ToggleMode } from "./toggleMode";
export type ShaderToggleSceneOptions = {
    canvas: HTMLCanvasElement;
    mode: ToggleMode;
    speed: number;
    size: number;
    on: boolean;
};
export type ShaderToggleScene = {
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
export declare function createShaderToggleScene({ canvas, mode, speed, size, on, }: ShaderToggleSceneOptions): ShaderToggleScene;
//# sourceMappingURL=shaderToggleScene.d.ts.map