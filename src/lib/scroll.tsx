import { createContext, useContext, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { reducedMotion } from './device'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
type Sub = (p: number) => void
const Ctx = createContext<{ sub: (f: Sub) => () => void } | null>(null)

/** One rAF-throttled scroll tick shared by everything. */
const ticks = new Set<() => void>()
let queued = false
function queue() {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    ticks.forEach((f) => f())
  })
}
if (typeof window !== 'undefined') {
  addEventListener('scroll', queue, { passive: true })
  addEventListener('resize', queue)
}
export function onTick(f: () => void) {
  ticks.add(f)
  f()
  return () => void ticks.delete(f)
}

/** Pinned scene: a tall wrapper with a sticky 100vh stage; progress p (0..1) runs through the wrapper. */
export function SceneShell({ id, len = 2, className = '', children }: { id: string; len?: number; className?: string; children: ReactNode }) {
  const wrap = useRef<HTMLElement>(null)
  const subs = useRef(new Set<Sub>())
  const ctx = useRef({ sub: (f: Sub) => { subs.current.add(f); return () => void subs.current.delete(f) } })

  useEffect(
    () =>
      onTick(() => {
        const el = wrap.current
        if (!el) return
        const r = el.getBoundingClientRect()
        if (r.bottom < -200 || r.top > innerHeight + 200) return
        const p = clamp(-r.top / Math.max(1, r.height - innerHeight))
        subs.current.forEach((f) => f(p))
      }),
    [],
  )

  return (
    <section ref={wrap} id={id} data-scene={id} className={`scene ${className}`} style={{ height: `${len * 100}svh` }}>
      <div className="stage">
        <Ctx.Provider value={ctx.current}>{children}</Ctx.Provider>
      </div>
    </section>
  )
}

export function useProgress(f: Sub) {
  const c = useContext(Ctx)
  const ref = useRef(f)
  ref.current = f
  useEffect(() => c?.sub((p) => ref.current(p)), [c])
}

/** Depth layer: translates (vh per full progress) and zooms with scroll. */
export function Layer({ speed = 0, zoom = 0, origin = '50% 100%', className = '', style, children }: { speed?: number; zoom?: number; origin?: string; className?: string; style?: CSSProperties; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useProgress((p) => {
    if (reducedMotion() || !ref.current) return
    ref.current.style.transform = `translate3d(0,${(p * speed).toFixed(2)}vh,0) scale(${(1 + p * zoom).toFixed(4)})`
  })
  return (
    <div ref={ref} className={`layer ${className}`} style={{ transformOrigin: origin, ...style }}>
      {children}
    </div>
  )
}

export function useInView<T extends Element>(threshold = 0.3, once = true) {
  const ref = useRef<T>(null)
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setSeen(true); if (once) io.disconnect() } else if (!once) setSeen(false)
    }, { threshold })
    if (ref.current) io.observe(ref.current)
    return () => io.disconnect()
  }, [threshold, once])
  return [ref, seen] as const
}

/** Scene center positions (document px), for sleigh path + progress bar. */
export function sceneCenters() {
  return [...document.querySelectorAll<HTMLElement>('[data-scene]')].map((el) => {
    const r = el.getBoundingClientRect()
    return { id: el.dataset.scene!, top: r.top + scrollY, h: r.height, center: r.top + scrollY + r.height / 2 }
  })
}
export { clamp }
