import base from '../assets/snow-land.webp'
import point from '../assets/snow-land-point.webp'
import pat from '../assets/snow-land-pat.webp'
import hide1 from '../assets/snow-hide-1.png'
import hide2 from '../assets/snow-hide-2.png'
import hide3 from '../assets/snow-hide-3.png'
import dark1 from '../assets/snow-dark-1.webp'
import dark2 from '../assets/snow-dark-2.webp'
import dark3 from '../assets/snow-dark-3.webp'
import warm1 from '../assets/snow-warm-1.webp'
import warm2 from '../assets/snow-warm-2.webp'
import warm3 from '../assets/snow-warm-3.webp'

/**
 * Cảnh ngắm tuyết. Toạ độ theo ảnh gốc 1672x941. Các ảnh dáng ngồi cùng một khung nên chuyển mờ là khớp.
 * `panes`: những ô kính trong, tuyết và hơi nước chỉ nằm trong các ô này (không đè lên khung gỗ).
 * `hide`: mặt nạ che hai người (tuyết ở phía sau kính nên phải đi sau lưng họ).
 */
export type Pose = { src: string; hide: string }
/** Bản đồ ánh sáng khi tắt đèn, dựng sẵn cho từng dáng ngồi (khung 836x470, kéo giãn ra khung ảnh): lớp tối (cả phòng + hai người, theo một trường sáng chung quanh các ngọn nến) và lớp ánh ấm. */
export const LM = { dark: [dark1, dark2, dark3], warm: [warm1, warm2, warm3] }
export const SNOW = {
  w: 1672, h: 941,
  panes: [[254, 10, 158, 598], [457, 8, 936, 602], [1440, 8, 196, 602]] as [number, number, number, number][],
  /** Tâm của hai người (để căn khung trên điện thoại). */
  focus: { x1: 380, x2: 1260, y1: 120, y2: 900 },
  /** Hai ngọn nến (x, y, độ mạnh): khi tắt đèn, phòng tối đi và chỉ còn ánh các ngọn lửa này. */
  flames: [[75, 795, 1], [320, 700, 0.7]] as [number, number, number][],
  /** Chiếc đèn lồng nhỏ có nến ở góc dưới trái: bấm vào để tắt hoặc bật đèn. */
  lamp: [[40, 650], [110, 650], [140, 700], [140, 865], [8, 865], [8, 700]] as [number, number][],
  poses: [
    { src: base, hide: hide1 },
    { src: point, hide: hide2 },
    { src: pat, hide: hide3 },
  ] as Pose[],
}
