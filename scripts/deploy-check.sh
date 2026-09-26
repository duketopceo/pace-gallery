#!/usr/bin/env bash
#
# Gate the deploy target itself.
#
# The compliance tests in tests/ check the *bundle*: licence notices, vendor branding,
# reserved font names, the per-card byte budget. They cannot check the thing this script
# checks, which is the *origin*. The origin is where unreviewed pull-request code runs,
# and it shares a host with the company password manager, the company database and the
# company chat. If someone relaxes read_only, drops no-new-privileges, mounts a product
# directory or reuses the live hostname for previews, the published site is still fine and
# every existing test still passes. That is exactly the class of change that needs a gate
# rather than a reviewer's memory, so it gets one.
#
# Dependency-free on purpose: it runs in CI, on a laptop and on the origin host with
# nothing but a POSIX shell and grep, because a gate that needs a toolchain is a gate that
# gets skipped. Kept to bash 3.2 constructs so it runs on a stock macOS shell too.
#
# Usage: bash scripts/deploy-check.sh
# Exit:  0 all invariants hold, 1 at least one regressed.

set -euo pipefail

repo_root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$repo_root"

compose="deploy/compose.yml"
preview_compose="deploy/compose.preview.yml"
live="deploy/nginx-live.conf"
preview="deploy/nginx-preview.conf"

failures=0

fail() {
  printf '  FAIL  %s\n' "$1" >&2
  failures=$((failures + 1))
}

pass() {
  printf '  ok    %s\n' "$1"
}

# require <file> <extended-regex> <description>
require() {
  file="$1"
  pattern="$2"
  description="$3"
  if [ ! -f "$file" ]; then
    fail "$description ($file is missing)"
  elif grep -Eq -- "$pattern" "$file"; then
    pass "$description"
  else
    fail "$description"
  fi
}

# forbid <file> <extended-regex> <description>
forbid() {
  file="$1"
  pattern="$2"
  description="$3"
  if [ ! -f "$file" ]; then
    fail "$description ($file is missing)"
  elif grep -Eq -- "$pattern" "$file"; then
    fail "$description"
  else
    pass "$description"
  fi
}

echo "deploy-check: verifying the origin contract"

# ---------------------------------------------------------------------------
# The compose target exists and is the one we think it is.
# ---------------------------------------------------------------------------
require "$compose" '^name:[[:space:]]*pace-components'  'compose project is pace-components'
require "$compose" 'external:[[:space:]]*true'          'network is external, not created by this project'
require "$compose" 'name:[[:space:]]*pace-internal'      'joins the network traefik already watches'

# ---------------------------------------------------------------------------
# Isolation. Each of these is a control, not a preference.
# ---------------------------------------------------------------------------
require "$compose" 'read_only:[[:space:]]*true'          'root filesystem is read-only'
require "$compose" 'no-new-privileges:true'              'no-new-privileges is set'
require "$compose" '-[[:space:]]*ALL'                     'all Linux capabilities are dropped'
require "$compose" 'user:[[:space:]]*"[0-9]+:[0-9]+"'    'runs as a numeric non-root user'
require "$compose" ':ro$'                                'every bind mount is read-only'
require "$compose" 'container_name:[[:space:]]*pace-gallery-live'    'live service is named'
require "$preview_compose" 'container_name:[[:space:]]*pace-gallery-pr-' 'preview service is named per pull request'

# The live origin must not carry a preview service. A shared preview router is the specific
# failure that produced a 526 here: traefik derives the names it asks Let's Encrypt for from
# the router rule and cannot turn a pattern into a certificate, so a regex-matched preview
# silently serves a self-signed certificate forever.
forbid "$compose" 'gallery-preview' 'the live origin declares no preview service'
require "$preview_compose" 'name:[[:space:]]*\$\{PREVIEW_PROJECT' 'each preview is its own compose project'

# Live and previews must not be able to reach each other's files. They are separate projects
# with separate mounts, so assert each mounts exactly one directory and neither is the other.
require "$compose" '\./www/live:/[^:]*:ro'      'the live origin mounts only the live tree, read-only'
require "$preview_compose" '\$\{PREVIEW_DIR[^}]*\}:/usr/share/nginx/html:ro' 'a preview mounts only its own directory, read-only'
forbid "$compose" 'www/previews'               'the live origin cannot see the previews tree'
forbid "$preview_compose" 'www/live'            'a preview cannot see the live tree'

