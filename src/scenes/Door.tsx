import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { SnowParticles } from '../components/SnowParticles'
import { content, ui } from '../content/content'
import { store } from '../lib/storage'
import { reducedMotion, usePortrait } from '../lib/device'
import { LAND, PORT, build, pixelShapes } from './doorGeometry'
import VillageLife from './VillageLife'
import landImg from '../assets/door-land.webp'
import portImg from '../assets/door-port.webp'

// Optional establishing shot of the village (drop village-land.webp / village-port.webp into src/assets).
const villageFiles = import.meta.glob('../assets/village-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const villageUrl = (portrait: boolean) => Object.entries(villageFiles).find(([k]) => k.includes(portrait ? 'village-port' : 'village-land'))?.[1]
/** Where the door house sits in the village shot (0..1) and how far to run in until it fills the screen. Tune per image. */
/** x,y: the door in the village photo; s: zoom until it fills the door shot; dy: shift so its centre lands where the door shot's centre is. */
const VILL = { land: { x: 0.5, y: 0.575, s: 4.2, dy: -0.1 }, port: { x: 0.505, y: 0.62, s: 3.1, dy: -0.085 } }

const SLICES = 11 // layers that give each leaf its thickness

type Tex = { frame: string; left: string; right: string; leftDark: string; rightDark: string }

/** Bakes the frame (doors cut out) and each leaf (+ a darker copy for its thickness) into transparent textures. */
function useDoorTextures(src: string, geo: typeof LAND) {
  const [tex, setTex] = useState<Tex | null>(null)
  useEffect(() => {
    let dead = false
    const im = new Image()
    im.onload = () => {
      const sh = pixelShapes(geo)
      const path = (c: CanvasRenderingContext2D, pts: [number, number][], ox = 0, oy = 0) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x - ox, y - oy) : c.moveTo(x - ox, y - oy))); c.closePath() }
      const make = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => new Promise<string>((res) => {
        const cv = document.createElement('canvas'); cv.width = Math.round(w); cv.height = Math.round(h)
        draw(cv.getContext('2d')!)
        cv.toBlob((b) => res(URL.createObjectURL(b!)), 'image/png')
      })
      const leaf = (pts: [number, number][], ox: number, dark: boolean) => make(sh.bw, sh.bh, (c) => {
        c.save(); path(c, pts, ox, sh.y0); c.clip(); c.drawImage(im, -ox, -sh.y0)
        if (dark) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(70,36,14,.4)'; c.fillRect(0, 0, sh.bw, sh.bh) }
        c.restore()
      })
      Promise.all([
        make(geo.w, geo.h, (c) => { c.drawImage(im, 0, 0); c.globalCompositeOperation = 'destination-out'; path(c, sh.ring); c.fill() }),
        leaf(sh.leafL, sh.x0, false), leaf(sh.leafR, sh.cx, false), leaf(sh.leafL, sh.x0, true), leaf(sh.leafR, sh.cx, true),
      ]).then(([frame, left, right, leftDark, rightDark]) => !dead && setTex({ frame, left, right, leftDark, rightDark }))
    }
    im.src = src
    return () => { dead = true }
  }, [src, geo])
  return tex
}

/** Clumps and powder of snow that fall off the door, garland and ledges when the door moves. */
function useShed() {
  const cv = useRef<HTMLCanvasElement>(null)
  const parts = useRef<{ x: number; y: number; vx: number; vy: number; r: number; a: number; life: number; powder: boolean }[]>([])
  const raf = useRef(0)
  const sprite = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const x = c.getContext('2d')!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(236,244,255,.85)'); g.addColorStop(1, 'rgba(226,238,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c
  }, [])

  const loop = () => {
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d')!, dpr = Math.min(devicePixelRatio || 1, 2)
    if (c.width !== c.clientWidth * dpr) { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr }
    let last = performance.now()
    const frame = (t: number) => {
      const dt = Math.min(0.04, (t - last) / 1000); last = t
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, c.clientWidth, c.clientHeight)
      const ps = parts.current
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life -= dt
        if (p.life <= 0 || p.y > c.clientHeight + 40) { ps.splice(i, 1); continue }
        p.vy += (p.powder ? 380 : 1500) * dt; p.vx *= 1 - dt * (p.powder ? 1.6 : 0.4)
        p.x += p.vx * dt; p.y += p.vy * dt
        ctx.globalAlpha = Math.min(1, p.life * 1.6) * p.a
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
      }
      ctx.globalAlpha = 1
      raf.current = ps.length ? requestAnimationFrame(frame) : 0
    }
    raf.current = requestAnimationFrame(frame)
  }

  /** Drop snow from the door area `r` (screen px): some from the top, more from the garland columns on both sides. */
  const burst = (n: number, r: DOMRect) => {
    for (let i = 0; i < n; i++) {
      const top = Math.random() < 0.4
      const side = Math.random() < 0.5 ? -1 : 1
      const x = top ? r.left + Math.random() * r.width : side < 0 ? r.left - r.width * (0.02 + Math.random() * 0.16) : r.right + r.width * (0.02 + Math.random() * 0.16)
      const y = top ? r.top + Math.random() * r.height * 0.18 : r.top + Math.random() * r.height * 0.75
      const powder = Math.random() < 0.65
      parts.current.push({ x, y, vx: (Math.random() - 0.5) * 70 + (top ? 0 : side * 25), vy: Math.random() * 60, r: powder ? 2 + Math.random() * 4 : 7 + Math.random() * 16, a: powder ? 0.8 : 0.95, life: 1.2 + Math.random() * 1.4, powder })
    }
    if (!raf.current) loop()
  }
  return { cv, burst }
}

