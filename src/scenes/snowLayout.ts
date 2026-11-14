import base from '../assets/snow-land.webp'
import point from '../assets/snow-land-point.webp'
import hide1 from '../assets/snow-hide-1.png'
import hide2 from '../assets/snow-hide-2.png'
import dark1 from '../assets/snow-dark-1.webp'
import dark2 from '../assets/snow-dark-2.webp'
import warm1 from '../assets/snow-warm-1.webp'
import warm2 from '../assets/snow-warm-2.webp'

/**
 * Cảnh ngắm tuyết. Toạ độ theo ảnh gốc 1672x941. Các ảnh dáng ngồi cùng một khung nên chuyển mờ là khớp.
 * `panes`: những ô kính trong, tuyết và hơi nước chỉ nằm trong các ô này (không đè lên khung gỗ).
 * `hide`: mặt nạ che hai người (tuyết ở phía sau kính nên phải đi sau lưng họ).
 */
export type Pose = { src: string; hide: string }
/** Bản đồ ánh sáng khi tắt đèn, dựng sẵn cho từng dáng ngồi (khung 836x470, kéo giãn ra khung ảnh): lớp tối (cả phòng + hai người, theo một trường sáng chung quanh các ngọn nến) và lớp ánh ấm. */
export const LM = { dark: [dark1, dark2], warm: [warm1, warm2] }
export const SNOW = {
  w: 1672, h: 941,
  panes: [[285, 0, 135, 636], [480, 0, 818, 636], [1360, 0, 262, 636]] as [number, number, number, number][],
  /** Tâm của hai người (để căn khung trên điện thoại). */
  focus: { x1: 380, x2: 1260, y1: 120, y2: 900 },
  /** Ba ngọn nến (x, y, độ mạnh): khi tắt đèn, phòng tối đi và chỉ còn ánh các ngọn lửa này. */
  flames: [[345, 912, 1], [264, 801, 0.7], [1608, 815, 1]] as [number, number, number][],
  /** Chiếc đèn bàn bên trái: bấm vào để tắt hoặc bật đèn. */
  lamp: [[0, 487], [103, 487], [147, 666], [147, 677], [66, 679], [64, 702], [97, 724], [99, 788], [62, 800], [0, 800]] as [number, number][],
  poses: [
    { src: base, hide: hide1 },
    { src: point, hide: hide2 },
  ] as Pose[],
}
