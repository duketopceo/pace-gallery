import { CARDS } from '../cards/registry';

const CARD_COUNT = CARDS.length;
const GPU_CARD_COUNT = CARDS.filter((card) => card.requiresGpu).length;

export function PageHeader() {
  return (
    <header className="masthead">
      <p className="masthead__eyebrow">Pace HQ</p>
      <h1 className="masthead__title">Interfaces that look authored, not assembled.</h1>
      <p className="masthead__lede">
        {CARD_COUNT} component cards, each with its own measured JavaScript cost printed on it. Every
        card is a composable React component, not a packaged web page in an iframe, and every card has
        a real still for the {GPU_CARD_COUNT} that need a GPU and for anyone who asks their system for
        reduced motion. Every card is credited on its face and the licence sits in the footer.
      </p>
      <p className="masthead__note">
        Static page. No runtime, no database, no analytics script, no cookie. Nothing on this page
        calls out to a third party.
      </p>
    </header>
  );
}
