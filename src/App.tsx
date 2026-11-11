import { useEffect, useState } from 'react'
import { PasswordGate } from './components/PasswordGate'
import Door from './scenes/Door'
import { Defs } from './art/defs'
import SleighLayer from './sleigh/SleighLayer'
import GingerbreadProgress from './components/GingerbreadProgress'
import { store } from './lib/storage'

import Village from './scenes/Village'
import MusicBox from './scenes/MusicBox'
import TeaTable from './scenes/TeaTable'
import TreeGifts from './scenes/TreeGifts'
import SnowGlobe from './scenes/SnowGlobe'
import Play from './scenes/Play'
import Final from './scenes/Final'
type Phase = 'gate' | 'door' | 'world'

export default function App() {
  const [phase, setPhase] = useState<Phase>(() => (store.get('unlocked', false) ? 'door' : 'gate'))

  useEffect(() => {
    document.documentElement.classList.toggle('locked', phase !== 'world')
    if (phase === 'world') window.scrollTo(0, 0)
  }, [phase])

  return (
    <>
      <Defs />
      <main className="world" aria-hidden={phase !== 'world'}>
        <Village />
        <MusicBox />
        <TeaTable />
        <TreeGifts />
        <SnowGlobe />
        <Play />
        <Final />
      </main>
      {phase === 'world' && <><SleighLayer /><GingerbreadProgress /></>}
      {phase === 'gate' && <PasswordGate onPass={() => setPhase('door')} />}
      {phase === 'door' && <Door onOpen={() => setPhase('world')} />}
    </>
  )
}
