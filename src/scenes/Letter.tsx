import { useEffect, useState } from 'react'
import { LONG_EMAIL, gifts, memories, treeText } from '../content/content'
import { store } from '../lib/storage'
import { countdown, isUnlocked } from '../lib/unlock'

export type Modal = { kind: 'gift'; i: number } | { kind: 'memory'; id: string } | null

/** Bộ lọc làm mép giấy răng cưa như giấy xé. Đặt một lần trong trang. */
export function PaperFilter() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
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

  return (
    <div className="tr-modal" onClick={onClose}>
      <div className={`lt-sheet ${m ? 'memory' : ''}`} onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="lt-paper" />
        {g && <Postmark text={g.stamp} />}
        <Stamp tilt={g ? 4 : -5} />
        <i className="lt-pin" />
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
          {g && !locked && (
            <>
              {g.body.length === 0 ? <p className="hand">{treeText.empty}</p> : g.body.map((t, i) => <p className="hand" key={i}>{t}</p>)}
              {g.kind === 'reply' && <Reply id={g.id} />}
              {g.kind === 'qr' && <Qr label={g.extra} />}
            </>
          )}
          {m && (
            <>
              <div className="lt-photo"><span>{treeText.photo}</span></div>
              <p className="hand">{m.story}</p>
            </>
          )}
          <button className="lt-close" onClick={onClose}>{treeText.close}</button>
        </div>
      </div>
    </div>
  )
}
