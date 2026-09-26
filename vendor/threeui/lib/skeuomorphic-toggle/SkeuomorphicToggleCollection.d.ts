import { type CSSProperties } from "react";
import type { ToggleModePreference } from "./toggleMode";
export declare const SKEUOMORPHIC_TOGGLE_VARIANTS: readonly ["skeuomorphic-toggle", "modern", "glass", "shader"];
export type SkeuomorphicToggleVariant = (typeof SKEUOMORPHIC_TOGGLE_VARIANTS)[number];
export type SkeuomorphicToggleCollectionProps = {
    variant?: SkeuomorphicToggleVariant;
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
export declare function SkeuomorphicToggleCollection({ variant, onChange, defaultOn, label, speed, ...props }: SkeuomorphicToggleCollectionProps): import("react").JSX.Element;
//# sourceMappingURL=SkeuomorphicToggleCollection.d.ts.map