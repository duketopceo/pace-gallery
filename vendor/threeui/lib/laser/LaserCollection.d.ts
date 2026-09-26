import type { NeuformBatchEffectProps } from "../neuform-isolated/NeuformBatchEffects";
import type { LaserVariantName } from "./LaserVariants";
export type LaserVariant = "matrix-field" | LaserVariantName;
export type LaserCollectionProps = Omit<NeuformBatchEffectProps, "mode" | "gap" | "strokeWidth"> & {
    variant?: LaserVariant;
};
export declare function LaserCollection({ variant, ...props }: LaserCollectionProps): import("react").JSX.Element;
//# sourceMappingURL=LaserCollection.d.ts.map