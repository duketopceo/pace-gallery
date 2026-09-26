import { useEffect, useRef, useState } from 'react';
import type { Card } from '../cards/registry';
import { CARD_RENDERERS } from '../cards/presets';
import { detectWebGL2 } from '../lib/capability';
import { CardStill } from './CardStill';
import { RenderBoundary } from './RenderBoundary';

type StillReason = 'no-webgl2' | 'reduced-motion' | 'off-screen' | 'render-error';

const REASON_LABEL: Record<StillReason, string> = {
  'no-webgl2': 'still · no WebGL2 on this device',
  'reduced-motion': 'still · reduced motion requested',
  'off-screen': 'still · renders when scrolled into view',
  'render-error': 'still · live render failed, see console',
};

interface Props {
  card: Card;
  reducedMotion: boolean;
}

/**
 * Decides, per card, whether to mount the live component or show the still, and swaps between
 * them. Three rules, in priority order:
 *
 *   1. `prefers-reduced-motion: reduce`  -> still, always.
 *   2. the card needs a GPU and there is no WebGL2 -> still, always.
 *   3. the card has not been scrolled into view -> still, and nothing mounts until it has.
 *
 * A component that throws falls back to the still via `RenderBoundary` rather than taking the
 * page down with it.
 */
export function CardStage({ card, reducedMotion }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  // Both are read once during the first render rather than in an effect: they are properties of
  // the browser, not of anything React owns, and `detectWebGL2` caches its probe.
  const [hasWebGL2] = useState(() => detectWebGL2());
  const [inView, setInView] = useState(() => typeof IntersectionObserver === 'undefined');

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' },
    );
    observer.observe(host);
    return () => observer.disconnect();
  }, []);

  const render = CARD_RENDERERS[card.id];
  const gpuBlocked = card.requiresGpu && !hasWebGL2;
  const showLive = Boolean(render) && !reducedMotion && !gpuBlocked && inView && !failed;

  const reason: StillReason = reducedMotion
    ? 'reduced-motion'
    : gpuBlocked
      ? 'no-webgl2'
      : failed
        ? 'render-error'
        : 'off-screen';

  return (
    <div className="card-stage" ref={hostRef}>
      {showLive ? (
        <RenderBoundary
          onError={(message) => {
            console.error(`[pace-gallery] "${card.id}" failed to render: ${message}`);
            setFailed(true);
          }}
        >
          <div className="card-stage__live" data-card={card.id}>
            {render!()}
          </div>
        </RenderBoundary>
      ) : (
        <CardStill still={card.still} reason={reason} dimmed={reason === 'off-screen'} />
      )}
      <p className="card-stage__badge" data-visible={showLive ? 'false' : 'true'}>
        {showLive ? 'live' : REASON_LABEL[reason]}
      </p>
    </div>
  );
}
