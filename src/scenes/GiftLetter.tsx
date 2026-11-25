import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { treeText, type gifts } from '../content/content'
import { sfx } from '../lib/audio'
import { isLite, reducedMotion } from '../lib/device'
import type { EnvGL } from './envelopeGL'
import { rng } from '../lib/sketch'
import { Doodle, Flourish, Sketch, type SketchStroke } from '../components/Sketch'
import { Postmark, Qr, Reply, Stamp } from './Letter'

type Gift = (typeof gifts)[number]
type Stage = 'closed' | 'cracked' | 'opening' | 'out' | 'read'
type Frag = { id: number; x: number; y: number; dx: number; dy: number; rot: number; s: number; d: number }

const HOLD_MS = 1100
const ENV_STROKES: SketchStroke[] = [
  { inset: 9, j: 1.4, w: 2.4, o: 0.8, seed: 31, delay: 0.3 },
  { inset: 15, j: 1.2, w: 1.3, o: 0.5, seed: 32, delay: 0.5 },
]
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/** Mép giấy răng cưa của tờ thư: đa giác có độ lệch cố định (không đổi giữa các lần mở). */
function deckle(seed: number) {
  const r = rng(seed), pts: string[] = [], n = 30, m = 40
  for (let i = 0; i <= n; i++) pts.push(`${((i / n) * 100).toFixed(2)}% ${(r() * (r() < 0.12 ? 1.7 : 0.85)).toFixed(2)}%`)
  for (let i = 1; i <= m; i++) pts.push(`${(100 - r() * (r() < 0.12 ? 1.2 : 0.6)).toFixed(2)}% ${((i / m) * 100).toFixed(2)}%`)
  for (let i = n - 1; i >= 0; i--) pts.push(`${((i / n) * 100).toFixed(2)}% ${(100 - r() * (r() < 0.12 ? 1.7 : 0.85)).toFixed(2)}%`)
  for (let i = m - 1; i > 0; i--) pts.push(`${(r() * (r() < 0.12 ? 1.2 : 0.6)).toFixed(2)}% ${((i / m) * 100).toFixed(2)}%`)
  return `polygon(${pts.join(',')})`
}

function WaxSeal() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '')
  const blob = 'M50 5c9 0 13 7 22 8 8 1 15 6 14 15 7 6 9 14 4 22 4 8 0 15-8 19-2 9-9 13-18 11-7 8-16 8-23 1-9 2-17-3-19-11-8-4-11-12-7-20-5-8-3-16 4-22-1-9 6-14 14-15 9-1 13-8 22-8z'
  return (
    <svg viewBox="0 0 100 100" className="vm-wax" aria-hidden>
      <defs>
        <radialGradient id={`${u}w`} cx=".36" cy=".3" r=".85"><stop offset="0" stopColor="#c2373a" /><stop offset=".45" stopColor="#8f161c" /><stop offset="1" stopColor="#4a0a0e" /></radialGradient>
        <radialGradient id={`${u}h`} cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff" stopOpacity=".6" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <linearGradient id={`${u}r`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#e07c7e" /><stop offset=".5" stopColor="#8f161c" /><stop offset="1" stopColor="#2c0508" /></linearGradient>
        <radialGradient id={`${u}c`} cx=".55" cy=".6" r=".6"><stop offset="0" stopColor="#6c0f14" /><stop offset="1" stopColor="#8f161c" /></radialGradient>
      </defs>
      <path d={blob} fill={`url(#${u}w)`} />
      <path d={blob} fill="none" stroke="#f0a0a2" strokeWidth="1.4" opacity=".35" transform="translate(-.9 -.9)" />
      <path d={blob} fill="none" stroke="#240406" strokeWidth="1.6" opacity=".45" transform="translate(1 1.1)" />
      <circle cx="50" cy="51" r="30" fill={`url(#${u}c)`} />
      <circle cx="50" cy="51" r="30" fill="none" stroke={`url(#${u}r)`} strokeWidth="3" />
      <text x="50" y="60" textAnchor="middle" fontSize="25" fontStyle="italic" fontWeight="700" fontFamily="'Playfair Display', serif" fill="#e0868a" opacity=".5" transform="translate(-.8 -.9)">L♥H</text>
      <text x="50" y="60" textAnchor="middle" fontSize="25" fontStyle="italic" fontWeight="700" fontFamily="'Playfair Display', serif" fill="#4c0a0e" opacity=".85">L♥H</text>
      <ellipse cx="37" cy="27" rx="17" ry="8" fill={`url(#${u}h)`} transform="rotate(-28 37 27)" />
      <circle cx="33" cy="23" r="2.3" fill="#fff" opacity=".6" />
      <g className="vm-crack" fill="none" stroke="#1c0305" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M52 6 L47 26 L56 40 L49 58 L54 78 L50 95" /><path d="M8 50 L30 54 L46 47 L70 56 L94 49" /><path d="M47 26 L30 20 M56 40 L72 34 M49 58 L36 70" />
      </g>
    </svg>
  )
}

