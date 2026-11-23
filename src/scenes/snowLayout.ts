import base from '../assets/snow-land.webp'
import point from '../assets/snow-land-point.webp'
import pat from '../assets/snow-land-pat.webp'
import hide1 from '../assets/snow-hide-1.png'
import tight1 from '../assets/snow-hide-tight-1.png'
import hide2 from '../assets/snow-hide-2.png'
import tight2 from '../assets/snow-hide-tight-2.png'
import hide3 from '../assets/snow-hide-3.png'
import tight3 from '../assets/snow-hide-tight-3.png'

/**
 * Cảnh ngắm tuyết. Toạ độ theo ảnh gốc 1672x941. Các ảnh dáng ngồi cùng một khung nên chuyển mờ là khớp.
 * `panes`: những ô kính trong, tuyết và hơi nước chỉ nằm trong các ô này (không đè lên khung gỗ).
 * `hide`: mặt nạ che hai người (tuyết ở phía sau kính nên phải đi sau lưng họ).
 */
export type Pose = { src: string; hide: string; tight: string }
export const SNOW = {
  w: 1672, h: 941,
  panes: [[254, 10, 158, 598], [457, 8, 936, 602], [1440, 8, 196, 602]] as [number, number, number, number][],
  /** Tâm của hai người (để căn khung trên điện thoại). */
  focus: { x1: 380, x2: 1260, y1: 120, y2: 900 },
  /** Hai ngọn nến (x, y, độ mạnh): khi tắt đèn, phòng tối đi và chỉ còn ánh các ngọn lửa này. */
  flames: [[75, 795, 1], [320, 700, 0.7]] as [number, number, number][],
  /** Chiếc đèn bàn to (chao kem) bên trái: bấm vào để tắt hoặc bật đèn. */
  lamp: [[190, 365], [320, 365], [350, 527], [262, 530], [262, 600], [270, 650], [265, 700], [240, 760], [222, 700], [232, 650], [232, 530], [145, 527]] as [number, number][],
  poses: [
    { src: base, hide: hide1, tight: tight1 },
    { src: point, hide: hide2, tight: tight2 },
    { src: pat, hide: hide3, tight: tight3 },
  ] as Pose[],
}
