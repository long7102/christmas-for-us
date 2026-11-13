import { useEffect, useRef, useState } from 'react'
import { snow as copy } from '../content/content'
import { isLite, reducedMotion } from '../lib/device'
import { weather } from '../lib/weather'
import { useHintPulse } from '../lib/hintPulse'
import { Stardust } from '../components/LitSpot'
import { Dust } from './Tree'
import { SNOW as L } from './snowLayout'

const POSE_HOLD = 6500
const FADE = 1000

/** Tuyết rơi sau kính: ba lớp xa gần, trôi theo gió chung của cả trang. Chỉ vẽ trong các ô kính. */
function SnowFall({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    if (reducedMotion()) return
    const K = 0.5
    cv.width = L.w * K; cv.height = L.h * K
    ctx.scale(K, K)
    ctx.beginPath(); L.panes.forEach(([x, y, w, h]) => ctx.rect(x, y, w, h)); ctx.clip()
    if (!active) return
    const n = isLite() ? 60 : 150
    const fl = Array.from({ length: n }, () => ({ x: Math.random() * L.w, y: Math.random() * L.h, z: Math.random() ** 1.6, ph: Math.random() * 6.28 }))
    let raf = 0, last = performance.now()
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      ctx.clearRect(0, 0, L.w, L.h)
      for (const f of fl) {
        f.y += (26 + f.z * 96) * dt
        f.x += (weather.sway(t, f.ph) * (10 + f.z * 38) + Math.sin(t / 900 + f.ph) * 6 * f.z) * dt
        if (f.y > 660) { f.y = -8; f.x = Math.random() * L.w }
        if (f.x > L.w + 10) f.x = -10; else if (f.x < -10) f.x = L.w + 10
        const r = 1 + f.z * 3.6
        ctx.globalAlpha = 0.45 + f.z * 0.5
        if (f.z > 0.78) {
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 1.8)
          g.addColorStop(0, '#fff'); g.addColorStop(0.5, 'rgba(240,246,255,.7)'); g.addColorStop(1, 'rgba(235,242,255,0)')
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, r * 1.8, 0, 6.283); ctx.fill()
        } else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 6.283); ctx.fill() }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active])
  return <canvas ref={ref} className="sw-cv" aria-hidden />
}

