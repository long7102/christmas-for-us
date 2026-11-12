/**
 * Tải sẵn ảnh của các cảnh sau khi người xem còn ở cảnh cửa, lần lượt từng tấm lúc rảnh, để lúc cuộn không bị khựng.
 * Chọn đúng nhóm ảnh ngang hoặc dọc theo màn hình.
 */
const URLS = import.meta.glob('../assets/{tree,cats,musicbox}*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const keep: HTMLImageElement[] = []

export function preloadScenes() {
  const tall = innerWidth / innerHeight < 1.05
  const names = Object.keys(URLS).filter((k) => (tall ? !k.includes('-land') : !k.includes('-port')))
  // ảnh đầu cảnh hộp nhạc trước, rồi cây thông, rồi mèo
  const rank = (k: string) => (k.includes('musicbox') ? 0 : k.includes('tree') ? 1 : 2)
  names.sort((a, b) => rank(a) - rank(b))
  const idle = (f: () => void) => ('requestIdleCallback' in window ? (window as unknown as { requestIdleCallback: (f: () => void, o?: object) => void }).requestIdleCallback(f, { timeout: 2500 }) : setTimeout(f, 300))
  let i = 0
  const next = () => {
    if (i >= names.length) return
    const im = new Image(); im.decoding = 'async'; im.src = URLS[names[i++]]
    keep.push(im)
    const go = () => idle(next)
    im.decode ? im.decode().then(go, go) : (im.onload = go)
  }
  idle(next)
}
