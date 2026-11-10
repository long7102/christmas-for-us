import { useEffect, useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import Door from './scenes/Door'
import { store } from './lib/storage'

type Phase = 'gate' | 'door' | 'world'

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => (store.get('unlocked', false) ? 'door' : 'gate'))

  // Scroll is locked until the door is opened.
  useEffect(() => {
    document.documentElement.classList.toggle('locked', phase !== 'world')
    if (phase === 'world') window.scrollTo(0, 0)
  }, [phase])

  return (
    <>
      {/* Scenes 01–07 are added one by one after each section is approved. */}
      <main className="world" aria-hidden={phase !== 'world'} />
      {phase === 'gate' && <PasswordGate onPass={() => setPhase('door')} />}
      {phase === 'door' && <Door onOpen={() => setPhase('world')} />}
    </>
  )
}
