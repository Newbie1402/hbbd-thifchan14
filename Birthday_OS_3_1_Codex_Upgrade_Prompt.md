# BIRTHDAY OS 3.1 — CODEX IMPLEMENTATION MASTER PROMPT

> **ROLE:** Principal Frontend Engineer + Full-stack Engineer + Motion Designer + QA Engineer.
>
> **TASK:** UPGRADE THE EXISTING REPOSITORY IN PLACE. DO NOT CREATE A NEW PROJECT, DO NOT REPLACE EXISTING RECIPIENT DATA, AND DO NOT STOP AT WRITING A PLAN.
>
> **LANGUAGE:** Product copy is primarily Vietnamese; retain the existing cozy pastel IT-themed visual voice and proper names.

## 0. Absolute execution rules

1. First audit the actual repository and identify its framework, existing API service, routes, gallery/film implementation, MinIO integration, app-window state, Secret Note, Surprise/Cake, asset pipeline, tests, and deployment. Make changes based on the real code. Avoid a second competing API/database/auth implementation if an appropriate one already exists.
2. Preserve existing functional behavior, recipient **Nguyễn Thị Thuỳ Trang / Thuỳ Trang**, @thichannn where used, authentic photos, pastel theme, animations, and existing MinIO data. Never generate/repaint/beautify the face in the original photos.
3. Prioritize an actually working site over a visual mockup. No inert controls or fake success states. No destructive migration of stored photos.
4. Implement in phases below, verifying each phase. Run available lint, typecheck, tests, production build, and visually validate in a browser when possible. Fix errors immediately. If integration credentials are missing, deliver a working local mock/dev adapter + `.env.example`, and document blockers; never hardcode secrets.
5. Put user-configurable content and settings in one well-typed source (existing config or persisted server-side settings). Do not duplicate note strings or domains across components.
6. Use clean Controller/Service/Repository-style layering *conceptually* for API modules (routes/controllers -> services -> storage adapters); frontend function components + typed hooks. Use validation and safe errors. Maintain OS-style window manager, keep UI legible.

## 1. Existing problems: reproduce and fix before polishing

Evidence from current screenshots:
- `little_memories.gallery > Memory Film` at **Memory #9 / 48** visibly shows a landscape photo above and another photo below in **one active viewer**, with the lower photo clipped. This is an unacceptable film renderer defect. Investigate DOM stacking, duplicate slide mounts, flex-column positioning, translate transforms, and CSS animation transitions. Do **not** assume merely enlarging the container is a fix.
- Stage overflows or crops tall/portrait images. Fix it so the entire image can be seen without unintended crop at every aspect ratio (portrait 9:16, 3:4, square 1:1, landscape 16:9, panoramas).
- Film controls/thumbnails can slide partially off-window. All controls need keyboard, mouse, and touch affordances, responsive constraints, and clear active state.
- The Surprise final state is plain text with a simple pink vector. Upgrade to a compelling real multi-phase experience.
- Retain existing Secret Note design but replace draft copy with the exact approved text in §7.

**Hard acceptance criterion A:** Only ONE active full image occupies the cinematic film stage. During a crossfade, at most two correctly absolutely overlaid slides are mounted; never two visible images stacked in document flow. Every image uses a proper `contain` fit by default in the viewer, with a subtle blurred duplicate fill optionally behind it, not used as primary content. Preload adjacent assets. Never slice a face or cut an image to fit the container.

## 2. Libraries and implementation direction

Use stable compatible versions as resolved from the existing repo lockfile/runtime. Check current package and API docs before installation.

