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

### Công tắc đèn chung (lần 5)
- `src/lib/lights.ts`: công tắc đèn dùng chung hai cảnh, nằm trong bộ nhớ (cuộn qua lại vẫn giữ, tải lại thì sáng lại). Cảnh mèo: bấm đèn lồng. Cảnh cây thông: nút bóng đèn dưới nút loa (góc trên phải). Tắt đèn ở cây thông: bỏ đèn lấp lánh và đèn lồng, phủ tối (`.tr-dark`, chừa vùng bếp lửa), còn ánh lửa, tuyết và cửa sổ.
- Khi cảnh mèo hiện ra trong lúc đèn đang tắt, phòng tối ngay (`useFlicker` lấy `k` ban đầu từ `lampT`).

### Cập nhật lần 5: tắt đèn, chuông, cảnh hộp nhạc
- Tắt đèn: đèn nhỏ trên cây (`Twinkles`) và đèn lồng (`Lamps`) nằm TRÊN lớp `.tr-dark` nên vẫn sáng, có vầng sáng loang ra quanh nó. Cảnh mèo: dây đèn sau lưng (`catsBulbs.ts`, toạ độ bóng tách bằng OpenCV top-hat, bản ngang + dọc) sáng lên theo `--dark` (`.cat-bulbs`). Chuông `sfx.chime` viết lại to và rõ hơn (6 nốt, hoạ âm kim loại, có bộ nén).
- Cảnh 5 hộp nhạc: `MusicBox.tsx` + `musicLayout.ts`. Ảnh Long gửi (chỉ có bản ngang 1672x941) được tách: `musicbox-land.webp` = ảnh nền ĐÃ BỎ vũ công (vá vân gỗ), `musicbox-ballerina.webp` = vũ công cắt rời (grabCut). Vũ công xoay giả 3D bằng scaleX = cos(góc), mặt sau tối hơn; bóng của cô đổ lên lòng nắp (cắt theo elip lòng nắp), lệch sang phải vì lửa ở bên trái, xoay theo cô và lay theo ánh lửa; có bóng tiếp xúc dưới chân. Bấm vũ công hoặc hộp: vặn khoá (`sfx.ratchet`), quay ~26s rồi giảm tốc dừng đúng lúc quay mặt trước. Nốt nhạc tạm `sfx.pluck` (NOTES trong MusicBox.tsx), CHỜ nhạc thật Long gửi (có thể gắn Sugar Plum Fairy thật). Đèn lồng trong ảnh bấm được: dùng chung công tắc đèn; tắt thì chỉ còn lửa, bóng đèn cây thông mờ phía sau và đèn lồng sáng.
- Chuyển cảnh mèo -> hộp nhạc (`WorldScroll.tsx`): màn ánh sáng vàng mặt nạ mềm kéo từ dưới lên (`--by`, `.xf-box`), dải sáng ở mép, nốt nhạc và tia sáng bay lên (`Notes`), `sfx.sparkle()` khi bắt đầu, `sfx.stageBox()` hoà âm (tắt lửa/gừ gừ, nhạc nền to lên). Hằng số SPAN2, HOLD, END; chiều cao `.xf` tính trong mã.
- Chữ hộp nhạc trong content.ts mục `musicbox` là nháp của em. Vùng bấm sách và cành thông là đa giác vẽ tay (chưa grabCut).
- Chưa có: bản dọc riêng của ảnh hộp nhạc (đang dùng cùng ảnh ngang, cắt theo hộp), nhạc thật, tiếng đã nghe thử.

