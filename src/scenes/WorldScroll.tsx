import { useEffect, useRef, useState } from 'react'
import Tree from './Tree'
import Cats from './Cats'
import MusicBox from './MusicBox'
import SnowWatch from './SnowWatch'
import Lenis from 'lenis'
import { weather } from '../lib/weather'
import { isLite, reducedMotion } from '../lib/device'
import { sfx } from '../lib/audio'
import { FLAKES } from '../lib/snowflakes'
import { FlakeFx } from '../components/FlakeFx'

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
/** Quãng cuộn (tính theo chiều cao màn hình) để đi hết một lần chuyển cảnh: dài hơn thì chậm và mượt hơn. */
const SPAN = 1.7
const CY = 0.58
/** Chuyển cảnh đầu (hộp nhạc -> cây thông): màn ánh sáng vàng kéo từ dưới lên, kéo theo nốt nhạc và tia sáng. */
const SPAN2 = 1.5
/** Đứng yên ở cảnh hộp nhạc lúc mới vào (tính theo chiều cao màn hình). */
const HOLD0 = 0.45
/** Dừng ngắm cây thông trước khi sang cảnh mèo (tính theo chiều cao màn hình) và đoạn nghỉ cuối ở cảnh mèo. */
const HOLD = 0.45
const END = 0.5
/** Dừng ngắm hai bé, rồi ánh nến từ một góc phòng loang ra, kéo máy quay lùi ra từ góc ấy sang cảnh ngắm tuyết: đứng yên HOLD3, chuyển SPAN3 (đơn vị: chiều cao màn hình). */
const HOLD3 = 0.45
const SPAN3 = 1.5
const Y_CATS = HOLD0 + SPAN2 + HOLD + SPAN
const Y_SNOW = Y_CATS + HOLD3 + SPAN3

type Fx = { p: number; R: number; cx: number; cy: number; on: boolean }

/** Lớp hạt Giáng sinh: tuyết rơi theo gió và tia sao vàng bắn ra từ mép vòng sáng. */
function Sparks({ fx }: { fx: React.MutableRefObject<Fx> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    const calm = reducedMotion() || isLite()
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; star: boolean; ph: number }
    const ps: P[] = []
    let raf = 0, last = performance.now(), W = 0, H = 0
    const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight }
    size(); addEventListener('resize', size)
    const star = (x: number, y: number, r: number, rot: number) => {
      ctx.beginPath()
      for (let i = 0; i < 8; i++) { const a = rot + i * Math.PI / 4, rr = i % 2 ? r * 0.28 : r; const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py) }
      ctx.closePath(); ctx.fill()
    }
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      const f = fx.current
      ctx.clearRect(0, 0, W, H)
      if (!f.on) { raf = requestAnimationFrame(frame); return }
      const inten = Math.sin(Math.PI * Math.min(1, Math.max(0, f.p)))
      // tuyết rơi xiên khắp màn hình
      if (ps.length < 230 && !calm) {
        const n = inten * 70 * dt
        for (let k = 0; k < n + (Math.random() < n % 1 ? 1 : 0); k++) ps.push({ x: Math.random() * (W + 200) - 100, y: -10, vx: weather.gust(t) * (1.6 + Math.random() * 1.8), vy: 60 + Math.random() * 110, life: 0, max: 99, s: 1.2 + Math.random() * 3, star: false, ph: Math.random() * 6.28 })
      }
      // tia sao và bông tuyết bắn ra từ mép vòng sáng
      if (f.R > 8 && ps.length < 260) {
        const n = (calm ? 8 : 55) * inten * dt
        for (let k = 0; k < n + (Math.random() < n % 1 ? 1 : 0); k++) {
          const a = Math.random() * 6.283, r = f.R + (Math.random() - 0.5) * 10
          const out = 8 + Math.random() * 38
          ps.push({ x: f.cx + Math.cos(a) * r, y: f.cy + Math.sin(a) * r, vx: Math.cos(a) * out, vy: Math.sin(a) * out + 12, life: 0, max: 0.9 + Math.random() * 1.4, s: 2 + Math.random() * 4.5, star: Math.random() < 0.45, ph: Math.random() * 6.28 })
        }
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.life += dt
        if (p.life > p.max || p.y > H + 12 || p.x > W + 120) { ps.splice(i, 1); continue }
        p.x += (p.vx + Math.sin(t / 600 + p.ph) * 14) * dt; p.y += p.vy * dt
        if (p.max === 99) { // bông tuyết ngoài
          ctx.globalAlpha = 0.55 * inten
          const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.s * 1.7)
          g.addColorStop(0, '#fff'); g.addColorStop(1, 'rgba(235,242,255,0)'); ctx.fillStyle = g
          ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 1.7, 0, 6.283); ctx.fill()
        } else {
          const k = 1 - p.life / p.max
          ctx.globalAlpha = Math.min(1, k * 1.6) * 0.95
          if (p.star) { ctx.fillStyle = '#ffe8a8'; star(p.x, p.y, p.s * (0.7 + 0.5 * Math.sin(t / 90 + p.ph)) * 1.6, p.life * 2) }
          else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.6, 0, 6.283); ctx.fill() }
        }
      }
      ctx.globalAlpha = 1
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size) }
  }, [fx])
  return <canvas ref={ref} className="xf-fx" aria-hidden />
}


