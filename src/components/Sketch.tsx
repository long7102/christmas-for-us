import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { doodle, hatch as hatchPath, roughCircle, roughRect, wave, type DoodleKind } from '../lib/sketch'

export type SketchStroke = { inset: number; j: number; w: number; o: number; seed: number; delay: number; dur?: number }
export type HatchSpec = { x: number; y: number; n: number; len: number; gap: number; ang: number }
type Props = {
  shape?: 'rect' | 'pill' | 'circle'
  r?: number
  strokes: SketchStroke[]
  hatch?: (w: number, h: number) => HatchSpec[]
  className?: string
}

/** Lớp vẽ tay phủ đúng khung của phần tử cha (đo bằng ResizeObserver); các nét tự "vẽ ra" khi vào. */
export function Sketch({ shape = 'rect', r = 18, strokes, hatch, className = '' }: Props) {
  const ref = useRef<SVGSVGElement>(null)
  const [sz, setSz] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = ref.current!
    const upd = () => { const b = el.getBoundingClientRect(); const w = Math.round(b.width), h = Math.round(b.height); setSz((s) => (s.w === w && s.h === h ? s : { w, h })) }
    upd()
    const ro = new ResizeObserver(upd); ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const { w, h } = sz
  const paths = useMemo(() => {
    if (!w || !h) return []
    const rr = shape === 'pill' ? h / 2 : r
    return strokes.map((s) => (shape === 'circle' ? roughCircle(w, h, s.inset, s.j, s.seed) : roughRect(w, h, rr, s.inset, s.j, s.seed)))
  }, [w, h, shape, r, strokes])
  const hatches = useMemo(() => (w && h && hatch ? hatch(w, h).map((a, i) => hatchPath(a.x, a.y, a.n, a.len, a.gap, a.ang, 40 + i)) : []), [w, h, hatch])
  return (
    <svg ref={ref} className={`sk ${className}`} aria-hidden>
      {paths.map((d, i) => <path key={i} d={d} pathLength={1} className="sk-line" style={{ strokeWidth: strokes[i].w, opacity: strokes[i].o, ['--d' as string]: `${strokes[i].delay}s`, ['--dur' as string]: `${strokes[i].dur ?? 1.8}s` }} />)}
      {hatches.map((d, i) => <path key={'h' + i} d={d} pathLength={1} className="sk-line sk-hatch" style={{ ['--d' as string]: `${1.2 + i * 0.1}s`, ['--dur' as string]: '1.2s' }} />)}
    </svg>
  )
}

/** Hình nguệch ngoạc nhỏ (sao, bông tuyết, tim...). */
export function Doodle({ kind, size = 16, seed = 1, delay = 1, className = '' }: { kind: DoodleKind; size?: number; seed?: number; delay?: number; className?: string }) {
  const d = useMemo(() => doodle(kind, size, seed), [kind, size, seed])
  return (
    <svg className={`sk-doodle ${className}`} width={size * 2 + 6} height={size * 2 + 6} viewBox={`${-size - 3} ${-size - 3} ${size * 2 + 6} ${size * 2 + 6}`} aria-hidden>
      <path d={d} pathLength={1} className="sk-line" style={{ ['--d' as string]: `${delay}s`, ['--dur' as string]: '1.1s' }} />
    </svg>
  )
}

/** Gạch chân lượn sóng hai nét. */
export function Wave({ className = '', delay = 1 }: { className?: string; delay?: number }) {
  const d = useMemo(() => wave(260, 18, 7), [])
  return (
    <svg className={`sk-wave ${className}`} viewBox="0 0 260 18" preserveAspectRatio="none" aria-hidden>
      <path d={d} pathLength={1} className="sk-line" style={{ ['--d' as string]: `${delay}s`, ['--dur' as string]: '1.3s' }} />
    </svg>
  )
}