### Thứ tự cảnh mới (Long yêu cầu: hộp nhạc đứng TRÊN cây thông)
- Sau cánh cửa: hộp nhạc (cảnh đầu, đứng yên HOLD0) -> màn ánh sáng vàng kéo từ dưới lên (SPAN2, mặt nạ ở `.xf-tree`) -> cây thông (đứng yên HOLD) -> vòng kẹo (SPAN) -> hai chú mèo. Mọi hằng số và công thức q/p ở `WorldScroll.tsx`; mục "Chuyển cảnh mèo -> hộp nhạc" ở trên nay là hộp nhạc -> cây thông. Hộp nhạc có nút loa + bóng đèn riêng (vì cây thông ẩn lúc đầu).
- Xoay giả vũ công đã bỏ (trông dẹt): tạm chỉ lắc nhẹ. Chờ Long gửi chuỗi ảnh vũ công quay 8 góc (45..315) + ảnh hộp đóng + hộp hé mở 35 và 70 độ, cùng khung 1672x941 với ảnh gốc. Hộp nhạc sẽ kiểu playlist (đóng/mở, danh sách bài), không phải nhạc thật.

### Hộp nhạc có đóng, hé, mở và danh sách nhạc (lần 6)
- Long gửi ba ảnh cùng khung: đóng, hé mở, mở hẳn (có vũ công). `musicLayout.ts`: `imgs.closed/ajar/open`. Ảnh `musicbox-open.webp` là ảnh mở hẳn đã BỎ vũ công (vá vân gỗ), vũ công cắt rời `musicbox-ballerina.webp`. Chuyển mờ chồng ảnh theo `lid` (0 đóng, 1 hé, 2 mở). Bấm hộp: `sfx.ratchet`, hé 0,75s rồi mở hẳn và `sfx.playMusic()`; bấm lại thì đóng.
- Danh sách nhạc (`.mb-playlist`, nội dung `musicbox.tracks` trong content.ts): bài 1 là Sugar Plum Fairy (nhạc nền có sẵn, điều khiển bằng `sfx.playMusic/pauseMusic/toggleMusic/seekMusic/musicClock`), hai bài sau là chỗ trống `soon: true` chờ Long. Muốn thêm bài thật: cần nhiều nguồn nhạc; hiện sfx chỉ có một `music`, phải mở rộng thành danh sách.
- Vũ công không xoay nữa (xoay giả trông dẹt): lắc nhẹ + bóng đổ khi nhạc chạy. Nếu Long gửi chuỗi ảnh xoay các góc thì thay bằng đổi khung ảnh theo góc.
- Bấm vũ công khi nắp mở = phát/dừng nhạc. Sách và cành thông giữ nguyên (viền grabCut, giấy cổ).

### Lần 7: mượt hơn, nhẹ hơn, bảng âm lượng, Last Christmas
- Nhạc: `src/assets/music/<id>.mp3` tự được nhận (id trong `musicbox.tracks`). Đã có `last-christmas.mp3` (nén 88 kbps) và `sugarplum-fairy.mp3` (nén 96 kbps); `nutcracker`, `feliz-navidad` chờ Long. Nhạc chỉ tải khi chọn bài (lúc build thường, tệp tách riêng); bản Artifact thì nhúng cả vào HTML nên phải giữ tổng dưới 16MB.
- Âm thanh: `sfx` có ba nhóm âm lượng (`vol.music/amb/fx`, nhớ trong localStorage) qua hai GainNode `amb` và `fx` nối vào `master`; thêm tiếng ở mức nào cũng phải nối vào `this.fx` (hiệu ứng) hoặc `this.amb` (nền), không nối thẳng `master`. `components/SoundControl.tsx` là nút loa chung kèm bảng chỉnh (cửa, hộp nhạc, cây thông). Đổi bài mờ dần (`fade`).
- Tải: `components/Loader.tsx` (màn chờ bông tuyết), `lib/preload.ts` (tải sẵn ảnh cảnh sau, theo thứ tự hộp nhạc, cây thông, mèo), `lib/perf.ts` (đo fps 4 giây đầu, thấp thì thêm class `lite` trên `<html>` và nhớ; `?lite=1` bật, `?lite=0` tắt; trong môi trường vẽ phần mềm của em nó luôn bật). CSS `.lite` bỏ hạt phim, bụi, lớp sáng loang; `isLite()` giảm hạt trong Tree/WorldScroll.
- Cảnh không hiện thì `.idle` dừng mọi hoạt ảnh CSS (class đặt ở `WorldScroll`).
- Gợn chạm vàng + rung nhẹ trên điện thoại: `lib/ripple.ts`. Vùng chạm lớn hơn trên máy cảm ứng, `robots.txt` chặn hết, thẻ noindex/noarchive/no-referrer.
- Chuyển cảnh: cả hai lần đều có bloom vàng, nốt nhạc và sao bay lên; `--bloom` dùng chung.
- Kiểm thử: kịch bản Playwright ở /tmp (không nằm trong repo) chạy cổng mật khẩu, cửa, thế giới, hộp nhạc, bảng âm lượng trên máy tính, iPhone 13 và Pixel 7 (giả lập bằng Chromium), và khoá quà theo ngày bằng ?date= (chỉ chạy ở chế độ dev).

