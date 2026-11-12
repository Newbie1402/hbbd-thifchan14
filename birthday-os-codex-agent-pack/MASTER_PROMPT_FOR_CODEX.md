# MASTER EXECUTION PROMPT — BIRTHDAY OS / PASTEL CYBER-CUTE

> Dán nguyên prompt này cho Codex ở thư mục dự án. Toàn bộ thư mục `assets-source/` đi kèm prompt là dữ liệu đầu vào. Hãy **thực hiện code thật, không chỉ mô tả kế hoạch hay làm mockup**.

## 0. ROLE & QUY TẮC THỰC THI

Bạn là **Principal Frontend Engineer + Creative Developer + UI Motion Designer + QA Engineer**. Nhiệm vụ: xây dựng một web chúc mừng sinh nhật cao cấp, thực sự hoạt động, có mỹ thuật tinh tế, animation được dàn dựng và tương tác đầy đủ. Người dùng cuối là một cô gái IT yêu tone hồng nhạt và xanh ice-cyan. Dự án mang tên **Birthday OS**.

- Chủ động xem toàn bộ repository, hình ảnh và môi trường trước khi thao tác. Nếu repo trống: khởi tạo ứng dụng. Nếu repo đã có code: **giữ nguyên code hữu ích, không xóa bừa, không ghi đè cấu hình hoặc công việc của người khác**.
- **Không hỏi người giao việc để ra quyết định thiết kế nhỏ.** Làm theo tài liệu này. Chỗ nào thiếu thông tin thật (tên/ngày sinh/lời chúc): tạo cấu hình tập trung với placeholder rõ ràng, không bịa thành thông tin xác thực.
- Không tạo màn hình chỉ để trưng bày: icon, nút bấm, cửa sổ, navigation và hiệu ứng đã cam kết phải có hành vi thực, kiểm thử được.
- Triển khai theo từng pha, tự build, test, kiểm tra responsive và sửa lỗi trước khi kết thúc. Không dừng lại ở “scaffold đã xong”.
- Cấu trúc component rõ ràng, strict TypeScript, React Function Components + Hooks, tách data/layout/animation/behavior, không viết một file JSX khổng lồ.
- Chỉ sử dụng asset sẵn có. **KHÔNG tự AI-vẽ lại khuôn mặt, face-swap, tái tạo khuôn mặt từ text, hoặc tự ý chỉnh nét mặt trong ảnh gốc.** Mẫu AI được cung cấp là **minh họa trang trí**, không phải ảnh danh tính chuẩn. Ảnh thật trong `assets-source/photos/` là bản tham chiếu trung thực, phải hiện rõ trong Gallery/Polaroid.
- Chủ động chạy lệnh và báo kết quả thật. Không tuyên bố “đã test” khi chưa chạy.

## 1. MỤC TIÊU SẢN PHẨM

Tạo một **Personal Birthday Operating System** chứ KHÔNG phải một trang landing page thông thường. Người xem đi theo hành trình có chủ đích:

1. Boot screen → terminal pastel gõ chữ và thanh tiến trình.
2. Desktop unlock → không gian OS kỳ ảo xuất hiện dần theo lớp, hiển thị tên cô gái thật nổi bật.
3. Người dùng tự mở ứng dụng `Secret_Note.md` để đọc lời chúc trong cửa sổ kính mờ có nền phía sau blur/dim, **không chồng toàn bộ text và ảnh ngay màn hình đầu**.
4. Người dùng xem ảnh thật ở `Gallery`, mở `Birthday Cake` để thổi nến, tương tác `Surprise`, thả tim, nhận các easter egg liên quan coding.
5. Mọi scene có thể quay lại bằng navigation; không bị khóa bởi animation, có thể bỏ qua intro.

Cảm giác: **cute nhưng không trẻ con**, sáng, mơ mộng, tương lai, nữ IT, cao cấp, giống sự giao thoa giữa thiết kế kính mờ của hệ điều hành hiện đại và pastel-kawaii. Không quá neon, không bão hòa và không dồn tất cả lên một screen.

## 2. NGUỒN ASSET & QUY TẮC NHÂN VẬT (CỰC KỲ QUAN TRỌNG)

Có sẵn trong bundle:

```text
assets-source/
  photos/
    01-roses-shop.png          # Ảnh thật tại cửa hàng, cầm hoa đỏ + hồng
    02-closeup-selfie.png     # Ảnh thật cận mặt; dùng đối chiếu đặc trưng khuôn mặt
    03-ao-dai-front.png       # Ảnh thật áo dài xanh, nón trắng chính diện
    04-ao-dai-lookback.png    # Ảnh thật quay đầu trong nhà thờ
    05-ao-dai-outdoor.png     # Ảnh thật áo dài ngoài trời
    06-ao-dai-side.png        # Ảnh thật góc quay đầu khác
  illustrations/
    hero-desk-illustration.png # Nhân vật minh họa, laptop, mèo, matcha; alpha trong suốt
    hero-desk-alternative.png  # Phương án minh họa phụ
  references/
    birthday-os-v2-concept.png # Concept bố cục gần nhất
    birthday-os-v1-storyboard.png
    polaroid-moodboard.png
    ice-cyan-palette.png
```

