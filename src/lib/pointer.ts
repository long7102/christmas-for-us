/**
 * Vị trí con trỏ chuột dùng chung cho các hạt (bụi sáng, tàn lửa, tuyết) để chúng khẽ tản ra khi con trỏ lướt qua.
 * Chỉ dành cho chuột thật: cảm ứng, chế độ nhẹ và giảm chuyển động thì không dùng.
 */
import { isLite, reducedMotion } from './device'

const ptr = { x: -9999, y: -9999, on: false }
let started = false

export function trackPointer() {
  if (started) return
  started = true
  addEventListener('pointermove', (e) => { if (e.pointerType === 'touch') return; ptr.x = e.clientX; ptr.y = e.clientY; ptr.on = true }, { passive: true })
  document.documentElement.addEventListener('pointerleave', () => { ptr.on = false })
}

/** Có nên cho hạt phản ứng với con trỏ không (gọi một lần lúc dựng hiệu ứng). */
export function pointerReactive() {
  const ok = !reducedMotion() && !isLite() && typeof matchMedia !== 'undefined' && matchMedia('(pointer: fine)').matches
  if (ok) trackPointer()
  return ok
}

/** Toạ độ con trỏ trong hệ toạ độ của canvas (rộng cw, cao ch), hoặc null khi không có chuột. */
export function pointerIn(cv: HTMLElement, cw: number, ch: number): { x: number; y: number } | null {
  if (!ptr.on) return null
  const r = cv.getBoundingClientRect()
  if (!r.width || !r.height) return null
  return { x: ((ptr.x - r.left) * cw) / r.width, y: ((ptr.y - r.top) * ch) / r.height }
}