type Fx2 = { e: number; on: boolean; edge: number }

/** Nốt nhạc và tia sáng nhỏ bay lên dọc mép màn ánh sáng khi chuyển sang cảnh hộp nhạc. */
function Notes({ fx }: { fx: React.MutableRefObject<Fx2> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    const calm = reducedMotion() || isLite()
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; g: number; ph: number }
    const ps: P[] = []
    let raf = 0, last = performance.now(), W = 0, H = 0
    const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight }
    size(); addEventListener('resize', size)
    const glyphs = ['♪', '♫', '✦', '♬', '✧']
    const frame = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      const f = fx.current
      ctx.clearRect(0, 0, W, H)
      if (f.on && !calm) {
        const inten = Math.sin(Math.PI * Math.min(1, Math.max(0, f.e)))
        const n = inten * 46 * dt
        for (let k = 0; k < n + (Math.random() < n % 1 ? 1 : 0); k++) {
          const y = H * (1 - f.edge) + (Math.random() - 0.5) * 24
          ps.push({ x: Math.random() * W, y, vx: (Math.random() - 0.5) * 24, vy: -(26 + Math.random() * 70), life: 0, max: 1.4 + Math.random() * 1.6, s: 9 + Math.random() * 15, g: Math.random() < 0.55 ? 1 : 0, ph: Math.random() * 6.28 })
        }
      }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.life += dt
        if (p.life > p.max) { ps.splice(i, 1); continue }
        p.x += (p.vx + Math.sin(t / 700 + p.ph) * 14) * dt; p.y += p.vy * dt
        const k = 1 - p.life / p.max
        ctx.globalAlpha = Math.min(1, k * 2) * 0.9
        ctx.shadowColor = 'rgba(255,200,100,.9)'; ctx.shadowBlur = 8
        if (p.g) { ctx.fillStyle = '#ffe9b0'; ctx.font = `${p.s}px serif`; ctx.fillText(glyphs[(i + (p.ph | 0)) % 5], p.x, p.y) }
        else { ctx.fillStyle = '#fff3c8'; ctx.beginPath(); ctx.arc(p.x, p.y, p.s * 0.12 * (0.7 + 0.5 * Math.sin(t / 110 + p.ph)), 0, 6.283); ctx.fill() }
      }
      ctx.globalAlpha = 1; ctx.shadowBlur = 0
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', size) }
  }, [fx])
  return <canvas ref={ref} className="xf-fx xf-notes" aria-hidden />
}

