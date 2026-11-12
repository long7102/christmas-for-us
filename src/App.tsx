import { useEffect, useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import Door from './scenes/Door'
import WorldScroll from './scenes/WorldScroll'
import { store } from './lib/storage'
import { Loader } from './components/Loader'
import { preloadScenes } from './lib/preload'
import { startPerfWatch } from './lib/perf'
import { useRipple } from './lib/ripple'
import { PreviewBar } from './components/PreviewBar'

/** Chỉ bản xem thử trên Artifact (VITE_PREVIEW=1) có thanh nhảy nhanh giữa các phần. */
const PREVIEW = import.meta.env.VITE_PREVIEW === '1'
const HASH: Record<string, 0 | 1 | 2> = { '#hop-nhac': 0, '#cay-thong': 1, '#meo': 2 }

type Phase = 'gate' | 'door' | 'world'

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => (store.get('unlocked', false) ? 'door' : 'gate'))

  useRipple()
  const go = (to: 'gate' | 'door' | 0 | 1 | 2) => {
    if (to === 'gate') { store.set('unlocked', false); setPhase('gate'); return }
    if (to === 'door') { store.set('unlocked', true); setPhase('door'); return }
    store.set('unlocked', true); store.set('opened', true)
    const wasWorld = phase === 'world'
    setPhase('world')
    setTimeout(() => dispatchEvent(new CustomEvent('olcw:goto', { detail: { i: to, instant: true } })), wasWorld ? 0 : 500)
  }
  // bản xem thử: mở thẳng một phần theo #hop-nhac, #cay-thong, #meo
  useEffect(() => { if (PREVIEW && location.hash in HASH) go(HASH[location.hash]) }, [])  // eslint-disable-line react-hooks/exhaustive-deps
  // tải sẵn ảnh các cảnh sau khi người xem còn ở cổng hoặc cánh cửa
  useEffect(() => { const t = setTimeout(preloadScenes, 2500); return () => clearTimeout(t) }, [])
  // đo tốc độ khung hình khi vào thế giới, máy yếu thì bật chế độ nhẹ
  useEffect(() => (phase === 'world' ? startPerfWatch() : undefined), [phase])

  // Scroll stays locked until the door is opened.
  useEffect(() => {
    document.documentElement.classList.toggle('locked', phase !== 'world')
    if (phase === 'world') window.scrollTo(0, 0)
  }, [phase])

  return (
    <>
      <Loader />
      {PREVIEW && <PreviewBar phase={phase} go={go} />}
      {/* Các cảnh sau cánh cửa làm từng cảnh một: hiện có cây thông + 4 quà và hai chú mèo. */}
      <main className="world" aria-hidden={phase !== 'world'}>{phase === 'world' && <WorldScroll />}</main>
      {phase === 'gate' && <PasswordGate onPass={() => setPhase('door')} />}
      {phase === 'door' && <Door onOpen={() => setPhase('world')} />}
    </>
  )
}
