import { useEffect, useRef, useState } from 'react'
import { sfx } from '../lib/audio'

type Kind = 'music' | 'amb' | 'fx'
const ROWS: { k: Kind; label: string; hint: string }[] = [
  { k: 'music', label: 'Nhạc', hint: 'Bài hát trong hộp nhạc' },
  { k: 'amb', label: 'Âm nền', hint: 'Gió, lửa, tiếng mèo gừ' },
  { k: 'fx', label: 'Hiệu ứng', hint: 'Chuông, tiếng bấm, tiếng meo' },
]

/**
 * Nút loa chung của mọi cảnh: bấm mở bảng âm lượng gồm công tắc bật tắt và ba thanh chỉnh (nhạc, âm nền, hiệu ứng).
 * Lựa chọn được nhớ lại.
 */
export default function SoundControl({ where }: { where: 'tr' | 'door' }) {
  const [open, setOpen] = useState(false)
  const [on, setOn] = useState(() => sfx.running && !sfx.muted)
  const [, tick] = useState(0)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sync = () => { setOn(sfx.running && !sfx.muted); tick((n) => n + 1) }
    sync()
    const off = sfx.subscribe(sync)
    const iv = setInterval(sync, 900)
    return () => { off(); clearInterval(iv) }
  }, [])
  useEffect(() => {
    if (!open) return
    const out = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    addEventListener('pointerdown', out); addEventListener('keydown', esc)
    return () => { removeEventListener('pointerdown', out); removeEventListener('keydown', esc) }
  }, [open])

  const toggle = () => { if (!sfx.running) { sfx.setMuted(false); sfx.unlock(); sfx.startWind() } else sfx.setMuted(!sfx.muted); setOn(sfx.running && !sfx.muted) }

  return (
    <div className={`snd snd-${where}`} ref={box}>
      <button className={where === 'door' ? 'door-sound' : 'tr-sound'} aria-label="Âm thanh" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 9v6h4l5 4V5L8 9z" />{on ? <><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" /></> : <path d="M17 9l5 6M22 9l-5 6" />}</svg>
      </button>
      {open && (
        <div className="snd-panel" role="dialog" aria-label="Âm lượng">
          <button className={`snd-main${on ? ' on' : ''}`} onClick={toggle} role="switch" aria-checked={on}><span>{on ? 'Âm thanh đang bật' : 'Âm thanh đang tắt'}</span><i /></button>
          {ROWS.map((r) => (
            <label key={r.k} className="snd-row">
              <span><b>{r.label}</b><small>{r.hint}</small></span>
              <input type="range" min={0} max={100} value={Math.round(sfx.vol[r.k] * 100)} style={{ ['--v' as string]: `${Math.round(sfx.vol[r.k] * 100)}%` }}
                onChange={(e) => { if (!sfx.running) { sfx.unlock() } sfx.setVolume(r.k, Number(e.target.value) / 100) }} aria-label={r.label} />
            </label>
          ))}
        </div>
      )}
    </div>
  )
}
