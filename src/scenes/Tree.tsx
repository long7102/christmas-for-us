import { useEffect, useMemo, useRef, useState } from 'react'
import landSrc from '../assets/tree-land.webp'
import portSrc from '../assets/tree-port.webp'
import { gifts, tree as treeCopy } from '../content/content'
import { reducedMotion } from '../lib/device'
import { store } from '../lib/storage'
import { isUnlocked } from '../lib/unlock'
import { ModalView, PaperFilter, type Modal } from './Letter'

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
  /** Nắp từng hộp: đỉnh nơ, mép trên miệng hộp, mép dưới nắp; khoảng x của hộp. */
  lids: { poly: P; top: number; y1: number; y2: number; x1: number; x2: number }[]
  /** Vật bấm được (hình elip): ngôi sao, vòng hoa, tất, lò sưởi. */
  spots: { id: string; cx: number; cy: number; rx: number; ry: number }[]
  /** Khung phải luôn thấy được (cây + quà). */
  focus: { x1: number; y1: number; x2: number; y2: number }
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
  lamps: [[45, 205, 70], [395, 280, 55], [606, 425, 55], [1215, 582, 55], [1632, 232, 70], [45, 710, 75]],
  lids: [
    { poly: [[632,742],[660,735],[662,722],[690,721],[712,723],[722,737],[740,740],[739,761],[632,763]], top: 720, y1: 740, y2: 761, x1: 633, x2: 739 },
    { poly: [[735,758],[765,752],[765,734],[790,731],[812,734],[815,750],[842,752],[843,777],[737,779]], top: 729, y1: 752, y2: 778, x1: 736, x2: 843 },
    { poly: [[851,760],[870,752],[875,741],[895,741],[912,745],[915,755],[936,758],[937,778],[851,778]], top: 739, y1: 757, y2: 778, x1: 851, x2: 937 },
    { poly: [[940,745],[962,738],[968,723],[990,721],[1020,721],[1030,735],[1053,742],[1053,776],[942,778]], top: 719, y1: 742, y2: 777, x1: 940, x2: 1054 },
  ],
  spots: [
    { id: 'wreath', cx: 237, cy: 140, rx: 100, ry: 104 }, { id: 'star', cx: 832, cy: 92, rx: 38, ry: 44 },
    { id: 'stock0', cx: 138, cy: 445, rx: 48, ry: 88 }, { id: 'stock1', cx: 236, cy: 442, rx: 44, ry: 78 }, { id: 'stock2', cx: 336, cy: 457, rx: 40, ry: 74 },
    { id: 'fire', cx: 190, cy: 625, rx: 110, ry: 95 },
  ],
  focus: { x1: 560, y1: 60, x2: 1110, y2: 850 },
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
  lamps: [[240, 488, 90], [145, 598, 70], [855, 895, 70], [20, 1360, 80]],
  lids: [
    { poly: [[273,1252],[300,1245],[305,1231],[320,1227],[345,1229],[362,1240],[391,1248],[391,1283],[275,1285]], top: 1226, y1: 1250, y2: 1284, x1: 273, x2: 392 },
    { poly: [[383,1255],[405,1248],[410,1234],[430,1227],[465,1231],[472,1245],[493,1250],[493,1291],[386,1291]], top: 1226, y1: 1252, y2: 1290, x1: 383, x2: 493 },
    { poly: [[502,1258],[520,1250],[525,1234],[540,1229],[570,1231],[582,1245],[604,1252],[604,1286],[502,1286]], top: 1228, y1: 1255, y2: 1285, x1: 502, x2: 605 },
    { poly: [[597,1250],[620,1245],[630,1229],[650,1221],[685,1223],[695,1238],[721,1245],[723,1284],[600,1289]], top: 1220, y1: 1246, y2: 1286, x1: 597, x2: 724 },
  ],
  spots: [
    { id: 'star', cx: 488, cy: 335, rx: 54, ry: 60 },
    { id: 'stock0', cx: 45, cy: 812, rx: 40, ry: 95 }, { id: 'stock1', cx: 108, cy: 818, rx: 38, ry: 90 }, { id: 'stock2', cx: 175, cy: 820, rx: 36, ry: 85 },
    { id: 'fire', cx: 45, cy: 1100, rx: 70, ry: 120 },
  ],
  focus: { x1: 200, y1: 270, x2: 770, y2: 1370 },
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
      const s = Math.max(vw / L.w, vh / L.h)
      const cx = (F.x1 + F.x2) / 2, cy = (F.y1 + F.y2) / 2
      let x = vw / 2 - cx * s
      let y = Math.min(vh / 2 - cy * s, vh - F.y2 * s - 10)
      x = Math.min(0, Math.max(vw - L.w * s, x)); y = Math.min(0, Math.max(vh - L.h * s, y))
      setG({ s, x, y })
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el)
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

  const poke = (id: string) => {
    if (id === 'star') { setStarKey((k) => k + 1); setFlash(true); setTimeout(() => setFlash(false), 2600) }
    else if (id === 'fire') { setKick((k) => k + 1); setFireOn(true); setTimeout(() => setFireOn(false), FLARE_MS) }
    else if (id === 'wreath') { setWreathKey((k) => k + 1); setModal({ kind: 'memory', id }) }
    else setModal({ kind: 'memory', id })
  }
  const pokeLamp = (i: number) => {
    setLampOn((s) => new Set(s).add(i))
    setTimeout(() => setLampOn((s) => { const n = new Set(s); n.delete(i); return n }), FLARE_MS)
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
          <div key={`s${starKey}`} className={`tr-starburst${starKey ? ' go' : ''}`} style={{ left: L.spots.find((q) => q.id === 'star')!.cx, top: L.spots.find((q) => q.id === 'star')!.cy }} />
          {L.spots.some((q) => q.id === 'wreath') && (
            <div key={`w${wreathKey}`} className={`tr-ring${wreathKey ? ' go' : ''}`} style={{ left: L.spots.find((q) => q.id === 'wreath')!.cx, top: L.spots.find((q) => q.id === 'wreath')!.cy }} />
          )}

          <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
            {L.spots.map((q) => (
              <ellipse key={q.id} className="tr-hs" cx={q.cx} cy={q.cy} rx={q.rx} ry={q.ry} tabIndex={0} role="button"
                aria-label={q.id} onClick={() => poke(q.id)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); poke(q.id) } }} />
            ))}
            {L.lamps.map(([x, y, r], i) => (
              <ellipse key={`lp${i}`} className="tr-hs" cx={x} cy={y} rx={r * 0.42} ry={r * 0.85} tabIndex={0} role="button" aria-label="đèn"
                onClick={() => pokeLamp(i)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pokeLamp(i) } }} />
            ))}
            {L.polys.map((p, i) => {
              const gf = gifts[i]
              return (
                <polygon key={gf.id} className="tr-gifthit" points={(opened[i] ? bodyPoly(i) : p).map((q) => q.join(',')).join(' ')} tabIndex={0} role="button"
                  aria-label={gf.title}
                  onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} onFocus={() => setHov(i)} onBlur={() => setHov(null)}
                  onClick={() => openGift(i)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openGift(i) } }} />
              )
            })}
          </svg>
        </div>
      </div>

      <div className="sec-text">
        <h2 className="sec-title">{treeCopy.title}</h2>
        <p className="sec-desc">{treeCopy.body}</p>
      </div>

      {modal && <ModalView modal={modal} onClose={() => setModal(null)} />}
    </section>
  )
}
