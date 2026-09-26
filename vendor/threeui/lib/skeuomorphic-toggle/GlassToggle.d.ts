import { type CSSProperties } from "react";
import "./glass-toggle.css";
import { type ToggleModePreference } from "./toggleMode";
export type GlassToggleProps = {
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
export declare const GLASS_TOGGLE_DEFAULTS: {
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
export declare function GlassToggle({ mode, defaultOn, label, speed, size, opacity, hue, saturation, brightness, onChange, className, style, }: GlassToggleProps): import("react").JSX.Element;
//# sourceMappingURL=GlassToggle.d.ts.map