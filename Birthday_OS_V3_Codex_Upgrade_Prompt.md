# CODEX IMPLEMENTATION BRIEF — BIRTHDAY OS 3.0

## 0. Vai trò và nguyên tắc bắt buộc
Bạn là Principal Frontend Engineer + Creative Developer + UI Motion Designer + QA Engineer. Nhiệm vụ: **nâng cấp repo Birthday OS HIỆN CÓ** thành một micro-OS sinh nhật tương tác, nhiều chiều sâu, đủ đẹp để đưa cho người được chúc sử dụng. **Không dựng project mới, không thay kiến trúc vô cớ, không chỉ viết kế hoạch.** Đọc toàn bộ repo, README, package.json, src/config, assets, các component và test hiện tại trước khi sửa. Bảo toàn những chức năng đã chạy được, các hình ảnh gốc và nội dung cá nhân hóa. Thực thi code, kiểm thử và sửa lỗi cho đến khi đạt acceptance criteria.

Không hỏi lại những điều đã được đặc tả ở đây. Nếu chưa có thông tin triển khai MinIO (endpoint, bucket, key), tạo `.env.example`, module adapter và hướng dẫn vận hành; **không hardcode, không bịa credential, không giả vờ rằng đã kết nối được MinIO**. Giữ nguyên tên người được chúc, username và lời chúc hiện đang dùng trong repo; không thay bằng tên từ concept cũ. Không tự AI-generate/repaint khuôn mặt thật. Giữ toàn bộ ảnh cá nhân ở đúng chất lượng và tỉ lệ. Trước khi code, đọc và giữ tương thích những file thiết kế cũ nếu chúng tồn tại trong repo.

## 1. Mục tiêu trải nghiệm
Biến sản phẩm từ “landing page + modal” thành một **Birthday OS**: Boot Scene → Desktop → app windows với các chuyển động liền mạch, có trạng thái, âm thanh tùy chọn, tương tác chuột/phím/touch, hiệu ứng sinh động có kiểm soát. Phong cách **Pastel Cyber-Cute / Kawaii Tech + Apple-inspired soft glass**, nhưng không sao chép nguyên xi macOS. Nhân vật chính nằm lệch bên trái, lời chúc/tên rõ ràng, các ảnh Polaroid ở một khu riêng; tránh quá nhiều đồ họa che chữ.

Bảng màu: #CCFFFF (nền chủ đạo), #FFCCCC (điểm nhấn tình cảm), #99FFFF, #66FFFF (viền/glow), #33FFFF (interaction highlights), #1E293B (chữ), #E11D48 (nhấn tên). Glass dùng các lớp nền trong mờ, viền 1px, subtle backdrop-blur, inner light + shadow tinh tế. Tránh overglow, bloom quá mức và chữ bị giảm tương phản. Thiết lập design tokens trong Tailwind/CSS variables, không rải màu cứng khắp nơi.

Tôn trọng prefers-reduced-motion, keyboard accessibility, responsive, thiết bị yếu và tính riêng tư của ảnh.

## 2. Audit UI hiện có — lỗi cần sửa trước
Từ screenshot phản hồi: (1) Boot progress bị chồng chữ % và Skip intro; (2) Lightbox ảnh toàn thân bị cắt dưới màn hình/khung; (3) Surprise hộp quà phẳng, animation yếu; (4) Cake ít tương tác; (5) các cửa sổ giống modal rời rạc thay vì window manager; (6) desktop quá nhiều khoảng trống thiếu parallax chiều sâu; (7) dock chứa icon ứng dụng ngoài ngữ cảnh; (8) typography của tên dài cần responsive; (9) terminal chỉ là form nhập lệnh sơ sài; (10) phần Memories chưa có phim/slideshow thực thụ. Kiểm tra lại trong code, chỉ báo lỗi đã sửa nếu đã xác minh.

