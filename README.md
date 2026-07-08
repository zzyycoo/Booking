# Booking

A booking email generator — **Version 2.1.8** (Hotel Room / Car / Golf / Bus + PID database + Google Sheets + PWA)

# Trigger rebuild Sat Mar 21 03:46:12 PM CST 2026

---

## Current Version: **2.1.8**

Last updated: **2026-07-08**

### Changelog V2.1.8 (2026-07-08)
- Bump `CACHE_VERSION` 2.1.4 → 2.1.8 (skipped 2.1.5 / 2.1.6 / 2.1.7 per user preference)
- Forces one fresh fetch of `index2.html` from network on next page load
- No code behavior change — only cache busting
- Version bump rolled to: `<meta name="version">` + `<title>` + page subtitle + all changelog refs + console logs + service worker cache

### Changelog V2.1.4 (2026-07-05)
- **Save to Sheets: switch from hidden iframe back to hidden img beacon** (desktop + iOS PWA both work)
- img is more permissive cross-origin than iframe — no sandbox / cookie policy issues
- Replace fake-success `setTimeout(2000)` with real `onload`/`onerror` + 5s timeout detection
- User now sees real failure messages if Apps Script URL is down or network is broken
- ⚠️ URL length: 10 guests ≈ 2.2KB, safe; 20+ guests ≈ 4KB, still safe in Chrome but may hit iOS Safari ~80KB cap

### Changelog V2.1.3 (2026-07-05)
- Bump `CACHE_VERSION` 2.1.2 → 2.1.3 to force-clear stale 2.1.1 cache on user devices
- Forces one fresh fetch of `index2.html` from network on next page load
- No code behavior change — only cache busting
- Version bump rolled to: `<meta name="version">` + `<title>` + page subtitle + all changelog refs + console logs + service worker cache

### Changelog V2.1.2 (2026-07-04)
- PID database persists to `localStorage` (~600KB) — no re-import on reload
- Auto-restore: page load reads `booking-pid-db` from `localStorage`, fills `Map`, shows "✅ N records restored (local)"
- Save trigger: `finishImport()` writes Map → `localStorage` after each successful import
- Manual Re-import still works (overwrites saved data)
- Subtitle corrected from V2.0.60 → V2.1.0 → V2.1.1 → V2.1.2

### Changelog V2.1.0
- PWA: full offline support. Vendor JS/CSS (xlsx + litepicker) now bundled locally
- Service Worker: network-first for HTML, cache-first for assets, navigation fallback
- No more CDN dependency at runtime — works 100% offline after first visit

---

## Files

| File | Purpose |
|---|---|
| `index2.html` | Main app (PWA entry point — version-checked) |
| `index.html` | Legacy entry point (no PWA) |
| `sw.js` | Service Worker (cache version = `v2.1.8`) |
| `manifest.webmanifest` | PWA manifest |
| `vendor/` | Bundled JS/CSS (xlsx, litepicker) — offline support |
| `_redirects` / `_headers` | Netlify-style config |

## How update works (built into the app)

1. User clicks **🔄 Check Update** → app fetches `https://raw.githubusercontent.com/zzyycoo/Booking/root/index2.html`
2. Compares remote `<meta name="version">` vs local `_getPageVersion()`
3. If different → toast "🆕 New version: X (you have Y)"
4. User clicks **⚡ Force Update** → app fetches + writes to `localStorage.pendingUpdate` + reloads
5. Service Worker (`sw.js`) checks its `CACHE_VERSION` — if changed from previous, it deletes the old `akang-tool-*` cache and re-fetches everything fresh

> ⚠️ If update still shows old version after Force Update, do a **hard reload** (Ctrl+Shift+R / Cmd+Shift+R) or DevTools → Application → Service Workers → **Unregister**.

## License

MIT