export default function Door({ onOpen }: { onOpen: () => void }) {
  const portrait = usePortrait()
  const g = useMemo(() => build(portrait ? PORT : LAND), [portrait])
  const img = portrait ? portImg : landImg
  const vill = villageUrl(portrait)
  const tex = useDoorTextures(img, portrait ? PORT : LAND)
  const shed = useShed()

  const root = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const villRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const panels = useRef<HTMLDivElement>(null)
  const [line, setLine] = useState(0) // 0 none, 1 line1, 2 line1+2, 3 hidden
  const [ready, setReady] = useState(false) // button visible
  const [opening, setOpening] = useState(false)
  const [burst, setBurst] = useState(false)
  const returning = store.get('opened', false)

  // Leaf thickness follows the rendered size.
  useEffect(() => {
    const set = () => { if (box.current && panels.current) panels.current.style.setProperty('--depth', `${((box.current.offsetWidth * (g.area.widthNum / 2)) * 0.2).toFixed(1)}px`) }
    set(); addEventListener('resize', set); return () => removeEventListener('resize', set)
  }, [g])

  // Intro: village fades in, we run to the house, the door appears, the button follows.
  useEffect(() => {
    const k = reducedMotion() ? 0.3 : 1
    const timers: ReturnType<typeof setTimeout>[] = []
    const at = (ms: number, f: () => void) => timers.push(setTimeout(f, ms * k))
    const tl = gsap.timeline()
    const v = vill ? VILL[portrait ? 'port' : 'land'] : null
    if (v && villRef.current && sceneRef.current && !reducedMotion()) {
      gsap.set(sceneRef.current, { opacity: 0 })
      tl.fromTo(villRef.current, { opacity: 0 }, { opacity: 1, duration: 2.6, ease: 'power1.inOut' }, 0)
        .set(villRef.current, { transformOrigin: `${v.x * 100}% ${v.y * 100}%` }, 0)
      at(900, () => setLine(1)); at(3100, () => setLine(2)); at(6000, () => setLine(3))
      tl.to(villRef.current, { scale: v.s, y: v.dy * innerHeight, duration: 4.6, ease: 'power2.inOut' }, 6.0)
        .to(villRef.current.querySelector('img'), { y: -6, duration: 0.27, yoyo: true, repeat: 15, ease: 'sine.inOut' }, 6.0)
        .to(sceneRef.current, { opacity: 1, duration: 1.8, ease: 'power1.inOut' }, 9.0)
        .to(villRef.current, { opacity: 0, duration: 1.2 }, 10.0)
      at(10800, () => setReady(true))
    } else {
      if (sceneRef.current) gsap.to(sceneRef.current, { opacity: 1, duration: 2, delay: 5.6 * k })
      at(800, () => setLine(1)); at(2900, () => setLine(2)); at(5600, () => setLine(3)); at(7600, () => setReady(true))
    }
    return () => { timers.forEach(clearTimeout); tl.kill() }
  }, [vill, portrait])

  const finish = () => { store.set('opened', true); onOpen() }

  const open = () => {
    if (opening) return
    setOpening(true)
    const q = (s: string) => root.current!.querySelectorAll(s)
    if (reducedMotion()) { gsap.to(root.current, { opacity: 0, duration: 0.8, onComplete: finish }); return }
    const dust = (n: number) => panels.current && shed.burst(n, panels.current.getBoundingClientRect())
    const rumble = (tl: gsap.core.Timeline, at: number, amp: number, steps: number) => {
      for (let i = 0; i < steps; i++) tl.to(box.current, { x: (Math.random() - 0.5) * amp, y: (Math.random() - 0.5) * amp, duration: 0.045, ease: 'none' }, at + i * 0.045)
      tl.to(box.current, { x: 0, y: 0, duration: 0.08 }, at + steps * 0.045)
    }
    const tl = gsap.timeline({ onComplete: finish })
    tl.to(q('.door-cta'), { opacity: 0, y: 10, duration: 0.5 }, 0)
      .to(box.current, { scale: 1.32, duration: 3, ease: 'power2.inOut' }, 0)
    // 1. a low rumble: the snow on the garland starts to slide
    rumble(tl, 0.7, 3, 22)
    tl.add(() => dust(22), 0.9).add(() => dust(26), 1.5)
      .fromTo(q('.door-light'), { opacity: 0 }, { opacity: 0.8, duration: 2, ease: 'power1.in' }, 1.8)
      .fromTo(q('.door-glow'), { opacity: 0 }, { opacity: 0.8, duration: 2.4, ease: 'power1.in' }, 1.8)
    // 2. the heavy leaves creak off their latch, then swing wide with their own weight
    tl.to(q('.door-panel-l'), { rotateY: 13, duration: 1.3, ease: 'power2.in' }, 1.4)
      .to(q('.door-panel-r'), { rotateY: -13, duration: 1.3, ease: 'power2.in' }, 1.5)
      .add(() => dust(46), 2.6)
      .to(q('.door-panel-l'), { rotateY: 104, duration: 1.7, ease: 'power1.inOut' }, 2.7)
      .to(q('.door-panel-r'), { rotateY: -104, duration: 1.7, ease: 'power1.inOut' }, 2.8)
      .to(q('.door-shade'), { opacity: 1, duration: 1.8, ease: 'power1.inOut' }, 2.7)
      .add(() => dust(54), 3.3)
      .add(() => setBurst(true), 3.4)
    // 3. they hit the wall with a thud
    tl.to(q('.door-panel-l'), { rotateY: 97, duration: 0.5, ease: 'power2.out' }, 4.4)
      .to(q('.door-panel-r'), { rotateY: -97, duration: 0.5, ease: 'power2.out' }, 4.5)
    rumble(tl, 4.4, 9, 7)
    tl.add(() => dust(40), 4.45)
    // 4. and we run in between them toward the light
    tl.to(box.current, { scale: 14, duration: 2.5, ease: 'power3.in' }, 4.0)
      .set(q('.door-img, .door-panels, .door-scrim, .door-glow'), { visibility: 'hidden' }, 6.2)
      .to(q('.door-flash'), { opacity: 0.85, duration: 1.4, ease: 'power1.in' }, 5.6)
      .to(root.current, { opacity: 0, duration: 1.4 }, 6.6)
  }

  const leaf = (side: 'l' | 'r') => (
    <div className={`door-panel door-panel-${side}`}>
      {tex && Array.from({ length: SLICES }, (_, k) => (
        <i key={k} className="slice" style={{ backgroundImage: `url(${k === 0 ? (side === 'l' ? tex.left : tex.right) : side === 'l' ? tex.leftDark : tex.rightDark})`, transform: `translateZ(calc(var(--depth) * ${(-k / (SLICES - 1)).toFixed(3)}))` }} />
      ))}
      {tex && <i className="slice door-shade" style={{ backgroundImage: `url(${side === 'l' ? tex.leftDark : tex.rightDark})`, transform: 'translateZ(.6px)' }} />}
    </div>
  )

  return (
    <div ref={root} className="door">
      <div className="door-sky" />

      {vill && (
        <div ref={villRef} className="door-vill door-cover" style={{ ['--ar' as string]: portrait ? 9 / 16 : 16 / 9 }}>
          <img src={vill} alt="" draggable={false} />
          <VillageLife portrait={portrait} />
        </div>
      )}

      <div ref={sceneRef} className="door-scene">
        <div ref={box} className="door-box door-cover" style={{ ['--ar' as string]: g.aspect, transformOrigin: g.origin }}>
          <div className="door-glow" />
          <div className="door-light" style={{ left: g.area.left, top: g.area.top, width: g.area.width, height: g.area.height, clipPath: g.lightClip }} />
          {tex && <img src={tex.frame} className="door-img" alt="" draggable={false} />}
          <div ref={panels} className="door-panels" style={{ left: g.area.left, top: g.area.top, width: g.area.width, height: g.area.height }}>
            {leaf('l')}{leaf('r')}
          </div>
        </div>
        <div className="door-scrim" />
      </div>

      <div className={`door-intro ${vill ? 'top' : ''}`}>
        <p className={`door-line1 reveal ${line === 1 || line === 2 ? 'in' : ''}`}>{content.door.line1}</p>
        <h1 className={`door-line2 ${line === 2 ? 'in' : ''}`}><span className="mask-line"><span>{content.door.line2}</span></span></h1>
      </div>

      <SnowParticles density={vill ? 1.5 : 1.1} burst={burst} />
      <canvas ref={shed.cv} className="door-shed" />
      {returning && !opening && <button className="door-skip" onClick={finish}>{ui.skip}</button>}

      <div className={`door-cta reveal ${ready ? 'in' : ''}`}>
        <button className="btn-gold" onClick={open} disabled={opening || !ready}>{content.door.button}</button>
      </div>
      <div className="door-flash" />
    </div>
  )
}