### Lần 8
- Cảnh cửa: bỏ hết chữ và nút "MỞ CÁNH CỬA". `Door.tsx` có `.door-hit` (nút trong suốt trùm lên cánh cửa, bấm là mở) và hoạt ảnh gợi ý bàn tay nhấn kèm gợn sáng vàng ở chỗ tay nắm; chỉ hiện khi máy quay đã tới sát cửa. Nội dung `content.door.line1/line2/button` không còn dùng.
- Hình minh hoạ mới trong `Icons.tsx`: `BasketIcon` (giỏ củi), `PaintingIcon` (bức tranh, `snow` cho tranh thứ hai), gắn trong `iconFor` ở `Letter.tsx`. Các vật còn dùng hình chung: shelf, tools, garland, chair, rug, tree, window, curtainL/R.

### Bản xem thử nối ba phần
- Bản Artifact build bằng `VITE_PREVIEW=1 npx vite build --assetsInlineLimit 100000000`: có thanh "Xem nhanh" (`components/PreviewBar.tsx`) nhảy thẳng tới Cổng, Cánh cửa, Hộp nhạc, Cây thông, Hai bé, và mở thẳng bằng `#hop-nhac`, `#cay-thong`, `#meo`. Bản chính thức (không đặt biến) KHÔNG có thanh này nên mật khẩu và cánh cửa vẫn như cũ. Nhảy cảnh trong thế giới dùng sự kiện `olcw:goto` (WorldScroll).

### Lần 9: vũ công xoay bằng ảnh thật, bỏ thanh xem nhanh
- Đã GỠ thanh "Xem nhanh" và `VITE_PREVIEW` (Long không cần; trang vốn là một trang kéo xuống). Bản Artifact build như thường: `npx vite build --assetsInlineLimit 100000000`. Sự kiện `olcw:goto` trong WorldScroll còn đó nhưng không ai gọi.
- Vũ công: Long gửi 6 ảnh xoay (cùng khung với ảnh hộp nhạc đầu tiên, nắp dựng đứng). Chỉ 3 ảnh đồng nhất (có vương miện): mặt trước và hai dáng quay lưng; ba ảnh kia tóc búi không vương miện nên không dùng. Cắt rời bằng grabCut + hiệu với ảnh nền, lưu `musicbox-dancer-0/1/2.webp`, đặt lên đĩa đồng của ảnh mở hẳn (thu 0,95). `MusicBox.tsx` xoay theo góc: mặt trước quanh 0 độ, lưng quanh 165 và 195 độ, giữa hai mặt thì hoà ảnh + co ngang tối đa 42% (chưa có ảnh nghiêng 90 và 270 độ). Dừng nhạc thì quay nốt về mặt trước.
- Muốn xoay thật hơn: cần Long tạo thêm ảnh nghiêng trái, nghiêng phải (và chéo 45, 315 độ), giữ vương miện và cùng khung.

- Vũ công (sửa lần 2): bỏ hoà ảnh theo góc (gây bóng ma chồng hai hình). Giờ là nhịp: đứng mặt trước 2,4s, lật nửa vòng 0,9s (co ngang còn 20% rồi đổi ảnh đúng lúc mỏng nhất), đứng mặt lưng 2,4s, lật về; mỗi lượt xen hai dáng lưng. Dừng nhạc thì quay nốt về mặt trước. Hằng số HOLD, FLIP trong MusicBox.tsx. Muốn mượt thật hơn cần ảnh nghiêng 90 và 270 độ.

