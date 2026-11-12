/** Hình minh hoạ hoạt ảnh cho từng vật trong phòng: vẽ bằng SVG (đổ bóng, chất liệu, ánh sáng), chuyển động bằng CSS. */
import type { ReactNode } from 'react'

const Svg = ({ children, label }: { children: ReactNode; label: string }) => (
  <svg className="ic" viewBox="0 0 200 220" role="img" aria-label={label}>{children}</svg>
)
/** số ngẫu nhiên cố định để hình luôn giống nhau */
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

type Variant = 'coins' | 'orange' | 'tag'

export function StockingIcon({ main = '#a82a2a', dark = '#6f1414', light = '#d85050', variant = 'coins' }: { main?: string; dark?: string; light?: string; variant?: Variant }) {
  const id = `sk${variant}`
  return (
    <Svg label="Chiếc tất">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={dark} /><stop offset=".35" stopColor={light} /><stop offset=".6" stopColor={main} /><stop offset="1" stopColor={dark} /></linearGradient>
        <pattern id={`${id}p`} width="7" height="6" patternUnits="userSpaceOnUse"><path d="M0 0 l3.5 5 l3.5 -5" fill="none" stroke="#000" strokeOpacity=".22" strokeWidth="1.1" /></pattern>
        <linearGradient id={`${id}c`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fffaf0" /><stop offset="1" stopColor="#e2d4b4" /></linearGradient>
        <clipPath id={`${id}k`}><path d="M60 46 H124 V138 Q124 158 148 168 Q182 180 176 202 Q168 214 136 208 Q68 196 60 140 Z" /></clipPath>
      </defs>
      <ellipse cx="116" cy="214" rx="64" ry="6" fill="#000" opacity=".18" />
      <g className="ic-swing" style={{ transformOrigin: '98px 8px' }}>
        {variant === 'orange' && (
          <g className="ic-bob"><circle cx="92" cy="30" r="21" fill="#f08a1c" /><circle cx="92" cy="30" r="21" fill="url(#orbg)" /><circle cx="84" cy="22" r="6" fill="#ffd08a" opacity=".7" /><path d="M92 10 q8 -8 16 -4 q-4 10 -16 4z" fill="#4c8a3a" /><circle cx="116" cy="36" r="13" fill="#f4a030" /><circle cx="111" cy="31" r="4" fill="#ffe0a8" opacity=".7" /></g>
        )}
        {variant === 'orange' && <defs><radialGradient id="orbg" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#a84c00" stopOpacity=".55" /></radialGradient></defs>}
        <path d="M98 6 Q86 -4 80 8 M98 6 L98 30" stroke="#7a1f18" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M60 46 H124 V138 Q124 158 148 168 Q182 180 176 202 Q168 214 136 208 Q68 196 60 140 Z" fill={`url(#${id}g)`} stroke={dark} strokeWidth="2.4" />
        <rect x="56" y="40" width="130" height="180" fill={`url(#${id}p)`} clipPath={`url(#${id}k)`} />
        <g clipPath={`url(#${id}k)`}>
          <ellipse cx="150" cy="198" rx="30" ry="16" fill={light} opacity=".55" transform="rotate(20 150 198)" /><path d="M126 164 Q150 172 172 192" stroke="#fff" strokeOpacity=".25" strokeWidth="2" fill="none" strokeDasharray="3 3" />
          <path d="M60 126 H124" stroke="#fff3dc" strokeWidth="2.4" strokeDasharray="5 4" opacity=".9" /><path d="M60 70 H124" stroke="#fff3dc" strokeWidth="2.4" strokeDasharray="5 4" opacity=".9" />
          <g stroke="#fff3dc" strokeWidth="3" strokeLinecap="round" transform="translate(92 98)"><path d="M0 -20 V20 M-17 -10 L17 10 M-17 10 L17 -10" /><path d="M-4 -14 L0 -18 L4 -14 M-4 14 L0 18 L4 14 M-15 -2 L-17 -9 L-11 -8 M15 2 L17 9 L11 8" strokeWidth="2" fill="none" /><circle r="3.4" fill="#fff3dc" /></g>
          <path d="M60 46 V138 Q60 150 70 160" stroke="#000" strokeOpacity=".18" strokeWidth="10" fill="none" />
        </g>
        <path d="M122 140 Q124 158 148 168" fill="none" stroke="#fff" strokeOpacity=".18" strokeWidth="2" />
        <path d="M52 30 Q52 20 64 20 H122 Q136 20 136 32 V50 Q136 58 128 58 Q122 66 114 58 Q106 66 98 58 Q90 66 82 58 Q74 66 66 58 Q52 58 52 50 Z" fill={`url(#${id}c)`} stroke="#bba980" strokeWidth="2" />
        <g stroke="#bba980" strokeOpacity=".6" strokeWidth="1.5"><path d="M64 26 V50 M76 26 V52 M88 26 V54 M100 26 V54 M112 26 V52 M124 26 V50" /></g>
        {variant === 'tag' && (
          <g className="ic-sway" style={{ transformOrigin: '128px 44px' }}><path d="M128 44 q14 4 12 18" stroke="#8b2a22" strokeWidth="2" fill="none" /><rect x="122" y="60" width="30" height="22" rx="3" fill="#f6ecd0" stroke="#a48d5c" strokeWidth="1.5" /><circle cx="127" cy="65" r="1.8" fill="#8b6b30" /><path d="M137 66 l3 6 6 1 -4.6 4 1.4 6 -5.8 -3.2 -5.8 3.2 1.4 -6 -4.6 -4 6 -1z" fill="#b8892e" transform="scale(.55) translate(110 50)" /></g>
        )}
        {variant === 'tag' && <g><path d="M62 24 q14 -14 30 -4 q-8 12 -30 4z" fill="#2b6a3e" /><path d="M82 20 q14 -14 30 -2 q-10 12 -30 2z" fill="#3f8a4d" /><g fill="#c6302a"><circle cx="86" cy="22" r="4" /><circle cx="93" cy="26" r="4" /></g></g>}
        {variant === 'coins' && (
          <g>{[[84, 22, 0], [108, 18, -1.1], [96, 30, -.5]].map(([x, y, d], i) => <g key={i} className="ic-coin" style={{ animationDelay: `${d}s` }}><circle cx={x} cy={y} r="9" fill="#e8b93c" stroke="#a87a14" strokeWidth="1.6" /><circle cx={x} cy={y} r="5.4" fill="none" stroke="#a87a14" strokeWidth="1" /><path d={`M${x - 3} ${y - 5} a5 5 0 0 1 6 0`} stroke="#fff3b8" strokeWidth="1.6" fill="none" /></g>)}</g>
        )}
      </g>
      <g className="ic-tw" fill="#fff0b8"><path d="M170 60 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" /><path d="M24 110 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" style={{ animationDelay: '-1s' }} /><path d="M32 176 l1.6 4.6 4.6 1.6 -4.6 1.6 -1.6 4.6 -1.6 -4.6 -4.6 -1.6 4.6 -1.6z" style={{ animationDelay: '-1.7s' }} /></g>
    </Svg>
  )
}

export function FireIcon() {
  const r = rng(7)
  const stones = Array.from({ length: 46 }, (_, i) => {
    const row = Math.floor(i / 9), col = i % 9
    const x = 10 + col * 20 + (row % 2) * 9 + r() * 3, y = 92 + row * 24 + r() * 3
    return { x, y, w: 17 + r() * 4, h: 18 + r() * 3, c: `hsl(${28 + r() * 10} ${14 + r() * 10}% ${42 + r() * 18}%)` }
  })
  return (
    <Svg label="Bếp lửa">
      <defs>
        <clipPath id="fir-ring"><path fillRule="evenodd" d="M6 214 V112 Q6 34 100 34 Q194 34 194 112 V214 Z M46 214 V118 Q46 70 100 70 Q154 70 154 118 V214 Z" /></clipPath>
        <radialGradient id="fir-in" cx=".5" cy=".95" r=".9"><stop offset="0" stopColor="#ff9a3c" /><stop offset=".45" stopColor="#6e2a0c" /><stop offset="1" stopColor="#140805" /></radialGradient>
        <linearGradient id="fir-fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff5a14" /><stop offset=".55" stopColor="#ff9a22" /><stop offset="1" stopColor="#ffd45a" /></linearGradient>
        <linearGradient id="fir-log" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a4a26" /><stop offset="1" stopColor="#3a2010" /></linearGradient>
        <radialGradient id="fir-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffb04a" stopOpacity=".8" /><stop offset="1" stopColor="#ff8a2a" stopOpacity="0" /></radialGradient>
      </defs>
      <g clipPath="url(#fir-ring)">{stones.map((s, i) => <rect key={i} x={s.x} y={s.y - 56} width={s.w} height={s.h} rx="4" fill={s.c} stroke="#2e2014" strokeOpacity=".55" strokeWidth="1.4" />)}
        <rect x="0" y="30" width="200" height="190" fill="#000" opacity=".12" /></g>
      {Array.from({ length: 8 }, (_, i) => { const a = Math.PI + (i / 7) * Math.PI; return <rect key={`k${i}`} x={100 + Math.cos(a) * 82 - 9} y={112 + Math.sin(a) * 76 - 9} width="18" height="18" rx="3" fill="#8a6a46" stroke="#3a2a1a" strokeWidth="1.4" transform={`rotate(${(a * 180) / Math.PI + 90} ${100 + Math.cos(a) * 82} ${112 + Math.sin(a) * 76})`} opacity=".0" /> })}
      <path d="M46 214 V118 Q46 70 100 70 Q154 70 154 118 V214 Z" fill="url(#fir-in)" />
      <g stroke="#000" strokeOpacity=".35" strokeWidth="1.6" fill="none"><path d="M52 150 H148 M52 128 H148 M52 172 H148" /><path d="M70 128 V150 M110 128 V150 M90 150 V172 M130 150 V172 M70 172 V194" /></g>
      <ellipse className="ic-glowbox" cx="100" cy="196" rx="52" ry="18" fill="url(#fir-glow)" />
      <rect x="6" y="206" width="188" height="12" rx="3" fill="#7a6a58" stroke="#3a3026" strokeWidth="1.6" />
      <rect x="62" y="186" width="80" height="14" rx="7" fill="url(#fir-log)" transform="rotate(-6 100 193)" /><path d="M70 190 h60 M74 186 h50" stroke="#2a1608" strokeOpacity=".6" strokeWidth="1.2" transform="rotate(-6 100 193)" />
      <rect x="64" y="176" width="76" height="14" rx="7" fill="url(#fir-log)" transform="rotate(8 102 183)" /><circle cx="140" cy="181" r="6" fill="#d9a05a" opacity=".85" /><circle cx="140" cy="181" r="2.5" fill="#7a4a26" />
      <g fill="#ff7a2a" opacity=".9"><circle cx="84" cy="196" r="3" /><circle cx="112" cy="198" r="3.4" /><circle cx="126" cy="195" r="2.6" /><circle cx="96" cy="199" r="2.2" /></g>
      <g className="ic-flame a" style={{ transformOrigin: '100px 190px' }}><path d="M100 94 C122 126 136 152 126 178 C118 192 82 192 74 178 C64 152 80 126 100 94Z" fill="url(#fir-fl)" /></g>
      <g className="ic-flame b" style={{ transformOrigin: '100px 190px' }}><path d="M88 120 C98 138 98 158 92 176 C86 186 72 184 72 172 C70 152 80 138 88 120Z" fill="#ff8a1e" opacity=".9" /></g>
      <g className="ic-flame b" style={{ transformOrigin: '100px 190px', animationDelay: '-.3s' }}><path d="M118 126 C126 142 128 160 122 176 C118 184 106 184 106 174 C106 156 112 142 118 126Z" fill="#ffae2a" opacity=".9" /></g>
      <g className="ic-flame c" style={{ transformOrigin: '100px 190px' }}><path d="M100 138 C112 158 114 172 108 184 C104 190 96 190 92 184 C86 172 88 158 100 138Z" fill="#ffe9a0" /></g>
      <g className="ic-flame c" style={{ transformOrigin: '100px 190px', animationDelay: '-.25s' }}><path d="M100 160 C106 170 106 178 103 184 C101 187 99 187 97 184 C94 178 94 170 100 160Z" fill="#fffbe6" /></g>
      <g fill="#ffd27a">{[[84, 120, 1], [116, 110, 2], [100, 100, 3], [128, 130, 4], [74, 138, 5]].map(([x, y, n]) => <circle key={n} className={`ic-spark s${(n % 3) + 1}`} cx={x} cy={y} r="2.2" style={{ animationDelay: `-${n * 0.45}s` }} />)}</g>
      <rect x="2" y="26" width="196" height="16" rx="4" fill="#6a4426" stroke="#2e1c0e" strokeWidth="2" /><path d="M10 34 H190" stroke="#8a5e36" strokeOpacity=".7" strokeWidth="1.4" />
      <path d="M6 26 Q40 40 70 26 T130 26 T194 26" fill="none" stroke="#2b6a3e" strokeWidth="8" strokeLinecap="round" /><path d="M6 26 Q40 40 70 26 T130 26 T194 26" fill="none" stroke="#4a9a58" strokeWidth="3" strokeDasharray="2 5" strokeLinecap="round" />
      {[20, 56, 100, 146, 180].map((x, i) => <circle key={i} className="ic-light" cx={x} cy={i % 2 ? 36 : 30} r="3" fill="#ffe08a" style={{ animationDelay: `-${i * 0.5}s` }} />)}
    </Svg>
  )
}

export function WreathIcon() {
  const r = rng(11)
  const leaves = Array.from({ length: 96 }, (_, i) => {
    const t = (i / 96) * Math.PI * 2, ring = i % 3, rad = 56 + ring * 9 + (r() - 0.5) * 8
    return { x: 100 + Math.cos(t) * rad, y: 100 + Math.sin(t) * rad, a: (t * 180) / Math.PI + 90 + (r() - 0.5) * 70, c: ['#1f5231', '#2f7040', '#43914f', '#5aa862'][Math.floor(r() * 4)], l: 12 + r() * 6 }
  })
  const cones = [20, 95, 170, 245, 310].map((deg, i) => ({ x: 100 + Math.cos((deg * Math.PI) / 180) * 62, y: 100 + Math.sin((deg * Math.PI) / 180) * 62, a: deg + 90, i }))
  const berries = [50, 125, 200, 270, 335].map((deg) => ({ x: 100 + Math.cos((deg * Math.PI) / 180) * 64, y: 100 + Math.sin((deg * Math.PI) / 180) * 64 }))
  const lights = Array.from({ length: 18 }, (_, i) => { const t = (i / 18) * Math.PI * 2; return { x: 100 + Math.cos(t) * (60 + (i % 2) * 8), y: 100 + Math.sin(t) * (60 + (i % 2) * 8), i } })
  return (
    <Svg label="Vòng hoa">
      <defs><radialGradient id="wr-glow"><stop offset="0" stopColor="#fff2b0" /><stop offset="1" stopColor="#ffc850" stopOpacity="0" /></radialGradient>
        <linearGradient id="wr-bow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9373a" /><stop offset="1" stopColor="#8a1418" /></linearGradient>
        <radialGradient id="wr-bell" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#fff0a8" /><stop offset=".5" stopColor="#d9a62e" /><stop offset="1" stopColor="#8a6212" /></radialGradient></defs>
      <circle cx="100" cy="100" r="62" fill="none" stroke="#12301c" strokeWidth="26" opacity=".85" />
      {leaves.map((l, i) => <ellipse key={i} cx={l.x} cy={l.y} rx={l.l} ry="4.4" fill={l.c} stroke="#0f2a18" strokeOpacity=".5" strokeWidth=".6" transform={`rotate(${l.a} ${l.x} ${l.y})`} />)}
      {cones.map((c) => (
        <g key={c.i} transform={`rotate(${c.a} ${c.x} ${c.y})`}><ellipse cx={c.x} cy={c.y} rx="7" ry="11" fill="#7a4a22" stroke="#3e220c" strokeWidth="1.2" />
          <g stroke="#3e220c" strokeWidth="1" fill="none"><path d={`M${c.x - 6} ${c.y - 5} q6 4 12 0 M${c.x - 6.5} ${c.y} q6.5 4 13 0 M${c.x - 6} ${c.y + 5} q6 4 12 0`} /></g><ellipse cx={c.x - 2} cy={c.y - 4} rx="2" ry="3.4" fill="#c28a52" opacity=".55" /></g>
      ))}
      {berries.map((b, i) => <g key={i}>{[[0, 0], [8, 3], [3, 8]].map(([dx, dy], j) => <g key={j}><circle cx={b.x + dx} cy={b.y + dy} r="5.2" fill="#c9302c" stroke="#7a1412" strokeWidth=".9" /><circle cx={b.x + dx - 1.6} cy={b.y + dy - 1.8} r="1.5" fill="#ffd8cc" /></g>)}</g>)}
      {lights.map((l) => <g key={l.i}><circle className="ic-light" cx={l.x} cy={l.y} r="9" fill="url(#wr-glow)" style={{ animationDelay: `-${(l.i * 0.31).toFixed(2)}s` }} /><circle cx={l.x} cy={l.y} r="2.4" fill="#fff5c2" /></g>)}
      <g className="ic-sway" style={{ transformOrigin: '100px 176px' }}>
        <path d="M100 172 Q70 140 52 168 Q64 196 100 172Z" fill="url(#wr-bow)" stroke="#6a1014" strokeWidth="1.2" /><path d="M100 172 Q130 140 148 168 Q136 196 100 172Z" fill="url(#wr-bow)" stroke="#6a1014" strokeWidth="1.2" />
        <path d="M72 168 Q86 164 98 172 M128 168 Q114 164 102 172" stroke="#ff8d8d" strokeOpacity=".5" strokeWidth="1.6" fill="none" />
        <path d="M92 178 Q82 204 66 214 Q82 212 98 188Z M108 178 Q118 204 134 214 Q118 212 102 188Z" fill="#9c1a20" stroke="#6a1014" strokeWidth="1" />
        <rect x="93" y="166" width="14" height="14" rx="5" fill="#c92a2e" stroke="#6a1014" strokeWidth="1.2" />
        <g className="ic-ring" style={{ transformOrigin: '84px 196px' }}><circle cx="84" cy="198" r="9" fill="url(#wr-bell)" stroke="#6e4c0c" strokeWidth="1.2" /><path d="M76 200 h16" stroke="#6e4c0c" strokeWidth="1.4" /><circle cx="84" cy="205" r="1.8" fill="#4a3208" /></g>
        <g className="ic-ring" style={{ transformOrigin: '116px 196px', animationDelay: '-.5s' }}><circle cx="116" cy="198" r="9" fill="url(#wr-bell)" stroke="#6e4c0c" strokeWidth="1.2" /><path d="M108 200 h16" stroke="#6e4c0c" strokeWidth="1.4" /><circle cx="116" cy="205" r="1.8" fill="#4a3208" /></g>
      </g>
    </Svg>
  )
}

export function StarIcon() {
  const pt = (a: number, r: number) => [100 + r * Math.cos(a), 108 + r * Math.sin(a)] as const
  const facets = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI * i) / 4 - Math.PI / 2, vl = a - Math.PI / 8, vr = a + Math.PI / 8
    const tip = pt(a, 80), L = pt(vl, 24), R = pt(vr, 24), C = [100, 108] as const
    return { l: `${C} ${L} ${tip}`, r: `${C} ${tip} ${R}`, i }
  })
  const inner = Array.from({ length: 8 }, (_, i) => {
    const a = (Math.PI * i) / 4 - Math.PI / 2 + Math.PI / 8, vl = a - Math.PI / 8, vr = a + Math.PI / 8
    return { l: `100,108 ${pt(vl, 18)} ${pt(a, 54)}`, r: `100,108 ${pt(a, 54)} ${pt(vr, 18)}`, i }
  })
  const star = facets.map((f) => f.l.split(' ').slice(2).join(' ')).join(' ')
  return (
    <Svg label="Ngôi sao">
      <defs>
        <radialGradient id="st-halo" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff0b0" stopOpacity=".95" /><stop offset=".5" stopColor="#ffc860" stopOpacity=".35" /><stop offset="1" stopColor="#ffb040" stopOpacity="0" /></radialGradient>
        <linearGradient id="st-shim" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".85" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <clipPath id="st-clip"><polygon points={facets.flatMap((f, i) => { const a = (Math.PI * i) / 4 - Math.PI / 2; return [pt(a, 80).join(','), pt(a + Math.PI / 8, 24).join(',')] }).join(' ')} /></clipPath>
      </defs>
      <circle className="ic-halo" cx="100" cy="108" r="100" fill="url(#st-halo)" />
      <g stroke="#7a4e10" strokeWidth="1.2" strokeLinejoin="round">
        {facets.map((f) => <g key={f.i}><polygon points={f.l} fill={f.i % 2 ? '#f3c25a' : '#ffe08a'} /><polygon points={f.r} fill={f.i % 2 ? '#b8782a' : '#d49a3a'} /></g>)}
      </g>
      <g stroke="#8a5a14" strokeWidth=".9" strokeLinejoin="round">{inner.map((f) => <g key={f.i}><polygon points={f.l} fill={f.i % 2 ? '#ffe9a6' : '#fff3c4'} opacity=".95" /><polygon points={f.r} fill={f.i % 2 ? '#e6b24a' : '#f2c86a'} opacity=".95" /></g>)}</g>
      <circle cx="100" cy="108" r="7" fill="#fff6d2" stroke="#a87220" strokeWidth="1.4" /><circle cx="98" cy="106" r="2.4" fill="#fff" />
      <g clipPath="url(#st-clip)"><rect className="ic-shim" x="-60" y="20" width="44" height="170" fill="url(#st-shim)" transform="rotate(20 100 108)" /></g>
      <path d="M92 186 L100 172 L108 186 Z" fill="#8a5a14" /><path d="M64 214 Q100 168 136 214 Q100 196 64 214Z" fill="#17402a" /><path d="M78 214 Q100 184 122 214" fill="none" stroke="#2f7040" strokeWidth="3" />
      <g className="ic-tw" fill="#fff6cc"><path d="M30 40 l3 10 10 3 -10 3 -3 10 -3 -10 -10 -3 10 -3z" /><path d="M170 150 l2.4 7.6 7.6 2.4 -7.6 2.4 -2.4 7.6 -2.4 -7.6 -7.6 -2.4 7.6 -2.4z" style={{ animationDelay: '-1.1s' }} /><path d="M172 38 l1.6 5 5 1.6 -5 1.6 -1.6 5 -1.6 -5 -5 -1.6 5 -1.6z" style={{ animationDelay: '-1.8s' }} /></g>
    </Svg>
  )
}

