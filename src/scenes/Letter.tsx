import { useEffect, useState } from 'react'
import { LONG_EMAIL, gifts, memories, treeText } from '../content/content'
import { store } from '../lib/storage'
import { FireIcon, LampIcon, StarIcon, StockingIcon, WreathIcon } from './Icons'
import { countdown, isUnlocked } from '../lib/unlock'

export type Modal = { kind: 'gift'; i: number } | { kind: 'memory'; id: string; i?: number } | null

/** Bộ lọc: mép giấy răng cưa, mực chữ sờn, vết ố trên giấy. Đặt một lần trong trang. */
export function PaperFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <filter id="tr-rough" x="-5%" y="-5%" width="110%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" result="a" />
        <feDisplacementMap in="SourceGraphic" in2="a" scale="9" xChannelSelector="R" yChannelSelector="G" result="b" />
        <feTurbulence type="fractalNoise" baseFrequency="0.35" numOctaves="2" seed="2" result="c" />
        <feDisplacementMap in="b" in2="c" scale="4" xChannelSelector="G" yChannelSelector="R" />
      </filter>
      <filter id="tr-ink" x="-2%" y="-5%" width="104%" height="110%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="11" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G" result="rag" />
        <feTurbulence type="fractalNoise" baseFrequency="0.55 0.7" numOctaves="3" seed="4" result="m" />
        <feColorMatrix in="m" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 14 -9.8" result="holes" />
        <feComposite in="rag" in2="holes" operator="out" result="worn" />
        <feComponentTransfer in="worn"><feFuncA type="linear" slope=".92" /></feComponentTransfer>
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

function iconFor(id: string) {
  if (id === 'stock0') return <StockingIcon main="#a82a2a" dark="#6a1212" light="#d84e4e" variant="coins" />
  if (id === 'stock1') return <StockingIcon main="#e4d6b4" dark="#a8926a" light="#f6ecd2" variant="orange" />
  if (id === 'stock2') return <StockingIcon main="#25603f" dark="#0f2c1a" light="#3f8a5c" variant="tag" />
  if (id === 'wreath') return <WreathIcon />
  if (id === 'star') return <StarIcon />
  if (id === 'lamp') return <LampIcon />
  if (id === 'fire') return <FireIcon />
  return null
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
      <label className="ink" htmlFor={`lt-note-${id}`}>{treeText.replyLabel}</label>
      <textarea id={`lt-note-${id}`} value={v} onChange={(e) => setV(e.target.value)} placeholder={treeText.replyHolder} rows={8} />
      <div className="lt-actions">
        <a className="lt-btn primary" href={href}>{treeText.send}</a>
        <button className="lt-btn" onClick={copy} type="button">{done ? treeText.copied : treeText.copy}</button>
      </div>
      <p className="lt-small ink">{treeText.sendHint}<br />Email nhận: <span className="lt-sel">{LONG_EMAIL}</span></p>
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

function Holly() {
  return (
    <svg className="lt-holly" viewBox="0 0 110 90" aria-hidden>
      <g stroke="#0f2f1c" strokeWidth="1.2">
        <path d="M6 70c6-26 30-40 56-34-9 8-8 22-24 32-10 6-22 6-32 2z" fill="#2b6a3e" />
        <path d="M30 86c-3-24 6-44 28-56 3 9 10 17 3 33-5 12-17 22-31 23z" fill="#1f5230" />
        <path d="M52 52c18-2 36 6 48 24-18 6-34 0-48-24z" fill="#34794a" />
      </g>
      <g fill="#c6302a" stroke="#7a1412" strokeWidth=".8"><circle cx="40" cy="58" r="6" /><circle cx="52" cy="64" r="6" /><circle cx="46" cy="48" r="6" /></g>
      <g fill="#fff" opacity=".6"><circle cx="38" cy="56" r="1.7" /><circle cx="50" cy="62" r="1.7" /><circle cx="44" cy="46" r="1.7" /></g>
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

export function ModalView({ modal, onClose }: { modal: NonNullable<Modal>; onClose: () => void }) {
  const [, tick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000)
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    addEventListener('keydown', key)
    return () => { clearInterval(id); removeEventListener('keydown', key) }
  }, [onClose])

  const g = modal.kind === 'gift' ? gifts[modal.i] : null
  const m = modal.kind === 'memory' ? memories[modal.id] : null
  const locked = g ? !isUnlocked(g.unlockAt) : false
  const cd = g && locked ? countdown(g.unlockAt) : null
  const title = g ? g.title : m!.title
  const open = !!g && !locked
  const wide = (g && open && g.kind !== 'plain') || !!m
  const body = g ? g.body.map((t, i) => <p className="hand ink" key={i}>{t}</p>) : null

  return (
    <div className="tr-modal" onClick={onClose}>
      <div className={`lt-sheet ${m ? 'memory' : 'gift'} ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="lt-paper" />
        <div className="lt-fox" />
        {g && <Postmark text={g.stamp} />}
        <Stamp tilt={g ? 4 : -5} />
        {g ? <Seal mark="L♥H" /> : <i className="lt-pin" />}
        <Holly />
        {g && open && <div className="lt-sparkles" aria-hidden>{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ left: `${(i * 37 + 8) % 96}%`, top: `${(i * 53 + 5) % 92}%`, animationDelay: `-${(i * 0.43).toFixed(2)}s` }}>✦</i>)}</div>}
        <div className="lt-body">
          <h2 className="ink">{title}</h2>
          <div className="lt-rule" aria-hidden />
          {cd && (
            <>
              <p className="ink">{treeText.locked}</p>
              <div className="lt-clock" role="timer" aria-label={`Còn ${cd.d} ngày ${cd.h} giờ ${cd.m} phút ${cd.s} giây`}>
                {([['ngày', cd.d], ['giờ', cd.h], ['phút', cd.m], ['giây', cd.s]] as const).map(([u, v]) => (
                  <div key={u}><b>{String(v).padStart(2, '0')}</b><span>{u}</span></div>
                ))}
              </div>
            </>
          )}
          {g && open && g.kind === 'plain' && (g.body.length === 0 ? <p className="hand ink">{treeText.empty}</p> : body)}
          {g && open && g.kind !== 'plain' && (
            <div className="lt-cols">
              <div className="lt-col">{body}</div>
              <div className="lt-col">{g.kind === 'reply' ? <Reply id={g.id} /> : <Qr label={g.extra} />}</div>
            </div>
          )}
          {m && (
            <div className="lt-cols">
              <div className="lt-col lt-left">
                <div className="lt-icon">{iconFor((modal as { id: string }).id)}</div>
                <div className="lt-photo"><span>{treeText.photo}</span></div>
              </div>
              <div className="lt-col">
                {m.meaning.map((t, i) => <p className="ink" key={i}>{t}</p>)}
                <p className="hand ink">{m.story}</p>
              </div>
            </div>
          )}
          <button className="lt-close" onClick={onClose}>{treeText.close}</button>
        </div>
      </div>
    </div>
  )
}
