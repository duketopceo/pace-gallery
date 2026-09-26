// Live check of the published no-analytics claim.
//
// `scripts/check-dist.mjs` and `tests/compliance.test.ts` already assert that the *built* page
// carries no third-party subresource. They cannot see this failure mode, because the thing they
// would catch here is added after the build: Cloudflare Web Analytics injects
// `static.cloudflareinsights.com/beacon.min.js` into the HTML at the edge. `dist/index.html` is
// clean, the deploy gate passes, and the published page still ships a third-party script tag.
// Nothing in the repository changes when that is switched on, so nothing in the repository fails.
//
// This script closes that gap by asserting against the served response instead of the artefact.
// It is deliberately network-dependent and therefore NOT part of `npm run verify`, which runs
// offline. Run it after any origin, DNS, hosting or Cloudflare change, and after any relaxation
// of the Content-Security-Policy.
//
//   node scripts/check-claim.mjs [url]            default https://components.pacehq.io/
//
//   1. the served document names no known telemetry host
//   2. the origin still sends a Content-Security-Policy, and its script-src allows no
//      third-party origin
//   3. the served document sets no cookie
//
// The two layers are asserted separately on purpose. Layer 1 is the claim; layer 2 is what has
// been keeping the claim true while Cloudflare injects anyway. Reporting both means a failure
// says which one broke, instead of only that something did.

/** Telemetry hosts that must never appear in the served document. */
const TELEMETRY_HOSTS = [
  'cloudflareinsights.com',
  'cloudflareinsights.com/cdn-cgi',
  'google-analytics.com',
  'googletagmanager.com',
  'analytics.google.com',
  'plausible.io',
  'matomo',
  'hotjar.com',
  'fullstory.com',
  'clarity.ms',
  'mixpanel.com',
  'segment.io',
  'segment.com',
  'amplitude.com',
  'posthog.com',
  'sentry.io',
  'intercom.io',
  'datadoghq.com',
]

const DEFAULT_URL = 'https://components.pacehq.io/'

/**
 * The request has to look like a browser navigation, or this check passes for the wrong reason.
 *
 * Cloudflare only injects the beacon into a top-level document navigation. A bare `curl` with no
 * `Accept` or `Sec-Fetch-*` headers is served the un-injected document, so a naive fetch reports
 * "clean" on a page that is in fact shipping a third-party analytics script. Reproduce the bug
 * with curl before you trust a green run from curl.
 */
const BROWSER_HEADERS = {
  accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'accept-language': 'en-US,en;q=0.9',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'none',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'user-agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
}

const failures = []
const fail = (m) => failures.push(m)

/** Every script source the served document asks the browser to load, plus the raw body. */
function servedSubresources(html) {
  return [...html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((m) => m[1])
}

function telemetryHits(html) {
  const found = []
  for (const host of TELEMETRY_HOSTS) {
    if (html.includes(host)) found.push(host)
  }
  return found
}

/**
 * The third-party origins `script-src` would actually let through, i.e. everything that is not
 * `'self'`, a nonce, a hash, `'strict-dynamic'` or `'unsafe-inline'`.
 */
function allowedScriptOrigins(csp) {
  const scriptSrc = csp
    .split(';')
    .map((d) => d.trim())
    .find((d) => /^script-src\b/i.test(d))
  if (!scriptSrc) return null
  const sources = scriptSrc.replace(/^script-src/i, '').trim().split(/\s+/)
  return sources.filter((s) => !/^('self'|'none'|'unsafe-inline'|'strict-dynamic'|'unsafe-eval|'(sha256|sha384|sha512)-[^']+'|nonce-[^']+')$/i.test(s))
}

async function main() {
  const url = process.argv[2] || DEFAULT_URL
  let res
  let html
  try {
    res = await fetch(url, { headers: BROWSER_HEADERS, redirect: 'follow' })
    html = await res.text()
  } catch (e) {
    console.error(`FAIL: could not fetch ${url}: ${e.message}`)
    process.exit(1)
  }

  if (!res.ok) fail(`${url} returned HTTP ${res.status}`)

  // 1. the served document names no known telemetry host
  const hits = telemetryHits(html)
  for (const host of hits) fail(`served HTML references a telemetry host: ${host}`)
  const scripts = servedSubresources(html)

  // 2. the origin still sends a CSP, and script-src allows no third-party origin
  const csp = res.headers.get('content-security-policy')
  let thirdPartyScriptOrigins = []
  if (!csp) {
    fail('the origin sent no Content-Security-Policy, so nothing blocks an injected script')
  } else {
    thirdPartyScriptOrigins = allowedScriptOrigins(csp) ?? []
    for (const source of thirdPartyScriptOrigins) {
      fail(`script-src allows a third-party origin: ${source}`)
    }
  }

  // 3. the served document sets no cookie
  const cookies = res.headers.getSetCookie?.() ?? []
  for (const cookie of cookies) {
    fail(`the served document sets a cookie: ${cookie.split('=')[0]}`)
  }

  const lines = [
    `url:        ${url}`,
    `status:     ${res.status}`,
    `server:     ${res.headers.get('server') ?? '(not reported)'}`,
    `csp:        ${csp ?? '(none)'}`,
    `scripts:    ${scripts.length ? scripts.join('\n            ') : '(none)'}`,
    `cookies:    ${cookies.length}`,
  ]
  console.log(lines.join('\n'))

  if (failures.length) {
    console.error(`\npublished-claim check FAILED (${failures.length}):`)
    for (const f of failures) console.error(`  - ${f}`)
    console.error(
      '\nThe page publishes "no runtime, no database, no analytics script and no cookie". ' +
        'That promise is held by configuration the repository does not own, so it has to be ' +
        're-checked from outside the build. See scripts/check-claim.mjs.',
    )
    process.exit(1)
  }
  console.log('\npublished-claim check PASSED: no telemetry host, CSP still script-src self-only, no cookie')
}

await main()