- **Gallery grid:** `react-photo-album` (`RowsPhotoAlbum` or `MasonryPhotoAlbum`) for Google Photos-like responsive layouts. Docs: https://react-photo-album.com/ and https://assets.react-photo-album.com/documentation
- **Photo viewer/lightbox:** `yet-another-react-lightbox` with `Zoom`, `Thumbnails`, `Slideshow`, `Fullscreen`, `Captions` plugins as appropriate. Its `carousel.imageFit` can be `contain`. Docs: https://yet-another-react-lightbox.com/documentation and https://yet-another-react-lightbox.com/plugins . Use a SINGLE source of truth for current index; memoize slide arrays so incidental rerenders do not reset playback.
- **Filmstrip itself:** custom slim UI around the same lightbox/photo model, allowing horizontal scroll, active thumbnail centering, keyboard arrow navigation, play/pause, timing and progress. Reuse lightbox controls where possible rather than reimplementing zoom/lightbox gestures.
- **Animations:** GSAP timeline and Motion only where necessary. Pick a single animation owner for each DOM element; do not attach competing GSAP and Motion transforms. Use CSS for subtle idle states.
- **Drag reorder admin:** `@dnd-kit` sortable (compatible version) or existing drag library. Must work with keyboard as well as pointer and have up/down alternatives.
- **QR images:** `qrcode` / `node-qrcode` supporting server PNG and browser share modal PNG. https://github.com/soldair/node-qrcode
- **Image thumbnails:** `sharp` on server, never face-retouch. **MinIO:** existing S3 client or minio-js on server only.
- **State:** follow existing Zustand/Context pattern; avoid unnecessary new state management stack.

Do not blindly add every package; prefer existing correct dependencies. No second independently timed slideshow overlay.

## 3. Memories 3.1 — Google Photos-like library + cinematic film + scrapbook

### 3.1 Photo Library

- Responsive grid with natural aspect ratios, beautiful gutters, virtualize or paginate if many images (target 1–500+ photos).
- Toolbar: Library | Memory Film | Scrapbook; search by caption (optional), item count, refresh, and clear loading/error states.
- Clicking any thumbnail opens a true full-screen-capable lightbox at that exact photo ID/index. Photo must be fully visible and zoom/pan works with touchscreen/trackpad.
- On desktop show a readable filename/caption, photo count and selected index without overlaying faces. On mobile implement touch swipe and pinch zoom.
- Dynamically load data from the same public API as Film, ordered according to admin order; no hardcoded 1.jpg... list.
- Preserve current featured Polaroid cards on Birthday Desktop, but clicking them opens the exact matching image in Gallery (stable photo IDs, not array indices that change after reorders).

### 3.2 Memory Film — priority 0

**Film UI**
- A single movie-stage image centered inside a max-width responsive frame, minimum wasted space, max-height constrained by `min(70dvh, viewport minus toolbar/title/filmstrip)`, without overflow. Use `max-width:100%; max-height:100%; width:auto; height:auto; object-fit:contain;` or the lightbox's built-in contain behavior.
- Backdrop: low-contrast, blurred copy of the active picture (`object-fit:cover`) under a dim overlay with accessible contrast. Main image is separate layer and never cropped. Behind imagery remains behind; no duplicate photo can read as the next slide.
- Filmstrip along bottom with horizontal scroll + snapping/auto-center for active thumbnail; correct aspect ratio preview; click targets comfortably sized. Never clips outside app window; left/right fade affordance if scrollable.
- Controls: previous, play/pause, next, speed 3s/5s/8s, repeat toggle, open original lightbox, fullscreen, counter N/total, optional hide UI while playing. Visual progress bar tied to actual timing.
- Crossfade transitions 400–650ms. Optional Ken Burns scale <= 1.035 / translation <= 1.5% only on background; main photo should NOT be enlarged/cropped. Pause on tab hidden, mouse/manual interaction and on lightbox launch when appropriate; cleanup timers and RAF on close/unmount.
- Changing speed preserves correct countdown; loops exactly if enabled; stops at last photo if loop disabled. Shuffle is NOT default. Maintain admin-defined ordering always.
- Preload next image + thumbnail. Handle failed/expired URLs with refresh/retry, placeholder and skip-to-next behavior; no infinite spinners.