Quy tắc:

- Trước khi code, **mở và xem tất cả ảnh**, đọc kích thước, tỷ lệ, transparency; lập bản đồ sử dụng asset. `birthday-os-v2-concept.png` là định hướng art direction, **không** được dùng nguyên screenshot làm background của web rồi đặt nút giả lên trên.
- Ảnh thật: luôn giữ nguyên đường nét gương mặt, không chỉnh mặt, không dùng face filter, không crop cắt vào cằm/trán. Cho phép resize, color-grade **nhẹ**, crop bố cục và tạo khung Polaroid bằng HTML/CSS. Giữ tỷ lệ, sử dụng `object-position` tùy ảnh.
- **Main hero** là minh họa `hero-desk-illustration.png` với laptop, mèo đeo tai nghe và matcha. Ở gần đó, có Polaroid hoặc portrait thumbnail **ảnh thật** đủ lớn để người được chúc dễ nhận ra. Minh họa có thể bị sai nét mặt nên không được coi là hình thay thế duy nhất.
- Cung cấp một switch nội bộ trong config `heroPresentation: 'illustrated' | 'photo' | 'hybrid'`; mặc định `'hybrid'`. Ở chế độ `'photo'`, dùng ảnh chân thực trong khung ảnh kính mờ cao cấp, không cố ghép mặt vào minh họa AI.
- Gallery chỉ hiển thị ảnh gốc thật. Moodboard Polaroid tạo bằng AI chỉ là ý tưởng *frame*, **không được dùng làm Gallery danh tính**.
- Tạo script xử lý ảnh gốc sang WebP/AVIF khi khả thi, với kích thước responsive; giữ source gốc trong `assets-source` và bản phục vụ web trong `public/assets`. Có fallback PNG nếu cần; dùng lazy loading và `srcSet` cho ảnh lớn. **Không đưa ảnh gốc độ phân giải cao lên hosting nếu không cần**.
- Ảnh người thật là dữ liệu cá nhân: tránh analytics/tracker, tránh gửi cho dịch vụ bên thứ ba. Thêm `robots.txt` noindex và `<meta name="robots" content="noindex,nofollow">` cho phiên bản cá nhân, đồng thời ghi README rằng **noindex không phải bảo mật truy cập**; nếu cần riêng tư thực sự, phải dùng hosting có access control. Không tự upload asset đi nơi khác.

## 3. STACK ĐÃ CHỐT

- Vite + React + TypeScript (strict), SPA, ưu tiên static deployment.
- Tailwind CSS (dùng phiên bản ổn định tương thích công cụ; nếu v4 thì cấu hình Vite plugin theo tài liệu mới nhất), thêm CSS variables/tokens cho thiết kế phức tạp.
- `motion` (Motion for React) cho entrance, layout transition, spring, window animations, drag khi phù hợp.
- `gsap` chỉ cho dàn dựng **boot/unlock timeline** hoặc chuỗi choreography phức tạp. **Không đồng thời GSAP và Motion điều khiển cùng property của cùng một element**. Nếu Motion đã đủ, không bắt buộc GSAP trong phần đơn giản; nhưng phải có chuyển cảnh timeline được dàn dựng.
- `canvas-confetti` cho pháo hoa; `lucide-react` cho icon nhất quán. Không nhúng hàng chục thư viện hạt chỉ để đổi vài chấm sáng: dùng Canvas/CSS tối ưu khi phù hợp.
- `@fontsource` hoặc font local tương đương để tự host font bo tròn như Nunito/Quicksand; chỉ font hỗ trợ tiếng Việt. Body note dùng font dễ đọc; font handwritten chỉ dùng accent ngắn. Không tải font lạ từ CDN lúc runtime.
- Vitest + React Testing Library cho component/test state quan trọng; Playwright cho một số flow e2e chính, nếu môi trường cho phép cài browser. ESLint, Prettier.
- Không backend, database, login, API ngoài hay analytics. Nội dung là cấu hình local. Dùng `localStorage` cho thiết lập hiển thị/âm thanh và trạng thái intro (nếu hợp lý), không lưu dữ liệu nhạy cảm.
- Chọn dependency tương thích hiện hành bằng package manager của dự án (mặc định npm). Không đoán version cứng gây xung đột; kiểm tra hướng dẫn package cài thực tế.

