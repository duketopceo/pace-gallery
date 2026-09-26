import { type CSSProperties } from "react";
import "./shader-toggle.css";
import { type ToggleModePreference } from "./toggleMode";
export type ShaderToggleProps = {
    mode?: ToggleModePreference;
    defaultOn?: boolean;
    label?: string;
    speed?: number;
    size?: number;
    opacity?: number;
    hue?: number;
    saturation?: number;
    brightness?: number;
    onChange?: (on: boolean) => void;
    className?: string;
    style?: CSSProperties;
};
export declare const SHADER_TOGGLE_DEFAULTS: {
    readonly mode: ToggleModePreference;
    readonly defaultOn: true;
    readonly label: "Live Sync";
    readonly speed: 1;
    readonly size: 1;
    readonly opacity: 1;
    readonly hue: 0;
    readonly saturation: 1;
    readonly brightness: 1;
};
export declare function ShaderToggle({ mode, defaultOn, label, speed, size, opacity, hue, saturation, brightness, onChange, className, style, }: ShaderToggleProps): import("react").JSX.Element;
//# sourceMappingURL=ShaderToggle.d.ts.map