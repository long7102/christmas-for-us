import { useEffect, useState } from 'react'
import { LONG_EMAIL, gifts, getMemory, lampStories, treeText } from '../content/content'
import { store } from '../lib/storage'
import { BellIcon, BowIcon, FireIcon, LampIcon, OrnamentIcon, StarIcon, StockingIcon, WreathIcon } from './Icons'
import { sfx } from '../lib/audio'
import { countdown, isUnlocked } from '../lib/unlock'

export type Modal = { kind: 'gift'; i: number } | { kind: 'memory'; id: string; i?: number } | null

/** Bộ lọc: mép giấy răng cưa, mực chữ sờn, vết ố trên giấy. Đặt một lần trong trang. */
export function PaperFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <filter id="tr-engrave" x="-4%" y="-4%" width="108%" height="108%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="g" />
        <feDisplacementMap in="SourceGraphic" in2="g" scale="2.2" xChannelSelector="R" yChannelSelector="G" result="w" />
        <feColorMatrix in="w" type="matrix" values="0.45 0.45 0.1 0 0  0.45 0.45 0.1 0 0  0.45 0.45 0.1 0 0  0 0 0 1 0" result="gray" />
        <feComponentTransfer in="gray" result="post"><feFuncR type="discrete" tableValues=".16 .3 .46 .62 .8 .94" /><feFuncG type="discrete" tableValues=".1 .22 .36 .52 .72 .9" /><feFuncB type="discrete" tableValues=".05 .12 .22 .34 .52 .78" /></feComponentTransfer>
        <feComposite in="post" in2="SourceGraphic" operator="in" />
      </filter>
      <filter id="tr-rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" result="a" />
        <feDisplacementMap in="SourceGraphic" in2="a" scale="9" xChannelSelector="R" yChannelSelector="G" result="b" />
        <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="2" result="c" />
        <feDisplacementMap in="b" in2="c" scale="4" xChannelSelector="G" yChannelSelector="R" />
      </filter>
    </svg>
  )
}

function Stamp({ tilt = 4 }: { tilt?: number }) {
  return (
    <svg className="lt-stamp" viewBox="0 0 70 84" style={{ transform: `rotate(${tilt}deg)` }} aria-hidden>
      <rect x="3" y="3" width="64" height="78" fill="#efe0b6" stroke="#8a2a22" strokeWidth="1.6" strokeDasharray="3 2.4" />
      <rect x="10" y="10" width="50" height="64" fill="none" stroke="#8a2a22" strokeWidth="1" />
      <polygon points="35,18 24,40 30,40 21,56 29,56 20,68 50,68 41,56 49,56 40,40 46,40" fill="#3a5a3a" opacity=".85" />
      <circle cx="35" cy="16" r="3" fill="#b0392b" />
      <text x="35" y="78" textAnchor="middle" fontSize="7" fill="#8a2a22" fontFamily="serif">NOEL</text>
    </svg>
  )
}

function Postmark({ text }: { text: string }) {
  return (
    <svg className="lt-postmark" viewBox="0 0 120 120" aria-hidden>
      <g fill="none" stroke="#3a4a6a" strokeWidth="2" opacity=".62">
        <circle cx="60" cy="60" r="46" /><circle cx="60" cy="60" r="38" />
        <path d="M2 48 q14 -8 28 0 t28 0 t28 0 t28 0 M2 62 q14 -8 28 0 t28 0 t28 0 t28 0 M2 76 q14 -8 28 0 t28 0 t28 0 t28 0" strokeWidth="1.6" />
      </g>
      <text x="60" y="64" textAnchor="middle" fontSize="15" fill="#3a4a6a" opacity=".7" fontFamily="serif" fontWeight="700">{text}</text>
    </svg>
  )
}

const PAPER: Record<string, string> = { window: 'star', curtainL: 'g1', curtainR: 'g4', painting: 'wreath', painting2: 'stock1', shelf: 'stock1', basket: 'stock0', tools: 'fire', garland: 'wreath', chair: 'g2', rug: 'g1', tree: 'stock2' }
const paperFor = (id: string) => (id.startsWith('bow') ? 'g4' : id.startsWith('bell') ? 'lamp' : PAPER[id] ?? id)