## 4. DESIGN SYSTEM (BÁM SÁT MÃ MÀU)

```css
--ice-100: #CCFFFF;  /* Background chủ đạo */
--ice-200: #99FFFF;  /* Orbs, borders */
--ice-300: #66FFFF;  /* Glow, depth */
--ice-400: #33FFFF;  /* Nhấn tương tác, rất tiết chế */
--pink-100: #FFCCCC; /* Cotton candy highlight */
--ink: #1E293B;      /* Chữ chính, đảm bảo tương phản */
--berry: #E11D48;    /* Accent tên và tiêu đề yêu thích */
--pearl: #FFFFFF;
```

Tỷ lệ cảm giác thị giác: 60% nền ice-cyan/trắng sứ, 20% hồng phấn, 15% aqua layer/bokeh, 5% cyan vivid cho tương tác. Có thể thêm lilac nhạt làm màu chuyển nhưng không thay hệ chủ đạo.

- Background: **mesh gradient** trắng ngọc trai → ice blue → pastel pink; thêm ánh sáng bokeh nhiều lớp, mây mềm, chút sakura, star sprites, code glyph `{ }`, `</>`, `<3` trôi chậm; phần hậu cảnh **mờ** và độ tương phản thấp, không tranh với text.
- Glassmorphism theo tinh thần Apple: panel nền trắng hơi trong, gradient phản chiếu, viền hairline trắng/cyan, inner highlight, backdrop blur, shadow mềm; kết hợp **kawaii** qua bo góc tròn, pixel-heart, nơ, mèo, bánh kem, matcha, icon công nghệ. **Lấy cảm hứng** chứ không sao chép nguyên bản hệ điều hành hoặc logo/asset độc quyền.
- Không lạm dụng glow mạnh. Hạn chế màu chói ở vùng đọc; phần note overlay có nền hầu như opaque (white/soft pink khoảng 85–95%) để text dễ đọc.
- Typography: tiêu đề `Happy Birthday,` nhẹ và tên cô gái lớn hơn, đậm, hồng berry hoặc gradient berry–pink; shimmer chạy **ít và chậm**; chữ nội dung xanh than.
- Spacing 8px grid, gutters 24–32px desktop, 16px mobile; radius 18–28px; shadow nhiều lớp nhưng mềm. Panel kính phải vẫn rõ trên backdrop phức tạp.
- Kích thước thiết kế tham chiếu: desktop 1440×900; đảm bảo 1280×720, 1920×1080; tablet 768–1024; mobile 360–430px. Không dùng layout chỉ cố định pixel dẫn tới tràn màn hình.

## 5. CẤU TRÚC SCENE VÀ BỐ CỤC ĐƯỢC DUYỆT

### SCENE A — THE PASTEL TERMINAL / BOOT

- Chiếm toàn bộ viewport. Mesh gradient sáng nhưng ít chi tiết; 1 terminal glass panel giữa màn hình, viền hồng/cyan mảnh, 3 chấm window-control.
- Typewriter lần lượt hiển thị dòng monospace:
  - `> booting_birthday_system...`
  - `> loading: birthday_memories...`
  - `> mounting: secret_note.md...`
  - `> checking: happiness_level... 100%`
  - `> welcome to Birthday OS ♡`
- Progress bar chạy aqua `#33FFFF` → hồng `#FFCCCC`, có số phần trăm; timing tổng khoảng 2.5–4 giây.
- Sau 100%, glow flash **nhẹ** + chuyển scene desktop kiểu unlock/zoom-fade; không được giật/white flash chói.
- Nút `Skip intro` hoạt động tức thì, keyboard accessible. Có khả năng `Replay Boot` trong Settings/Terminal app. Không tạo loading giả lâu hoặc block nếu ảnh load lỗi.
- Nếu `prefers-reduced-motion`: hiển thị terminal trạng thái hoàn tất và nút vào desktop ngay, không typewriter dài.

### SCENE B — THE KAWAII DEV DESKTOP / MAIN HERO

Desktop phải giống một OS thật nhưng bố cục **thoáng**, ưu tiên hierarchy:

