import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { SnowParticles } from '../components/SnowParticles'
import doorImg from '../assets/door.webp'
import { content, ui } from '../content/content'
import { store } from '../lib/storage'
import { reducedMotion } from '../lib/device'

/** The door opening inside door.webp (597x799), in % of the image. Left/right halves swing inward. */
const O = { l: 22.6, t: 22.5, w: 54.8, h: 71.1 }
const BG = `${100 / (O.w / 200)}% ${100 / (O.h / 100)}%` // each half shows exactly its slice of the image
const posY = `${(O.t / 100 / (1 - O.h / 100)) * 100}%`
const posL = `${(O.l / 100 / (1 - O.w / 200)) * 100}%`
const posR = `${((O.l + O.w / 2) / 100 / (1 - O.w / 200)) * 100}%`
const half = (pos: string) => ({ backgroundImage: `url(${doorImg})`, backgroundSize: BG, backgroundPosition: `${pos} ${posY}` })

export default function Door({ onOpen }: { onOpen: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState(0)
  const [opening, setOpening] = useState(false)
  const [burst, setBurst] = useState(false)
  const returning = store.get('opened', false)

  useEffect(() => {
    const k = reducedMotion() ? 0.3 : 1
    const t = [setTimeout(() => setStage(1), 900 * k), setTimeout(() => setStage(2), 3400 * k), setTimeout(() => setStage(3), 5200 * k)]
    return () => t.forEach(clearTimeout)
  }, [])

  const finish = () => { store.set('opened', true); onOpen() }

  const open = () => {
    if (opening) return
    setOpening(true)
    const q = (s: string) => root.current!.querySelectorAll(s)
    if (reducedMotion()) { gsap.to(root.current, { opacity: 0, duration: 0.8, onComplete: finish }); return }
    gsap.timeline({ onComplete: finish })
      .to(q('.door-copy, .door-cta'), { opacity: 0, y: -12, duration: 0.7 }, 0)
      .to(q('.door-panel'), { rotateY: (i: number) => (i ? -2.5 : 2.5), duration: 0.09, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.1)
      .to(q('.door-panel-l'), { rotateY: 104, duration: 2.6, ease: 'power2.inOut' }, 0.8)
      .to(q('.door-panel-r'), { rotateY: -104, duration: 2.6, ease: 'power2.inOut' }, 0.8)
      .fromTo(q('.door-light'), { opacity: 0.2, scale: 0.9 }, { opacity: 1, scale: 1.25, duration: 2.6, ease: 'power2.in' }, 0.9)
      .fromTo(q('.door-glow'), { opacity: 0 }, { opacity: 1, duration: 2.4, ease: 'power2.in' }, 1)
      .add(() => setBurst(true), 1.7)
      .to(box.current, { scale: 7, duration: 2.1, ease: 'power3.in' }, 2.6)
      .to(q('.door-flash'), { opacity: 1, duration: 0.9, ease: 'power2.in' }, 3.8)
      .to(root.current, { opacity: 0, duration: 1.1 }, 4.5)
  }

  const area = { left: `${O.l}%`, top: `${O.t}%`, width: `${O.w}%`, height: `${O.h}%` }
  return (
    <div ref={root} className="door">
      <div className="door-sky" />
      <SnowParticles density={0.9} burst={burst} />
      {returning && !opening && <button className="door-skip" onClick={finish}>{ui.skip}</button>}

      <div className="door-copy">
        <p className={`door-line1 reveal ${stage >= 1 ? 'in' : ''}`}>{content.door.line1}</p>
        <h1 className={`door-line2 ${stage >= 2 ? 'in' : ''}`}><span className="mask-line"><span>{content.door.line2}</span></span></h1>
      </div>

      <div className="door-stage">
        <div ref={box} className="door-box" style={{ transformOrigin: `${O.l + O.w / 2}% ${O.t + O.h / 2}%` }}>
          <div className="door-glow" />
          <img src={doorImg} className="door-img" alt="" draggable={false} />
          <div className="door-light" style={area} />
          <div className="door-panels" style={area}>
            <div className="door-panel door-panel-l" style={half(posL)} />
            <div className="door-panel door-panel-r" style={half(posR)} />
          </div>
        </div>
      </div>

      <div className={`door-cta reveal ${stage >= 3 ? 'in' : ''}`}>
        <button className="btn-gold" onClick={open} disabled={opening || stage < 3}>{content.door.button}</button>
      </div>
      <div className="door-flash" />
    </div>
  )
}