**Responsive behavior**
- On a 390x844 mobile viewport, movie stage must fit between toolbar and filmstrip; actions collapse into an overflow menu rather than overflow offscreen; horizontal filmstrip scrolls independently.
- Tablet 768x1024 and desktop 1440x900 should display both photos and controls fully, with safe `dvh` and content flex layout. Absolutely no vertical two-image stacking.

### 3.3 Scrapbook

- A book-like responsive gallery that uses the exact same ordered photo data; pages contain 1–3 photos with Polaroid tape, handwritten-style caption, stickers; page-turn animations lightweight.
- Desktop spread 2 pages; mobile 1 page. Buttons and swipe for previous/next. Respect reduced-motion; all photos readable. Do not block normal Gallery/Film modes.

## 4. MinIO media administration at hidden route `/admin-setup-img`

### 4.1 Real admin page, not a public navigation link

- Route accessible by directly typing `https://<site>/admin-setup-img`. **Never display it in Birthday OS menus, Dock, footer, Spotlight, Terminal help, sitemap, or guest navigation.** `noindex, nofollow`. Obscure path is not security.
- Display a small polished username/password login form. After login: admin gallery, upload zone, preview, rename caption, alt text, reorder, visibility toggle, delete confirmation, replace file, refresh/sync, site settings, logout.
- Show live image previews and status. Multiselect batch upload, drag-and-drop, progress/error/retry, individual delete with confirmation. Protect against lost unsaved reorder changes. Add undo for reorder; optional safe-trash restore within 24h if feasible.
- Show current order number clearly; allow drag handle reorder AND numeric order input, Save Changes, Reset to filename-number order, and bulk resync. Reorder persists through reload and deploy.

### 4.2 MinIO model and data ordering

Existing desire: direct MinIO upload with keys `birthday/memories/1.jpg`, `2.png`, `10.webp` must initially sort numerically as `1,2,10` (not alphabetically `1,10,2`). Gaps are allowed.

But **manual drag reorder and numeric filenames are two separate concepts**. Do not rename S3 objects on every drag (breaks URLs, creates copy/delete races). Implement persisted metadata order in **SQLite** (if current backend already has a DB, reuse it instead) and define sync policy:

1. Scan only configured `MEMORIES_PREFIX` via server-side MinIO listing, support >1000 results and paging. Restrict to direct top-level allowed images; ignore thumbnails/generated objects, files outside prefix and non-images.
2. Identify by stable `objectKey` + S3 version/etag if available, plus a stable generated `id` persisted in DB.
3. On first discovery: parse numeric stem of exact filename format `^([1-9]\d*)\.(jpg|jpeg|png|webp|avif)$` case-insensitively; sort integer ascending (tie-break deterministic by key). Unsupported filename may be imported through Admin with an explicit order, but will not join auto-discovery unprompted.
4. Metadata schema: `{id,objectKey,filename,filenameIndex?,sortOrder,caption,alt,visible,mimeType,width,height,etag,createdAt,updatedAt}` and persistent site setting storage. Use migrations/constraints.
5. Persist manual order in DB transaction. Existing manual placements remain stable across refresh. Newly externally detected numbered files are **appended after manually ordered items**, sorted by numeric stem among newcomers. A button **Reset to filename order** intentionally recalculates sequence using numeric stems. Document these rules in Admin help.
6. If two files have equal numeric stem with different extensions, show an Admin conflict warning and deterministic tie-break, not undefined ordering. Do not overwrite files silently.
7. If an externally deleted object disappears, mark `missing` in admin, omit from public list, allow reconciliation; do not delete unrelated metadata/settings silently.
8. Public endpoints emit sorted **visible** images only. No secret MinIO config exposed. Public URLs can be presigned GET with refresh semantics or server-side media proxy. For short-lived signed URLs, refresh before expiry, and retain ETag-based cache behavior for thumbnails.
9. Create optimized thumbnails and responsive variants (e.g. 320/960/1600 max dimension) with `sharp` as needed, preserving originals; store derivatives under a distinct prefix and do not list them as memories. Respect EXIF rotation; no AI transformations.

