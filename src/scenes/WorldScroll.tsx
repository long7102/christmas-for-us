import { useEffect, useRef, useState } from 'react'
import Tree from './Tree'
import Cats from './Cats'
import MusicBox from './MusicBox'
import { reducedMotion } from '../lib/device'
import { sfx } from '../lib/audio'

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
/** Quãng cuộn (tính theo chiều cao màn hình) để đi hết một lần chuyển cảnh: dài hơn thì chậm và mượt hơn. */
const SPAN = 1.7
const CY = 0.58
/** Chuyển cảnh thứ hai (mèo -> hộp nhạc): màn ánh sáng vàng kéo từ dưới lên, kéo theo nốt nhạc và tia sáng. */
const SPAN2 = 1.5
/** Dừng ngắm cảnh mèo trước khi chuyển (tính theo chiều cao màn hình) và đoạn nghỉ cuối cùng ở cảnh hộp nhạc. */
const HOLD = 0.45
const END = 0.5

type Fx = { p: number; R: number; cx: number; cy: number; on: boolean }

/** Lớp hạt Giáng sinh: tuyết rơi theo gió và tia sao vàng bắn ra từ mép vòng sáng. */
function Sparks({ fx }: { fx: React.MutableRefObject<Fx> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    const calm = reducedMotion()
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
        for (let k = 0; k < n + (Math.random() < n % 1 ? 1 : 0); k++) ps.push({ x: Math.random() * (W + 200) - 100, y: -10, vx: 30 + Math.random() * 50, vy: 60 + Math.random() * 110, life: 0, max: 99, s: 1.2 + Math.random() * 3, star: false, ph: Math.random() * 6.28 })
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
    const calm = reducedMotion()
    type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; s: number; g: number; ph: number }
    const ps: P[] = []
    let raf = 0, last = performance.now(), W = 0, H = 0
    const size = () => { W = cv.width = innerWidth; H = cv.height = innerHeight }
    size(); addEventListener('resize', size)
    const glyphs = ['♪', '♫', '♩', '♬']
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
        if (p.g) { ctx.fillStyle = '#ffe9b0'; ctx.font = `${p.s}px serif`; ctx.fillText(glyphs[(i + (p.ph | 0)) % 4], p.x, p.y) }
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
  const [seen, setSeen] = useState({ tree: true, cats: false, near: false, box: false })

  useEffect(() => {
    const el = wrap.current!
    const calm = reducedMotion()
    let raf = 0
    const apply = () => {
      raf = 0
      const vh = innerHeight, vw = innerWidth
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / (vh * SPAN)))
      const e = ease(p)
      const q = Math.min(1, Math.max(0, (-el.getBoundingClientRect().top - vh * (SPAN + HOLD)) / (vh * SPAN2)))
      const eq = ease(q)
      const R = e * 1.06 * Math.hypot(vw * 0.5, vh * Math.max(CY, 1 - CY))
      const st = el.style
      fx.current = { p, R, cx: vw / 2, cy: vh * CY, on: p > 0.003 && p < 0.997 }
      st.setProperty('--tz', String(calm ? 1 : 1 + 0.34 * e))
      st.setProperty('--to', String(1 - smooth(0.38, 0.88, p)))
      st.setProperty('--cz', String(calm ? 1 : 1.18 - 0.18 * e))
      st.setProperty('--R', `${R}px`)
      st.setProperty('--D', `${R * 2}px`)
      st.setProperty('--ring', String(Math.min(1, Math.sin(Math.PI * p) * 2.2) * (p > 0.003 ? 1 : 0)))
      st.setProperty('--bloom', String(Math.pow(Math.sin(Math.PI * smooth(0.1, 0.95, p)), 2) * 0.75))
      st.setProperty('--cv', p > 0.003 ? 'visible' : 'hidden')
      st.setProperty('--cpe', p > 0.985 && q < 0.02 ? 'auto' : 'none')
      st.setProperty('--tpe', p < 0.012 ? 'auto' : 'none')
      st.setProperty('--tt', String(1 - smooth(0.0, 0.16, p)))
      st.setProperty('--ct', String(smooth(0.78, 0.97, p) * (1 - smooth(0, 0.22, q))))
      st.setProperty('--cue', String(1 - smooth(0, 0.06, p)))
      const c2 = smooth(0.97, 1, p) * (1 - smooth(0, 0.05, q))
      st.setProperty('--cue2', String(c2)); st.setProperty('--cue2pe', c2 > 0.5 ? 'auto' : 'none')
      // chuyển cảnh thứ hai: màn ánh sáng vàng (mặt nạ mềm) kéo từ dưới lên để lộ cảnh hộp nhạc
      st.setProperty('--by', `${(-14 + 128 * eq).toFixed(2)}%`)
      st.setProperty('--bz', String(calm ? 1 : 1.1 - 0.1 * eq))
      st.setProperty('--cs', String(calm ? 1 : 1 + 0.07 * eq))
      st.setProperty('--bring', String(Math.min(1, Math.sin(Math.PI * q) * 2.4) * (q > 0.003 ? 1 : 0)))
      st.setProperty('--bv', q > 0.003 ? 'visible' : 'hidden')
      st.setProperty('--bpe', q > 0.985 ? 'auto' : 'none')
      st.setProperty('--bt', String(smooth(0.78, 0.97, q)))
      fx2.current = { e: q, on: q > 0.003 && q < 0.997, edge: Math.min(1, Math.max(0, (-14 + 128 * eq - 7) / 100)) }
      sfx.mix(smooth(0.2, 0.85, p))
      sfx.stageBox(smooth(0.2, 0.85, q))
      const pp = prevP.current; prevP.current = p
      if ((pp < 0.04 && p >= 0.04) || (pp > 0.96 && p <= 0.96)) sfx.chime()
      const pq = prevQ.current; prevQ.current = q
      if ((pq < 0.04 && q >= 0.04) || (pq > 0.96 && q <= 0.96)) sfx.sparkle()
      setSeen((o) => { const n = { tree: p < 0.75, cats: p > 0.003 && q < 0.995, near: p > 0.6, box: q > 0.003 }; return o.tree === n.tree && o.cats === n.cats && o.near === n.near && o.box === n.box ? o : n })
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(apply) }
    apply()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])

  const down = (e: React.MouseEvent) => {
    e.preventDefault()
    const top = (wrap.current?.getBoundingClientRect().top ?? 0) + scrollY
    scrollTo({ top: top + innerHeight * (prevP.current > 0.9 ? SPAN + HOLD + SPAN2 + 0.02 : SPAN + 0.02), behavior: 'smooth' })
  }

  return (
    <div className="xf" ref={wrap} style={{ height: `${(1 + SPAN + HOLD + SPAN2 + END) * 100}dvh` }}>
      <div className="xf-sticky">
        <div className="xf-layer xf-tree"><Tree paused={!seen.tree} /></div>
        <div className="xf-layer xf-cats"><Cats active={seen.cats} /></div>
        <div className="xf-layer xf-box"><MusicBox active={seen.box} /></div>
        <i className="xf-gold" aria-hidden />
        <i className="xf-glow" aria-hidden />
        <i className="xf-candy" aria-hidden />
        <i className="xf-bloom" aria-hidden />
        <Sparks fx={fx} />
        <Notes fx={fx2} />
        <a className="scroll-cue" href="#cats" aria-label="Cuộn xuống cảnh kế tiếp" onClick={down}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </a>
        <a className="scroll-cue cue2" href="#musicbox" aria-label="Cuộn xuống cảnh hộp nhạc" onClick={down}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </a>
      </div>
    </div>
  )
}
