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
  private purrOn = false
  private mixV = 0
  private boxV = 0
  private prox = 1
  private fx?: GainNode
  private amb?: GainNode
  private fadeK = 1
  vol = { music: store.get('vol-music', 1), amb: store.get('vol-amb', 1), fx: store.get('vol-fx', 1) }
  private userPaused = false
  private curUrl = musicUrl
  private endCb?: () => void
  private purrGain?: GainNode

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
      this.fx = this.ctx.createGain(); this.fx.gain.value = this.vol.fx; this.fx.connect(this.fx!)
      this.amb = this.ctx.createGain(); this.amb.gain.value = this.vol.amb; this.amb.connect(this.fx!)
      const n = this.ctx.createBuffer(1, this.ctx.sampleRate * 3, this.ctx.sampleRate)
      const d = n.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0
      for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.99765 * b0 + w * 0.099; b1 = 0.963 * b1 + w * 0.2965; b2 = 0.57 * b2 + w * 1.0526; d[i] = (b0 + b1 + b2 + w * 0.1848) * 0.2 }
      this.noise = n
    }
    this.ctx.resume().then(() => { this.emit(); this.syncFire(); this.syncPurr() }).catch(() => {})
    this.startMusic()
    this.emit()
  }

  setMuted(m: boolean) {
    this.muted = m; store.set('muted', m)
    if (this.music) { this.music.muted = m; if (!m && this.music.paused && !this.userPaused) this.music.play().catch(() => {}) }
    if (this.master && this.ctx) this.master.gain.setTargetAtTime(m ? 0 : 1, this.ctx.currentTime, 0.1)
    this.emit()
  }

  /** Nhạc nền (Sugar Plum Fairy). Chỉ phát sau thao tác đầu tiên của người xem. */
  startMusic() {
    if (!this.music) {
      const a = new Audio(musicUrl); a.loop = true; a.volume = 0.42 * this.vol.music; a.preload = 'auto'; this.music = a
      a.addEventListener('play', () => this.emit()); a.addEventListener('pause', () => this.emit()); a.addEventListener('ended', () => this.endCb?.())
    }
    this.music.muted = this.muted
    if (this.music.paused && !this.userPaused) this.music.play().catch(() => {})
  }

  private applyMusicVol() {
    if (this.music) this.music.volume = Math.min(1, Math.max(0, (0.42 - 0.14 * this.mixV + 0.2 * this.boxV) * this.vol.music * this.fadeK))
  }
  /** Chỉnh âm lượng từng nhóm: nhạc, âm nền (gió, lửa, gừ gừ), hiệu ứng (chuông, meo, tiếng bấm). */
  setVolume(kind: 'music' | 'amb' | 'fx', v: number) {
    v = Math.min(1, Math.max(0, v)); this.vol[kind] = v; store.set(`vol-${kind}`, v)
    if (kind === 'music') this.applyMusicVol()
    if (kind === 'amb' && this.amb && this.ctx) this.amb.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05)
    if (kind === 'fx' && this.fx && this.ctx) this.fx.gain.setTargetAtTime(v, this.ctx.currentTime, 0.05)
    this.emit()
  }
  /** Mờ dần về 0 hoặc lên lại (đổi bài không bị cắt phụt). */
  private fade(to: number, ms: number) {
    return new Promise<void>((res) => {
      const from = this.fadeK, t0 = performance.now()
      const step = () => { const k = Math.min(1, (performance.now() - t0) / ms); this.fadeK = from + (to - from) * k; this.applyMusicVol(); k < 1 ? requestAnimationFrame(step) : res() }
      step()
    })
  }
  /** Điều khiển nhạc từ hộp nhạc (danh sách phát). */
  get musicPlaying() { return !!this.music && !this.music.paused && !this.muted }
  /** Đổi bài (url) và phát. onEnd: gọi khi hết bài (để sang bài kế); không có onEnd thì lặp lại bài. */
  setTrack(url: string, onEnd?: () => void) {
    this.startMusic()
    const a = this.music!
    this.endCb = onEnd; a.loop = !onEnd
    if (url !== this.curUrl) {
      this.curUrl = url
      const was = !a.paused
      void (was ? this.fade(0, 450) : Promise.resolve()).then(() => { a.src = url; a.currentTime = 0; this.playMusic(); return this.fade(1, 900) })
      return
    }
    this.playMusic()
  }
  get track() { return this.curUrl }
  playMusic() { this.userPaused = false; if (this.muted) this.setMuted(false); this.unlock(); this.startMusic(); this.music?.play().catch(() => {}) }
  pauseMusic() { this.userPaused = true; this.music?.pause() }
  toggleMusic() { if (this.musicPlaying) this.pauseMusic(); else this.playMusic() }
  musicClock() { return { t: this.music?.currentTime ?? 0, d: this.music && isFinite(this.music.duration) ? this.music.duration : 0 } }
  seekMusic(frac: number) { if (this.music && isFinite(this.music.duration)) this.music.currentTime = Math.min(1, Math.max(0, frac)) * this.music.duration }

  /** Tiếng lửa tí tách quanh bếp: rì rào nhỏ + những tiếng nổ lách tách ngẫu nhiên. */
  fire(on: boolean) { this.fireOn = on; this.syncFire() }
  private syncFire() {
    if (!this.ctx || !this.master || this.ctx.state !== 'running') return
    if (this.fireOn && !this.fireGain) {
      const c = this.ctx, g = c.createGain(); g.gain.value = 0; g.connect(this.amb!); this.fireGain = g
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
    if (this.fireGain) this.fireGain.gain.setTargetAtTime(this.fireOn ? (1 - 0.85 * this.mixV) * (1 - this.boxV) * this.prox : 0, this.ctx.currentTime, 0.4)
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
      n.connect(f); f.connect(g); g.connect(this.fx!); n.start(t, Math.random() * 2); n.stop(t + len + 0.02)
    }
  }
  crackleBurst() { if (!this.ctx) return; for (let i = 0; i < 14; i++) setTimeout(() => this.pop(1), i * (25 + Math.random() * 70)) }


  /** Tiếng gừ gừ rất nhẹ của mèo: sóng trầm bị nhịp ~25 nhịp mỗi giây làm lúc dày lúc thưa, thêm nhịp thở chậm. */
  purr(on: boolean) { this.purrOn = on; this.syncPurr() }
  private syncPurr() {
    if (!this.ctx || !this.master || this.ctx.state !== 'running') return
    const c = this.ctx
    if (!this.purrGain) {
      const out = c.createGain(); out.gain.value = 0; out.connect(this.amb!); this.purrGain = out
      const am = c.createGain(); am.gain.value = 0.5
      const lfo = c.createOscillator(); lfo.type = 'sine'; lfo.frequency.value = 25
      const ld = c.createGain(); ld.gain.value = 0.5; lfo.connect(ld); ld.connect(am.gain); lfo.start()
      const o1 = c.createOscillator(); o1.type = 'sawtooth'; o1.frequency.value = 52
      const o2 = c.createOscillator(); o2.type = 'triangle'; o2.frequency.value = 104
      const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 340; lp.Q.value = 0.7
      const g1 = c.createGain(); g1.gain.value = 0.7; const g2 = c.createGain(); g2.gain.value = 0.35
      o1.connect(g1); o2.connect(g2); g1.connect(lp); g2.connect(lp); lp.connect(am)
      const n = this.src(), nl = c.createBiquadFilter(); nl.type = 'bandpass'; nl.frequency.value = 260; nl.Q.value = 0.9
      const ng = c.createGain(); ng.gain.value = 0.5; n.connect(nl); nl.connect(ng); ng.connect(am); n.start(0, 0.7)
      const breath = c.createGain(); breath.gain.value = 1
      const bl = c.createOscillator(); bl.frequency.value = 0.27; const bd = c.createGain(); bd.gain.value = 0.3; bl.connect(bd); bd.connect(breath.gain); bl.start()
      am.connect(breath); breath.connect(out)
      o1.start(); o2.start()
    }
    this.purrGain.gain.setTargetAtTime(this.purrOn ? 0.1 * this.mixV : 0, c.currentTime, 0.8)
  }

  /** Tiếng "meo" dài: mở đầu khép môi (m), lên cao rồi kéo dài và xuống dần, giọng rung nhẹ, hơi thở cuối câu. */
  meow(pitch = 1) {
    if (!this.ctx || !this.master || this.ctx.state !== 'running') return
    const c = this.ctx, t = c.currentTime, dur = 1.45
    const o = c.createOscillator(); o.type = 'sawtooth'
    const f0 = o.frequency
    f0.setValueAtTime(330 * pitch, t); f0.linearRampToValueAtTime(420 * pitch, t + 0.12)
    f0.linearRampToValueAtTime(800 * pitch, t + 0.42); f0.linearRampToValueAtTime(740 * pitch, t + 0.8)
    f0.exponentialRampToValueAtTime(430 * pitch, t + dur)
    const vib = c.createOscillator(), vg = c.createGain(); vib.frequency.value = 5.8; vg.gain.setValueAtTime(2, t); vg.gain.linearRampToValueAtTime(16, t + 0.7); vg.gain.linearRampToValueAtTime(9, t + dur)
    vib.connect(vg); vg.connect(f0); vib.start(t); vib.stop(t + dur + 0.1)
    // vùng cộng hưởng trượt như hình miệng: "m" (khép) -> "e" -> "o" -> khép dần
    const f1 = c.createBiquadFilter(); f1.type = 'bandpass'; f1.Q.value = 5
    f1.frequency.setValueAtTime(380, t); f1.frequency.linearRampToValueAtTime(900, t + 0.35); f1.frequency.linearRampToValueAtTime(1000, t + 0.75); f1.frequency.linearRampToValueAtTime(520, t + dur)
    const f2 = c.createBiquadFilter(); f2.type = 'bandpass'; f2.Q.value = 6
    f2.frequency.setValueAtTime(1100, t); f2.frequency.linearRampToValueAtTime(2500, t + 0.35); f2.frequency.linearRampToValueAtTime(2000, t + 0.8); f2.frequency.linearRampToValueAtTime(1300, t + dur)
    const a = c.createGain(), b = c.createGain(); a.gain.value = 1; b.gain.setValueAtTime(0.2, t); b.gain.linearRampToValueAtTime(0.6, t + 0.35); b.gain.linearRampToValueAtTime(0.35, t + dur)
    const env = c.createGain(); env.gain.setValueAtTime(0.0001, t)
    env.gain.linearRampToValueAtTime(0.09, t + 0.12); env.gain.linearRampToValueAtTime(0.2, t + 0.4); env.gain.linearRampToValueAtTime(0.17, t + 0.9); env.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    o.connect(f1); o.connect(f2); f1.connect(a); f2.connect(b); a.connect(env); b.connect(env); env.connect(this.fx!)
    const n = this.src(), nf = c.createBiquadFilter(); nf.type = 'bandpass'; nf.frequency.value = 2600; nf.Q.value = 1
    const ng = c.createGain(); ng.gain.setValueAtTime(0.0001, t); ng.gain.linearRampToValueAtTime(0.02, t + 0.3); ng.gain.linearRampToValueAtTime(0.045, t + dur * 0.85); ng.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    n.connect(nf); nf.connect(ng); ng.connect(this.fx!); n.start(t, Math.random()); n.stop(t + dur + 0.05)
    o.start(t); o.stop(t + dur + 0.05)
  }

  /** Hoà âm theo cảnh: m = 0 là cảnh cây thông (lửa tí tách rõ), m = 1 là cảnh hai chú mèo (lửa nhỏ dần, tiếng gừ gừ lên, nhạc nền dịu bớt). */
  mix(m: number) {
    m = Math.min(1, Math.max(0, m))
    if (Math.abs(m - this.mixV) < 0.01) return
    this.mixV = m
    this.applyMusicVol()
    this.syncFire(); this.syncPurr()
  }

  /** Hoà âm cho cảnh hộp nhạc: n = 0 là cảnh mèo, n = 1 là cảnh hộp nhạc (tắt gừ gừ và lửa, nhạc nền rõ hơn). */
  stageBox(n: number) {
    n = Math.min(1, Math.max(0, n))
    if (Math.abs(n - this.boxV) < 0.01) return
    this.boxV = n
    this.applyMusicVol()
    if (this.fireGain && this.ctx) this.fireGain.gain.setTargetAtTime(this.fireOn ? (1 - 0.85 * this.mixV) * (1 - n) * this.prox : 0, this.ctx.currentTime, 0.3)
    if (this.purrGain && this.ctx) this.purrGain.gain.setTargetAtTime(this.purrOn ? 0.1 * this.mixV * (1 - n) : 0, this.ctx.currentTime, 0.5)
  }

  /** Vặn khoá hộp nhạc: những tiếng "tạch" của bánh cóc, chậm dần. */
  ratchet() {
    if (!this.ctx || !this.master || !this.noise || this.ctx.state !== 'running') return
    const c = this.ctx, t0 = c.currentTime
    for (let i = 0; i < 9; i++) {
      const t = t0 + i * (0.09 + i * 0.012)
      const n = this.src(false), f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2200 + (i % 2) * 500; f.Q.value = 4
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.22, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035)
      n.connect(f); f.connect(g); g.connect(this.fx!); n.start(t, Math.random() * 2); n.stop(t + 0.05)
      const o = c.createOscillator(); o.type = 'triangle'; o.frequency.value = 180 + i * 6
      const og = c.createGain(); og.gain.setValueAtTime(0.0001, t); og.gain.linearRampToValueAtTime(0.08, t + 0.004); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
      o.connect(og); og.connect(this.fx!); o.start(t); o.stop(t + 0.08)
    }
  }

  /** Một nốt lược đồng của hộp nhạc: trong, ngắn, ngân nhẹ. (Tạm thời, sẽ thay bằng nhạc thật Long gửi.) */
  pluck(freq: number, vol = 0.1) {
    if (!this.ctx || !this.master || this.ctx.state !== 'running') return
    const c = this.ctx, t = c.currentTime
    for (const [mul, v, dec] of [[1, 1, 1.6], [2.0, 0.35, 0.8], [4.1, 0.12, 0.3]] as const) {
      const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = freq * mul
      const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * v, t + 0.003); g.gain.exponentialRampToValueAtTime(0.0001, t + dec)
      o.connect(g); g.connect(this.fx!); o.start(t); o.stop(t + dec + 0.05)
    }
  }

  /** Chùm nốt lấp lánh đi lên khi chuyển sang cảnh hộp nhạc. */
  sparkle() {
    if (!this.ctx) return
    ;[1175, 1319, 1568, 1760, 2093, 2349].forEach((f, i) => setTimeout(() => this.pluck(f, 0.07), i * 110))
  }

  /** Bếp lửa ở bên trái mọi cảnh: con trỏ càng gần mép trái thì tiếng lửa càng rõ (0 = sát trái, 1 = sát phải). */
  fireNear(x01: number) {
    const v = 1.18 - 0.5 * Math.min(1, Math.max(0, x01))
    if (Math.abs(v - this.prox) < 0.03) return
    this.prox = v
    if (this.fireGain && this.ctx) this.fireGain.gain.setTargetAtTime(this.fireOn ? (1 - 0.85 * this.mixV) * (1 - this.boxV) * v : 0, this.ctx.currentTime, 0.35)
  }

  /** Tiếng chạm nhỏ khi bấm: gỗ (vật trong phòng), giấy (nút), chuông nhỏ (đèn, sao). */
  tap(kind: 'wood' | 'paper' | 'bell' = 'paper') {
    if (!this.ctx || !this.master || !this.noise || this.ctx.state !== 'running') return
    const c = this.ctx, t = c.currentTime
    if (kind === 'bell') { this.pluck(1568 + Math.random() * 40, 0.05); return }
    const n = this.src(false), f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = kind === 'wood' ? 6 : 1.2; f.frequency.value = kind === 'wood' ? 520 + Math.random() * 120 : 2600
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(kind === 'wood' ? 0.2 : 0.07, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + (kind === 'wood' ? 0.09 : 0.05))
    n.connect(f); f.connect(g); g.connect(this.fx!); n.start(t, Math.random() * 2); n.stop(t + 0.12)
  }

  /** Hơi thổi tắt đèn: tiếng hơi ngắn, nghe xa dần. */
  puff() {
    if (!this.ctx || !this.master || !this.noise || this.ctx.state !== 'running') return
    const c = this.ctx, t = c.currentTime
    const n = this.src(false), f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.8; f.frequency.setValueAtTime(1800, t); f.frequency.exponentialRampToValueAtTime(500, t + 0.5)
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.28, t + 0.06); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.55)
    n.connect(f); f.connect(g); g.connect(this.fx!); n.start(t, Math.random()); n.stop(t + 0.6)
  }

  /** Thắp đèn lại: que diêm quẹt khẽ rồi tiếng bùng lên dịu. */
  relight() {
    if (!this.ctx || !this.master || !this.noise || this.ctx.state !== 'running') return
    const c = this.ctx, t = c.currentTime
    const scr = this.src(false), sf = c.createBiquadFilter(); sf.type = 'highpass'; sf.frequency.value = 2600
    const sg = c.createGain(); sg.gain.setValueAtTime(0.0001, t); sg.gain.linearRampToValueAtTime(0.1, t + 0.03); sg.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
    scr.connect(sf); sf.connect(sg); sg.connect(this.fx!); scr.start(t, Math.random()); scr.stop(t + 0.25)
    const n = this.src(false), f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 0.9; f.frequency.setValueAtTime(300, t + 0.22); f.frequency.exponentialRampToValueAtTime(2200, t + 0.7)
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t + 0.22); g.gain.linearRampToValueAtTime(0.2, t + 0.38); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.95)
    n.connect(f); f.connect(g); g.connect(this.fx!); n.start(t + 0.22, Math.random()); n.stop(t + 1)
  }

  /** Chuông leng keng rất nhẹ khi vòng kẹo Giáng sinh loang ra. */
  /** Chuông leng keng: sáu nốt chuông gió, mỗi nốt có thêm các hoạ âm lệch kiểu kim loại nên nghe rõ và vang. */
  chime() {
    if (!this.ctx || !this.master || this.ctx.state !== 'running') return
    const c = this.ctx, t0 = c.currentTime + 0.02
    const bus = c.createGain(); bus.gain.value = 1
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3
    bus.connect(comp); comp.connect(this.fx!)
    const notes = [1046.5, 1318.5, 1568, 2093, 1568, 2637]
    notes.forEach((fr, i) => {
      const t = t0 + i * 0.14 + (i % 2) * 0.012
      for (const [mul, vol, dec] of [[1, 0.2, 2.2], [2.76, 0.09, 1.2], [5.4, 0.035, 0.6]] as const) {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fr * mul
        const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dec)
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + dec + 0.05)
      }
    })
  }

  private src(loop = true) { const s = this.ctx!.createBufferSource(); s.buffer = this.noise!; s.loop = loop; s.loopStart = 0; return s }

  /** Cold wind howling outside: two whistling bands that drift, plus a low rumble. */
  startWind() {
    if (!this.ctx || !this.master || this.windGain) return
    const c = this.ctx, g = c.createGain(); g.gain.value = 0; g.connect(this.amb!); this.windGain = g
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
    o.connect(bp); bp.connect(g); n.connect(nf); nf.connect(g); g.connect(this.fx!)
    o.start(t); o.stop(t + dur + 0.05); n.start(t, Math.random()); n.stop(t + dur + 0.05)
  }

  /** Door hitting the wall. */
  thud(vol = 0.9) {
    if (!this.ctx || !this.master) return
    const c = this.ctx, t = c.currentTime
    const o = c.createOscillator(); o.frequency.setValueAtTime(95, t); o.frequency.exponentialRampToValueAtTime(34, t + 0.5)
    const g = c.createGain(); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.7)
    o.connect(g); g.connect(this.fx!); o.start(t); o.stop(t + 0.75)
    const n = this.src(false), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 500
    const ng = c.createGain(); ng.gain.setValueAtTime(vol * 0.7, t); ng.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
    n.connect(lp); lp.connect(ng); ng.connect(this.fx!); n.start(t); n.stop(t + 0.45)
  }

  /** Rush of air as we run through. */
  whoosh(dur = 2.4, vol = 0.45) {
    if (!this.ctx || !this.master) return
    const c = this.ctx, t = c.currentTime
    const n = this.src(), f = c.createBiquadFilter(); f.type = 'bandpass'; f.Q.value = 1.2; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3200, t + dur)
    const g = c.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.85); g.gain.linearRampToValueAtTime(0, t + dur + 0.4)
    n.connect(f); f.connect(g); g.connect(this.fx!); n.start(t, Math.random()); n.stop(t + dur + 0.5)
  }
}
export const sfx = new Sfx()