### 4.3 Minimal API contract (adapt to existing route conventions)

**PUBLIC**
- `GET /api/public/memories` -> `{items:[{id,sortOrder,src,thumbnailSrc,srcSet?,width,height,alt,caption}],total,revision}`. Return only published objects; support conditional caching, pagination if needed.
- `GET /api/public/site-config` -> public-safe `{shareUrl?,shareReady,title,ogImageUrl?,questEnabled}`; do NOT include admin config or credentials.

**ADMIN** (every route server-authenticated)
- `POST /api/admin/auth/login` {username,password} -> server session cookie.
- `POST /api/admin/auth/logout`.
- `GET /api/admin/auth/me` -> session status.
- `GET /api/admin/images` list including hidden/missing.
- `POST /api/admin/images/upload` multipart validated image files, or presigned client uploads if proper CORS/security already exists.
- `POST /api/admin/images/sync` rescan MinIO + import numbered newcomers.
- `PATCH /api/admin/images/:id` {caption?,alt?,visible?,...} validated fields.
- `PUT /api/admin/images/order` `{orderedIds: string[]}` -> atomic order update; reject missing/unknown/duplicate IDs; concurrency token/revision if needed.
- `POST /api/admin/images/order/reset-to-filenames`.
- `DELETE /api/admin/images/:id` -> explicit MinIO delete or trash strategy, with confirmation in UI.
- `GET/PUT /api/admin/site-settings` -> `{publicBaseUrl,shareTitle,shareDescription,shareEnabled}`.

Public responses should not leak raw internal object keys if not necessary. Include API DTO validation schemas. Any error from MinIO should produce useful action messages without exposing secrets.

### 4.4 Authentication and security — simple UX, real protection

- Single-admin username/password is fine; NO roles, OAuth or enterprise IAM. But passwords are checked **only on the backend**; no hardcoded username/password in JS or `.env` shipped to browser.
- Provide `ADMIN_USERNAME`, `ADMIN_PASSWORD_HASH` (argon2id or bcrypt), `SESSION_SECRET` and `MINIO_*` in server-only environment. Provide script to hash a password; never store plaintext password or put secrets in `.env.example`.
- Use strong random opaque server-side sessions with signed/secure/HttpOnly/SameSite cookies and reasonable expiration, regenerate on login, invalidate on logout. Implement CSRF token/origin validation for mutating admin endpoints, and login rate-limit/lockout backoff. Avoid localStorage auth tokens.
- Restrict file type by sniffed MIME/magic bytes, max file count/size and pixel dimensions; sanitize/escape captions, prevent XSS, reject paths with traversal or keys outside prefix; no arbitrary URL fetch/SSRF. Restrict CORS, handle HTTP errors, avoid leaking stack traces.
- Public photo access is expected on this birthday site; admin credentials are private. Avoid creating public MinIO bucket policy if direct signed access/proxy suffices. Protect admin DELETE/UPDATE server-side (frontend-only route guard is inadequate).
- Restrict public API metadata to safe fields; admin page noindex but not considered a security boundary.

### 4.5 Deployability

- If current site is static Vite + existing MinIO API, extend that API. If fully static without backend, create minimal compatible Node/TypeScript API service with SQLite on a persistent volume and routes; host via same origin reverse proxy. Do not spin up Spring Boot solely for this page.
- Document Docker/compose/service env, SQLite persistent volume, backup/restore, MinIO read-write scoped policy, proxy routing `/api/*`, `/admin-setup-img`, `/share`, SPA fallback. Do not disrupt current domain.
- Development without MinIO credentials: mock adapter/seed photos for UX testing; production must not silently return fake images.

