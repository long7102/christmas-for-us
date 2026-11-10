import { store } from './storage'
import { asset } from './assets'

/** Minimal ambient audio. Silent (no errors) when files are missing. Nothing plays before unlock(). */
class AudioBus {
  muted = store.get('muted', false)
  unlocked = false
  private tracks = new Map<string, HTMLAudioElement>()
  private vol = new Map<string, number>()
  private listeners = new Set<() => void>()

  subscribe(f: () => void) {
    this.listeners.add(f)
    return () => this.listeners.delete(f)
  }
  private emit() {
    this.listeners.forEach((f) => f())
  }

  unlock() {
    this.unlocked = true
  }

  setMuted(m: boolean) {
    this.muted = m
    store.set('muted', m)
    this.tracks.forEach((a, k) => (a.volume = m ? 0 : this.vol.get(k) ?? 0))
    this.emit()
  }

  /** Fade an ambient loop to a target volume (0 stops it). */
  ambient(name: string, volume: number) {
    const src = asset(`audio/${name}.mp3`)
    if (!src || !this.unlocked) return
    let a = this.tracks.get(name)
    if (!a) {
      a = new Audio(src)
      a.loop = true
      a.volume = 0
      this.tracks.set(name, a)
    }
    this.vol.set(name, volume)
    if (volume > 0) a.play().catch(() => {})
    const el = a
    const target = this.muted ? 0 : volume
    const step = () => {
      const d = target - el.volume
      if (Math.abs(d) < 0.02) {
        el.volume = target
        if (target === 0) el.pause()
        return
      }
      el.volume = Math.min(1, Math.max(0, el.volume + Math.sign(d) * 0.02))
      requestAnimationFrame(step)
    }
    step()
  }

  once(name: string, volume = 0.5) {
    const src = asset(`audio/${name}.mp3`)
    if (!src || !this.unlocked || this.muted) return
    const a = new Audio(src)
    a.volume = volume
    a.play().catch(() => {})
  }
}
export const audio = new AudioBus()