### Lần 10
- `lib/weather.ts`: gió và độ dày dùng chung (WindowSnow, Dust, tuyết chuyển cảnh) để cuộn qua cảnh tuyết không bị ngắt nhịp.
- Chuyển cảnh nào cũng có chuông + chùm nốt lấp lánh (`sfx.chime` + `sparkle`). Trên cảm ứng, ngừng vuốt giữa hai cảnh thì tự trượt tới cảnh gần nhất (WorldScroll, `snap`).
- Âm thanh: `sfx.fireNear(x)` (con trỏ gần mép trái thì lửa rõ hơn), `sfx.tap(kind)` tiếng chạm gỗ/giấy/chuông nhỏ gọi từ `lib/ripple.ts`.
- Điện thoại: mũi tên cuộn dời xuống dưới nút đèn (trước đó đè lên nhau); hộp nhạc dọc tính tỉ lệ theo phần ảnh nhìn thấy nên hộp hiện trọn. Đã chụp ở 320x568, 360x640, 390x844, 412x915, 430x932: không tràn ngang.

- Vũ công quay có khối (thay cho lật phẳng): `lib/figurine.ts` dựng lại mỗi khung hình từ hai ảnh (trước, lưng): thân/váy/chân là mặt trụ quay quanh trục đứng (bán kính theo hàng, váy lấy theo bề rộng thật), hai tay là tấm phẳng co theo cos; rìa tối dần; gần 90 độ hoà hai ảnh. Quay liên tục ~6,5s/vòng, chậm ở mặt trước và lưng, lướt nhanh qua hai bên (vì chưa có ảnh nghiêng, hai bên bị méo). Bóng vẽ cùng lượt tính (canvas `.mb-shadow`). Có ảnh nghiêng 90/270 độ thì thêm làm tham số để hai bên đẹp thật.

- Vũ công (sửa lần 3, bản đang dùng): mặt trụ chỉ đẹp trong khoảng 20 độ quanh mặt trước và mặt lưng, quay ngang hơn thì méo (hai ảnh khác tư thế). Nên nhịp là: lắc ±20 độ hai nhịp ở mặt trước, lướt nửa vòng 0,55s bằng tấm phẳng kèm nhoè (k=0 trong `Figurine.render`), lắc ở mặt lưng, lướt về. Dừng nhạc thì dừng đúng chính diện. Muốn quay vòng thật cần ảnh nghiêng 90/270 độ.

- Vũ công hiện chỉ lắc trái phải ±22 độ quanh mặt trước (không lướt sang lưng, theo yêu cầu của Long). SEG trong MusicBox.tsx rất lớn để tắt phần lướt.

## Cập nhật (phiên mới): ánh sáng theo giờ thật + cảnh ngắm tuyết
> Lưu ý: các mục hộp nhạc (3 trạng thái, vũ công lắc ±22°, danh sách phát, chế độ nhẹ `.lite`, tải sẵn ảnh) nằm ở các commit trước, chưa được ghi chi tiết ở trên. Đọc `MusicBox.tsx`, `musicLayout.ts`, `perf.ts`, `preload.ts` khi cần.

### Ánh sáng theo giờ thật (`src/lib/timeOfDay.ts`)
- Lấy giờ máy người xem, cập nhật mỗi phút, đặt các biến CSS `--tod-sky`, `--tod-wash`, `--tod-in`, `--tod-beam` trên `<html>`. Thử giờ bất kỳ: `?h=14.5`.
- Ảnh làng gốc là đêm, nên ban đêm giữ nguyên. Ban ngày/bình minh/hoàng hôn: lớp `.door-tod` (trong `Door.tsx`) đổi màu bầu trời theo gradient từ trên xuống + lớp phủ rất nhẹ. Không dùng filter.
- Trong nhà: `.tod-in` (App, cố định z-index 30, không bắt chuột) phủ rất nhẹ + hai dải sáng xiên (`::before`) khi trời sáng. Dải sáng khá mờ trên nền hổ phách, chưa xác nhận trên máy thật.