## 5. Birthday Quest — 4 stars, gentle discovery, no forced gate

A subtle small star/progress widget in the Birthday OS desktop, with progress `0/4` and accessible tooltips. Quest milestones:

1. `open_memories` — user views an image in Memories (not merely opening window).
2. `read_secret_note` — user actually opens/scrolls the letter or explicitly marks read (no intrusive tracking or time gating).
3. `blow_candles` — user triggers Cake's candle-out state.
4. `open_surprise` — user finishes the Surprise reveal.

- On first completion each star lights up, tiny pastel particles + OS toast. Idempotent milestone updates. No repeated confetti storm.
- Store per-browser versioned quest state in localStorage with a type-safe migration strategy; do not collect personal info or send analytics. Users can reset from Settings.
- At 4/4, new Desktop file `final_wish.md` materializes with a satisfying short spring/glow/reveal. Clicking opens a small paper/glass letter with a **new, gentle final wish**, not a demand for reciprocation or emotional obligation. Example: `Mong những ngày tới sẽ mang đến cho em thật nhiều niềm vui, và mong em luôn tự hào về con đường mình đã chọn. Happy Birthday, Trang ♡`.
- All primary app content remains accessible without quests. Help/Spotlight/Terminal can reveal quest progress but never unlock admin controls.
- Test quest idempotence, persistence, reset, no duplicate rewards, keyboard access, reduced-motion behavior.

## 6. Sharing, QR, Zalo Open Graph and deployment domain

### 6.1 Public UI

- Add a small tasteful **Share** icon at the top-right of Birthday OS/menu bar, with tooltip. Clicking opens a popover/glass card: Copy link, Share via native Web Share API if available, View QR, Download QR PNG, optional share-to-Zalo copy instructions. Prefer generic browser share; do not assert native Zalo deep-link support without testing.
- QR encodes the **actual deployed public HTTPS URL** configured by admin. No credentials, tokens, private admin routes, or tracking. Generate SVG/PNG with high error correction and a proper quiet zone; ensure phone cameras can scan it.
- If public domain is not configured, show a helpful "Chưa cấu hình link chia sẻ" state and let the site continue normally; do not generate a misleading `localhost` QR for a remote recipient.

### 6.2 Configure domain in admin

Add `Sharing & Domain` to `/admin-setup-img`:
- `Public Website URL` (e.g. `https://birthday.example.com`) required for public sharing; trim trailing slash and verify `https` and normal public domain (allow http localhost ONLY in explicit dev mode). Reject `javascript:`, credentials in URLs, local/private-address destinations in production. Never fetch untrusted external URLs to validate.
- Optional preview title, description, appearance and QR background theme; preview generated share card, scan test instructions, regenerate button, save/revision status.
- `shareUrl = canonical configured public URL + /share` (or public home URL if site already serves SSR Open Graph there), one canonical value shared by QR, Copy Link, `og:url` and text. Do not have mismatched URLs.

### 6.3 Zalo link preview: important platform limitation

Requirements:
- Produce server-rendered/HTML-first Open Graph tags: `og:title`, `og:description`, `og:url`, `og:type`, `og:image` with fully-qualified publicly accessible HTTPS URLs, plus `twitter:card` and a page `<title>`.
- Build a branded **1200×630 px PNG share preview**: pastel Ice Cyan + pink background, `A little birthday surprise for Thuỳ Trang ♡`, small readable subtitle, and a large high-contrast QR on one side. Avoid embedding the intimate Secret Note text into public metadata. Keep QR inside generous safe margins because some messengers crop preview.
- Implement `GET /share` with HTML containing Open Graph tags already rendered in initial server response, not injected only via React `useEffect` (bots may not run JS). Human visitors loading `/share` must get the actual Birthday OS and proper SPA boot, not a bot-only dead-end. Make paths correct under Vite and reverse proxy.
- Implement a public cacheable endpoint such as `GET /api/public/share-card.png` that emits QR-based preview generated for configured canonical URL; regenerate/invalidate cache whenever URL/title/description changes. It must not require login and must not expose server secrets.
- Provide separate QR PNG or SVG for direct scan/download. The Open Graph image is only an image: **Zalo determines the rendering and cropping**, and scanning QR from the unfurled thumbnail cannot be guaranteed. The link itself must remain clickable; QR downloadable/sharable as image is the guaranteed fallback.
- Verify raw `curl -L https://domain/share` contains tags and `og:image` is accessible from public internet after deployment; use Zalo link preview tester/manual Zalo sharing test if possible. Consider platform preview caching; document URL/query-version update strategies without promising automatic cache invalidation.

