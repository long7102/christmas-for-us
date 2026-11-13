import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getMemory, musicbox as copy } from '../content/content'
import { reducedMotion } from '../lib/device'
import { sfx } from '../lib/audio'
import { lights, useLights } from '../lib/lights'
import { Dust } from './Tree'
import { polyBox } from './treeLayout'
import { ModalView, type Modal } from './Letter'
import { MB } from './musicLayout'
import SoundControl from '../components/SoundControl'
import sugarUrl from '../assets/sugarplum-fairy.mp3'

/** Tệp nhạc bỏ thêm vào src/assets/music/ (tên tệp = id bài) sẽ tự được nhận. */
const FILES = import.meta.glob('../assets/music/*.{mp3,m4a,ogg,wav}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const urlFor = (id: string): string | undefined => {
  if (id === 'sugarplum-fairy') return sugarUrl
  const k = Object.keys(FILES).find((f) => f.split('/').pop()!.replace(/\.[^.]+$/, '') === id)
  return k ? FILES[k] : undefined
}
const TRACKS = copy.tracks.map((t) => ({ ...t, url: urlFor(t.id) }))
const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI']

const pts = (p: [number, number][]) => p.map((q) => q.join(',')).join(' ')
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** Mức nắp: 0 đóng, 1 hé mở, 2 mở hẳn. Ba ảnh cùng khung nên chuyển mờ chồng lên nhau là khớp. */
type Lid = 0 | 1 | 2

