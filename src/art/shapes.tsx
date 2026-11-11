export function rng(seed: number) {
  return () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function StarField({ w = 1600, h = 900, n = 90, seed = 3, maxY = 0.7 }: { w?: number; h?: number; n?: number; seed?: number; maxY?: number }) {
  const r = rng(seed)
  return (
    <g>
      {Array.from({ length: n }, (_, i) => {
        const big = r() > 0.88
        return <circle key={i} className="twinkle" cx={r() * w} cy={r() * h * maxY} r={big ? 2.1 : 0.7 + r() * 0.9} fill="#fff" opacity={0.5 + r() * 0.5} style={{ animationDelay: `${(r() * 5).toFixed(2)}s`, animationDuration: `${3 + r() * 4}s` }} />
      })}
    </g>
  )
}

export function Star5({ x, y, r, fill = 'url(#gGold)' }: { x: number; y: number; r: number; fill?: string }) {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2
    const rr = i % 2 ? r * 0.42 : r
    return `${(x + Math.cos(a) * rr).toFixed(1)},${(y + Math.sin(a) * rr).toFixed(1)}`
  }).join(' ')
  return <polygon points={pts} fill={fill} strokeLinejoin="round" stroke="#e6a94a" strokeWidth={r * 0.06} />
}

export function Pine({ x, y, s = 1, fill = 'url(#gPine)', snow = true, opacity = 1 }: { x: number; y: number; s?: number; fill?: string; snow?: boolean; opacity?: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
      <rect x="-7" y="-10" width="14" height="26" fill="#4a2f1c" />
      <path d="M0-175 L36-108 L19-108 L52-54 L29-54 L66-8 L-66-8 L-29-54 L-52-54 L-19-108 L-36-108Z" fill={fill} />
      {snow && (
        <g fill="url(#gSnow)">
          <path d="M0-175 L17-145 Q8-137 0-143 Q-8-137 -17-145Z" />
          <path d="M-36-108 Q0-126 36-108 Q18-101 0-110 Q-18-101 -36-108Z" />
          <path d="M-52-54 Q0-76 52-54 Q26-47 0-57 Q-26-47 -52-54Z" />
          <path d="M-66-8 Q0-34 66-8 Q33 0 0-12 Q-33 0 -66-8Z" />
        </g>
      )}
    </g>
  )
}

type HouseP = { x: number; y: number; w: number; h: number; wall?: string; roof?: string; windows?: number; smoke?: boolean; lit?: boolean }
export function House({ x, y, w, h, wall = '#6b3a2c', roof = '#3b2431', windows = 2, smoke = true, lit = true }: HouseP) {
  const rh = w * 0.5
  const ww = w / (windows * 2 + 1)
  return (
    <g>
      {smoke && (
        <g>
          <rect x={x + w * 0.68} y={y - h - rh * 0.7} width={w * 0.1} height={rh * 0.7} fill="#4a2c27" />
          <rect x={x + w * 0.66} y={y - h - rh * 0.78} width={w * 0.14} height={w * 0.04} fill="url(#gSnow)" />
          {[0, 1, 2].map((i) => (
            <circle key={i} className="smoke" cx={x + w * 0.73} cy={y - h - rh * 0.8} r={w * 0.05} fill="#dfe8f3" style={{ animationDelay: `${i * 1.6}s` }} />
          ))}
        </g>
      )}
      <rect x={x} y={y - h} width={w} height={h} fill={wall} />
      <rect x={x} y={y - h} width={w} height={h} fill="url(#gRoom)" opacity=".25" />
      <polygon points={`${x - w * 0.07},${y - h + 3} ${x + w / 2},${y - h - rh} ${x + w * 1.07},${y - h + 3}`} fill={roof} />
      <path d={`M${x - w * 0.09},${y - h + 5} L${x + w / 2},${y - h - rh - 4} L${x + w * 1.09},${y - h + 5} Q${x + w * 0.85},${y - h - 6} ${x + w * 0.7},${y - h + 7} Q${x + w * 0.55},${y - h - 4} ${x + w * 0.4},${y - h + 8} Q${x + w * 0.22},${y - h - 3} ${x + w * 0.1},${y - h + 6}Z`} fill="url(#gSnow)" />
      {Array.from({ length: windows }, (_, i) => {
        const wx = x + ww * (1 + i * 2)
        const wy = y - h * 0.72
        const wh = h * 0.38
        return (
          <g key={i}>
            {lit && <circle cx={wx + ww / 2} cy={wy + wh / 2} r={ww * 1.5} fill="url(#gGlow)" opacity=".75" />}
            <rect x={wx} y={wy} width={ww} height={wh} rx="2" fill={lit ? '#ffd98a' : '#223'} />
            <path d={`M${wx + ww / 2},${wy} v${wh} M${wx},${wy + wh / 2} h${ww}`} stroke="#6b3a1c" strokeWidth="2" />
            <rect x={wx - 3} y={wy + wh} width={ww + 6} height="4" fill="url(#gSnow)" />
          </g>
        )
      })}
      <rect x={x + w / 2 - ww * 0.45} y={y - h * 0.3} width={ww * 0.9} height={h * 0.3} rx={ww * 0.45} fill="#3a2012" />
      <rect x={x - 4} y={y - 3} width={w + 8} height="8" fill="url(#gSnow)" />
    </g>
  )
}

export function Ornament({ x, y, r = 14, color = '#c63a48' }: { x: number; y: number; r?: number; color?: string }) {
  return (
    <g>
      <rect x={x - 3} y={y - r - 7} width="6" height="8" rx="2" fill="url(#gGold)" />
      <circle cx={x} cy={y} r={r} fill={color} />
      <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.28} fill="#fff" opacity=".55" />
      <path d={`M${x - r},${y} Q${x},${y + r * 0.5} ${x + r},${y}`} stroke="url(#gGold)" strokeWidth="2.4" fill="none" />
    </g>
  )
}
