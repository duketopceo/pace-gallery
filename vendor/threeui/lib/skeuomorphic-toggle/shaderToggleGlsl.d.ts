export declare const SHADER_TOGGLE_VERTEX = "\nattribute vec2 aPosition;\nvoid main() {\n  gl_Position = vec4(aPosition, 0.0, 1.0);\n}\n";
export declare function buildShaderToggleFragment(hasDerivatives: boolean): string;
//# sourceMappingURL=shaderToggleGlsl.d.ts.map