## 3. Nâng cấp Desktop nhiều lớp (living desktop)
- Tạo BackgroundLayer (mesh-gradient cực nhẹ), AmbientLayer (particles/bokeh SVG hoặc canvas nhẹ), ContentLayer (hero/name/nhân vật/Polaroid), WindowLayer (các app) và OverlayLayer (Spotlight/toast/cursor effects) với z-index tokens cố định.
- Parallax biên độ nhỏ theo pointer, chênh lệch giữa các layer; dừng hoặc giảm khi modal cần tập trung, trên touch hoặc reduced-motion. Không kéo chữ theo con trỏ quá nhiều.
- Ở desktop: bố cục ba vùng cân bằng, nhân vật minh họa bên trái, tên/lời mời khám phá trung tâm, 3 ảnh Polaroid bên phải; có đủ khoảng trắng để đọc. Tên nhiều từ tự wrap sạch, không bị đè hình. Ở mobile: nhân vật nhỏ lại, text lên trước, Polaroid thành swipe carousel, dock phù hợp.
- Thêm sparkling mouse trail giới hạn particle, hover-reactive glass highlights, ambient shape/floating sticker rất nhẹ; frame rate ổn định.
- Giữ ảnh nhân vật minh họa đã tách nền làm decorative image. **Gallery sử dụng ảnh gốc thật**, không dùng AI-enhanced face thay thế.
- Polaroid hover/drag tilt nhẹ; khi click mở chính tấm ảnh trong Memories bằng shared-element transition (dùng Motion layoutId hoặc GSAP Flip, chỉ chọn một engine cho mỗi phần tử); khi đóng trở về vị trí hợp lý. Có fallback không animation.
- Dock chỉ có ứng dụng của Birthday OS, icon có nhãn, badge running/minimized, hover magnification tinh tế, click focus/minimize/restore. Không hiển thị app giả không chức năng.

## 4. OS shell + Window Manager thật
- App registry có id/title/icon/component/initialSize/minSize và trạng thái.
- WindowManager: mở, đóng, focus, z-index, minimize/restore, maximize/restore, draggable/resizable desktop; giới hạn cửa sổ trong viewport, không để mất titlebar. Mobile dùng full-screen sheet/app view, không ép drag nhỏ xíu.
- Dùng react-rnd hoặc giải pháp phù hợp sau audit dependency. Giữ drag handle titlebar, disable drag khi click button/input, pointer/touch usable.
- Mở app từ Dock, icon desktop, Spotlight, Terminal; chỉ một nguồn state thống nhất (Zustand hoặc Context khi đủ), không tạo nhiều modal state không đồng bộ.
- Spotlight với Cmd/Ctrl+K: tìm app theo tên/alias; Enter mở, Escape đóng; hỗ trợ keyboard focus.
- Toast/Notification Center: khi thổi nến, mở quà, xem kỷ niệm, hoàn thành quest; không spam. Có clear và auto dismiss.
- Terminal: commands thật `help`, `whoami`, `status`, `date`, `open memories`, `open note`, `open cake`, `open surprise`, `clear`, `birthday`; parse lệnh bằng switch/map whitelist, KHÔNG dùng eval, KHÔNG shell execution. Có history bằng mũi tên nếu hợp lý.
- Settings: sound on/off, ambient motion low/normal/off, show pointer trail, theme cotton-candy/mint, reset progress (confirm). Lưu setting an toàn ở localStorage; đọc trong try/catch.
- Deep link nếu thích hợp: `?app=memories&photo=3` hoặc route tương đương; refresh không làm app hỏng.

## 5. Memories 2.0 — Google Photos x Cinematic Film x Scrapbook
Đây là ưu tiên cao nhất sau bug fix. Thiết kế một app Memories có 3 tab riêng, chia sẻ cùng source ảnh từ MinIO (xem mục 6):

### A. Library / All photos
- Responsive masonry/grid; ảnh giữ tỷ lệ, thumbnail lazy-load, skeleton, loading, error, empty-state tử tế; đầy đủ alt text an toàn và fallback.
- Click ảnh mở lightbox fit-to-viewport (`object-fit: contain`, không crop ảnh gốc), hỗ trợ Next/Prev, Esc, click overlay to close, keyboard arrow, touch swipe, pinch/zoom hoặc controls tương đương.
- Thứ tự ảnh mặc định **numeric ascending** theo tên object trên MinIO.

