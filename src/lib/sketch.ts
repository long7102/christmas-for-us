/**
 * Nét mực vẽ tay kiểu khắc in cổ: đường tâm run nhẹ -> hình đặc có độ dày thay đổi (thon hai đầu, nhịp ép bút).
 * Số ngẫu nhiên cố định (mulberry32) nên mỗi lần mở trang nét đều giống nhau. Chỉ là path thường, không filter nặng.
 */
export type Pt = [number, number]
export type Stroke = { pts: Pt[]; w: number }

export function rng(seed: number) {
  let a = seed >>> 0
  return () => { a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
}
const f = (n: number) => n.toFixed(1)

/** Điểm mẫu dày trên đường cong mượt (Catmull-Rom) đi qua các điểm. */
export function sampleSpline(pts: Pt[], step: number): Pt[] {
  const n = pts.length
  if (n < 2) return pts.slice()
  const g = (i: number) => pts[Math.max(0, Math.min(n - 1, i))]
  const out: Pt[] = []
  for (let i = 0; i < n - 1; i++) {
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2)
    const m = Math.max(1, Math.ceil(Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) / step))
    for (let k = 0; k < m; k++) {
      const t = k / m, t2 = t * t, t3 = t2 * t
      const c = (a: number, b: number, cc: number, d: number) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3)
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])])
    }
  }
  out.push(pts[n - 1])
  return out
}

/** Nét mực: từ đường tâm dựng hình đặc, dày ở giữa, thon hai đầu, có nhịp ép bút nhẹ. */
export function inkOutline(pts: Pt[], w: number, seed: number, taper = true): string {
  const s = sampleSpline(pts, 2.5), n = s.length
  if (n < 3) return ''
  const rnd = rng(seed), p1 = rnd() * 6.28, p2 = rnd() * 6.28, p3 = rnd() * 6.28
  const L: Pt[] = [], R: Pt[] = []
  for (let i = 0; i < n; i++) {
    const a = s[Math.max(0, i - 1)], b = s[Math.min(n - 1, i + 1)]
    let tx = b[0] - a[0], ty = b[1] - a[1]
    const m = Math.hypot(tx, ty) || 1; tx /= m; ty /= m
    const t = i / (n - 1)
    const env = taper ? Math.pow(Math.sin(Math.PI * t), 0.45) * 0.7 + 0.3 : 1
    const press = 0.72 + 0.28 * Math.sin(t * 9 + p1) * Math.sin(t * 3.1 + p2) + 0.12 * Math.sin(t * 23 + p3)
    const hw = Math.max(0.25, w * env * press) / 2
    L.push([s[i][0] - ty * hw, s[i][1] + tx * hw]); R.push([s[i][0] + ty * hw, s[i][1] - tx * hw])
  }
  const q = (p: Pt) => `${f(p[0])} ${f(p[1])}`
  return 'M' + L.map(q).join('L') + 'L' + R.reverse().map(q).join('L') + 'Z'
}

/** Chu vi chữ nhật bo góc (hoặc viên thuốc khi r >= h/2). */
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

/** Viền chữ nhật / viên thuốc vẽ tay: điểm đầu ngẫu nhiên, đi hết một vòng rồi lẹm qua điểm đầu. */
export function roughRectPts(w: number, h: number, r: number, inset: number, j: number, seed: number): Pt[] {
  const rnd = rng(seed)
  const base = perimeter(inset, inset, w - inset * 2, h - inset * 2, r - inset * 0.5, 11)
  const s = Math.floor(rnd() * base.length)
  const rot = base.slice(s).concat(base.slice(0, s))
  const jit = (p: Pt): Pt => [p[0] + (rnd() - 0.5) * 2 * j, p[1] + (rnd() - 0.5) * 2 * j]
  return rot.map(jit).concat(rot.slice(0, 4).map((p) => jit([p[0] + (rnd() - 0.5) * j, p[1] + (rnd() - 0.5) * j])))
}

/** Vòng tròn vẽ tay, hơi xoắn vào trong ở cuối nét. */
export function roughCirclePts(w: number, h: number, inset: number, j: number, seed: number): Pt[] {
  const rnd = rng(seed)
  const R = Math.min(w, h) / 2 - inset, cx = w / 2, cy = h / 2, n = 26, a0 = rnd() * 6.283
  const pts: Pt[] = []
  for (let i = 0; i <= n + 3; i++) { const a = a0 + (i / n) * 6.283, k = 1 - Math.max(0, i - n) * 0.014; const rr = R * k + (rnd() - 0.5) * 2 * j; pts.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]) }
  return pts
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

