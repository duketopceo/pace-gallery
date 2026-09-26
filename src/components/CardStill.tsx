import type { StillDefinition } from '../cards/schema';

/**
 * The per-card still. This is what a visitor sees when the scene cannot run: no WebGL2 context,
 * `prefers-reduced-motion: reduce`, the card is off screen, or the component threw. It is CSS
 * only, ships no extra bytes, and is deliberately static in every one of those cases.
 *
 * It is an authored approximation of the component, not a screenshot of it. The card says so.
 */
export function CardStill({
  still,
  reason,
  dimmed = false,
}: {
  still: StillDefinition;
  reason: string;
  dimmed?: boolean;
}) {
  return (
    <div
      className="card-still"
      data-pattern={still.pattern}
      data-dimmed={dimmed ? 'true' : undefined}
      style={
        {
          '--still-from': still.from,
          '--still-via': still.via,
          '--still-to': still.to,
        } as React.CSSProperties
      }
      role="img"
      aria-label={`Still representation. Reason: ${reason}.`}
    >
      <span className="card-still__grain" aria-hidden="true" />
    </div>
  );
}
