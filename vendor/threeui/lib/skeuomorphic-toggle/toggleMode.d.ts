export type ToggleMode = "dark" | "light";
export type ToggleModePreference = ToggleMode | "auto";
export declare function readAutomaticToggleMode(): ToggleMode;
export declare function useToggleMode(preference: ToggleModePreference): ToggleMode;
export declare function clamp(value: number, minimum: number, maximum: number): number;
//# sourceMappingURL=toggleMode.d.ts.map