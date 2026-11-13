/**
 * "Thời tiết" chung của cả trang: một hàm theo thời gian duy nhất cho gió và độ dày tuyết/bụi,
 * để các cảnh dùng cùng hướng gió và cùng nhịp. Cuộn từ cảnh này sang cảnh khác, tuyết không bị ngắt rồi bắt đầu lại.
 */
export const weather = {
  /** Sức gió (đơn vị tuỳ chỗ dùng, quanh 14, dao động chậm kèm những cơn gió giật ngắn). */
  gust(t: number) { return 14 + Math.sin(t / 2600) * 9 + Math.sin(t / 900) * 3 + Math.max(0, Math.sin(t / 7300)) * 6 },
  /** Gió đã chuẩn hoá 0..1 để dùng cho hạt bụi, ánh sáng. */
  wind(t: number) { return Math.min(1, Math.max(0, (this.gust(t) - 2) / 32)) },
  /** Hạt bụi và tuyết trôi theo gió: -1..1, cùng hướng ở mọi cảnh. */
  sway(t: number, ph = 0) { return Math.sin(t / 2300 + ph) * 0.6 + (this.wind(t) - 0.4) * 0.8 },
}
