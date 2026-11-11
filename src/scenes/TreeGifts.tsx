import { useEffect, useRef, useState, type PointerEvent as RPE } from 'react'
import { SceneShell, Layer, useInView } from '../lib/scroll'
import { MaskTitle, HiddenReindeer, Modal, Whisper } from '../components/ui'
import { Star5, Ornament, StarField, rng } from '../art/shapes'
import { content, show } from '../content/content'
import { store } from '../lib/storage'
import { countdown, isUnlocked } from '../lib/unlock'

const tier = (a: number, b: number, hw: number) =>
  `M450 ${a}L${450 + hw} ${b}Q${450 + hw * 0.67} ${b + 26} ${450 + hw / 3} ${b}Q450 ${b + 26} ${450 - hw / 3} ${b}Q${450 - hw * 0.67} ${b + 26} ${450 - hw} ${b}Z`
const TIERS: [number, number, number][] = [[70, 200, 95], [140, 310, 145], [215, 420, 195], [295, 505, 240]]
const COLORS = ['#c63a48', '#d99a3e', '#4a6fa8', '#f1e3c4', '#2f7a58', '#8a4a9a']
const FIXED = [[400, 200], [510, 280], [340, 350], [560, 400], [450, 460], [300, 470]]
const GIFT = [
  { x: 215, a: '#c63a48', b: '#f1e3c4' }, { x: 345, a: '#2f7a58', b: '#d99a3e' },
  { x: 555, a: '#4a6fa8', b: '#f1e3c4' }, { x: 685, a: '#d99a3e', b: '#c63a48' },
]
const inTree = (x: number, y: number) => y > 90 && y < 520 && Math.abs(x - 450) < ((y - 70) / 450) * 250 + 10

const bulbs = (() => {
  const r = rng(9); const out: { x: number; y: number; c: string }[] = []
  for (let i = 0; i < 34; i++) { const y = 110 + r() * 380; const hw = ((y - 70) / 450) * 215; out.push({ x: 450 + (r() * 2 - 1) * hw, y, c: ['#ffd27a', '#ff7a7a', '#8ae0ff', '#fff3c4'][i % 4] }) }
  return out
})()

function Gift({ g, i, open, drop, hidden }: { g: (typeof GIFT)[0]; i: number; open: boolean; drop: boolean; hidden: boolean }) {
  return (
    <g className={`gift ${drop ? 'dropping' : ''} ${hidden ? 'gift-hide' : ''}`} style={{ ['--i' as string]: i, transformBox: 'fill-box' }}>
      <g transform={`translate(${g.x} 592)`}>
        <ellipse cx="0" cy="4" rx="64" ry="9" fill="#000" opacity=".3" />
        {open && <><circle cy="-50" r="70" fill="url(#gGlow)" className="glow-pulse" />{[-40, -14, 14, 40].map((a) => <path key={a} d="M0 -50L-5 -150L5 -150Z" fill="#ffe9b0" opacity=".35" transform={`rotate(${a} 0 -50)`} />)}</>}
        <rect x="-50" y="-70" width="100" height="70" rx="4" fill={g.a} />
        <rect x="-8" y="-70" width="16" height="70" fill={g.b} />
        <g style={{ transformOrigin: '40px -70px', transform: open ? 'translate(34px,-50px) rotate(34deg)' : 'none', transition: 'transform .9s var(--ease-mask)' }}>
          <rect x="-56" y="-92" width="112" height="26" rx="4" fill={g.a} /><rect x="-56" y="-92" width="112" height="26" rx="4" fill="#fff" opacity=".12" />
          <rect x="-8" y="-92" width="16" height="26" fill={g.b} />
          {!open && <g><path d="M0 -92Q-34 -126 -30 -98Q-24 -88 0 -92Z M0 -92Q34 -126 30 -98Q24 -88 0 -92Z" fill={g.b} /><circle cy="-94" r="7" fill={g.b} /></g>}
        </g>
      </g>
    </g>
  )
}