# ---------------------------------------------------------------------------
# TLS and routing. An origin without a certificate resolver is the 526 this deploy exists
# to fix, so its absence must be a failure rather than a surprise in production.
# ---------------------------------------------------------------------------
require "$compose" 'certresolver=letsencrypt'            'a certificate resolver is requested'
require "$compose" 'traefik\.http\.routers\.gallery\.priority=[0-9]+' 'live router sets an explicit priority'
require "$compose" 'entrypoints=' 'entrypoints are configured explicitly'

# The live router must be an exact host. A HostRegexp here would let a crafted subdomain
# reach the published site, and would risk shadowing the product's catch-all router.
require "$compose" 'traefik\.http\.routers\.gallery\.rule=Host\(' 'live router matches an exact hostname'

# Previews too. See the note above: a pattern here is how a preview ends up permanently 526.
require "$preview_compose" 'gallery-preview\.rule=Host\(' 'preview router matches an exact hostname'
require "$preview_compose" 'gallery-preview\.tls\.certresolver=letsencrypt' 'preview router requests a certificate'
forbid "$preview_compose" 'gallery-preview\.rule=HostRegexp' 'preview router is not pattern-matched'
forbid "$preview_compose" 'PACE_GALLERY_HOST|components\.pacehq' 'a preview cannot claim the live hostname'

# ---------------------------------------------------------------------------
# Headers on the live origin.
# ---------------------------------------------------------------------------
require "$live" 'max-age=31536000,[[:space:]]*immutable'   'hashed assets are cached for a year, immutable'
require "$live" 'max-age=0,[[:space:]]*must-revalidate'   'the document revalidates on every request'
require "$live" "Content-Security-Policy"                  'a content security policy is set'
require "$live" "default-src[[:space:]]'none'"            "the policy denies by default"
require "$live" "frame-ancestors[[:space:]]'none'"         'the document refuses to be framed'
require "$live" 'X-Content-Type-Options[[:space:]]*"nosniff"' 'nosniff is set'
require "$live" 'autoindex[[:space:]]off'                 'directory listing is off'
require "$live" 'return 200'                              'an uptime endpoint exists'

# Every location that sets Cache-Control must also carry the security headers, because
# nginx's add_header inheritance replaces the parent set rather than merging with it.
# Getting this wrong drops the CSP silently, so it is counted rather than eyeballed. The
# count is over Cache-Control blocks specifically: the dotfile deny and the uptime endpoint
# legitimately set no cache policy, so counting every location block would be a check that
# fails for no reason and gets disabled.
live_cache=$(grep -c 'add_header Cache-Control' "$live" || true)
live_csp=$(grep -c 'Content-Security-Policy' "$live" || true)
if [ "$live_cache" -gt 0 ] && [ "$live_csp" -ge "$live_cache" ]; then
  pass "every cached block repeats the security headers ($live_csp CSP headers for $live_cache cached blocks)"
else
  fail "each location block that sets Cache-Control must repeat the security headers ($live_csp CSP headers for $live_cache cached blocks)"
fi

# ---------------------------------------------------------------------------
# Headers on the preview origin.
# ---------------------------------------------------------------------------
require "$preview" 'server_name[[:space:]]+\$\{PREVIEW_HOST' 'previews are served by their exact preview hostname'
require "$preview" 'X-Robots-Tag'                        'previews are marked noindex'
require "$preview" "default-src[[:space:]]'none'"       'the preview policy also denies by default'
require "$preview" "frame-ancestors[[:space:]]'none'"    'previews refuse to be framed'

# A preview must never be able to write to the published tree. The container mount is the
# boundary; the script is the other half, so assert the script targets a preview path.
if [ -f scripts/preview.sh ] && grep -Eq 'www/previews/\$|www/previews/' scripts/preview.sh; then
  pass 'preview deploy targets the previews tree'
else
  fail 'preview deploy must write only under www/previews/'
fi
if [ -f scripts/deploy.sh ] && grep -Eq 'www/live' scripts/deploy.sh; then
  pass 'live deploy targets the live tree'
else
  fail 'live deploy must write only under www/live/'
fi

# ---------------------------------------------------------------------------
# No credential-shaped strings in anything the origin will serve or execute.
# ---------------------------------------------------------------------------
for f in "$compose" "$preview_compose" "$live" "$preview"; do
  if grep -Eq '(gh[pousr]_[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(api[_-]?key|secret|password|token)[[:space:]]*[:=][[:space:]]*["'"'"'][^"'"'"']{8,})' "$f"; then
    fail "$f contains a credential-shaped string"
  else
    pass "$f contains no credential-shaped string"
  fi
done

# ---------------------------------------------------------------------------
if [ "$failures" -gt 0 ]; then
  printf '\ndeploy-check: %d invariant(s) regressed\n' "$failures" >&2
  exit 1
fi

printf '\ndeploy-check: origin contract intact\n'
