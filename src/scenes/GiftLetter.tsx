import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { treeText, type gifts } from '../content/content'
import { sfx } from '../lib/audio'
import { reducedMotion } from '../lib/device'
import { rng } from '../lib/sketch'
import { Flourish, Sketch, type SketchStroke } from '../components/Sketch'
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
  for (let i = 0; i <= n; i++) pts.push(`${((i / n) * 100).toFixed(2)}% ${(r() * 0.5).toFixed(2)}%`)
  for (let i = 1; i <= m; i++) pts.push(`${(100 - r() * 0.55).toFixed(2)}% ${((i / m) * 100).toFixed(2)}%`)
  for (let i = n - 1; i >= 0; i--) pts.push(`${((i / n) * 100).toFixed(2)}% ${(100 - r() * 0.5).toFixed(2)}%`)
  for (let i = m - 1; i > 0; i--) pts.push(`${(r() * 0.55).toFixed(2)}% ${((i / m) * 100).toFixed(2)}%`)
  return `polygon(${pts.join(',')})`
}

function WaxSeal() {
  return (
    <svg viewBox="0 0 100 100" className="vm-wax" aria-hidden>
      <defs>
        <radialGradient id="vmwax" cx=".36" cy=".3" r=".85"><stop offset="0" stopColor="#c2373a" /><stop offset=".45" stopColor="#8f161c" /><stop offset="1" stopColor="#4a0a0e" /></radialGradient>
      </defs>
      <path d="M50 5c9 0 13 7 22 8 8 1 15 6 14 15 7 6 9 14 4 22 4 8 0 15-8 19-2 9-9 13-18 11-7 8-16 8-23 1-9 2-17-3-19-11-8-4-11-12-7-20-5-8-3-16 4-22-1-9 6-14 14-15 9-1 13-8 22-8z" fill="url(#vmwax)" />
      <circle cx="50" cy="51" r="30" fill="none" stroke="#3a070a" strokeWidth="2" opacity=".6" />
      <circle cx="50" cy="51" r="27" fill="none" stroke="#d0585a" strokeWidth="1" opacity=".4" />
      <text x="50" y="60" textAnchor="middle" fontSize="25" fontStyle="italic" fontWeight="700" fontFamily="'Playfair Display', serif" fill="#e0868a" opacity=".5" transform="translate(-.8 -.9)">L♥H</text>
      <text x="50" y="60" textAnchor="middle" fontSize="25" fontStyle="italic" fontWeight="700" fontFamily="'Playfair Display', serif" fill="#4c0a0e" opacity=".85">L♥H</text>
      <g className="vm-crack" fill="none" stroke="#1c0305" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M52 6 L47 26 L56 40 L49 58 L54 78 L50 95" /><path d="M8 50 L30 54 L46 47 L70 56 L94 49" /><path d="M47 26 L30 20 M56 40 L72 34 M49 58 L36 70" />
      </g>
    </svg>
  )
}

