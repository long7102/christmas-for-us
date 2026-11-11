import { useEffect, useRef } from 'react'
import { isCoarse, reducedMotion } from '../lib/device'

type Props = {
  /** 0..1 multiplier of particle count */
  density?: number
  /** Flakes rush toward the viewer (door opening). */
  burst?: boolean
  className?: string
}

type Flake = { x: number; y: number; z: number; vx: number; ph: number; sp: number }

/** Multi-depth soft snow on a 2D canvas. Paused when off-screen / tab hidden. */
export function SnowParticles({ density = 1, burst = false, className }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const burstRef = useRef(burst)
  burstRef.current = burst

  useEffect(() => {
    const cv = ref.current!
    const ctx = cv.getContext('2d')!
    const coarse = isCoarse()
    const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2)
    let W = 0, H = 0
    let flakes: Flake[] = []
    let raf = 0, last = performance.now(), visible = true, burstT = 0

    // one soft flake sprite, drawn scaled (much cheaper than a gradient per flake per frame)
    const sprite = document.createElement('canvas')
    sprite.width = sprite.height = 64
    const sc = sprite.getContext('2d')!
    const sg = sc.createRadialGradient(32, 32, 0, 32, 32, 32)
    sg.addColorStop(0, 'rgba(255,255,255,1)'); sg.addColorStop(0.45, 'rgba(240,248,255,.55)'); sg.addColorStop(1, 'rgba(240,248,255,0)')
    sc.fillStyle = sg; sc.fillRect(0, 0, 64, 64)

    const make = (): Flake => ({ x: Math.random(), y: Math.random(), z: Math.random(), vx: (Math.random() - 0.5) * 0.02, ph: Math.random() * 6.28, sp: 0.7 + Math.random() * 0.6 })
    const resize = () => {
      W = cv.clientWidth; H = cv.clientHeight
      cv.width = W * dpr; cv.height = H * dpr
      const n = Math.round((W * H) / (coarse ? 9000 : 6000) * density * (reducedMotion() ? 0.4 : 1))
      flakes = Array.from({ length: Math.min(n, coarse ? 150 : 320) }, make)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(cv)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(cv)

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame)
      const dt = Math.min(0.05, (t - last) / 1000)
      last = t
      if (!visible || document.hidden) return
      burstT = burstRef.current ? Math.min(1, burstT + dt * 0.5) : Math.max(0, burstT - dt)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      for (const f of flakes) {
        const depth = 0.25 + f.z * 0.75
        if (burstT > 0) {
          // radiate from the centre toward the viewer
          const dx = f.x - 0.5, dy = f.y - 0.5
          f.x += dx * dt * burstT * (0.6 + f.z * 2.2)
          f.y += dy * dt * burstT * (0.6 + f.z * 2.2)
          if (f.x < -0.1 || f.x > 1.1 || f.y < -0.1 || f.y > 1.1) {
            f.x = 0.5 + (Math.random() - 0.5) * 0.15
            f.y = 0.5 + (Math.random() - 0.5) * 0.15
          }
        } else {
          const gust = 0.6 + Math.sin(t / 2600) * 0.45 + Math.sin(t / 970 + f.ph) * 0.15
          f.y += dt * (0.06 + depth * 0.2) * f.sp
          f.x += (f.vx + 0.035 * depth * gust) * dt + Math.sin(t / 700 + f.ph) * dt * 0.02 * depth
          if (f.y > 1.03) { f.y = -0.03; f.x = Math.random() }
          if (f.x > 1.03) f.x = -0.03
          if (f.x < -0.03) f.x = 1.03
        }
        const r = (0.6 + depth * 2.4) * (1 + burstT * 1.8 * f.z)
        const a = (0.25 + depth * 0.6) * (1 - burstT * 0.25)
        const px = f.x * W, py = f.y * H
        ctx.globalAlpha = a
        if (burstT === 0 && f.z > 0.6) {
          // near flakes are streaked by their motion
          const len = r * (2.2 + f.z * 2)
          ctx.save(); ctx.translate(px, py); ctx.rotate(-0.28); ctx.drawImage(sprite, -r * 2, -r * 2, r * 4 + len, r * 4); ctx.restore()
        } else ctx.drawImage(sprite, px - r * 2, py - r * 2, r * 4, r * 4)
      }
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect() }
  }, [density])

  return <canvas ref={ref} className={className} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
}
