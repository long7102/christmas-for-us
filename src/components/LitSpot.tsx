import { useMemo } from 'react'
import type { P } from '../scenes/treeLayout'

const clip = (p: P) => `polygon(${p.map(([x, y]) => `${x}px ${y}px`).join(',')})`
const box = (p: P) => { const xs = p.map((q) => q[0]), ys = p.map((q) => q[1]); const x = Math.min(...xs), y = Math.min(...ys); return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y } }

/** Bụi sao nhỏ lấp lánh trong khung của vật khi rê chuột vào. */
export function Stardust({ poly, on }: { poly: P; on: boolean }) {
  const b = useMemo(() => box(poly), [poly])
  const dots = useMemo(() => {
    let s = Math.round(b.x * 7 + b.y * 13 + b.w) | 1
    const r = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const n = Math.max(5, Math.min(11, Math.round((b.w + b.h) / 60)))
    return Array.from({ length: n }, () => ({ x: b.x + r() * b.w, y: b.y + r() * b.h, d: r() * 1.6, s: 10 + r() * 12, t: 1.3 + r() * 1.1 }))
  }, [b])
  return (
    <div className={`stardust${on ? ' on' : ''}`} aria-hidden>
      {dots.map((d, i) => <i key={i} style={{ left: d.x, top: d.y, fontSize: d.s, animationDelay: `${d.d}s`, animationDuration: `${d.t}s` }}>✦</i>)}
    </div>
  )
}

/**
 * Khi rê chuột: chính hình vật sáng lên nhẹ (nhân bản ảnh nền, cắt theo hình vật, tăng sáng) kèm vài hạt sao lấp lánh.
 * Không có viền: chỉ ánh sáng toả khẽ ở quanh vật.
 */
export function LitSpot({ src, w, h, poly, on, strength = 1 }: { src: string; w: number; h: number; poly: P; on: boolean; strength?: number }) {
  return (
    <>
      <div className={`litspot${on ? ' on' : ''}`} style={{ width: w, height: h }} aria-hidden>
        <i style={{ clipPath: clip(poly), backgroundImage: `url(${src})`, backgroundSize: `${w}px ${h}px`, filter: `brightness(${1 + 0.42 * strength}) saturate(${1 + 0.12 * strength})` }} />
      </div>
      <Stardust poly={poly} on={on} />
    </>
  )
}
