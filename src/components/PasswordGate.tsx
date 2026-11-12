import { useState, type FormEvent } from 'react'
import { sha256 } from '../lib/hash'
import { PASSWORD_HASH, content, ui } from '../content/content'
import { SnowParticles } from './SnowParticles'
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
    setTimeout(onPass, 900)
  }

  return (
    <div className="gate" data-leaving={leaving}>
      <picture>
        <source media="(orientation: portrait)" srcSet={portSrc} />
        <img className="gate-bg" src={landSrc} alt="" draggable={false} />
      </picture>
      <div className="gate-veil" />
      <div className="gate-lights" aria-hidden>
        {BULBS.map((i) => (
          <i key={i} style={{ left: `${(i / (BULBS.length - 1)) * 100}%`, top: `${6 + Math.sin((i / (BULBS.length - 1)) * Math.PI * 2) * -7 + 14 * Math.sin((i / (BULBS.length - 1)) * Math.PI)}px`, ['--c' as string]: COLORS[i % COLORS.length], animationDelay: `${(i % 5) * -0.55}s` }} />
        ))}
      </div>
      <SnowParticles density={0.8} />
      <form onSubmit={submit} className={`gate-form gate-card${bad ? ' shake' : ''}`}>
        <Holly /><Holly />
        <div className="gate-star" aria-hidden>✦</div>
        <h1 className="gate-title">{content.gate.title}</h1>
        <p className="gate-hint">{content.gate.hint}</p>
        <input
          autoFocus
          type="password"
          autoComplete="off"
          value={v}
          onChange={(e) => { setV(e.target.value); setBad(false) }}
          aria-label="password"
          className="gate-input"
        />
        <p className="gate-bad" style={{ opacity: bad ? 1 : 0 }}>{content.gate.wrong}</p>
        <button type="submit" className="btn-gold">{ui.enter}</button>
      </form>
    </div>
  )
}
