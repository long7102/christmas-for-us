import { useEffect, useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import Door from './scenes/Door'
import WorldScroll from './scenes/WorldScroll'
import { store } from './lib/storage'

type Phase = 'gate' | 'door' | 'world'

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => (store.get('unlocked', false) ? 'door' : 'gate'))

  // Scroll stays locked until the door is opened.
  useEffect(() => {
    document.documentElement.classList.toggle('locked', phase !== 'world')
    if (phase === 'world') window.scrollTo(0, 0)
  }, [phase])

  return (
    <>
      {/* Các cảnh sau cánh cửa làm từng cảnh một: hiện có cây thông + 4 quà và hai chú mèo. */}
      <main className="world" aria-hidden={phase !== 'world'}>{phase === 'world' && <WorldScroll />}</main>
      {phase === 'gate' && <PasswordGate onPass={() => setPhase('door')} />}
      {phase === 'door' && <Door onOpen={() => setPhase('world')} />}
    </>
  )
}