export function LampIcon() {
  return (
    <Svg label="Ngọn đèn">
      <defs>
        <radialGradient id="lm-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffd98a" stopOpacity=".85" /><stop offset=".55" stopColor="#ffb54a" stopOpacity=".28" /><stop offset="1" stopColor="#ff9a2a" stopOpacity="0" /></radialGradient>
        <linearGradient id="lm-brass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#5a3c10" /><stop offset=".3" stopColor="#d9a84a" /><stop offset=".55" stopColor="#f6dc92" /><stop offset="1" stopColor="#6a4812" /></linearGradient>
        <linearGradient id="lm-glass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe3a0" stopOpacity=".55" /><stop offset="1" stopColor="#ffb040" stopOpacity=".25" /></linearGradient>
        <linearGradient id="lm-wax" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#e6d4a8" /><stop offset=".5" stopColor="#fff6dc" /><stop offset="1" stopColor="#d6c394" /></linearGradient>
        <linearGradient id="lm-fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#ff8a1e" /><stop offset="1" stopColor="#ffd25a" /></linearGradient>
      </defs>
      <circle className="ic-halo" cx="100" cy="130" r="96" fill="url(#lm-glow)" />
      <path d="M100 30 V16" stroke="#3a2a14" strokeWidth="3" /><circle cx="100" cy="12" r="9" fill="none" stroke="url(#lm-brass)" strokeWidth="4" />
      <path d="M62 66 Q100 18 138 66 Z" fill="url(#lm-brass)" stroke="#3a2a14" strokeWidth="2" /><path d="M76 62 Q100 34 124 62" stroke="#fff3c0" strokeOpacity=".55" strokeWidth="2.4" fill="none" />
      <circle cx="100" cy="40" r="5" fill="url(#lm-brass)" stroke="#3a2a14" strokeWidth="1.4" />
      <rect x="58" y="66" width="84" height="10" rx="3" fill="url(#lm-brass)" stroke="#3a2a14" strokeWidth="2" />
      <path d="M64 76 H136 L146 172 H54 Z" fill="url(#lm-glass)" stroke="#3a2a14" strokeWidth="3" />
      <path d="M64 76 L54 172 M136 76 L146 172 M100 76 V172 M60 122 H140" stroke="url(#lm-brass)" strokeWidth="4" fill="none" />
      <path d="M72 86 L66 160" stroke="#fff" strokeOpacity=".4" strokeWidth="5" strokeLinecap="round" /><path d="M126 94 L130 130" stroke="#fff" strokeOpacity=".25" strokeWidth="3" strokeLinecap="round" />
      <rect x="88" y="128" width="24" height="44" rx="3" fill="url(#lm-wax)" /><path d="M92 128 q2 12 4 4 q3 14 6 2 q3 12 7 0 v-6 h-17z" fill="#fff6dc" /><path d="M100 128 v-8" stroke="#2a1a0c" strokeWidth="2" />
      <g className="ic-flame lamp" style={{ transformOrigin: '100px 120px' }}>
        <path d="M100 84 C114 100 118 114 112 124 C108 130 92 130 88 124 C82 114 86 100 100 84Z" fill="url(#lm-fl)" /><path d="M100 102 C107 110 108 118 105 124 C103 127 97 127 95 124 C92 118 93 110 100 102Z" fill="#fff4c0" />
      </g>
      <g className="ic-tw" fill="#ffe3a0"><circle cx="38" cy="96" r="2.4" /><circle cx="164" cy="110" r="2" style={{ animationDelay: '-.8s' }} /><circle cx="170" cy="70" r="1.6" style={{ animationDelay: '-1.4s' }} /></g>
      <path d="M48 172 H152 L160 188 H40 Z" fill="url(#lm-brass)" stroke="#3a2a14" strokeWidth="2.4" /><path d="M46 188 h108 v10 q-54 10 -108 0z" fill="#4a3210" /><path d="M52 200 l-6 12 M148 200 l6 12 M100 202 v10" stroke="#3a2a14" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="100" cy="214" rx="62" ry="5" fill="#000" opacity=".2" />
    </Svg>
  )
}
