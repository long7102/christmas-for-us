import { useState } from 'react'
import { SceneShell, Layer, useInView } from '../lib/scroll'
import { MaskTitle, HiddenReindeer, Whisper } from '../components/ui'
import { House, Pine, StarField, rng } from '../art/shapes'
import { content, show } from '../content/content'

const flakes = (() => { const r = rng(4); return Array.from({ length: 46 }, () => ({ x: 120 + r() * 360, y: 330 + r() * 70, dx: (r() - 0.5) * 120, d: r() * 1.5, s: 2 + r() * 2.4 })) })()

export default function SnowGlobe() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3)
  const [on, setOn] = useState(false)
  const [shake, setShake] = useState(0)
  const [say, setSay] = useState({ t: '', n: 0 })
  const talk = (t: string) => setSay((s) => ({ t, n: s.n + 1 }))
  const go = () => { setShake((n) => n + 1); setOn(true); setTimeout(() => talk(show(content.globeSecret)), 1800) }

  return (
    <SceneShell id="globe" len={2}>
      <Layer speed={0} zoom={0.04}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill">
          <rect width="1600" height="900" fill="#150f1a" />
          <circle cx="360" cy="360" r="260" fill="url(#gGlow)" opacity=".28" className="glow-pulse" />
          <circle cx="1260" cy="400" r="240" fill="url(#gGlow)" opacity=".2" className="glow-pulse" style={{ animationDelay: '-1.4s' }} />
          <rect y="640" width="1600" height="260" fill="url(#gWoodD)" />
          <path d="M0 640H1600" stroke="#c18a52" strokeOpacity=".4" strokeWidth="3" />
          {[[330, 540], [1270, 560]].map(([x, y]) => <g key={x}><rect x={x - 14} y={y} width="28" height="100" rx="4" fill="url(#gCream)" /><path className="flicker" d={`M${x} ${y - 4}Q${x - 12} ${y - 20} ${x} ${y - 44}Q${x + 12} ${y - 20} ${x} ${y - 4}Z`} fill="#ffd35a" /></g>)}
          <StarField n={40} seed={31} maxY={0.35} />
        </svg>
      </Layer>

      <div ref={ref} className="scene-copy top" style={{ top: 'clamp(64px, 11svh, 110px)' }}>
        <MaskTitle show={seen} lines={['Quả cầu tuyết']} />
        <p className={`sub reveal ${seen ? 'in' : ''}`} style={{ ['--i' as string]: 3 }}>Lắc nhẹ xem điều gì ở bên trong</p>
      </div>

      <Layer speed={-3} zoom={0.1} className="set-layer">
        <svg viewBox="0 0 600 640" className="set globe-set">
          <ellipse cx="300" cy="610" rx="210" ry="16" fill="#000" opacity=".4" />
          <g key={shake} className={`globe ${shake ? 'shaking' : ''} ${on ? 'active' : ''}`} onClick={go} role="button" aria-label="Quả cầu tuyết" style={{ cursor: 'pointer' }}>
            <clipPath id="gc"><circle cx="300" cy="260" r="205" /></clipPath>
            <circle cx="300" cy="260" r="205" fill="#0b1a2e" />
            <g clipPath="url(#gc)">
              <rect x="95" y="55" width="410" height="410" fill="url(#gNight)" />
              <StarField w={600} h={300} n={26} seed={13} maxY={0.9} />
              <circle cx="400" cy="120" r="24" fill="url(#gMoon)" />
              <path d="M95 360Q200 320 300 345T505 335V470H95Z" fill="url(#gHill)" />
              <Pine x={160} y={372} s={0.5} /><Pine x={440} y={370} s={0.6} /><Pine x={210} y={385} s={0.35} />
              <House x={230} y={380} w={90} h={60} wall="#8a4a36" roof="#33444f" windows={2} lit={on} smoke={false} />
              <House x={335} y={385} w={70} h={52} wall="#5c6f7f" roof="#7a1f2b" windows={1} lit={on} smoke={false} />
              {flakes.map((f, i) => <circle key={i} className="gflake" cx={f.x} cy={f.y} r={f.s * 0.6} fill="#fff" style={{ ['--dx' as string]: `${f.dx}px`, animationDelay: `${f.d}s` }} />)}
            </g>
            <circle cx="300" cy="260" r="205" fill="none" stroke="#d8ecff" strokeOpacity=".5" strokeWidth="3" />
            <path d="M160 140Q190 90 250 74" stroke="#fff" strokeOpacity=".6" strokeWidth="9" strokeLinecap="round" fill="none" />
            <circle cx="420" cy="380" r="10" fill="#fff" opacity=".18" />
          </g>
          <path d="M120 470Q300 520 480 470L510 570Q300 630 90 570Z" fill="url(#gWood)" />
          <path d="M120 470Q300 520 480 470" stroke="#c18a52" strokeWidth="3" fill="none" />
          <path d="M96 548Q300 604 504 548" stroke="url(#gGold)" strokeWidth="5" fill="none" />
        </svg>
      </Layer>
      <Whisper text={say.t} nonce={say.n} />
      <HiddenReindeer n={5} style={{ left: '7%', top: '60%' }} say={talk} />
    </SceneShell>
  )
}
