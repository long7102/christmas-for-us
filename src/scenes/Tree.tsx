import { useEffect, useMemo, useRef, useState } from 'react'
import landSrc from '../assets/tree-land.webp'
import portSrc from '../assets/tree-port.webp'
import { gifts, tree as treeCopy, treeText } from '../content/content'
import { usePortrait, reducedMotion } from '../lib/device'
import { countdown, isUnlocked } from '../lib/unlock'

type P = [number, number][]
type R = { x: number; y: number; w: number; h: number }
type Layout = {
  src: string; w: number; h: number
  win: R; fire: R
  tree: { cx: number; top: number; base: number; half: number }
  /** Viền từng hộp quà (đa giác, px ảnh gốc). */
  polys: P[]
  /** Đèn lồng/nến (x, y, bán kính). */
  lamps: [number, number, number][]
}

// Toạ độ theo pixel của ảnh gốc.
const LAND: Layout = {
  src: landSrc, w: 1680, h: 944,
  win: { x: 1220, y: 118, w: 239, h: 510 },
  fire: { x: 108, y: 535, w: 170, h: 180 },
  tree: { cx: 840, top: 126, base: 693, half: 226 },
  polys: [
    [[632,745],[660,735],[662,723],[690,722],[712,724],[722,738],[738,742],[738,800],[722,815],[640,812],[632,790]],
    [[735,758],[765,752],[765,735],[790,732],[812,735],[815,750],[840,752],[840,800],[822,827],[742,828],[738,790]],
    [[852,760],[870,752],[875,742],[895,742],[912,745],[915,755],[935,758],[936,800],[930,826],[855,826],[850,790]],
    [[940,745],[962,738],[968,724],[990,722],[1020,722],[1030,735],[1052,742],[1052,810],[1040,826],[965,828],[945,800]],
  ],
  lamps: [[45, 215, 70], [395, 290, 55], [605, 430, 55], [1215, 585, 55], [1630, 225, 70], [45, 715, 75], [226, 250, 45]],
}
const PORT: Layout = {
  src: portSrc, w: 944, h: 1680,
  win: { x: 751, y: 25, w: 181, h: 643 },
  fire: { x: 0, y: 1051, w: 71, h: 156 },
  tree: { cx: 488, top: 357, base: 1230, half: 269 },
  polys: [
    [[273,1252],[300,1245],[305,1232],[320,1228],[345,1230],[362,1240],[390,1248],[392,1325],[375,1342],[285,1335],[272,1300]],
    [[383,1255],[405,1248],[410,1235],[430,1228],[465,1232],[472,1245],[492,1250],[492,1300],[485,1352],[392,1350],[385,1300]],
    [[502,1258],[520,1250],[525,1235],[540,1230],[570,1232],[582,1245],[603,1252],[603,1300],[600,1350],[510,1352],[502,1300]],
    [[597,1250],[620,1245],[630,1230],[650,1222],[685,1224],[695,1238],[720,1245],[722,1320],[712,1335],[630,1347],[610,1320]],
  ],
  lamps: [[240, 490, 90], [145, 600, 70], [855, 895, 70], [20, 1360, 80]],
}