export default function TreeGifts() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3)
  const [setRef, setSeen] = useInView<HTMLDivElement>(0.5)
  const [lit, setLit] = useState(() => store.get('treeLit', false))
  const [placed, setPlaced] = useState<{ x: number; y: number; c: string }[]>(() => store.get('ornaments', []))
  const [opened, setOpened] = useState<number[]>(() => store.get('giftsOpened', []))
  const [dropped, setDropped] = useState(() => store.get('giftsDropped', false))
  const [dropping, setDropping] = useState(false)
  const [modal, setModal] = useState<number | null>(null)
  const [say, setSay] = useState({ t: '', n: 0 })
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const talk = (t: string) => setSay((s) => ({ t, n: s.n + 1 }))
  const full = placed.length >= 5

  useEffect(() => {
    if (setSeen && !dropped) { setDropping(true); setDropped(true); store.set('giftsDropped', true); setTimeout(() => setDropping(false), 2600) }
  }, [setSeen, dropped])
  useEffect(() => { if (full) talk('Cả cây đang tỏa sáng rồi.') }, [full])

  const light = () => { if (!lit) { setLit(true); store.set('treeLit', true) } }
  const pt = (e: RPE) => { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.current!.getScreenCTM()!.inverse()); return { x: p.x, y: p.y } }
  const up = () => {
    if (!drag) return
    if (inTree(drag.x, drag.y)) { const n = [...placed, { x: drag.x, y: drag.y, c: COLORS[drag.i] }]; setPlaced(n); store.set('ornaments', n); light() }
    setDrag(null)
  }
  const openGift = (i: number) => setModal(i)
  const markOpen = (i: number) => { if (!opened.includes(i)) { const n = [...opened, i]; setOpened(n); store.set('giftsOpened', n) } }

  return (
    <SceneShell id="tree" len={2}>
      <Layer speed={0} zoom={0.04}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill">
          <rect width="1600" height="900" fill="#241620" />
          <rect y="640" width="1600" height="260" fill="url(#gWoodD)" />
          <path d="M300 760Q800 690 1300 760V900H300Z" fill="#7a1f2b" opacity=".55" />
          <g transform="translate(180 130)"><rect width="300" height="380" fill="url(#gNight)" /><StarField w={300} h={380} n={20} seed={21} maxY={0.6} />{Array.from({ length: 14 }, (_, i) => <circle key={i} className="snowfall" cx={(i * 61) % 300} cy={-10} r={1.8} fill="#fff" style={{ animationDelay: `${(i * 0.8) % 6}s`, animationDuration: '6s' }} />)}<path d="M150 0V380M0 190H300" stroke="#6b4326" strokeWidth="9" /><rect x="-10" y="-10" width="320" height="400" fill="none" stroke="#6b4326" strokeWidth="14" /></g>
          <g transform="translate(1160 160)"><rect x="-20" y="260" width="140" height="240" fill="#3b2418" /><circle cx="50" cy="180" r="120" fill="url(#gGlow)" opacity=".4" className="glow-pulse" /></g>
          <path d="M0 80Q400 150 800 90T1600 100" stroke="#1d5a41" strokeWidth="14" fill="none" />
          {Array.from({ length: 20 }, (_, i) => <circle key={i} className="glow-pulse" cx={i * 84 + 20} cy={86 + Math.sin(i * 0.8) * 24} r="5" fill={['#ffd27a', '#ff6a6a', '#8ae0ff'][i % 3]} style={{ animationDelay: `${i * 0.2}s` }} />)}
        </svg>
      </Layer>

      <div ref={ref} className="scene-copy top" style={{ top: 'clamp(64px, 11svh, 110px)' }}>
        <MaskTitle show={seen} lines={['Cây thông và bốn món quà']} />
        <p className={`sub reveal ${seen ? 'in' : ''}`} style={{ ['--i' as string]: 3 }}>Chạm vào ngôi sao trên đỉnh cây</p>
      </div>

      <Layer speed={-4} zoom={0.1} className="set-layer">
        <div ref={setRef} className="set-wrap">
          <svg ref={svg} viewBox="0 0 900 640" className="set" onPointerMove={(e) => drag && setDrag({ i: drag.i, ...pt(e) })} onPointerUp={up} onPointerCancel={up}>
            <circle cx="450" cy="300" r="330" fill="url(#gGlow)" style={{ opacity: full ? 0.7 : lit ? 0.3 : 0, transition: 'opacity 2s' }} />
            <rect x="425" y="500" width="50" height="46" fill="#4a2f1c" />
            {TIERS.map(([a, b, hw], i) => <path key={i} d={tier(a, b, hw)} fill={i % 2 ? 'url(#gPine)' : 'url(#gPine2)'} stroke="#0b261c" strokeWidth="2" />)}
            {TIERS.map(([a, b, hw], i) => <path key={'s' + i} d={`M${450 - hw * 0.25} ${a + (b - a) * 0.28}Q450 ${a - 4} ${450 + hw * 0.25} ${a + (b - a) * 0.28}Q450 ${a + (b - a) * 0.4} ${450 - hw * 0.25} ${a + (b - a) * 0.28}Z`} fill="url(#gSnow)" opacity=".8" />)}
            {bulbs.map((b, i) => <circle key={i} cx={b.x} cy={b.y} r={lit ? 6 : 3.4} fill={lit ? b.c : '#6a6a50'} style={{ filter: lit ? `drop-shadow(0 0 7px ${b.c})` : 'none', transition: `all .8s ${((b.y - 90) / 420) * 1.8}s` }} />)}
            {FIXED.map(([x, y], i) => (
              <g key={i} className="tappable" onClick={() => talk(show(content.ornaments[i]))}>
                <Ornament x={x} y={y} r={15} color={COLORS[i]} /><circle cx={x} cy={y} r="26" fill="transparent" />
              </g>
            ))}
            {placed.map((o, i) => <Ornament key={i} x={o.x} y={o.y} r={14} color={o.c} />)}
            <g className="tappable star-tap" onClick={light} role="button" aria-label="Ngôi sao">
              {lit && <circle cx="450" cy="62" r="70" fill="url(#gGlow)" className="glow-pulse" />}
              <g className={lit ? '' : 'glow-pulse'}><Star5 x={450} y={62} r={32} /></g>
              <circle cx="450" cy="62" r="44" fill="transparent" />
            </g>
            {/* tray */}
            <g>
              <rect x="20" y="452" width="150" height="110" rx="10" fill="#2a180d" opacity=".75" stroke="#c98a31" strokeOpacity=".5" />
              {COLORS.slice(0, 6).map((c, i) => {
                const picked = drag?.i === i
                const home = { x: 55 + (i % 3) * 44, y: 490 + Math.floor(i / 3) * 44 }
                const p = picked ? drag : home
                return <g key={i} transform={`translate(${p.x} ${p.y})`} onPointerDown={(e) => { (e.currentTarget as Element).setPointerCapture(e.pointerId); setDrag({ i, ...pt(e) }) }} style={{ cursor: 'grab', touchAction: 'none' }}><circle r="26" fill="transparent" /><Ornament x={0} y={0} r={picked ? 18 : 15} color={c} /></g>
              })}
              <text x="95" y="580" textAnchor="middle" fill="#f6ecd6" fontSize="14" opacity=".7" fontStyle="italic">Kéo lên cây</text>
            </g>
            {GIFT.map((g, i) => (
              <g key={i} className="tappable" onClick={() => openGift(i)} role="button" aria-label={`Quà ${i + 1}`}>
                <Gift g={g} i={i} open={opened.includes(i)} drop={dropping} hidden={!dropped && !dropping} />
                <rect x={g.x - 60} y="490" width="120" height="110" fill="transparent" />
              </g>
            ))}
          </svg>
        </div>
      </Layer>

      <Whisper text={say.t} nonce={say.n} />
      <HiddenReindeer n={4} style={{ left: '9%', top: '54%' }} say={talk} />
      {modal !== null && <GiftModal i={modal} onClose={() => setModal(null)} onOpened={() => markOpen(modal)} />}
    </SceneShell>
  )
}

