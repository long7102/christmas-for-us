/** Things that keep moving on top of the still village photo: chimney smoke and flickering lanterns and windows. Positions are % of the photo. */
type Pt = [number, number]
const SPOTS = {
  land: {
    smoke: [[35.9, 16], [64, 16], [26, 1.5], [88, 8]] as Pt[],
    glow: [[16.3, 41.7], [28, 55], [39.8, 56.2], [60.2, 56.2], [72.3, 51.4], [96, 7.8], [50, 34], [38.4, 38.9], [61.6, 38.9], [85, 65.6], [14, 22], [6, 6]] as Pt[],
  },
  port: {
    smoke: [[21.8, 9.5], [34.5, 22.5], [70, 22.5], [85.7, 14]] as Pt[],
    glow: [[18.7, 47.6], [33.9, 57], [67.3, 57], [78.2, 49], [50.8, 35], [38.3, 43.8], [63, 43.8], [96, 65], [4, 62]] as Pt[],
  },
}

export default function VillageLife({ portrait }: { portrait: boolean }) {
  const s = SPOTS[portrait ? 'port' : 'land']
  return (
    <div className="vlife" aria-hidden="true">
      {s.glow.map(([x, y], i) => <i key={'g' + i} className="vglow" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${(i * 0.37) % 2.6}s`, animationDuration: `${2.2 + (i % 4) * 0.7}s` }} />)}
      {s.smoke.map(([x, y], i) => [0, 1, 2].map((k) => <i key={`s${i}${k}`} className="vsmoke" style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${k * 2.3 + i * 0.9}s` }} />))}
    </div>
  )
}
