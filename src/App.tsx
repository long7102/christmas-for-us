import { useEffect, useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import Door from './scenes/Door'
import Tree from './scenes/Tree'
import Cats from './scenes/Cats'
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
      <main className="world" aria-hidden={phase !== 'world'}>{phase === 'world' && (
        <>
          <Tree />
          <a className="scroll-cue" href="#cats" aria-label="Cuộn xuống cảnh kế tiếp" onClick={(e) => { e.preventDefault(); document.getElementById('cats')?.scrollIntoView({ behavior: 'smooth' }) }}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M6 9l6 6 6-6" /></svg>
          </a>
          <Cats />
        </>
      )}</main>
      {phase === 'gate' && <PasswordGate onPass={() => setPhase('door')} />}
      {phase === 'door' && <Door onOpen={() => setPhase('world')} />}
    </>
  )
}
