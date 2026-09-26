# Third-party notices

This gallery redistributes third-party and upstream component source. The notices below travel
with the code. The full upstream texts are committed next to the code they cover, in
`vendor/threeui/`.

---

## Component source

Component source in this gallery is derived from `@designcodeio/threeui` version 1.2.0 and is
redistributed under the MIT License.

```
MIT License

Copyright (c) 2026 Meng To

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

Full text as published: [`vendor/threeui/LICENSE`](vendor/threeui/LICENSE).
Upstream third-party notices: [`vendor/threeui/THIRD_PARTY_NOTICES.md`](vendor/threeui/THIRD_PARTY_NOTICES.md).
Upstream asset and font notices: [`vendor/threeui/ASSET-LICENSES.md`](vendor/threeui/ASSET-LICENSES.md),
[`vendor/threeui/FONT-LICENSES.md`](vendor/threeui/FONT-LICENSES.md).

**This is a source licence, not a trademark licence.** This gallery is not affiliated with,
endorsed by, or sponsored by the upstream project, and it is not named after it. The vendored
source carries two documented mechanical modifications, recorded in
[`vendor/threeui/README.md`](vendor/threeui/README.md) and declared in
`vendor/threeui.manifest.json`: a token rename that keeps the upstream product name out of CSS
class names and font stacks, and the removal of an inlined `@font-face` rule.

Every card is mapped to its source page and licence in
[`attribution.json`](attribution.json), and that mapping is enforced by
`tests/attribution.test.ts`.

## React and React DOM

Redistributed unmodified under the MIT License. Copyright (c) Meta Platforms, Inc. and affiliates.

## Three.js

Redistributed unmodified under the MIT License. Copyright (c) 2010-2026 three.js authors.
Upstream copyright and SPDX headers are retained in the bundled runtime.

## NASA Blue Marble land mask — not used

The upstream source tree carries a NASA Blue Marble land-mask attribution inside its globe items.
No card in this gallery derives from those items, so no NASA notice is required for anything that
ships. The obligation is recorded in [`attribution.json`](attribution.json) so that the next
person to add a globe item knows it is owed.

## Bundled fonts — none shipped

The upstream package bundles fonts under the SIL Open Font License 1.1, one of which carries a
Reserved Font Name. This gallery strips the upstream inlined `@font-face` rule at vendor time and
ships **no font file and no base64 font payload**. Every typography-driven card renders with the
system UI and monospace stacks. No derivative in this repository uses a reserved font name.

## No other third-party code

There is no analytics vendor, no tag manager, no error reporter, no cookie, no client storage, and
no third-party subresource in the built page. The only outbound links are the per-card source
links to the upstream catalogue, which are ordinary `<a href>` navigations the visitor must
activate.
