import { useState } from 'react'

type Phase = 'gate' | 'door' | 'world'

/**
 * Thanh xem nhanh CHỈ có trong bản xem thử trên Artifact (build với VITE_PREVIEW=1): nối cả ba phần của trang
 * (cổng + cửa, hộp nhạc, cây thông, hai bé) để nhảy thẳng tới từng phần mà không phải nhập mật khẩu và đợi cánh cửa mỗi lần.
 * Bản chính thức không có thanh này, mật khẩu và cánh cửa vẫn như cũ.
 */
export function PreviewBar({ phase, go }: { phase: Phase; go: (to: 'gate' | 'door' | 0 | 1 | 2) => void }) {
  const items: { k: 'gate' | 'door' | 0 | 1 | 2; label: string }[] = [
    { k: 'gate', label: 'Cổng' }, { k: 'door', label: 'Cánh cửa' }, { k: 0, label: 'Hộp nhạc' }, { k: 1, label: 'Cây thông' }, { k: 2, label: 'Hai bé' },
  ]
  const [open, setOpen] = useState(true)
  return (
    <nav className={`pv${open ? '' : ' min'}`} aria-label="Xem nhanh các phần (bản xem thử)">
      {open && items.map((it) => <button key={String(it.k)} className={phase === it.k ? 'on' : ''} onClick={() => { go(it.k); if (it.k !== 'gate' && it.k !== 'door') setOpen(false) }}>{it.label}</button>)}
      <button className="tg" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Xem nhanh">{open ? '✕' : 'Xem nhanh'}</button>
    </nav>
  )
}
