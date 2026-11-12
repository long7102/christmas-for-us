import { useEffect, useMemo, useRef, useState } from 'react'
import { gifts, memories, tree as treeCopy } from '../content/content'
import { reducedMotion } from '../lib/device'
import { store } from '../lib/storage'
import { isUnlocked } from '../lib/unlock'
import { ModalView, PaperFilter, type Modal } from './Letter'
import { LAND, PORT, polyBox, type Layout, type P, type R } from './treeLayout'

/** Tuyết rơi sau cửa sổ (canvas nhỏ, chỉ vẽ trong ô kính). */
function WindowSnow({ r }: { r: R }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    const K = 2, W = (cv.width = r.w * K), H = (cv.height = r.h * K)
    const n = reducedMotion() ? 25 : 90
    const fl = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, z: 0.4 + Math.random() * 0.9, ph: Math.random() * 6.28 }))
    let raf = 0, last = performance.now()
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      ctx.clearRect(0, 0, W, H)
      for (const f of fl) {
        f.y += (22 + 30 * f.z) * K * dt * 0.6
        f.x += Math.sin(t / 1100 + f.ph) * 10 * K * dt + 5 * K * dt
        if (f.y > H + 6) { f.y = -6; f.x = Math.random() * W }
        if (f.x > W + 6) f.x = -6
        const rad = (1 + 1.8 * f.z) * K * 0.7
        ctx.globalAlpha = 0.45 + 0.4 * f.z
        ctx.fillStyle = '#eaf3ff'
        ctx.beginPath(); ctx.arc(f.x, f.y, rad, 0, 6.283); ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const vis = () => { if (document.hidden) cancelAnimationFrame(raf); else { last = performance.now(); raf = requestAnimationFrame(frame) } }
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis) }
  }, [r.w, r.h])
  return <canvas ref={ref} className="tr-snow" style={{ left: r.x, top: r.y, width: r.w, height: r.h }} />
}

function Fire({ r, flare }: { r: R; flare: boolean }) {
  return (
    <>
      <div className={`tr-fireglow${flare ? ' flare' : ''}`} style={{ left: r.x - r.w * 1.6, top: r.y - r.h * 0.9, width: r.w * 4.2, height: r.h * 2.6 }} />
      <div className="tr-fire" style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
        <i /><i /><i />
      </div>
    </>
  )
}

/** Tàn lửa bay lên + những tiếng "tách" bắn tia lửa. */
function Embers({ r, kick }: { r: R; kick: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const burst = useRef<() => void>(() => {})
  useEffect(() => { if (kick > 0) burst.current() }, [kick])
  const W = Math.round(r.w * 2.2), H = Math.round(r.h * 2.8), ox = r.x - r.w * 0.6, oy = r.y - r.h * 1.75
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    type E = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; hot: boolean }
    const es: E[] = []
    const bx = r.x - ox + r.w * 0.45, by = r.y - oy + r.h * 0.78
    const spawn = (hot: boolean): E => ({
      x: bx + (Math.random() - 0.5) * r.w * 0.5, y: by + (Math.random() - 0.5) * 6,
      vx: (Math.random() - 0.5) * (hot ? 90 : 22), vy: -(hot ? 80 + Math.random() * 110 : 30 + Math.random() * 40),
      life: 0, max: hot ? 0.7 + Math.random() * 0.8 : 1.6 + Math.random() * 1.8, s: hot ? 1.4 + Math.random() * 1.6 : 1 + Math.random() * 1.6, hot,
    })
    burst.current = () => { for (let i = 0; i < 34; i++) es.push(spawn(true)) }
    let raf = 0, last = performance.now(), nextPop = 600, acc = 0
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      acc += dt * (reducedMotion() ? 2 : 6)
      while (acc > 1) { acc -= 1; es.push(spawn(false)) }
      nextPop -= dt * 1000
      if (nextPop < 0) { nextPop = 900 + Math.random() * 2600; const n = 4 + Math.floor(Math.random() * 6); for (let i = 0; i < n; i++) es.push(spawn(true)) }
      ctx.clearRect(0, 0, W, H)
      ctx.globalCompositeOperation = 'lighter'
      for (let i = es.length - 1; i >= 0; i--) {
        const e = es[i]; e.life += dt
        if (e.life > e.max) { es.splice(i, 1); continue }
        e.vy += (e.hot ? 150 : -4) * dt
        e.x += (e.vx + Math.sin(t / 380 + i) * 14) * dt; e.y += e.vy * dt
        const k = 1 - e.life / e.max, rad = e.s * (0.6 + k)
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, rad * 4)
        g.addColorStop(0, `rgba(255,${e.hot ? 230 : 190},${e.hot ? 150 : 80},${k})`); g.addColorStop(1, 'rgba(255,90,20,0)')
        ctx.fillStyle = g; ctx.fillRect(e.x - rad * 4, e.y - rad * 4, rad * 8, rad * 8)
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis) }
  }, [r, ox, oy])
  return <canvas ref={ref} width={W} height={H} className="tr-embers" style={{ left: ox, top: oy, width: W, height: H }} />
}