function iconFor(id: string) {
  if (id === 'stock0') return <StockingIcon main="#9c2a28" dark="#5e1412" light="#c44a42" patch="#e6d8b4" variant="coins" />
  if (id === 'stock1') return <StockingIcon main="#d9c9a2" dark="#9a845a" light="#efe3c2" patch="#9c3a30" variant="orange" />
  if (id === 'stock2') return <StockingIcon main="#2c5a3c" dark="#122e1c" light="#44805a" patch="#e0d2ae" variant="tag" />
  if (id === 'wreath') return <WreathIcon />
  if (id === 'star') return <StarIcon />
  if (id === 'lamp') return <LampIcon />
  if (id === 'fire') return <FireIcon />
  if (id.startsWith('bow')) return <BowIcon />
  if (id.startsWith('bell')) return <BellIcon />
  return <OrnamentIcon kind={id} />
}

function Reply({ id }: { id: number }) {
  const key = `note${id}`
  const [v, setV] = useState(() => store.get<string>(key, ''))
  const [done, setDone] = useState(false)
  useEffect(() => { store.set(key, v) }, [key, v])
  const href = `mailto:${LONG_EMAIL}?subject=${encodeURIComponent('Lời nhắn từ Khánh Hạ')}&body=${encodeURIComponent(v)}`
  const copy = async () => {
    try { await navigator.clipboard.writeText(v); setDone(true); setTimeout(() => setDone(false), 1800) } catch { /* bỏ qua */ }
  }
  return (
    <div className="lt-reply">
      <label htmlFor={`lt-note-${id}`}>{treeText.replyLabel}</label>
      <textarea id={`lt-note-${id}`} value={v} onChange={(e) => setV(e.target.value)} placeholder={treeText.replyHolder} rows={8} />
      <div className="lt-actions">
        <a className="lt-btn primary" href={href}>{treeText.send}</a>
        <button className="lt-btn" onClick={copy} type="button">{done ? treeText.copied : treeText.copy}</button>
      </div>
      <p className="lt-small">{treeText.sendHint}<br />Email nhận: <span className="lt-sel">{LONG_EMAIL}</span></p>
    </div>
  )
}

function Qr({ label }: { label?: string }) {
  return (
    <div className="lt-qr" role="img" aria-label="Chỗ để mã QR">
      <svg viewBox="0 0 100 100">
        <rect x="2" y="2" width="96" height="96" fill="none" stroke="#6b4a24" strokeWidth="2" strokeDasharray="6 4" />
        {[[12, 12], [64, 12], [12, 64]].map(([x, y]) => (
          <g key={x + '-' + y}><rect x={x} y={y} width="24" height="24" fill="none" stroke="#4a2e17" strokeWidth="4" /><rect x={x + 8} y={y + 8} width="8" height="8" fill="#4a2e17" /></g>
        ))}
        <text x="50" y="58" textAnchor="middle" fontSize="11" fill="#6b4a24" fontFamily="serif" fontStyle="italic">QR</text>
      </svg>
      <span>{label}</span>
    </div>
  )
}

/** Hoa văn góc kiểu khắc mực xưa. */
function Corner({ pos }: { pos: 'tl' | 'tr' | 'bl' | 'br' }) {
  return (
    <svg className={`lt-corner ${pos}`} viewBox="0 0 80 80" aria-hidden>
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.4">
        <path d="M4 76 V30 Q4 4 30 4 H76" />
        <path d="M11 76 V34 Q11 11 34 11 H76" strokeWidth=".8" />
        <path d="M18 18 Q30 18 30 30 Q30 40 22 40 Q14 40 14 32 Q14 26 20 26" />
        <path d="M34 18 Q46 14 50 24 M18 34 Q14 46 24 50" />
      </g>
      <g fill="currentColor"><circle cx="21" cy="30" r="1.8" /><circle cx="52" cy="25" r="1.6" /><circle cx="25" cy="52" r="1.6" /><path d="M4 4 l5 2 -2 5 -4 -3z" /></g>
    </svg>
  )
}

function Seal({ mark }: { mark: string }) {
  return (
    <div className="lt-seal" aria-hidden>
      <svg viewBox="0 0 64 64"><path d="M32 2c7 0 9 6 15 6 6 0 9 5 8 11 5 4 8 8 5 14 3 6 0 11-6 14-1 7-6 10-12 9-5 5-10 5-14 0-6 1-11-2-12-9-6-3-9-8-6-14-3-6 0-10 5-14-1-6 2-11 8-11 6 0 8-6 15-6z" fill="url(#sealg)" /><defs><radialGradient id="sealg" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#d64a40" /><stop offset=".6" stopColor="#a5251f" /><stop offset="1" stopColor="#6c1411" /></radialGradient></defs></svg>
      <span>{mark}</span>
    </div>
  )
}