/**
 * Cảnh hộp nhạc. Hộp đóng lúc đầu; bấm thì nắp hé rồi mở hẳn, cô vũ công hiện ra và danh sách nhạc hiện bên cạnh.
 * Khi nhạc chạy, cô lắc nhẹ theo nhịp, bóng của cô đổ lên lòng nắp (ánh lửa ở bên trái nên bóng đổ sang phải) và lay theo ánh lửa.
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
  const [lid, setLid] = useState<Lid>(0)
  const [cur, setCur] = useState(0)
  const [listOpen, setListOpen] = useState(false)
  const [playing, setPlaying] = useState(() => sfx.musicPlaying)
  const [clock, setClock] = useState({ t: 0, d: 0 })
  const [tip, setTip] = useState<{ title: string; text: string; b: { x: number; y: number; w: number; h: number } } | null>(null)
  const [modal, setModal] = useState<Modal>(null)
  const lightsOn = useLights()
  const [snd, setSnd] = useState(() => sfx.running && !sfx.muted)
  const timers = useRef<number[]>([])
  const live = useRef({ playing, lid })
  live.current = { playing, lid }

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
      const x = Math.min(0, Math.max(vw - MB.w * s, vw / 2 - cx * s))
      const y = mode === 'tall' ? Math.min(0, Math.max(vis - MB.h * s, 8 - F.y1 * s)) : Math.min(0, vh - MB.h * s)
      setG({ s, x, y })
    }
    fit()
    const ro = new ResizeObserver(fit); ro.observe(el); if (txt.current) ro.observe(txt.current)
    return () => ro.disconnect()
  }, [mode])

  // theo dõi nhạc (phát/dừng, thời gian) để cô vũ công và danh sách đi theo
  useEffect(() => {
    const sync = () => { setPlaying(sfx.musicPlaying); setSnd(sfx.running && !sfx.muted) }
    sync()
    const off = sfx.subscribe(sync)
    const iv = setInterval(() => { if (live.current.lid === 2) setClock(sfx.musicClock()) }, 400)
    return () => { off(); clearInterval(iv) }
  }, [])

  // vòng chạy: cô vũ công xoay chậm khi nhạc chạy, bóng đổ theo, ánh lửa chập chờn (chỉ khi cảnh đang hiện)
  useEffect(() => {
    const dEl = dancer.current, sEl = shadow.current, root = stage.current
    if (!dEl || !sEl || !root || !active) return
    const calm = reducedMotion()
    let raf = 0, last = performance.now(), fire = 0.85, tFire = 0.85, nFire = 0, th = 0, w = 0, amp = 0, shown = -1
    const TAU = Math.PI * 2
    const sm = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k) }
    const layers = Array.from(dEl.children) as HTMLElement[]
    const draw = (t: number) => {
      const dt = Math.min(0.05, (t - last) / 1000); last = t
      const on = live.current.playing && live.current.lid === 2 && !calm
      amp += ((on ? 1 : 0) - amp) * (1 - Math.exp(-dt / 0.5))
      // quay chậm như hộp nhạc thật (khoảng 6 giây một vòng); dừng nhạc thì quay nốt về mặt trước rồi đứng yên
      if (on) w += (1.05 - w) * (1 - Math.exp(-dt / 0.8))
      else { const rem = Math.ceil((th - 0.02) / TAU) * TAU - th; w = Math.min(Math.max(w, rem > 0.02 ? 0.5 : 0), Math.max(0.12, rem * 1.4)); if (rem < 0.012) { th = 0; w = 0 } }
      th += w * dt
      nFire -= dt
      if (nFire <= 0) { nFire = 0.5 + Math.random() * 0.9; tFire = Math.random() < 0.12 ? 0.55 + Math.random() * 0.15 : 0.75 + Math.random() * 0.25 }
      fire += ((calm ? 0.85 : tFire) - fire) * (1 - Math.exp(-dt / 0.3))
      // góc hiện tại (độ, 0..360). Ba ảnh thật: mặt trước (0), quay lưng lệch phải (~165), quay lưng lệch trái (~195).
      // Giữa mặt trước và lưng chưa có ảnh nghiêng nên hai ảnh hoà vào nhau, kèm co ngang vừa phải cho ra cảm giác đang xoay.
      const deg = ((th % TAU) + TAU) % TAU * 180 / Math.PI
      const front = deg < 180 ? 1 - sm(52, 100, deg) : sm(260, 308, deg)
      const split = sm(168, 192, deg)
      const op = [front, (1 - front) * (1 - split), (1 - front) * split]
      layers.forEach((el, i) => { el.style.opacity = op[i].toFixed(3) })
      const turn = Math.sin(Math.PI * front) // 0 khi rõ một mặt, 1 ở giữa lúc chuyển
      const sx = 1 - 0.42 * turn
      const bob = Math.abs(Math.sin(th * 2)) * -1.2 * amp
      dEl.style.transform = `translateY(${bob.toFixed(2)}px) scaleX(${sx.toFixed(3)})`
      dEl.style.filter = `brightness(${((0.9 + 0.1 * fire) * (1 - 0.1 * turn)).toFixed(3)})`
      const dom = op[0] >= 0.5 ? 0 : op[1] >= op[2] ? 1 : 2
      if (dom !== shown) { shown = dom; const u = `url(${MB.dancer.frames[dom]})`; sEl.style.maskImage = u; sEl.style.setProperty('-webkit-mask-image', u) }
      const near = 26 - 5 * (fire - 0.8)
      sEl.style.transform = `translateX(${near.toFixed(2)}px) translateY(${bob.toFixed(2)}px) scaleX(${(1.04 * sx).toFixed(3)}) scaleY(1.02)`
      sEl.style.opacity = (0.3 + 0.18 * fire).toFixed(3)
      root.style.setProperty('--mfl', fire.toFixed(3))
      root.style.setProperty('--mspin', amp.toFixed(3))
      raf = requestAnimationFrame(draw)
    }
    raf = requestAnimationFrame(draw)
    const vis = () => { cancelAnimationFrame(raf); if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(draw) } }
    document.addEventListener('visibilitychange', vis)
    return () => { cancelAnimationFrame(raf); document.removeEventListener('visibilitychange', vis) }
  }, [active])

  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (f: () => void, ms: number) => timers.current.push(window.setTimeout(f, ms))

  /** Mở hoặc đóng nắp. Mở: hé rồi mở hẳn và bắt đầu phát nhạc; đóng: hé rồi đóng. */
  const toggleLid = () => {
    setTip(null)
    if (live.current.lid === 1) return // đang chuyển động
    if (live.current.lid === 0) {
      sfx.ratchet(); setLid(1)
      later(() => { setLid(2); sfx.playMusic() }, 750)
    } else {
      setLid(1)
      later(() => setLid(0), 650)
    }
  }
  /** Chọn một bài: đổi bài và phát; hết bài thì tự sang bài kế có sẵn. */
  const playTrack = (i: number) => {
    const t = TRACKS[i]
    if (!t.url) return
    if (i === cur && t.url === sfx.track) { sfx.toggleMusic(); return }
    setCur(i)
    sfx.setTrack(t.url, () => step(1, i))
  }
  const step = (dir: 1 | -1, from = cur) => {
    for (let k = 1; k <= TRACKS.length; k++) {
      const j = (from + dir * k + TRACKS.length * 4) % TRACKS.length
      if (TRACKS[j].url) { setCur(j); sfx.setTrack(TRACKS[j].url!, () => step(1, j)); return }
    }
  }
  const toggleLamp = () => { setTip(null); lights.toggle() }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => { const r = e.currentTarget.getBoundingClientRect(); sfx.seekMusic((e.clientX - r.left) / r.width); setClock(sfx.musicClock()) }

  const show = (title: string, text: string, poly: [number, number][]) => setTip({ title, text, b: polyBox(poly) })
  const key = (f: () => void) => (e: React.KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); f() } }
  const L = MB, d = L.dancer
  const [lx, ly, lr] = L.lantern
  const boxPoly = lid === 2 ? L.polys.boxOpen : lid === 1 ? L.polys.boxAjar : L.polys.boxClosed
  const boxCopy = lid === 2 ? copy.box.open : copy.box.closed
  const frac = clock.d ? clock.t / clock.d : 0

  return (
    <section id="musicbox" className={`tree-scene mb-scene ${mode}${lid === 2 ? ' open' : ''}${playing ? ' playing' : ''}${lightsOn ? '' : ' lights-off'}`} ref={sec}>
      <div className="sec-frame" ref={host}>
        <div className="tr-stage" ref={stage} style={{ width: L.w, height: L.h, transform: `translate(${g.x}px, ${g.y}px) scale(${g.s})` }}>
          <img className="mb-img" src={L.imgs.closed} alt="Hộp nhạc gỗ óc chó bên bếp lửa và cây thông" draggable={false} />
          <img className="mb-img mb-fade" style={{ opacity: lid >= 1 ? 1 : 0 }} src={L.imgs.ajar} alt="" draggable={false} />
          <img className="mb-img mb-fade slow" style={{ opacity: lid >= 2 ? 1 : 0 }} src={L.imgs.open} alt="" draggable={false} />

          {/* khi nắp mở: bóng vũ công đổ lên lòng nắp (cắt theo lòng nắp), bóng chạm dưới chân, và cô vũ công */}
          <div className={`mb-dance${lid === 2 ? ' on' : ''}`}>
            <div className="mb-shadowclip" style={{ clipPath: `ellipse(${L.lid.rx}px ${L.lid.ry}px at ${L.lid.cx}px ${L.lid.cy}px)` }}>
              <div className="mb-shadow" ref={shadow} style={{ left: d.box.x, top: d.box.y, width: d.box.w, height: d.box.h, transformOrigin: `${d.axis - d.box.x}px 100%`, WebkitMaskImage: `url(${d.frames[0]})`, maskImage: `url(${d.frames[0]})` }} />
            </div>
            <i className="mb-contact" style={{ left: d.axis - 30, top: d.feetY - 7, width: 60, height: 14 }} />
            <div className="mb-dancer" ref={dancer} style={{ left: d.box.x, top: d.box.y, width: d.box.w, height: d.box.h, transformOrigin: `${d.axis - d.box.x}px 100%` }}>
              {d.frames.map((f, i) => <i key={i} style={{ backgroundImage: `url(${f})`, opacity: i ? 0 : 1 }} />)}
            </div>
            <i className="mb-glint disk" style={{ left: 893, top: 503, width: 84, height: 18 }} />
            <i className="mb-glint comb" style={{ left: 866, top: 548, width: 110, height: 28 }} />
          </div>

          {/* ánh lửa bên trái chập chờn phủ lên cả cảnh */}
          <div className="mb-fire" />
          <i className="mb-lantern" style={{ left: lx - lr * 3.2, top: ly - lr * 3.2, width: lr * 6.4, height: lr * 6.4 }} />
          {active && <Dust w={L.w} h={L.h} />}
          <div className="mb-dark" />

          {/* bóng đèn mờ của cây thông, kệ sách và ngọn đèn lồng: tối đèn lớn thì vẫn sáng */}
          <div className="mb-bokeh" aria-hidden>
            {L.bokeh.map(([x, y], i) => <i key={i} style={{ left: x, top: y, animationDelay: `-${((i * 37) % 29) / 10}s`, animationDuration: `${2.8 + (i % 5) * 0.5}s` }} />)}
            <i className="lamp" style={{ left: lx, top: ly, width: lr * 2, height: lr * 2 }} />
          </div>

          <svg className="tr-hit" viewBox={`0 0 ${L.w} ${L.h}`}>
            {(['books', 'pine'] as const).map((id) => {
              const m = getMemory(id)!, openMemo = () => { setTip(null); setModal({ kind: 'memory', id }) }
              return (
                <polygon key={id} className="tr-hs" points={pts(L.polys[id])} tabIndex={0} role="button" aria-label={m.title}
                  onMouseEnter={() => show(m.title, m.tip, L.polys[id])} onMouseLeave={() => setTip(null)} onFocus={() => show(m.title, m.tip, L.polys[id])} onBlur={() => setTip(null)}
                  onClick={openMemo} onKeyDown={key(openMemo)} />
              )
            })}
            <polygon className="cat-hs" points={pts(L.lanternPoly)} tabIndex={0} role="button" aria-label="Đèn lồng"
              onMouseEnter={() => show(copy.lamp.title, lightsOn ? copy.lamp.tipOn : copy.lamp.tipOff, L.lanternPoly)} onMouseLeave={() => setTip(null)}
              onFocus={() => show(copy.lamp.title, lightsOn ? copy.lamp.tipOn : copy.lamp.tipOff, L.lanternPoly)} onBlur={() => setTip(null)} onClick={toggleLamp} onKeyDown={key(toggleLamp)} />
            <polygon className="cat-hs" points={pts(boxPoly)} tabIndex={0} role="button" aria-label={lid === 2 ? 'Đóng hộp nhạc' : 'Mở hộp nhạc'}
              onMouseEnter={() => show(boxCopy.title, boxCopy.tip, boxPoly)} onMouseLeave={() => setTip(null)}
              onFocus={() => show(boxCopy.title, boxCopy.tip, boxPoly)} onBlur={() => setTip(null)} onClick={toggleLid} onKeyDown={key(toggleLid)} />
            {lid === 2 && (
              <polygon className="cat-hs" points={pts(L.polys.bal)} tabIndex={0} role="button" aria-label="Cô vũ công"
                onMouseEnter={() => show(copy.dancer.title, copy.dancer.tip, L.polys.bal)} onMouseLeave={() => setTip(null)}
                onFocus={() => show(copy.dancer.title, copy.dancer.tip, L.polys.bal)} onBlur={() => setTip(null)} onClick={() => sfx.toggleMusic()} onKeyDown={key(() => sfx.toggleMusic())} />
            )}
          </svg>
        </div>
      </div>

      <div className="mb-veil" aria-hidden />
      <div className="sec-text" ref={txt}>
        <h2 className="sec-title">{copy.title}</h2>
        <div className="sec-orn" aria-hidden><i /><b>❦</b><i /></div>
        <p className="sec-tag">{copy.tagline}</p>
        {copy.body.map((t, i) => <p key={i} className="sec-desc">{t}</p>)}
        <p className="sec-hint"><span aria-hidden>✦</span>{lid === 2 ? copy.hintOpen : copy.hintClosed}</p>
      </div>

      {/* danh sách nhạc: gọn một viên thuốc ở góc trên trái khi nắp mở, bấm để mở tấm thẻ đồng khắc; điều khiển nhạc của cả trang */}
      <div className={`mb-pl${lid === 2 ? ' on' : ''}${listOpen ? ' expanded' : ''}`} aria-hidden={lid !== 2}>
        <div className="mb-pill">
          <button className="pp" disabled={lid !== 2} aria-label={playing ? 'Dừng nhạc' : 'Phát nhạc'} onClick={() => sfx.toggleMusic()}><i className={`disc${playing ? ' spin' : ''}`} /><em aria-hidden>{playing ? '❚❚' : '▶'}</em></button>
          <button className="np" disabled={lid !== 2} aria-expanded={listOpen} onClick={() => setListOpen((v) => !v)}>
            <small>{copy.nowPlaying}</small><b>{TRACKS[cur].title}</b><span className="chev" aria-hidden>{listOpen ? '▴' : '▾'}</span>
          </button>
        </div>
        <div className="mb-card" role="region" aria-label={copy.playlistTitle}>
          <h3><span aria-hidden>❦</span>{copy.playlistTitle}<span aria-hidden>❦</span></h3>
          <ol>
            {TRACKS.map((t, i) => (
              <li key={t.id} className={`${!t.url ? 'soon' : ''}${i === cur && t.url ? ' cur' : ''}`}>
                <button disabled={!t.url || lid !== 2 || !listOpen} onClick={() => playTrack(i)} aria-label={t.url ? `${i === cur && playing ? 'Dừng' : 'Phát'} ${t.title}` : `${t.title} (${copy.soon})`}>
                  <span className="n">{i === cur && playing && t.url ? <i className="eq" aria-hidden><b /><b /><b /></i> : ROMAN[i]}</span>
                  <span className="t"><b>{t.title}</b><small>{t.url ? t.artist : `${t.artist} · ${copy.soon}`}</small></span>
                </button>
              </li>
            ))}
          </ol>
          <div className="bar" role="slider" aria-label="Tua nhạc" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(frac * 100)} onClick={seek}><i style={{ width: `${(frac * 100).toFixed(1)}%` }} /><u style={{ left: `${(frac * 100).toFixed(1)}%` }} /></div>
          <div className="ctl">
            <span>{mmss(clock.t)}</span>
            <button aria-label="Bài trước" onClick={() => step(-1)} disabled={lid !== 2 || !listOpen}>⏮</button>
            <button className="main" onClick={() => sfx.toggleMusic()} disabled={lid !== 2 || !listOpen}>{playing ? 'Dừng' : 'Phát'}</button>
            <button aria-label="Bài sau" onClick={() => step(1)} disabled={lid !== 2 || !listOpen}>⏭</button>
            <span>{clock.d ? mmss(clock.d) : '--:--'}</span>
          </div>
        </div>
      </div>

      <SoundControl where="tr" />
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