1. **Top menubar** cao khoảng 48–56px, glass blur: trái `♡ Birthday OS v2.0`; giữa vài mục đơn giản (`Home`, `Memories`, `Help` hoặc app menu); phải đồng hồ local, status icon. Có menu bấm được (Help hiển thị hint, không chết).
2. **Left dock** dọc trên desktop, icon pastel với nhãn và trạng thái hover/focus: `Home`, `Secret Note`, `Gallery`, `Birthday Cake`, `Surprise`, `Settings`, `Terminal`. Mỗi icon mở app thật. Mobile biến thành dock bottom hoặc launcher, không che note.
3. **Center-top main greeting**: badge dạng `@birthday_girl` và `v2.0_release`; `Happy Birthday,` ở trên; **[recipientName]** ở dòng chính, thật nổi bật nhưng không tràn; xoay shimmer/hào quang rất nhẹ. Cạnh tên có sparkles/code hearts chứ không lạm dụng chữ.
4. **Left / lower-left hero visual**: asset transparent `hero-desk-illustration.png` cỡ khoảng 35–42% khung desktop (tùy aspect), crop/fit tôn dáng; laptop, mèo đeo headphone, matcha rõ ràng. Float 2–5px/chu kỳ 4–6s, một chút parallax; tránh rung.
5. **Right photo cluster**: 2–3 Polaroid từ 6 ảnh thật. Có khung trắng ngà, sticker washi tape hồng CSS, icon heart doodle; rotate -5°/3° và hover nâng nhẹ. Click mở Gallery với ảnh đang chọn. Đừng nhét quá nhiều ảnh chồng nhau, không che gương mặt.
6. **Primary CTA** ở vị trí rõ: nút kính hồng `Open Secret_Note.md ♡` và secondary `Explore Memories`; khi chưa mở note, phần lời chúc dài **không xuất hiện** ở desktop.
7. **Backdrop props**: các hạt sao, bóng bokeh, cây dây leo, mèo nhỏ, biểu tượng code có chiều sâu parallax; trang trí bằng CSS/SVG nhẹ, chỉ vài điểm nổi bật. Tránh thiết kế như poster quá nhiều vật thể cùng lớp.

Hành trình xuất hiện phải theo thứ tự: Background → topbar/dock → title/name → hero character → Polaroids → CTA. Mỗi phần vào bằng spring/y translate nhỏ và opacity, delay hợp lý (0.1–0.3s). Không để người xem chờ quá lâu.

### SCENE C — SECRET_NOTE.MD / HERO GLASS CARD

- Mở từ button hoặc dock thành **cửa sổ/overlay ứng dụng**, không phải section scroll vô tận.
- Khi mở: wallpaper desktop phía sau `blur(10–16px)`, overlay dim nhẹ pastel, note ở trung tâm được focus; shadow rõ, border hồng phấn, nơ/sticker nhỏ ở góc. Chuyển cửa sổ spring scale 0.94 → 1 / opacity 0 → 1.
- Header macOS-inspired **nhưng không copy**: 3 nút điều khiển decor/close có ý nghĩa, icon file, `secret_note.md` hoặc `birthday_note.md`, badge `private_message`.
- Nội dung lấy từ **config**, không hardcode trong component: lời chúc có thể gồm greeting, nhiều paragraph, chữ ký. Dùng text thật, không phải 4 đường line giả. Có thể reveal paragraph theo stagger nhưng đảm bảo sau animation toàn bộ text luôn đọc được và không gây reflow liên tục.
- Card width desktop 560–760px, max-width viewport trừ gutter; max-height khoảng 80–85vh, nội dung tự scroll. Body text 18px desktop, 16–18px mobile, line-height >=1.6; contrast đạt WCAG AA (>=4.5:1 cho text thường). Không đặt shimmer phía sau chữ.
- 3D tilt cực nhẹ (góc tối đa 2–3°), chỉ desktop + fine pointer, **tắt trong lúc scroll/typing hoặc với reduced motion**; ưu tiên khả năng đọc.
- Footer có `Thả tim ♡`, `Thổi nến 🎂`, `Xem kỷ niệm` và nút đóng. Click thả tim tạo mini burst, có counter session; không tạo like thật tới server. Click Thổi nến mở Cake app.
- Modal có focus trap, ESC để đóng, click overlay để đóng (không click content), không làm mất scroll/position ngoài ý muốn; khi note đóng return focus về trigger.

### SCENE D — PHOTO GALLERY / MEMORIES

- Gallery window dạng glass album; dùng **6 ảnh thật**, không biến đổi mặt. Grid Polaroids; click → lightbox lớn với Back/Next, phím trái/phải/ESC, pinch/gesture nếu tiện.
- Bên dưới mỗi ảnh có caption **trung tính** như `Memory 01`, `Một khoảnh khắc dễ thương`, tránh tự bịa địa điểm/ngày tháng hoặc chuyện cá nhân. Caption lấy config để tác giả tự sửa.
- Nhấn ảnh ở desktop mở trực tiếp lightbox tương ứng. Mobile xem dạng một cột/carousel, không tràn ngang.
- Có hiệu ứng lật/slide ảnh tinh tế, skeleton khi load ảnh, `alt` meaningful, lazy loading; prefetch ảnh kế tiếp khi lightbox mở để không giật.

### SCENE E — BIRTHDAY CAKE / CANDLE INTERACTION

