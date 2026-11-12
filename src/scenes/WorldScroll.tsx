import { useEffect, useRef, useState } from 'react'
import Tree from './Tree'
import Cats from './Cats'
import { reducedMotion } from '../lib/device'

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }

/**
 * Chuyển cảnh cây thông -> hai chú mèo, chạy theo thanh cuộn: cảnh cây thông phóng dần vào, nhoè và sáng lên,
 * một vòng sáng vàng loang ra từ giữa màn hình để lộ căn phòng của hai bé (hơi ấm tràn qua).
 */
export default function WorldScroll() {
  const wrap = useRef<HTMLDivElement>(null)
  const [seen, setSeen] = useState({ tree: true, cats: false })

  useEffect(() => {
    const el = wrap.current!
    const calm = reducedMotion()
    let raf = 0
    const apply = () => {
      raf = 0
      const vh = innerHeight, vw = innerWidth
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / vh))
      const e = ease(p)
      const cy = 0.62
      const R = e * 1.06 * Math.hypot(vw * 0.5, vh * Math.max(cy, 1 - cy))
      const st = el.style
      st.setProperty('--p', String(p))
      st.setProperty('--tz', String(calm ? 1 : 1 + 0.32 * e))
      st.setProperty('--tb', `${calm ? 0 : 7 * smooth(0.05, 0.8, p)}px`)
      st.setProperty('--tl', String(1 + 0.55 * Math.sin(Math.PI * smooth(0.1, 0.9, p))))
      st.setProperty('--to', String(1 - smooth(0.42, 0.9, p)))
      st.setProperty('--cz', String(calm ? 1 : 1.16 - 0.16 * e))
      st.setProperty('--R', `${R}px`)
      st.setProperty('--D', `${R * 2}px`)
      st.setProperty('--ring', String(Math.sin(Math.PI * smooth(0, 1, p)) * (p > 0.005 ? 1 : 0)))
      st.setProperty('--bloom', String(Math.pow(Math.sin(Math.PI * smooth(0.15, 0.95, p)), 2) * 0.7))
      st.setProperty('--cv', p > 0.004 ? 'visible' : 'hidden')
      st.setProperty('--cpe', p > 0.6 ? 'auto' : 'none')
      st.setProperty('--tpe', p < 0.45 ? 'auto' : 'none')
      setSeen((o) => { const n = { tree: p < 0.92, cats: p > 0.004 }; return o.tree === n.tree && o.cats === n.cats ? o : n })
      st.setProperty('--cue', String(1 - smooth(0, 0.08, p)))
    }
    const on = () => { if (!raf) raf = requestAnimationFrame(apply) }
    apply()
    addEventListener('scroll', on, { passive: true }); addEventListener('resize', on)
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf) }
  }, [])

  const down = (e: React.MouseEvent) => {
    e.preventDefault()
    const top = (wrap.current?.getBoundingClientRect().top ?? 0) + scrollY
    scrollTo({ top: top + innerHeight * 1.02, behavior: 'smooth' })
  }

  return (
    <div className="xf" ref={wrap}>
      <div className="xf-sticky">
        <div className="xf-layer xf-tree"><Tree paused={!seen.tree} /></div>
        <div className="xf-layer xf-cats"><Cats active={seen.cats} /></div>
        <i className="xf-ring" aria-hidden />
        <i className="xf-bloom" aria-hidden />
        <a className="scroll-cue" href="#cats" aria-label="Cuộn xuống cảnh kế tiếp" onClick={down}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
        </a>
      </div>
    </div>
  )
}
