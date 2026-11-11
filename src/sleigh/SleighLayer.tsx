import { useEffect, useRef } from 'react'
import SleighArt from '../art/SleighArt'
import { targetAt } from './flightPath'
import { onTick, sceneCenters } from '../lib/scroll'
import { isCoarse, reducedMotion } from '../lib/device'

/** Fixed full-screen layer; the sleigh chases its scroll-driven target, bobs, tilts and leaves a dust trail. */
export default function SleighLayer() {
  const el = useRef<HTMLDivElement>(null)
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const node = el.current!, canvas = cv.current!, ctx = canvas.getContext('2d')!
    let W = innerWidth, H = innerHeight
    let centers = sceneCenters()
    const dpr = Math.min(devicePixelRatio || 1, 2)
    const size = () => { W = innerWidth; H = innerHeight; canvas.width = W * dpr; canvas.height = H * dpr; centers = sceneCenters() }
    size()
    addEventListener('resize', size)
    const refresh = setInterval(() => (centers = sceneCenters()), 1500)
    let target: ReturnType<typeof targetAt> = null
    const off = onTick(() => { target = targetAt(scrollY + H / 2, centers) })
    let mx = 0
    const mm = (e: MouseEvent) => (mx = (e.clientX / W - 0.5) * 2)
    if (!isCoarse()) addEventListener('mousemove', mm)

    const cur = { x: 0, y: 0, s: 0, dir: 1, init: false }
    let px = 0, py = 0, last = performance.now(), raf = 0
    const dust: { x: number; y: number; life: number; v: number }[] = []

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      if (!target) return
      const narrow = W < 760
      const tx = narrow ? Math.max(-0.25, Math.min(0.25, target.x)) : target.x
      const ts = target.s * (narrow ? 0.7 : 1)
      if (!cur.init) { Object.assign(cur, { x: tx, y: target.y, s: ts, init: true }) }
      const k = reducedMotion() ? 1 : 1 - Math.exp(-dt * 3.2)
      cur.x += (tx - cur.x) * k; cur.y += (target.y - cur.y) * k; cur.s += (ts - cur.s) * k
      cur.dir = target.dir
      const bob = Math.sin(t / 1000 * 2.1) * 0.045 + Math.sin(t / 1000 * 3.7) * 0.015
      const sx = (cur.x * 0.5 + 0.5) * W, sy = (0.5 - (cur.y + bob) * 0.5) * H
      const vx = (sx - px) / Math.max(dt, 0.001), vy = (sy - py) / Math.max(dt, 0.001)
      px = sx; py = sy
      const speed = Math.hypot(vx, vy)
      const tilt = Math.max(-28, Math.min(28, vy * 0.02 * cur.dir + (isCoarse() ? 0 : mx * 4)))
      const wpx = Math.min(W * 0.62, 640) * cur.s / 0.55
      node.style.width = `${wpx}px`
      node.style.transform = `translate3d(${sx - wpx / 2}px, ${sy - wpx * 0.2}px, 0) rotate(${(tilt * cur.dir).toFixed(1)}deg) scaleX(${cur.dir})`
      // trail
      if (!reducedMotion() && Math.random() < 0.35 + Math.min(0.6, speed / 1600)) {
        dust.push({ x: sx - cur.dir * wpx * 0.45 + (Math.random() - 0.5) * 20, y: sy + wpx * 0.06 + (Math.random() - 0.5) * 16, life: 1, v: Math.random() })
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      for (let i = dust.length - 1; i >= 0; i--) {
        const d = dust[i]
        d.life -= dt * (0.55 + d.v * 0.5)
        if (d.life <= 0) { dust.splice(i, 1); continue }
        d.y += dt * 8
        const r = 1.2 + d.v * 2.4
        const g = ctx.createRadialGradient(d.x, d.y, 0, d.x, d.y, r * 3)
        g.addColorStop(0, `rgba(255,226,150,${d.life * 0.7})`); g.addColorStop(1, 'rgba(255,200,100,0)')
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(d.x, d.y, r * 3, 0, 6.283); ctx.fill()
      }
      if (dust.length > 140) dust.splice(0, dust.length - 140)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); off(); clearInterval(refresh); removeEventListener('resize', size); removeEventListener('mousemove', mm) }
  }, [])

  return (
    <div className="sleigh-layer" aria-hidden="true">
      <canvas ref={cv} className="sleigh-trail" />
      <div ref={el} className="sleigh"><SleighArt /></div>
    </div>
  )
}
