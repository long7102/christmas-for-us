import base from '../assets/snow-land.webp'
import point from '../assets/snow-land-point.webp'
import hide1 from '../assets/snow-hide-1.png'
import hide2 from '../assets/snow-hide-2.png'

/**
 * Cảnh ngắm tuyết. Toạ độ theo ảnh gốc 1672x941. Các ảnh dáng ngồi cùng một khung nên chuyển mờ là khớp.
 * `panes`: những ô kính trong, tuyết và hơi nước chỉ nằm trong các ô này (không đè lên khung gỗ).
 * `hide`: mặt nạ che hai người (tuyết ở phía sau kính nên phải đi sau lưng họ);
 */
export type Pose = { src: string; hide: string }
export const SNOW = {
  w: 1672, h: 941,
  panes: [[285, 0, 135, 636], [480, 0, 818, 636], [1360, 0, 262, 636]] as [number, number, number, number][],
  /** Tâm của hai người (để căn khung trên điện thoại). */
  focus: { x1: 380, x2: 1260, y1: 120, y2: 900 },
  poses: [
    { src: base, hide: hide1 },
    { src: point, hide: hide2 },
  ] as Pose[],
}
