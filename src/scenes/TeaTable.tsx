import { useEffect, useState } from 'react'
import { SceneShell, Layer, useInView } from '../lib/scroll'
import { MaskTitle, HiddenReindeer, Modal, Whisper } from '../components/ui'
import { Pine, StarField } from '../art/shapes'
import { content, show, TODO_LONG } from '../content/content'

function Steam({ x, y, strong }: { x: number; y: number; strong: boolean }) {
  return (
    <g className={`steam ${strong ? 'strong' : ''}`} transform={`translate(${x} ${y})`}>
      {[0, 1, 2].map((i) => <path key={i} className="steam-p" d={`M${i * 14 - 14} 0Q${i * 14 - 24} -18 ${i * 14 - 14} -34T${i * 14 - 14} -68`} style={{ animationDelay: `${i * 0.9}s` }} />)}
    </g>
  )
}

function Cup({ x, y, flip = false }: { x: number; y: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${flip ? -1 : 1} 1)`}>
      <ellipse cx="0" cy="40" rx="48" ry="9" fill="#e9dcc0" />
      <path d="M-34 -6Q-34 38 0 38T34 -6Z" fill="url(#gCream)" />
      <path d="M34 4Q60 4 54 22Q50 32 30 28" stroke="#e8d6ae" strokeWidth="7" fill="none" strokeLinecap="round" />
      <ellipse cx="0" cy="-6" rx="34" ry="9" fill="#e8d6ae" />
      <ellipse cx="0" cy="-5" rx="29" ry="7" fill="#5a2f1a" />
      <circle cx="-8" cy="-7" r="4" fill="#fff" opacity=".9" /><circle cx="6" cy="-6" r="3.4" fill="#fff" opacity=".9" />
      <path d="M-34 14Q0 24 34 14" stroke="#c63a48" strokeWidth="4" fill="none" />
    </g>
  )
}

export default function TeaTable() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3)
  const [say, setSay] = useState({ t: '', n: 0 })
  const [boost, setBoost] = useState(false)
  const [lift, setLift] = useState(false)
  const [pour, setPour] = useState(false)
  const [letter, setLetter] = useState(false)
  const talk = (t: string) => setSay((s) => ({ t, n: s.n + 1 }))

  const cocoa = () => { setBoost(true); talk(show(content.cocoa)); setTimeout(() => setBoost(false), 5000) }
  const cookie = () => { if (lift) return; setLift(true); talk(show(content.cookie)); setTimeout(() => setLift(false), 3200) }
  const teapot = () => { if (pour) return; setPour(true); setBoost(true); setTimeout(() => { setPour(false); setBoost(false) }, 4200) }

  return (
    <SceneShell id="tea" len={2}>
      <Layer speed={0} zoom={0.05}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill">
          <rect width="1600" height="900" fill="#4a2d1e" />
          {Array.from({ length: 20 }, (_, i) => <path key={i} d={`M${i * 84} 0V680`} stroke="#2e190f" strokeWidth="3" opacity=".6" />)}
          <rect y="660" width="1600" height="240" fill="url(#gWoodD)" />
          {/* window with moonlight */}
          <g transform="translate(940 110)">
            <path d="M-30 300L-300 620H500L330 300Z" fill="#9fc0ff" opacity=".07" />
            <rect x="-18" y="-18" width="436" height="436" rx="8" fill="#6b4326" />
            <rect width="400" height="400" fill="url(#gNight)" />
            <clipPath id="tw"><rect width="400" height="400" /></clipPath>
            <g clipPath="url(#tw)">
              <StarField w={400} h={400} n={24} seed={5} maxY={0.55} />
              <circle cx="300" cy="90" r="30" fill="url(#gMoon)" />
              <path d="M0 330Q100 290 200 320T400 300V400H0Z" fill="url(#gHill)" />
              {[40, 130, 330, 250].map((x, i) => <Pine key={x} x={x} y={340 + (i % 2) * 14} s={0.5 + (i % 3) * 0.15} />)}
              {Array.from({ length: 26 }, (_, i) => <circle key={i} className="snowfall" cx={(i * 47) % 400} cy={-10} r={1.3 + (i % 3) * 0.8} fill="#fff" style={{ animationDelay: `${(i * 0.45) % 7}s`, animationDuration: `${5 + (i % 5)}s` }} />)}
            </g>
            <path d="M200 0V400M0 200H400" stroke="#6b4326" strokeWidth="10" />
            <rect x="-28" y="404" width="456" height="16" rx="3" fill="#5a3920" />
            {[40, 330].map((x) => <circle key={x} cx={x} cy="420" r="6" fill="#c63a48" />)}
          </g>
          {/* fireplace */}
          <g transform="translate(110 380)">
            <rect x="-30" y="-26" width="420" height="26" rx="4" fill="#5a3920" />
            <rect width="360" height="280" fill="url(#gStone)" />
            {[0, 1, 2, 3, 4].map((r) => <path key={r} d={`M0 ${r * 56}H360`} stroke="#4b535c" strokeWidth="2" opacity=".6" />)}
            <path d="M70 280V110Q70 62 180 62T290 110V280Z" fill="#150b07" />
            <circle cx="180" cy="210" r="170" fill="url(#gGlow)" className="glow-pulse" />
            <g className="flicker"><path d="M180 270Q120 235 150 178Q150 215 180 188Q170 140 200 112Q215 168 235 188Q250 224 210 270Z" fill="#ff8a2a" /></g>
            <g className="flicker" style={{ animationDelay: '-.6s' }}><path d="M180 270Q150 244 168 212Q175 234 188 224Q192 198 204 184Q214 224 222 240Q226 260 200 270Z" fill="#ffd35a" /></g>
            <path d="M120 272l90 -12M130 260l90 12" stroke="#4a2f1c" strokeWidth="12" strokeLinecap="round" />
            {[[40, '#c63a48'], [170, '#2f7a58'], [300, '#d99a3e']].map(([x, c]) => (
              <g key={x as number} transform={`translate(${x} -26)`}><path d="M0 0h22l-5 36q-2 12 -14 12q-8 0 -8 -10Z" fill={c as string} /><rect width="22" height="8" fill="#fff" /></g>
            ))}
          </g>
          <path d="M0 60Q400 140 800 80T1600 100" stroke="#1d5a41" strokeWidth="16" fill="none" />
          {Array.from({ length: 22 }, (_, i) => <circle key={i} className="glow-pulse" cx={i * 76 + 14} cy={74 + Math.sin(i * 0.75) * 26} r="5" fill={['#ffd27a', '#ff6a6a', '#8ae0ff'][i % 3]} style={{ animationDelay: `${i * 0.23}s` }} />)}
        </svg>
      </Layer>

      <div ref={ref} className="scene-copy top" style={{ top: 'clamp(64px, 12svh, 120px)' }}>
        <MaskTitle show={seen} lines={['Một chiều bên lò sưởi']} />
        <p className={`sub reveal ${seen ? 'in' : ''}`} style={{ ['--i' as string]: 3 }}>Chạm vào những thứ đang lấp lánh</p>
      </div>

      <Layer speed={-5} zoom={0.14} className="set-layer">
        <svg viewBox="0 0 900 540" className="set">
          <ellipse cx="450" cy="520" rx="420" ry="16" fill="#000" opacity=".3" />
          {/* table + cloth */}
          <path d="M30 330Q450 290 870 330L900 360V520H0V360Z" fill="url(#gWood)" />
          <path d="M20 340Q450 300 880 340L860 500Q450 536 40 500Z" fill="url(#gCloth)" />
          {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M${60 + i * 58} ${330 + Math.sin(i) * 2}L${52 + i * 58} 510`} stroke="#f1e3c4" strokeOpacity=".35" strokeWidth="5" />)}
          {[380, 420, 460].map((y) => <path key={y} d={`M30 ${y}Q450 ${y + 20} 870 ${y}`} stroke="#f1e3c4" strokeOpacity=".3" strokeWidth="5" fill="none" />)}
          <path d="M30 322Q450 282 870 322L866 346Q450 306 34 346Z" fill="url(#gCloth)" />
          <path d="M30 322Q450 282 870 322" stroke="#e86a78" strokeWidth="2" fill="none" opacity=".6" />
          {Array.from({ length: 22 }, (_, i) => <path key={i} d={`M${34 + i * 38} ${338 - Math.sin(i * 0.44) * 18}v14`} stroke="#f1e3c4" strokeWidth="2" opacity=".6" />)}

          {/* plate of pastries */}
          <ellipse cx="470" cy="332" rx="86" ry="18" fill="#e9dcc0" /><ellipse cx="470" cy="328" rx="74" ry="13" fill="#fff6e0" />
          {[[430, 318, '#d99a3e'], [470, 312, '#e8b45a'], [510, 318, '#c98a31']].map(([x, y, c]) => <g key={x as number}><ellipse cx={x as number} cy={y as number} rx="22" ry="10" fill={c as string} /><path d={`M${(x as number) - 14} ${(y as number) - 3}h28`} stroke="#fff" strokeOpacity=".7" strokeWidth="2" /></g>)}

          {/* candle */}
          <g transform="translate(690 190)">
            <circle cx="0" cy="-10" r="60" fill="url(#gGlow)" className="glow-pulse" />
            <rect x="-14" y="0" width="28" height="118" rx="4" fill="url(#gCream)" />
            <ellipse cx="0" cy="0" rx="14" ry="4" fill="#fff6e0" />
            <path className="flicker" d="M0 -6Q-12 -22 0 -44Q12 -22 0 -6Z" fill="#ffd35a" />
            <ellipse cx="0" cy="118" rx="38" ry="9" fill="#c98a31" />
            <path d="M-32 120Q-6 90 -2 96Q6 80 30 118Z" fill="#2f7a58" /><circle cx="-14" cy="106" r="5" fill="#d2404f" />
          </g>

          {/* teapot */}
          <g className="tappable" onClick={teapot} role="button" aria-label="Ấm trà">
            <g style={{ transformOrigin: '210px 300px', transform: pour ? 'rotate(-18deg) translateY(-8px)' : 'none', transition: 'transform 1s var(--ease-mask)' }}>
              <ellipse cx="190" cy="318" rx="76" ry="12" fill="#000" opacity=".25" />
              <path d="M120 250Q116 318 190 318T260 250Z" fill="url(#gCream)" />
              <path d="M120 250Q190 214 260 250" fill="#e8d6ae" />
              <path d="M255 262Q300 252 296 224L276 232" stroke="#e8d6ae" strokeWidth="9" fill="none" strokeLinecap="round" />
              <path d="M122 264Q86 262 82 232Q96 244 124 246" stroke="#f3e7cd" strokeWidth="14" fill="none" strokeLinecap="round" />
              <path d="M150 232Q190 206 230 232" fill="#fff6e0" /><circle cx="190" cy="210" r="9" fill="#d99a3e" />
              <path d="M130 284Q190 298 252 284" stroke="#c63a48" strokeWidth="5" fill="none" /><circle cx="190" cy="278" r="4" fill="#2f7a58" />
            </g>
            {pour && <path className="pour" d="M310 220Q326 262 322 300" stroke="#c0762f" strokeWidth="6" fill="none" strokeLinecap="round" />}
            <rect x="110" y="200" width="200" height="130" fill="transparent" />
          </g>

          {/* cups */}
          <g className="tappable" onClick={cocoa} role="button" aria-label="Cốc ca cao">
            <Cup x={320} y={322} /><Cup x={595} y={330} flip />
            <Steam x={320} y={300} strong={boost} /><Steam x={595} y={308} strong={boost} />
            <rect x="272" y="260" width="100" height="100" fill="transparent" /><rect x="545" y="268" width="100" height="100" fill="transparent" />
          </g>

          {/* gingerbread */}
          <g className="tappable" onClick={cookie} role="button" aria-label="Bánh gừng">
            <g style={{ transformOrigin: '760px 330px', transform: lift ? 'translateY(-70px) rotate(14deg) scale(1.25)' : 'none', transition: 'transform 1s var(--ease-mask)' }}>
              <g transform="translate(760 290)" fill="#b9753d" stroke="#8a5224" strokeWidth="2" strokeLinejoin="round">
                <circle cx="0" cy="0" r="14" />
                <path d="M-12 12Q0 18 12 12L30 20L33 34L16 30L16 52L5 52L0 42L-5 52L-16 52L-16 30L-33 34L-30 20Z" />
                <g stroke="#fff" strokeWidth="2.4" strokeLinecap="round" fill="none"><path d="M-7 2Q0 8 7 2M-30 26L-22 24M30 26L22 24M-14 48h6M8 48h6" /></g>
                <circle cx="-4.5" cy="-3" r="1.6" fill="#3a2012" stroke="none" /><circle cx="4.5" cy="-3" r="1.6" fill="#3a2012" stroke="none" />
                <circle cy="24" r="3" fill="#d2404f" stroke="none" /><circle cy="35" r="3" fill="#d2404f" stroke="none" />
              </g>
            </g>
            <rect x="715" y="270" width="90" height="100" fill="transparent" />
          </g>

          {/* letter */}
          <g className="tappable letter-glow" onClick={() => setLetter(true)} role="button" aria-label="Lá thư" transform="translate(70 360) rotate(-8)">
            <rect x="0" y="0" width="120" height="78" rx="4" fill="url(#gCream)" stroke="#d6c392" />
            <path d="M0 0L60 44L120 0" fill="none" stroke="#d6c392" strokeWidth="2" /><path d="M0 78L48 38M120 78L72 38" stroke="#d6c392" strokeWidth="1.5" />
            <circle cx="60" cy="42" r="12" fill="url(#gRed)" /><path d="M54 42l4 4l8-8" stroke="#ffd7d7" strokeWidth="2" fill="none" />
          </g>
        </svg>
      </Layer>

      <Whisper text={say.t} nonce={say.n} />
      <HiddenReindeer n={3} style={{ right: '5%', top: '36%' }} say={talk} />
      {letter && <LetterModal onClose={() => setLetter(false)} />}
    </SceneShell>
  )
}

function LetterModal({ onClose }: { onClose: () => void }) {
  const raw = content.letter === TODO_LONG ? show(content.letter) : content.letter
  const lines = raw.split('\n').filter(Boolean)
  const [n, setN] = useState(0)
  useEffect(() => {
    if (n >= lines.length) return
    const t = setTimeout(() => setN((x) => x + 1), 900)
    return () => clearTimeout(t)
  }, [n, lines.length])
  return (
    <Modal onClose={onClose}>
      <div className="paper">
        {lines.map((l, i) => <p key={i} className={`hand ${i < n ? 'on' : ''}`}>{l}</p>)}
      </div>
    </Modal>
  )
}
