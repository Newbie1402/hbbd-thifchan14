# Birthday OS 3.0 upgrade plan

- [x] Phase 0 — audit the Vite/React app, current personalization, source assets, and existing checks.
- [x] Phase 1 — fix boot progress overlap, lightbox fit, settings row alignment, surprise replay spacing, and responsive overflow.
- [x] Phase 2 — add a server-only MinIO discovery API, numeric filename sorter, env template, dev proxy, cache, CORS/rate limits, and sorter tests.
- [x] Phase 3 — add Memories Library, Film, and Scrapbook views backed by the configured API with local asset fallback only when API is not configured.
- [x] Phase 4 — improve surprise and cake animation, timer cleanup, confetti origin, and reduced-motion behavior.
- [ ] Phase 5 — partial: add minimize/maximize and Spotlight; multiple windows, resizable windows, command whitelist terminal, notifications, and birthday quest remain.
- [ ] Phase 6 — partial: preserve existing responsive desktop/mobile and reduced-motion/accessibility behavior; visual parallax and a full accessibility pass remain.
- [x] Phase 7 — run lint, TypeScript/production build, unit/API tests, API smoke checks, and a desktop browser preview; record limitations in `docs/IMPLEMENTATION_REPORT.md`.

## Progress notes

- Phase 1: placed boot controls in a dedicated row, aligned Settings actions, added spacing under the Surprise reveal, and constrained lightbox photos to the viewport.
- Phase 2: added a server-side MinIO discovery API, numeric sorter, prefix filtering, duplicate preference, bounded scan, signed read URLs, in-memory cache, origin allowlist, rate limit, API check script, and sorter tests. The bucket is not configured, so remote discovery was not live-tested.
- Phase 3: added Memories Library, Film, and Scrapbook tabs backed by the API when configured and original bundled assets otherwise.
- Phase 4: added a staged gift reveal with box-centered confetti and timer cleanup; cake blow-out now emits confetti from the cake and shows smoke, with reduced-motion support.
- Phase 5: added a dock-restorable minimized window, maximize/restore, and searchable Spotlight on Cmd/Ctrl+K. A single foreground window is still used; other Phase 5 items remain unimplemented.
- Phase 7: lint, 6 UI tests, 3 API sorter tests, TypeScript/production build, and production dependency audit passed. Desktop browser preview was inspected; mobile browser layout and a live MinIO bucket were not verified.

## Audit notes

- Existing app: Vite + React + TypeScript SPA; no router, server, MinIO client, or state library.
- Existing entry point: `src/App.tsx`, with local component functions and a single modal app state; the current modal has desktop drag but no minimize/maximize or multiple windows.
- Personalization: `src/config/birthday.ts` and `VITE_BIRTHDAY_MESSAGE`; six original photos and two transparent illustrations under `assets-source/`.
- Existing tests: three React Testing Library interaction tests. No Playwright setup or external MinIO credentials/configuration are present.
- Preserve static asset fallback, recipient data, birthday note, original photos, privacy/noindex setup, and existing package scripts.
