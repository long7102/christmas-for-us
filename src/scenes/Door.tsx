import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { SnowParticles } from '../components/SnowParticles'
import { content, ui } from '../content/content'
import { store } from '../lib/storage'
import { reducedMotion, usePortrait } from '../lib/device'
import { LAND, PORT, build } from './doorGeometry'
import landImg from '../assets/door-land.webp'
import portImg from '../assets/door-port.webp'

export default function Door({ onOpen }: { onOpen: () => void }) {
  const portrait = usePortrait()
  const g = useMemo(() => build(portrait ? PORT : LAND), [portrait])
  const img = portrait ? portImg : landImg
  const half = (pos: string, clip: string) => ({ backgroundImage: `url(${img})`, backgroundSize: g.bgSize, backgroundPosition: `${pos} ${g.posY}`, clipPath: clip })

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
      .to(box.current, { scale: 1.5, duration: 2.6, ease: 'power2.inOut' }, 0)
      .to(q('.door-panel'), { rotateY: (i: number) => (i ? -1.6 : 1.6), duration: 0.07, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 0.5)
      .fromTo(q('.door-light'), { opacity: 0 }, { opacity: 0.8, duration: 1.4, ease: 'power1.in' }, 1)
      .fromTo(q('.door-glow'), { opacity: 0 }, { opacity: 0.8, duration: 2, ease: 'power1.in' }, 1)
      // the doors burst inward
      .to(q('.door-panel-l'), { rotateY: 112, duration: 1.7, ease: 'back.out(1.3)' }, 1.5)
      .to(q('.door-panel-r'), { rotateY: -112, duration: 1.7, ease: 'back.out(1.3)' }, 1.5)
      .add(() => setBurst(true), 1.7)
      .to(q('.door-panel'), { opacity: 0, duration: 0.5 }, 3.0)
      // and we run in: the walls rush past, only warm light is left ahead
      .to(box.current, { scale: 16, duration: 2.3, ease: 'power3.in' }, 2.6)
      .to(box.current, { y: -10, duration: 0.22, yoyo: true, repeat: 9, ease: 'sine.inOut' }, 2.6)
      .to(q('.door-flash'), { opacity: 0.85, duration: 1.5, ease: 'power1.in' }, 3.7)
      .to(root.current, { opacity: 0, duration: 1.5 }, 4.6)
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
          <img src={img} className="door-img" style={{ clipPath: g.frameClip }} alt="" draggable={false} />
          <div className="door-panels" style={g.area}>
            <div className="door-panel door-panel-l" style={half(g.posL, g.clipL)} />
            <div className="door-panel door-panel-r" style={half(g.posR, g.clipR)} />
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