### B. Memory Film / Cinematic Slideshow
- Hero trình chiếu ảnh với timeline/filmstrip thumbnails nằm dưới như cuộn phim; thumbnail có thể kéo ngang và auto-scroll theo ảnh hiện tại.
- Play/Pause, Previous/Next, progress indicator, lựa chọn tốc độ 3/5/8s, loop, fullscreen, mute/music optional (không autoplay âm thanh trước khi tương tác).
- Ảnh đổi với fade/soft zoom Ken Burns có chủ đích, không làm người xem chóng mặt; transition không nhảy layout; ảnh portrait đặt trong nền blur của chính ảnh đó hoặc letterbox pastel, không crop mặt.
- Chuyển ảnh đúng thứ tự 1, 2, 3...; nếu thiếu số thì bỏ qua, không dừng ở gap. Không sắp `1, 10, 2`.
- Điểm bắt đầu của slideshow có thể là ảnh đã click ngoài Desktop; cập nhật state khi Next/Prev, thumbnails phải sync.

### C. Scrapbook
- Trang kỷ niệm dạng sổ hoặc Polaroid gallery với washi tape/sticker/note; lật trang mượt; ưu tiên thư viện hiện có hoặc CSS nhẹ. Không làm ảnh thật biến dạng.
- Có caption tùy chọn theo order; nếu chưa có thì dùng `Memory #N` hoặc để trống; tuyệt đối không tự bịa câu chuyện riêng của nhân vật.

### Yêu cầu vận hành ảnh
- Khi dữ liệu từ MinIO thay đổi, giao diện có nút Refresh memories để lấy danh sách mới; cache có TTL hợp lý.
- Hỗ trợ danh sách hàng chục/hàng trăm ảnh mà không preload toàn bộ full-resolution. Preload ảnh kế tiếp và trước đó; virtualize khi số lượng rất lớn; dùng thumbnails nếu pipeline sẵn có.
- Không bắt người dùng sửa source code cho từng ảnh mới.

## 6. MINIO AUTO DISCOVERY — yêu cầu bắt buộc
**Workflow của chủ website:** tôi upload ảnh vào một prefix MinIO theo thứ tự bằng tên file `1.jpg`, `2.png`, `3.webp`, `4.jpeg`, ...; website tự phát hiện, lấy ảnh, và luôn sắp tăng dần theo SỐ trong tên. Tôi không cần gõ danh sách URL thủ công, không cần thêm import vào frontend, không cần tạo manifest bằng tay. Ảnh có thể thiếu số (`1,2,5,9`) và vẫn chạy đúng. Hỗ trợ `01.jpg` như order 1 nếu muốn; tránh hai object trùng order.