/**
 * Chuyển cảnh cây thông -> hai chú mèo, chạy theo thanh cuộn: cây thông phóng dần vào rồi tan thành ánh sáng,
 * một vòng kẹo Giáng sinh viền vàng loang ra từ giữa màn hình, kéo theo tuyết và những ngôi sao nhỏ, để lộ phòng của hai bé.
 */
export default function WorldScroll() {
  const wrap = useRef<HTMLDivElement>(null)
  const fx = useRef<Fx>({ p: 0, R: 0, cx: 0, cy: 0, on: false })
  const fx2 = useRef<Fx2>({ e: 0, on: false, edge: 0 })
  const prevP = useRef(0)
  const prevQ = useRef(0)
  const prevR = useRef(0)
  const flakeI = useRef(1)
  const flakeDraw = useRef<(r: number, i: number) => void>(() => {})
  const lenis = useRef<Lenis | null>(null)
  const [seen, setSeen] = useState({ tree: false, cats: false, near: false, box: true, snow: false, turned: false })

  useEffect(() => {
    const el = wrap.current!
    const calm = reducedMotion()
    let raf = 0
    const apply = () => {
      raf = 0
      const vh = innerHeight, vw = innerWidth
      const y = -el.getBoundingClientRect().top / vh // đã cuộn bao nhiêu màn hình
      // thứ tự: cảnh hộp nhạc (đứng yên HOLD0) -> màn ánh sáng vàng (q) -> cây thông (đứng yên HOLD) -> vòng kẹo (p) -> hai chú mèo
      const q = Math.min(1, Math.max(0, (y - HOLD0) / SPAN2))
      const p = Math.min(1, Math.max(0, (y - (HOLD0 + SPAN2 + HOLD)) / SPAN))
      const eq = ease(q)
      const e = ease(p)
      const r = Math.min(1, Math.max(0, (y - (Y_CATS + HOLD3)) / SPAN3))
      const er = ease(r)
      const st = el.style
      // chuyển cảnh kiểu lá thư (cây thông -> hai bé, hai bé -> ngắm tuyết): một lá thư bay tới, phóng lớn che kín màn hình, rồi bay vụt qua máy quay (phóng tiếp, mờ dần) để lộ cảnh mới. Không đóng mở thư.
      // lt chạy 0..1 theo thanh cuộn của lần chuyển đang diễn ra (hai lần chuyển không bao giờ chồng nhau).
      const lt = r > 0.003 ? r : p
      const a1 = ease(smooth(0, 0.42, lt)), a2 = ease(smooth(0.4, 0.64, lt)), a5 = ease(smooth(0.64, 1, lt))
      const NEXTR = 0.58 // lúc bông tuyết vừa che kín màn hình: đổi cảnh bên dưới (hai bé -> ngắm tuyết)
      const NEXT = 0.64 // lúc lá thư vừa che kín màn hình: đổi cảnh bên dưới
      // hai bé -> ngắm tuyết: một bông tuyết nhỏ giữa màn hình to dần, xoay nhẹ, che kín màn hình (cảnh bên dưới đổi lúc đó), rồi tan ra để lộ cảnh mới
      const flakeOn = r > 0.003 && r < 0.997 && !calm
      fx.current = { p: 0, R: 0, cx: 0, cy: 0, on: false }
      flakeDraw.current(flakeOn ? r : 0, flakeI.current)
      st.setProperty('--lv', lt > 0.003 && lt < 0.997 && !calm && r <= 0.003 ? 'visible' : 'hidden')
      st.setProperty('--lx', `${((1 - a1) * 62 - a5 * 5).toFixed(2)}vw`)
      st.setProperty('--ly', `${((1 - a1) * 44 - Math.sin(Math.PI * a1) * 16 - a5 * 9).toFixed(2)}vh`)
      st.setProperty('--lr', `${((1 - a1) * 24 - a5 * 9).toFixed(2)}deg`)
      st.setProperty('--ls', (0.17 + 0.07 * a1 + 0.82 * a2 + 2.6 * a5).toFixed(4))
      st.setProperty('--lo', (1 - smooth(0.72, 1, lt)).toFixed(3))
      st.setProperty('--lso', (1 - smooth(0.62, 0.8, lt)).toFixed(3))
      st.setProperty('--lsh', (1 - a2).toFixed(3))
      st.setProperty('--tz', '1')
      st.setProperty('--to', p < NEXT || calm && p < 0.5 ? '1' : '0')
      st.setProperty('--cz', '1')
      st.setProperty('--R', '9999px')
      st.setProperty('--D', '0px')
      st.setProperty('--ring', '0')
      st.setProperty('--bloom', String(Math.pow(Math.sin(Math.PI * smooth(0.1, 0.95, q)), 2) * 0.55))
      const catsOn = calm ? p > 0.5 && r < 0.5 : p >= NEXT && r < NEXTR
      const snowOn = calm ? r > 0.5 : r >= NEXTR
      st.setProperty('--cv', catsOn ? 'visible' : 'hidden')
      st.setProperty('--cpe', catsOn && p > 0.985 && r < 0.012 ? 'auto' : 'none')
      st.setProperty('--sv', snowOn ? 'visible' : 'hidden')
      st.setProperty('--spe', snowOn && r > 0.985 ? 'auto' : 'none')
      st.setProperty('--st', String(smooth(0.72, 0.95, r)))
      st.setProperty('--tv', q > 0.003 ? 'visible' : 'hidden')
      st.setProperty('--tpe', q > 0.985 && p < 0.012 ? 'auto' : 'none')
      st.setProperty('--tt', String(smooth(0.78, 0.97, q) * (1 - smooth(0.0, 0.2, p))))
      st.setProperty('--ct', String(smooth(0.8, 1, p) * (1 - smooth(0, 0.12, r))))
      // mũi tên cuộn: ở cảnh hộp nhạc và ở cảnh cây thông (lúc đứng yên)
      st.setProperty('--cue', String(Math.max(1 - smooth(0, 0.06, q), smooth(0.97, 1, q) * (1 - smooth(0, 0.06, p)), smooth(0.97, 1, p) * (1 - smooth(0, 0.06, r)))))
      // chuyển cảnh hộp nhạc -> cây thông: màn ánh sáng vàng (mặt nạ mềm) kéo từ dưới lên để lộ cây thông
      st.setProperty('--by', `${(-14 + 128 * eq).toFixed(2)}%`)
      st.setProperty('--bz', String(calm ? 1 : 1.1 - 0.1 * eq))
      st.setProperty('--bs', String(calm ? 1 : 1 + 0.07 * eq))
      st.setProperty('--bring', String(Math.min(1, Math.sin(Math.PI * q) * 2.4) * (q > 0.003 && q < 0.997 ? 1 : 0)))
      st.setProperty('--bpe', q < 0.02 ? 'auto' : 'none')
      st.setProperty('--bt', String(1 - smooth(0, 0.22, q)))
      fx2.current = { e: q, on: q > 0.003 && q < 0.997, edge: Math.min(1, Math.max(0, (-14 + 128 * eq - 7) / 100)) }
      sfx.stageBox(1 - smooth(0.2, 0.85, q))
      sfx.mix(smooth(0.5, 0.8, p))
      const pp = prevP.current; prevP.current = p
      if ((pp < 0.04 && p >= 0.04) || (pp > 0.96 && p <= 0.96)) sfx.chime()
      const rr0 = prevR.current; prevR.current = r
      if (rr0 < 0.003 && r >= 0.003) flakeI.current = (flakeI.current + 1 + Math.floor(Math.random() * (FLAKES.length - 1))) % FLAKES.length // mỗi lần chuyển cảnh một mẫu bông tuyết khác
      if ((rr0 < 0.04 && r >= 0.04) || (rr0 > 0.96 && r <= 0.96)) sfx.chime()
      const pq = prevQ.current; prevQ.current = q
      if ((pq < 0.04 && q >= 0.04) || (pq > 0.96 && q <= 0.96)) { sfx.chime(); sfx.sparkle() }
      setSeen((o) => { const n = { tree: q > 0.003 && p < 0.66, cats: p >= 0.6 && r < NEXTR + 0.04, near: p > 0.6, box: q < 0.995, snow: r >= NEXTR - 0.04, turned: r > 0.5 }; return o.tree === n.tree && o.cats === n.cats && o.near === n.near && o.box === n.box && o.snow === n.snow && o.turned === n.turned ? o : n })
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(apply) }
    // cuộn có quán tính (mượt như kéo bằng tay) trên máy tính; điện thoại giữ cuộn gốc của trình duyệt
    let lraf = 0
    if (!calm && matchMedia('(pointer: fine)').matches) {
      const l = new Lenis({ lerp: 0.085, wheelMultiplier: 0.85, smoothWheel: true })
      lenis.current = l
      const loop = (t: number) => { l.raf(t); lraf = requestAnimationFrame(loop) }
      lraf = requestAnimationFrame(loop)
    }
    // vệt sáng ấm theo con trỏ (chuột thật, tắt ở chế độ nhẹ): như cầm một ngọn nến soi quanh phòng
    const stick = el.querySelector('.xf-sticky') as HTMLElement | null
    let mr = 0, mx = 0, my = 0
    const mv = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mx = e.clientX; my = e.clientY
      if (!mr) mr = requestAnimationFrame(() => { mr = 0; stick?.style.setProperty('--mx', `${mx}px`); stick?.style.setProperty('--my', `${my}px`); stick?.style.setProperty('--mo', '1') })
    }
    const ml = () => stick?.style.setProperty('--mo', '0')
    if (!calm && matchMedia('(pointer: fine)').matches) { addEventListener('pointermove', mv, { passive: true }); document.documentElement.addEventListener('pointerleave', ml) }
    // điện thoại: sau khi ngừng vuốt, nếu đang lửng giữa hai cảnh thì tự trượt tới cảnh gần nhất cho gọn
    let snapT = 0
    const stopsAt = [0, HOLD0 + SPAN2 + 0.02, Y_CATS + 0.02, Y_SNOW + 0.02]
    const snap = () => {
      if (!matchMedia('(pointer: coarse)').matches) return
      const top = el.getBoundingClientRect().top, y = -top / innerHeight
      if (y < -0.05 || y > stopsAt[3] + 0.02) return
      let best = 0
      stopsAt.forEach((v, i) => { if (Math.abs(v - y) < Math.abs(stopsAt[best] - y)) best = i })
      if (Math.abs(stopsAt[best] - y) < 0.04 || Math.abs(stopsAt[best] - y) > 1.05) return
      scrollTo({ top: scrollY + (stopsAt[best] - y) * innerHeight, behavior: 'smooth' })
    }
    const onSnap = () => { clearTimeout(snapT); snapT = window.setTimeout(snap, 220) }
    addEventListener('scroll', onSnap, { passive: true })
    apply()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('scroll', onSnap); clearTimeout(snapT); removeEventListener('resize', on); cancelAnimationFrame(raf); cancelAnimationFrame(lraf); removeEventListener('pointermove', mv); document.documentElement.removeEventListener('pointerleave', ml); cancelAnimationFrame(mr); lenis.current?.destroy(); lenis.current = null }
  }, [])

  const goTo = (screens: number, instant = false) => {
    const top = (wrap.current?.getBoundingClientRect().top ?? 0) + scrollY + innerHeight * screens
    if (instant) { if (lenis.current) lenis.current.scrollTo(top, { immediate: true }); else scrollTo(0, top) }
    else if (lenis.current) lenis.current.scrollTo(top, { duration: 2.2, easing: (t) => 1 - Math.pow(1 - t, 3) })
    else scrollTo({ top, behavior: 'smooth' })
  }
  const down = (e: React.MouseEvent) => {
    e.preventDefault()
    const y = -(wrap.current?.getBoundingClientRect().top ?? 0) / innerHeight
    goTo(y > Y_CATS - 0.1 ? Y_SNOW + 0.02 : prevQ.current > 0.9 ? Y_CATS + 0.02 : HOLD0 + SPAN2 + 0.02)
  }
  /** Ba chấm bên phải: đi thẳng tới từng cảnh. */
  const stops: { label: string; at: number; on: boolean }[] = [
    { label: 'Hộp nhạc', at: 0, on: seen.box && !seen.tree },
    { label: 'Cây thông', at: HOLD0 + SPAN2 + 0.02, on: seen.tree && !seen.cats },
    { label: 'Bông và Mochi', at: Y_CATS + 0.02, on: seen.cats && !seen.turned },
    { label: 'Ngắm tuyết', at: Y_SNOW + 0.02, on: seen.turned },
  ]

  // bản xem thử: App gửi sự kiện nhảy thẳng tới một cảnh (0 hộp nhạc, 1 cây thông, 2 hai bé)
  const jump = useRef<(i: number, instant: boolean) => void>(() => {})
  jump.current = (i, instant) => goTo(stops[Math.min(3, Math.max(0, i))].at, instant)
  useEffect(() => {
    const h = (e: Event) => { const d = (e as CustomEvent<{ i: number; instant?: boolean }>).detail; jump.current(d.i, !!d.instant) }
    addEventListener('olcw:goto', h)
    return () => removeEventListener('olcw:goto', h)
  }, [])

  return (
    <>
    <div className="xf" ref={wrap} style={{ height: `${(1 + HOLD0 + SPAN2 + HOLD + SPAN + HOLD3 + SPAN3 + END) * 100}dvh` }}>
      <div className="xf-sticky" data-scene={seen.snow ? 'snow' : undefined}>
        <div className={`xf-layer xf-box${seen.box ? '' : ' idle'}`}><MusicBox active={seen.box} /></div>
        <div className={`xf-layer xf-tree${seen.tree ? '' : ' idle'}`}><Tree paused={!seen.tree} /></div>
        <div className={`xf-layer xf-cats${seen.cats ? '' : ' idle'}`}><Cats active={seen.cats} /></div>
        <div className={`xf-layer xf-snow${seen.snow ? '' : ' idle'}`}><SnowWatch active={seen.snow} /></div>
        {/* lá thư dùng chung cho hai lần chuyển cảnh: bay tới, phóng lớn che kín màn hình, rồi bay vụt qua máy quay để lộ cảnh mới */}
        {/* bông tuyết vector (chuyển cảnh hai bé -> ngắm tuyết): vẽ bằng canvas theo thanh cuộn, xem components/FlakeFx.tsx */}
        <FlakeFx reg={flakeDraw} />
        <div className="xf-letter" aria-hidden>
          <div className="xl-fly">
            <i className="xl-shadow" />
            <div className="xl-inside" />
            <div className="xl-body" />
            <div className="xl-flapw"><div className="xl-flap" /><b className="xl-seal">❦</b></div>
          </div>
        </div>
        <i className="xf-gold" aria-hidden />
        <i className="xf-glow" aria-hidden />
        <i className="xf-candy" aria-hidden />
        <i className="xf-bloom" aria-hidden />
        <Sparks fx={fx} />
        <Notes fx={fx2} />
        <nav className="xf-dots" aria-label="Các cảnh" style={{ ['--prog' as string]: Math.max(0, stops.findIndex((d) => d.on)) / (stops.length - 1) }}>
          {stops.map((d) => <button key={d.label} className={d.on ? 'on' : ''} aria-label={d.label} aria-current={d.on} onClick={() => goTo(d.at)}><span>{d.label}</span></button>)}
        </nav>
        <a className="scroll-cue" href="#cats" aria-label="Cuộn xuống cảnh kế tiếp" onClick={down}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </a>
      </div>
    </div>
    </>
  )
}
