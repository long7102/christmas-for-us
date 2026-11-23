/**
 * Nét vẽ tay: đường run nhẹ, đầu nét lẹm qua, sinh sẵn bằng số ngẫu nhiên cố định (mulberry32) nên mỗi lần mở trang đều giống nhau.
 * Không dùng filter làm méo: chỉ là các đường path thường, nhẹ máy.
 */
export type Pt = [number, number]

export function rng(seed: number) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const f = (n: number) => n.toFixed(1)

/** Đường cong mượt đi qua các điểm (Catmull-Rom đổi sang Bézier). */
function smooth(pts: Pt[]): string {
  const n = pts.length
  if (n < 2) return ''
  const g = (i: number) => pts[Math.max(0, Math.min(n - 1, i))]
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  for (let i = 0; i < n - 1; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2)
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d
}

/** Chu vi hình chữ nhật bo góc (hoặc viên thuốc khi r >= h/2), lấy mẫu mỗi `step` px. */
function perimeter(x: number, y: number, w: number, h: number, r: number, step: number): Pt[] {
  r = Math.max(0, Math.min(r, w / 2, h / 2))
  const pts: Pt[] = []
  const line = (ax: number, ay: number, bx: number, by: number) => { const n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step)); for (let i = 0; i < n; i++) pts.push([ax + ((bx - ax) * i) / n, ay + ((by - ay) * i) / n]) }
  const arc = (cx: number, cy: number, a0: number, a1: number) => { const n = Math.max(2, Math.round((Math.abs(a1 - a0) * r) / step)); for (let i = 0; i < n; i++) { const a = a0 + ((a1 - a0) * i) / n; pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]) } }
  line(x + r, y, x + w - r, y); arc(x + w - r, y + r, -Math.PI / 2, 0)
  line(x + w, y + r, x + w, y + h - r); arc(x + w - r, y + h - r, 0, Math.PI / 2)
  line(x + w - r, y + h, x + r, y + h); arc(x + r, y + h - r, Math.PI / 2, Math.PI)
  line(x, y + h - r, x, y + r); arc(x + r, y + r, Math.PI, Math.PI * 1.5)
  return pts
}

/** Viền chữ nhật / viên thuốc vẽ tay: bắt đầu ở chỗ ngẫu nhiên, đi hết một vòng rồi lẹm qua điểm đầu một đoạn. */
export function roughRect(w: number, h: number, r: number, inset: number, j: number, seed: number): string {
  const rnd = rng(seed)
  const base = perimeter(inset, inset, w - inset * 2, h - inset * 2, r - inset * 0.5, 11)
  const s = Math.floor(rnd() * base.length)
  const rot = base.slice(s).concat(base.slice(0, s))
  const jit = (p: Pt): Pt => [p[0] + (rnd() - 0.5) * 2 * j, p[1] + (rnd() - 0.5) * 2 * j]
  const pts = rot.map(jit).concat(rot.slice(0, 3).map((p) => jit([p[0] + (rnd() - 0.5) * j, p[1] + (rnd() - 0.5) * j])))
  return smooth(pts)
}

/** Vòng tròn vẽ tay, hơi xoắn vào trong ở cuối nét. */
export function roughCircle(w: number, h: number, inset: number, j: number, seed: number): string {
  const rnd = rng(seed)
  const R = Math.min(w, h) / 2 - inset, cx = w / 2, cy = h / 2, n = 26
  const a0 = rnd() * 6.283
  const pts: Pt[] = []
  for (let i = 0; i <= n + 3; i++) { const a = a0 + (i / n) * 6.283, k = 1 - Math.max(0, i - n) * 0.012; const rr = R * k + (rnd() - 0.5) * 2 * j; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]) }
  return smooth(pts)
}

/** Nét gạch bóng song song, như tô chì ở góc. */
export function hatch(x: number, y: number, n: number, len: number, gap: number, ang: number, seed: number): string {
  const rnd = rng(seed)
  const dx = Math.cos(ang), dy = Math.sin(ang), px = -dy, py = dx
  let d = ''
  for (let i = 0; i < n; i++) {
    const L = len * (0.7 + rnd() * 0.4), ox = x + px * gap * i + (rnd() - 0.5) * 1.5, oy = y + py * gap * i + (rnd() - 0.5) * 1.5
    d += `M${f(ox)} ${f(oy)}L${f(ox + dx * L + (rnd() - 0.5) * 2)} ${f(oy + dy * L + (rnd() - 0.5) * 2)}`
  }
  return d
}

/** Đường lượn sóng hai nét để gạch chân tiêu đề. */
export function wave(w: number, h: number, seed: number): string {
  const rnd = rng(seed)
  const one = (x0: number, x1: number, y: number, amp: number) => {
    const pts: Pt[] = []
    for (let x = x0, i = 0; x <= x1; x += 13, i++) pts.push([x, y + Math.sin(i * 0.95) * amp + (rnd() - 0.5) * 1.6])
    return smooth(pts)
  }
  return one(2, w - 2, h * 0.38, 3.2) + one(w * 0.12, w * 0.88, h * 0.78, 2.4)
}

export type DoodleKind = 'star' | 'flake' | 'heart' | 'spark' | 'swirl'

/** Hình nguệch ngoạc, vẽ quanh gốc (0,0) trong khoảng ±r. */
export function doodle(kind: DoodleKind, r: number, seed: number): string {
  const rnd = rng(seed)
  const J = (v = 1) => (rnd() - 0.5) * 2 * v
  const seg = (ax: number, ay: number, bx: number, by: number) => `M${f(ax + J(0.8))} ${f(ay + J(0.8))}L${f(bx + J(0.8))} ${f(by + J(0.8))}`
  if (kind === 'star') {
    const pts: Pt[] = []
    for (let i = 0; i < 11; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.46 : r; pts.push([rr * Math.cos(a), rr * Math.sin(a)]) }
    return 'M' + pts.map((p) => `${f(p[0] + J(0.9))} ${f(p[1] + J(0.9))}`).join('L')
  }
  if (kind === 'spark') return seg(0, -r, 0, r) + seg(-r, 0, r, 0) + seg(-r * 0.45, -r * 0.45, r * 0.45, r * 0.45) + seg(r * 0.45, -r * 0.45, -r * 0.45, r * 0.45)
  if (kind === 'flake') {
    let d = ''
    for (let k = 0; k < 3; k++) {
      const a = (k * Math.PI) / 3, c = Math.cos(a), s = Math.sin(a)
      d += seg(-r * c, -r * s, r * c, r * s)
      for (const side of [-1, 1]) for (const t of [0.55]) {
        const bx = side * r * t * c, by = side * r * t * s
        for (const da of [0.7, -0.7]) { const ba = a + (side > 0 ? 0 : Math.PI) + da; d += seg(bx, by, bx + Math.cos(ba) * r * 0.3, by + Math.sin(ba) * r * 0.3) }
      }
    }
    return d
  }
  if (kind === 'heart') {
    const pts: Pt[] = []
    for (let i = 0; i <= 22; i++) { const t = -Math.PI + (i / 20) * Math.PI * 2; const x = 16 * Math.sin(t) ** 3, y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); pts.push([(x / 17) * r + J(0.6), (y / 17) * r + J(0.6)]) }
    return smooth(pts)
  }
  // swirl: vòng xoắn nhỏ
  const pts: Pt[] = []
  for (let i = 0; i <= 26; i++) { const t = i / 26, a = t * Math.PI * 4.2, rr = r * (0.12 + 0.88 * t); pts.push([rr * Math.cos(a) + J(0.5), rr * Math.sin(a) + J(0.5)]) }
  return smooth(pts)
}