- Window riêng với bánh kem kawaii hồng/cyan; có nến/đốm lửa SVG/CSS hoặc Canvas, hiển thị trạng thái `candlesLit`.
- Nút **`Thổi nến`**: click → lửa thu nhỏ rồi tắt, sparkles bay lên, nổ confetti pastel, thông điệp `Make a wish ✨`; nút `Thắp lại nến` reset. Phải hoàn thành hành vi thực, không chỉ hover animation.
- **Không bắt buộc microphone.** Nếu triển khai tùy chọn `Thổi bằng mic`, phải yêu cầu quyền chỉ sau user click, hiển thị giải thích, fallback button luôn có, stop track khi đóng app và xử lý deny/unsupported; KHÔNG upload/ghi âm.
- Confetti dùng palette `#CCFFFF`, `#99FFFF`, `#66FFFF`, `#33FFFF`, `#FFCCCC`, có thể chút trắng. Không che chữ dài quá lâu. Respect reduced motion.

### SCENE F — SURPRISE / GIFT & EASTER EGGS

- Cửa sổ hộp quà 3D-ish bằng CSS/SVG; người xem click **`Open gift`** → nơ mở, hộp bật nắp, confetti nhẹ và một thông điệp bất ngờ lấy từ config.
- Có nút `Replay Surprise` reset trạng thái. Không tự tạo nội dung quá sến. Nội dung demo ngắn kiểu IT:
  `git commit -m "another year of wonderful you ✨"`
  `status: happiness_deployed_successfully ♡`
- Một vài easter egg công nghệ thực sự chạy: ví dụ ấn `Ctrl/Cmd + K` mở launcher; gõ `birthday` trong launcher thì bật confetti. Có một Help tooltip chỉ đường sử dụng.

### SCENE G — SETTINGS / ACCESSIBILITY

- Window Settings có toggle `Sound on/off` (mặc định **off**), `Reduce motion`, `Cursor sparkle`, và `Hero presentation: Hybrid / Illustration / Real photo`; hoạt động thật, persist localStorage (trừ khi bị policy chặn thì vẫn chạy trong session).
- Có `Replay intro`, `Reset celebration` (reset candle, surprise, like state; xác nhận nếu cần), `About Birthday OS`.
- Nếu không có file nhạc hợp pháp trong assets, **không nhúng nhạc có bản quyền**, có thể giữ sound off không hiện nút play hoặc tạo âm click/chime rất ngắn bằng Web Audio chỉ sau interaction.

## 6. WINDOW MANAGER / OS BEHAVIOR

Phải làm app OS chứ không phải overlay tùy ý:

- `WindowManager` nhận `id`, `title`, `icon`, `isOpen`, `zIndex`, `isMinimized`, `isMaximized`/fullscreen optional, position. Mọi app được mở/đóng, chọn focus đưa lên trên, ESC đóng window topmost; hỗ trợ nhiều cửa sổ mở đồng thời trên desktop nhưng **mặc định chỉ hero** để tránh rối.
- Desktop window có thể kéo bằng titlebar, giới hạn còn nằm trong vùng viewport; không kéo khi click button trong header. Window chuyển động mượt và không mất vị trí bất thường khi resize. Mobile chuyển app window sang **full-screen sheet** hoặc panel 100% viewport để đọc rõ; không draggable gây khó touch.
- Note mở cần tập trung đọc: có thể dùng modal mode ưu tiên, blur/dim những thứ còn lại và trap focus; các window khác không cản note. Khi note đóng khôi phục desktop.
- Menubar/dock keyboard accessible, aria-label, highlight active window. Ctrl/Cmd+K mở quick launcher (optional nếu đủ thời gian; nếu làm phải hoạt động).
- Có thể xây window manager đơn giản bằng state machine/React context, không cần thêm state library nặng. Tránh stale state, timers và listeners phải cleanup.

## 7. ANIMATION — THÔNG SỐ CỤ THỂ

