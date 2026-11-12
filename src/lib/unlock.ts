/** Absolute instants with +07:00, so the lock follows Vietnam time on any device. Dev-only ?date= override. */
export function now(): number {
  if (import.meta.env.DEV) {
    const d = new URLSearchParams(location.search).get('date')
    if (d) { const t = Date.parse(d); if (!Number.isNaN(t)) return t }
  }
  return Date.now()
}
export const isUnlocked = (iso: string) => now() >= Date.parse(iso)
export function countdown(iso: string) {
  let s = Math.max(0, Math.floor((Date.parse(iso) - now()) / 1000))
  const d = Math.floor(s / 86400); s -= d * 86400
  const h = Math.floor(s / 3600); s -= h * 3600
  const m = Math.floor(s / 60); s -= m * 60
  return { d, h, m, s }
}
