import { type CSSProperties } from "react";
import "./modern-toggle.css";
import { type ToggleModePreference } from "./toggleMode";
export type ModernToggleProps = {
    mode?: ToggleModePreference;
    defaultOn?: boolean;
    label?: string;
    size?: number;
    opacity?: number;
    hue?: number;
    saturation?: number;
    brightness?: number;
    onChange?: (on: boolean) => void;
    className?: string;
    style?: CSSProperties;
};
export declare const MODERN_TOGGLE_DEFAULTS: {
    readonly mode: ToggleModePreference;
    readonly defaultOn: true;
    readonly label: "Live Sync";
    readonly size: 1;
    readonly opacity: 1;
    readonly hue: 0;
    readonly saturation: 1;
    readonly brightness: 1;
};
export declare function ModernToggle({ mode, defaultOn, label, size, opacity, hue, saturation, brightness, onChange, className, style, }: ModernToggleProps): import("react").JSX.Element;
//# sourceMappingURL=ModernToggle.d.ts.map