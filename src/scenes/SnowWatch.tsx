import { useEffect, useRef, useState } from 'react'
import { snow as copy } from '../content/content'
import { isLite, reducedMotion } from '../lib/device'
import { weather } from '../lib/weather'
import { LitSpot } from '../components/LitSpot'
import { lights, useLights } from '../lib/lights'
import { SNOW as L, LM } from './snowLayout'

const POSE_HOLD = 6500
const FADE = 1600

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
    const n = isLite() ? 36 : 70
    const fl = Array.from({ length: n }, () => ({ x: Math.random() * L.w, y: Math.random() * L.h, z: Math.random() ** 1.6, ph: Math.random() * 6.28 }))
    let raf = 0, last = performance.now()
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      if (t - last < 30) return // 30 khung hình/giây là đủ cho tuyết, nhẹ máy hơn
      const dt = Math.min(0.08, (t - last) / 1000); last = t
      ctx.clearRect(0, 0, L.w, L.h)
      for (const f of fl) {
        f.y += (20 + f.z * 66) * dt
        f.x += (weather.sway(t, f.ph) * (10 + f.z * 38) + Math.sin(t / 900 + f.ph) * 6 * f.z) * dt
        if (f.y > 660) { f.y = -8; f.x = Math.random() * L.w }
        if (f.x > L.w + 10) f.x = -10; else if (f.x < -10) f.x = L.w + 10
        const r = 0.9 + f.z * 2.5
        ctx.globalAlpha = 0.38 + f.z * 0.4
        if (f.z > 0.78) {
          const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, r * 1.5)
          g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(0.5, 'rgba(240,246,255,.45)'); g.addColorStop(1, 'rgba(235,242,255,0)')
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(f.x, f.y, r * 1.5, 0, 6.283); ctx.fill()
        } else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, 6.283); ctx.fill() }
      }
      ctx.globalAlpha = 1
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active])
  return <canvas ref={ref} className="sw-cv" aria-hidden />
}

type Kind = 'classic' | 'gold' | 'twin' | 'comet' | 'shower'
/** Năm kiểu sao băng, chọn ngẫu nhiên theo độ hiếm: sao băng trắng xanh (hay gặp), sao vàng bay chậm rắc tia lấp lánh, hai sao song song, sao chổi lớn (hiếm), và mưa sao nhỏ (vài vệt mảnh liên tiếp). */
const KINDS: [Kind, number][] = [['classic', 0.38], ['gold', 0.2], ['twin', 0.14], ['comet', 0.1], ['shower', 0.18]]
/** Xem thử một kiểu: thêm ?meteor=gold (classic, gold, twin, comet, shower) vào địa chỉ. */
const forced = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('meteor') : null
const pickKind = (): Kind => {
  if (forced && KINDS.some(([k]) => k === forced)) return forced as Kind
  let r = Math.random(); for (const [k, w] of KINDS) { if ((r -= w) < 0) return k } return 'classic'
}