Official Zalo Open Graph guidance: https://stc-developers.zdn.vn/docs/v2/social-api/tham-khao/huong-dan-tao-lien-ket-de-chia-se
QR library: https://github.com/soldair/node-qrcode

## 7. REPLACE Secret Note text — exact approved content

Use this full content as the **default text** inside the actual Secret Note (`secret_note.md` or configured content) and ensure Vietnamese diacritics, line breaks and bold/italic styling render naturally. Do NOT change recipient name to a placeholder or mention she currently works outside IT. Do not add romantic pressure, assumptions, or a forced happy ending.

--- BEGIN BIRTHDAY NOTE ---

### Gửi Thuỳ Trang của anh ♡

Chúc mừng sinh nhật Thuỳ Trang của anh nhé! 🎂💗

Có lẽ chúng ta có duyên gặp gỡ, nhưng lại chưa đủ duyên để cùng nhau đi hết một chặng đường. Dù vậy, anh vẫn luôn trân trọng khoảng thời gian đẹp mà hai đứa đã có, những kỷ niệm và cả những cảm xúc mà chúng ta từng dành cho nhau.

Anh không biết sau này, khi mỗi người bước tiếp trên con đường riêng, liệu chúng ta có còn cơ hội đồng hành cùng nhau nữa hay không. Nhưng dù tương lai thế nào, anh vẫn mong rằng khi nhớ về nhau, cả hai đều có thể mỉm cười vì đã từng là một phần đẹp đẽ trong cuộc sống của người kia.

Hôm nay là sinh nhật em, tiếc là anh không thể có mặt để cùng em đón ngày đặc biệt này. Vậy nên anh đã chuẩn bị một món quà nho nhỏ, chính là trang web mà em đang xem đây. Không phải món quà gì lớn lao, chỉ là anh muốn dành chút thời gian và tâm sức để tạo nên một điều gì đó thật riêng cho em. Hy vọng nó sẽ khiến em vui, dù chỉ là một chút thôi. 💗

Bước sang tuổi mới, anh chúc em thật nhiều sức khỏe, bình an và may mắn. Mong rằng chặng đường phía trước sẽ mở ra cho em một chương mới thật rực rỡ, công việc ngày càng thuận lợi, sự nghiệp ngày càng thành công, những dự định ấp ủ rồi cũng sẽ lần lượt trở thành hiện thực.

Chúc em ngày càng xinh đẹp, rạng rỡ, yêu thương bản thân nhiều hơn và luôn có những ngày thật vui bên gia đình, bạn bè cùng những người mà em yêu quý.

Cuối cùng, cảm ơn em vì đã từng xuất hiện và mang đến cho anh những kỷ niệm đẹp.

**Chúc mừng sinh nhật em, Thuỳ Trang!** 🎉

*Mong tuổi mới sẽ thật dịu dàng với em, và mong em luôn hạnh phúc trên con đường mình chọn.*

**— Anh ♡**

--- END BIRTHDAY NOTE ---

