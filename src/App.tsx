import { CreditFooter } from './components/CreditFooter';
import { GalleryGrid } from './components/GalleryGrid';
import { PageHeader } from './components/PageHeader';
import { useReducedMotion } from './lib/capability';

export function App() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="page">
      <a className="skip-link" href="#gallery">
        Skip to the cards
      </a>
      <PageHeader />
      <main id="gallery">
        <GalleryGrid reducedMotion={reducedMotion} />
      </main>
      <CreditFooter />
    </div>
  );
}