/** Sao băng bay qua bầu trời mỗi khi `fire.n` tăng lên (do bộ hẹn giờ của cảnh quyết định, thỉnh thoảng và ngẫu nhiên). */
function Meteors({ active, fire }: { active: boolean; fire: { n: number; kind: Kind } }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const pending = useRef<Kind[]>([])
  const lastFire = useRef(fire.n)
  if (fire.n !== lastFire.current) { lastFire.current = fire.n; pending.current.push(fire.kind) }
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    if (reducedMotion() || !active) return
    const K = 0.5
    cv.width = L.w * K; cv.height = L.h * K
    ctx.scale(K, K)
    ctx.beginPath(); L.panes.forEach(([x, y, w, h]) => ctx.rect(x, y, w, h)); ctx.clip()
    type M = { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number; w: number; head: number; rgb: [number, number, number]; spark: number; delay: number }
    type S = { x: number; y: number; vx: number; vy: number; life: number; max: number; r: number; rgb: [number, number, number] }
    const ms: M[] = [], sp: S[] = []
    let raf = 0, last = performance.now(), drawn = false
    const dirOf = () => { // phần lớn bay xuống trái, đôi khi xuống phải
      const right = Math.random() < 0.28
      return right ? Math.PI * (0.1 + Math.random() * 0.1) : Math.PI * (0.78 + Math.random() * 0.1)
    }
    const add = (o: Partial<M> & { x: number; y: number; a: number; speed: number }) => {
      ms.push({ x: o.x, y: o.y, vx: Math.cos(o.a) * o.speed, vy: Math.sin(o.a) * o.speed, life: 0, max: o.max ?? 1, len: o.len ?? 300, w: o.w ?? 4, head: o.head ?? 14, rgb: o.rgb ?? [200, 224, 255], spark: o.spark ?? 0, delay: o.delay ?? 0 })
    }
    const spawn = (kind: Kind) => {
      const a = dirOf()
      const x = a < 1.6 ? 760 + Math.random() * 820 : 520 + Math.random() * 520
      const y = 12 + Math.random() * 170
      if (kind === 'classic') add({ x, y, a, speed: 900 + Math.random() * 500, max: 0.8 + Math.random() * 0.5, len: 300 + Math.random() * 200 })
      else if (kind === 'gold') add({ x, y, a, speed: 520 + Math.random() * 180, max: 1.7 + Math.random() * 0.5, len: 380, w: 5, head: 18, rgb: [255, 214, 140], spark: 1 })
      else if (kind === 'twin') { const off = 26 + Math.random() * 18; const nx = -Math.sin(a) * off, ny = Math.cos(a) * off
        add({ x, y, a, speed: 880, max: 0.9, len: 300, w: 3.4 }); add({ x: x + nx, y: y + ny + 14, a, speed: 820, max: 0.95, len: 240, w: 2.6, delay: 0.1 }) }
      else if (kind === 'comet') add({ x: x - 100, y: y + 10, a, speed: 430 + Math.random() * 90, max: 2.4, len: 560, w: 7, head: 30, rgb: [170, 235, 230], spark: 2 })
      else for (let i = 0; i < 4 + Math.floor(Math.random() * 3); i++) // mưa sao nhỏ
        add({ x: x - 160 + Math.random() * 360, y: 8 + Math.random() * 180, a: a + (Math.random() - 0.5) * 0.08, speed: 1000 + Math.random() * 500, max: 0.5 + Math.random() * 0.3, len: 120 + Math.random() * 100, w: 2, head: 8, delay: i * (0.18 + Math.random() * 0.3) })
    }
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      while (pending.current.length) spawn(pending.current.shift()!)
      if (!ms.length && !sp.length) { if (drawn) { ctx.clearRect(0, 0, L.w, L.h); drawn = false } raf = requestAnimationFrame(frame); return } // không có sao nào thì không vẽ gì
      drawn = true
      ctx.clearRect(0, 0, L.w, L.h)
      for (let i = ms.length - 1; i >= 0; i--) {
        const m = ms[i]
        if (m.delay > 0) { m.delay -= dt; continue }
        m.life += dt
        if (m.life > m.max) { ms.splice(i, 1); continue }
        m.x += m.vx * dt; m.y += m.vy * dt
        const k = m.life / m.max, a = Math.sin(Math.PI * Math.min(1, k * 1.15))
        const sp0 = Math.hypot(m.vx, m.vy), nx = -m.vx / sp0, ny = -m.vy / sp0
        const tx = m.x + nx * m.len, ty = m.y + ny * m.len
        const [R, G, B] = m.rgb
        const g = ctx.createLinearGradient(m.x, m.y, tx, ty)
        g.addColorStop(0, `rgba(255,255,255,${0.95 * a})`); g.addColorStop(0.3, `rgba(${R},${G},${B},${0.5 * a})`); g.addColorStop(1, `rgba(${R},${G},${B},0)`)
        ctx.strokeStyle = g; ctx.lineWidth = m.w; ctx.lineCap = 'round'
        ctx.beginPath(); ctx.moveTo(m.x, m.y); ctx.lineTo(tx, ty); ctx.stroke()
        const h = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.head)
        h.addColorStop(0, `rgba(255,255,255,${a})`); h.addColorStop(1, `rgba(${R},${G},${B},0)`)
        ctx.fillStyle = h; ctx.beginPath(); ctx.arc(m.x, m.y, m.head, 0, 6.283); ctx.fill()
        if (m.spark && !isLite() && sp.length < 140) { // rắc tia lấp lánh dọc đường bay
          const n = (m.spark === 2 ? 70 : 34) * dt
          for (let j = 0; j < n + (Math.random() < n % 1 ? 1 : 0); j++) { const f = Math.random() * 0.55
            sp.push({ x: m.x + nx * m.len * f, y: m.y + ny * m.len * f, vx: (Math.random() - 0.5) * 30, vy: 10 + Math.random() * 30, life: 0, max: 0.5 + Math.random() * 0.7, r: 1.2 + Math.random() * 2.2, rgb: m.rgb }) }
        }
      }
      for (let i = sp.length - 1; i >= 0; i--) {
        const q = sp[i]; q.life += dt
        if (q.life > q.max) { sp.splice(i, 1); continue }
        q.x += q.vx * dt; q.y += q.vy * dt
        const a = (1 - q.life / q.max) * 0.85, r = q.r * (0.6 + 0.4 * Math.sin(q.life * 14 + i))
        ctx.fillStyle = `rgba(${q.rgb[0]},${q.rgb[1]},${q.rgb[2]},${a})`
        ctx.beginPath(); ctx.arc(q.x, q.y, r, 0, 6.283); ctx.fill()
      }
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [active])
  return <canvas ref={ref} className="sw-cv" aria-hidden />
}