### Cảnh 5: ngắm tuyết (`SnowWatch.tsx`, `snowLayout.ts`)
- Nằm sau `.xf` trong `WorldScroll.tsx` (cuộn thường, chưa có chuyển cảnh riêng).
- Ảnh Long gửi (khung 1672x941): `snow-land.webp` (ngồi sát), `snow-land-point.webp` (chỉ tay). KHÔNG còn bấm: bộ hẹn giờ trong `SnowWatch` cứ 14-32 giây một lần bắn sao băng; ~75% các lần hai người ngẩng chỉ tay đúng lúc (chuyển mờ ~6,5 giây rồi về), số còn lại chỉ có sao băng.
- Mặt nạ hai người (grabCut + tinh chỉnh tay): `snow-hide-*.png` (che tuyết/hơi nước, để chúng ở SAU lưng hai người), `snow-cut-*.png` (vầng sáng khi rê chuột). Mặt nạ đổi theo dáng ở giữa lúc chuyển mờ. Viền bấm = `poly` trong `snowLayout.ts`.
- Ô kính (`panes`) quy định nơi tuyết và hơi nước được phép xuất hiện (không đè lên khung gỗ).
- Tuyết 3 lớp xa gần theo gió chung (`weather`). Hơi nước: bảng độ lau `Uint8Array`, rê chuột (hoặc kéo ngón tay, `touch-action: pan-y`) để lau, tự phủ lại ~30 giây, thỉnh thoảng một giọt nước chảy thành vệt. Chỉ tính lại khi có thay đổi. Cảnh không hiện thì dừng (`IntersectionObserver`).
- CHƯA có: ảnh dọc cho điện thoại (hiện cắt cover quanh hai người, `focus` trong layout), ảnh bấm riêng cho sao băng (sao băng vẽ bằng mã), âm thanh cho cảnh này, chữ chính thức (chữ hiện tại trong mục `snow` của `content.ts` là bản nháp).
- Mặt nạ làm bằng script ngoài repo; muốn đổi ảnh thì tách lại bằng grabCut (xem cách làm ở phần mèo).

### Tắt đèn ở cảnh ngắm tuyết + chuyển cảnh mèo -> ngắm tuyết (đã làm lại)
- Chuyển cảnh từ cây thông trở xuống (cây thông -> hai bé, hai bé -> ngắm tuyết) là **lá thư bay vụt qua** (Long KHÔNG muốn đóng mở thư): một phong bì cỡ cả màn hình, thu nhỏ lúc bay tới (cong, từ dưới phải), phóng lên che kín màn hình, cảnh bên dưới đổi tức thì lúc vừa che kín (`NEXT = 0.64`), rồi phong bì phóng tiếp ~3,4 lần, trôi lệch và mờ dần như bay vụt qua máy quay; dấu sáp mờ sớm hơn. Giấy màu dịu (không chói khi che kín màn hình). Một phần tử dùng chung `.xf-letter` (các lớp `.xl-*`; KHÔNG dùng tiền tố `lt-` vì đã có `.lt-*` ở cảnh khác). Biến `--lx --ly --lr --ls --lo --lso --lsh --lv` tính trong `apply()` của `WorldScroll.tsx` từ `lt` (= `p` hoặc `r`). Hằng số: `HOLD3`, `SPAN3`, `Y_CATS`, `Y_SNOW`. Giảm chuyển động: bỏ lá thư, đổi cảnh ở nửa chặng. Nắp phong bì vẫn còn trong mã nhưng luôn đóng.
- Cảnh ngắm tuyết đã làm dịu: tuyết ít và nhỏ hơn, rơi chậm hơn; ánh ấm trên người và ánh nến nhẹ hơn; chuyển dáng ngồi chậm (1,6 s); vầng sáng đèn bàn nhẹ hơn.
- Thanh chấm thứ tư "Ngắm tuyết", bảng `stopsAt` (tự trượt trên điện thoại) và sự kiện `olcw:goto` (chỉ số 3).
- Tắt đèn: dùng chung `lights`. Bản đồ tối và ánh ấm được **dựng sẵn thành ảnh WebP** (`snow-dark-*.webp`, `snow-warm-*.webp`, khung 836x470, kéo giãn ra khung ảnh) bằng `python3 tools/snow/bake-light.py` (cần numpy, opencv-python-headless, pillow; hình cắt hai người `tools/snow/cut-*.png`); chỉ đổi `opacity` khi bật/tắt nên không có mặt nạ CSS phải tính lại mỗi khung (bản trước dùng `mask-composite` + `clip-path` nhiều lớp, nghi là nguyên nhân nháy đen trên máy thật). Giải mã sẵn mọi ảnh phụ khi vào cảnh. Cảnh cuối tắt hai lớp `soft-light` toàn màn hình của `.xf-sticky` (`data-scene="snow"`). Ánh nến `.sw-flame` vẫn chập chờn (nhẹ). Ánh sáng theo MỘT trường sáng chung hình elip (`LIT` trong `SnowWatch.tsx`) cho cả đồ vật lẫn hai người, cộng quầng sát nến: nến nằm phía trước lưng họ nên cả lưng, vai, chăn, bàn được chiếu, sáng nhất ở phía dưới và nhạt dần lên đầu (KHÔNG còn một đốm sáng quanh nến). Cây thông và đèn bàn bên trái tắt hẳn (lớp tối riêng). Ánh xanh lạnh của tuyết phủ lên đỉnh đầu và vai.
- Chưa có: ảnh dọc cho điện thoại, âm thanh cho cảnh này, nút loa trong cảnh này.

