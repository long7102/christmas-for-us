/**
 * Tải sẵn ảnh của các cảnh sau khi người xem còn ở cảnh cửa, lần lượt từng tấm lúc rảnh, để lúc cuộn không bị khựng.
 * Chọn đúng nhóm ảnh ngang hoặc dọc theo màn hình.
 */
import { LAND as TREE_L, PORT as TREE_P } from '../scenes/treeLayout'
import { CAT_LAND, CAT_PORT } from '../scenes/catsLayout'
import { MB } from '../scenes/musicLayout'
import { SNOW } from '../scenes/snowLayout'

const keep: HTMLImageElement[] = []

export function preloadScenes() {
  const tall = innerWidth / innerHeight < 1.05
  const cats = tall ? CAT_PORT : CAT_LAND
  // ảnh cảnh hộp nhạc trước, rồi cây thông, rồi mèo (ảnh nền, sau đó các dáng khác của hai bé)
  const names = [MB.imgs.closed, MB.imgs.ajar, MB.imgs.open, (tall ? TREE_P : TREE_L).src, cats.src, ...cats.bong.poses.map((p) => p.src), ...cats.mochi.poses.map((p) => p.src), ...SNOW.poses.map((p) => p.src)]
  const idle = (f: () => void) => ('requestIdleCallback' in window ? (window as unknown as { requestIdleCallback: (f: () => void, o?: object) => void }).requestIdleCallback(f, { timeout: 2500 }) : setTimeout(f, 300))
  let i = 0
  const next = () => {
    if (i >= names.length) return
    const im = new Image(); im.decoding = 'async'; im.src = names[i++]
    keep.push(im)
    const go = () => idle(next)
    im.decode ? im.decode().then(go, go) : (im.onload = go)
  }
  idle(next)
}
