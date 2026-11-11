/** Things that keep moving on top of the still village photo: chimney smoke, flickering lanterns and windows, drifting snow mist. Positions are % of the photo. */
type Pt = [number, number]
const SPOTS = {
  land: {
    smoke: [[40, 8], [59.7, 7], [74, 20], [26.5, 13], [10, 12]] as Pt[],
    glow: [[15.3, 21], [27.5, 49], [41, 50], [59, 50.5], [74, 47], [94, 66], [50, 37], [38.5, 47], [62, 47], [3, 55], [92, 45]] as Pt[],
  },
  port: {
    smoke: [[75, 11], [28.5, 19], [47, 4]] as Pt[],
    glow: [[24, 43.8], [32, 51], [70, 51], [93.5, 42], [50, 33], [8, 25], [24, 8]] as Pt[],
  },
}

export default function VillageLife({ portrait }: { portrait: boolean }) {
  const s = SPOTS[portrait ? 'port' : 'land']
  return (
    <div className="vlife" aria-hidden="true">
      {s.glow.map(([x, y], i) => <i key={'g' + i} className="vglow" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.37) % 2.6}s`, animationDuration: `${2.2 + (i % 4) * 0.7}s` }} />)}
      {s.smoke.map(([x, y], i) => [0, 1, 2].map((k) => <i key={`s${i}${k}`} className="vsmoke" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${k * 2.3 + i * 0.9}s` }} />))}
      <i className="vmist m1" /><i className="vmist m2" /><i className="vmist m3" />
    </div>
  )
}
