import { useEffect, useRef, useState } from 'react'
import { snow as copy } from '../content/content'
import { isLite, reducedMotion } from '../lib/device'
import { weather } from '../lib/weather'
import { Dust } from './Tree'
import { lights, useLights } from '../lib/lights'
import { SNOW as L } from './snowLayout'

const GLASS = L.panes.map(([x, y, w, h]) => `M${x} ${y}H${x + w}V${y + h}H${x}Z`).join('')
const ROOM = `M0 0H${L.w}V${L.h}H0Z${GLASS}`
/** Mặt nạ cho lớp tối: tối khắp nơi, riêng quanh từng ngọn nến thì sáng dần lên (các mặt nạ nhân với nhau nên chỗ nào có nến thì chỗ đó sáng). */
const holes = (() => {
  const m = L.flames.map(([x, y, k]) => `radial-gradient(circle at ${x}px ${y}px, rgba(0,0,0,0) 0, rgba(0,0,0,.22) ${70 * k}px, #000 ${420 * k}px)`).join(',')
  return { WebkitMaskImage: m, maskImage: m, WebkitMaskComposite: 'source-in', maskComposite: 'intersect' } as React.CSSProperties
})()
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

/** Sao băng bay qua bầu trời mỗi khi `fire` tăng lên (do bộ hẹn giờ của cảnh quyết định, thỉnh thoảng và ngẫu nhiên). */
function Meteors({ active, fire }: { active: boolean; fire: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pending = useRef(0)
  const lastFire = useRef(fire)
  if (fire !== lastFire.current) { lastFire.current = fire; pending.current++ }
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    if (reducedMotion() || !active) return
    const K = 0.5
    cv.width = L.w * K; cv.height = L.h * K
    ctx.scale(K, K)
    ctx.beginPath(); L.panes.forEach(([x, y, w, h]) => ctx.rect(x, y, w, h)); ctx.clip()
    type M = { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number }
    const ms: M[] = []
    let raf = 0, last = performance.now()
    const spawn = () => {
      const a = (Math.PI * (0.78 + Math.random() * 0.1)) // hướng xuống trái
      const sp = 900 + Math.random() * 500
      ms.push({ x: 800 + Math.random() * 760, y: 10 + Math.random() * 150, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, life: 0, max: 0.8 + Math.random() * 0.5, len: 300 + Math.random() * 200 })
    }
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      while (pending.current > 0) { pending.current--; spawn() }
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
 * Hơi nước đọng trên kính. Lớp hơi nước dựng sẵn một lần: nền sương mờ lốm đốm, hàng nghìn hạt li ti,
 * vài trăm giọt nước tròn (có viền tối ở đáy và điểm sáng như giọt thật), đậm dần xuống phía dưới.
 * Chỗ bị lau ghi trong một bảng độ lau nhỏ, tự phủ lại dần (khoảng nửa phút; vệt giọt chảy lâu hơn nhiều).
 * Thỉnh thoảng một giọt nước lăn xuống: đi từng chặp, dừng rồi lại trượt, lệch nhẹ, để lại vệt trong, đầu vệt là giọt tròn sáng.
 * Chỉ tính lại khi có thay đổi. Rê chuột (hoặc kéo ngón tay) trên kính để lau.
 */
function Fog({ active, wipeRef }: { active: boolean; wipeRef: React.MutableRefObject<(x: number, y: number, px: number, py: number) => void> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d', { willReadFrequently: true })!
    const K = 0.4, W = Math.round(L.w * K), H = Math.round(L.h * K)
    cv.width = W; cv.height = H
    let s = 7
    const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647)
    const area = L.panes.map((p) => p[2] * p[3]), tot = area.reduce((a, b) => a + b, 0)
    const spot = (bias: number) => { // một điểm ngẫu nhiên trong ô kính, thiên về phía dưới
      let r = rnd() * tot, i = 0
      while (i < area.length - 1 && r > area[i]) { r -= area[i]; i++ }
      const p = L.panes[i]
      return [(p[0] + 8 + rnd() * (p[2] - 16)) * K, (p[1] + (p[3] - 6) * (1 - Math.pow(rnd(), bias))) * K]
    }
    // lớp hơi nước gốc
    const tx = document.createElement('canvas'); tx.width = W; tx.height = H
    const tc = tx.getContext('2d')!
    const gr = tc.createLinearGradient(0, 0, 0, 636 * K)
    gr.addColorStop(0, 'rgba(206,222,242,.26)'); gr.addColorStop(1, 'rgba(222,233,247,.58)')
    tc.fillStyle = gr
    L.panes.forEach(([x, y, w, h]) => tc.fillRect(x * K, y * K, w * K, h * K))
    tc.globalCompositeOperation = 'source-atop'
    for (let i = 0; i < 46; i++) { // sương không đều: vài mảng đậm, vài mảng nhạt
      const [x, y] = spot(1), r = (60 + rnd() * 130) * K
      const g = tc.createRadialGradient(x, y, 0, x, y, r)
      const dark = rnd() < 0.5
      g.addColorStop(0, dark ? 'rgba(235,243,252,.16)' : 'rgba(40,60,95,.07)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      tc.fillStyle = g; tc.fillRect(x - r, y - r, r * 2, r * 2)
    }
    for (let i = 0; i < 2600; i++) { // hạt nước li ti
      const [x, y] = spot(1.5), r = 0.4 + rnd() * 1.1
      tc.fillStyle = `rgba(255,255,255,${0.07 + rnd() * 0.16})`
      tc.beginPath(); tc.arc(x, y, r, 0, 6.283); tc.fill()
    }
    tc.globalCompositeOperation = 'source-over'
    const bead = (c: CanvasRenderingContext2D, x: number, y: number, r: number, k: number) => {
      c.save(); c.globalCompositeOperation = 'destination-out'
      const g = c.createRadialGradient(x, y, 0, x, y, r)
      g.addColorStop(0, `rgba(0,0,0,${0.3 * k})`); g.addColorStop(0.8, `rgba(0,0,0,${0.22 * k})`); g.addColorStop(1, 'rgba(0,0,0,0)')
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill(); c.restore()
      c.fillStyle = `rgba(214,230,252,${0.13 * k})`; c.beginPath(); c.arc(x, y, r * 0.94, 0, 6.283); c.fill()
      c.strokeStyle = `rgba(40,58,92,${0.18 * k})`; c.lineWidth = Math.max(0.5, r * 0.15)
      c.beginPath(); c.arc(x, y, r * 0.86, Math.PI * 0.05, Math.PI * 0.95); c.stroke()
      c.fillStyle = `rgba(255,255,255,${0.9 * k})`
      c.beginPath(); c.arc(x - r * 0.34, y - r * 0.38, Math.max(0.5, r * 0.26), 0, 6.283); c.fill()
    }
    for (let i = 0; i < 240; i++) { const [x, y] = spot(1.7); bead(tc, x, y, 1.1 + rnd() * 2.2, 0.9) } // giọt tròn, nhiều ở phía dưới
    for (let i = 0; i < 14; i++) { const [x, y] = spot(2.2); bead(tc, x, y, 3.2 + rnd() * 2.4, 1) }   // vài giọt lớn
    const base = tc.getImageData(0, 0, W, H)
    const out = ctx.createImageData(W, H)
    out.data.set(base.data)
    const wipe = new Uint8Array(W * H)
    const trail = new Uint8Array(W * H) // 1 = vết giọt chảy (phủ lại rất chậm)
    const nz = new Uint8Array(1024); for (let i = 0; i < 1024; i++) nz[i] = rnd() * 255
    let dirty = true, live = 0
    type D = { x: number; y: number; dx: number; v: number; moving: boolean; t: number; len: number; max: number; ph: number }
    const drips: D[] = []
    const paint = () => {
      const b = base.data, o = out.data
      for (let i = 0, j = 3; i < wipe.length; i++, j += 4) o[j] = (b[j] * (255 - wipe[i])) / 255
      ctx.putImageData(out, 0, 0)
      for (const d of drips) bead(ctx, d.x, d.y + 1.5, 2.3 + Math.min(1.2, d.len * 0.012), 1) // đầu giọt đang lăn
    }
    const stamp = (cx: number, cy: number, R: number, str: number, isTrail: boolean) => {
      const x0 = Math.max(0, Math.floor(cx - R)), x1 = Math.min(W - 1, Math.ceil(cx + R))
      const y0 = Math.max(0, Math.floor(cy - R)), y1 = Math.min(H - 1, Math.ceil(cy + R))
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const d = Math.hypot(x - cx, y - cy) / R
        if (d >= 1) continue
        const i = y * W + x
        let v = isTrail ? str * Math.pow(1 - d, 1.1) : str * Math.min(1, (1 - d) * 2.2)
        if (!isTrail && d > 0.45) v *= 0.8 + (0.2 * nz[(i * 7) & 1023]) / 255 // mép lau có vệt nhỏ, không đều
        if (v > wipe[i]) { if (!wipe[i]) live++; wipe[i] = v }
        if (isTrail && v > 70) trail[i] = 1
      }
    }
    wipeRef.current = (x, y, px, py) => {
      const d = Math.hypot(x - px, y - py), n = Math.max(1, Math.ceil((d * K) / 4))
      for (let k = 0; k <= n; k++) { const f = k / n; stamp((px + (x - px) * f) * K, (py + (y - py) * f) * K, 34 * K, 255, false) }
      dirty = true
    }
    if (reducedMotion() || !active) { paint(); return }
    let raf = 0, last = performance.now(), tFade = 0, tick = 0, nextDrip = last + 3500
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      if (t > nextDrip && drips.length < 3 && !document.hidden) {
        const [x, y] = spot(0.9)
        drips.push({ x, y: Math.min(y, 330 * K), dx: 0, v: (16 + rnd() * 18) * K, moving: true, t: 0.4 + rnd() * 0.8, len: 0, max: (110 + rnd() * 200) * K, ph: rnd() * 6 })
        nextDrip = t + 6000 + Math.random() * 8000
      }
      for (let i = drips.length - 1; i >= 0; i--) {
        const d = drips[i]
        d.t -= dt
        if (d.t <= 0) { d.moving = !d.moving; d.t = d.moving ? 0.5 + rnd() * 1.2 : 0.3 + rnd() * 0.9 } // đi từng chặp
        if (d.moving) {
          const ny = d.y + d.v * (0.7 + Math.min(0.6, d.len / (150 * K))) * dt
          d.dx = Math.max(-0.5, Math.min(0.5, d.dx + (rnd() - 0.5) * 1.6 * dt))
          const nx = d.x + d.dx * dt * 4
          const r = 1.7 + Math.min(0.9, d.len * 0.008)
          for (let k = 0; k <= 3; k++) stamp(d.x + (nx - d.x) * (k / 3), d.y + (ny - d.y) * (k / 3), r, 190, true)
          d.len += ny - d.y; d.x = nx; d.y = ny
        }
        if (d.len > d.max || d.y > 630 * K) { drips.splice(i, 1) }
        dirty = true
      }
      tFade += dt
      if (tFade > 0.12 && live > 0) { // hơi nước phủ lại dần
        tFade = 0; tick++; live = 0
        for (let i = 0; i < wipe.length; i++) if (wipe[i]) {
          if (!trail[i] || tick % 4 === 0) wipe[i]--
          if (wipe[i]) live++; else trail[i] = 0
        }
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

export default function SnowWatch({ active }: { active: boolean }) {
  const host = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const lightsOn = useLights()
  const [g, setG] = useState({ s: 1, x: 0, y: 0 })
  const [pose, setPose] = useState(0)
  const [maskPose, setMaskPose] = useState(0)
  const [fire, setFire] = useState(0)
  const wipeRef = useRef<(x: number, y: number, px: number, py: number) => void>(() => {})
  const prev = useRef<[number, number] | null>(null)

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

  // thỉnh thoảng, ở thời điểm ngẫu nhiên, một vì sao băng bay qua; phần lớn các lần, hai người ngẩng lên chỉ tay đúng lúc ấy
  useEffect(() => {
    if (!active || reducedMotion()) return
    const T: number[] = []
    const at = (ms: number, f: () => void) => { T.push(window.setTimeout(f, ms)) }
    const next = (first: boolean) => at(first ? 5000 + Math.random() * 4000 : 14000 + Math.random() * 18000, go)
    const go = () => {
      if (document.hidden) { next(false); return }
      if (Math.random() < 0.75) {
        setPose(1); at(FADE / 2, () => setMaskPose(1))
        at(FADE + 150, () => setFire((n) => n + 1))
        at(POSE_HOLD, () => { setPose(0); at(FADE / 2, () => setMaskPose(0)); at(FADE, () => next(false)) })
      } else { setFire((n) => n + 1); next(false) }
    }
    next(true)
    return () => { T.forEach(clearTimeout); setPose(0); setMaskPose(0) }
  }, [active])

  // lau kính: toạ độ con trỏ đổi sang toạ độ ảnh gốc
  const move = (e: React.PointerEvent) => {
    const r = stage.current!.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * L.w, y = ((e.clientY - r.top) / r.height) * L.h
    const p = prev.current
    if (p && Math.hypot(x - p[0], y - p[1]) > 400) prev.current = null
    wipeRef.current(x, y, prev.current ? prev.current[0] : x, prev.current ? prev.current[1] : y)
    prev.current = [x, y]
  }

  const mask = L.poses[maskPose]
  const maskStyle = { WebkitMaskImage: `url(${mask.hide})`, maskImage: `url(${mask.hide})` }
  const gb = L.panes.reduce((m, [x, y, w, h]) => ({ x1: Math.min(m.x1, x), y1: Math.min(m.y1, y), x2: Math.max(m.x2, x + w), y2: Math.max(m.y2, y + h) }), { x1: 1e9, y1: 1e9, x2: 0, y2: 0 })

  return (
    <section id="snow" className={`tree-scene snow-scene${lightsOn ? '' : ' lights-off'}`}>
      <div className="sec-frame" ref={host}>
        <div className="tr-stage" ref={stage} style={{ width: L.w, height: L.h, transform: `translate(${g.x}px, ${g.y}px) scale(${g.s})` }}>
          <img className="sw-img" src={L.poses[0].src} alt="Hai người ngồi sát nhau dưới chăn len, quay lưng nhìn tuyết rơi ngoài cửa sổ lớn" draggable={false} />
          <img className={`sw-img sw-top${pose ? ' on' : ''}`} src={L.poses[1].src} alt="" draggable={false} />

          {/* tắt đèn: cả phòng tối đi (trừ ô kính, ngoài trời vẫn sáng tuyết), chỉ còn ánh các ngọn nến; hai người tối riêng vì đứng trước kính */}
          <div className="sw-dark" style={{ clipPath: `path(evenodd, '${ROOM}')`, ...holes }} />
          <div className="sw-dark" style={{ clipPath: `path('${GLASS}')`, WebkitMaskImage: `url(${L.poses[maskPose].cut})`, maskImage: `url(${L.poses[maskPose].cut})`, WebkitMaskSize: '100% 100%', maskSize: '100% 100%' }} />

          {/* tuyết, hơi nước và sao băng ở sau kính: đi sau lưng hai người nhờ mặt nạ theo dáng ngồi hiện tại */}
          <div className="sw-fx" style={maskStyle}>
            <SnowFall active={active} />
            <Meteors active={active} fire={fire} />
            <Fog active={active} wipeRef={wipeRef} />
          </div>

          <div className="sw-glass" style={{ left: gb.x1, top: gb.y1, width: gb.x2 - gb.x1, height: gb.y2 - gb.y1 }}
            onPointerMove={(e) => { if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'touch') move(e) }}
            onPointerLeave={() => { prev.current = null }} onPointerUp={() => { prev.current = null }} />

          {L.flames.map(([x, y, k], i) => <i key={i} className="sw-flame" style={{ left: x - 260 * k, top: y - 260 * k, width: 520 * k, height: 520 * k, animationDelay: `-${i * 0.7}s` }} />)}
          {active && <Dust w={L.w} h={L.h} />}
        </div>
      </div>

      <button className="tr-lights" aria-label={lightsOn ? 'Tắt đèn' : 'Bật đèn'} title={lightsOn ? 'Tắt đèn, chỉ còn ánh nến' : 'Bật đèn lại'} onClick={() => lights.toggle()}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill={lightsOn ? 'currentColor' : 'none'} fillOpacity=".25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />{lightsOn && <path d="M12 1v0M4 6L3 5M20 6l1-1M2 12H1M23 12h-1" strokeWidth="1.4" />}</svg>
      </button>

      <div className="sec-text">
        <h2 className="sec-title">{copy.title}</h2>
        <div className="sec-orn" aria-hidden><i /><b>❦</b><i /></div>
        <p className="sec-tag">{copy.tagline}</p>
        {copy.body.map((t, i) => <p key={i} className="sec-desc">{t}</p>)}
      </div>
    </section>
  )
}
