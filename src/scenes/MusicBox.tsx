import { useEffect, useRef, useState, type PointerEvent as RPE } from 'react'
import { SceneShell, Layer, useInView } from '../lib/scroll'
import { MaskTitle, HiddenReindeer, Whisper } from '../components/ui'
import { StarField, Pine } from '../art/shapes'
import { content, TODO_LONG } from '../content/content'
import { videoId, YT } from '../lib/youtube'

const LABELS = ['#c63a48', '#2f7a58', '#d99a3e', '#4a6fa8', '#8a4a9a']
const TT = { x: 540, y: 330 } // turntable centre in the 800x520 set

function Record({ label, spin = false, notch = true }: { label: string; spin?: boolean; notch?: boolean }) {
  return (
    <g className={spin ? 'spin' : ''}>
      <circle r="50" fill="#14161c" />
      {[44, 38, 32, 26].map((r) => <circle key={r} r={r} fill="none" stroke="#2a2e38" strokeWidth="1.2" />)}
      <path d="M-36 -34A50 50 0 0 1 20 -46" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".16" />
      <circle r="18" fill={label} />
      <circle r="18" fill="none" stroke="#fff" strokeOpacity=".35" />
      {notch && <circle cx="0" cy="-11" r="2.4" fill="#fff" opacity=".7" />}
      <circle r="2.6" fill="#0a0a0a" />
    </g>
  )
}

