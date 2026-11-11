import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { SnowParticles } from '../components/SnowParticles'
import { content, ui } from '../content/content'
import { store } from '../lib/storage'
import { reducedMotion, usePortrait } from '../lib/device'
import { LAND, PORT, build, pixelShapes } from './doorGeometry'
import landImg from '../assets/door-land.webp'
import portImg from '../assets/door-port.webp'

/** Bakes the frame (with the doors cut out) and each leaf into its own transparent texture, so no clip-path is needed while animating. */
function useDoorTextures(src: string, geo: typeof LAND) {
  const [tex, setTex] = useState<{ frame: string; left: string; right: string } | null>(null)
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
      Promise.all([
        make(geo.w, geo.h, (c) => { c.drawImage(im, 0, 0); c.globalCompositeOperation = 'destination-out'; path(c, sh.ring); c.fill() }),
        make(sh.bw, sh.bh, (c) => { path(c, sh.leafL, sh.x0, sh.y0); c.clip(); c.drawImage(im, -sh.x0, -sh.y0) }),
        make(sh.bw, sh.bh, (c) => { path(c, sh.leafR, sh.cx, sh.y0); c.clip(); c.drawImage(im, -sh.cx, -sh.y0) }),
      ]).then(([frame, left, right]) => !dead && setTex({ frame, left, right }))
    }
    im.src = src
    return () => { dead = true }
  }, [src, geo])
  return tex
}

export default function Door({ onOpen }: { onOpen: () => void }) {
  const portrait = usePortrait()
  const g = useMemo(() => build(portrait ? PORT : LAND), [portrait])
  const img = portrait ? portImg : landImg
  const tex = useDoorTextures(img, portrait ? PORT : LAND)

  const root = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState(0) // 0 dark, 1 line1, 2 line2, 3 door appears, 4 button
  const [opening, setOpening] = useState(false)
  const [burst, setBurst] = useState(false)
  const returning = store.get('opened', false)

  useEffect(() => {
    const k = reducedMotion() ? 0.3 : 1
    const t = [800, 2900, 5600, 7600].map((ms, i) => setTimeout(() => setStage(i + 1), ms * k))
    return () => t.forEach(clearTimeout)
  }, [])

  const finish = () => { store.set('opened', true); onOpen() }

  const open = () => {
    if (opening) return
    setOpening(true)
    const q = (s: string) => root.current!.querySelectorAll(s)
    if (reducedMotion()) { gsap.to(root.current, { opacity: 0, duration: 0.8, onComplete: finish }); return }
    const tl = gsap.timeline({ onComplete: finish })
    tl.to(q('.door-cta'), { opacity: 0, y: 10, duration: 0.5 }, 0)
      // we step toward the door; it trembles as if warm light is pushing from the other side
      .to(box.current, { scale: 1.35, duration: 2.4, ease: 'power2.inOut' }, 0)
      .to(q('.door-panel'), { rotateY: (i: number) => (i ? -1.4 : 1.4), duration: 0.07, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 0.5)
      .fromTo(q('.door-light'), { opacity: 0 }, { opacity: 0.8, duration: 1.4, ease: 'power1.in' }, 1)
      .fromTo(q('.door-glow'), { opacity: 0 }, { opacity: 0.8, duration: 2, ease: 'power1.in' }, 1)
      // both whole leaves swing open on their hinges, slightly darkening as they turn away
      .to(q('.door-panel-l'), { rotateY: 100, duration: 2.3, ease: 'power2.inOut' }, 1.4)
      .to(q('.door-panel-r'), { rotateY: -100, duration: 2.3, ease: 'power2.inOut' }, 1.4)
      .to(q('.door-shade'), { opacity: 0.5, duration: 2.3, ease: 'power2.inOut' }, 1.4)
      .add(() => setBurst(true), 2.4)
      // then we run in between them: the walls rush past, only warm light is left ahead
      .to(box.current, { scale: 14, duration: 2.4, ease: 'power3.in' }, 3.1)
      .to(box.current, { y: -10, duration: 0.22, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 3.1)
      // once the walls have left the screen, stop drawing them at all
      .set(q('.door-img, .door-panels, .door-scrim, .door-glow'), { visibility: 'hidden' }, 4.4)
      .to(q('.door-flash'), { opacity: 0.85, duration: 1.5, ease: 'power1.in' }, 4.2)
      .to(root.current, { opacity: 0, duration: 1.5 }, 5.1)
  }

  return (
    <div ref={root} className="door">
      <div className="door-sky" />

      <div className="door-intro">
        <p className={`door-line1 reveal ${stage >= 1 && stage < 3 ? 'in' : ''}`}>{content.door.line1}</p>
        <h1 className={`door-line2 ${stage >= 2 && stage < 3 ? 'in' : ''}`}><span className="mask-line"><span>{content.door.line2}</span></span></h1>
      </div>

      <div className={`door-scene ${stage >= 3 ? 'on' : ''}`}>
        <div ref={box} className="door-box" style={{ ['--ar' as string]: g.aspect, transformOrigin: g.origin }}>
          <div className="door-glow" />
          <div className="door-light" style={{ ...g.area, clipPath: g.lightClip }} />
          {tex && <img src={tex.frame} className="door-img" alt="" draggable={false} />}
          <div className="door-panels" style={g.area}>
            {tex && <div className="door-panel door-panel-l" style={{ backgroundImage: `url(${tex.left})` }}><i className="door-shade" /></div>}
            {tex && <div className="door-panel door-panel-r" style={{ backgroundImage: `url(${tex.right})` }}><i className="door-shade" /></div>}
          </div>
        </div>
        <div className="door-scrim" />
      </div>

      <SnowParticles density={1.1} burst={burst} />
      {returning && !opening && <button className="door-skip" onClick={finish}>{ui.skip}</button>}

      <div className={`door-cta reveal ${stage >= 4 ? 'in' : ''}`}>
        <button className="btn-gold" onClick={open} disabled={opening || stage < 4}>{content.door.button}</button>
      </div>
      <div className="door-flash" />
    </div>
  )
}