/**
 * Tuyết bám ngoài cửa sổ: một đụn tuyết tích trên bậu cửa phía ngoài (mép trên gồ ghề, dồn lên sát khung gỗ ở hai bên), tuyết dính dọc mép khung,
 * và những cụm tuyết nhỏ dính trên mặt kính (nhiều ở phía dưới và quanh mép). Vẽ sẵn một lần; tuyết dày dần trong khoảng 45 giây đầu rồi đứng yên (sau đó không tốn tính toán).
 * Mức dày được nhớ giữa các lần vào cảnh.
 */
let snowGrown = 0.3
function ClingSnow({ active }: { active: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    const K = 0.5, W = Math.round(L.w * K), H = Math.round(L.h * K)
    cv.width = W; cv.height = H
    let sd = 11
    const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647)
    const mk = () => { const c = document.createElement('canvas'); c.width = W; c.height = H; return c }
    const drift = mk(), clumps = mk()
    const d = drift.getContext('2d')!, c = clumps.getContext('2d')!
    d.scale(K, K); c.scale(K, K)
    // ---- đụn tuyết trên bậu cửa phía ngoài + tuyết dính mép khung ----
    d.filter = 'blur(2px)'
    for (const [px, py, pw, ph] of L.panes) {
      const yb = py + ph, ph1 = rnd() * 6, ph2 = rnd() * 6, ph3 = rnd() * 6
      const top = (x: number) => { // độ cao đụn tại x (px khung ảnh)
        const u = x - px
        let h = 40 + 22 * Math.sin(u * 0.012 + ph1) + 12 * Math.sin(u * 0.029 + ph2) + 6 * Math.sin(u * 0.071 + ph3)
        h += 34 * Math.exp(-u / 46) + 34 * Math.exp(-(pw - u) / 46) // dồn lên sát khung gỗ hai bên
        return Math.max(12, h)
      }
      const grad = d.createLinearGradient(0, yb - 90, 0, yb)
      grad.addColorStop(0, '#fbfdff'); grad.addColorStop(0.5, '#e6eefa'); grad.addColorStop(1, '#a9bddc')
      d.fillStyle = grad
      d.beginPath(); d.moveTo(px, yb)
      for (let x = px; x <= px + pw; x += 3) d.lineTo(x, yb - top(x))
      d.lineTo(px + pw, yb); d.closePath(); d.fill()
      // vệt sáng ở mép trên đụn và vài điểm lấp lánh
      d.strokeStyle = 'rgba(255,255,255,.85)'; d.lineWidth = 2.2; d.beginPath()
      for (let x = px; x <= px + pw; x += 3) { const y = yb - top(x) + 1; x === px ? d.moveTo(x, y) : d.lineTo(x, y) }
      d.stroke()
      // tuyết dính dọc mép khung bên trái và bên phải (dày ở dưới, mỏng dần lên trên)
      for (const side of [0, 1]) {
        d.beginPath(); const x0 = side ? px + pw : px
        d.moveTo(x0, yb)
        for (let y = yb; y > py + 20; y -= 4) { const hh = (yb - y) / ph; const w = (3 + 17 * (1 - hh) ** 2.2) * (0.55 + 0.45 * Math.sin(y * 0.09 + side * 2 + ph1)); d.lineTo(x0 + (side ? -w : w), y) }
        d.lineTo(x0, py + 20); d.closePath(); d.fillStyle = 'rgba(236,243,252,.82)'; d.fill()
      }
    }
    d.filter = 'none'
    // ---- cụm tuyết nhỏ dính trên mặt kính ----
    for (let i = 0; i < 170; i++) {
      const pi = Math.floor(rnd() * L.panes.length), [px, py, pw, ph] = L.panes[pi]
      const edge = rnd() < 0.5 // một nửa dính sát mép khung
      const x = px + 6 + (edge ? (rnd() < 0.5 ? rnd() * 34 : pw - 6 - rnd() * 34) : rnd() * (pw - 12))
      const y = py + 10 + (ph - 24) * (1 - Math.pow(rnd(), 1.9))
      const r = 1.6 + rnd() * rnd() * 8
      const g = c.createRadialGradient(x - r * 0.25, y - r * 0.3, 0, x, y, r)
      g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.65, 'rgba(236,243,252,.8)'); g.addColorStop(1, 'rgba(210,224,244,0)')
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill()
      if (r > 3) { c.strokeStyle = 'rgba(120,150,195,.28)'; c.lineWidth = 0.9; c.beginPath(); c.arc(x, y + 0.4, r * 0.88, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke() } // bóng đổ dưới cụm lớn
    }
    const draw = (g: number) => {
      ctx.clearRect(0, 0, W, H)
      ctx.save(); ctx.beginPath(); L.panes.forEach(([x, y, w, h]) => ctx.rect(x * K, y * K, w * K, h * K)); ctx.clip()
      const yb = (L.panes[0][1] + L.panes[0][3]) * K
      ctx.translate(0, yb); ctx.scale(1, 0.25 + 0.75 * g); ctx.translate(0, -yb) // đụn dày lên từ dưới
      ctx.drawImage(drift, 0, 0)
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = Math.min(1, 0.25 + 0.75 * g); ctx.drawImage(clumps, 0, 0)
      ctx.restore(); ctx.globalAlpha = 1
    }
    draw(snowGrown)
    if (!active || reducedMotion() || snowGrown >= 1) { if (reducedMotion()) { snowGrown = 1; draw(1) } return }
    let raf = 0, last = performance.now(), lastDraw = 0
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t; void dt
      if (!document.hidden && t - lastDraw > 100) { lastDraw = t; snowGrown = Math.min(1, snowGrown + 0.1 / 45); draw(snowGrown) } // vẽ lại 10 lần/giây là đủ cho chuyển động chậm này
      if (snowGrown < 1) raf = requestAnimationFrame(frame)
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
    for (let i = 0; i < 1500; i++) { // hạt nước li ti
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
    for (let i = 0; i < 150; i++) { const [x, y] = spot(1.7); bead(tc, x, y, 1.1 + rnd() * 2.2, 0.9) } // giọt tròn, nhiều ở phía dưới
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
    let raf = 0, last = performance.now(), tFade = 0, tick = 0, nextDrip = last + 3500, lastPaint = 0
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      if (t > nextDrip && drips.length < 2 && !document.hidden) {
        const [x, y] = spot(0.9)
        drips.push({ x, y: Math.min(y, 330 * K), dx: 0, v: (16 + rnd() * 18) * K, moving: true, t: 0.4 + rnd() * 0.8, len: 0, max: (110 + rnd() * 200) * K, ph: rnd() * 6 })
        nextDrip = t + 9000 + Math.random() * 11000
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
      if (dirty && t - lastPaint > 45) { dirty = false; lastPaint = t; paint() } // tối đa ~22 lần/giây
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
  const [lampHov, setLampHov] = useState(false)
  // giải mã sẵn mọi ảnh phụ (mặt nạ, bản đồ tối) để lúc đổi dáng không có khoảnh khắc ảnh chưa sẵn (gây nháy)
  useEffect(() => {
    const keep = [...L.poses.map((q) => q.hide), ...LM.dark, ...LM.warm].map((u) => { const im = new Image(); im.decoding = 'async'; im.src = u; im.decode?.().catch(() => {}); return im })
    return () => { keep.length = 0 }
  }, [])
  const [g, setG] = useState({ s: 1, x: 0, y: 0 })
  const [pose, setPose] = useState(0)
  const [maskPose, setMaskPose] = useState(0)
  const [fire, setFire] = useState<{ n: number; kind: Kind }>({ n: 0, kind: 'classic' })
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
      const kind = pickKind()
      if (Math.random() < 0.75) {
        setPose(1); at(FADE / 2, () => setMaskPose(1))
        at(FADE + 150, () => setFire((f) => ({ n: f.n + 1, kind })))
        at(POSE_HOLD, () => { setPose(0); at(FADE / 2, () => setMaskPose(0)); at(FADE, () => next(false)) })
      } else { setFire((f) => ({ n: f.n + 1, kind })); next(false) }
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

          {/* tắt đèn: bản đồ tối và ánh ấm đã dựng sẵn thành ảnh (cả phòng tối đi trừ ô kính, hai người tối riêng, ánh nến ấm trải theo một trường sáng chung);
              chỉ đổi độ trong suốt nên không có mặt nạ CSS phải tính lại mỗi khung hình */}
          <img className="sw-lm" src={LM.dark[maskPose]} alt="" draggable={false} />
          <img className="sw-lm" src={LM.warm[maskPose]} alt="" draggable={false} />

          {/* tuyết, hơi nước và sao băng ở sau kính: đi sau lưng hai người nhờ mặt nạ theo dáng ngồi hiện tại */}
          <div className="sw-fx" style={maskStyle}>
            <Meteors active={active} fire={fire} />
            <SnowFall active={active} />
            <ClingSnow active={active} />
            <Fog active={active} wipeRef={wipeRef} />
          </div>

          <div className="sw-glass" style={{ left: gb.x1, top: gb.y1, width: gb.x2 - gb.x1, height: gb.y2 - gb.y1 }}
            onPointerMove={(e) => { if (e.pointerType === 'mouse' || e.buttons || e.pointerType === 'touch') move(e) }}
            onPointerLeave={() => { prev.current = null }} onPointerUp={() => { prev.current = null }} />

          <LitSpot src={L.poses[0].src} w={L.w} h={L.h} poly={L.lamp} on={lampHov} strength={0.5} />
          {L.flames.map(([x, y, k], i) => <i key={i} className="sw-flame" style={{ left: x - 260 * k, top: y - 260 * k, width: 520 * k, height: 520 * k, animationDelay: `-${i * 0.7}s` }} />)}

          <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
            <polygon className="cat-hs" points={L.lamp.map((q) => q.join(',')).join(' ')} tabIndex={0} role="button" aria-label={lightsOn ? 'Đèn bàn, đang sáng' : 'Đèn bàn, đang tắt'}
              onMouseEnter={() => setLampHov(true)} onMouseLeave={() => setLampHov(false)} onFocus={() => setLampHov(true)} onBlur={() => setLampHov(false)}
              onClick={() => lights.toggle()} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); lights.toggle() } }} />
          </svg>
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
