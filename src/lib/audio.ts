import { store } from './storage'
import musicUrl from '../assets/sugarplum-fairy.mp3'

/**
 * Procedural sound (no files needed): howling wind, door creak, thud, whoosh.
 * Nothing plays before the first tap/click (browser rule). Mute choice is remembered.
 */
class Sfx {
  private ctx?: AudioContext
  private master?: GainNode
  private windGain?: GainNode
  private noise?: AudioBuffer
  muted = store.get('muted', false)
  private music?: HTMLAudioElement
  private fireOn = false
  private fireGain?: GainNode
  private fireTimer = 0
  private subs = new Set<() => void>()

  constructor() {
    const go = () => { this.unlock(); removeEventListener('pointerdown', go); removeEventListener('keydown', go); removeEventListener('touchstart', go) }
    if (typeof window !== 'undefined') { addEventListener('pointerdown', go); addEventListener('keydown', go); addEventListener('touchstart', go) }
  }
  subscribe(f: () => void) { this.subs.add(f); return () => void this.subs.delete(f) }
  private emit() { this.subs.forEach((f) => f()) }

  get running() { return !!this.ctx && this.ctx.state === 'running' }

  /** Call from a user gesture. */
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AC) return
      this.ctx = new AC()
      this.master = this.ctx.createGain()
      this.master.gain.value = this.muted ? 0 : 1
      this.master.connect(this.ctx.destination)
      const n = this.ctx.createBuffer(1, this.ctx.sampleRate * 3, this.ctx.sampleRate)
      const d = n.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0
      for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2 }
      this.noise = n
    }
    this.ctx.resume().then(() => { this.emit(); this.syncFire() }).catch(() => {})
    this.startMusic()
    this.emit()
  }

  setMuted(m: boolean) {
    this.muted = m; store.set('muted', m)
    if (this.music) { this.music.muted = m; if (!m && this.music.paused) this.music.play().catch(() => {}) }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.1)
    this.emit()
  }

  /** Nhạc nền (Sugar Plum Fairy). Chỉ phát sau thao tác đầu tiên của người xem. */
  startMusic() {
    if (!this.music) {
      const a = new Audio(musicUrl); a.loop = true; a.volume = 0.42; a.preload = 'auto'; this.music = a
    }
    this.music.muted = this.muted
    if (this.music.paused) this.music.play().catch(() => {})
  }

  /** Tiếng lửa tí tách quanh bếp: rì rào nhỏ + những tiếng nổ lách tách ngẫu nhiên. */
  fire(on: boolean) { this.fireOn = on; this.syncFire() }
  private syncFire() {
    if (!this.ctx || !this.master || this.ctx.state !== 'running') return
    if (this.fireOn && !this.fireGain) {
      const c = this.ctx, g = c.createGain(); g.gain.value = 0; g.connect(this.master); this.fireGain = g
      const r = this.src(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 520
      const rg = c.createGain(); rg.gain.value = 0.16
      const lfo = c.createOscillator(), ld = c.createGain(); lfo.frequency.value = 0.35; ld.gain.value = 0.07; lfo.connect(ld); ld.connect(rg.gain); lfo.start()
      r.connect(lp); lp.connect(rg); rg.connect(g); r.start(0, Math.random() * 2)
      const hiss = this.src(), hp = c.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 3800
      const hg = c.createGain(); hg.gain.value = 0.018; hiss.connect(hp); hp.connect(hg); hg.connect(g); hiss.start(0, 0.5)
      const tick = () => {
        if (!this.fireOn || !this.fireGain) return
        const burst = Math.random() < 0.18 ? 2 + Math.floor(Math.random() * 4) : 1
        for (let i = 0; i < burst; i++) setTimeout(() => this.pop(), i * (30 + Math.random() * 60))
        this.fireTimer = window.setTimeout(tick, 120 + Math.random() * 900)
      }
      tick()
    }
    if (this.fireGain) this.fireGain.gain.setTargetAtTime(this.fireOn ? 1 : 0, this.ctx.currentTime, 0.4)
    if (!this.fireOn) { clearTimeout(this.fireTimer) }
  }
  /** Một tiếng nổ lách tách. */
  pop(vol = 0.5 + Math.random() * 0.5) {
    if (!this.ctx || !this.fireGain || !this.noise) return
    const c = this.ctx, t = c.currentTime, len = 0.015 + Math.random() * 0.07
    const n = c.createBufferSource(); n.buffer = this.noise
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1200 + Math.random() * 4200; bp.Q.value = 0.8 + Math.random() * 2.5
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.5 * vol, t + 0.002); g.gain.exponentialRampToValueAtTime(0.0001, t + len)
    n.connect(bp); bp.connect(g); g.connect(this.fireGain); n.start(t, Math.random() * 2); n.stop(t + len + 0.02)
  }
  /** Tiếng giấy sột soạt khi mở / gấp thư. */
  rustle(dur = 0.55, vol = 0.5) {
    if (!this.ctx || !this.master || !this.noise || this.ctx.state !== 'running') return
    const c = this.ctx, t0 = c.currentTime
    const hits = 7 + Math.floor(Math.random() * 4)
    for (let i = 0; i < hits; i++) {
      const t = t0 + (i / hits) * dur + Math.random() * 0.03, len = 0.04 + Math.random() * 0.08
      const n = c.createBufferSource(); n.buffer = this.noise
      const f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200 + Math.random() * 3800; f.Q.value = 0.6 + Math.random() * 0.8
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * (0.35 + Math.random() * 0.65), t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      n.connect(f); f.connect(g); g.connect(this.master); n.start(t, Math.random() * 2); n.stop(t + len + 0.02)
    }
  }
  crackleBurst() { if (!this.ctx) return; for (let i = 0; i < 14; i++) setTimeout(() => this.pop(1), i * (25 + Math.random() * 70)) }

  private src(loop = true) { const s = this.ctx!.createBufferSource(); s.buffer = this.noise!; s.loop = loop; s.loopStart = 0; return s }

  /** Cold wind howling outside: two whistling bands that drift, plus a low rumble. */
  startWind() {
    if (!this.ctx || !this.master || this.windGain) return
    const c = this.ctx, g = c.createGain(); g.gain.value = 0; g.connect(this.master); this.windGain = g
    const band = (freq: number, q: number, lfo: number, depth: number, vol: number) => {
      const s = this.src(), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q
      const o = c.createOscillator(), od = c.createGain(); o.frequency.value = lfo; od.gain.value = depth; o.connect(od); od.connect(f.frequency); o.start()
      const v = c.createGain(); v.gain.value = vol
      const o2 = c.createOscillator(), o2d = c.createGain(); o2.frequency.value = lfo * 0.6; o2d.gain.value = vol * 0.7; o2.connect(o2d); o2d.connect(v.gain); o2.start()
      s.connect(f); f.connect(v); v.connect(g); s.start(0, Math.random() * 2)
    }
    band(620, 5, 0.11, 220, 0.5)
    band(1250, 7, 0.07, 380, 0.3)
    band(2300, 9, 0.17, 500, 0.12)
    const r = this.src(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160
    const rg = c.createGain(); rg.gain.value = 0.9; r.connect(lp); lp.connect(rg); rg.connect(g); r.start(0, 1)
    g.gain.setTargetAtTime(0.35, c.currentTime, 1.5)
  }
  windLevel(level: number, sec = 1.5) { if (this.ctx && this.windGain) this.windGain.gain.setTargetAtTime(level, this.ctx.currentTime, sec / 3) }

  /** Heavy hinge creak: a low squeal that wobbles and slowly climbs. */
  creak(dur: number, from = 70, to = 130, vol = 0.22) {
    if (!this.ctx || !this.master) return
    const c = this.ctx, t = c.currentTime
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(from, t); o.frequency.linearRampToValueAtTime(to, t + dur)
    const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 9; vg.gain.value = 5; vib.connect(vg); vg.connect(o.frequency); vib.start(t)
    const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(420, t); bp.frequency.linearRampToValueAtTime(760, t + dur); bp.Q.value = 6
    const n = this.src(), nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 900; nf.Q.value = 3
    const g = c.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + dur * 0.25); g.gain.linearRampToValueAtTime(vol * 0.7, t + dur * 0.8); g.gain.linearRampToValueAtTime(0, t + dur)
    o.connect(bp); bp.connect(g); n.connect(nf); nf.connect(g); g.connect(this.master)
    o.start(t); o.stop(t + dur + 0.05); n.start(t, Math.random()); n.stop(t + dur + 0.05)
  }

  /** Door hitting the wall. */
  thud(vol = 0.9) {
    if (!this.ctx || !this.master) return
    const c = this.ctx, t = c.currentTime
    const o = c.createOscillator(); o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.5)
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
    o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 0.75)
    const n = this.src(false), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500
    const ng = c.createGain(); ng.gain.setValueAtTime(vol * 0.7, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    n.connect(lp); lp.connect(ng); ng.connect(this.master); n.start(t); n.stop(t + 0.45)
  }

  /** Rush of air as we run through. */
  whoosh(dur = 2.4, vol = 0.45) {
    if (!this.ctx || !this.master) return
    const c = this.ctx, t = c.currentTime
    const n = this.src(), f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3200, t + dur)
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.85); g.gain.linearRampToValueAtTime(0, t + dur + 0.4)
    n.connect(f); f.connect(g); g.connect(this.master); n.start(t, Math.random()); n.stop(t + dur + 0.5)
  }
}
export const sfx = new Sfx()