function Quill() {
  return (
    <svg viewBox="0 0 90 300" className="vl-quill" aria-hidden>
      <path d="M62 4C30 40 20 110 30 190 34 216 46 232 58 250 64 200 80 120 76 56 74 30 70 14 62 4z" fill="#d9d2bf" stroke="#4a4130" strokeWidth="1.4" />
      <path d="M62 4C58 80 52 170 58 250" fill="none" stroke="#4a4130" strokeWidth="1.8" />
      <g stroke="#4a4130" strokeWidth=".7" opacity=".7" fill="none">
        {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${60 - i * 0.2} ${24 + i * 9}L${34 + i * 0.5} ${34 + i * 9}M${60 - i * 0.2} ${24 + i * 9}L${76 - i * 0.3} ${32 + i * 9}`} />)}
      </g>
      <path d="M58 250L54 296" stroke="#4a4130" strokeWidth="3" strokeLinecap="round" />
    </svg>
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
  const hold = useRef({ on: false, t0: 0, raf: 0, p: 0 })
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
      const sv = sealRef.current, hb = hitRef.current
      if (sv && hb) {
        const r = sv.getBoundingClientRect(), ang = ((s.ry % 360) + 360) % 360
        hb.style.transform = `translate(${r.left.toFixed(1)}px, ${r.top.toFixed(1)}px)`; hb.style.width = `${r.width.toFixed(1)}px`; hb.style.height = `${r.height.toFixed(1)}px`
        hb.style.pointerEvents = st === 'closed' && (ang < 62 || ang > 298) && !s.drag ? 'auto' : 'none'
      }
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [calm])
  useEffect(() => () => { timers.current.forEach(clearTimeout); cancelAnimationFrame(hold.current.raf) }, [])

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
    if (el) {
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
  const setHoldVar = (p: number) => sealRef.current?.style.setProperty('--hold', String(p))
  const startHold = (e: React.PointerEvent | React.KeyboardEvent) => {
    e.stopPropagation()
    if (stageRef.current !== 'closed' || hold.current.on) return
    if (locked) { setShake((n) => n + 1); sfx.thud(0.35); return }
    const h = hold.current; h.on = true; h.t0 = performance.now(); setHolding(true); sfx.rustle(0.5, 0.25)
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
    const back = () => { h.p = Math.max(0, h.p - 0.06); setHoldVar(h.p); if (h.p > 0) h.raf = requestAnimationFrame(back) }
    h.raf = requestAnimationFrame(back)
  }

  // tờ thư bay từ vị trí trong phong bì ra tờ giấy đọc (FLIP): phóng lớn dần như bay về phía người xem
  useLayoutEffect(() => {
    if (stage !== 'read' || calm) return
    const p = paper.current, l = letter3d.current
    if (!p || !l) return
    const r0 = l.getBoundingClientRect(), r1 = p.getBoundingClientRect()
    if (!r0.width || !r1.width) return
    p.animate([
      { transformOrigin: '0 0', transform: `translate(${r0.left - r1.left}px, ${r0.top - r1.top}px) scale(${r0.width / r1.width}, ${r0.height / r1.height})`, opacity: 0 },
      { opacity: 1, offset: 0.18 },
      { transformOrigin: '0 0', transform: 'none', opacity: 1 },
    ], { duration: 1100, easing: 'cubic-bezier(.2,.8,.2,1)' })
  }, [stage, calm])

  const body = g.body.map((t, i) => <p className="hand" key={i}>{t}</p>)
  const unlockedRead = !locked

  return (
    <div className={`tr-modal vm${closing ? ' closing' : ''}`} data-stage={stage} data-lenis-prevent onClick={onClose}>
      <div className="vm-rigwrap">
        <div className="vm-hit" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClick={(e) => e.stopPropagation()}>
          <div className="vm-rig" ref={rig}>
            <div className="vm-env">
              <div className="vm-face vm-seal-face">
                <Sketch className="sk-env" r={3} strokes={ENV_STROKES} />
                <svg className="vm-folds" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden><path d="M0 0 L50 58 L0 100 Z" /><path d="M100 0 L50 58 L100 100 Z" /><path d="M0 100 L50 58 L100 100 Z" /></svg>
                <div className="vm-flap">
                  <div className="vm-flap-out"><svg className="vm-flapline" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden><path d="M0 16 L50 100 L100 16" /></svg></div>
                  <div className="vm-flap-in" />
                  <i className="vm-stain" />
                  <div ref={sealRef} className={`vm-seal${holding ? ' holding' : ''}${stage !== 'closed' ? ' gone' : ''}${shake ? ' shake' : ''}`} key={stage === 'closed' ? 'k' + shake : 'x'} aria-hidden>
                    <svg viewBox="0 0 100 100" className="vm-ring"><circle cx="50" cy="50" r="47" pathLength={1} /></svg>
                    <WaxSeal />
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
        onKeyDown={(e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); startHold(e) } }} onKeyUp={(e) => { if (e.key === 'Enter' || e.key === ' ') endHold() }} />

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
          <div className="vl-wrap" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={g.title}>
            <div className="vl-paper" ref={paper} style={{ clipPath: clip }}>
              <div className="lt-body">
                <div className="vl-date">{g.stamp}</div>
                <h2>{g.title}</h2>
                <div className="lt-rule" aria-hidden />
                {g.kind === 'plain' && (g.body.length === 0 ? <p className="hand">{treeText.empty}</p> : body)}
                {g.kind !== 'plain' && (
                  <div className="lt-cols">
                    <div className="lt-col">{body}</div>
                    <div className="lt-col">{g.kind === 'reply' ? <Reply id={g.id} /> : <Qr label={g.extra} />}</div>
                  </div>
                )}
                <button className="lt-close" onClick={onClose}>{treeText.close}</button>
              </div>
            </div>
            <Quill />
          </div>
        </div>
      )}
    </div>
  )
}
