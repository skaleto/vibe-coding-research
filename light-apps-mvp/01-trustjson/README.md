# TrustJSON — Local, Zero-Tracking JSON Viewer (Chrome MV3)

> **100% local. Zero network requests. Open source. Handles 50MB JSON without freezing.**

A Chrome / Edge extension (Manifest V3) that views, formats, and searches JSON
entirely in your browser. Built as the trustworthy replacement after the popular
*JSON Formatter* extension (2M+ installs) turned closed-source and started
injecting a donation popup + geolocation tracking in early 2026.

Unlike what that extension did, **TrustJSON never injects ads, never tracks you,
never phones home.** It declares `connect-src 'none'` and requests **no host
permissions** — the only permission it asks for is `storage` (to remember your
light/dark theme). You can verify all of this: read the source, check the
manifest, and watch DevTools → Network show **zero requests** while you use it.

---

## Load it (developer mode — no build step required)

This is a pure static extension. Nothing to compile.

1. Open `chrome://extensions` (or `edge://extensions`).
2. Toggle **Developer mode** (top-right).
3. Click **Load unpacked**.
4. Select this folder: **`01-trustjson/`** (the one containing `manifest.json`).
5. The TrustJSON icon appears in your toolbar. Click it to open the viewer in a
   new tab.

To load a different JSON later, click the toolbar icon again, or use the **New**
button inside the viewer.

> **Optional — take over `.json` URLs:** TrustJSON ships a small, narrowly-scoped
> content script that runs **only** on URLs ending in `.json`. When you navigate
> to a raw `.json` page it shows a dismissible "Open in TrustJSON" banner. It
> makes no network requests and reads only the bytes already on the page. If you
> prefer **zero** content scripts, delete the `"content_scripts"` block from
> `manifest.json` and reload — the standalone viewer still works fully.
> For `file:///*.json` to work you must also enable
> "Allow access to file URLs" for the extension in `chrome://extensions`.

---

## Features (MVP / free)

- **Load JSON** three ways: paste, open a file, or drag & drop onto the page.
- **Tree view** with collapse/expand, indentation, child counts, and
  **type coloring** (string / number / boolean / null / object / array).
- **Large-file performance** — Web Worker parsing + virtual scroll. A 50MB file
  parses in ~150ms and the DOM stays tiny regardless of file size (see below).
- **Search** keys and values with highlight + previous/next match navigation
  (`Enter` / `Shift+Enter`); matches auto-expand their ancestors.
- **Copy**: right-click any node to copy its **value**, **JSON path**
  (e.g. `data.users[0].name`), key, or the whole node as JSON.
- **Beautify ⇄ Minify** raw text view.
- **Error location** — invalid JSON reports the **line and column** with a
  caret-pointed snippet.
- **Light / dark theme** — follows your system by default; click ◐ to cycle
  Auto → Light → Dark (remembered).
- **Keyboard nav**: ↑/↓ move, →/← expand/collapse, `Enter` toggles, `Ctrl/Cmd+C`
  copies the selected value, `/` focuses search.

### Pro (V2 — placeholders only in this MVP)

The toolbar shows `Diff`, `jq`, and `JWT` buttons tagged **Pro**. In the MVP they
display a "coming soon" toast. Planned for the paid one-time-purchase tier:
side-by-side diff, jq / JSONPath queries, JWT/Base64 auto-decode, hundreds-of-MB
streaming, NDJSON, and CSV export. All designed to run **100% locally** too.

---

## How the large-file performance works

The headline claim is "50MB without freezing." Two techniques make it true:

1. **Parsing in a Web Worker** (`worker.js`). `JSON.parse` runs off the main
   thread, so the UI never freezes while a big file is parsed. A "Parsing…"
   status shows meanwhile.
2. **Virtual scroll over a flat, lazily-materialized model** (`tree.js`,
   `viewer.js`). The tree is flattened into an array of *visible rows*.
   **Collapsed subtrees are never materialized.** Only the rows inside the
   scroll viewport (a few dozen) ever become DOM elements. Containers with more
   than 1000 immediate children are chunked behind a "Load more" row, so even a
   200,000-element array can't create 200,000 rows at once.

