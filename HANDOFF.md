# HANDOFF: Trang quà Giáng sinh cho Khánh Hạ

Brief gốc (7 cảnh, 4 món quà khóa theo giờ VN, trò chơi...) nằm trong file `christmas-world-brief.md` Long đã gửi. Mọi chữ hiển thị trên web dùng **tiếng Việt**, xưng "em" với Khánh Hạ. Nhánh làm việc: `claude/awesome-hypatia-psbikp`. Mỗi thay đổi: commit + push.

## Trạng thái hiện tại
Chỉ có **cổng mật khẩu + cảnh mở đầu (làng -> cánh cửa -> mở cửa)** là xong và đã được Long duyệt ("OK tốt rồi"). Các cảnh sau cánh cửa **đã xóa**, sẽ làm lại **từng cảnh một, mỗi cảnh Long duyệt xong mới làm tiếp**. Sau khi cửa mở xong, `App.tsx` chuyển sang `phase = 'world'` và hiện `<main className="world" />` rỗng.

## Chạy và xem
```bash
npm install
npx vite          # http://localhost:5173 (host: true, allowedHosts: true)
npx tsc -b        # kiểm tra kiểu
```
- Mật khẩu: `khanhha25122026` (lưu dạng hash SHA-256 trong `src/content/content.ts`, không lưu chữ thường).
- Trạng thái lưu `localStorage` tiền tố `olcw:` (`unlocked`, `opened`, `muted`). Xóa `olcw:opened` để mất nút "Bỏ qua".
- Bản xem trước trên Artifact: dựng `npx vite build --assetsInlineLimit 100000000`, gộp JS+CSS vào 1 file HTML, đăng lên https://claude.ai/artifact/Jg22BhS8eJBULaGtsnzhBx (artifact có thể không cập nhật được từ phiên mới, khi đó đăng bản mới).
- Chụp thử bằng Playwright (đã cài sẵn): chụp ở 1440x900, 993x893 và 390x844. Luôn tự xem ảnh chụp trước khi báo xong.

## Cấu trúc mã
- `src/App.tsx`: pha `gate` -> `door` -> `world`; khóa cuộn khi chưa vào `world`.
- `src/components/PasswordGate.tsx`, `SnowParticles.tsx` (tuyết canvas, sprite, có gió).
- `src/scenes/Door.tsx`: toàn bộ cảnh mở đầu. `doorGeometry.ts`: hình học vòm cửa + tay nắm + vòng hoa cho từng ảnh (LAND/PORT). `VillageLife.tsx`: khói ống khói, đèn nhấp nháy trên ảnh làng.
- `src/lib/`: `audio.ts` (âm thanh WebAudio tự tạo: gió, kẹt cửa, đập tường, vụt gió; nút loa), `storage.ts`, `device.ts`, `hash.ts`.
- `src/content/content.ts`: toàn bộ nội dung chữ + hash mật khẩu. Hiện chỉ có `door`, `gate`, `ui` (các mục `[ĐIỀN]` của brief sẽ thêm lại khi làm cảnh tương ứng, **không tự bịa nội dung cá nhân**).
- `src/assets/`: `door-land.jpg` (1680x944), `door-port.jpg` (944x1680), `village-land.webp` (1600x899), `village-port.webp` (449x799). Đây là ảnh AI do Long chọn/gửi; Canva tạo ảnh cho Claude chỉ trả bản xem trước nhỏ, nên Long phải tải ảnh đủ nét về rồi gửi lại.