export default function MusicBox() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3)
  const [cur, setCur] = useState<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [vol, setVol] = useState(70)
  const [prog, setProg] = useState(0)
  const [loop, setLoop] = useState(false)
  const [say, setSay] = useState({ t: '', n: 0 })
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const yt = useRef<YT | null>(null)
  const hasLink = (i: number) => content.playlist[i].youtube !== TODO_LONG

  useEffect(() => {
    yt.current = new YT(host.current!, setPlaying, () => (loopRef.current ? start(curRef.current!) : next()))
    const iv = setInterval(() => { const { t, d } = yt.current!.time(); setProg(d ? t / d : 0) }, 500)
    return () => { clearInterval(iv); yt.current?.stop() }
    // eslint-disable-next-line
  }, [])
  const curRef = useRef<number | null>(null); curRef.current = cur
  const loopRef = useRef(false); loopRef.current = loop

  const start = (i: number) => {
    setCur(i)
    const link = content.playlist[i].youtube
    const id = link !== TODO_LONG ? videoId(link) : null
    if (id) yt.current?.load(id, vol)
    else { yt.current?.stop(); setPlaying(true) } // no link: record still spins, no sound
  }
  const next = () => start(((curRef.current ?? -1) + 1) % 5)
  const prev = () => start(((curRef.current ?? 1) + 4) % 5)
  const toggle = () => {
    if (cur === null) return start(0)
    if (hasLink(cur)) (playing ? yt.current?.pause() : yt.current?.play())
    else setPlaying((p) => !p)
  }

  const pt = (e: RPE) => {
    const s = svg.current!, m = s.getScreenCTM()!.inverse()
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m)
    return { x: p.x, y: p.y }
  }
  const moved = useRef(0)
  const down = (i: number) => (e: RPE) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId)
    moved.current = 0
    setDrag({ i, ...pt(e) })
  }
  const move = (e: RPE) => { if (drag) { const p = pt(e); moved.current += 1; setDrag({ i: drag.i, ...p }) } }
  const up = () => {
    if (!drag) return
    const near = Math.hypot(drag.x - TT.x, (drag.y - TT.y) * 3) < 130
    if (moved.current < 4 || near) start(drag.i)
    setDrag(null)
  }
  const sp = cur !== null && playing
  const song = cur !== null ? content.playlist[cur] : null

  return (
    <SceneShell id="music" len={2}>
      <Layer speed={0} zoom={0.04}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill">
          <rect width="1600" height="900" fill="#3b2418" />
          {Array.from({ length: 16 }, (_, i) => <path key={i} d={`M${i * 100} 0V640`} stroke="#2a180f" strokeWidth="3" opacity=".6" />)}
          <rect y="620" width="1600" height="280" fill="url(#gWoodD)" />
          {/* window */}
          <g transform="translate(1040 120)">
            <rect x="-16" y="-16" width="352" height="392" rx="6" fill="#6b4326" />
            <rect width="320" height="360" fill="url(#gNight)" />
            <clipPath id="mw"><rect width="320" height="360" /></clipPath>
            <g clipPath="url(#mw)"><StarField w={320} h={360} n={22} seed={11} maxY={0.6} /><path d="M0 300Q80 250 160 290T320 270V360H0Z" fill="url(#gHill)" /><Pine x={60} y={310} s={0.6} /><Pine x={250} y={320} s={0.8} />
              {Array.from({ length: 16 }, (_, i) => <circle key={i} className="snowfall" cx={(i * 59) % 320} cy={-10} r={1.6 + (i % 3)} fill="#fff" style={{ animationDelay: `${(i * 0.7) % 6}s`, animationDuration: `${5 + (i % 4)}s` }} />)}</g>
            <path d="M160 0V360M0 180H320" stroke="#6b4326" strokeWidth="9" />
            <rect x="-24" y="364" width="368" height="14" rx="3" fill="#5a3920" />
          </g>
          {/* fireplace */}
          <g transform="translate(120 330)">
            <rect x="-30" y="-30" width="420" height="30" rx="4" fill="#5a3920" />
            <rect width="360" height="300" fill="url(#gStone)" />
            {[0, 1, 2, 3, 4].map((r) => <path key={r} d={`M0 ${r * 60}H360`} stroke="#4b535c" strokeWidth="2" opacity=".6" />)}
            <path d="M70 300V120Q70 70 180 70T290 120V300Z" fill="#150b07" />
            <ellipse cx="180" cy="290" rx="100" ry="18" fill="#2a1608" />
            <circle cx="180" cy="220" r="150" fill="url(#gGlow)" className="glow-pulse" />
            <g className="flicker"><path d="M180 290Q120 250 150 190Q150 230 180 200Q170 150 200 120Q215 180 235 200Q250 240 210 290Z" fill="#ff8a2a" /></g>
            <g className="flicker" style={{ animationDelay: '-.7s' }}><path d="M180 290Q150 262 168 226Q175 250 188 238Q192 210 204 196Q214 240 222 258Q226 280 200 290Z" fill="#ffd35a" /></g>
            <path d="M120 292l90 -14M130 278l90 12" stroke="#4a2f1c" strokeWidth="12" strokeLinecap="round" />
            <g transform="translate(40 -42)"><path d="M0 0h16l-4 26l-10 0Z" fill="#c63a48" /><rect width="16" height="6" fill="#fff" /></g>
            <g transform="translate(300 -42)"><path d="M0 0h16l-4 26l-10 0Z" fill="#2f7a58" /><rect width="16" height="6" fill="#fff" /></g>
          </g>
          <path d="M0 80Q400 150 800 90T1600 100" stroke="#1d5a41" strokeWidth="14" fill="none" />
          {Array.from({ length: 20 }, (_, i) => <circle key={i} className="glow-pulse" cx={i * 84 + 20} cy={86 + Math.sin(i * 0.8) * 24} r="5" fill={['#ffd27a', '#ff6a6a', '#8ae0ff'][i % 3]} style={{ animationDelay: `${i * 0.2}s` }} />)}
        </svg>
      </Layer>

      <div ref={ref} className="scene-copy top" style={{ top: 'clamp(64px, 12svh, 120px)' }}>
        <MaskTitle show={seen} lines={['Hộp nhạc Giáng sinh']} />
        <p className={`sub reveal ${seen ? 'in' : ''}`} style={{ ['--i' as string]: 3 }}>Đặt một chiếc đĩa lên máy hát nhé</p>
      </div>

      <Layer speed={-3} zoom={0.1} className="set-layer" origin="50% 100%">
        <svg ref={svg} viewBox="0 0 800 520" className="set" onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
          {/* table */}
          <path d="M20 470Q400 430 780 470V520H20Z" fill="url(#gWood)" />
          <path d="M20 470Q400 430 780 470" stroke="#c18a52" strokeWidth="3" fill="none" opacity=".6" />
          <ellipse cx="400" cy="500" rx="380" ry="14" fill="#000" opacity=".25" />
          <g className="tip-pad">
            {/* gramophone */}
            <g filter="url(#fShadow)">
              <path d="M300 420L620 420L650 460Q400 490 250 460Z" fill="url(#gWoodD)" />
              <path d="M300 420L620 420L632 438Q420 456 270 438Z" fill="url(#gWood)" />
              <ellipse cx={TT.x} cy={TT.y + 52} rx="170" ry="48" fill="#2c1a0d" />
              <ellipse cx={TT.x} cy={TT.y + 46} rx="170" ry="48" fill="url(#gGold)" opacity=".85" />
              <ellipse cx={TT.x} cy={TT.y + 44} rx="150" ry="40" fill="#1a1a20" />
            </g>
            {/* horn */}
            <path d="M600 330Q640 250 700 190L730 80Q760 40 780 50Q790 140 760 250Q690 290 640 340Z" fill="url(#gGold)" stroke="#b9822f" strokeWidth="2" opacity=".0" />
            <g transform="translate(676 120)">
              <path d="M-14 120Q-20 60 -60 -20Q-10 -70 60 -30Q30 60 20 120Z" fill="url(#gGold)" stroke="#b9822f" strokeWidth="2" />
              <ellipse cx="-4" cy="-44" rx="68" ry="28" transform="rotate(-24 -4 -44)" fill="#7a4a12" />
              <ellipse cx="-4" cy="-44" rx="60" ry="22" transform="rotate(-24 -4 -44)" fill="#e9b25b" opacity=".6" />
              <rect x="-14" y="116" width="34" height="90" rx="6" fill="url(#gGold)" />
            </g>
            {/* turntable disc */}
            <g transform={`translate(${TT.x} ${TT.y + 44}) scale(1 .27)`}>
              {cur !== null ? <Record label={LABELS[cur]} spin={sp} /> : <g><circle r="140" fill="#242830" /><circle r="6" fill="#d99a3e" /></g>}
            </g>
            {/* arm */}
            <g style={{ transformOrigin: '708px 336px', transform: `rotate(${cur !== null ? 0 : -24}deg)`, transition: 'transform 1.2s var(--ease-mask)' }}>
              <circle cx="708" cy="336" r="9" fill="url(#gGold)" />
              <path d="M708 336L630 372" stroke="url(#gGold)" strokeWidth="6" strokeLinecap="round" />
              <rect x="618" y="366" width="20" height="9" rx="3" fill="#2a2a2a" transform="rotate(25 628 370)" />
            </g>
          </g>
          {/* record rack */}
          <g>
            <path d="M24 400H266V412H24Z" fill="url(#gWoodD)" />
            {LABELS.map((c, i) => {
              const picked = drag?.i === i
              const home = { x: 62 + i * 46, y: 340 }
              const pos = picked ? { x: drag.x, y: drag.y } : home
              if (cur === i && !picked) return null
              return (
                <g key={i} className="rec" transform={`translate(${pos.x} ${pos.y}) scale(${picked ? 0.9 : 0.72})`} onPointerDown={down(i)} style={{ cursor: picked ? 'grabbing' : 'grab', touchAction: 'none' }}>
                  <circle r="58" fill="transparent" />
                  <Record label={c} notch={false} />
                </g>
              )
            })}
          </g>
        </svg>

        <div className="brass">
          {song && (
            <div className="plaque"><b>{song.title}</b><span>{song.artist}{!hasLink(cur!) ? ' · chưa có nhạc' : ''}</span></div>
          )}
          <div className="ctl">
            <button onClick={prev} aria-label="Bài trước">⏮</button>
            <button className="pp" onClick={toggle} aria-label={playing ? 'Tạm dừng' : 'Phát'}>{sp ? '❚❚' : '▶'}</button>
            <button onClick={next} aria-label="Bài sau">⏭</button>
            <button className={loop ? 'on' : ''} onClick={() => setLoop((l) => !l)} aria-label="Lặp lại">⟳</button>
            <input aria-label="Âm lượng" type="range" min={0} max={100} value={vol} onChange={(e) => { setVol(+e.target.value); yt.current?.volume(+e.target.value) }} />
          </div>
          <input className="seek" aria-label="Tiến trình" type="range" min={0} max={1000} value={Math.round(prog * 1000)} disabled={!song || !hasLink(cur!)} onChange={(e) => { const { d } = yt.current!.time(); yt.current?.seek((+e.target.value / 1000) * d) }} />
        </div>
      </Layer>

      <Whisper text={say.t} nonce={say.n} />
      <HiddenReindeer n={2} style={{ left: '6%', top: '63%' }} say={(t) => setSay((s) => ({ t, n: s.n + 1 }))} />
      <div ref={host} className="yt-host" aria-hidden="true" />
    </SceneShell>
  )
}
