import { cardsByCategory, type Card as CardModel } from '../cards/registry';
import { Card } from './Card';

export function GalleryGrid({ reducedMotion }: { reducedMotion: boolean }) {
  const groups = cardsByCategory();

  return (
    <div className="gallery">
      {groups.map((group) => (
        <section className="gallery__group" key={group.category} aria-labelledby={`cat-${group.category}`}>
          <h2 className="gallery__group-title" id={`cat-${group.category}`}>
            {group.label}
            <span className="gallery__count">{group.cards.length}</span>
          </h2>
          <div className="gallery__grid">
            {group.cards.map((card: CardModel) => (
              <Card card={card} key={card.id} reducedMotion={reducedMotion} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