Result: the number of DOM nodes is bounded by the viewport size and is
**decoupled from the file size**. This is the difference between TrustJSON and
the many viewers that build the whole tree and crash on big files.

Measured locally (Node + headless Chrome, see *Self-verification*):

| File | `JSON.parse` | Build model | Initial visible rows |
|---|---|---|---|
| 8.3 MB / 60k users | ~33 ms | <1 ms | 3 |
| 50.8 MB / 175k users | ~160 ms | <1 ms | 4 |

---

## Privacy

- **No network code.** There is no `fetch`, `XMLHttpRequest`, `WebSocket`,
  `sendBeacon`, `EventSource`, or remote `import()` anywhere in the shipped code.
  (The repo includes a grep-based check; every match for those words is a comment
  asserting their absence.)
- **CSP `connect-src 'none'`.** The extension's pages are forbidden by policy
  from opening any network connection.
- **No host permissions, no `<all_urls>`.** The only permission is `storage`
  (theme preference). The optional content script matches **only** `*.json` URLs.
- **No analytics, telemetry, third-party SDKs, remote fonts, or CDNs.**
- **Verify it yourself:** open DevTools → Network and use the viewer — nothing
  fires. Read `manifest.json` and the source. That auditability is the point.

---

## Self-verification

No build step. From this folder:

```bash
npm run check      # validates manifest (MV3 + minimal perms) AND runs core tests
# or individually:
npm run validate   # node test/validate-manifest.mjs
npm test           # node test/run-tests.mjs   (tree model + 50MB-class stress)
```

- `test/run-tests.mjs` — 31 assertions over the **same `tree.js`** the extension
  uses, including a multi-MB stress test proving the flat model stays tiny and
  `revealPath` to the last element of a huge array is fast.
- `test/validate-manifest.mjs` — asserts `manifest_version: 3`, minimal
  permissions, no `host_permissions`, `connect-src 'none'`, and that every
  referenced file exists.
- `test/browser-test.html` — open directly in any browser (no extension needed)
  to run the core model + a stress test in a real engine. Results render on the
  page.
- `test/sample-large.json` (~3.6 MB) and `test/sample-invalid.json` — drag the
  first into the loaded extension to feel the performance; load the second to see
  line/column error reporting.

> The `test/` folder and `package.json` are for development only and do not
> affect the extension's runtime behavior. They can be omitted when packaging for
> the Web Store.

---

## File layout

```
01-trustjson/
├── manifest.json     MV3 manifest — minimal permissions, connect-src 'none'
├── background.js     Service worker: opens the viewer on icon click (no network)
├── viewer.html       Standalone viewer page (the main entry)
├── viewer.js         UI controller: render loop, virtual scroll, search, copy, theme
├── worker.js         Web Worker: JSON.parse off-thread + precise error location
├── tree.js           Pure tree model: flatten, expand/collapse, paths, search-reveal
├── content.js        Optional: dismissible "Open in TrustJSON" banner on *.json pages
├── styles.css        Light/dark themes + type colors + virtual-scroll layout
├── icons/            16/32/48/128 PNG icons
└── test/             Dev-only self-tests and sample files
```

---

## Known limitations (MVP)

- **Pro features are placeholders.** Diff, jq/JSONPath, JWT/Base64 decode,
  NDJSON, and CSV export are not implemented yet (buttons show "coming soon").
- **`JSON.parse` (not streaming) yet.** The MVP uses the native parser in a
  Worker, which comfortably handles tens of MB. Truly huge files (hundreds of MB)
  will be addressed by a streaming parser in the Pro tier; very large inputs are
  still bounded by available memory for the parsed object.
- **"Expand all" is capped** at ~200,000 rows on purpose — fully expanding a
  monstrous file would defeat virtualization. Beyond the cap, expand nodes
  individually.
- **Search is capped** at 5,000 matches (shown as `N+`) to keep huge files
  responsive. Refine the term to narrow results.
- **Icons are simple placeholders** (generated `{ }` glyph). Swap in branded art
  before publishing.
- **No persistence of the last document** — closing the tab clears it (by
  design; nothing is written to disk or the network).
- The optional `file:///*.json` takeover requires the user to enable
  "Allow access to file URLs" in `chrome://extensions`.

---

## License

MIT. Read the source, fork it, audit it. That's the whole idea.
