import { useEffect, useState, type ReactNode } from 'react'
import { store } from '../lib/storage'
import { content, show } from '../content/content'

/** Mask-reveal title lines: pass lines, they rise from behind a mask when `in`. */
export function MaskTitle({ lines, show: on, className = '' }: { lines: string[]; show: boolean; className?: string }) {
  return (
    <h2 className={`mask-title ${on ? 'in' : ''} ${className}`}>
      {lines.map((l, i) => (
        <span key={i} className="mask-line" style={{ ['--i' as string]: i }}><span>{l}</span></span>
      ))}
    </h2>
  )
}

/** Soft caption that fades in when `text` changes, then fades away. */
export function Whisper({ text, nonce }: { text: string; nonce: number }) {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!text) return
    setOn(true)
    const t = setTimeout(() => setOn(false), 6500)
    return () => clearTimeout(t)
  }, [text, nonce])
  return <p className={`whisper ${on && text ? 'on' : ''}`} aria-live="polite">{text}</p>
}

export function Modal({ onClose, children, wide }: { onClose: () => void; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    addEventListener('keydown', k)
    return () => removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="modal" onClick={onClose} role="dialog" aria-modal="true">
      <div className={`modal-body ${wide ? 'wide' : ''}`} onClick={(e) => e.stopPropagation()}>
        <button className="modal-x" onClick={onClose} aria-label="Đóng">×</button>
        {children}
      </div>
    </div>
  )
}

export function ScrollHint() {
  return <div className="scroll-hint" aria-hidden="true"><span>cuộn xuống</span><i /></div>
}

/** Small reindeer hidden in a scene: tap to collect (part of the reindeer hunt, scene 06). */
export function HiddenReindeer({ n, style, say }: { n: number; style: React.CSSProperties; say: (t: string) => void }) {
  const [found, setFound] = useState<number[]>(() => store.get('reindeer', []))
  const done = found.includes(n)
  return (
    <button
      className={`hidden-deer ${done ? 'found' : ''}`}
      style={style}
      aria-label="Chú tuần lộc nhỏ"
      onClick={() => {
        if (!done) {
          const next = [...found, n]
          setFound(next)
          store.set('reindeer', next)
          window.dispatchEvent(new Event('reindeer'))
        }
        say(show(content.reindeer[n - 1]) || 'Em tìm thấy một chú tuần lộc nhỏ rồi!')
      }}
    >
      <svg viewBox="0 0 60 56" width="100%" height="100%">
        <g fill="#8a5a34" stroke="#5f3b20" strokeWidth="1.5">
          <path d="M14 18Q10 6 4 4M14 18Q18 8 14 2M46 18Q50 6 56 4M46 18Q42 8 46 2" fill="none" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="30" cy="34" rx="17" ry="16" />
          <ellipse cx="30" cy="42" rx="8" ry="6" fill="#d9b48a" stroke="none" />
          <circle cx="23" cy="30" r="2.4" fill="#1b0f08" stroke="none" />
          <circle cx="37" cy="30" r="2.4" fill="#1b0f08" stroke="none" />
          <circle cx="30" cy="40" r="3.6" fill="#d2404f" stroke="none" />
        </g>
      </svg>
    </button>
  )
}