- **Boot typewriter:** 20–35ms/ký tự hoặc mô phỏng theo line, thời gian tổng 2.5–4s, có skip; không gây CLS đáng kể.
- **Desktop entrance:** opacity + y 8–20px, stagger 100–250ms, spring vừa phải; tuyệt đối không tất cả pop cùng lúc.
- **Pointer sparkle:** chỉ desktop `pointer: fine`, tối đa ~20–40 hạt ngắn hạn đồng thời, throttle/rAF, pooling nếu dùng canvas, tự cleanup, không làm CPU tăng bất thường; kích thước nhỏ và màu cyan/pink.
- **Parallax:** 3 lớp sâu khác nhau, translate max ~4/8/14px theo con trỏ; nội dung chính chỉ xê dịch rất nhẹ; giảm mạnh/tắt ở mobile, reduced motion và khi mở note.
- **3D card tilt:** tối đa 2–3°, easing mượt, reset khi leave, disabled trên touch và mode reduced motion.
- **Particles background:** star, small orbs, code glyph trôi chậm 10–20s loop không đồng bộ; ưu tiên opacity transform thay vì liên tục thay `box-shadow` lớn.
- **Glow / shimmer:** chạy 4–8s mỗi lần, không lặp dồn liên tục trên chữ. Không gây quá chói.
- **Confetti:** fire on explicit interaction only (`blow candle`, `open gift`, first special reveal optional), tự hủy sau burst, không chặn pointer, không phủ màn hình vô hạn.
- **Window transitions:** spring `stiffness` vừa, no overshoot mạnh; opening khoảng 300–500ms, closing ~200ms.
- **Respect `prefers-reduced-motion`** toàn app: không auto parallax, particle loop nặng, con trỏ lấp lánh, chuyển cảnh dài hoặc 3D tilt; vẫn đảm bảo logic và UI đầy đủ.
- Không animate width/height/top/left liên tục nếu có thể dùng transform; dùng `will-change` có chọn lọc. Cleanup RAF/timeouts/listeners.

## 8. CONTENT / PERSONALIZATION CONFIG

Tạo file **`src/config/birthday.ts`** và `src/types/birthday.ts` với interface rõ ràng, ví dụ:

```ts
export interface BirthdayConfig {
  recipientName: string;
  recipientHandle: string;
  birthdayDate: string | null; // ISO date nếu có; null nếu chưa được cung cấp
  senderName: string;
  noteTitle: string;
  noteParagraphs: string[];
  surpriseMessage: string;
  heroPresentation: 'hybrid' | 'illustrated' | 'photo';
  photos: Array<{
    id: string;
    src: string;
    thumbnailSrc?: string;
    alt: string;
    caption: string;
    objectPosition?: string;
  }>;
}
```

- Dữ liệu demo: `recipientName: 'Thanh Trúc'` **CHỈ LÀ PLACEHOLDER**, vì tên trong concept trước là ví dụ, không được mặc định coi là tên thật. Gắn comment `TODO: CHANGE BEFORE SHARING`. Có thể để `recipientHandle: '@birthday_girl'`.
- `noteParagraphs` chứa **lời chúc demo ngắn, lịch sự, tự nhiên, hơi tinh nghịch IT, không quá sến**; đánh dấu thay trước khi chia sẻ. Không cố viết thư tình nếu người giao việc chưa đưa nội dung.
- `senderName: 'Một người bạn'` placeholder. `birthdayDate: null` cho đến khi biết thật. Không giả lập tuổi, năm sinh, ngày sinh, quan hệ, tôn giáo hay địa điểm từ ảnh.
- Tạo file `.env.example` nếu cần giá trị cấu hình build; tuyệt đối không dùng `.env` cho nội dung cần thay trực tiếp khi không cần. Mọi nội dung hiển thị cần lấy config thay vì string rải rác.
- README có mục **"5 chỗ cần sửa để cá nhân hóa"**: recipientName, birthdayDate, senderName, noteParagraphs, surpriseMessage; có hướng dẫn thay ảnh.

## 9. CẤU TRÚC THƯ MỤC MỤC TIÊU

```text
birthday-os/
  assets-source/                  # Input originals, nên gitignore nếu repo công khai
    photos/
    illustrations/
    references/
  public/
    assets/
      photos/                     # WebP/AVIF responsive generated
      illustrations/             # Optimized hero art alpha
    favicon.svg
    robots.txt
  scripts/
    optimize-images.mjs
  src/
    app/
      App.tsx
      AppProviders.tsx
    config/
      birthday.ts
      designTokens.ts
    types/
      birthday.ts
      desktop.ts
    components/
      common/
        GlassPanel.tsx
        IconButton.tsx
        AnimatedButton.tsx
        Dialog.tsx
      desktop/
        MenuBar.tsx
        AppDock.tsx
        WindowManager.tsx
        DesktopWindow.tsx
        QuickLauncher.tsx
      effects/
        MeshBackground.tsx
        FloatingDecorations.tsx
        CursorSparkles.tsx
        ConfettiEffect.tsx
      hero/
        HeroGreeting.tsx
        HeroCharacter.tsx
        HeroPolaroids.tsx
      apps/
        SecretNoteApp.tsx
        GalleryApp.tsx
        CakeApp.tsx
        SurpriseApp.tsx
        SettingsApp.tsx
        TerminalApp.tsx
    scenes/
      BootScene.tsx
      DesktopScene.tsx
    hooks/
      useMediaQuery.ts
      useReducedMotion.ts
      useWindowManager.ts
      useLocalStorage.ts
    utils/
      assetPaths.ts
      motionPresets.ts
    styles/
      global.css
      theme.css
      animations.css
    test/
      setup.ts
    main.tsx
  e2e/
    birthday-flow.spec.ts
  index.html
  README.md
  package.json
  tsconfig.json
  vite.config.ts
```

