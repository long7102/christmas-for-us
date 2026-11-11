export type Stop = { x: number; y: number; s: number; dir: 1 | -1 }

/** x,y in viewport units -1..1 (y up), s = scale, dir: 1 faces right, -1 faces left. */
export const STOPS: Record<string, Stop> = {
  village: { x: 0.3, y: 0.8, s: 0.5, dir: -1 },
  music: { x: -0.35, y: 0.6, s: 0.2, dir: 1 },
  tea: { x: 0.32, y: 0.5, s: 0.2, dir: -1 },
  tree: { x: 0.05, y: 0.8, s: 0.42, dir: 1 },
  globe: { x: -0.3, y: 0.45, s: 0.32, dir: 1 },
  play: { x: 0.35, y: 0.55, s: 0.3, dir: -1 },
  final: { x: -0.2, y: 0.7, s: 0.14, dir: 1 },
}

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const easeIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function targetAt(y: number, centers: { id: string; center: number }[]) {
  const c = centers.filter((s) => STOPS[s.id])
  if (!c.length) return null
  if (y <= c[0].center) return { ...STOPS[c[0].id], t: 0, arc: 0 }
  const last = c[c.length - 1]
  if (y >= last.center) return { ...STOPS[last.id], t: 0, arc: 0 }
  let i = 0
  while (i < c.length - 2 && y >= c[i + 1].center) i++
  const A = STOPS[c[i].id], B = STOPS[c[i + 1].id]
  const f = (y - c[i].center) / (c[i + 1].center - c[i].center)
  const t = easeIO(clamp((f - 0.12) / 0.76))
  const arc = Math.sin(t * Math.PI)
  return {
    x: lerp(A.x, B.x, t),
    y: lerp(A.y, B.y, t) + arc * 0.22,
    s: lerp(A.s, B.s, t) * (1 + arc * 0.12),
    dir: (t > 0.5 ? B.dir : A.dir) as 1 | -1,
    t,
    arc,
  }
}
