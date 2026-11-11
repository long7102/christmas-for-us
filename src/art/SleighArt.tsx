function Deer({ x, y, nose = false }: { x: number; y: number; nose?: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <g stroke="#4a2d18" strokeWidth="3" strokeLinecap="round" fill="none">
        <path className="leg-a" d="M-22 14L-30 44L-24 52M-8 16L-12 46L-6 54" />
        <path className="leg-b" d="M26 14L36 40L44 46M40 10L52 32L60 36" />
      </g>
      <ellipse cx="14" cy="6" rx="40" ry="17" fill="#9a6a3e" />
      <ellipse cx="14" cy="14" rx="30" ry="8" fill="#d6b184" opacity=".7" />
      <path d="M48 -2L72 -22L84 -12L70 6Z" fill="#9a6a3e" />
      <ellipse cx="84" cy="-12" rx="13" ry="10" fill="#a8764a" />
      <circle cx="86" cy="-16" r="2.4" fill="#1b0f08" />
      <circle cx={nose ? 96 : 94} cy="-8" r={nose ? 5 : 3} fill={nose ? '#ff4b4b' : '#2a1608'} />
      {nose && <circle cx="96" cy="-8" r="11" fill="#ff4b4b" opacity=".35" />}
      <path d="M72 -20Q66 -42 56 -44M70 -28Q80 -44 90 -46M72 -24Q82 -34 96 -34" stroke="#d9c2a0" strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M-24 4Q-34 -6 -38 4" stroke="#9a6a3e" strokeWidth="5" fill="none" strokeLinecap="round" />
    </g>
  )
}

/** Santa + sleigh + two reindeer, facing right. viewBox 520x200 */
export default function SleighArt() {
  return (
    <svg viewBox="0 0 520 200" className="sleigh-svg" aria-hidden="true">
      <g filter="url(#fShadow)">
        <path d="M170 76L330 76" stroke="#d9b377" strokeWidth="2" />
        <path d="M176 70Q250 80 330 72" stroke="#d9b377" strokeWidth="2" fill="none" />
        <Deer x={244} y={70} />
        <Deer x={364} y={64} nose />
        {/* sleigh */}
        <g transform="translate(24 40)">
          <path d="M10 118Q4 128 20 130L150 130Q168 128 160 112" stroke="url(#gGold)" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M28 130V112M120 130V112" stroke="#d99a3e" strokeWidth="4" />
          <path d="M14 56Q10 100 36 112H140Q168 98 168 60Q150 74 130 74L40 74Q24 74 14 56Z" fill="url(#gRed)" />
          <path d="M18 62Q80 82 164 64" stroke="url(#gGold)" strokeWidth="4" fill="none" />
          {/* sack */}
          <path d="M26 74Q8 38 40 32Q60 30 66 52Q74 72 66 76Z" fill="#c9a064" />
          <path d="M36 32Q42 22 52 30" stroke="#8a5a1a" strokeWidth="3" fill="none" />
          <circle cx="74" cy="66" r="6" fill="#c63a48" /><rect x="68" y="60" width="12" height="3" fill="#ffe9b0" />
          {/* santa */}
          <circle cx="106" cy="42" r="15" fill="#f2cba5" />
          <path d="M90 40Q106 56 122 40Q126 62 106 68Q86 62 90 40Z" fill="#fff" />
          <path d="M92 34Q104 6 130 18Q122 20 120 30Q106 22 92 34Z" fill="url(#gRed)" />
          <circle cx="134" cy="18" r="5" fill="#fff" />
          <rect x="88" y="32" width="36" height="7" rx="3" fill="#fff" />
          <circle cx="112" cy="40" r="1.8" fill="#222" />
          <path d="M92 60Q106 100 128 74L126 60Z" fill="url(#gRed)" />
          <path d="M96 72H126" stroke="#2a1a14" strokeWidth="5" />
        </g>
      </g>
    </svg>
  )
}