### API thiết kế
- Frontend gọi một endpoint read-only `GET /api/memories` (đặt base URL trong env), trả `photos` đã sort theo số tăng dần; ví dụ:
```
{
  "photos": [
    {"id":"1", "order":1, "src":"<public-or-presigned-url>", "caption":null},
    {"id":"2", "order":2, "src":"<public-or-presigned-url>", "caption":null}
  ],
  "refreshedAt":"<ISO8601>"
}
```
- Backend/edge adapter dùng MinIO SDK/S3-compatible ListObjectsV2 với bucket+prefix đã cấu hình, xử lý pagination. Filter chỉ ảnh với regex `^([0-9]+)\.(jpg|jpeg|png|webp|avif)$` (case-insensitive) trên basename trong prefix đã quy định. Order = parseInt từ phần basename, sort `(order asc, name asc)` ổn định. Trùng order khác extension -> không render 2 ảnh trùng thứ tự; log warning và áp dụng một quy tắc cố định (ưu tiên webp/avif/jpg/png hoặc lexicographic; ghi rõ rule). File ngoài format (`README`, thumbnail folder, video, `abc.jpg`) bỏ qua.
- **Không truy vấn MinIO trực tiếp từ frontend bằng access key. Không đặt MINIO_SECRET_KEY dưới `VITE_*`. Không công khai ListBucket policy để chạy client.**
- Khi bucket private: backend tạo presigned GET URL ngắn hạn cho các object; lưu TTL, refresh URL khi hết hạn. Dùng read-only service account scoped bucket/prefix nếu MinIO policy hỗ trợ; endpoint public read-only chỉ nếu chủ site chủ động bật và chấp nhận ảnh công khai.
- Credential server env, `.env.example` có `MINIO_ENDPOINT`, `MINIO_PORT` (nếu cần), `MINIO_USE_SSL`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_PREFIX=birthday/memories/`, `MEMORIES_API_PORT`, `ALLOWED_ORIGINS`, `MEMORIES_CACHE_TTL_SECONDS` và `VITE_MEMORIES_API_BASE_URL`. Đừng ghi key thật vào repo, UI hay logs. Không hardcode domain nào.
- Nếu repo đã có backend/API/hosting Functions, tích hợp vào đó. Nếu chỉ có Vite SPA, tạo API adapter mỏng bằng Node (Fastify/Express/Hono hoặc host-compatible serverless) **để thật sự tự động đọc bucket**, tránh dựng full backend thừa. Không thay Vite SPA thành Next.js chỉ vì endpoint này. Cấu hình dev proxy `/api` và hướng dẫn deploy frontend + API ở production. Nếu không thể chạy API do thiếu hạ tầng, vẫn implement adapter/server và docs rõ ràng; KHÔNG thay bằng quét URL 1..999 gây hàng trăm 404, KHÔNG giả vờ auto-discovery từ static hosting.
- Chỉ cho phép GET, validate prefix server-side, restrict CORS theo site origin, rate-limit vừa đủ; không nhận bucket/key tùy ý từ query param. Chỉ cho phép object có content type ảnh (nếu metadata đáng tin), giới hạn dữ liệu trả về, giới hạn scan/pagination theo cấu hình. Tránh lộ credentials trong error response. Kèm health check cơ bản nếu API độc lập.
- Cache danh sách khoảng 30–60 giây; refresh button có cách bypass hợp lệ không để ai cũng spam MinIO. Có retry/backoff cho 5xx, loading/empty/error messages hữu ích. Nếu URL presigned có TTL, chọn TTL đủ cho slideshow và refresh trước expiry; không serialize URL presigned vào persistent storage.
- Nếu caption/title cần thiết, thêm file config **tùy chọn** keyed theo số, chẳng hạn `{ "1": "Một ngày thật đẹp" }`, không bao giờ làm điều kiện bắt buộc để ảnh xuất hiện.
- Cung cấp script kiểm tra danh sách MinIO trong môi trường dev (`npm run memories:check`) dùng cùng code sorter; test case `1.jpg, 2.png, 10.webp` => `[1,2,10]`, case gaps, duplicate, invalid, uppercase extensions, empty bucket.

## 7. Surprise 2.0 — cinematic unboxing
Dựng lại `surprise.zip` thành một tương tác có 5 phase, dùng timeline rõ ràng (GSAP hoặc Motion, không cùng điều khiển transform):
1. Idle: hộp quà 3D/CSS layered, có nơ, đổ bóng, nhấp nhô và bụi sáng rất nhẹ; gọi action được bằng click/keyboard.
2. Anticipation: click -> disable double-trigger, hộp rung có squash/stretch tinh tế, glow và âm thanh click nhỏ nếu user bật sound.
3. Explosion: nắp bay lên theo arc + rotate, burst confetti/tim/sao/ribbon theo tọa độ vật thể thật, radial shockwave/glow; particles dùng canvas-confetti hoặc hiệu ứng tương đương, phù hợp DPR, tự cleanup.
4. Reveal: một memory card/secret note từ trong hộp bay lên, hiện nội dung chúc mừng có typography đẹp; nội dung lấy config hiện tại, không tự bịa tên/ngày tuổi.
5. Afterglow: particles rơi xuống, unlock `a_little_secret.md` trên desktop, toast chúc mừng, replay/reset animation; localStorage chỉ lưu unlocked flag, không giữ trạng thái animation dở dang.

Hiệu ứng có thể replay nhiều lần, khi thoát/đổi tab/unmount phải kill timeline và cleanup event/RAF. Reduced motion: thay bằng transition ngắn không bắn nhiều particle. Không yêu cầu 3D nặng khi CSS 3D/SVG đáp ứng tốt.

## 8. Birthday Cake 2.0
- Bánh kem có nhiều lớp/icing, ánh sáng nến mềm, lửa flicker, glow không quá mạnh. Nút `Thổi nến` làm lửa tắt theo stagger, có khói bay lên; confetti nhỏ và lời nhắn chúc.
- `Thắp lại nến` reset toàn bộ trạng thái và phát lại; chống double click. Có thể thêm interaction nến cụ thể bằng click/tap, nhưng vẫn phải có button accessible.
- Khi tắt hết nến bắn toast/badge và cập nhật progress quest; không tự yêu cầu dùng microphone vì permission phức tạp và kém ổn định.

## 9. Secret Note 2.0
- Thiệp có chất giấy/kính nhiều lớp, nơ/góc trang trí tối giản, chữ đọc rõ, lề và line-height tốt, hợp mobile. Hover tilt rất nhẹ trên desktop, tắt trên touch/reduced motion.
- Nút mở note từ Desktop; text fade/type reveal từng dòng với skip animation. Có `Thả tim` và `Copy lời chúc` hoạt động; nếu nhập/thay lời chúc do chủ site, giữ trong src/config, không đưa editor public cho mọi người nếu không có auth.
- Overlay backdrop blur vừa phải; có focus trap, Escape đóng, restore focus, close click đúng hành vi; không mất nội dung khi mở/đóng.

## 10. Birthday Quest nhẹ (optional unlock nhưng phải triển khai)
- 4 hoạt động: mở Memories, đọc Note, thổi nến, mở Surprise. Đánh dấu icon/ngôi sao hoàn thành trên desktop, có thể truy cập app không cần làm theo thứ tự.
- Khi đủ 4, mở một desktop file/note cuối cùng, hiển thị notification duy nhất và nút mở. Lưu localStorage và reset trong Settings, không dùng tracking bên ngoài.
- Không biến trang thành game bắt buộc; mở bất cứ app nào cũng được.

## 11. Tech & project organization
- Tiếp tục stack hiện tại; dự kiến React + TypeScript + Vite + Tailwind. Đừng đổi React Router, state management hoặc bundler khi không cần.
- Gợi ý module: `src/config/birthday.ts`, `src/components/os/*`, `src/components/desktop/*`, `src/features/memories/*`, `src/features/surprise/*`, `src/features/cake/*`, `src/features/note/*`, `src/features/terminal/*`, `src/hooks/*`, `src/services/memories.ts`, `src/types/*`, `src/styles/tokens.css`; `server/` nếu cần MinIO API.
- Typing tường minh: `MemoryPhoto`, `MemoriesResponse`, `OSAppId`, `WindowState`, `SettingsState`, `QuestState`.
- API qua Axios hoặc fetch typed; TanStack Query nếu đã có hoặc thêm khi thực sự hữu ích cho cache/retry. Không có business logic dài trong component. Tách motion controller, data source và UI.
- Tránh animation loops trên React state mỗi frame: dùng transform/CSS compositor, refs/RAF với cleanup. Lazy-load module và ảnh, code-split app chưa mở. Tối ưu font/ảnh; tránh excessive blur trên mobile.
- A11y: semantic buttons, aria-label, focus ring, keyboard operation, alt images, trap focus in modal, prefers-reduced-motion, contrast >= mức hợp lý; touch targets >= 44px.
- Không dùng nội dung có bản quyền trái phép, assets/nhạc ngoài phải có license phù hợp; audio mặc định off hoặc chỉ chạy sau user gesture.

## 12. Quy trình bắt buộc cho agent
**Phase 0 – Audit:** đọc repo, liệt kê file/chức năng, phát hiện rủi ro; tạo `docs/UPGRADE_PLAN.md` + checklist. Chỉ sửa theo thực trạng, không phá code cũ.
**Phase 1 – Fix:** sửa Boot overlap, photo lightbox crop, overflow, layout responsive và những lỗi UI hiện hữu; chạy typecheck/build.
**Phase 2 – MinIO:** xây API list/sort/presign, env template, dev proxy, client typed, cache, empty/error/loading và tests. Dữ liệu mẫu chỉ dành test/dev, không thay danh sách thật ở production.
**Phase 3 – Memories:** Library + Film + Scrapbook, album navigation, keyboard/touch, shared-element Polaroid, ảnh đúng thứ tự; screenshot test.
**Phase 4 – Surprise + Cake:** animation timeline, gift explosion, reset/replay, candle flame/smoke, cleanup, reduced motion.
**Phase 5 – OS Shell:** app registry, window manager, dock, Spotlight, terminal, notification, Settings, quest progress.
**Phase 6 – Visual polish:** layered desktop, parallax, glass highlights, typography, motion consistency, mobile optimizations.
**Phase 7 – QA:** lint, TS, unit/integration/E2E nếu repo cho phép, build production; capture browser screenshots desktop 1440x900, tablet 768x1024, mobile 390x844; fix all blocking problems. Xuất `docs/IMPLEMENTATION_REPORT.md` ghi file đổi, tính năng xong, cách chạy, cách cấu hình MinIO, known limitations và test results.

Mỗi phase: implement -> chạy kiểm tra -> sửa lỗi -> đánh dấu checklist; không chỉ báo kế hoạch. Nếu không thể test browser do tooling, nói rõ test nào chưa thực thi. Đừng khẳng định production-ready nếu chưa test deployment MinIO thật.

## 13. Acceptance criteria / Definition of Done
1. `npm install` + scripts tương ứng chạy, lint/typecheck/build pass; repo cũ không bị mất chức năng.
2. Trang desktop đẹp, cân đối, đủ chiều sâu, tên dài không che hình hay tràn viewport; hiệu ứng mượt; mobile usable.
3. Window manager có ít nhất focus, close, minimize/restore, maximize desktop và đúng keyboard interaction; Dock/Spotlight/Terminal mở app thực sự.
4. Boot không chồng chữ, có Skip hoạt động, không mắc kẹt.
5. MinIO: chỉ cần upload `1.jpg`, `2.png`, `10.webp` trong prefix -> API trả đúng thứ tự `[1,2,10]`; `1,3,7` vẫn chạy; upload mới rồi refresh hiện ảnh mà không sửa FE.
6. MinIO credentials không xuất hiện trong frontend bundle, log client, public repo; bucket private vẫn xem được qua signed read URLs. Không cần client ListBucket.
7. Memories có Library, Film, Scrapbook; Film autoplay/pause, prev/next, loop, thumbnails/timeline đúng vị trí; ảnh portrait xem trọn; không cắt mặt/chân trong lightbox.
8. Click Polaroid mở đúng ảnh, thứ tự và nguồn data đồng nhất với Memories. Có fallback khi animation tắt.
9. Surprise có đầy đủ anticipation -> explosion -> reveal -> afterglow, replay được, effects không leak; desktop unlocked state được phản ánh.
10. Cake có animation nến, khói, thổi/tắt/thắp lại và trigger thông báo; không chỉ thay text một cách đột ngột.
11. Secret Note chữ đọc rõ, thao tác close/escape/copy/like hoạt động.
12. Settings và quest progress thực thi đúng; không có CTA rỗng hoặc icon giả.
13. Có loading/error/empty state, keyboard accessibility, reduced-motion, và không autoplay nhạc trái phép.
14. Có tài liệu `.env.example`, MinIO upload naming convention, hướng dẫn deploy frontend + API, test quan trọng, README cập nhật.

**Bắt đầu ngay bằng audit repo, sau đó tự triển khai tuần tự. Không hỏi lại các yêu cầu trên. Chỉ hỏi khi cần một giá trị bí mật/hạ tầng chưa có hoặc một quyết định thật sự chặn triển khai; còn lại dùng cấu hình placeholder an toàn, code đến mức kiểm thử được.**