function Quill() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 90 300" className="vl-quill" aria-hidden>
      <defs>
        <linearGradient id={`${u}v`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#cdbd96" /><stop offset=".5" stopColor="#f1e8d2" /><stop offset="1" stopColor="#c4b28a" /></linearGradient>
        <linearGradient id={`${u}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#eadfbf" /><stop offset=".6" stopColor="#b39460" /><stop offset="1" stopColor="#6a4a24" /></linearGradient>
      </defs>
      <path d="M62 4C30 40 20 110 30 190 34 216 46 232 58 250 64 200 80 120 76 56 74 30 70 14 62 4z" fill={`url(#${u}v)`} stroke="#5a4630" strokeWidth="1.1" strokeLinejoin="round" />
      <g stroke="#6a563a" strokeWidth=".6" fill="none" opacity=".8">
        {Array.from({ length: 30 }, (_, i) => { const y = 16 + i * 7.6, x = 62 - Math.min(5, i * 0.2); return <path key={i} d={`M${x} ${y}L${x - 24 + Math.abs(i - 14) * 0.5 - (i % 3) * 2} ${y + 11}M${x} ${y}L${x + 14 - Math.abs(i - 14) * 0.3 + (i % 2) * 2} ${y + 9}`} /> })}
      </g>
      <path d="M71 64 63 82 74 80 66 100" fill="none" stroke="#5a4630" strokeWidth=".9" opacity=".7" />
      <path d="M62 4C58 80 52 170 58 250" fill="none" stroke="#4a3a24" strokeWidth="2.3" strokeLinecap="round" />
      <path d="M55 248 61 248 56.5 290 53.5 296 53 290Z" fill={`url(#${u}c)`} stroke="#3a2a16" strokeWidth=".9" strokeLinejoin="round" />
      <path d="M53.2 284 56.6 284 56.4 291 53.8 296 53 290Z" fill="#120a05" />
    </svg>
  )
}

/** Lọ mực thuỷ tinh có nút bần, đặt cạnh tờ thư. */
function Inkwell() {
  const u = useId().replace(/[^a-zA-Z0-9]/g, '')
  return (
    <svg viewBox="0 0 70 84" className="vl-inkwell" aria-hidden>
      <defs>
        <linearGradient id={`${u}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#3a2a1c" /><stop offset=".45" stopColor="#1a120b" /><stop offset="1" stopColor="#0b0705" /></linearGradient>
        <linearGradient id={`${u}k`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#a8854e" /><stop offset=".5" stopColor="#caa86c" /><stop offset="1" stopColor="#8c6a38" /></linearGradient>
      </defs>
      <ellipse cx="35" cy="78" rx="30" ry="5" fill="#000" opacity=".35" />
      <path d="M10 44Q10 32 22 32H48Q60 32 60 44V68Q60 78 50 78H20Q10 78 10 68Z" fill={`url(#${u}g)`} stroke="#5a4630" strokeWidth="1.2" />
      <path d="M14 46Q14 38 22 37" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".28" />
      <rect x="25" y="20" width="20" height="14" rx="2" fill={`url(#${u}g)`} stroke="#5a4630" strokeWidth="1" />
      <rect x="22" y="30" width="26" height="5" rx="2" fill="#2a1c10" stroke="#5a4630" strokeWidth=".9" />
      <rect x="28" y="4" width="14" height="18" rx="2" fill={`url(#${u}k)`} stroke="#4a3216" strokeWidth="1" />
      <path d="M29 9H41M29 14H41" stroke="#4a3216" strokeWidth=".7" opacity=".6" />
      <rect x="20" y="50" width="30" height="18" fill="#e4d4ac" stroke="#6a4a24" strokeWidth=".9" />
      <path d="M24 56H46M24 61H42" stroke="#6a4a24" strokeWidth=".8" opacity=".7" />
    </svg>
  )
}

/** Thư được viết ra từng chữ, có bút lông chạy theo và tiếng bút; chạm vào tờ thư để hiện hết ngay. */
function Handwrite({ paras, delay, instant, onDone, onNib }: { paras: string[]; delay: number; instant: boolean; onDone: () => void; onNib: (el: HTMLElement | null) => void }) {
  const total = useMemo(() => paras.reduce((a, t) => a + t.length, 0), [paras])
  const [n, setN] = useState(instant ? total : 0)
  const box = useRef<HTMLDivElement>(null)
  const nRef = useRef(n); nRef.current = n
  const doneRef = useRef(false)
  useEffect(() => {
    if (instant || total === 0) { setN(total); if (!doneRef.current) { doneRef.current = true; onDone() } return }
    const flat = paras.join('\n'), base = clamp(9500 / total, 14, 34)
    let i = 0, t: number
    const step = () => {
      i++; setN(i)
      const ch = flat[i - 1] ?? ''
      if (ch !== ' ' && ch !== '\n' && i % 2 === 0) sfx.penScratch()
      if (i >= total) { if (!doneRef.current) { doneRef.current = true; onDone() } onNib(null); return }
      const pause = ch === '.' || ch === '!' || ch === '?' ? 280 : ch === ',' || ch === ':' ? 130 : ch === '\n' ? 400 : 0
      t = window.setTimeout(step, base * (ch === ' ' ? 1.4 : 0.7 + Math.random() * 0.7) + pause)
    }
    t = window.setTimeout(step, delay)
    const skip = () => { window.clearTimeout(t); i = total; setN(total); onNib(null); if (!doneRef.current) { doneRef.current = true; onDone() } }
    window.addEventListener('olcw:skipwrite', skip)
    return () => { window.clearTimeout(t); window.removeEventListener('olcw:skipwrite', skip) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  // bút lông chạy theo chữ vừa viết
  useLayoutEffect(() => {
    if (n <= 0 || n >= total || !box.current) return
    onNib(box.current.querySelectorAll<HTMLElement>('.hw-c')[n - 1] ?? null)
  }, [n, total, onNib])
  let k = 0
  return (
    <div ref={box} className="hw">
      {paras.map((t, pi) => (
        <p className="hand hw-p" key={pi} aria-label={t}>
          {Array.from(t).map((ch, ci) => { const on = k++ < n; return <span key={ci} className={`hw-c${on ? ' on' : ''}${pi === 0 && ci === 0 ? ' hw-drop' : ''}`} aria-hidden>{ch}</span> })}
        </p>
      ))}
    </div>
  )
}

export function GiftLetter({ g, locked, cd, closing, onClose }: {
  g: Gift
  locked: boolean
  cd: { d: number; h: number; m: number; s: number } | null
  closing: boolean
  onClose: () => void
}) {
  const [stage, setStage] = useState<Stage>('closed')
  const [shake, setShake] = useState(0)
  const [frags, setFrags] = useState<Frag[]>([])
  const [holding, setHolding] = useState(false)
  const stageRef = useRef<Stage>('closed'); stageRef.current = stage
  const rig = useRef<HTMLDivElement>(null)
  const sealRef = useRef<HTMLDivElement>(null)
  const hitRef = useRef<HTMLButtonElement>(null)
  const letter3d = useRef<HTMLDivElement>(null)
  const paper = useRef<HTMLDivElement>(null)
  const timers = useRef<number[]>([])
  const a = useRef({ rx: -6, ry: -14, vx: 0, vy: 0, drag: false, lx: 0, ly: 0, lt: 0, idle: 0, tgt: null as number | null })
  const [written, setWritten] = useState(false)
  // phong bì WebGL (three.js) khi máy hỗ trợ và không ở chế độ nhẹ; ngược lại dùng phong bì CSS 3D
  const [glMode, setGlMode] = useState<'pending' | 'on' | 'off'>('pending')
  const glRef = useRef<EnvGL | null>(null)
  const glHost = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const quillRef = useRef<HTMLDivElement>(null)
  const hold = useRef({ on: false, t0: 0, raf: 0, back: 0, p: 0 })
  const calm = reducedMotion()
  const clip = useMemo(() => deckle(g.id * 7 + 3), [g.id])

  // vòng lặp xoay 3D: kéo để xoay, buông tay thì nghiêng dần về mặt gần nhất; khi đang bóc thì xoay về mặt có con dấu
  useEffect(() => {
    let raf = 0, last = performance.now()
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      const st = stageRef.current, s = a.current
      if (st === 'read') return
      if (!s.drag) {
        if (st === 'closed') {
          // quán tính theo thời gian thực (độ/giây) nên máy nhanh hay chậm đều cho cảm giác như nhau
          const k = Math.pow(0.0035, dt)
          s.ry += s.vy * dt; s.rx += s.vx * dt; s.vy *= k; s.vx *= k; s.idle += dt
          s.rx += (-6 - s.rx) * Math.min(1, dt * 3)
          if (s.tgt !== null) { s.ry += (s.tgt - s.ry) * Math.min(1, dt * 4); if (Math.abs(s.tgt - s.ry) < 0.4) { s.ry = s.tgt; s.tgt = null } }
          else if (s.idle > 1.2 && Math.abs(s.vy) < 8) { const base = Math.round((s.ry + 14) / 180) * 180 - 14; s.ry += (base - s.ry) * Math.min(1, dt * 2.2) }
        } else {
          const base = Math.round(s.ry / 360) * 360
          s.ry += (base - s.ry) * Math.min(1, dt * 4); s.rx += (-3 - s.rx) * Math.min(1, dt * 4)
        }
      }
      s.rx = clamp(s.rx, -38, 38)
      const sway = calm || st !== 'closed' ? 0 : Math.sin(t / 1700) * 2.2
      if (rig.current) rig.current.style.transform = `rotateX(${(s.rx + sway * 0.4).toFixed(2)}deg) rotateY(${(s.ry + sway).toFixed(2)}deg)`
      // nút bắt chuột nằm ngoài khối 3D (dò chuột trong 3D không đáng tin), bám theo vị trí con dấu trên màn hình, chỉ nhận chuột khi con dấu quay mặt về phía người xem
      const gl = glRef.current
      if (gl) gl.setRot(s.rx + sway * 0.4, s.ry + sway)
      const hb = hitRef.current
      let r: { left: number; top: number; width: number; height: number } | null = null
      if (gl) { const q = gl.sealRect(); r = q ? { left: q.x - q.w / 2, top: q.y - q.h / 2, width: q.w, height: q.h } : null }
      else { const sv = sealRef.current; r = sv ? sv.getBoundingClientRect() : null }
      if (r && hb) {
        const ang = ((s.ry % 360) + 360) % 360
        hb.style.transform = `translate(${r.left.toFixed(1)}px, ${r.top.toFixed(1)}px)`; hb.style.width = `${r.width.toFixed(1)}px`; hb.style.height = `${r.height.toFixed(1)}px`
        hb.style.pointerEvents = st === 'closed' && (ang < 62 || ang > 298) && !s.drag ? 'auto' : 'none'
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [calm])
  useEffect(() => {
    let dead = false
    let inst: EnvGL | null = null
    const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')) } catch { return false } })()
    if (!ok || isLite() || !glHost.current) { setGlMode('off'); return }
    import('./envelopeGL')
      .then((m) => m.createEnvelopeGL({ host: glHost.current!, stamp: g.stamp, label: 'Gửi người thương', to: 'Khánh Hạ', from: 'Long' }))
      .then((e) => { if (dead) { e.dispose(); return } inst = e; glRef.current = e; setGlMode('on') })
      .catch(() => { if (!dead) setGlMode('off') })
    return () => { dead = true; glRef.current = null; inst?.dispose() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { glRef.current?.stage(stage) }, [stage, glMode])
  useEffect(() => () => { timers.current.forEach(clearTimeout); cancelAnimationFrame(hold.current.raf); cancelAnimationFrame(hold.current.back) }, [])

  const later = (f: () => void, ms: number) => { timers.current.push(window.setTimeout(f, ms)) }

  const down = (e: React.PointerEvent) => {
    if (stageRef.current !== 'closed' || (e.target as HTMLElement).closest('.vm-seal')) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    const s = a.current; s.drag = true; s.lx = e.clientX; s.ly = e.clientY; s.lt = e.timeStamp; s.vx = s.vy = 0; s.idle = 0; s.tgt = null
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  }
  const move = (e: React.PointerEvent) => {
    const s = a.current
    if (!s.drag) return
    const dx = e.clientX - s.lx, dy = e.clientY - s.ly; s.lx = e.clientX; s.ly = e.clientY
    const dtm = Math.max(8, e.timeStamp - s.lt); s.lt = e.timeStamp
    s.ry += dx * 0.45; s.rx -= dy * 0.3; s.vy = clamp((dx * 0.45 * 1000) / dtm, -360, 360); s.vx = clamp((-dy * 0.3 * 1000) / dtm, -240, 240)
  }
  const up = () => { a.current.drag = false; a.current.idle = 0 }
  const flip = () => { const s = a.current; s.tgt = Math.round((s.ry + 14) / 180) * 180 - 14 + 180; s.vy = 0; s.idle = 0; sfx.tap('paper') }

  const crack = () => {
    const el = sealRef.current
    if (el && !glRef.current) {
      const r = el.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2
      setFrags(Array.from({ length: 16 }, (_, i) => ({ id: i, x: cx, y: cy, dx: (Math.random() - 0.5) * 280, dy: -(40 + Math.random() * 130), rot: (Math.random() - 0.5) * 600, s: 5 + Math.random() * 9, d: Math.random() * 0.1 })))
    }
    setHolding(false); sfx.crackleBurst(); sfx.thud(0.5); setStage('cracked')
    later(() => setFrags([]), 1500)
    if (calm) { later(() => setStage('read'), 300); return }
    later(() => { setStage('opening'); sfx.rustle(0.9, 0.45) }, 380)
    later(() => { setStage('out'); sfx.rustle(0.7, 0.4) }, 1500)
    later(() => { setStage('read'); sfx.sparkle() }, 3000)
  }
  const setHoldVar = (p: number) => { sealRef.current?.style.setProperty('--hold', String(p)); hitRef.current?.style.setProperty('--hold', String(p)); glRef.current?.setHold(p) }
  const startHold = (e: React.PointerEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    if (stageRef.current !== 'closed' || hold.current.on) return
    if (locked) { setShake((n) => n + 1); glRef.current?.shake(); sfx.thud(0.35); return }
    const h = hold.current; cancelAnimationFrame(h.back); h.on = true; h.t0 = performance.now(); setHolding(true); sfx.rustle(0.5, 0.25)
    if ('pointerId' in e) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const step = (t: number) => {
      if (!h.on) return
      h.p = Math.min(1, (t - h.t0) / HOLD_MS); setHoldVar(h.p)
      if (h.p >= 1) { h.on = false; crack(); return }
      h.raf = requestAnimationFrame(step)
    }
    h.raf = requestAnimationFrame(step)
  }
  const endHold = () => {
    const h = hold.current
    if (!h.on) return
    h.on = false; cancelAnimationFrame(h.raf); setHolding(false)
    const back = () => { h.p = Math.max(0, h.p - 0.06); setHoldVar(h.p); if (h.p > 0) h.back = requestAnimationFrame(back) }
    h.back = requestAnimationFrame(back)
  }

  // tờ thư bay từ vị trí trong phong bì ra tờ giấy đọc (FLIP): phóng lớn dần như bay về phía người xem
  useLayoutEffect(() => {
    if (stage !== 'read' || calm) return
    const p = paper.current, l = letter3d.current
    if (!p || !l) return
    const r0 = glRef.current?.letterRect() ?? l.getBoundingClientRect(), r1 = p.getBoundingClientRect()
    if (!r0.width || !r1.width) return
    p.animate([
      { transformOrigin: '0 0', transform: `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px) scale(${r0.width / r1.width}, ${r0.height / r1.height})`, opacity: 0 },
      { opacity: 1, offset: 0.18 },
      { transformOrigin: '0 0', transform: 'none', opacity: 1 },
    ], { duration: 1100, easing: 'cubic-bezier(.2,.8,.2,1)' })
  }, [stage, calm])

  const paras = g.body.length ? g.body : g.kind === 'plain' ? [treeText.empty] : []
  const unlockedRead = !locked
  // đưa đầu bút lông tới cuối chữ vừa viết (toạ độ so với tờ thư); null thì giấu bút
  const nib = (el: HTMLElement | null) => {
    const q = quillRef.current, w = wrapRef.current
    if (!q || !w) return
    if (!el) { q.style.opacity = '0'; return }
    const r = el.getBoundingClientRect(), b = w.getBoundingClientRect()
    q.style.opacity = '1'; q.style.transform = `translate(${(r.right - b.left - 17).toFixed(1)}px, ${(r.bottom - b.top - 92).toFixed(1)}px) rotate(30deg)`
  }

  return (
    <div className={`tr-modal vm${closing ? ' closing' : ''}`} data-stage={stage} data-lenis-prevent onClick={onClose}>
      <div className="vm-rigwrap">
        <div ref={glHost} className="vm-gl" aria-hidden />
        {glMode === 'off' && <i className="vm-ground" aria-hidden />}
        <div className="vm-hit" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={(e) => e.stopPropagation()}>
          <div className="vm-rig" ref={rig}>
            <div className={`vm-env${glMode === 'off' ? '' : ' gl-hide'}`}>
              <div className="vm-face vm-seal-face">
                <Sketch className="sk-env" r={3} strokes={ENV_STROKES} />
                <svg className="vm-folds" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden><path d="M0 0 L50 58 L0 100 Z" /><path d="M100 0 L50 58 L100 100 Z" /><path d="M0 100 L50 58 L100 100 Z" /></svg>
                <div className="vm-flap">
                  <div className="vm-flap-out"><svg className="vm-flapline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden><path d="M0 16 L50 100 L100 16" /></svg></div>
                  <div className="vm-flap-in" />
                  <i className="vm-stain" />
                  <div ref={sealRef} className={`vm-seal${holding ? ' holding' : ''}${stage !== 'closed' ? ' gone' : ''}${shake ? ' shake' : ''}`} key={stage === 'closed' ? 'k' + shake : 'x'} aria-hidden>
                    <svg viewBox="0 0 100 100" className="vm-ring"><circle cx="50" cy="50" r="47" pathLength={1} /></svg>
                    <div className="vm-half l"><WaxSeal /></div><div className="vm-half r"><WaxSeal /></div>
                  </div>
                </div>
              </div>
              <div className="vm-face vm-addr-face">
                <Sketch className="sk-env" r={3} strokes={ENV_STROKES} />
                <div className="vm-addr">
                  <span className="vm-lab vm-tag">Thư tay</span>
                  <div className="vm-pm"><Postmark text={g.stamp} /></div>
                  <div className="vm-stamp"><Stamp tilt={3} /></div>
                  <div className="vm-to"><span className="vm-lab">Gửi người thương</span><i className="vm-name">Khánh Hạ</i><Flourish className="vm-fl" delay={1} /></div>
                  <div className="vm-from"><span className="vm-lab">Người gửi</span><i className="vm-name sm">Long</i></div>
                </div>
              </div>
              <i className="vm-edge e-t" /><i className="vm-edge e-b" /><i className="vm-edge e-l" /><i className="vm-edge e-r" />
              <div className="vm-letter3d" ref={letter3d} aria-hidden><i /></div>
            </div>
          </div>
        </div>
      </div>

      <button ref={hitRef} type="button" className="vm-sealhit" tabIndex={stage === 'closed' ? 0 : -1}
        aria-label={locked ? 'Con dấu sáp, chưa tới giờ bóc' : 'Giữ để bóc con dấu sáp'}
        onPointerDown={startHold} onPointerUp={endHold} onPointerCancel={endHold} onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); startHold(e) } }} onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') endHold() }}>
        {glMode === 'on' && <svg viewBox="0 0 100 100" className="vm-ring" aria-hidden><circle cx="50" cy="50" r="47" pathLength={1} /></svg>}
      </button>

      {stage === 'closed' && (
        <>
          <button className="vm-btn vm-flip" type="button" aria-label="Lật lá thư" onClick={(e) => { e.stopPropagation(); flip() }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4.5h-4.5" /></svg>
          </button>
          <button className="vm-btn vm-x" type="button" aria-label="Đóng" onClick={(e) => { e.stopPropagation(); onClose() }}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </>
      )}
      {locked && cd && stage === 'closed' && (
        <div className="vm-lock" onClick={(e) => e.stopPropagation()}>
          <p>{treeText.locked}</p>
          <div className="vm-clock" role="timer" aria-label={`Còn ${cd.d} ngày ${cd.h} giờ ${cd.m} phút ${cd.s} giây`}>
            {([['ngày', cd.d], ['giờ', cd.h], ['phút', cd.m], ['giây', cd.s]] as const).map(([u, v]) => <div key={u}><b>{String(v).padStart(2, '0')}</b><span>{u}</span></div>)}
          </div>
        </div>
      )}

      <div className="vm-frags" aria-hidden>
        {frags.map((f) => <i key={f.id} style={{ left: f.x, top: f.y, width: f.s, height: f.s * 0.8, animationDelay: `${f.d}s`, ['--dx' as string]: `${f.dx}px`, ['--dy' as string]: `${f.dy}px`, ['--rot' as string]: `${f.rot}deg` }} />)}
      </div>

      {stage === 'read' && unlockedRead && (
        <div className="vl-scroll">
          <div className="vl-wrap" ref={wrapRef} onClick={(e) => { e.stopPropagation(); if (!written) window.dispatchEvent(new Event('olcw:skipwrite')) }} role="dialog" aria-label={g.title}>
            <div className="vl-paper" ref={paper} style={{ clipPath: clip }}>
              <Doodle kind="scroll" size={26} seed={11} delay={0.9} className="vl-corner tl" />
              <div className="lt-body">
                <div className="vl-date">{g.stamp}</div>
                <h2>{g.title}</h2>
                <Flourish className="vl-fl" delay={0.8} />
                {g.kind === 'plain' && <Handwrite paras={paras} delay={calm ? 0 : 900} instant={calm} onDone={() => setWritten(true)} onNib={nib} />}
                {g.kind !== 'plain' && (
                  <div className="lt-cols">
                    <div className="lt-col"><Handwrite paras={paras} delay={calm ? 0 : 900} instant={calm} onDone={() => setWritten(true)} onNib={nib} /></div>
                    <div className={`lt-col vl-late${written ? ' on' : ''}`}>{g.kind === 'reply' ? <Reply id={g.id} /> : <Qr label={g.extra} />}</div>
                  </div>
                )}
                <button className="lt-close" onClick={onClose}>{treeText.close}</button>
              </div>
            </div>
            <div ref={quillRef} className="hw-quill" aria-hidden><Quill /></div>
            <div className={`vl-rest${written ? ' on' : ''}`} aria-hidden><Quill /></div>
            <div className={`vl-ink${written ? ' on' : ''}`} aria-hidden><Inkwell /></div>
          </div>
        </div>
      )}
    </div>
  )
}