Có thể đổi tên một chút nếu phù hợp nhưng phải giữ separation of concerns. Không thêm routing đa trang khi không cần; các app nằm trong SPA window manager.

## 10. WORKFLOW BẮT BUỘC — LÀM THEO ĐÚNG THỨ TỰ

### Phase 0 — Inspect & initialize

1. `pwd`, `ls`, đọc package/config hiện có và git status; không xóa file không liên quan.
2. Kiểm tra thư mục `assets-source/` đã được copy cùng prompt; mở xem ảnh, phân biệt ảnh thật và AI. Nếu file thiếu, vẫn xây UI bằng placeholders nhưng ghi rõ file cần đặt vào, không tự chế ảnh người.
3. Khởi tạo Vite React TS khi repo trống, cài dependencies, ESLint, Prettier, test tooling. Dựng path alias `@/` (nếu phù hợp) và scripts npm `dev`, `build`, `preview`, `lint`, `test`, `test:e2e`, `images:optimize`.
4. Tạo config và `README` skeleton. Chạy app và build baseline thành công trước khi làm artwork.

### Phase 1 — Assets & Design tokens

1. Script resize/convert ảnh, giới hạn cạnh dài hợp lý cho responsive (ví dụ 480/960/1440 hoặc theo layout thực tế), xuất WebP với chất lượng hợp lý; giữ transparency cho illustration; không biến dạng aspect ratio; không upscaling ảnh gốc nhỏ.
2. Chuẩn hóa tên ảnh phục vụ web và config `photos`. Ghi alt/caption đúng, `objectPosition` riêng cho ảnh chân dung.
3. Khai báo CSS variables, Tailwind theme, font Vietnamese, mesh background, glass classes, breakpoints.
4. Tạo trang debug/sandbox tạm thời nếu cần để kiểm tra color contrast và glass effect, sau đó xóa giao diện debug khỏi bản cuối.

### Phase 2 — Scene A Boot

1. Code terminal, typewriter, progress, skip, complete callback.
2. Đảm bảo timers cleanup khi unmount hoặc skip; test skip works and reaches Desktop.
3. Thêm timeline unlock (dùng GSAP nếu phù hợp). Không để terminal vĩnh viễn phủ desktop.

### Phase 3 — Scene B Desktop hero

1. Dựng menu, dock, gradient background, floating décor, hero greeting.
2. Đưa art nhân vật PNG transparent phía trái, Polaroid ảnh thật phía phải, CTA ở vị trí dễ thấy. Visual hierarchy phải rõ ở 1440×900 và 390×844.
3. Dàn dựng entrance theo layer; không che tên, không để ảnh che nút.
4. Trước khi tiếp tục, tự đánh giá theo concept `assets-source/references/birthday-os-v2-concept.png`: giữ vibe nhưng **giảm số cửa sổ đang mở cùng lúc**.

### Phase 4 — Windows & Note

1. Implement window state + focus/z-index, open/close/minimize hoặc maximize nếu có, drag desktop, responsive mobile sheets.
2. Implement Note modal ưu tiên readability: overlay blur + dim, heading, paragraphs, signature, like/cake/gallery buttons; focus trap + Escape + return focus.
3. Tạo test cho open/close, focus behavior, note content từ config, ESC, click background.

### Phase 5 — Gallery, Cake, Surprise, Settings

1. Gallery ảnh thật, lightbox, keyboard, responsive.
2. Cake with actual state transition (lit → extinguished → relit) + confetti and reduced-motion fallback.
3. Gift actual state transition + replay, configured message.
4. Settings toggles persistent, working replay boot/reset; Sound default off; no hidden permissions.
5. Help/Terminal app có nội dung và interaction thực, không để menu chết.

### Phase 6 — Effects & polish

1. Pointer trail + floating particles + parallax + gentle tilt, ưu tiên performance và không gây motion sickness.
2. Kiểm thử trên desktop mobile, hover/focus, touch, font support tiếng Việt, image crop khuôn mặt, low-end throttled CPU nếu môi trường hỗ trợ.
3. Đảm bảo note readable khi motion chạy; tắt background motion khi note modal active.
4. Thêm hover/press state, loading image state, empty/error fallback, UI transitions có coherence.

### Phase 7 — QA / DoD