export function ModalView({ modal, onClose: finish }: { modal: NonNullable<Modal>; onClose: () => void }) {
  const [, tick] = useState(0)
  const [closing, setClosing] = useState(false)
  const onClose = () => { if (closing) return; setClosing(true); sfx.rustle(0.45, 0.4); setTimeout(finish, 340) }
  useEffect(() => { sfx.rustle(0.6, 0.5) }, [])
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    addEventListener('keydown', key)
    return () => { clearInterval(id); removeEventListener('keydown', key) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing])

  const g = modal.kind === 'gift' ? gifts[modal.i] : null
  const lampI = modal.kind === 'memory' && modal.id === 'lamp' ? (modal.i ?? 0) % lampStories.length : 0
  const m = modal.kind === 'memory' ? (modal.id === 'lamp' ? lampStories[lampI] : getMemory(modal.id)) : null
  const locked = g ? !isUnlocked(g.unlockAt) : false
  const cd = g && locked ? countdown(g.unlockAt) : null
  const title = g ? g.title : m!.title
  const open = !!g && !locked
  const wide = (g && open && g.kind !== 'plain') || !!m
  const body = g ? g.body.map((t, i) => <p className="hand" key={i}>{t}</p>) : null

  return (
    <div className={`tr-modal${closing ? ' closing' : ''}`} onClick={onClose}>
      <div className={`lt-sheet ${m ? 'memory' : 'gift'} ${wide ? 'wide' : ''}`} data-paper={g ? `g${g.id}` : modal.kind === 'memory' ? paperFor(modal.id) : ''} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="lt-paper" />
        <div className="lt-deco" />
        {g && <Postmark text={g.stamp} />}
        <Stamp tilt={g ? 4 : -5} />
        {g ? <Seal mark="L♥H" /> : <i className="lt-pin" />}
        <div className="lt-frame" />
        <Corner pos="tl" /><Corner pos="br" />
        {g && open && <div className="lt-sparkles" aria-hidden>{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 8) % 96}%`, top: `${(i * 53 + 5) % 92}%`, animationDelay: `-${(i * 0.43).toFixed(2)}s` }}>✦</i>)}</div>}
        <div className="lt-body">
          <h2>{title}</h2>
          <div className="lt-rule" aria-hidden />
          {cd && (
            <>
              <p>{treeText.locked}</p>
              <div className="lt-clock" role="timer" aria-label={`Còn ${cd.d} ngày ${cd.h} giờ ${cd.m} phút ${cd.s} giây`}>
                {([['ngày', cd.d], ['giờ', cd.h], ['phút', cd.m], ['giây', cd.s]] as const).map(([u, v]) => (
                  <div key={u}><b>{String(v).padStart(2, '0')}</b><span>{u}</span></div>
                ))}
              </div>
            </>
          )}
          {g && open && g.kind === 'plain' && (g.body.length === 0 ? <p className="hand">{treeText.empty}</p> : body)}
          {g && open && g.kind !== 'plain' && (
            <div className="lt-cols">
              <div className="lt-col">{body}</div>
              <div className="lt-col">{g.kind === 'reply' ? <Reply id={g.id} /> : <Qr label={g.extra} />}</div>
            </div>
          )}
          {m && (
            <div className="lt-cols">
              <div className="lt-col lt-left">
                <div className="lt-icon"><div className="lt-cameo">{iconFor((modal as { id: string }).id)}</div></div>
              </div>
              <div className="lt-col">
                {m.meaning.map((t, i) => <p key={i}>{t}</p>)}
                <p className="hand">{m.story}</p>
                <div className="lt-photos">
                  {[0, 1, 2].map((i) => <figure key={i} className={`lt-snap s${i}`}><i className="tape" /><div><span>{treeText.photo}</span></div></figure>)}
                </div>
              </div>
            </div>
          )}
          <button className="lt-close" onClick={onClose}>{treeText.close}</button>
        </div>
      </div>
    </div>
  )
}
