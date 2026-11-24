import { useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flourish, hatch as hatchPath, inkOutline, motif, roughCirclePts, roughRectPts, type MotifKind, type Pt, type Stroke } from '../lib/sketch'

export type SketchStroke = { inset: number; j: number; w: number; o: number; seed: number; delay: number; dur?: number }
export type HatchSpec = { x: number; y: number; n: number; len: number; gap: number; ang: number }

/** Một nét mực: hình đặc có độ dày thay đổi, hiện dần (không dùng mặt nạ SVG vì chạy theo nét rất nặng máy). */
function Ink({ pts, w, seed, o = 1, delay, dur, taper = true }: { id?: string; pts: Pt[]; w: number; seed: number; o?: number; delay: number; dur: number; taper?: boolean; filter?: boolean }) {
  const d = useMemo(() => inkOutline(pts, w, seed, taper), [pts, w, seed, taper])
  return <path d={d} className="sk-ink" style={{ ['--o' as string]: o, ['--d' as string]: `${delay}s`, ['--dur' as string]: `${Math.min(dur, 1.3)}s` }} />
}
const clean = (s: string) => s.replace(/[^a-zA-Z0-9]/g, '')

type Props = { shape?: 'rect' | 'pill' | 'circle'; r?: number; strokes: SketchStroke[]; hatch?: (w: number, h: number) => HatchSpec[]; className?: string }

/** Lớp vẽ tay phủ đúng khung của phần tử cha (đo bằng ResizeObserver, dựng lại khi đổi cỡ). */
export function Sketch({ shape = 'rect', r = 18, strokes, hatch, className = '' }: Props) {
  const uid = clean(useId())
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
  const lines = useMemo(() => {
    if (!w || !h) return []
    const rr = shape === 'pill' ? h / 2 : r
    return strokes.map((s) => (shape === 'circle' ? roughCirclePts(w, h, s.inset, s.j, s.seed) : roughRectPts(w, h, rr, s.inset, s.j, s.seed)))
  }, [w, h, shape, r, strokes])
  const hatches = useMemo(() => (w && h && hatch ? hatch(w, h).map((a, i) => hatchPath(a.x, a.y, a.n, a.len, a.gap, a.ang, 40 + i)) : []), [w, h, hatch])
  return (
    <svg ref={ref} className={`sk ${className}`} aria-hidden>
      {lines.map((pts, i) => <Ink key={i} id={`${uid}k${i}`} pts={pts} w={strokes[i].w} seed={strokes[i].seed} o={strokes[i].o} delay={strokes[i].delay} dur={strokes[i].dur ?? 1.8} taper />)}
      {hatches.map((d, i) => <path key={'h' + i} d={d} pathLength={1} className="sk-line sk-hatch" style={{ ['--d' as string]: `${1.2 + i * 0.1}s`, ['--dur' as string]: '1.2s' }} />)}
    </svg>
  )
}

function Strokes({ uid, strokes, delay, seed, filter }: { uid: string; strokes: Stroke[]; delay: number; seed: number; filter?: boolean }) {
  return <>{strokes.map((s, i) => <Ink key={i} id={`${uid}s${i}`} pts={s.pts} w={s.w} seed={seed + i} delay={delay + i * 0.12} dur={0.9} filter={filter} />)}</>
}

/** Họa tiết khắc in nhỏ (chìa khoá cổ, la bàn, cành ô-rô, hoa văn góc) có hạt mực. */
export function Doodle({ kind, size = 16, seed = 1, delay = 1, className = '' }: { kind: MotifKind; size?: number; seed?: number; delay?: number; className?: string }) {
  const uid = clean(useId())
  const strokes = useMemo(() => motif(kind, size, seed), [kind, size, seed])
  const pad = Math.ceil(size * 0.25) + 3, box = size * 2 + pad * 2
  return (
    <svg className={`sk-doodle ${className}`} width={box} height={box} viewBox={`${-size - pad} ${-size - pad} ${box} ${box}`} aria-hidden>
      <Strokes uid={uid} strokes={strokes} delay={delay} seed={seed} filter />
    </svg>
  )
}

/** Hoa văn ngăn cách dưới tiêu đề. */
export function Flourish({ className = '', delay = 1 }: { className?: string; delay?: number }) {
  const uid = clean(useId())
  const strokes = useMemo(() => flourish(260, 26, 7), [])
  return (
    <svg className={`sk-flourish ${className}`} viewBox="0 0 260 26" aria-hidden>
      <Strokes uid={uid} strokes={strokes} delay={delay} seed={7} filter />
    </svg>
  )
}