UI behavior:
- Preserve Secret Note's elegant glass/paper look. Add enough natural vertical scrolling for long text; avoid massive fixed-height overflow and make all content readable on mobile.
- Keep Thả tim, Thổi nến, Kỷ niệm, Copy lời chúc actions working. Note reading participates in Birthday Quest. Copying must preserve actual text; never copy a placeholder.
- Keep copy centralized in editable file/config. Optional admin edit of note is OUT OF SCOPE unless existing functionality already supports it.

## 8. Surprise 3.1 cinematic overhaul

- Create a beautiful lightweight 2.5D present box using layered SVG/CSS 3D/optional Three.js **only if justified**; it should have depth, shadows, ribbon folds, glossy material and real lid separation.
- State machine: `idle` -> `anticipation` (~0.6s shake/glow) -> `burst` (~0.9s lid flies, radial burst, streamers/hearts/confetti at box center) -> `reveal` (~1.5s gift/message emerges and flips) -> `afterglow` -> `completed`.
- Confetti emits from actual box element bounding rectangle, physically disperses around viewport, including acceleration/gravity. Use palette #CCFFFF/#99FFFF/#66FFFF/#33FFFF/#FFCCCC, accent pink, pastel yellow/white. Layer in sparkles, shockwave, subtle camera/box spring; no white-screen seizure flash.
- Reward/content reveal remains legible. `Replay surprise` always works without duplicating timers/listeners. Closing during animation cleans up and leaves correct state.
- On completion dispatch `open_surprise` quest event and one OS toast, then optionally place `a_little_secret.md` desktop item. Do not need a second backend system for this.
- Support reduced motion and low-power mobile (reduced particle counts). Audio disabled by default until user explicitly enables it.

## 9. OS quality and visual coherence

- Preserve existing typography, pastel mint/pink, recipient hero, character asset, true photos and window styling. Avoid overdecorating text or hiding faces with stickers.
- Ensure Gallery, Secret Note, Surprise have distinct UX and adaptive window sizes; avoid identical giant white popups. Glass with subtle border, optical depth, shadow and backdrop blur, but text contrast stays strong.
- Keep top-right Share coherent with top menu; ensure Dock and app buttons do not overlap on narrow screens. On mobile use full-screen app sheets instead of draggable windows.
- Validate existing Window Manager minimize/maximize, stacking, focus, Dock indicators; keep gestures, screen readers and Escape behavior consistent.
- Correct original Boot overlay/Skip intro clipping if still present. Reduced-motion support across GSAP, lightbox and confetti.
- Prevent accidental horizontal page scroll and viewport overflow. Use `dvh` and flex min-height=0 correctly for nested app panes.

## 10. Recommended organization (adapt to existing repo)

```
src/
  apps/memories/{MemoriesApp,PhotoLibrary,MemoryFilm,Filmstrip,Scrapbook}.tsx
  apps/secret-note/{SecretNoteApp,noteContent}.ts(x)
  apps/surprise/{SurpriseApp,GiftBox}.tsx
  apps/quest/{QuestWidget,FinalWishApp}.tsx
  components/share/{ShareMenu,QRPreview}.tsx
  hooks/{useMemories,useQuest,useShare}.ts
  services/{memoriesApi,adminApi,siteConfigApi}.ts
  types/{memory,quest,siteConfig}.ts
  pages/admin/{AdminLogin,AdminImages,AdminSettings}.tsx
  config/birthday.ts
server/  # only if existing API absent
  routes/{publicMemories,adminAuth,adminImages,adminSettings,share}.ts
  services/{minioMediaService,imageOrderService,shareCardService}.ts
  auth/{session,csrf,rateLimit}.ts
  db/{schema,migrations}.ts
```

Use existing directory naming if established. No business logic inside React presentation components. Typed DTOs and validation schemas must match both sides. Use `@tanstack/react-query` if existing, otherwise fetch/Axios with query cache where appropriate. Never store credentials in frontend.

## 11. Tests: required cases