/** Sao băng bay qua bầu trời. Bay thưa thớt ngẫu nhiên; `kick` tăng lên thì thêm một vì sao ngay (khi chỉ tay lên trời). */
function Meteors({ active, kick }: { active: boolean; kick: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const want = useRef(0)
  const lastKick = useRef(kick)
  if (kick !== lastKick.current) { lastKick.current = kick; want.current = performance.now() + 900 }
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    if (reducedMotion() || !active) return
    const K = 0.5
    cv.width = L.w * K; cv.height = L.h * K
    ctx.scale(K, K)
    ctx.beginPath(); L.panes.forEach(([x, y, w, h]) => ctx.rect(x, y, w, h)); ctx.clip()
    type M = { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number }
    const ms: M[] = []
    let raf = 0, last = performance.now(), next = last + 4000 + Math.random() * 5000
    const spawn = () => {
      const a = (Math.PI * (0.78 + Math.random() * 0.1)) // hướng xuống trái
      const sp = 900 + Math.random() * 500
      ms.push({ x: 800 + Math.random() * 760, y: 10 + Math.random() * 150, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.8 + Math.random() * 0.5, len: 300 + Math.random() * 200 })
    }
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      if (want.current && t > want.current) { want.current = 0; spawn() }
      if (t > next && !document.hidden) { spawn(); next = t + 9000 + Math.random() * 14000 }
      ctx.clearRect(0, 0, L.w, L.h)
      for (let i = ms.length - 1; i >= 0; i--) {
        const m = ms[i]; m.life += dt
        if (m.life > m.max) { ms.splice(i, 1); continue }
        m.x += m.vx * dt; m.y += m.vy * dt
        const k = m.life / m.max, a = Math.sin(Math.PI * Math.min(1, k * 1.15))
        const nx = -m.vx / Math.hypot(m.vx, m.vy), ny = -m.vy / Math.hypot(m.vx, m.vy)
        const tx = m.x + nx * m.len, ty = m.y + ny * m.len
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty)
        g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`); g.addColorStop(0.35, `rgba(200,224,255,${0.45 * a})`); g.addColorStop(1, 'rgba(180,210,255,0)')
        ctx.strokeStyle = g; ctx.lineWidth = 4.2; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke()
        const h = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 14)
        h.addColorStop(0, `rgba(255,255,255,${a})`); h.addColorStop(1, 'rgba(210,230,255,0)')
        ctx.fillStyle = h; ctx.beginPath(); ctx.arc(m.x, m.y, 14, 0, 6.283); ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active])
  return <canvas ref={ref} className="sw-cv" aria-hidden />
}

/**
 * Hơi nước mờ trên kính. Lớp hơi nước dựng sẵn một lần; chỗ bị lau được ghi trong một bảng độ lau nhỏ,
 * tự mờ lại dần (khoảng nửa phút). Thỉnh thoảng một giọt nước chảy xuống để lại vệt. Chỉ tính lại khi có gì thay đổi.
 * Rê chuột (hoặc kéo ngón tay) trên kính để lau.
 */
function Fog({ active, wipeRef }: { active: boolean; wipeRef: React.MutableRefObject<(x: number, y: number, px: number, py: number) => void> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d', { willReadFrequently: true })!
    const K = 0.4, W = Math.round(L.w * K), H = Math.round(L.h * K)
    cv.width = W; cv.height = H
    // lớp hơi nước gốc: đậm dần xuống phía dưới kính, lấm tấm như hạt nước đọng
    const tx = document.createElement('canvas'); tx.width = W; tx.height = H
    const tc = tx.getContext('2d')!
    const gr = tc.createLinearGradient(0, 0, 0, 636 * K)
    gr.addColorStop(0, 'rgba(206,222,242,.27)'); gr.addColorStop(1, 'rgba(222,233,247,.56)')
    tc.fillStyle = gr
    L.panes.forEach(([x, y, w, h]) => tc.fillRect(x * K, y * K, w * K, h * K))
    tc.globalCompositeOperation = 'source-atop'
    let s = 7
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    for (let i = 0; i < 1500; i++) {
      const x = rnd() * W, y = rnd() * H * 0.95, r = 0.5 + rnd() * 1.6
      tc.fillStyle = `rgba(255,255,255,${0.05 + rnd() * 0.12})`
      tc.beginPath(); tc.arc(x, y, r, 0, 6.283); tc.fill()
    }
    const base = tc.getImageData(0, 0, W, H)
    const out = ctx.createImageData(W, H)
    out.data.set(base.data)
    const wipe = new Uint8Array(W * H)
    let dirty = true, live = 0
    const paint = () => {
      const b = base.data, o = out.data
      for (let i = 0, j = 3; i < wipe.length; i++, j += 4) o[j] = (b[j] * (255 - wipe[i])) / 255
      ctx.putImageData(out, 0, 0)
    }
    const stamp = (cx: number, cy: number, R: number, str: number) => {
      const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(W - 1, Math.ceil(cx + R))
      const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(H - 1, Math.ceil(cy + R))
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy) / R
        if (d >= 1) continue
        const v = str * Math.min(1, (1 - d) * 2.2) // mép mềm
        const i = y * W + x
        if (v > wipe[i]) { if (!wipe[i]) live++; wipe[i] = v }
      }
    }
    wipeRef.current = (x, y, px, py) => {
      const d = Math.hypot(x - px, y - py), n = Math.max(1, Math.ceil((d * K) / 4))
      for (let k = 0; k <= n; k++) { const f = k / n; stamp((px + (x - px) * f) * K, (py + (y - py) * f) * K, 34 * K, 255) }
      dirty = true
    }
    if (reducedMotion() || !active) { paint(); return }
    const drips: { x: number; y: number; v: number; max: number }[] = []
    let raf = 0, last = performance.now(), tFade = 0, nextDrip = last + 3500
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      if (t > nextDrip && drips.length < 3 && !document.hidden) {
        const p = L.panes[Math.random() < 0.7 ? 1 : (Math.random() < 0.5 ? 0 : 2)]
        drips.push({ x: (p[0] + 20 + Math.random() * (p[2] - 40)) * K, y: (180 + Math.random() * 240) * K, v: (18 + Math.random() * 16) * K, max: (90 + Math.random() * 150) * K })
        nextDrip = t + 5000 + Math.random() * 7000
      }
      for (let i = drips.length - 1; i >= 0; i--) {
        const d = drips[i], ny = d.y + d.v * dt
        if (ny - 180 * K > d.max || ny > 630 * K) { drips.splice(i, 1); continue }
        for (let yy = d.y; yy <= ny; yy += 1) stamp(d.x + Math.sin(yy * 0.35) * 0.3, yy, 1.9, 255)
        stamp(d.x, ny, 2.6, 255)
        d.y = ny; dirty = true
      }
      tFade += dt
      if (tFade > 0.12 && live > 0) { // hơi nước phủ lại dần
        tFade = 0; live = 0
        for (let i = 0; i < wipe.length; i++) if (wipe[i]) { wipe[i]--; if (wipe[i]) live++ }
        dirty = true
      }
      if (dirty) { dirty = false; paint() }
      raf = requestAnimationFrame(frame)
    }
    paint()
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active, wipeRef])
  return <canvas ref={ref} className="sw-cv sw-fog" aria-hidden />
}

export default function SnowWatch() {
  const sec = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [g, setG] = useState({ s: 1, x: 0, y: 0 })
  const [pose, setPose] = useState(0)
  const [maskPose, setMaskPose] = useState(0)
  const [hov, setHov] = useState(false)
  const [kick, setKick] = useState(0)
  const wipeRef = useRef<(x: number, y: number, px: number, py: number) => void>(() => {})
  const prev = useRef<[number, number] | null>(null)
  const timers = useRef<number[]>([])
  const pulse = useHintPulse(1, active, pose !== 0 || hov)

  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting), { threshold: 0.12 })
    io.observe(sec.current!)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const el = host.current!
    const fit = () => {
      const vw = el.clientWidth, vh = el.clientHeight, F = L.focus
      const s = Math.max(vw / L.w, vh / L.h)
      const cx = (F.x1 + F.x2) / 2, cy = (F.y1 + F.y2) / 2
      const x = Math.min(0, Math.max(vw - L.w * s, vw / 2 - cx * s))
      const y = Math.min(0, Math.max(vh - L.h * s, vh / 2 - cy * s))
      setG((o) => (o.s === s && o.x === x && o.y === y ? o : { s, x, y }))
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el)
    return () => ro.disconnect()
  }, [])
  useEffect(() => () => timers.current.forEach(clearTimeout), [])

  const poke = () => {
    if (pose !== 0 || timers.current.length) return
    setPose(1); setKick((k) => k + 1); setHov(false)
    timers.current.push(window.setTimeout(() => setMaskPose(1), FADE / 2))
    timers.current.push(window.setTimeout(() => {
      setPose(0)
      timers.current.push(window.setTimeout(() => setMaskPose(0), FADE / 2))
      timers.current.push(window.setTimeout(() => { timers.current = [] }, FADE))
    }, POSE_HOLD))
  }

  // lau kính: toạ độ con trỏ đổi sang toạ độ ảnh gốc
  const move = (e: React.PointerEvent) => {
    const r = stage.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * L.w, y = ((e.clientY - r.top) / r.height) * L.h
    const p = prev.current
    if (p && Math.hypot(x - p[0], y - p[1]) > 400) prev.current = null
    wipeRef.current(x, y, prev.current ? prev.current[0] : x, prev.current ? prev.current[1] : y)
    prev.current = [x, y]
  }

  const cur = L.poses[pose]
  const mask = L.poses[maskPose]
  const lit = (hov || pulse === 0) && pose === 0
  const maskStyle = { WebkitMaskImage: `url(${mask.hide})`, maskImage: `url(${mask.hide})` }
  const gb = L.panes.reduce((m, [x, y, w, h]) => ({ x1: Math.min(m.x1, x), y1: Math.min(m.y1, y), x2: Math.max(m.x2, x + w), y2: Math.max(m.y2, y + h) }), { x1: 1e9, y1: 1e9, x2: 0, y2: 0 })

  return (
    <section id="snow" className="tree-scene snow-scene" ref={sec}>
      <div className="sec-frame" ref={host}>
        <div className="tr-stage" ref={stage} style={{ width: L.w, height: L.h, transform: `translate(${g.x}px, ${g.y}px) scale(${g.s})` }}>
          <img className="sw-img" src={L.poses[0].src} alt="Hai người ngồi sát nhau dưới chăn len, quay lưng nhìn tuyết rơi ngoài cửa sổ lớn" draggable={false} />
          <img className={`sw-img sw-top${pose ? ' on' : ''}`} src={L.poses[1].src} alt="" draggable={false} />

          {/* tuyết, hơi nước và sao băng ở sau kính: đi sau lưng hai người nhờ mặt nạ theo dáng ngồi hiện tại */}
          <div className="sw-fx" style={maskStyle}>
            <SnowFall active={active} />
            <Meteors active={active} kick={kick} />
            <Fog active={active} wipeRef={wipeRef} />
          </div>

          <div className="sw-glass" style={{ left: gb.x1, top: gb.y1, width: gb.x2 - gb.x1, height: gb.y2 - gb.y1 }}
            onPointerMove={(e) => { if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'touch') move(e) }}
            onPointerLeave={() => { prev.current = null }} onPointerUp={() => { prev.current = null }} />

          <div className={`cat-glow${lit ? ' on' : ''}`} style={{ left: 0, top: 0, width: L.w, height: L.h }}>
            <i style={{ backgroundImage: `url(${cur.src})`, backgroundSize: '100% 100%', WebkitMaskImage: `url(${cur.cut})`, maskImage: `url(${cur.cut})` }} />
          </div>
          <Stardust poly={L.poses[0].poly} on={lit} />
          {active && <Dust w={L.w} h={L.h} />}

          <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
            <polygon className="cat-hs" points={cur.poly.map((q) => q.join(',')).join(' ')} tabIndex={pose ? -1 : 0} role="button" aria-label="Hai người ngồi ngắm tuyết"
              onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} onFocus={() => setHov(true)} onBlur={() => setHov(false)}
              onClick={poke} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke() } }} />
          </svg>
        </div>
      </div>

      <div className="sec-text">
        <h2 className="sec-title">{copy.title}</h2>
        <div className="sec-orn" aria-hidden><i /><b>❦</b><i /></div>
        <p className="sec-tag">{copy.tagline}</p>
        {copy.body.map((t, i) => <p key={i} className="sec-desc">{t}</p>)}
      </div>
    </section>
  )
}