## Cách cảnh mở đầu hoạt động (đã chốt, đừng đổi nếu Long không yêu cầu)
1. Ảnh làng (tuyết/khói/đèn do mã làm, ảnh không có tuyết) hiện dần, hai dòng chữ nằm trên mặt đường, rồi **một chuyển động zoom liền mạch** tới đúng ngôi nhà: ảnh làng và ảnh cận cảnh phóng cùng một hệ số, cửa hai ảnh chồng khít, ảnh cận cảnh hòa vào bằng rìa mềm (`.feather`, không blur). Sau ~10s nút "MỞ CÁNH CỬA" hiện.
2. Ảnh cửa phủ kín màn hình (`cover`); điện thoại quá dọc thì `contain` + phần nối là bản phản chiếu (`.mir`).
3. Cánh cửa là **khối đặc** (mặt trước, mặt sau tối, viền gỗ liền). Hai cánh được tách khỏi ảnh bằng canvas (texture dựng lúc tải), thụt sâu trong ô cửa (`RECESS`, `THICK`); phép lùi + phóng bù nằm ở wrapper `.door-recess` để khe giữa luôn nằm giữa.
4. **Vòng hoa nguyên vẹn treo trên CÁNH TRÁI** (tách khỏi ảnh theo màu + elip, vá gỗ theo thớ dọc, nhiều lớp để có độ dày + bóng). Vì nó nhô sang phía cánh phải, **cánh phải (trơn) phải mở trước**, cánh trái mở sau; đừng đảo thứ tự (lỗi cũ: vòng hoa bị cánh phải che).
5. Tay nắm: tách theo màu, mỗi cánh một khối đặc (các lớp cách nhau 0.8px).
6. Mở cửa: rung nhẹ, tuyết trượt khỏi dây thông (hạt bụi mịn, ít), cánh phải kẹt + mở, cánh trái mở, đập tường (rung màn hình), dừng một nhịp ngắm cửa mở, rồi lao vào giữa hai cánh, ánh hổ phách dịu tan vào cảnh kế tiếp.
7. Âm thanh chỉ phát sau thao tác đầu tiên (luật trình duyệt); gió rít nền, nút loa góc trên trái, nhớ lựa chọn.

## Việc còn lại (theo thứ tự brief, mỗi cảnh Long duyệt rồi mới làm tiếp)
- Cảnh tiếp theo: Long chưa chọn; đã đề xuất ngôi làng/hộp nhạc/bàn trà/cây thông.
- Khi làm cảnh sau: dựng lại xe tuần lộc bay theo cuộn, thanh tiến trình bánh gừng, các cảnh 02-07 (hộp nhạc YouTube, bàn trà, cây thông + 4 quà khóa theo `+07:00`, quả cầu tuyết, trò chơi, cảnh kết). Phiên bản 2D vẽ bằng SVG từng làm đủ 7 cảnh nhưng **Long đã bỏ** vì xấu; hãy dùng **ảnh AI do Long duyệt**, xếp lớp + chuyển động bằng mã. Có thể tham khảo mã cũ trong lịch sử git (commit "Dựng lại trang bằng SVG 2D").
- Thông tin Long cần cung cấp: nội dung `[ĐIỀN]` (thư, lời nhắn, 4 món quà, 5 link YouTube), ngoại hình 2 nhân vật cảnh cuối.
- Ảnh độ phân giải cao hơn (khoảng 2500-3000px ngang) cho cửa + làng để lúc zoom bớt mềm; muốn khớp tuyệt đối thì tạo lại ảnh cận cảnh từ chính ảnh làng.
- Chưa kiểm tra trên điện thoại thật; âm thanh chưa nghe thử (môi trường không có loa); chưa tối ưu thêm cho máy yếu (nếu giật có thể làm bản video dự phòng).

## Gotcha kỹ thuật đã gặp
- GSAP chuyển `transform: translate(-50%,-50%)` thành px cố định lúc set đầu, nên khung xem đổi kích thước thì lệch. Dùng thuộc tính riêng `translate: -50% -50%` hoặc flex để căn giữa.
- `will-change: transform` làm ảnh bị dựng ở độ phân giải thấp khi zoom, gây nhòe. Không dùng cho lớp phóng to.
- `filter`/`clip-path` trên phần tử con của `preserve-3d` có thể làm phẳng 3D; kiểm tra bằng ảnh chụp.
- Tên tệp ảnh Canva trả về chỉ là bản nhỏ (~200px); không dùng làm ảnh chính thức.

## Cảnh 4: hai chú mèo (Bông và Mochi)
- `src/scenes/Cats.tsx` + `catsLayout.ts`, nối sau cảnh cây thông trong `App.tsx` (cuộn xuống, có mũi tên `.scroll-cue`). Ảnh: `cats-land/port.webp` (ngủ), `cats-land/port-bong.webp` (Bông duỗi người). Ảnh Long tạo bằng công cụ khác, camera + sofa trùng khít nên chuyển mờ trong khung `bongRegion` là khớp.
- Bông (trắng pha xám) bên trái, Mochi (xám vằn) bên phải, cả hai là mèo cái. Viền từng bé tách bằng grabCut rồi chia tay theo đường cắt ở cằm Bông.
- Hover: ô nhỏ tên + thông tin. Bấm: bé đó duỗi người (chuyển mờ sang ảnh duỗi) rồi ngủ lại sau khoảng 3,6 giây.
- Mochi đã có ảnh duỗi người (`cats-land-mochi.webp`, `cats-port-mochi.webp`, mã tự nhận bằng import.meta.glob; không có thì chạy động tác nhẹ thay thế). Vùng thay ảnh: `bongRegion`, `mochiRegion` trong catsLayout.ts.
- Bông là bé của Long, Mochi là bé của Khánh Hạ. Chữ trong mục `cats` là bản nháp lời Long.
- Chuyển cảnh cây thông -> mèo: `WorldScroll.tsx` (khối `.xf` cao 240dvh, phần `sticky`), chạy theo thanh cuộn: cây thông phóng dần, mờ đi, vòng sáng vàng loang ra từ giữa để lộ cảnh mèo (clip-path circle). Không dùng filter blur (nặng máy). Cảnh không thấy thì tắt canvas (Tree `paused`, Cats `active`).
- Ảnh "Bông ngồi tỉnh táo" (cats-land-awake) Long gửi nhưng chưa dùng.
- Chữ tạm trong `content.ts` mục `cats`; chuyện riêng của hai bé chờ Long viết.

