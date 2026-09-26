import type { ReactElement } from 'react';

import { BellFieldBackground } from '../../vendor/threeui/lib/bell-field/BellFieldBackground.js';
import { CondensationBackground } from '../../vendor/threeui/lib/condensation/CondensationBackground.js';
import { CrtBackground } from '../../vendor/threeui/lib/crt/CrtBackground.js';
import { DotMatrixBackground } from '../../vendor/threeui/lib/dot-matrix/DotMatrixBackground.js';
import { EmeraldHorizonBackground } from '../../vendor/threeui/lib/emerald-horizon/EmeraldHorizonBackground.js';
import { LaserVariants } from '../../vendor/threeui/lib/laser/LaserVariants.js';
import { LiquidFormBackground } from '../../vendor/threeui/lib/liquid-form/LiquidFormBackground.js';
import { LumenCta } from '../../vendor/threeui/lib/lumen-cta/LumenCta.js';
import { OrbitalSphereBackground } from '../../vendor/threeui/lib/orbital-sphere/OrbitalSphereBackground.js';
import { RibbonFieldBackground } from '../../vendor/threeui/lib/ribbon-field/RibbonFieldBackground.js';
import { GlassToggle } from '../../vendor/threeui/lib/skeuomorphic-toggle/GlassToggle.js';
import { StreamConvergenceBackground } from '../../vendor/threeui/lib/stream-convergence/StreamConvergenceBackground.js';
import { StructureFlowBackground } from '../../vendor/threeui/lib/structure-flow/StructureFlowBackground.js';
import { TempleNightScene } from '../../vendor/threeui/lib/temple-night/TempleNightScene.js';
import { TypographyVortexCanvas } from '../../vendor/threeui/lib/typography-vortex/TypographyVortexCanvas.js';
import { WarpFieldBackground } from '../../vendor/threeui/lib/warp-field/WarpFieldBackground.js';
import { AnimatedTopDock } from '../../vendor/threeui/lib/animated-top-dock/AnimatedTopDock.js';

/**
 * One live element per card. Every entry is a composable React component imported from the
 * vendored source tree: no entry renders an iframe document, and no entry reaches the network.
 *
 * Props are pinned per card rather than left at upstream defaults so that a card reads the same
 * in a 360 px grid cell as it does at 1600 px. `className` is passed by `CardStage`.
 */
export const CARD_RENDERERS: Readonly<Record<string, () => ReactElement>> = {
  'bell-field': () => <BellFieldBackground speed={0.6} emberAmount={0.8} brightness={1.05} />,
  'dot-matrix': () => <DotMatrixBackground speed={0.7} gridScale={44} pulseSpeed={0.5} opacity={0.4} />,
  'emerald-horizon': () => <EmeraldHorizonBackground speed={0.6} waveScale={1.1} glow={1.15} />,
  'orbital-sphere': () => <OrbitalSphereBackground speed={0.5} scale={1.05} haloOpacity={0.9} />,
  'structure-flow': () => <StructureFlowBackground speed={0.6} pointSize={2.4} opacity={0.85} />,
  'warp-field': () => <WarpFieldBackground speed={0.9} streakOpacity={0.7} brightness={1.1} />,
  'liquid-form': () => <LiquidFormBackground speed={0.7} morph={1.05} metal={0.9} camera={5.2} />,
  'ribbon-field': () => <RibbonFieldBackground speed={0.8} smoothing={0.04} brightness={1.05} />,
  condensation: () => <CondensationBackground speed={0.7} dropAmount={0.8} opacity={0.85} />,
  'stream-convergence': () => (
    <StreamConvergenceBackground speed={0.7} fidelity={0.6} brightness={1.1} />
  ),
  'temple-night': () => <TempleNightScene />,
  crt: () => <CrtBackground variant="terminal" speed={0.8} typeSpeed={26} motion={0.5} />,
  'atmospheric-blade': () => (
    <LaserVariants variant="atmospheric-blade" speed={0.8} density={0.7} length={0.8} />
  ),
  'typography-vortex': () => (
    <TypographyVortexCanvas phrase="AUTHORED, NOT ASSEMBLED / " speed={0.8} particleAmount={0.85} />
  ),
  'glass-toggle': () => <GlassToggle defaultOn label="Live render" size={1.15} speed={0.7} />,
  'lumen-cta': () => <LumenCta label="Request a walkthrough" mode="dark" variant="primary" ring />,
  'top-dock': () => <AnimatedTopDock variant="sable" proximity={130} spring={0.16} damping={0.86} />,
};
