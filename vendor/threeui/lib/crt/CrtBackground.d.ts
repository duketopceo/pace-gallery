import { CRT_VARIANTS, type CrtOptions } from "./crtRenderer";
import type { CrtVariant } from "./crtScreens";
export { CRT_VARIANTS };
export type { CrtVariant };
export type CrtBackgroundProps = Partial<CrtOptions> & {
    className?: string;
};
export declare function CrtBackground({ className, ...props }: CrtBackgroundProps): import("react").JSX.Element;
//# sourceMappingURL=CrtBackground.d.ts.map