### Cập nhật cảnh ngắm tuyết: đèn bàn bấm được + ánh nến hắt lên hai người
- Bấm chiếc đèn bàn bên trái (`SNOW.lamp`, đa giác theo ảnh gốc) để tắt/bật đèn (công tắc chung `lights`); rê chuột thì đèn sáng khẽ kèm bụi sao (`LitSpot`), thỉnh thoảng gợi ý nhẹ (`useHintPulse`). Nút bóng đèn góc trên phải vẫn còn.
- (Đã thay bằng trường sáng elip, xem mục trên.) Trước đây độ tối chỉ theo khoảng cách tới ba ngọn nến (`bodyHoles`). Nến nằm phía trước hai người (bàn trà bên trái, đèn lồng bên phải), nên ánh nến ấm (`warmBg`) hắt lên lưng và vai họ, mạnh ở phía gần nến; ánh xanh lạnh của tuyết ngoài cửa sổ phủ lên đỉnh đầu và vai. Hai lớp ấm (người / chăn+bàn) bù nhau theo gradient dọc nên không có ranh giới ở thắt lưng. Cây thông và đèn bàn tắt hẳn (lớp tối riêng), chỉ nến còn sáng.

### Cảnh ngắm tuyết: sao băng nhiều kiểu, tuyết bám ngoài cửa, ánh sáng hợp lý hơn
- **Hết "đèn nháy":** nguyên nhân là gợi ý định kỳ của đèn bàn (`useHintPulse` làm đèn sáng vọt mỗi 8-14 giây, trông như đèn bật tắt). Đã bỏ; đèn bàn chỉ sáng khẽ khi rê chuột.
- **Sao băng 5 kiểu** (`Meteors`, `KINDS` trong `SnowWatch.tsx`): trắng xanh (hay gặp), vàng bay chậm rắc tia lấp lánh, hai sao song song, sao chổi lớn xanh ngọc (hiếm), mưa sao nhỏ (vài vệt mảnh liên tiếp). Hướng phần lớn xuống trái, đôi khi xuống phải. Xem thử một kiểu: thêm `?meteor=gold` (classic, gold, twin, comet, shower) vào địa chỉ.
- **Tuyết bám ngoài cửa** (`ClingSnow`): đụn tuyết tích trên bậu cửa phía ngoài (mép gồ ghề, dồn lên sát khung gỗ), tuyết dính dọc mép khung, hàng trăm cụm nhỏ dính trên kính (nhiều ở dưới và quanh mép). Dày dần trong ~45 giây đầu rồi đứng yên (không tốn tính toán nữa); mức dày nhớ giữa các lần vào cảnh. Thứ tự lớp: sao băng -> tuyết rơi -> tuyết bám -> hơi nước.
- **Ánh sáng khi tắt đèn** (bake trong `tools/snow/bake-light.py`): hai người nhẹ hơn phòng (.62 so với .88; lưng quay về phía nến nên còn thấy sợi tóc, vân áo), mặt nạ thu về đúng mép thật (hết quầng tối quanh đầu), một đường sáng lạnh mảnh ngay trong mép (ánh tuyết ngoài cửa chiếu vào mặt trước họ, nhìn từ phía sau chỉ thấy viền), và dải ánh tuyết lạnh nhạt trên bậu cửa, gối và mặt chăn gần cửa sổ.

