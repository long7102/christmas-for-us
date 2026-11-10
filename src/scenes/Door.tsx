import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { Img } from '../components/Img'
import { SnowParticles } from '../components/SnowParticles'
import { content, ui } from '../content/content'
import { store } from '../lib/storage'
import { audio } from '../lib/audio'
import { reducedMotion } from '../lib/device'

/** The empty opening inside door/frame.png, as % of the frame image. Tune once the real frame exists. */
const OPENING = { l: 17, t: 13, w: 66, h: 80 }

export default function Door({ onOpen }: { onOpen: () => void }) {
  const root = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState(0) // 0 intro, 1 line1, 2 line2, 3 button
  const [opening, setOpening] = useState(false)
  const [burst, setBurst] = useState(false)
  const returning = store.get('opened', false)

  useEffect(() => {
    const fast = reducedMotion() ? 0.3 : 1
    const t = [setTimeout(() => setStage(1), 900 * fast), setTimeout(() => setStage(2), 3600 * fast), setTimeout(() => setStage(3), 5600 * fast)]
    return () => t.forEach(clearTimeout)
  }, [])

  const finish = () => {
    store.set('opened', true)
    onOpen()
  }

  const open = () => {
    if (opening) return
    setOpening(true)
    audio.unlock()
    audio.ambient('wind', 0.25)
    audio.once('chime', 0.4)
    const q = (s: string) => root.current!.querySelectorAll(s)
    const tl = gsap.timeline({ onComplete: finish })
    const fast = reducedMotion()
    if (fast) {
      tl.to(root.current, { opacity: 0, duration: 0.8 })
      return
    }
    tl.to(q('.door-copy, .door-cta'), { opacity: 0, y: -12, duration: 0.7, ease: 'power2.out' }, 0)
      // handle wiggle
      .to(q('.door-panel'), { rotateY: (i: number) => (i ? -3 : 3), duration: 0.09, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.1)
      .to(q('.door-panel-l'), { rotateY: -108, duration: 2.6, ease: 'power2.inOut' }, 0.8)
      .to(q('.door-panel-r'), { rotateY: 108, duration: 2.6, ease: 'power2.inOut' }, 0.8)
      .fromTo(q('.door-light'), { opacity: 0.2, scale: 0.9 }, { opacity: 1, scale: 1.25, duration: 2.6, ease: 'power2.in' }, 0.9)
      .add(() => setBurst(true), 1.7)
      .to(box.current, { scale: 7, duration: 2.1, ease: 'power3.in' }, 2.6)
      .to(q('.door-flash'), { opacity: 1, duration: 0.9, ease: 'power2.in' }, 3.8)
      .to(root.current, { opacity: 0, duration: 1.1, ease: 'power1.out' }, 4.5)
  }

  return (
    <div ref={root} className="door" data-opening={opening}>
      <div className="door-sky" />
      <SnowParticles density={0.9} burst={burst} />

      {returning && !opening && (
        <button className="door-skip" onClick={() => { audio.unlock(); finish() }}>
          {ui.skip}
        </button>
      )}

      <div className="door-copy">
        <p className={`door-line1 reveal ${stage >= 1 ? 'in' : ''}`}>{content.door.line1}</p>
        <h1 className={`door-line2 ${stage >= 2 ? 'in' : ''}`}>
          <span className="mask-line"><span>{content.door.line2}</span></span>
        </h1>
      </div>

      <div className="door-stage">
        <div ref={box} className="door-box" style={{ transformOrigin: `${OPENING.l + OPENING.w / 2}% ${OPENING.t + OPENING.h / 2}%` }}>
          <div className="door-light" style={{ left: `${OPENING.l}%`, top: `${OPENING.t}%`, width: `${OPENING.w}%`, height: `${OPENING.h}%` }} />
          <div className="door-panels" style={{ left: `${OPENING.l}%`, top: `${OPENING.t}%`, width: `${OPENING.w}%`, height: `${OPENING.h}%` }}>
            <Img name="door/panel-left.png" className="door-panel door-panel-l" />
            <Img name="door/panel-right.png" className="door-panel door-panel-r" />
          </div>
          <Img name="door/frame.png" className="door-frame" />
        </div>
      </div>

      <div className={`door-cta reveal ${stage >= 3 ? 'in' : ''}`}>
        <button className="btn-gold" onClick={open} disabled={opening || stage < 3}>
          {content.door.button}
        </button>
      </div>

      <div className="door-flash" />
    </div>
  )
}
