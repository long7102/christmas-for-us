import { useState, type FormEvent } from 'react'
import { sha256 } from '../lib/hash'
import { PASSWORD_HASH, content, ui } from '../content/content'
import { SnowParticles } from './SnowParticles'
import { Sketch, Doodle, Flourish, type SketchStroke, type HatchSpec } from './Sketch'
import { SnowCap, Holly } from './Winter'
import { store } from '../lib/storage'
import landSrc from '../assets/village-land.webp'
import portSrc from '../assets/village-port.webp'

const BULBS = Array.from({ length: 19 }, (_, i) => i)
const COLORS = ['#ff5a4d', '#ffd36b', '#5ed48a', '#7fc4ff', '#ffd36b']

function Keyhole({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <circle cx="12" cy="9.5" r="4.2" fill="currentColor" /><path d="M10.1 12.6 8.8 20.5h6.4l-1.3-7.9z" fill="currentColor" />
    </svg>
  )
}

const CARD_STROKES: SketchStroke[] = [
  { inset: 4, j: 1.8, w: 3.2, o: 0.95, seed: 3, delay: 0.2, dur: 2.4 },
  { inset: 10, j: 1.5, w: 1.8, o: 0.6, seed: 9, delay: 0.55, dur: 2.6 },
]
const CARD_HATCH = (w: number, h: number): HatchSpec[] => [
  { x: 24, y: h - 20, n: 6, len: 30, gap: 6, ang: -0.9 },
]
const MEDAL_STROKES: SketchStroke[] = [
  { inset: -7, j: 1.1, w: 2.6, o: 0.95, seed: 4, delay: 0.7, dur: 1.4 },
  { inset: -11, j: 1.5, w: 1.5, o: 0.55, seed: 5, delay: 0.95, dur: 1.5 },
]
const FIELD_STROKES: SketchStroke[] = [
  { inset: 0, j: 1.3, w: 2.8, o: 0.95, seed: 11, delay: 1.5, dur: 1.4 },
  { inset: -4, j: 1.6, w: 1.5, o: 0.55, seed: 12, delay: 1.7, dur: 1.5 },
]
const BTN_STROKES: SketchStroke[] = [
  { inset: -5, j: 1.4, w: 2.6, o: 0.9, seed: 21, delay: 1.9, dur: 1.4 },
  { inset: -9, j: 1.6, w: 1.5, o: 0.5, seed: 22, delay: 2.1, dur: 1.5 },
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
        <Holly /><Holly flip />
        <Sketch className="sk-card" r={20} strokes={CARD_STROKES} hatch={CARD_HATCH} />
        <div className="gate-medal" aria-hidden><Sketch shape="circle" className="sk-medal" strokes={MEDAL_STROKES} /><Keyhole className="gate-medal-ico" /></div>
        <Doodle kind="compass" size={24} seed={2} delay={1.1} className="gd gd-ml" />
        <Doodle kind="sprig" size={24} seed={5} delay={1.25} className="gd gd-mr" />
        <h1 className="gate-title">{content.gate.title}</h1>
        <Flourish className="gate-wave" delay={1.2} />
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
        <Doodle kind="scroll" size={30} seed={8} delay={2.2} className="gd gd-bl" />
        <Doodle kind="scroll" size={30} seed={9} delay={2.35} className="gd gd-br" />
        <Doodle kind="sprig" size={44} seed={3} delay={1.4} className="gd gd-out gd-o1" />
        <Doodle kind="key" size={50} seed={7} delay={1.6} className="gd gd-out gd-o2" />
        <Doodle kind="compass" size={40} seed={4} delay={1.8} className="gd gd-out gd-o3" />
        <Doodle kind="key" size={46} seed={6} delay={2} className="gd gd-out gd-o4" />
        <Doodle kind="sprig" size={40} seed={10} delay={2.2} className="gd gd-out gd-o5" />
      </form>
    </div>
  )
}
