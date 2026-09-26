import type { Card } from '../cards/registry';
import { formatBytes } from '../lib/format';
import { CardStage } from './CardStage';

export function Card({ card, reducedMotion }: { card: Card; reducedMotion: boolean }) {
  return (
    <article className="card" data-card-id={card.id} data-requires-gpu={String(card.requiresGpu)}>
      <CardStage card={card} reducedMotion={reducedMotion} />
      <div className="card__body">
        <header className="card__head">
          <h3 className="card__name">{card.name}</h3>
          <p className="card__bytes" title="Measured from the emitted bundle, gzipped.">
            <span className="card__bytes-value">{formatBytes(card.bytes.jsGzip)}</span>
            <span className="card__bytes-unit">JS gz</span>
            <span className="card__bytes-sep" aria-hidden="true">
              +
            </span>
            <span className="card__bytes-value">{formatBytes(card.bytes.assetBytes)}</span>
            <span className="card__bytes-unit">assets</span>
          </p>
        </header>
        <p className="card__description">{card.description}</p>
        <footer className="card__credit">
          <a href={card.sourceUrl} rel="noopener noreferrer nofollow" target="_blank">
            source
          </a>
          <span aria-hidden="true"> · </span>
          <span>{card.licence}</span>
          {card.additionalNotices.length > 0 ? (
            <details className="card__notice">
              <summary>item notice</summary>
              {card.additionalNotices.map((notice) => (
                <p key={notice}>{notice}</p>
              ))}
            </details>
          ) : null}
        </footer>
      </div>
    </article>
  );
}