function GiftModal({ i, onClose, onOpened }: { i: number; onClose: () => void; onOpened: () => void }) {
  const g = content.gifts[i]
  const open = isUnlocked(g.unlockAt)
  const [, tick] = useState(0)
  const [reveal, setReveal] = useState(false)
  useEffect(() => { const t = setInterval(() => tick((x) => x + 1), 1000); return () => clearInterval(t) }, [])
  useEffect(() => { if (open) { onOpened(); const t = setTimeout(() => setReveal(true), 1400); return () => clearTimeout(t) } }, [open])
  const c = countdown(g.unlockAt)
  if (!open) {
    return (
      <Modal onClose={onClose}>
        <div className="lock">
          <div className="lock-icon shake" aria-hidden="true">🔒</div>
          <h3>{g.title}</h3>
          <p className="say">Chưa đến lúc đâu, Khánh Hạ. Một chút phép màu nữa đang trên đường tới.</p>
          <div className="cd">{[['ngày', c.d], ['giờ', c.h], ['phút', c.m], ['giây', c.s]].map(([l, v]) => <div key={l as string}><b>{String(v).padStart(2, '0')}</b><span>{l}</span></div>)}</div>
        </div>
      </Modal>
    )
  }
  return (
    <Modal onClose={onClose} wide>
      <div className="lock">
        {!reveal ? <div className="burst" aria-hidden="true" /> : (
          <div className="gift-content">
            <h3>{g.title}</h3>
            {show(g.body).split('\n').filter(Boolean).map((l, k) => <p key={k} className="hand-p">{l}</p>)}
          </div>
        )}
      </div>
    </Modal>
  )
}