### Cập nhật cảnh mèo (lần 3)
- Bấm một bé: bé đổi dáng (Bông luân phiên duỗi người và ngồi tỉnh; Mochi duỗi người), rồi ngủ lại. Trong lúc đổi dáng không bấm được bé nào (`.cats-scene.busy .cat-hs { pointer-events: none }`).
- Ảnh dáng khác chỉ hiện ở chỗ khác với ảnh ngủ bằng mặt nạ mềm (`*-over.png`, tính từ hiệu giữa hai ảnh sau khi căn chỉnh) nên không có đường cắt. Hình bé để làm vầng sáng khi rê chuột: `*-mask.png` (tách bằng OpenCV grabCut). Script nằm ngoài repo; muốn làm lại ảnh mới thì tách lại theo cách trên.
- Ảnh Mochi duỗi người BẢN DỌC chưa có (ảnh gửi lệch khung với ảnh ngủ dọc nên không ghép được): cần chỉnh từ chính `cats-port.webp`. Hiện bản dọc Mochi chỉ cử động nhẹ.
- Ánh sáng bập bùng: `useFlicker` đặt `--fl` (cả phòng theo bếp) và `--fl2` (đèn lồng) liên tục. Tiếng gừ gừ `sfx.purr`, tiếng meo `sfx.meow` (WebAudio tự tạo, chưa nghe thử).
- Chuyển cảnh `WorldScroll.tsx`: dài hơn (SPAN = 1.7 lần chiều cao màn hình), vòng kẹo đỏ trắng xanh viền vàng, tuyết và sao vàng (canvas `Sparks`).

### Cập nhật cảnh mèo (lần 4)
- Đèn lồng bấm là bật hoặc tắt hẳn (không hẹn giờ): tắt thì `sfx.puff` + phòng tối (`--dark`, `lampT` trong `useFlicker`), bật lại thì `sfx.relight` bùng sáng rồi ổn định. Chữ cảnh mèo nằm góc dưới trái, tự bỏ bớt phần cho vừa khoảng trống dưới đèn lồng.
- Hoà âm theo cảnh: `sfx.mix(m)` trong `WorldScroll` (m chạy theo thanh cuộn): lửa nhỏ dần, gừ gừ lên, nhạc dịu bớt. `sfx.chime()` leng keng khi vòng kẹo bắt đầu loang (và khi cuộn ngược).
- Ô tối khi chuyển cảnh trên máy thật: đã tách lớp bằng `will-change` (`.xf-tree`, `.xf-cats > .tree-scene`); chưa xác nhận hết lỗi trên máy của Long.
- Việc còn lại (Long cần gửi): ảnh Mochi duỗi người BẢN DỌC (dạng tệp, chỉnh từ `cats-port.webp`), pose Bông ngồi tỉnh bản dọc, chuyện riêng của hai bé, quà 25/12 và 14/2, QR cho quà 8/1, ảnh thật của hai người, link YouTube hộp nhạc (nếu dùng).
- Cảnh kế tiếp theo thứ tự Long đặt: 2 bàn trà, 3 hộp nhạc (gắn Sugar Plum Fairy), 6 hai người ngắm tuyết (cần Long tả ngoại hình). Cách làm mỗi cảnh: tạo ảnh cho Long duyệt trước rồi mới viết mã; ảnh tạo bằng Canva chỉ ra bản nhỏ nên Long tự tạo và gửi lại; hai ảnh cùng một cảnh phải chỉnh từ ảnh nền (cùng khung).
