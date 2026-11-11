/** Hidden YouTube IFrame player. Fails silently: if anything is wrong the caller just keeps the visual record spinning. */
declare global { interface Window { YT?: any; onYouTubeIframeAPIReady?: () => void } }

export function videoId(url: string): string | null {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/)
  return m ? m[1] : null
}

let apiP: Promise<void> | null = null
function api() {
  if (window.YT?.Player) return Promise.resolve()
  if (!apiP) apiP = new Promise<void>((res, rej) => {
    window.onYouTubeIframeAPIReady = () => res()
    const s = document.createElement('script')
    s.src = 'https://www.youtube.com/iframe_api'
    s.onerror = () => rej(new Error('yt'))
    document.head.appendChild(s)
  })
  return apiP
}

export class YT {
  p: any = null
  constructor(private host: HTMLElement, private onState: (playing: boolean) => void, private onEnd: () => void) {}
  async load(id: string, volume: number) {
    try {
      await api()
      if (this.p) { this.p.loadVideoById(id); this.p.setVolume(volume); return }
      const div = document.createElement('div'); this.host.appendChild(div)
      this.p = new window.YT.Player(div, {
        width: '1', height: '1', videoId: id,
        playerVars: { autoplay: 1, controls: 0, playsinline: 1 },
        events: {
          onReady: (e: any) => { e.target.setVolume(volume); e.target.playVideo() },
          onStateChange: (e: any) => { this.onState(e.data === 1); if (e.data === 0) this.onEnd() },
        },
      })
    } catch { /* silent */ }
  }
  play() { try { this.p?.playVideo() } catch { /* */ } }
  pause() { try { this.p?.pauseVideo() } catch { /* */ } }
  volume(v: number) { try { this.p?.setVolume(v) } catch { /* */ } }
  seek(t: number) { try { this.p?.seekTo(t, true) } catch { /* */ } }
  time() { try { return { t: this.p?.getCurrentTime() ?? 0, d: this.p?.getDuration() ?? 0 } } catch { return { t: 0, d: 0 } } }
  stop() { try { this.p?.stopVideo() } catch { /* */ } }
}
