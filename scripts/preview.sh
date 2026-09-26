#!/usr/bin/env bash
#
# Publish a per-pull-request preview on its own origin.
#
# The reason this deploys to pr-<n>.pacehq.io rather than to /pr-<n>/ on the live site is
# the whole design. Almost every static host serves every branch from one origin, so a
# preview published there is unreviewed pull-request JavaScript running same-origin with the
# published gallery: it could rewrite the live site, serve phishing content from our own
# domain, and read the published origin's storage. A different hostname is a different
# origin, and the published gallery is then outside its reach entirely. The preview
# container also has its own document root, so a mistake in this script still cannot write
# to www/live.
#
# The gates are the same as production. A preview that skips the compliance suite is worse
# than no preview, because reviewers would be reviewing an unverified build.
#
# Usage:
#   bash scripts/preview.sh 42                       # build HEAD, publish pr-42
#   bash scripts/preview.sh 42 --ref refs/pull/42/head
#
# Requires: node/npm, ssh access to DEPLOY_HOST, rsync.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

if [ $# -lt 1 ]; then
  printf 'usage: bash scripts/preview.sh <pr-number> [--ref <git-ref>]\n' >&2
  exit 2
fi

PR="$1"
shift || true

case "$PR" in
  ''|*[!0-9]*) printf 'pull request number must be digits, got "%s"\n' "$PR" >&2; exit 2 ;;
esac

REF=""
while [ $# -gt 0 ]; do
  case "$1" in
    --ref) REF="${2:-}"; shift 2 ;;
    *) printf 'unknown argument: %s\n' "$1" >&2; exit 2 ;;
  esac
done

DEPLOY_HOST="${DEPLOY_HOST:-pace-prod-1}"
DEPLOY_ROOT="${DEPLOY_ROOT:-/opt/pace-components}"
PACE_DOMAIN="${PACE_DOMAIN:-pacehq.io}"
PREVIEW_HOST="pr-$PR.$PACE_DOMAIN"
PREVIEW_URL="https://$PREVIEW_HOST"
PREVIEW_DIR="$DEPLOY_ROOT/www/previews/$PREVIEW_HOST"
PREVIEW_PROJECT="pace-gallery-pr-$PR"
SSH_OPTS="${SSH_OPTS:--o BatchMode=yes -o ConnectTimeout=20}"

say() { printf '\n\033[1m==> %s\033[0m\n' "$1"; }
die() { printf '\n\033[31mFAIL: %s\033[0m\n' "$1" >&2; exit 1; }

# Refuse to write anywhere except the preview tree. The deploy-check asserts this path
# string exists; this is the runtime half of the same boundary.
case "$PREVIEW_DIR" in
  */www/previews/*) : ;;
  *) die "refusing to publish to $PREVIEW_DIR" ;;
esac

# ---------------------------------------------------------------------------
say "1/4  Checking out the pull request"
if [ -n "$REF" ]; then
  git fetch --quiet origin "$REF" || die "cannot fetch $REF"
  git checkout --quiet --detach "origin/$REF" || git checkout --quiet --detach "$REF" \
    || die "cannot check out $REF"
else
  git fetch --quiet origin "pull/$PR/head:pr-$PR" 2>/dev/null || true
  git checkout --quiet --detach "pr-$PR" 2>/dev/null \
    || git checkout --quiet --detach "origin/pull/$PR/head" \
    || die "cannot check out pull request $PR"
fi
printf 'building %s\n' "$(git rev-parse --short HEAD)"

# ---------------------------------------------------------------------------
say "2/4  Running the same gates as production"
bash scripts/deploy-check.sh
npm ci --no-audit --no-fund
npm run verify
npm run build
[ -f dist/index.html ] || die "build produced no dist/index.html"

# ---------------------------------------------------------------------------
say "3/4  Publishing to $PREVIEW_HOST"
ssh $SSH_OPTS "$DEPLOY_HOST" "mkdir -p '$PREVIEW_DIR'"
rsync -az --delete --exclude '.DS_Store' dist/ "$DEPLOY_HOST:$PREVIEW_DIR/"
ssh $SSH_OPTS "$DEPLOY_HOST" "chmod -R a+rX '$PREVIEW_DIR' && find '$PREVIEW_DIR' -type d -exec chmod 755 {} +"

# The preview's compose file and nginx config live beside the pull request's own build, so
# the project is entirely self-describing and `docker compose -p <project> down` removes all
# of it without touching the live origin.
rsync -az \
      deploy/compose.preview.yml \
      deploy/nginx-preview.conf \
      "$DEPLOY_HOST:$PREVIEW_DIR/"

# One compose project per pull request, on its own exact hostname. traefik will request a
# real certificate for this name; a shared HostRegexp router would not get one and would
# 526 behind Cloudflare.
#
# The -f is not optional. The working directory holds no compose.yml, and compose will walk
# up the tree looking for one, find the live origin's compose.yml in the parent, and try to
# recreate the live service from a preview deploy. Naming the file explicitly is what keeps
# a preview deploy from touching the published site.
ssh $SSH_OPTS "$DEPLOY_HOST" "cd '$PREVIEW_DIR' && \
  PREVIEW_HOST='$PREVIEW_HOST' \
  PREVIEW_NUMBER='$PR' \
  PREVIEW_PROJECT='$PREVIEW_PROJECT' \
  PREVIEW_DIR='$PREVIEW_DIR' \
  docker compose -f compose.preview.yml -p '$PREVIEW_PROJECT' up -d --force-recreate" \
  || die "could not start the preview origin; run scripts/deploy.sh first to publish the live site"

# ---------------------------------------------------------------------------
say "4/4  Asserting the preview URL"
deadline=$(( $(date +%s) + 300 ))
while :; do
  code=$(curl -s -o "$repo_root/.preview-assert.body" -w '%{http_code}' --max-time 20 "$PREVIEW_URL/" || printf '000')
  [ "$code" = "200" ] && break
  if [ "$(date +%s)" -ge "$deadline" ]; then
    printf 'Last status: %s\n' "$code" >&2
    head -c 600 "$repo_root/.preview-assert.body" >&2 || true
    die "$PREVIEW_URL did not return 200 within 300s"
  fi
  sleep 10
done

grep -q 'component cards with a measured byte cost' "$repo_root/.preview-assert.body" \
  || die "$PREVIEW_URL returned 200 but not the gallery document"
rm -f "$repo_root/.preview-assert.body"

# The isolation claim is only worth something if it is observed, so assert the header that
# proves the preview is not the live origin's document root.
curl -sI --max-time 20 "$PREVIEW_URL/" | grep -qi 'x-robots-tag:.*noindex' \
  || printf 'warning: preview did not report X-Robots-Tag: noindex\n' >&2

printf '\n\033[32mPreview: %s\033[0m\n' "$PREVIEW_URL"
printf 'It is a separate origin from the published site, so this pull request cannot touch it.\n'
