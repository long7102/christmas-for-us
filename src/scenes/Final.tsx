import { useState } from 'react'
import { SceneShell, useProgress } from '../lib/scroll'
import { SnowParticles } from '../components/SnowParticles'
import { Whisper } from '../components/ui'
import { StarField, Pine } from '../art/shapes'
import CoupleArt from '../art/CoupleArt'
import { store } from '../lib/storage'

const sm = (p: number, a: number, b: number) => { const t = Math.min(1, Math.max(0, (p - a) / (b - a))); return t * t * (3 - 2 * t) }

function Inner() {
  const [p, setP] = useState(0)
  const [say, setSay] = useState({ t: '', n: 0 })
  useProgress((v) => setP((o) => (Math.abs(o - v) > 0.006 ? v : o)))
  const wishes = store.get<{ t: string; x: number; y: number }[]>('wishes', [])
  const cam = 1.55 - 0.55 * sm(p, 0, 0.85)
  const starsOp = 0.3 + 0.7 * sm(p, 0.22, 0.55)
  const b = sm(p, 0.55, 0.66)

  return (
    <>
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill">
        <rect width="1600" height="900" fill="url(#gNight)" />
        <ellipse cx="800" cy="200" rx="700" ry="200" fill="#2fb98a" opacity={0.08 * starsOp} filter="url(#fBlur)" />
        <g opacity={starsOp}><StarField n={230} seed={77} maxY={0.85} /></g>
        <circle cx="1300" cy="170" r="150" fill="url(#gMoonGlow)" opacity={starsOp} /><circle cx="1300" cy="170" r="40" fill="url(#gMoon)" opacity={starsOp} />
      </svg>
      {p > 0.4 && p < 0.58 && <div key="shoot" className="shoot" aria-hidden="true" />}
      <div className="fill" style={{ opacity: 0.8 }}><SnowParticles density={0.6} /></div>

      {wishes.map((w, i) => (
        <button key={i} className="wish-star" style={{ left: `${w.x}%`, top: `${w.y}%`, opacity: sm(p, 0.45, 0.7) }} onClick={() => setSay((s) => ({ t: w.t, n: s.n + 1 }))} aria-label="Điều ước">★</button>
      ))}

      <div className="final-cam" style={{ transform: `scale(${cam})` }}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMax slice" className="fill">
          <path d="M0 650Q300 590 600 640T1200 620T1600 650V900H0Z" fill="#9bb3cc" opacity=".6" />
          {[100, 260, 420, 1180, 1340, 1500].map((x, i) => <Pine key={x} x={x} y={660 + (i % 2) * 14} s={0.7 + (i % 3) * 0.15} fill="url(#gPine2)" />)}
          <path d="M0 720Q400 640 800 700T1600 680V900H0Z" fill="url(#gHill)" />
        </svg>
        <div className="couple-wrap">
          <div style={{ opacity: 1 - b }}><CoupleArt /></div>
          <div style={{ opacity: b, position: 'absolute', inset: 0 }}><CoupleArt pointing /></div>
        </div>
      </div>

      <div className="final-text">
        <p className={`ft1 ${p > 0.72 ? 'in' : ''}`}>Ở đâu đó dưới bầu trời này, luôn có một chút phép màu Giáng sinh đang đợi em.</p>
        <p className={`ft2 ${p > 0.86 ? 'in' : ''}`}>Giáng sinh vui vẻ, Khánh Hạ. ❤️</p>
      </div>
      <Whisper text={say.t} nonce={say.n} />
    </>
  )
}

export default function Final() {
  return <SceneShell id="final" len={4}><Inner /></SceneShell>
}
