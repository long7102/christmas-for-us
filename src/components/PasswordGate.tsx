import { useState, type FormEvent } from 'react'
import { sha256 } from '../lib/hash'
import { PASSWORD_HASH, content, ui } from '../content/content'
import { SnowParticles } from './SnowParticles'
import { Sketch, Doodle, Wave, type SketchStroke, type HatchSpec } from './Sketch'
import { store } from '../lib/storage'
import landSrc from '../assets/village-land.webp'
import portSrc from '../assets/village-port.webp'

const BULBS = Array.from({ length: 19 }, (_, i) => i)
const COLORS = ['#ff5a4d', '#ffd36b', '#5ed48a', '#7fc4ff', '#ffd36b']

function Holly() {
  return (
    <svg viewBox="0 0 80 80" className="gate-holly" aria-hidden>
      <g fill="#1f5a3a" stroke="#0d2e1d" strokeWidth="1">
        <path d="M8 52c8-22 26-30 46-26-6 6-6 16-20 24-8 4-18 4-26 2z" />
        <path d="M26 70c-2-20 6-36 24-46 2 8 8 14 2 28-4 10-14 18-26 18z" />
      </g>
      <g fill="#d7352b"><circle cx="22" cy="54" r="6" /><circle cx="32" cy="60" r="6" /><circle cx="28" cy="46" r="6" /></g>
      <g fill="#fff" opacity=".55"><circle cx="20" cy="52" r="1.6" /><circle cx="30" cy="58" r="1.6" /><circle cx="26" cy="44" r="1.6" /></g>
    </svg>
  )
}

/** Tuyết đọng trên mép trên của thẻ. */
function SnowCap() {
  return (
    <svg viewBox="0 0 400 36" preserveAspectRatio="none" className="gate-cap" aria-hidden>
      <defs><linearGradient id="gcap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset=".7" stopColor="#f1ece0" /><stop offset="1" stopColor="#d9dfe9" /></linearGradient></defs>
      <path fill="url(#gcap)" stroke="#aeb9cc" strokeWidth="1.3" vectorEffect="non-scaling-stroke" strokeLinejoin="round" d="M0 27V21Q8 11 20 15Q30 3 48 11Q62 0 80 10Q96 5 112 13Q130 1 150 10Q170 4 190 12Q210 0 232 9Q250 3 270 12Q290 1 312 10Q332 4 350 13Q372 7 386 15Q396 13 400 21V27Q392 33 380 28Q368 25 356 30Q344 34 330 28Q316 24 300 29Q286 33 270 28Q254 24 240 30Q226 34 210 28Q196 24 180 29Q166 33 150 28Q136 24 120 30Q106 34 90 28Q74 24 60 29Q44 33 30 28Q16 24 0 27Z" />
    </svg>
  )
}
function Keyhole({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="9.5" r="4.2" fill="currentColor" /><path d="M10.1 12.6 8.8 20.5h6.4l-1.3-7.9z" fill="currentColor" />
    </svg>
  )
}

const CARD_STROKES: SketchStroke[] = [
  { inset: 4, j: 1.8, w: 1.9, o: 0.95, seed: 3, delay: 0.2, dur: 2.4 },
  { inset: 10, j: 1.5, w: 1.1, o: 0.55, seed: 9, delay: 0.55, dur: 2.6 },
]
const CARD_HATCH = (w: number, h: number): HatchSpec[] => [
  { x: 24, y: h - 20, n: 6, len: 30, gap: 6, ang: -0.9 },
  { x: w - 24, y: 24, n: 6, len: 30, gap: 6, ang: 2.2 },
]
const MEDAL_STROKES: SketchStroke[] = [
  { inset: -7, j: 1.1, w: 1.5, o: 0.95, seed: 4, delay: 0.7, dur: 1.4 },
  { inset: -11, j: 1.5, w: 0.9, o: 0.5, seed: 5, delay: 0.95, dur: 1.5 },
]
const FIELD_STROKES: SketchStroke[] = [
  { inset: 0, j: 1.3, w: 1.6, o: 0.95, seed: 11, delay: 1.5, dur: 1.4 },
  { inset: -4, j: 1.6, w: 0.9, o: 0.5, seed: 12, delay: 1.7, dur: 1.5 },
]
const BTN_STROKES: SketchStroke[] = [
  { inset: -5, j: 1.4, w: 1.5, o: 0.9, seed: 21, delay: 1.9, dur: 1.4 },
  { inset: -9, j: 1.6, w: 0.9, o: 0.45, seed: 22, delay: 2.1, dur: 1.5 },
]

