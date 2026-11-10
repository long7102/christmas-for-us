import { useState, type FormEvent } from 'react'
import { sha256 } from '../lib/hash'
import { PASSWORD_HASH, content, ui } from '../content/content'
import { SnowParticles } from './SnowParticles'
import { store } from '../lib/storage'

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
      <div className="gate-sky" />
      <SnowParticles density={0.8} />
      <form onSubmit={submit} className="gate-form">
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
