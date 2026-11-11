import { useEffect, useRef, useState, type PointerEvent as RPE } from 'react'
import { SceneShell, Layer, useInView } from '../lib/scroll'
import { MaskTitle, Modal, Whisper } from '../components/ui'
import { Pine, StarField } from '../art/shapes'
import { content, show } from '../content/content'
import { store } from '../lib/storage'

type Line = { c: string; d?: string; dot?: [number, number] }
const BODY = 'M110 112Q150 130 190 112L262 140L270 190L205 175L205 290L170 290L150 245L130 290L95 290L95 175L30 190L38 140Z'
const INK = ['#ffffff', '#d2404f', '#2f9a68', '#f4c970', '#6aa0e8']

function CookieStudio() {
  const [lines, setLines] = useState<Line[]>(() => store.get('cookie', []))
  const [ink, setInk] = useState(INK[0])
  const [mode, setMode] = useState<'icing' | 'candy'>('icing')
  const cur = useRef<string | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const pt = (e: RPE) => { const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.current!.getScreenCTM()!.inverse()); return [Math.round(p.x), Math.round(p.y)] as [number, number] }
  const save = (l: Line[]) => { setLines(l); store.set('cookie', l) }
  const down = (e: RPE) => {
    (e.currentTarget as Element).setPointerCapture(e.pointerId)
    const [x, y] = pt(e)
    if (mode === 'candy') return save([...lines, { c: ink, dot: [x, y] }])
    cur.current = `M${x} ${y}`; setLines([...lines, { c: ink, d: cur.current }])
  }
  const move = (e: RPE) => { if (!cur.current) return; const [x, y] = pt(e); cur.current += `L${x} ${y}`; setLines((l) => [...l.slice(0, -1), { c: ink, d: cur.current! }]) }
  const end = () => { if (cur.current) { cur.current = null; store.set('cookie', lines) } }
  return (
    <div className="studio">
      <h3>Tiệm bánh gừng</h3>
      <svg ref={svg} viewBox="0 0 300 330" className="cookie-canvas" onPointerDown={down} onPointerMove={move} onPointerUp={end} onPointerCancel={end} style={{ touchAction: 'none' }}>
        <clipPath id="cc"><circle cx="150" cy="66" r="50" /><path d={BODY} /></clipPath>
        <circle cx="150" cy="66" r="50" fill="#b9753d" /><path d={BODY} fill="#b9753d" />
        <g clipPath="url(#cc)">
          <circle cx="150" cy="66" r="50" fill="#fff" opacity=".06" /><path d={BODY} fill="#8a5224" opacity=".18" transform="translate(4 6)" />
          {lines.map((l, i) => l.dot ? <circle key={i} cx={l.dot[0]} cy={l.dot[1]} r="9" fill={l.c} stroke="#00000030" /> : <path key={i} d={l.d} stroke={l.c} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
        </g>
        <circle cx="150" cy="66" r="50" fill="none" stroke="#8a5224" strokeWidth="3" /><path d={BODY} fill="none" stroke="#8a5224" strokeWidth="3" strokeLinejoin="round" />
      </svg>
      <div className="tools">
        {INK.map((c) => <button key={c} className={`swatch ${ink === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setInk(c)} aria-label="Chọn màu" />)}
        <button className={`pill ${mode === 'icing' ? 'on' : ''}`} onClick={() => setMode('icing')}>Kem</button>
        <button className={`pill ${mode === 'candy' ? 'on' : ''}`} onClick={() => setMode('candy')}>Kẹo</button>
        <button className="pill" onClick={() => save(lines.slice(0, -1))}>Hoàn tác</button>
        <button className="pill" onClick={() => save([])}>Xóa hết</button>
      </div>
      <p className="note">Bánh tự được lưu trên máy của em.</p>
    </div>
  )
}

function MailBox() {
  const [reply, setReply] = useState<string>(() => store.get('reply', ''))
  const letters = content.santaMail.map((m) => show(m)).filter(Boolean)
  const body = encodeURIComponent(reply)
  return (
    <div className="studio">
      <h3>Hòm thư ông già Noel</h3>
      {letters.map((l, i) => <div key={i} className="paper"><p className="hand on" style={{ opacity: 1, transform: 'none' }}>{l}</p></div>)}
      <label htmlFor="reply" className="note">Viết thư trả lời nhé</label>
      <textarea id="reply" className="field" rows={5} value={reply} onChange={(e) => { setReply(e.target.value); store.set('reply', e.target.value) }} placeholder="Gửi ông già Noel..." />
      <a className="btn-gold small" href={`mailto:${content.sendTo}?subject=${encodeURIComponent('Thư trả lời từ Khánh Hạ')}&body=${body}`}>Gửi cho anh</a>
      <p className="note">Thư chỉ lưu trên máy của em. Nút trên mở sẵn thư để em tự gửi nếu muốn.</p>
    </div>
  )
}

function Wish({ onDone }: { onDone: () => void }) {
  const [t, setT] = useState('')
  const [fly, setFly] = useState(false)
  const send = () => {
    if (!t.trim()) return
    const w = store.get<{ t: string; x: number; y: number }[]>('wishes', [])
    w.push({ t: t.trim(), x: 8 + Math.random() * 84, y: 8 + Math.random() * 34 })
    store.set('wishes', w)
    setFly(true); setTimeout(onDone, 2200)
  }
  return (
    <div className="studio">
      <h3>Điều ước năm mới</h3>
      {fly ? <div className="flystar" aria-hidden="true">★</div> : <>
        <textarea id="wish" aria-label="Điều ước" className="field" rows={4} value={t} onChange={(e) => setT(e.target.value)} placeholder="Em ước điều gì cho năm mới?" />
        <button className="btn-gold small" onClick={send}>Thả sao lên trời</button>
        <p className="note">Ngôi sao của em sẽ nằm trên bầu trời ở cuối hành trình.</p></>}
    </div>
  )
}

export default function Play() {
  const [ref, seen] = useInView<HTMLDivElement>(0.3)
  const [m, setM] = useState<'cookie' | 'mail' | 'wish' | null>(null)
  const [found, setFound] = useState<number>(() => store.get<number[]>('reindeer', []).length)
  const [say, setSay] = useState({ t: '', n: 0 })
  useEffect(() => { const f = () => setFound(store.get<number[]>('reindeer', []).length); addEventListener('reindeer', f); return () => removeEventListener('reindeer', f) }, [])
  useEffect(() => { if (found === 5) setSay((s) => ({ t: 'Em tìm đủ cả năm chú tuần lộc rồi!', n: s.n + 1 })) }, [found])

  const obj = (k: 'cookie' | 'mail' | 'wish') => ({ className: 'tappable', onClick: () => setM(k), role: 'button' as const })
  return (
    <SceneShell id="play" len={2}>
      <Layer speed={0} zoom={0.04}>
        <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" className="fill">
          <rect width="1600" height="900" fill="url(#gNight)" />
          <StarField n={100} seed={41} />
          <circle cx="260" cy="160" r="150" fill="url(#gMoonGlow)" /><circle cx="260" cy="160" r="44" fill="url(#gMoon)" />
          <path d="M0 640Q400 580 800 620T1600 600V900H0Z" fill="url(#gHill)" />
          {[120, 330, 1250, 1480].map((x, i) => <Pine key={x} x={x} y={650 + (i % 2) * 20} s={0.9 + (i % 3) * 0.2} />)}
        </svg>
      </Layer>
      <div ref={ref} className="scene-copy top" style={{ top: 'clamp(64px, 10svh, 100px)' }}>
        <MaskTitle show={seen} lines={['Những trò chơi nhỏ']} />
        <p className={`sub reveal ${seen ? 'in' : ''}`} style={{ ['--i' as string]: 3 }}>Tuần lộc đã tìm được: {found}/5</p>
      </div>

      <Layer speed={-3} zoom={0.08} className="set-layer">
        <svg viewBox="0 0 900 460" className="set">
          <ellipse cx="450" cy="440" rx="400" ry="14" fill="#6a8fb8" opacity=".35" />
          {/* mailbox */}
          <g {...obj('mail')} aria-label="Hòm thư">
            <rect x="130" y="240" width="20" height="190" fill="#5a3920" />
            <path d="M70 250Q70 170 150 170T230 250V270H70Z" fill="url(#gRed)" /><rect x="70" y="250" width="160" height="30" rx="4" fill="#9a2a38" />
            <rect x="96" y="206" width="52" height="34" rx="5" fill="#3a0f16" /><path d="M200 190V120" stroke="#d99a3e" strokeWidth="6" /><rect x="198" y="110" width="40" height="24" rx="3" fill="#f4c970" />
            <path d="M60 176Q150 126 240 176Q200 160 150 164Q100 160 60 176Z" fill="url(#gSnow)" />
            <text x="150" y="458" textAnchor="middle" fill="#f6ecd6" fontSize="22" fontStyle="italic" opacity=".85">Hòm thư</text>
            <rect x="40" y="110" width="220" height="330" fill="transparent" />
          </g>
          {/* cookie */}
          <g {...obj('cookie')} aria-label="Tiệm bánh gừng">
            <ellipse cx="450" cy="372" rx="120" ry="24" fill="#e9dcc0" /><ellipse cx="450" cy="366" rx="104" ry="17" fill="#fff6e0" />
            <g transform="translate(390 170) scale(.78)" fill="#b9753d" stroke="#8a5224" strokeWidth="3" strokeLinejoin="round"><circle cx="150" cy="66" r="50" /><path d={BODY} />
              <g stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none"><path d="M132 76Q150 92 168 76M60 160L88 152M240 160L212 152M108 270h24M168 270h24" /></g>
              <circle cx="134" cy="56" r="5" fill="#3a2012" stroke="none" /><circle cx="166" cy="56" r="5" fill="#3a2012" stroke="none" /><circle cx="150" cy="170" r="9" fill="#d2404f" stroke="none" /><circle cx="150" cy="205" r="9" fill="#2f9a68" stroke="none" /></g>
            <text x="450" y="458" textAnchor="middle" fill="#f6ecd6" fontSize="22" fontStyle="italic" opacity=".85">Tiệm bánh gừng</text>
            <rect x="320" y="150" width="260" height="290" fill="transparent" />
          </g>
          {/* wish */}
          <g {...obj('wish')} aria-label="Ước nguyện">
            <circle cx="740" cy="270" r="90" fill="url(#gGlow)" className="glow-pulse" />
            <rect x="690" y="300" width="100" height="130" rx="22" fill="#a9d4ff" opacity=".3" stroke="#d8ecff" strokeWidth="3" />
            <rect x="700" y="284" width="80" height="22" rx="6" fill="url(#gGold)" />
            <polygon points="740,320 748,344 774,344 753,359 761,384 740,369 719,384 727,359 706,344 732,344" fill="url(#gGold)" className="glow-pulse" />
            <text x="740" y="458" textAnchor="middle" fill="#f6ecd6" fontSize="22" fontStyle="italic" opacity=".85">Ước nguyện</text>
            <rect x="660" y="190" width="160" height="250" fill="transparent" />
          </g>
        </svg>
      </Layer>
      <Whisper text={say.t} nonce={say.n} />
      {m && <Modal onClose={() => setM(null)}>{m === 'cookie' ? <CookieStudio /> : m === 'mail' ? <MailBox /> : <Wish onDone={() => setM(null)} />}</Modal>}
    </SceneShell>
  )
}