/** Bụi sáng trôi trong không khí ấm của căn phòng. */
function Dust({ w, h }: { w: number; h: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    const K = 0.5, W = (cv.width = w * K), H = (cv.height = h * K)
    const n = reducedMotion() ? 18 : 55
    const ms = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: 0.8 + Math.random() * 1.6, sp: 2 + Math.random() * 6, ph: Math.random() * 6.28, tw: 0.4 + Math.random() * 0.9 }))
    let raf = 0, last = performance.now()
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      ctx.clearRect(0, 0, W, H)
      for (const m of ms) {
        m.x += (Math.sin(t / 2300 + m.ph) * 4 + m.sp * 0.6) * dt; m.y += (Math.cos(t / 1900 + m.ph) * 3 - m.sp * 0.45) * dt
        if (m.x > W + 5) m.x = -5; if (m.y < -5) m.y = H + 5; if (m.y > H + 5) m.y = -5
        const a = 0.15 + 0.4 * (0.5 + 0.5 * Math.sin(t / 1200 * m.tw + m.ph))
        ctx.fillStyle = `rgba(255,222,160,${a})`
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 6.283); ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis) }
  }, [w, h])
  return <canvas ref={ref} className="tr-dust" style={{ width: w, height: h }} />
}

/** Ánh đèn lồng / nến chập chờn. */
function Lamps({ lamps, flare }: { lamps: Layout['lamps']; flare: Set<number> }) {
  return (
    <>
      {lamps.map(([x, y, r], i) => (
        <i key={i} className={`tr-lamp${flare.has(i) ? ' flare' : ''}`} style={{ left: x - r, top: y - r, width: r * 2, height: r * 2, animationDuration: `${1.6 + (i % 4) * 0.45}s`, animationDelay: `-${i * 0.37}s` }} />
      ))}
    </>
  )
}

const poly = (p: P) => `polygon(${p.map(([x, y]) => `${x}px ${y}px`).join(',')})`
const bbox = (p: P) => {
  const xs = p.map((q) => q[0]), ys = p.map((q) => q[1])
  return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) }
}

/** Đốm sáng lấp lánh trên những chùm đèn của cây. */
function Twinkles({ t }: { t: Layout['tree'] }) {
  const dots = useMemo(() => {
    let s = 7
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    return Array.from({ length: 34 }, () => {
      const y = t.top + rnd() * (t.base - t.top)
      const half = ((y - t.top) / (t.base - t.top)) * t.half
      return { x: t.cx + (rnd() * 2 - 1) * half * 0.9, y, d: rnd() * 4, p: 2 + rnd() * 3 }
    })
  }, [t])
  return (
    <>
      {dots.map((d, i) => (
        <b key={i} className="tr-tw" style={{ left: d.x, top: d.y, animationDelay: `-${d.d}s`, animationDuration: `${d.p}s` }} />
      ))}
    </>
  )
}

