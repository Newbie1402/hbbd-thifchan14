# Bắt đầu với Codex

1. Tạo một thư mục dự án trống, ví dụ `birthday-os`, hoặc mở repo hiện có.
2. Giải nén **nội dung** `birthday-os-codex-agent-pack.zip` vào ngay **thư mục gốc** của repo. Sau giải nén phải thấy `MASTER_PROMPT_FOR_CODEX.md`, `ASSET_MANIFEST.md` và `assets-source/` cùng cấp.
3. Mở thư mục đó trong Codex, dán prompt mở đầu:

   > Hãy đọc toàn bộ `MASTER_PROMPT_FOR_CODEX.md` và `ASSET_MANIFEST.md`, kiểm tra các ảnh trong `assets-source/`, rồi thực hiện **tất cả** yêu cầu theo thứ tự các phase. Trực tiếp tạo/chỉnh sửa source code, cài dependency, chạy app, lint/test/build, tự sửa lỗi và báo lại kết quả thật. Không dừng ở phần lập kế hoạch. Tên `Thanh Trúc` chỉ là placeholder, chưa phải dữ liệu thật. Không tái tạo khuôn mặt bằng AI; dùng ảnh thật ở `assets-source/photos/`.

4. Khi Codex hoàn thành, sửa `src/config/birthday.ts` thành tên/ngày sinh/lời chúc thực tế và kiểm tra ảnh hiển thị.

**Lưu ý riêng tư:** Ảnh gốc trong bundle là ảnh người thật. Không publish repo/assets công khai nếu chưa muốn chia sẻ. Khi deploy website public, ảnh phục vụ web cũng sẽ công khai với ai có URL.
