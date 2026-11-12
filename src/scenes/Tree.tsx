import { useEffect, useMemo, useRef, useState } from 'react'
import landSrc from '../assets/tree-land.webp'
import portSrc from '../assets/tree-port.webp'
import { gifts, treeText } from '../content/content'
import { usePortrait, reducedMotion } from '../lib/device'
import { countdown, isUnlocked } from '../lib/unlock'

type R = { x: number; y: number; w: number; h: number }
type Layout = {
  src: string; w: number; h: number
  win: R; fire: R
  tree: { cx: number; top: number; base: number; half: number }
  gifts: R[]
}

// Toạ độ theo pixel của ảnh gốc.
const LAND: Layout = {
  src: landSrc, w: 1680, h: 944,
  win: { x: 1220, y: 118, w: 239, h: 510 },
  fire: { x: 108, y: 535, w: 170, h: 180 },
  tree: { cx: 840, top: 126, base: 693, half: 226 },
  gifts: [
    { x: 632, y: 733, w: 105, h: 86 }, { x: 735, y: 746, w: 107, h: 84 },
    { x: 852, y: 752, w: 84, h: 78 }, { x: 937, y: 737, w: 116, h: 90 },
  ],
}
const PORT: Layout = {
  src: portSrc, w: 944, h: 1680,
  win: { x: 751, y: 25, w: 181, h: 643 },
  fire: { x: 0, y: 1051, w: 71, h: 156 },
  tree: { cx: 488, top: 357, base: 1230, half: 269 },
  gifts: [
    { x: 271, y: 1240, w: 118, h: 105 }, { x: 381, y: 1253, w: 130, h: 101 },
    { x: 502, y: 1249, w: 105, h: 105 }, { x: 597, y: 1236, w: 122, h: 114 },
  ],
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
        <Twinkles t={L.tree} />
        <div className="tr-warm" />
        {gifts.map((gf, i) => {
          const r = L.gifts[i], ok = isUnlocked(gf.unlockAt)
          return (
            <button
              key={gf.id}
              className={`tr-gift ${ok ? 'on' : 'off'}`}
              style={{ left: r.x, top: r.y, width: r.w, height: r.h }}
              onClick={() => setOpen(i)}
              aria-label={`${gf.title}${ok ? '' : ` (mở lúc ${fmt(gf.unlockAt)})`}`}
            >
              <span className="tr-tag" style={{ fontSize: portrait ? 20 : 14 }}>{ok ? '✦' : `🔒 ${fmt(gf.unlockAt)}`}</span>
            </button>
          )
        })}
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