1. Chạy lint, TypeScript check, test, production build, preview; tự sửa mọi lỗi được phát hiện.
2. Nếu Playwright/chrome có sẵn: chạy flow e2e Boot → Desktop → Note → Gallery → Cake → Surprise → Settings, test viewport desktop + mobile và keyboard. Nếu chưa cài được browser, ghi rõ chưa chạy e2e thay vì tuyên bố pass.
3. Nếu môi trường cho phép, chụp screenshot desktop và mobile, đánh giá visual và sửa bố cục dựa trên ảnh chụp thật (không chỉ nhìn code).
4. Check console không uncaught errors, click vào tất cả app; không có nút không hoạt động. `npm run build` phải pass.
5. Cuối cùng trình bày **file tree, các package chính, những gì đã hoàn thành, kết quả từng command, lệnh chạy local, phần config cần sửa, tradeoffs/known issues**. Không viết “hoàn thành” nếu còn lỗi blocking.

## 11. CRITERIA NGHIỆM THU BẮT BUỘC

**Functionality:**
- [ ] Boot auto enter Desktop hoặc Skip được bằng click/keyboard.
- [ ] Tên nhân vật chính hiển thị rõ từ `birthday.ts` trên cả desktop/mobile.
- [ ] Main screen không có note dài mặc định; button/dock mở note thật.
- [ ] Note readable, closable ESC, keyboard focus đúng, like button hoạt động.
- [ ] Dock/Home/Note/Gallery/Cake/Surprise/Settings/Terminal đều hoạt động.
- [ ] Gallery có đủ 6 ảnh thật và điều hướng ảnh chi tiết.
- [ ] Cake blow/relight hoạt động và có animation nến/confetti.
- [ ] Gift open/replay hoạt động, hiển thị message từ config.
- [ ] Settings lưu được reduce-motion/sparkles/hero mode; Replay Intro hoạt động.
- [ ] Desktop windows có focus/z-index; drag trên pointer fine, mobile đọc tốt.

**Visual:**
- [ ] Đúng palette `#CCFFFF #99FFFF #66FFFF #33FFFF #FFCCCC` với ink `#1E293B` và berry `#E11D48`.
- [ ] Apple-inspired glass có cảm giác cao cấp, không copy nguyên macOS.
- [ ] Main character/laptop/cat/matcha và Polaroids không chồng lấn mất nội dung.
- [ ] Không dùng screenshot concept làm background fake UI.
- [ ] Ảnh thật giữ nguyên đặc trưng gương mặt, không AI face re-generation.
- [ ] Note nền sáng đủ đặc và text contrast dễ đọc.
- [ ] Responsive không horizontal overflow ở 360/390/768/1440px.

**Quality / safety:**
- [ ] TypeScript strict, lint/build/test pass.
- [ ] React semantic HTML, image alt, aria-label, keyboard navigation, focus visible, reduced motion.
- [ ] Không autoplay audio, không gửi ảnh/mic lên server ngoài, không trackers.
- [ ] Không render user text bằng `dangerouslySetInnerHTML` / raw HTML; content data an toàn.
- [ ] Hạt/animation được cleanup; không tự tạo RAF/listener leak.
- [ ] Lazy loaded + optimized images, usable trên thiết bị trung bình.
- [ ] README giải thích build, deploy static, config, quyền riêng tư ảnh.

## 12. QUY TẮC ƯU TIÊN KHI GẶP TRADE-OFF

Thứ tự: **(1) hiện rõ tên & đọc được lời chúc → (2) bảo toàn khuôn mặt ảnh thật → (3) interaction thực → (4) responsive/a11y → (5) đẹp & mượt → (6) hiệu ứng trang trí nâng cao**.

Nếu hiệu ứng phức tạp làm chậm máy hoặc che chữ, giảm/tắt hiệu ứng; không hy sinh khả năng đọc. Nếu ảnh AI khiến nhân vật trông không giống ảnh gốc, dùng chế độ hero `hybrid`/`photo` và cho ảnh thật nổi bật hơn; không “sửa mặt bằng code” hay dựng gương mặt khác. Không tự ý thêm backend, database hay dịch vụ trả phí.

## 13. KẾT QUẢ YÊU CẦU SAU KHI THỰC THI

Cần có **một repository chạy được**, không phải file Figma/một poster. Trả lời khi xong bằng:

1. Tóm tắt các scene và interactive features đã code thật.
2. Cấu trúc thư mục chính.
3. Các commands đã chạy + kết quả lint/test/build.
4. Cách chạy (`npm install`, `npm run images:optimize` nếu cần, `npm run dev`, `npm run build`) và hướng dẫn deploy static.
5. Đường dẫn file chỉnh tên/ngày sinh/lời chúc/ảnh (`src/config/birthday.ts`).
6. Các vấn đề còn lại hoặc khác biệt so với spec (nếu có), không giấu lỗi.

**Bắt đầu bằng kiểm tra repo và assets ngay bây giờ, sau đó trực tiếp triển khai cho tới khi bản MVP hoạt động đầy đủ và đã kiểm chứng. Đừng dừng ở phần lên kế hoạch.**
