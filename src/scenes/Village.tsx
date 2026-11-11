import { SceneShell, Layer, useInView } from '../lib/scroll'
import { SnowParticles } from '../components/SnowParticles'
import { MaskTitle, ScrollHint } from '../components/ui'
import { House, Pine, StarField } from '../art/shapes'
import { HER_NAME } from '../content/content'

const houses = [
  { x: 120, y: 700, w: 170, h: 120, wall: '#7a4330', roof: '#3a2536', windows: 2 },
  { x: 340, y: 720, w: 130, h: 100, wall: '#5c6f7f', roof: '#7a1f2b', windows: 1 },
  { x: 640, y: 690, w: 210, h: 150, wall: '#8a4a36', roof: '#2f2a3d', windows: 3 },
  { x: 960, y: 715, w: 150, h: 110, wall: '#6a5a44', roof: '#7a1f2b', windows: 2 },
  { x: 1180, y: 695, w: 190, h: 135, wall: '#5a3a4a', roof: '#33444f', windows: 2 },
  { x: 1420, y: 725, w: 120, h: 95, wall: '#7a4330', roof: '#3a2536', windows: 1 },
]

export default function Village() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3)
  return (
    <SceneShell id="village" len={2}>
      <Layer speed={0} zoom={0.04}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill">
          <rect width="1600" height="900" fill="url(#gNight)" />
          <ellipse cx="1180" cy="170" rx="330" ry="210" fill="#2fb98a" opacity=".1" filter="url(#fBlur)" />
          <ellipse cx="560" cy="130" rx="400" ry="130" fill="#6a4fc7" opacity=".1" filter="url(#fBlur)" />
          <StarField n={110} seed={7} />
          <circle cx="1240" cy="190" r="190" fill="url(#gMoonGlow)" />
          <circle cx="1240" cy="190" r="62" fill="url(#gMoon)" />
          <path d="M0 560L170 430L300 520L470 380L650 540L820 420L1000 540L1180 400L1360 520L1480 440L1600 500V900H0Z" fill="#17304c" />
          <path d="M0 620L220 500L380 590L560 480L760 600L960 500L1160 600L1360 510L1600 600V900H0Z" fill="#20436a" />
        </svg>
      </Layer>

      <Layer speed={8} zoom={0.1}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill">
          <path d="M0 700Q260 640 520 690T1040 670T1600 690V900H0Z" fill="url(#gHill)" />
          {[60, 300, 560, 880, 1130, 1380, 1550].map((x, i) => <Pine key={x} x={x} y={705 + (i % 3) * 8} s={0.55 + (i % 3) * 0.12} />)}
          {houses.map((h) => <House key={h.x} {...h} />)}
          <path d="M0 790Q400 720 800 760T1600 740V900H0Z" fill="url(#gSnow)" />
          <path d="M700 900Q760 800 820 760Q880 800 940 900Z" fill="#dce9f6" opacity=".7" />
        </svg>
      </Layer>

      <div className="fill"><SnowParticles density={1.1} /></div>

      <Layer speed={22} zoom={0.22}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill" style={{ filter: 'blur(1.2px)' }}>
          <Pine x={60} y={960} s={2.6} fill="url(#gPine2)" />
          <Pine x={250} y={990} s={1.9} fill="url(#gPine2)" />
          <Pine x={1560} y={960} s={2.8} fill="url(#gPine2)" />
          <Pine x={1380} y={990} s={2} fill="url(#gPine2)" />
        </svg>
      </Layer>

      <div ref={ref} className="scene-copy top">
        <p className={`eyebrow reveal ${seen ? 'in' : ''}`}>Giáng sinh · 2026</p>
        <MaskTitle show={seen} lines={['Chào mừng em đến với', 'thế giới Giáng sinh nhỏ', `của chúng mình, ${HER_NAME}.`]} />
      </div>
      <ScrollHint />
    </SceneShell>
  )
}