const fmt = (iso: string) => {
  const d = new Date(Date.parse(iso) + 7 * 3600e3)
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}`
}

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

function Fire({ r }: { r: R }) {
  return (
    <>
      <div className="tr-fireglow" style={{ left: r.x - r.w * 1.6, top: r.y - r.h * 0.9, width: r.w * 4.2, height: r.h * 2.6 }} />
      <div className="tr-fire" style={{ left: r.x, top: r.y, width: r.w, height: r.h }}>
        <i /><i /><i />
      </div>
    </>
  )
}

/** Tàn lửa bay lên + những tiếng "tách" bắn tia lửa. */
function Embers({ r }: { r: R }) {
  const ref = useRef<HTMLCanvasElement>(null)
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
function Lamps({ lamps }: { lamps: Layout['lamps'] }) {
  return (
    <>
      {lamps.map(([x, y, r], i) => (
        <i key={i} className="tr-lamp" style={{ left: x - r, top: y - r, width: r * 2, height: r * 2, animationDuration: `${1.6 + (i % 4) * 0.45}s`, animationDelay: `-${i * 0.37}s` }} />
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

export default function Tree() {
  const portrait = usePortrait()
  const L = portrait ? PORT : LAND
  const host = useRef<HTMLDivElement>(null)
  const [g, setG] = useState({ s: 1, x: 0, y: 0 })
  const [open, setOpen] = useState<number | null>(null)
  const [hov, setHov] = useState<number | null>(null)
  const [, tick] = useState(0)

  useEffect(() => {
    const el = host.current!
    const fit = () => {
      const vw = el.clientWidth, vh = el.clientHeight
      const s = Math.max(vw / L.w, vh / L.h)
      setG({ s, x: (vw - L.w * s) / 2, y: (vh - L.h * s) / 2 })
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [L])

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [])

  const cur = open === null ? null : gifts[open]
  const unlocked = cur ? isUnlocked(cur.unlockAt) : false
  const cd = cur && !unlocked ? countdown(cur.unlockAt) : null

  return (
    <section className="tree-scene" ref={host}>
      <div className="tr-stage" style={{ width: L.w, height: L.h, transform: `translate(${g.x}px, ${g.y}px) scale(${g.s})` }}>
        <img src={L.src} alt="Cây thông Giáng sinh và bốn món quà" draggable={false} />
        <WindowSnow r={L.win} />
        <Fire r={L.fire} />
        <Embers r={L.fire} />
        <Lamps lamps={L.lamps} />
        <Twinkles t={L.tree} />
        <Dust w={L.w} h={L.h} />
        <div className="tr-warm" />
        {L.polys.map((p, i) => (
          <div key={`d${i}`} className={`tr-dim${hov !== null && hov !== i ? ' on' : ''}`} style={{ clipPath: poly(p) }} />
        ))}
        {L.polys.map((p, i) => (
          <div key={`l${i}`} className={`tr-litwrap${hov === i ? ' on' : ''}`}>
            <div className="tr-lit" style={{ clipPath: poly(p), backgroundImage: `url(${L.src})` }} />
          </div>
        ))}
        <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
          {L.polys.map((p, i) => {
            const gf = gifts[i], ok = isUnlocked(gf.unlockAt)
            return (
              <polygon
                key={gf.id}
                points={p.map((q) => q.join(',')).join(' ')}
                tabIndex={0}
                role="button"
                aria-label={`${gf.title}${ok ? '' : ` (mở lúc ${fmt(gf.unlockAt)})`}`}
                onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
                onFocus={() => setHov(i)} onBlur={() => setHov(null)}
                onClick={() => setOpen(i)}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(i) } }}
              />
            )
          })}
        </svg>
        {L.polys.map((p, i) => {
          const b = bbox(p), gf = gifts[i], ok = isUnlocked(gf.unlockAt)
          return (
            <span key={`t${i}`} className={`tr-tag${hov !== null && hov !== i ? ' dim' : ''}${hov === i ? ' hot' : ''}`} style={{ left: b.x + b.w / 2, top: b.y - 6, fontSize: portrait ? 20 : 14 }}>
              {ok ? '✦' : `🔒 ${fmt(gf.unlockAt)}`}
            </span>
          )
        })}
      </div>

      <div className="tr-caption">
        <small>{treeCopy.eyebrow}</small>
        <h3>{treeCopy.title}</h3>
        <p>{treeCopy.body}</p>
      </div>

      {cur && (
        <div className="tr-modal" onClick={() => setOpen(null)}>
          <div className="tr-card" onClick={(e) => e.stopPropagation()}>
            <div className="tr-seal" aria-hidden>✦</div>
            <h2>{cur.title}</h2>
            <div className="tr-rule" aria-hidden />
            {cd ? (
              <>
                <p>{treeText.locked}</p>
                <div className="tr-clock" role="timer" aria-label={`Còn ${cd.d} ngày ${cd.h} giờ ${cd.m} phút ${cd.s} giây`}>
                  {([['ngày', cd.d], ['giờ', cd.h], ['phút', cd.m], ['giây', cd.s]] as const).map(([u, v]) => (
                    <div key={u}><b>{String(v).padStart(2, '0')}</b><span>{u}</span></div>
                  ))}
                </div>
              </>
            ) : (
              <p>{cur.body || treeText.empty}</p>
            )}
            <button onClick={() => setOpen(null)}>{treeText.close}</button>
          </div>
        </div>
      )}
    </section>
  )
}
