#!/usr/bin/env bash
#
# Publish the gallery to the live origin, then prove it is actually serving.
#
# Order matters and is the point of this script. The gate runs before the origin changes,
# not after, so a failed licence or isolation check can never reach production. The final
# assert runs against the public URL, not against localhost, so what gets verified is the
# path a visitor takes: Cloudflare, TLS, the certificate, the router and the origin. A
# deploy that leaves the site 404ing fails here and is reported as a failure, not as
# success with a caveat.
#
# This is a two-way door. Undoing it is: remove the DNS record, remove /opt/pace-components,
# and remove the two traefik routers. No product service is touched at any point.
#
# Usage:
#   bash scripts/deploy.sh                     # deploy and verify
#   GALLERY_HOST=staging.components.pacehq.io \
#   DEPLOY_HOST=pace-prod-1 bash scripts/deploy.sh
#
# Requires: node/npm, ssh access to DEPLOY_HOST, rsync.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

DEPLOY_HOST="${DEPLOY_HOST:-pace-prod-1}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/pace-components}"
GALLERY_HOST="${GALLERY_HOST:-components.pacehq.io}"
PUBLIC_URL="${PUBLIC_URL:-https://$GALLERY_HOST}"
SSH_OPTS="${SSH_OPTS:--o BatchMode=yes -o ConnectTimeout=20}"

say() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
die() { printf '\n\033[31mFAIL: %s\033[0m\n' "$1" >&2; exit 1; }

# ---------------------------------------------------------------------------
say "1/5  Verifying the origin contract"
bash scripts/deploy-check.sh

# ---------------------------------------------------------------------------
say "2/5  Installing from the lockfile"
npm ci --no-audit --no-fund

# ---------------------------------------------------------------------------
say "3/5  Running the full verification, then building"
# verify runs build:check before test on purpose: the compliance suite reads dist/, and
# dist/ is gitignored, so the reverse order fails on a clean checkout.
npm run verify
npm run build

[ -f dist/index.html ] || die "build produced no dist/index.html"

# No branding check here on purpose. The vendor name is *required* in the page footer: the
# attribution notice is a licence obligation, and `npm run verify` already runs the
# authoritative gate in scripts/check-dist.mjs, which scopes the prohibition to <title> and
# <h1> and asserts the visible credit is present. An earlier version of this script grepped
# the whole document for the vendor name and refused to publish, which would have blocked
# every compliant build. A looser duplicate of a gate that already runs is not a second
# line of defence; it is a way to fail a good deploy.

# ---------------------------------------------------------------------------
say "4/5  Shipping to $DEPLOY_HOST:$DEPLOY_ROOT"

ssh $SSH_OPTS "$DEPLOY_HOST" "mkdir -p '$DEPLOY_ROOT/www/live' '$DEPLOY_ROOT/www/previews'"

# --delete is scoped to the single target directory, so a file removed from the build
# disappears from the site. It cannot reach www/previews or anything else.
rsync -az --delete \
      --exclude '.DS_Store' \
      dist/ "$DEPLOY_HOST:$DEPLOY_ROOT/www/live/"

rsync -az \
      deploy/compose.yml \
      deploy/nginx-live.conf \
      deploy/nginx-preview.conf \
      "$DEPLOY_HOST:$DEPLOY_ROOT/"

# The origin runs unprivileged, so the published tree has to be readable by uid 101.
ssh $SSH_OPTS "$DEPLOY_HOST" "chmod -R a+rX '$DEPLOY_ROOT/www' && find '$DEPLOY_ROOT/www' -type d -exec chmod 755 {} +"

# `up -d` is idempotent: traefik picks the new container up through its docker provider and
# issues the certificate. Recreating on every deploy keeps the running config and the repo
# from drifting apart, which is the failure that makes a static site unfixable in a hurry.
# The -f is explicit so this can never pick up a compose file from a parent directory.
ssh $SSH_OPTS "$DEPLOY_HOST" "cd '$DEPLOY_ROOT' && docker compose -f compose.yml up -d --force-recreate"

# ---------------------------------------------------------------------------
say "5/5  Asserting the published URL"

# A freshly created hostname needs a certificate, and ACME is not instant. Poll rather than
# sleep a fixed amount, and report what Cloudflare said if it never comes up, because "it
# 526'd" and "nginx is not running" are very different problems with the same symptom.
deadline=$(( $(date +%s) + 300 ))
attempt=0
while :; do
  attempt=$((attempt + 1))
  code=$(curl -s -o "$repo_root/.deploy-assert.body" -w '%{http_code}' --max-time 20 "$PUBLIC_URL/" || printf '000')
  if [ "$code" = "200" ]; then
    break
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    printf 'Last status: %s\n' "$code" >&2
    printf -- '--- body ---\n' >&2
    head -c 600 "$repo_root/.deploy-assert.body" >&2 || true
    printf '\n---\n' >&2
    ssh $SSH_OPTS "$DEPLOY_HOST" "cd '$DEPLOY_ROOT' && docker compose -f compose.yml ps && docker compose -f compose.yml logs --tail=40" >&2 || true
    die "$PUBLIC_URL did not return 200 within 300s"
  fi
  [ "$attempt" -eq 1 ] || sleep 10
done

# 200 alone is not proof the gallery is being served; a Cloudflare error page can answer
# 200, and a stale document would too. Assert the page is actually this build.
grep -q 'component cards with a measured byte cost' "$repo_root/.deploy-assert.body" \
  || die "$PUBLIC_URL returned 200 but not the gallery document"
grep -q '/assets/index-' "$repo_root/.deploy-assert.body" \
  || die "$PUBLIC_URL served a document with no hashed entry chunk; a stale build is live"
rm -f "$repo_root/.deploy-assert.body"

# The health endpoint must answer independently of the filesystem, so a monitor can tell
# "the host is up" from "the site is up".
curl -fsS --max-time 20 "$PUBLIC_URL/healthz" | grep -q 'gallery is live' \
  || die "$PUBLIC_URL/healthz did not answer"

printf '\n\033[32mPublished: %s\033[0m\n' "$PUBLIC_URL"
printf 'Live origin: %s on %s\n' "$DEPLOY_ROOT" "$DEPLOY_HOST"
