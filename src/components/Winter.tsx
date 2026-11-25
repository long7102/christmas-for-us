import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { hatch, hollyLeaf, inkOutline, rng, sampleSpline, snowCap, type Pt } from '../lib/sketch'

const poly = (ps: Pt[]) => 'M' + ps.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')
const place = (ps: Pt[], ang: number, tx: number, ty: number): Pt[] => ps.map(([x, y]) => [x * Math.cos(ang) - y * Math.sin(ang) + tx, x * Math.sin(ang) + y * Math.cos(ang) + ty] as Pt)

/** Tuyết đọng trên mép thẻ: gò tuyết có khối (đậm dần xuống dưới), gạch bóng xanh nhạt dưới mỗi gò, nhũ băng, viền mực. Dựng đúng bề rộng thật nên không bị kéo méo. */
export function SnowCap() {
  const ref = useRef<SVGSVGElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current!
    const upd = () => setW(Math.round(el.getBoundingClientRect().width))
    upd()
    const ro = new ResizeObserver(upd); ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const g = useMemo(() => {
    if (!w) return null
    const s = snowCap(w, 17)
    const top = sampleSpline(s.top, 3), bottom = sampleSpline(s.bottom, 3)
    const fill = poly(top) + 'L' + poly(bottom).slice(1) + 'Z'
    const edge = inkOutline(s.top, 1.9, 5, true)
    const lower = inkOutline(s.bottom, 1.1, 6, true)
    const hat = s.peaks.map((p, i) => hatch(p[0] + 2, p[1] + 7, 3, 9, 3.2, 1.95, 60 + i)).join('')
    const rnd = rng(23)
    const sparks = Array.from({ length: 4 }, () => [8 + rnd() * (w - 16), 6 + rnd() * 9] as Pt)
    return { fill, edge, lower, hat, sparks, drips: s.drips }
  }, [w])
  return (
    <svg ref={ref} className="gate-cap" viewBox={`0 0 ${w || 1} 42`} aria-hidden>
      <defs><linearGradient id="gsnow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset=".45" stopColor="#f6f1e6" /><stop offset=".8" stopColor="#d7deea" /><stop offset="1" stopColor="#bfc9db" /></linearGradient></defs>
      {g && (
        <>
          <path d={g.fill} fill="url(#gsnow)" />
          <path d={g.hat} fill="none" stroke="#8d9bb5" strokeWidth=".9" strokeLinecap="round" opacity=".55" />
          <path d={g.edge} fill="#7a879f" opacity=".85" />
          <path d={g.lower} fill="#8a96ad" opacity=".6" />
          {g.drips.map((d, i) => <ellipse key={i} cx={d[0] - 0.8} cy={d[1] - 4} rx="0.9" ry="2.4" fill="#fff" opacity=".7" />)}
          {g.sparks.map((p, i) => <path key={i} d={`M${p[0] - 2.2} ${p[1]}H${p[0] + 2.2}M${p[0]} ${p[1] - 2.2}V${p[1] + 2.2}`} stroke="#fff" strokeWidth=".8" strokeLinecap="round" opacity=".85" />)}
        </>
      )}
    </svg>
  )
}

/** Cành ô-rô kiểu tranh khắc thực vật: lá răng cưa nhọn tô xanh đậm dần, gân lá, viền mực, quả đỏ có bóng và điểm sáng. */
export function Holly({ flip = false }: { flip?: boolean }) {
  const g = useMemo(() => {
    const rnd = rng(flip ? 41 : 29)
    const leaves = [
      { len: 54, wd: 15, a: -0.5, x: 24, y: 58, seed: 3 },
      { len: 46, wd: 13, a: -1.2, x: 24, y: 58, seed: 4 },
    ].map((l) => {
      const outline = hollyLeaf(l.len, l.wd, 6)
      const placed = place(outline, l.a, l.x, l.y)
      const veins: string[] = []
      veins.push(poly(place(sampleSpline([[2, 0], [l.len * 0.5, rnd() - 0.5], [l.len * 0.93, 0]], 3), l.a, l.x, l.y)))
      for (let k = 1; k <= 5; k++) {
        const vx = l.len * (0.12 + k * 0.15)
        for (const s of [-1, 1]) veins.push(poly(place([[vx, 0], [vx + l.len * 0.07, s * l.wd * 0.32], [vx + l.len * 0.15, s * l.wd * 0.58]], l.a, l.x, l.y)))
      }
      return { fill: poly(placed) + 'Z', ink: inkOutline(placed.concat(placed.slice(0, 2)), 1.7, l.seed, false), veins: veins.join('') }
    })
    const berries = ([[19, 55, 7], [30, 62, 6.5], [24, 46, 6.2]] as [number, number, number][]).map(([x, y, r], i) => ({ x, y, r, ink: inkOutline(Array.from({ length: 14 }, (_, k) => [x + r * Math.cos((k / 12) * 6.283 + i), y + r * Math.sin((k / 12) * 6.283 + i)] as Pt), 1.3, 9 + i, false) }))
    return { leaves, berries }
  }, [flip])
  return (
    <svg viewBox="0 0 80 80" className={`gate-holly${flip ? ' r' : ''}`} aria-hidden>
      <defs>
        <linearGradient id={`gleaf${flip ? 'r' : 'l'}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4f9a5a" /><stop offset=".55" stopColor="#2b6a3d" /><stop offset="1" stopColor="#164527" /></linearGradient>
        <radialGradient id={`gberry${flip ? 'r' : 'l'}`} cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#f5705c" /><stop offset=".5" stopColor="#c4281f" /><stop offset="1" stopColor="#6d1210" /></radialGradient>
      </defs>
      {g.leaves.map((l, i) => (
        <g key={i}>
          <path d={l.fill} fill={`url(#gleaf${flip ? 'r' : 'l'})`} />
          <path d={l.veins} fill="none" stroke="#b6dca8" strokeWidth=".7" strokeLinecap="round" opacity=".6" />
          <path d={l.ink} fill="#0b2415" />
        </g>
      ))}
      {g.berries.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r={b.r} fill={`url(#gberry${flip ? 'r' : 'l'})`} />
          <path d={b.ink} fill="#3b0b09" opacity=".9" />
          <ellipse cx={b.x - b.r * 0.35} cy={b.y - b.r * 0.4} rx={b.r * 0.26} ry={b.r * 0.17} fill="#fff4e0" opacity=".9" transform={`rotate(-30 ${b.x - b.r * 0.35} ${b.y - b.r * 0.4})`} />
          <circle cx={b.x + b.r * 0.1} cy={b.y + b.r * 0.1} r={b.r * 0.1} fill="#3b0b09" opacity=".7" />
        </g>
      ))}
    </svg>
  )
}