export function PasswordGate({ onPass }: { onPass: () => void }) {
  const [v, setV] = useState('')
  const [bad, setBad] = useState(false)
  const [leaving, setLeaving] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const ok = (await sha256(v.trim().toLowerCase())) === PASSWORD_HASH
    if (!ok) { setBad(true); return }
    store.set('unlocked', true)
    setLeaving(true)
    setTimeout(onPass, 1000)
  }

  return (
    <div className="gate" data-leaving={leaving}>
      <picture>
        <source media="(orientation: portrait)" srcSet={portSrc} />
        <img className="gate-bg" src={landSrc} alt="" draggable={false} />
      </picture>
      <div className="gate-veil" />
      <i className="gate-bloom" aria-hidden />
      <div className="gate-lights" aria-hidden>
        {BULBS.map((i) => (
          <i key={i} style={{ left: `${(i / (BULBS.length - 1)) * 100}%`, top: `${6 + Math.sin((i / (BULBS.length - 1)) * Math.PI * 2) * -7 + 14 * Math.sin((i / (BULBS.length - 1)) * Math.PI)}px`, ['--c' as string]: COLORS[i % COLORS.length], animationDelay: `${(i % 5) * -0.55}s` }} />
        ))}
      </div>
      <SnowParticles density={0.8} />
      <form onSubmit={submit} className={`gate-form gate-card${bad ? ' shake' : ''}`}>
        <i className="gate-halo" aria-hidden />
        <SnowCap />
        <Holly /><Holly />
        <Sketch className="sk-card" r={20} strokes={CARD_STROKES} hatch={CARD_HATCH} />
        <div className="gate-medal" aria-hidden><Sketch shape="circle" className="sk-medal" strokes={MEDAL_STROKES} /><Keyhole className="gate-medal-ico" /></div>
        <Doodle kind="star" size={13} seed={2} delay={1.1} className="gd gd-ml" />
        <Doodle kind="flake" size={13} seed={5} delay={1.25} className="gd gd-mr" />
        <h1 className="gate-title">{content.gate.title}</h1>
        <Wave className="gate-wave" delay={1.2} />
        <p className="gate-hint">{content.gate.hint}</p>
        <div className="gate-field">
          <Sketch shape="pill" className="sk-field" strokes={FIELD_STROKES} />
          <Keyhole className="gate-ico" />
          <input
            autoFocus
            type="password"
            autoComplete="off"
            value={v}
            onChange={(e) => { setV(e.target.value); setBad(false) }}
            aria-label="password"
            className="gate-input"
          />
        </div>
        <p className="gate-bad" style={{ opacity: bad ? 1 : 0 }}>{content.gate.wrong}</p>
        <span className="gate-btnwrap">
          <Sketch shape="pill" className="sk-btn" strokes={BTN_STROKES} />
          <button type="submit" className="btn-gold gate-btn">{ui.enter}</button>
        </span>
        <Doodle kind="heart" size={11} seed={8} delay={2.2} className="gd gd-bl" />
        <Doodle kind="spark" size={11} seed={9} delay={2.35} className="gd gd-br" />
        <Doodle kind="swirl" size={17} seed={3} delay={1.4} className="gd gd-out gd-o1" />
        <Doodle kind="flake" size={24} seed={7} delay={1.6} className="gd gd-out gd-o2" />
        <Doodle kind="star" size={20} seed={4} delay={1.8} className="gd gd-out gd-o3" />
        <Doodle kind="heart" size={20} seed={6} delay={2} className="gd gd-out gd-o4" />
        <Doodle kind="spark" size={15} seed={10} delay={2.2} className="gd gd-out gd-o5" />
      </form>
    </div>
  )
}
