import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { cats as copy } from '../content/content'
import { reducedMotion } from '../lib/device'
import { sfx } from '../lib/audio'
import { CAT_LAND, CAT_PORT, type Cat, type CatLayout, type Pose } from './catsLayout'
import { Dust } from './Tree'
import { polyBox, type R } from './treeLayout'

type Who = 'bong' | 'mochi'
const FADE_OUT = 1100
const FAKE_MS = 3400

const rect = (r: R) => ({ left: r.x, top: r.y, width: r.w, height: r.h })

/** Ảnh dáng khác của bé, chỉ hiện ở chỗ khác với ảnh ngủ (mặt nạ mềm), nên không có đường cắt. */
function Over({ L, pose, on }: { L: CatLayout; pose: Pose; on: boolean }) {
  const r = pose.box
  return (
    <div className={`cat-over${on ? ' on' : ''}`}
      style={{ ...rect(r), backgroundImage: `url(${pose.src})`, backgroundSize: `${L.w}px ${L.h}px`, backgroundPosition: `${-r.x}px ${-r.y}px`, WebkitMaskImage: `url(${pose.mask})`, maskImage: `url(${pose.mask})` }} />
  )
}

/** Vầng sáng ôm đúng hình bé khi rê chuột: hình cắt của bé sáng lên, bóng sáng toả theo đường viền. */
function Glow({ L, cat, on }: { L: CatLayout; cat: Cat; on: boolean }) {
  const r = cat.cutBox
  return (
    <div className={`cat-glow${on ? ' on' : ''}`} style={rect(r)}>
      <i style={{ backgroundImage: `url(${L.src})`, backgroundSize: `${L.w}px ${L.h}px`, backgroundPosition: `${-r.x}px ${-r.y}px`, WebkitMaskImage: `url(${cat.cut})`, maskImage: `url(${cat.cut})` }} />
    </div>
  )
}

/**
 * Ánh sáng chập chờn chậm và dịu (tránh mỏi mắt): đèn lồng đổi nhịp mỗi ~0,4 đến 1 giây, ánh sáng cả phòng lấy theo bếp lửa
 * (ngoài khung ảnh, bên trái) nhưng bị ngọn đèn lồng kéo theo nên hai thứ sáng tối cùng nhau.
 */
function useFlicker(stage: React.RefObject<HTMLDivElement | null>, active: boolean) {
  useEffect(() => {
    const el = stage.current
    if (!el || !active) return
    if (reducedMotion()) { el.style.setProperty('--fl', '.8'); el.style.setProperty('--fl2', '.85'); return }
    let raf = 0, last = performance.now()
    let fire = 0.8, tFire = 0.8, nFire = 0, lamp = 0.85, tLamp = 0.85, nLamp = 0
    const frame = (t: number) => {
      const dt = Math.min(0.06, (t - last) / 1000); last = t
      nFire -= dt; nLamp -= dt
      if (nFire <= 0) { nFire = 0.5 + Math.random() * 0.9; tFire = Math.random() < 0.12 ? 0.5 + Math.random() * 0.15 : 0.72 + Math.random() * 0.28 }
      if (nLamp <= 0) { nLamp = 0.35 + Math.random() * 0.65; tLamp = Math.random() < 0.12 ? 0.55 + Math.random() * 0.12 : 0.78 + Math.random() * 0.22 }
      fire += (tFire - fire) * (1 - Math.exp(-dt / 0.3))
      lamp += (tLamp - lamp) * (1 - Math.exp(-dt / 0.16))
      el.style.setProperty('--fl2', lamp.toFixed(3))
      el.style.setProperty('--fl', (0.55 * fire + 0.45 * lamp).toFixed(3))
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis) }
  }, [stage, active])
}

