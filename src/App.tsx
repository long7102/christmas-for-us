import { useEffect, useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import Door from './scenes/Door'
import WorldScroll from './scenes/WorldScroll'
import { store } from './lib/storage'
import { Loader } from './components/Loader'
import { preloadScenes } from './lib/preload'
import { startPerfWatch } from './lib/perf'
import { useRipple } from './lib/ripple'
import { startTimeOfDay } from './lib/timeOfDay'


type Phase = 'gate' | 'door' | 'world'

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => (store.get('unlocked', false) ? 'door' : 'gate'))

  useRipple()
  useEffect(() => startTimeOfDay(), [])
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
      {/* Các cảnh sau cánh cửa làm từng cảnh một: hiện có cây thông + 4 quà và hai chú mèo. */}
      <main className="world" aria-hidden={phase !== 'world'}>{phase === 'world' && <><WorldScroll /><div className="tod-in" /></>}</main>
      {phase === 'gate' && <PasswordGate onPass={() => setPhase('door')} />}
      {phase === 'door' && <Door onOpen={() => setPhase('world')} />}
    </>
  )
}