/* ---------- họa tiết khắc in cổ (vẽ quanh gốc 0,0 trong khoảng ±r) ---------- */
const circ = (cx: number, cy: number, r: number, n = 18, a0 = 0, turns = 1): Pt[] => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (turns * 6.283 * i) / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt })
const spiral = (cx: number, cy: number, r0: number, r1: number, turns: number, a0: number, n = 22): Pt[] => Array.from({ length: n + 1 }, (_, i) => { const t = i / n, a = a0 + t * turns * 6.283, rr = r0 + (r1 - r0) * t; return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as Pt })
const rot = (ps: Pt[], a: number, tx = 0, ty = 0): Pt[] => ps.map(([x, y]) => [x * Math.cos(a) - y * Math.sin(a) + tx, x * Math.sin(a) + y * Math.cos(a) + ty] as Pt)
const seg = (a: Pt, b: Pt, n = 3): Pt[] => Array.from({ length: n + 1 }, (_, i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n] as Pt)
/** Lá ô-rô: viền răng cưa nhẹ, dài `len` theo trục x. */
const leaf = (len: number, wd: number, n = 28): Pt[] => {
  const up: Pt[] = [], dn: Pt[] = []
  for (let i = 0; i <= n; i++) { const t = i / n, h = wd * Math.pow(Math.sin(Math.PI * t), 0.8) * (1 + 0.18 * Math.sin(t * Math.PI * 8)); up.push([len * t, -h]); dn.push([len * t, h]) }
  return up.concat(dn.reverse())
}

export type MotifKind = 'key' | 'compass' | 'sprig' | 'scroll'

export function motif(kind: MotifKind, r: number, seed: number): Stroke[] {
  const rnd = rng(seed)
  const J = (v: number) => (rnd() - 0.5) * 2 * v
  const jit = (s: Stroke): Stroke => ({ w: s.w, pts: s.pts.map((p) => [p[0] + J(r * 0.025), p[1] + J(r * 0.025)] as Pt) })
  const out: Stroke[] = []
  if (kind === 'key') {
    const A = -0.62
    out.push({ w: r * 0.13, pts: rot(circ(-0.58 * r, 0, 0.3 * r, 16), A) })
    out.push({ w: r * 0.08, pts: rot(circ(-0.58 * r, 0, 0.13 * r, 10), A) })
    out.push({ w: r * 0.14, pts: rot(seg([-0.28 * r, 0], [0.95 * r, 0], 6), A) })
    out.push({ w: r * 0.1, pts: rot([[0.95 * r, 0], [0.95 * r, 0.3 * r], [0.72 * r, 0.3 * r], [0.72 * r, 0.12 * r]], A) })
    out.push({ w: r * 0.1, pts: rot([[0.55 * r, 0], [0.55 * r, 0.22 * r], [0.4 * r, 0.22 * r]], A) })
    out.push({ w: r * 0.1, pts: rot(seg([-0.14 * r, -0.11 * r], [-0.14 * r, 0.11 * r], 2), A) })
  } else if (kind === 'compass') {
    const star: Pt[] = []
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 8, k = i % 2 ? 0.2 : i % 4 === 0 ? 1 : 0.6; star.push([r * k * Math.cos(a), r * k * Math.sin(a)]) }
    out.push({ w: r * 0.1, pts: star })
    out.push({ w: r * 0.07, pts: circ(0, 0, 0.8 * r, 22, rnd() * 6.28, 0.94) })
    out.push({ w: r * 0.12, pts: circ(0, 0, 0.07 * r, 6) })
  } else if (kind === 'sprig') {
    out.push({ w: r * 0.1, pts: [[-r, 0.55 * r], [-0.3 * r, 0.2 * r], [0.3 * r, -0.05 * r], [0.78 * r, -0.36 * r]] })
    out.push({ w: r * 0.09, pts: rot(leaf(0.8 * r, 0.2 * r), -0.55, -0.35 * r, 0.22 * r) })
    out.push({ w: r * 0.09, pts: rot(leaf(0.74 * r, 0.19 * r), 0.3, -0.3 * r, 0.2 * r) })
    out.push({ w: r * 0.06, pts: rot(seg([0, 0], [0.7 * r, 0], 4), -0.55, -0.35 * r, 0.22 * r) })
    for (const [x, y] of [[0.55, -0.24], [0.74, -0.1], [0.66, -0.4]]) { out.push({ w: r * 0.1, pts: circ(x * r, y * r, 0.12 * r, 10) }); out.push({ w: r * 0.05, pts: circ(x * r, y * r, 0.06 * r, 6, 3.5, 0.45) }) }
  } else {
    out.push({ w: r * 0.1, pts: [[0.98 * r, 0.12 * r], [0.5 * r, 0.1 * r], [0.16 * r, 0.22 * r], [0.1 * r, 0.5 * r], [0.12 * r, 0.98 * r]] })
    out.push({ w: r * 0.08, pts: spiral(0.88 * r, 0.27 * r, 0.16 * r, 0.03 * r, 1.4, -1.5) })
    out.push({ w: r * 0.08, pts: spiral(0.27 * r, 0.88 * r, 0.16 * r, 0.03 * r, 1.4, -0.1) })
    out.push({ w: r * 0.07, pts: rot(leaf(0.42 * r, 0.09 * r), 0.785, 0.2 * r, 0.2 * r) })
  }
  return out.map(jit)
}

