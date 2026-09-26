#!/usr/bin/env bash
#
# Uptime check for the published gallery.
#
# The requirement is deliberately small: catch a 404 after a deploy. This does that and
# nothing more, because a monitor nobody reads is worse than no monitor, and because the
# only realistic failure for a static site with no runtime is "the origin is not serving
# the document".
#
# It checks the public URL rather than the origin, so what it reports is what a visitor
# gets: Cloudflare, TLS, the certificate, the router and the file. A green origin behind a
# broken certificate is an outage, and only the public path shows it.
#
# Two things are asserted, because either alone is a false all-clear:
#   1. the status is 200, and
#   2. the body is this gallery and not an error page or a stale document.
# A CDN or Cloudflare error page can answer with a 200, and a previously cached index.html
# will answer 200 long after a deploy has broken the build.
#
# Exit: 0 healthy, 1 unhealthy. That is the whole contract, so cron can act on it.
#
# Usage: bash scripts/uptime-check.sh
#        GALLERY_HOST=components.pacehq.io bash scripts/uptime-check.sh

set -uo pipefail

GALLERY_HOST="${GALLERY_HOST:-components.pacehq.io}"
PUBLIC_URL="${PUBLIC_URL:-https://$GALLERY_HOST}"
TIMEOUT="${TIMEOUT:-20}"

fail() {
  printf 'UNHEALTHY %s: %s\n' "$PUBLIC_URL" "$1" >&2
  exit 1
}

body=$(mktemp) || fail "could not create a temporary file"
trap 'rm -f "$body"' EXIT

code=$(curl -s -o "$body" -w '%{http_code}' --max-time "$TIMEOUT" "$PUBLIC_URL/" 2>/dev/null) || code="000"

if [ "$code" != "200" ]; then
  snippet=$(head -c 200 "$body" 2>/dev/null | tr '\n' ' ')
  fail "returned ${code:-no response}, expected 200${snippet:+ body: $snippet}"
fi

grep -q 'component cards with a measured byte cost' "$body" \
  || fail "returned 200 but the body is not the gallery document"

printf 'ok: gallery is live at %s\n' "$PUBLIC_URL"
exit 0