export default function Cats({ active = true, near = true }: { active?: boolean; near?: boolean }) {
  const sec = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const txt = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'wide' | 'tall'>(() => (innerWidth / innerHeight < 1.05 ? 'tall' : 'wide'))
  const [compact, setCompact] = useState(() => innerWidth < 1100)
  const L = mode === 'tall' ? CAT_PORT : CAT_LAND
  const [g, setG] = useState({ s: 1, x: 0, y: 0 })
  const [tip, setTip] = useState<{ title: string; text: string; b: { x: number; y: number; w: number; h: number } } | null>(null)
  const [hov, setHov] = useState<Who | null>(null)
  const [busy, setBusy] = useState<Who | null>(null)
  const [show, setShow] = useState<string | null>(null)
  const timers = useRef<number[]>([])
  const next = useRef<Record<Who, number>>({ bong: 0, mochi: 0 })

  useFlicker(stage, active)

  // tiếng gừ gừ nhẹ khi cảnh này đang ở trước mắt
  useEffect(() => {
    if (!near) return
    sfx.purr(true)
    const off = sfx.subscribe(() => sfx.purr(true))
    return () => { off(); sfx.purr(false) }
  }, [near])

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
      x = Math.min(0, Math.max(vw - L.w * s, x))
      // máy tính: dựa ảnh sát lề trái để thấy đèn lồng, miễn là bé vẫn nằm trọn trong khung
      if (mode === 'wide') x = Math.min(0, Math.max(vw - L.w * s, Math.min(0, vw - 24 - F.x2 * s)))
      y = Math.min(0, Math.max((mode === 'tall' ? vis : vh) - L.h * s, y))
      setG({ s, x, y })
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el); if (txt.current) ro.observe(txt.current)
    return () => ro.disconnect()
  }, [L, mode])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const cats: { id: Who; cat: Cat; label: string; info: { title: string; tip: string } }[] = [
    { id: 'bong', cat: L.bong, label: 'Bông', info: copy.bong },
    { id: 'mochi', cat: L.mochi, label: 'Mochi', info: copy.mochi },
  ]

  /** Bấm một bé: bé đổi dáng rồi ngủ lại. Trong lúc đó không bấm được bé nào, đến khi bé ngủ lại mới bấm tiếp. */
  const poke = (who: Who) => {
    if (busy) return
    const cat = who === 'bong' ? L.bong : L.mochi
    setTip(null); setHov(null); setBusy(who)
    sfx.meow(who === 'bong' ? 0.92 : 1.12)
    if (!cat.poses.length) {
      timers.current.push(window.setTimeout(() => setBusy(null), reducedMotion() ? 800 : FAKE_MS))
      return
    }
    const i = next.current[who]++ % cat.poses.length
    const hold = reducedMotion() ? 700 : cat.poses[i].hold
    setShow(`${who}-${i}`)
    timers.current.push(window.setTimeout(() => setShow(null), hold))
    timers.current.push(window.setTimeout(() => setBusy(null), hold + FADE_OUT))
  }
  const enter = (c: (typeof cats)[number]) => {
    if (busy) return
    setHov(c.id); setTip({ title: c.info.title, text: c.info.tip, b: polyBox(c.cat.poly) })
  }
  const leave = () => { setHov(null); setTip(null) }

  // chữ nằm ở góc trên trái, trừ ngọn đèn lồng; điện thoại thì ở dải tối phía dưới
  const lampRight = (L.lamp[0] + L.lamp[2] * 0.55) * g.s + g.x
  const headLeft = (mode === 'wide' ? 640 : 0) * g.s + g.x
  const left = Math.max(26, lampRight + 8)
  const textWidth = mode === 'wide' ? Math.max(250, Math.min(430, headLeft - left - 24)) : 0
  const avail = mode === 'wide' ? (L.bong.poly.reduce((m, q) => Math.min(m, q[1]), 1e9) + 40) * g.s + g.y - 26 - 14 : 0
  // chữ phải nằm gọn trên đầu hai bé: nếu chỗ trống ít thì bỏ bớt từng phần cho vừa khít
  useLayoutEffect(() => {
    const el = txt.current
    if (!el) return
    if (mode !== 'wide') { el.dataset.fit = '0'; return }
    let lvl = 0
    for (; lvl < 5; lvl++) { el.dataset.fit = String(lvl); if (el.offsetHeight <= avail) break }
    el.dataset.fit = String(Math.min(lvl, 4))
  }, [mode, avail, textWidth, g.s])
  const textStyle = mode === 'wide' ? { left, width: textWidth } : undefined

  return (
    <section id="cats" className={`tree-scene cats-scene ${mode} ${compact ? 'compact' : ''}${busy ? ' busy' : ''}`} ref={sec}>
      <div className="sec-frame" ref={host}>
        <div className="tr-stage" ref={stage} style={{ width: L.w, height: L.h, transform: `translate(${g.x}px, ${g.y}px) scale(${g.s})` }}>
          <img src={L.src} alt="Bông và Mochi ngủ cạnh nhau trên ghế sofa" draggable={false} />
          <div className="cat-room" />

          {/* mỗi bé thở nhẹ khi ngủ; bé nào đang đổi dáng thì lớp này ẩn đi */}
          {cats.map((c, i) => {
            const b = polyBox(c.cat.poly)
            const has = c.cat.poses.length > 0
            return (
              <div key={c.id} className={`cat-breath${busy === c.id && has ? ' hide' : ''}${busy === c.id && !has ? ' fake' : ''}`}
                style={{ clipPath: `polygon(${c.cat.poly.map(([x, y]) => `${x}px ${y}px`).join(',')})`, backgroundImage: `url(${L.src})`, transformOrigin: `${b.x + b.w * (c.id === 'mochi' ? 0.15 : 0.5)}px ${b.y + b.h}px`, animationDelay: `${-i * 1.7}s` }} />
            )
          })}

          {cats.map((c) => c.cat.poses.map((p, i) => <Over key={`${c.id}${i}`} L={L} pose={p} on={show === `${c.id}-${i}`} />))}
          {cats.map((c) => <Glow key={c.id} L={L} cat={c.cat} on={hov === c.id && !busy} />)}

          {/* đèn lồng chập chờn */}
          <i className="cat-lamp halo" style={{ left: L.lamp[0] - L.lamp[2] * 3.4, top: L.lamp[1] - L.lamp[2] * 3.4, width: L.lamp[2] * 6.8, height: L.lamp[2] * 6.8 }} />
          <i className="cat-lamp" style={{ left: L.lamp[0] - L.lamp[2], top: L.lamp[1] - L.lamp[2], width: L.lamp[2] * 2, height: L.lamp[2] * 2 }} />
          <i className="cat-lamp core" style={{ left: L.lamp[0] - L.lamp[2] * 0.32, top: L.lamp[1] - L.lamp[2] * 0.32, width: L.lamp[2] * 0.64, height: L.lamp[2] * 0.64 }} />
          <div className="cat-dim" />
          {active && <Dust w={L.w} h={L.h} />}

          <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
            {cats.map((c) => (
              <polygon key={c.id} className="cat-hs" points={c.cat.poly.map((q) => q.join(',')).join(' ')} tabIndex={busy ? -1 : 0} role="button" aria-label={c.label} aria-disabled={!!busy}
                onMouseEnter={() => enter(c)} onMouseLeave={leave} onFocus={() => enter(c)} onBlur={leave}
                onClick={() => poke(c.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(c.id) } }} />
            ))}
          </svg>
        </div>
      </div>

      <div className="sec-text" ref={txt} style={textStyle}>
        <h2 className="sec-title">{copy.title}</h2>
        <div className="sec-orn" aria-hidden><i /><b>❦</b><i /></div>
        <p className="sec-tag">{copy.tagline}</p>
        {copy.body.map((t, i) => <p key={i} className="sec-desc">{t}</p>)}
        <p className="sec-hint"><span aria-hidden>✦</span>{copy.hint}</p>
      </div>

      {tip && !busy && (() => {
        const W = sec.current?.clientWidth ?? 800
        const cx = Math.min(Math.max(g.x + (tip.b.x + tip.b.w / 2) * g.s, 150), W - 150)
        const above = g.y + tip.b.y * g.s > 130
        const top = above ? g.y + tip.b.y * g.s - 12 : g.y + (tip.b.y + tip.b.h) * g.s + 12
        return <div className="tr-tip" style={{ left: cx, top, transform: `translate(-50%, ${above ? '-100%' : '0'})` }}><b>{tip.title}</b><span>{tip.text}</span></div>
      })()}
    </section>
  )
}