/** Đường hoa văn ngăn cách: hình thoi ở giữa, hai nhánh sóng nhỏ dần cuộn lại ở đầu. */
export function flourish(w: number, h: number, seed: number): Stroke[] {
  const rnd = rng(seed), c = w / 2, y = h / 2
  const J = (v: number) => (rnd() - 0.5) * 2 * v
  const out: Stroke[] = [{ w: 2, pts: [[c - 5, y], [c, y - 5], [c + 5, y], [c, y + 5], [c - 5, y]] }]
  for (const s of [1, -1]) {
    const pts: Pt[] = []
    for (let i = 0; i <= 12; i++) { const t = i / 12, x = c + s * (12 + t * (w / 2 - 40)); pts.push([x + J(0.5), y + Math.sin(t * 9) * (5 - 3 * t) + J(0.5)]) }
    out.push({ w: 2.2, pts })
    out.push({ w: 1.6, pts: spiral(c + s * (w / 2 - 22), y - 3, 7, 1.5, 1.3, s > 0 ? 3.1 : 0, 16) })
  }
  return out
}

/* ---------- tuyết đọng và lá ô-rô (tranh khắc cổ) ---------- */
/** Dải tuyết đọng: đường trên là những gò tuyết to nhỏ khác nhau, đường dưới có nhũ băng. Cao 40. */
export function snowCap(w: number, seed: number): { top: Pt[]; bottom: Pt[]; peaks: Pt[]; drips: Pt[] } {
  const rnd = rng(seed)
  const top: Pt[] = [[0, 29]], peaks: Pt[] = []
  let x = 0
  const n = Math.max(2, Math.round(w / 52)), ws = Array.from({ length: n }, () => 0.7 + rnd() * 0.6), sum = ws.reduce((a, b) => a + b, 0)
  for (let i = 0; i < n; i++) {
    const mw = (w * ws[i]) / sum, h = 8 + rnd() * 9, valley = 24 + rnd() * 1.6
    for (let k = 0; k <= 6; k++) { const th = (Math.PI * k) / 6; top.push([x + mw / 2 - (mw / 2) * Math.cos(th), valley - h * Math.pow(Math.sin(th), 0.75)]) }
    peaks.push([x + mw / 2, valley - h])
    x += mw
  }
  top.push([w, 29])
  const bottom: Pt[] = [], drips: Pt[] = []
  for (let bx = w; bx > 0; bx -= 15 + rnd() * 9) {
    if (rnd() < 0.38 && bx > 12 && bx < w - 12) { const tip = 37 + rnd() * 3; bottom.push([bx + 4, 32], [bx, tip], [bx - 4, 32]); drips.push([bx, tip]) }
    else bottom.push([bx, 31 + rnd() * 2.5])
  }
  bottom.push([0, 31])
  return { top, bottom, peaks, drips }
}

/** Viền lá ô-rô: răng cưa nhọn, nằm dọc trục x từ 0 tới `len` (đỉnh nhọn), rộng nhất `wd` mỗi bên. */
export function hollyLeaf(len: number, wd: number, spikes = 6): Pt[] {
  const up: Pt[] = [], dn: Pt[] = []
  const N = spikes * 4
  for (let i = 0; i <= N; i++) {
    const t = i / N, base = Math.pow(Math.sin(Math.PI * Math.min(1, t * 1.01)), 0.72)
    const ph = (t * spikes) % 1, tri = 1 - Math.abs(ph * 2 - 1)
    const h = wd * base * (0.56 + 0.44 * tri)
    up.push([len * t, -h]); dn.push([len * t, h])
  }
  return up.concat(dn.reverse())
}
