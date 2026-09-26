import {
  CARDS,
  CREDIT,
  SHARED_RUNTIME_GZIP,
  UPSTREAM_NOTICE,
} from '../cards/registry';
import { formatBytes } from '../lib/format';

/**
 * The credit line. MIT requires the notice to accompany the code, so the full notice ships in
 * `THIRD_PARTY_NOTICES.md` and a short form is rendered here, on the same page as the cards.
 * The upstream project is a source licensor, not a sponsor, so nothing on this page implies
 * endorsement and the product carries no vendor name.
 */
export function CreditFooter() {
  return (
    <footer className="footer">
      <div className="footer__stats">
        <div>
          <span className="footer__stat-value">{CARDS.length}</span>
          <span className="footer__stat-label">cards</span>
        </div>
        <div>
          <span className="footer__stat-value">{formatBytes(SHARED_RUNTIME_GZIP)}</span>
          <span className="footer__stat-label">shared runtime, gz</span>
        </div>
        <div>
          <span className="footer__stat-value">0</span>
          <span className="footer__stat-label">trackers, cookies, third-party requests</span>
        </div>
      </div>

      <section className="footer__notice" aria-labelledby="credit-heading">
        <h2 id="credit-heading">Credit and licence</h2>
        <p>
          Every component on this page is derived from <code>{CREDIT.package}</code> v{CREDIT.version},
          redistributed under the {CREDIT.license} licence, {CREDIT.copyright}. The full notice is
          reproduced in <code>THIRD_PARTY_NOTICES.md</code> in the repository, and every card is mapped
          to its source page in <code>attribution.json</code>.
        </p>
        <p>
          Three.js and React are redistributed unmodified under the MIT licence. No fonts are
          bundled. No item-derived asset that carries a third-party notice is used here; the
          known cases are recorded in <code>attribution.json</code> so the next person to add one
          knows what is owed.
        </p>
        <p className="footer__notice-detail">{UPSTREAM_NOTICE}</p>
        <p className="footer__legal">
          This is a source licence, not a trademark licence. This gallery is not affiliated with,
          endorsed by, or sponsored by the upstream project, and it is not a component library: it
          is a marketing page. The byte figure on each card is measured from the bundle this page
          was built from, not a vendor claim.
        </p>
      </section>
    </footer>
  );
}
