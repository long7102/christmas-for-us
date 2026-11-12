import { useEffect, useRef, useState } from 'react'
import { cats as copy } from '../content/content'
import { reducedMotion } from '../lib/device'
import { CAT_LAND, CAT_PORT, type CatLayout } from './catsLayout'
import { Dust, Lamps } from './Tree'
import { polyBox, type P, type R } from './treeLayout'

type Who = 'bong' | 'mochi'
const STRETCH_MS = 3600

const poly = (p: P) => `polygon(${p.map(([x, y]) => `${x}px ${y}px`).join(',')})`

/** Một ảnh thay thế trong khung chữ nhật, mép mờ dần để hoà vào ảnh nền. */
function Over({ L, r, src, on }: { L: CatLayout; r: R; src: string; on: boolean }) {
  return (
    <div className={`cat-over${on ? ' on' : ''}`}
      style={{ left: r.x, top: r.y, width: r.w, height: r.h, backgroundImage: `url(${src})`, backgroundSize: `${L.w}px ${L.h}px`, backgroundPosition: `${-r.x}px ${-r.y}px` }} />
  )
}

export default function Cats({ active = true }: { active?: boolean }) {
  const sec = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const txt = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'wide' | 'tall'>(() => (innerWidth / innerHeight < 1.05 ? 'tall' : 'wide'))
  const [compact, setCompact] = useState(() => innerWidth < 1100)
  const L = mode === 'tall' ? CAT_PORT : CAT_LAND
  const [g, setG] = useState({ s: 1, x: 0, y: 0 })
  const [tip, setTip] = useState<{ title: string; text: string; b: { x: number; y: number; w: number; h: number } } | null>(null)
  const [busy, setBusy] = useState<Who | null>(null)
  const [show, setShow] = useState<Who | null>(null)
  const timers = useRef<number[]>([])

  useEffect(() => {
    const el = sec.current!
    const measure = () => { const w = el.clientWidth, h = el.clientHeight; setMode(w / h < 1.05 ? 'tall' : 'wide'); setCompact(w < 1100) }
    measure()
    const ro = new ResizeObserver(measure); ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = host.current!
    const fit = () => {
      const vw = el.clientWidth, vh = el.clientHeight, F = L.focus
      const band = mode === 'tall' ? txt.current?.offsetHeight ?? 0 : 0
      const vis = vh - band
      let s = Math.max(vw / L.w, vh / L.h)
      if (mode === 'tall') s = Math.max(vw / L.w, Math.min(s, (vis - 24) / (F.y2 - F.y1)))
      const cx = (F.x1 + F.x2) / 2, cy = (F.y1 + F.y2) / 2
      let x = vw / 2 - cx * s
      let y = Math.min(vis / 2 - cy * s, vis - F.y2 * s - 10)
      x = Math.min(0, Math.max(vw - L.w * s, x)); y = Math.min(0, Math.max((mode === 'tall' ? vis : vh) - L.h * s, y))
      setG({ s, x, y })
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el); if (txt.current) ro.observe(txt.current)
    return () => ro.disconnect()
  }, [L, mode])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const poke = (who: Who) => {
    if (busy) return
    setTip(null); setBusy(who)
    const dur = reducedMotion() ? 900 : STRETCH_MS
    setShow(who)
    timers.current.push(window.setTimeout(() => setShow(null), dur - 1100))
    timers.current.push(window.setTimeout(() => setBusy(null), dur))
  }

  const cats: { id: Who; p: P; label: string; info: { title: string; tip: string }; img?: string; region: R }[] = [
    { id: 'bong', p: L.bong, label: 'Bông', info: copy.bong, img: L.bongStretch, region: L.bongRegion },
    { id: 'mochi', p: L.mochi, label: 'Mochi', info: copy.mochi, img: L.mochiStretch, region: L.mochiRegion },
  ]
  const showTip = (c: (typeof cats)[number]) => setTip({ title: c.info.title, text: c.info.tip, b: polyBox(c.p) })

  return (
    <section id="cats" className={`tree-scene cats-scene ${mode} ${compact ? 'compact' : ''}`} ref={sec}>
      <div className="sec-frame" ref={host}>
        <div className="tr-stage" style={{ width: L.w, height: L.h, transform: `translate(${g.x}px, ${g.y}px) scale(${g.s})` }}>
          <img src={L.src} alt="Bông và Mochi ngủ cạnh nhau trên ghế sofa" draggable={false} />
          <Lamps lamps={L.lamps} flare={new Set()} />
          {active && <Dust w={L.w} h={L.h} />}
          <div className="tr-warm cat-warm" />

          {/* mỗi bé thở nhẹ khi ngủ; bé nào đang duỗi thì lớp này ẩn đi */}
          {cats.map((c, i) => {
            const b = polyBox(c.p)
            const fake = busy === c.id && !c.img
            return (
              <div key={c.id} className={`cat-breath${busy === c.id && c.img ? ' hide' : ''}${fake ? ' fake' : ''}`}
                style={{ clipPath: poly(c.p), backgroundImage: `url(${L.src})`, transformOrigin: `${b.x + b.w * (c.id === 'mochi' ? 0.15 : 0.5)}px ${b.y + b.h}px`, animationDelay: `${-i * 1.7}s` }} />
            )
          })}

          {cats.map((c) => (c.img ? <Over key={c.id} L={L} r={c.region} src={c.img} on={show === c.id} /> : null))}

          <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
            {cats.map((c) => (
              <polygon key={c.id} className="tr-hs" points={c.p.map((q) => q.join(',')).join(' ')} tabIndex={0} role="button" aria-label={c.label}
                onMouseEnter={() => showTip(c)} onMouseLeave={() => setTip(null)} onFocus={() => showTip(c)} onBlur={() => setTip(null)}
                onClick={() => poke(c.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(c.id) } }} />
            ))}
          </svg>
        </div>
      </div>

      <div className="sec-text" ref={txt}>
        <h2 className="sec-title">{copy.title}</h2>
        <div className="sec-orn" aria-hidden><i /><b>❦</b><i /></div>
        <p className="sec-tag">{copy.tagline}</p>
        <p className="sec-desc">{copy.body}</p>
        <p className="sec-hint"><span aria-hidden>✦</span>{copy.hint}</p>
      </div>

      {tip && (() => {
        const W = sec.current?.clientWidth ?? 800
        const cx = Math.min(Math.max(g.x + (tip.b.x + tip.b.w / 2) * g.s, 150), W - 150)
        const above = g.y + tip.b.y * g.s > 130
        const top = above ? g.y + tip.b.y * g.s - 12 : g.y + (tip.b.y + tip.b.h) * g.s + 12
        return <div className="tr-tip" style={{ left: cx, top, transform: `translate(-50%, ${above ? '-100%' : '0'})` }}><b>{tip.title}</b><span>{tip.text}</span></div>
      })()}
    </section>
  )
}
