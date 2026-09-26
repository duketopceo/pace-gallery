export type GlassParticleOptions = {
    count: number;
    thickness: number;
    dispersion: number;
    specular: number;
    rim: number;
    drift: number;
};
export declare const GLASS_PARTICLE_DEFAULTS: GlassParticleOptions;
export declare function createGlassParticleField(canvas: HTMLCanvasElement, getOptions: () => GlassParticleOptions): {
    resize: (cssWidth: number, cssHeight: number) => void;
    render: (now?: number) => void;
    setPointer: (x: number, y: number) => import("three").Vector2;
    dispose: () => void;
};
//# sourceMappingURL=glassParticleField.d.ts.map