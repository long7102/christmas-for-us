import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getMemory, musicbox as copy } from '../content/content'
import { ModalView, type Modal } from './Letter'
import { reducedMotion } from '../lib/device'
import { sfx } from '../lib/audio'
import { lights, useLights } from '../lib/lights'
import { Dust } from './Tree'
import { polyBox } from './treeLayout'
import { MB } from './musicLayout'

const PLAY_MS = 26000
/** Các nốt tạm cho hộp nhạc (thang ngũ cung Rê trưởng, nhẹ nhàng). Sẽ thay bằng nhạc thật khi Long gửi. */
const NOTES = [587, 659, 740, 880, 988, 1175, 1319, 988, 880, 740, 659, 880]

const pts = (p: [number, number][]) => p.map((q) => q.join(',')).join(' ')

/**
 * Cảnh hộp nhạc. Vũ công là ảnh cắt rời xoay quanh trục đứng (co giãn ngang theo cos, mặt sau tối hơn),
 * bóng của cô đổ lên lòng nắp hộp cùng hướng với ánh lửa bên trái và xoay theo cô; ánh lửa chập chờn làm bóng cũng lay nhẹ.
 */
export default function MusicBox({ active = true }: { active?: boolean }) {
  const sec = useRef<HTMLElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const txt = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const dancer = useRef<HTMLDivElement>(null)
  const shadow = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<'wide' | 'tall'>(() => (innerWidth / innerHeight < 1.05 ? 'tall' : 'wide'))
  const [g, setG] = useState({ s: 1, x: 0, y: 0 })
  const [playing, setPlaying] = useState(false)
  const [tip, setTip] = useState<{ title: string; text: string; b: { x: number; y: number; w: number; h: number } } | null>(null)
  const lightsOn = useLights()
  const [modal, setModal] = useState<Modal>(null)
  const [snd, setSnd] = useState(() => sfx.running && !sfx.muted)
  const st = useRef({ play: false, th: 0, w: 0, until: 0 })
  const timers = useRef<number[]>([])
  const note = useRef(0)

  useEffect(() => {
    const el = sec.current!
    const measure = () => setMode(el.clientWidth / el.clientHeight < 1.05 ? 'tall' : 'wide')
    measure()
    const ro = new ResizeObserver(measure); ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useLayoutEffect(() => {
    const el = host.current!
    const fit = () => {
      const vw = el.clientWidth, vh = el.clientHeight, F = MB.focus
      const band = mode === 'tall' ? txt.current?.offsetHeight ?? 0 : 0
      const vis = vh - band
      let s = Math.max(vw / MB.w, vh / MB.h)
      if (mode === 'tall') s = Math.max(vw / MB.w, Math.min(s, vis / (F.y2 - F.y1 + 20)))
      const cx = (F.x1 + F.x2) / 2
      let x = Math.min(0, Math.max(vw - MB.w * s, vw / 2 - cx * s))
      let y = mode === 'tall' ? Math.min(0, Math.max(vis - MB.h * s, 8 - F.y1 * s)) : Math.min(0, Math.max(vh - MB.h * s, (vh - MB.h * s) / 2))
      if (mode === 'wide') y = Math.min(0, vh - MB.h * s)
      setG({ s, x, y })
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el); if (txt.current) ro.observe(txt.current)
    return () => ro.disconnect()
  }, [mode])

  // vòng chạy: xoay vũ công, bóng đổ theo, ánh lửa chập chờn (chỉ khi cảnh đang hiện)
  useEffect(() => {
    const dEl = dancer.current, sEl = shadow.current, root = stage.current
    if (!dEl || !sEl || !root || !active) return
    const calm = reducedMotion()
    let raf = 0, last = performance.now(), fire = 0.85, tFire = 0.85, nFire = 0
    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      const s = st.current
      // tốc độ quay: tăng dần khi vặn khoá; hết giờ thì giảm và dừng lại đúng lúc quay mặt về phía trước
      if (s.play && t > s.until) s.play = false
      if (s.play) s.w += (1.55 - s.w) * (1 - Math.exp(-dt / 0.9))
      else {
        const tgt = Math.ceil((s.th - 0.15) / (2 * Math.PI)) * 2 * Math.PI
        const rem = tgt - s.th
        s.w = Math.min(s.w, Math.max(0.12, rem * 1.6))
        if (rem < 0.012) { s.th = tgt; s.w = 0 }
      }
      s.th += s.w * dt
      nFire -= dt
      if (nFire <= 0) { nFire = 0.5 + Math.random() * 0.9; tFire = Math.random() < 0.12 ? 0.55 + Math.random() * 0.15 : 0.75 + Math.random() * 0.25 }
      fire += ((calm ? 0.85 : tFire) - fire) * (1 - Math.exp(-dt / 0.3))
      const c = Math.cos(s.th), sn = Math.sin(s.th)
      // tạm thời: chưa có ảnh vũ công quay đủ góc nên chỉ lắc nhẹ, KHÔNG xoay giả (trông dẹt); sẽ thay bằng chuỗi ảnh Long tạo
      const sway = Math.min(1, s.w / 1.5)
      dEl.style.transform = `rotate(${(sn * 1.6 * sway).toFixed(2)}deg) scaleX(${(1 + 0.012 * c * sway).toFixed(3)})`
      dEl.style.filter = `brightness(${(0.9 + 0.1 * fire).toFixed(3)})`
      // bóng: ánh lửa ở bên trái nên bóng đổ sang phải, lệch thêm theo độ rộng hiện tại; lửa mạnh thì bóng đậm và gần hơn
      const near = 26 - 5 * (fire - 0.8)
      sEl.style.transform = `translateX(${(near + 1.5 * sn * sway).toFixed(2)}px) rotate(${(sn * 1.6 * sway).toFixed(2)}deg) scaleY(1.02)`
      sEl.style.opacity = (0.3 + 0.18 * fire).toFixed(3)
      root.style.setProperty('--mfl', fire.toFixed(3))
      root.style.setProperty('--mspin', Math.min(1, s.w / 1.5).toFixed(3))
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(draw) } }
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis) }
  }, [active])

  const stop = () => { st.current.play = false; setPlaying(false); timers.current.forEach(clearInterval); timers.current = [] }
  useEffect(() => { if (!active && st.current.play) stop() }, [active])
  useEffect(() => () => { timers.current.forEach(clearInterval); timers.current.forEach(clearTimeout) }, [])

  /** Bấm vũ công hoặc hộp: vặn khoá và nghe nhạc, bấm nữa thì dừng. */
  const wind = () => {
    setTip(null)
    if (st.current.play) { stop(); return }
    st.current.play = true; st.current.until = performance.now() + PLAY_MS
    setPlaying(true)
    sfx.ratchet()
    note.current = 0
    timers.current.push(window.setTimeout(() => {
      timers.current.push(window.setInterval(() => {
        if (!st.current.play) { stop(); return }
        sfx.pluck(NOTES[note.current++ % NOTES.length], 0.09)
      }, 520))
    }, 900))
  }
  const toggleLamp = () => { setTip(null); lights.toggle() }

  const show = (title: string, text: string, poly: [number, number][]) => setTip({ title, text, b: polyBox(poly) })
  const key = (f: () => void) => (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f() } }
  const L = MB, d = L.dancer
  const [lx, ly, lr] = L.lantern

  return (
    <section id="musicbox" className={`tree-scene mb-scene ${mode}${playing ? ' playing' : ''}${lightsOn ? '' : ' lights-off'}`} ref={sec}>
      <div className="sec-frame" ref={host}>
        <div className="tr-stage" ref={stage} style={{ width: L.w, height: L.h, transform: `translate(${g.x}px, ${g.y}px) scale(${g.s})` }}>
          <img src={L.src} alt="Hộp nhạc gỗ óc chó với cô vũ công nhỏ, bên cạnh bếp lửa và cây thông" draggable={false} />

          {/* bóng vũ công đổ lên lòng nắp hộp (cắt theo lòng nắp, không tràn ra ngoài) */}
          <div className="mb-shadowclip" style={{ clipPath: `ellipse(${L.lid.rx}px ${L.lid.ry}px at ${L.lid.cx}px ${L.lid.cy}px)` }}>
            <div className="mb-shadow" ref={shadow} style={{ left: d.box.x, top: d.box.y, width: d.box.w, height: d.box.h, transformOrigin: `${d.axis - d.box.x}px 100%`, WebkitMaskImage: `url(${d.src})`, maskImage: `url(${d.src})` }} />
          </div>
          {/* bóng tiếp xúc dưới chân, trên đĩa đồng */}
          <i className="mb-contact" style={{ left: d.axis - 30, top: d.feetY - 7, width: 60, height: 14 }} />

          <div className="mb-dancer" ref={dancer} style={{ left: d.box.x, top: d.box.y, width: d.box.w, height: d.box.h, transformOrigin: `${d.axis - d.box.x}px 100%`, backgroundImage: `url(${d.src})` }} />

          {/* ánh đồng lấp lánh trên đĩa và lược khi đang chạy */}
          <i className="mb-glint disk" style={{ left: 880, top: 481, width: 84, height: 18 }} />
          <i className="mb-glint comb" style={{ left: 866, top: 548, width: 110, height: 28 }} />

          {/* ánh lửa bên trái chập chờn phủ lên cả cảnh */}
          <div className="mb-fire" />
          <i className="mb-lantern" style={{ left: lx - lr * 3.2, top: ly - lr * 3.2, width: lr * 6.4, height: lr * 6.4 }} />
          {active && <Dust w={L.w} h={L.h} />}
          <div className="mb-dark" />

          {/* bóng đèn mờ của cây thông và ngọn đèn lồng: tối đèn lớn thì vẫn sáng */}
          <div className="mb-bokeh" aria-hidden>
            {L.bokeh.map(([x, y], i) => <i key={i} style={{ left: x, top: y, animationDelay: `-${((i * 37) % 29) / 10}s`, animationDuration: `${2.8 + (i % 5) * 0.5}s` }} />)}
            <i className="lamp" style={{ left: lx, top: ly, width: lr * 2, height: lr * 2 }} />
          </div>

          <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
            {(['books', 'pine'] as const).map((id) => {
              const m = getMemory(id)!, open = () => { setTip(null); setModal({ kind: 'memory', id }) }
              return (
                <polygon key={id} className="cat-hs" points={pts(L.polys[id])} tabIndex={0} role="button" aria-label={m.title}
                  onMouseEnter={() => show(m.title, m.tip, L.polys[id])} onMouseLeave={() => setTip(null)} onFocus={() => show(m.title, m.tip, L.polys[id])} onBlur={() => setTip(null)}
                  onClick={open} onKeyDown={key(open)} />
              )
            })}
            <polygon className="cat-hs" points={pts(L.lanternPoly)} tabIndex={0} role="button" aria-label="Đèn lồng"
              onMouseEnter={() => show(copy.lamp.title, lightsOn ? copy.lamp.tipOn : copy.lamp.tipOff, L.lanternPoly)} onMouseLeave={() => setTip(null)}
              onFocus={() => show(copy.lamp.title, lightsOn ? copy.lamp.tipOn : copy.lamp.tipOff, L.lanternPoly)} onBlur={() => setTip(null)} onClick={toggleLamp} onKeyDown={key(toggleLamp)} />
            <polygon className="cat-hs" points={pts(L.polys.box)} tabIndex={0} role="button" aria-label="Hộp nhạc"
              onMouseEnter={() => show(copy.box.title, playing ? copy.box.tipOn : copy.box.tip, L.polys.box)} onMouseLeave={() => setTip(null)}
              onFocus={() => show(copy.box.title, playing ? copy.box.tipOn : copy.box.tip, L.polys.box)} onBlur={() => setTip(null)} onClick={wind} onKeyDown={key(wind)} />
            <polygon className="cat-hs" points={pts(L.polys.bal)} tabIndex={0} role="button" aria-label="Cô vũ công"
              onMouseEnter={() => show(copy.dancer.title, playing ? copy.dancer.tipOn : copy.dancer.tip, L.polys.bal)} onMouseLeave={() => setTip(null)}
              onFocus={() => show(copy.dancer.title, playing ? copy.dancer.tipOn : copy.dancer.tip, L.polys.bal)} onBlur={() => setTip(null)} onClick={wind} onKeyDown={key(wind)} />
          </svg>
        </div>
      </div>

      <div className="mb-veil" aria-hidden />
      <div className="sec-text" ref={txt}>
        <h2 className="sec-title">{copy.title}</h2>
        <div className="sec-orn" aria-hidden><i /><b>❦</b><i /></div>
        <p className="sec-tag">{copy.tagline}</p>
        {copy.body.map((t, i) => <p key={i} className="sec-desc">{t}</p>)}
        <p className="sec-hint"><span aria-hidden>✦</span>{copy.hint}</p>
      </div>

      <button className="tr-sound" aria-label={snd ? 'Tắt âm thanh' : 'Bật âm thanh'} onClick={() => { if (!sfx.running) { sfx.setMuted(false); sfx.unlock() } else sfx.setMuted(!sfx.muted); setSnd(sfx.running && !sfx.muted) }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M4 9v6h4l5 4V5L8 9z" />{snd ? <><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" /></> : <path d="M17 9l5 6M22 9l-5 6" />}</svg>
      </button>
      <button className="tr-lights" aria-label={lightsOn ? 'Tắt đèn' : 'Bật đèn'} title={lightsOn ? 'Tắt đèn, chỉ còn ánh lửa' : 'Bật đèn lại'} onClick={() => lights.toggle()}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill={lightsOn ? 'currentColor' : 'none'} fillOpacity=".25" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V16h5v-.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z" />{lightsOn && <path d="M12 1v0M4 6L3 5M20 6l1-1M2 12H1M23 12h-1" strokeWidth="1.4" />}</svg>
      </button>

      {modal && <ModalView modal={modal} onClose={() => setModal(null)} />}
      {tip && (() => {
        const W = sec.current?.clientWidth ?? 800
        const cx = Math.min(Math.max(g.x + (tip.b.x + tip.b.w / 2) * g.s, 150), W - 150)
        const above = g.y + tip.b.y * g.s > 130
        const top = above ? g.y + tip.b.y * g.s - 12 : g.y + (tip.b.y + tip.b.h) * g.s + 12
        return <div className="tr-tip" style={{ left: cx, top, transform: `translate(-50%, ${above ? '-100%' : '0'})` }}><b>{tip.title}</b><span>{tip.text}</span></div>
      })()}
    </section>
  )
}