const FLARE_MS = 2400

export default function Tree() {
  const sec = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const txt = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'wide' | 'tall'>(() => (innerWidth / innerHeight < 0.7 ? 'tall' : 'wide'))
  const [compact, setCompact] = useState(() => innerWidth < 1100)
  const L = mode === 'tall' ? PORT : LAND
  const [g, setG] = useState({ s: 1, x: 0, y: 0 })
  const [modal, setModal] = useState<Modal>(null)
  const [hov, setHov] = useState<number | null>(null)
  const [opened, setOpened] = useState<Record<number, boolean>>(() => store.get('giftsOpened', {}))
  const [opening, setOpening] = useState<number | null>(null)
  const [, tick] = useState(0)
  const [kick, setKick] = useState(0)
  const [starKey, setStarKey] = useState(0)
  const [flash, setFlash] = useState(false)
  const [lampOn, setLampOn] = useState<Set<number>>(new Set())
  const [fireOn, setFireOn] = useState(false)
  const [wreathKey, setWreathKey] = useState(0)
  const [tip, setTip] = useState<{ title: string; text: string; b: { x: number; y: number; w: number; h: number } } | null>(null)

  useEffect(() => {
    const el = sec.current!
    const measure = () => {
      const w = el.clientWidth, h = el.clientHeight
      setMode(w / h < 0.7 ? 'tall' : 'wide'); setCompact(w < 1100)
    }
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
      const s = Math.max(vw / L.w, vh / L.h)
      const cx = (F.x1 + F.x2) / 2, cy = (F.y1 + F.y2) / 2
      let x = vw / 2 - cx * s
      let y = Math.min(vis / 2 - cy * s, vis - F.y2 * s - 10)
      x = Math.min(0, Math.max(vw - L.w * s, x)); y = Math.min(0, mode === 'tall' ? y : Math.max(vh - L.h * s, y))
      setG({ s, x, y })
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el); if (txt.current) ro.observe(txt.current)
    return () => ro.disconnect()
  }, [L, mode])

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const openGift = (i: number) => {
    const gf = gifts[i]
    if (!isUnlocked(gf.unlockAt) || opened[i] || opening !== null) { setModal({ kind: 'gift', i }); return }
    setOpening(i)
    setTimeout(() => {
      const next = { ...opened, [i]: true }
      setOpened(next); store.set('giftsOpened', next); setOpening(null)
      setModal({ kind: 'gift', i })
    }, reducedMotion() ? 200 : 1900)
  }

  const later = (f: () => void) => setTimeout(f, reducedMotion() ? 0 : 750)
  const poke = (id: string) => {
    if (id === 'star') { setStarKey((k) => k + 1); setFlash(true); setTimeout(() => setFlash(false), 2600); later(() => setModal({ kind: 'memory', id })) }
    else if (id === 'fire') { setKick((k) => k + 1); setFireOn(true); setTimeout(() => setFireOn(false), FLARE_MS); later(() => setModal({ kind: 'memory', id })) }
    else if (id === 'wreath') { setWreathKey((k) => k + 1); later(() => setModal({ kind: 'memory', id })) }
    else setModal({ kind: 'memory', id })
  }
  const pokeLamp = (i: number) => {
    setLampOn((s) => new Set(s).add(i))
    setTimeout(() => setLampOn((s) => { const n = new Set(s); n.delete(i); return n }), FLARE_MS)
    later(() => setModal({ kind: 'memory', id: 'lamp', i }))
  }

  const showTip = (id: string, poly: P, i?: number) => {
    if (id.startsWith('gift')) {
      const gf = gifts[i!]
      setTip({ title: gf.title, text: isUnlocked(gf.unlockAt) ? 'Đã đến ngày, bấm để mở.' : 'Chưa đến ngày mở, bấm để xem còn bao lâu.', b: polyBox(poly) })
    } else {
      const m = memories[id]
      if (m) setTip({ title: m.title, text: m.tip, b: polyBox(poly) })
    }
  }
  const halo = (id: string, key: number) => {
    const sp = L.spots.find((q) => q.id === id)
    if (!sp || !key) return null
    const b = polyBox(sp.poly), r = Math.max(b.w, b.h) * 1.5
    return <div key={`${id}${key}`} className="tr-halo" style={{ left: b.x + b.w / 2 - r / 2, top: b.y + b.h / 2 - r / 2, width: r, height: r }} />
  }
  const bodyPoly = (i: number): P => L.polys[i].map(([x, y]) => [x, Math.max(y, L.lids[i].y1)] as [number, number])
  const lidVars = (i: number) => {
    const d = L.lids[i], ys = L.polys[i].map((q) => q[1]), bottom = Math.max(...ys)
    const k = L.w > 1000 ? 1 : 1.15
    const dx = [-62, -38, 46, 74][i] * k
    return { '--dx': `${dx}px`, '--dy': `${bottom - d.y2 + 30}px`, '--rot': `${[-5, 4, -4, 5][i]}deg` } as React.CSSProperties
  }

  return (
    <section className={`tree-scene ${mode} ${compact ? 'compact' : ''}`} ref={sec}>
      <PaperFilter />
      <div className="sec-frame" ref={host}>
        <div className={`tr-stage${flash ? ' flash' : ''}`} style={{ width: L.w, height: L.h, transform: `translate(${g.x}px, ${g.y}px) scale(${g.s})` }}>
          <img src={L.src} alt="Cây thông Giáng sinh và bốn món quà" draggable={false} />
          <WindowSnow r={L.win} />
          <Fire r={L.fire} flare={fireOn} />
          <Embers r={L.fire} kick={kick} />
          <Lamps lamps={L.lamps} flare={lampOn} />
          <Twinkles t={L.tree} />
          <Dust w={L.w} h={L.h} />
          <div className="tr-warm" />

          {/* hộp quà sáng hơn một chút */}
          {L.polys.map((p, i) => (
            <div key={`b${i}`} className="tr-litwrap base"><div className="tr-lit" style={{ clipPath: poly(opened[i] ? bodyPoly(i) : p), backgroundImage: `url(${L.src})` }} /></div>
          ))}

          {/* hộp đã mở: bù lại nền sau nơ, miệng hộp, luồng sáng */}
          {L.lids.map((d, i) => {
            const on = opening === i || opened[i]
            const h = d.y1 - d.top + 4, w = d.x2 - d.x1 + 12
            return (
              <div key={`o${i}`} className={`tr-open${on ? ' on' : ''}`}>
                <div className="tr-patch" style={{ left: d.x1 - 6, top: d.top - 4, width: w, height: h, backgroundImage: `url(${L.src})`, backgroundSize: `${L.w}px ${L.h}px`, backgroundPosition: `${-(d.x1 - 6)}px ${-(d.top - 4 - h)}px` }} />
                <div className="tr-inside" style={{ left: d.x1, top: d.y1, width: d.x2 - d.x1, height: d.y2 - d.y1 }} />
                <div className="tr-beam" style={{ left: d.x1 + 6, top: d.y1 - 150, width: d.x2 - d.x1 - 12, height: 160 }} />
              </div>
            )
          })}

          {L.polys.map((p, i) => (
            <div key={`d${i}`} className={`tr-dim${hov !== null && hov !== i ? ' on' : ''}`} style={{ clipPath: poly(opened[i] ? bodyPoly(i) : p) }} />
          ))}
          {L.polys.map((p, i) => (
            <div key={`l${i}`} className={`tr-litwrap${hov === i ? ' on' : ''}`}>
              <div className="tr-lit" style={{ clipPath: poly(opened[i] ? bodyPoly(i) : p), backgroundImage: `url(${L.src})` }} />
            </div>
          ))}

          {/* nắp hộp: bay lên rồi nằm dưới đất */}
          {L.lids.map((d, i) => {
            if (!opened[i] && opening !== i) return null
            return (
              <div key={`lid${i}`} className={`tr-lid ${opening === i ? 'go' : 'landed'}`} style={lidVars(i)}>
                <div className="tr-lit lidimg" style={{ clipPath: poly(d.poly), backgroundImage: `url(${L.src})` }} />
              </div>
            )
          })}

          {/* gợi ý hộp đến ngày mở */}
          {L.lids.map((d, i) => (isUnlocked(gifts[i].unlockAt) && !opened[i] && opening !== i
            ? <span key={`c${i}`} className="tr-cue" style={{ left: (d.x1 + d.x2) / 2, top: d.top - 22 }}>✦</span> : null))}

          {/* hiệu ứng */}
          {halo('star', starKey)}
          {halo('wreath', wreathKey)}

          <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
            {L.spots.map((q) => (
              <polygon key={q.id} className="tr-hs" points={q.poly.map((c) => c.join(',')).join(' ')} tabIndex={0} role="button"
                aria-label={q.id} onMouseEnter={() => showTip(q.id, q.poly)} onMouseLeave={() => setTip(null)} onFocus={() => showTip(q.id, q.poly)} onBlur={() => setTip(null)}
                onClick={() => { setTip(null); poke(q.id) }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(q.id) } }} />
            ))}
            {L.lampPolys.map((lp, i) => (
              <polygon key={`lp${i}`} className="tr-hs" points={lp.map((c) => c.join(',')).join(' ')} tabIndex={0} role="button" aria-label="đèn"
                onMouseEnter={() => showTip('lamp', lp)} onMouseLeave={() => setTip(null)} onFocus={() => showTip('lamp', lp)} onBlur={() => setTip(null)}
                onClick={() => { setTip(null); pokeLamp(i) }} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pokeLamp(i) } }} />
            ))}
            {L.polys.map((p, i) => {
              const gf = gifts[i]
              return (
                <polygon key={gf.id} className="tr-gifthit" points={(opened[i] ? bodyPoly(i) : p).map((q) => q.join(',')).join(' ')} tabIndex={0} role="button"
                  aria-label={gf.title}
                  onMouseEnter={() => { setHov(i); showTip('gift', opened[i] ? bodyPoly(i) : p, i) }} onMouseLeave={() => { setHov(null); setTip(null) }} onFocus={() => { setHov(i); showTip('gift', p, i) }} onBlur={() => { setHov(null); setTip(null) }}
                  onClick={() => { setTip(null); openGift(i) }}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGift(i) } }} />
              )
            })}
          </svg>
        </div>
      </div>

      <div className="sec-text" ref={txt}>
        <h2 className="sec-title">{treeCopy.title}</h2>
        <p className="sec-desc">{treeCopy.body}</p>
        <p className="sec-hint">{treeCopy.hint}</p>
      </div>

      {tip && (() => {
        const W = sec.current?.clientWidth ?? 800
        const cx = Math.min(Math.max(g.x + (tip.b.x + tip.b.w / 2) * g.s, 150), W - 150)
        const above = g.y + tip.b.y * g.s > 130
        const top = above ? g.y + tip.b.y * g.s - 12 : g.y + (tip.b.y + tip.b.h) * g.s + 12
        return <div className="tr-tip" style={{ left: cx, top, transform: `translate(-50%, ${above ? '-100%' : '0'})` }}><b>{tip.title}</b><span>{tip.text}</span></div>
      })()}

      {modal && <ModalView modal={modal} onClose={() => setModal(null)} />}
    </section>
  )
}