### Cảnh ngắm tuyết: hai người chìm vào bóng + nhẹ máy hơn
- Khi tắt đèn, hai người gần như chìm hẳn vào bóng (độ tối .975), chỉ còn đường viền lạnh mảnh của ánh tuyết ngoài cửa sổ; chỉ phần chăn, gối và mặt bàn gần nến mới sáng (vùng sáng `LIT` trong `tools/snow/bake-light.py` hẹp và thấp). Các lỗ trong hình cắt (phần khăn) đã được lấp, `snow-hide-*.png` cũng do script này sinh ra. Chạy lại script sau mỗi lần sửa.
- Làm nhẹ cảnh cuối (Long muốn "nhẹ bớt"): tuyết rơi 70 hạt, vẽ 30 khung/giây; bỏ bụi vàng `Dust`; sao băng không vẽ gì khi không có sao nào; tuyết bám vẽ lại 10 lần/giây trong lúc dày lên rồi đứng yên; hơi nước chỉ vẽ lại tối đa ~22 lần/giây, ít giọt tròn, ít hạt li ti và tối đa 2 giọt chảy cùng lúc, thưa hơn.

### Lượt sửa: viền đèn lồng, con trỏ riêng, thanh chấm, bóng cảnh cuối, chuyển cảnh bông tuyết
- **Viền đèn lồng (cảnh mèo)** trước là hình chữ nhật nên lộ mép khi rê chuột; đã cắt lại bằng grabCut (`lampPoly` trong `catsLayout.ts`, cả ngang và dọc; script `tools/snow/cut-lantern.py`, đường dẫn trong script là của môi trường cũ, sửa khi dùng lại). Đèn bàn cảnh ngắm tuyết (`SNOW.lamp`) cũng được vẽ bám hơn.
- **Con trỏ riêng** `src/components/Cursor.tsx`: chấm sáng + vòng đi trễ, vật bấm được thì vòng nở ra, bấm thì gợn một vòng; chỉ bật với chuột thật (`pointer: fine`), tắt khi giảm chuyển động; thêm class `has-cursor` lên `<html>` để ẩn con trỏ gốc.
- **Thanh chấm cảnh** (`.xf-dots`): viên thuốc mờ, sợi chỉ vàng nối các nút hình thoi, nút hiện tại to và phát sáng, phần đã đi qua của sợi chỉ sáng hơn (`--prog`).
- **Cảnh ngắm tuyết, tắt đèn**: hai người tối vừa phải (.8), tóc cô gái được nâng sáng riêng (elip quanh đầu, chỉ những điểm tối) để thấy rõ sợi tóc và chóp đỏ. Đã kiểm bằng mã: tuyết rơi, sao băng, tuyết bám, hơi nước chỉ nằm trong ô kính (không còn bụi hạt trong phòng; đó là `Dust` đã bỏ ở lượt trước).
- **Chuyển cảnh bông tuyết** (hai bé -> ngắm tuyết, thay cho lá thư ở lần chuyển này): `.xf-flake` (lõi lục giác `.xf-hex` + SVG sáu nhánh), biến `--fs --fr --fo --fv` tính trong `apply()`; lõi phóng to che kín màn hình, cảnh đổi tại `NEXTR = 0.54`, rồi tan dần. Lá thư vẫn dùng cho cây thông -> hai bé. `SPAN3 = 1.25`.
