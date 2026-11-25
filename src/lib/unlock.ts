/** Absolute instants with +07:00, so the lock follows Vietnam time on any device. Dev-only ?date= override. */
export function now(): number {
  if (import.meta.env.DEV) {
    const d = new URLSearchParams(location.search).get('date')
    if (d) { const t = Date.parse(d); if (!Number.isNaN(t)) return t }
  }
  return Date.now()
}
/** Chế độ xem trước của Long: nhớ trong localStorage, bật bằng ?xem=<mã>, tắt bằng ?xem=off hoặc nút "Thoát". */
const PREVIEW_KEY = 'olcw:preview'
/** Cờ xem trước chỉ là tiện ích cho chủ trang (không phải bảo vệ thật) nên tự hết hạn sau 2 giờ, tránh nằm lại trên máy người khác. */
const PREVIEW_TTL = 2 * 3600 * 1000
export function previewOn(): boolean {
  try {
    const t = Number(localStorage.getItem(PREVIEW_KEY))
    if (t > 0 && Date.now() - t < PREVIEW_TTL) return true
    localStorage.removeItem(PREVIEW_KEY)
  } catch { /* bỏ qua */ }
  return false
}
export async function initPreview(): Promise<void> {
  const code = new URLSearchParams(location.search).get('xem')
  if (code === null) return
  try {
    if (code === 'off') { localStorage.removeItem(PREVIEW_KEY); return }
    const { sha256 } = await import('./hash')
    const { PREVIEW_HASH } = await import('../content/content')
    if ((await sha256(code)) === PREVIEW_HASH) localStorage.setItem(PREVIEW_KEY, String(Date.now()))
  } catch { /* bỏ qua */ }
}
export function exitPreview() {
  try { localStorage.removeItem(PREVIEW_KEY) } catch { /* bỏ qua */ }
  const u = new URL(location.href); u.searchParams.delete('xem')
  if (u.href === location.href) location.reload(); else location.href = u.href
}
export const isUnlocked = (iso: string) => previewOn() || now() >= Date.parse(iso)
export function countdown(iso: string) {
  let s = Math.max(0, Math.floor((Date.parse(iso) - now()) / 1000))
  const d = Math.floor(s / 86400); s -= d * 86400
  const h = Math.floor(s / 3600); s -= h * 3600
  const m = Math.floor(s / 60); s -= m * 60
  return { d, h, m, s }
}
