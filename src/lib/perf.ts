import { store } from './storage'

/**
 * Đo tốc độ khung hình vài giây đầu của thế giới. Thấp hơn ngưỡng thì bật chế độ nhẹ (class `lite` trên <html>):
 * bớt hạt tuyết/bụi/lửa, bỏ hạt phim và các lớp sáng loang. Kết quả nhớ lại cho lần sau; ?lite=1 bật tay, ?lite=0 tắt.
 */
export function startPerfWatch() {
  const root = document.documentElement
  const q = new URLSearchParams(location.search).get('lite')
  if (q === '1') { root.classList.add('lite'); return () => {} }
  if (q === '0') { store.set('lite', false); return () => {} }
  if (store.get('lite', false)) { root.classList.add('lite'); return () => {} }
  let raf = 0, last = 0, n = 0, sum = 0, t0 = 0
  const frame = (t: number) => {
    if (!t0) t0 = t
    if (last && t - t0 > 600 && !document.hidden) { sum += t - last; n++ }
    last = t
    if (t - t0 < 4200) raf = requestAnimationFrame(frame)
    else if (n > 30) {
      const fps = 1000 / (sum / n)
      if (fps < 34) { root.classList.add('lite'); store.set('lite', true) }
    }
  }
  raf = requestAnimationFrame(frame)
  return () => cancelAnimationFrame(raf)
}
