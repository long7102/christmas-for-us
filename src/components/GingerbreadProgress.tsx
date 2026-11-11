import { useEffect, useRef, useState } from 'react'
import { onTick, sceneCenters, clamp } from '../lib/scroll'

export const SCENES: { id: string; label: string }[] = [
  { id: 'village', label: 'Ngôi làng' },
  { id: 'music', label: 'Hộp nhạc' },
  { id: 'tea', label: 'Bàn trà' },
  { id: 'tree', label: 'Cây thông & quà' },
  { id: 'globe', label: 'Quả cầu tuyết' },
  { id: 'play', label: 'Trò chơi' },
  { id: 'final', label: 'Dưới trời sao' },
]

function Cookie() {
  return (
    <svg viewBox="0 0 40 48" width="100%" height="100%" aria-hidden="true">
      <g fill="#b9753d" stroke="#8a5224" strokeWidth="1.4" strokeLinejoin="round">
        <circle cx="20" cy="10" r="8" />
        <path d="M13 20Q20 24 27 20L36 24L38 32L28 30L28 46L22 46L20 38L18 46L12 46L12 30L2 32L4 24Z" />
      </g>
      <g stroke="#fff" strokeWidth="1.8" strokeLinecap="round" fill="none"><path d="M16 12Q20 15 24 12M4 28L9 26M36 28L31 26M13 42h4M23 42h4" /></g>
      <circle cx="17" cy="8" r="1.1" fill="#3a2012" /><circle cx="23" cy="8" r="1.1" fill="#3a2012" />
      <circle cx="20" cy="26" r="1.8" fill="#d2404f" /><circle cx="20" cy="33" r="1.8" fill="#d2404f" />
    </svg>
  )
}

/** Replaces the scrollbar: a thin line, one glowing star per scene, a gingerbread rider. */
export default function GingerbreadProgress() {
  const [idx, setIdx] = useState(0)
  const [open, setOpen] = useState(false)
  const [crumbs, setCrumbs] = useState(0)
  const rider = useRef<HTMLDivElement>(null)
  const first = useRef(true)

  useEffect(() => {
    let cs = sceneCenters()
    const re = setInterval(() => (cs = sceneCenters()), 1500)
    const off = onTick(() => {
      const y = scrollY + innerHeight / 2
      let i = 0
      cs.forEach((c, k) => { if (y >= c.top) i = k })
      let pos = 0
      if (cs.length > 1) {
        if (y <= cs[0].center) pos = 0
        else if (y >= cs[cs.length - 1].center) pos = 1
        else {
          let k = 0
          while (k < cs.length - 2 && y >= cs[k + 1].center) k++
          pos = (k + clamp((y - cs[k].center) / (cs[k + 1].center - cs[k].center))) / (cs.length - 1)
        }
      }
      rider.current?.style.setProperty('--pos', String(pos))
      setIdx((o) => { if (o !== i && !first.current) setCrumbs((n) => n + 1); first.current = false; return i })
    })
    return () => { off(); clearInterval(re) }
  }, [])

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setOpen(false)
  }

  return (
    <nav className={`gb ${open ? 'open' : ''}`} aria-label="Các cảnh">
      <div className="gb-track">
        <div className="gb-line" />
        {SCENES.map((s, i) => (
          <button key={s.id} className={`gb-star ${i <= idx ? 'lit' : ''} ${i === idx ? 'cur' : ''}`} style={{ top: `${(i / (SCENES.length - 1)) * 100}%` }} onClick={() => go(s.id)} aria-label={s.label}>
            <svg viewBox="-10 -10 20 20" width="14" height="14"><polygon points="0,-8 2.4,-2.6 8,-2.2 3.6,1.6 5,7.4 0,4.2 -5,7.4 -3.6,1.6 -8,-2.2 -2.4,-2.6" fill="currentColor" /></svg>
            <span className="gb-label">{s.label}</span>
          </button>
        ))}
        <div ref={rider} className="gb-rider">
          <div key={crumbs} className="gb-cookie"><Cookie />{crumbs > 0 && [0, 1, 2, 3].map((k) => <i key={k} className="crumb" style={{ ['--k' as string]: k }} />)}</div>
        </div>
      </div>
      <button className="gb-fab" onClick={() => setOpen((o) => !o)} aria-label="Mở danh sách cảnh"><div key={crumbs} className="gb-cookie"><Cookie /></div></button>
      <div className="gb-current">{SCENES[idx]?.label}</div>
    </nav>
  )
}