1. **Media fit regression:** portrait, square and landscape photos fully display; no second photo visible inside film stage. Test slide #9-like transition and active slide; DOM positioning checks.
2. Film keyboard and swipe navigation, pause/play, speed, loops, closes, resumes/visibility changes, no timer leaks, 390px mobile and 1440px desktop.
3. MinIO filename natural order: `1.jpg, 2.png, 10.webp`; gap `1,3,10`; duplicate number conflict; non-image ignored; 1001+ files; external additions + persisted manual order; reset-to-number order; invalid/stale object handling.
4. Admin login good/bad credentials, rate-limit, unauthorized GET/write/delete 401/403, CSRF failure, logout invalidation, file upload validation, drag-order persistence, delete confirmation.
5. Responsive admin upload/reorder, meaningful loading/empty/error states.
6. QR encodes exact canonical `/share` HTTPS link, scans when generated, no localhost QR in production; domain change regenerates share card and metadata.
7. Curl/public HTML metadata test: `og:title`, `og:url`, `og:description`, `og:image` available without JS execution; image HTTP 200 publicly reachable. Human `/share` still renders OS.
8. Quest 0/4 -> 4/4, idempotence, localStorage persistence, reset; main content accessible without quest.
9. Secret Note exact Vietnamese text, no truncation, actions and overflow handled.
10. Surprise replay, close/unmount cleanups, low-motion accessibility, particle burst at actual gift origin.
11. Run `lint`, `typecheck`, unit/integration tests, `build`; record exact commands and outcomes. Run browser screenshots if available and include paths in report.

## 12. Execute in this order and provide evidence

**Phase 0 — Audit:** Map existing components and API/storage. State integration choice and locate actual reason film image duplication, with code evidence. No generic guess.

**Phase 1 — Gallery fix:** Replace faulty film rendering with robust lightbox/filmstrip, get fit and slideshow correct, fix mobile & the screenshot regression. Do not proceed until visual defect is actually gone.

**Phase 2 — Admin + MinIO:** Implement persisted ordering, sync, upload, edit, delete, username/password backend auth and direct hidden page. Verify data persists across reload and reboot.

**Phase 3 — Secret Note:** Apply §7 exact note, format paper/scroll, validate on mobile.

**Phase 4 — Birthday Quest:** Implement 4 stars, cross-app event wiring, final_wish.md and persistence.

**Phase 5 — Share/QR/Open Graph:** Admin URL settings, share UI, PNG QR, server HTML metadata and OG card. Check both link clicking and direct QR.

**Phase 6 — Surprise & OS polish:** Multi-stage gift effects and desktop integration, ensure interactions consistent.

**Phase 7 — QA & delivery:** Fix responsive/performance/accessibility, run all tests/build, document deployment + site settings steps; screenshot success/error states.

### Definition of done

- Nothing is merely a design prototype. Admin actually authenticates, uploads to MinIO, and supports persistent reorder/delete. Hidden route never appears in public UI.
- Memories supports Google Photos-style library + a single fully visible cinematic photo + filmstrip with usable controls + scrapbook. No photo is vertically split or cropped by the viewer.
- The newly written Secret Note is the one shipped, and both Vietnamese text and controls remain readable.
- Birthday Quest links Memories, Note, Cake and Surprise and unlocks `final_wish.md` at 4/4.
- Surprise feels celebratory, supports replay and reduced motion.
- Share offers a real URL + QR with public server-rendered Zalo Open Graph metadata, and clearly handles not-yet-deployed URLs.
- Security basics are real despite single-admin/simple login, no secrets leaked client-side.
- Existing design, photos, recipient name, and operational features remain intact.
- End with changed-file summary, test reports, instructions for `.env`/MinIO/domain/backup, and honest remaining blockers.

**NOW AUDIT THE CURRENT REPOSITORY AND IMPLEMENT. DO NOT STOP AT PLAN OR REQUEST EXISTING DETAILS AGAIN.**
