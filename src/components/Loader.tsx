import { useEffect, useState } from 'react'
import landV from '../assets/village-land.webp'
import portV from '../assets/village-port.webp'

const load = (src: string) => new Promise<void>((res) => { const im = new Image(); im.onload = im.onerror = () => res(); im.src = src })

/** Màn chờ đầu trang: bông tuyết xoay và dòng "đang thắp đèn" cho đến khi phông chữ và ảnh đầu sẵn sàng (tối đa vài giây). */
export function Loader({ onDone }: { onDone?: () => void }) {
  const [phase, setPhase] = useState<'show' | 'out' | 'gone'>('show')
  useEffect(() => {
    let dead = false
    const t0 = performance.now()
    const tall = innerWidth / innerHeight < 1.05
    const ready = Promise.all([document.fonts?.ready ?? Promise.resolve(), load(tall ? portV : landV)])
    const cap = new Promise<void>((r) => setTimeout(r, 6500))
    Promise.race([ready, cap]).then(() => {
      const wait = Math.max(0, 900 - (performance.now() - t0))
      setTimeout(() => { if (dead) return; setPhase('out'); setTimeout(() => { if (!dead) { setPhase('gone'); onDone?.() } }, 800) }, wait)
    })
    return () => { dead = true }
  }, [onDone])
  if (phase === 'gone') return null
  return (
    <div className={`boot${phase === 'out' ? ' out' : ''}`} role="status" aria-live="polite" aria-label="Đang tải">
      <svg className="boot-flake" viewBox="0 0 64 64" width="64" height="64" fill="none" stroke="#f3d596" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
        {[0, 60, 120].map((a) => <g key={a} transform={`rotate(${a} 32 32)`}><path d="M32 6v52M32 14l-7-6M32 14l7-6M32 50l-7 6M32 50l7 6M32 26l-5-4M32 26l5-4M32 38l-5 4M32 38l5 4" /></g>)}
      </svg>
      <p>Đang thắp đèn…</p>
    </div>
  )
}
