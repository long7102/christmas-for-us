import { Star5 } from './shapes'

/** Stone arch frame (opening is see-through). viewBox 320x440, opening x50..270, y70..420 */
export function DoorFrame() {
  return (
    <svg viewBox="0 0 320 440" className="door-frame" aria-hidden="true">
      <defs>
        <clipPath id="clipFrame"><path fillRule="evenodd" d="M0 440V70Q0 0 160 0T320 70V440ZM50 420H270V120Q270 70 160 70T50 120Z" /></clipPath>
      </defs>
      <g filter="url(#fShadow)">
        <path fillRule="evenodd" d="M0 440V70Q0 0 160 0T320 70V440ZM50 420H270V120Q270 70 160 70T50 120Z" fill="url(#gStone)" />
      </g>
      <g clipPath="url(#clipFrame)" stroke="#4b535c" strokeWidth="2" opacity=".5" fill="none">
        {[40, 90, 140, 190, 240, 290, 340, 390].map((y) => <path key={y} d={`M0 ${y}H320`} />)}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={i} d={`M${i % 2 ? 20 : 8} ${40 + i * 50}v50`} />)}
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => <path key={'r' + i} d={`M${i % 2 ? 300 : 290} ${40 + i * 50}v50`} />)}
      </g>
      {/* snow on arch */}
      <path d="M-6 74Q-6 -8 160 -8T326 74Q290 56 270 74Q250 52 230 40Q200 22 160 22Q120 22 90 40Q70 52 50 74Q30 56 -6 74Z" fill="url(#gSnow)" />
      {/* garland on the arch */}
      <path d="M40 122Q60 60 160 58T280 122" fill="none" stroke="#1d5a41" strokeWidth="14" strokeLinecap="round" />
      {Array.from({ length: 16 }, (_, i) => {
        const t = i / 15
        const x = 40 + t * 240
        const y = 122 - Math.sin(Math.PI * t) * 64
        return <g key={i}><circle cx={x} cy={y - 5} r="3" fill="#c63a48" /><path d={`M${x - 9} ${y + 3}l9 -10l9 10`} stroke="#2f7a58" strokeWidth="3" fill="none" /></g>
      })}
      {/* wreath */}
      <g transform="translate(160 26)">
        <circle r="24" fill="none" stroke="#1d5a41" strokeWidth="13" />
        {Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * 6.283; return <circle key={i} cx={Math.cos(a) * 24} cy={Math.sin(a) * 24} r="5.5" fill={i % 2 ? '#2f7a58' : '#24694b'} /> })}
        {[0, 2.1, 4.2].map((a) => <circle key={a} cx={Math.cos(a) * 24} cy={Math.sin(a) * 24} r="3.2" fill="#d2404f" />)}
        <path d="M-6 22l-14 24l14 -8l6 12l6 -12l14 8l-14 -24Z" fill="url(#gRed)" />
        <circle cy="23" r="6" fill="url(#gRed)" />
      </g>
      {/* bells */}
      {[[62, 118], [258, 118]].map(([x, y]) => (
        <g key={x} transform={`translate(${x} ${y})`}>
          <path d="M0 -10Q-8 -20 -14 -8" stroke="#1d5a41" strokeWidth="5" fill="none" />
          <path d="M-10 6Q-10 -8 0 -8T10 6V10H-10Z" fill="url(#gGold)" stroke="#c98a31" />
          <circle cy="12" r="2.6" fill="#8a5a1a" />
        </g>
      ))}
      <Star5 x={160} y={-2} r={0} />
      {/* step */}
      <rect x="30" y="418" width="260" height="22" fill="url(#gStone)" />
      <path d="M26 420Q160 408 294 420V426H26Z" fill="url(#gSnow)" />
    </svg>
  )
}

/** One wooden door leaf. `side` decides where the handle sits. */
export function DoorPanel({ side }: { side: 'l' | 'r' }) {
  const hx = side === 'l' ? 96 : 14
  return (
    <svg viewBox="0 0 110 350" preserveAspectRatio="none" className={`door-panel door-panel-${side}`} aria-hidden="true">
      <rect width="110" height="350" fill="url(#gWood)" />
      {[18, 37, 55, 74, 92].map((x) => <path key={x} d={`M${x} 0V350`} stroke="#3f2614" strokeWidth="1.3" opacity=".55" />)}
      {[[8, 12, 94, 148], [8, 178, 94, 160]].map(([x, y, w, h], i) => (
        <g key={i}>
          <rect x={x} y={y} width={w} height={h} rx="3" fill="url(#gWoodD)" opacity=".5" />
          <rect x={x + 7} y={y + 7} width={w - 14} height={h - 14} rx="2" fill="none" stroke="#c18a52" strokeWidth="1.4" opacity=".7" />
        </g>
      ))}
      <circle cx={hx} cy="190" r="8" fill="url(#gGold)" stroke="#a8742a" />
      <rect x={hx - 2.5} y="196" width="5" height="24" rx="2.5" fill="url(#gGold)" />
      <path d="M0 0H110V350H0Z" fill="none" stroke="#2c1a0d" strokeWidth="3" />
    </svg>
  )
}
