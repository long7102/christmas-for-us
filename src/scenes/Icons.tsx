/** Hình minh hoạ hoạt ảnh cho từng vật trong phòng: vẽ bằng SVG (đổ bóng, chất liệu, ánh sáng), chuyển động bằng CSS. */
import type { ReactNode } from 'react'

const Svg = ({ children, label }: { children: ReactNode; label: string }) => (
  <svg className="ic" viewBox="0 0 200 220" role="img" aria-label={label}>{children}</svg>
)
/** số ngẫu nhiên cố định để hình luôn giống nhau */
const rng = (seed: number) => () => ((seed = (seed * 16807) % 2147483647) / 2147483647)

type Variant = 'coins' | 'orange' | 'tag'
const INK = '#5a3a1a'

export function StockingIcon({ main = '#a82a2a', dark = '#6f1414', light = '#d85050', patch = '#e9dcbc', variant = 'coins' }: { main?: string; dark?: string; light?: string; patch?: string; variant?: Variant }) {
  const id = `sk${variant}`
  const body = 'M64 52 H132 L134 120 C136 142 150 152 168 160 C198 172 196 208 164 208 C128 210 92 200 76 172 C68 158 64 140 64 120 Z'
  return (
    <Svg label="Chiếc tất">
      <defs>
        <linearGradient id={`${id}g`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={dark} /><stop offset=".4" stopColor={main} /><stop offset=".62" stopColor={light} /><stop offset="1" stopColor={dark} /></linearGradient>
        <pattern id={`${id}h`} width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="5" stroke={INK} strokeOpacity=".28" strokeWidth="0.66" /></pattern>
        <pattern id={`${id}k`} width="6" height="5" patternUnits="userSpaceOnUse"><path d="M0 0 l3 4 l3 -4" fill="none" stroke={INK} strokeOpacity=".2" strokeWidth="0.55" /></pattern>
        <clipPath id={`${id}c`}><path d={body} /></clipPath>
      </defs>
      <ellipse cx="124" cy="214" rx="62" ry="5" fill={INK} opacity=".18" />
      <g className="ic-swing" style={{ transformOrigin: '98px 12px' }}>
        <path d="M98 50 C98 30 84 14 84 8 C84 0 100 0 100 10" fill="none" stroke={INK} strokeWidth="3.3" strokeLinecap="round" /><path d="M98 50 C98 30 84 14 84 8 C84 0 100 0 100 10" fill="none" stroke="#b8862e" strokeWidth="1.65" strokeLinecap="round" />
        <path d={body} fill={`url(#${id}g)`} />
        <g clipPath={`url(#${id}c)`}>
          <rect x="60" y="50" width="150" height="170" fill={`url(#${id}k)`} />
          <path d="M60 78 H140" stroke={patch} strokeWidth="4.95" opacity=".9" /><path d="M60 76 H140 M60 86 H140" stroke={INK} strokeOpacity=".4" strokeWidth="0.55" />
          {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${70 + i * 8} 82 l4 -4 l4 4 l-4 4z`} fill={main} opacity=".95" />)}
          <g stroke={patch} strokeWidth="1.65" strokeLinecap="round" transform="translate(98 116)"><path d="M0 -18 V18 M-16 -9 L16 9 M-16 9 L16 -9" /><path d="M-4 -13 L0 -18 L4 -13 M-4 13 L0 18 L4 13 M-15 -2 L-16 -9 L-10 -8 M15 2 L16 9 L10 8 M-15 2 L-16 9 L-10 8 M15 -2 L16 -9 L10 -8" strokeWidth="1.1" fill="none" /><circle r="3.4" fill={patch} stroke="none" /></g>
          <path d="M66 140 H132" stroke={patch} strokeWidth="1.32" strokeDasharray="5 4" opacity=".9" />
          <path d="M64 150 Q70 196 108 206 L90 210 L60 200 Z" fill={patch} opacity=".9" /><path d="M64 150 Q70 196 108 206" fill="none" stroke={INK} strokeOpacity=".45" strokeWidth="0.88" strokeDasharray="3 3" />
          <path d="M156 164 Q196 170 194 206 L150 210 Q168 190 156 164Z" fill={patch} opacity=".9" /><path d="M156 164 Q190 172 190 204" fill="none" stroke={INK} strokeOpacity=".45" strokeWidth="0.88" strokeDasharray="3 3" />
          <path d="M112 60 L132 60 L134 120 C136 142 150 152 168 160 C198 172 196 208 164 208 L150 208 C176 196 160 168 130 150 Z" fill={`url(#${id}h)`} />
          <path d="M64 52 C62 100 62 140 76 172" fill="none" stroke="#fff" strokeOpacity=".2" strokeWidth="2.2" />
        </g>
        <path d={body} fill="none" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
        <path d="M56 36 Q56 28 66 28 H128 Q140 28 140 38 V52 Q140 62 130 62 H66 Q56 62 56 52 Z" fill="#f3ead2" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
        <path d="M60 50 Q64 56 70 52 Q76 58 82 52 Q88 58 94 52 Q100 58 106 52 Q112 58 118 52 Q124 58 130 52 Q134 56 138 50" fill="none" stroke="#c9b98e" strokeWidth="1.1" />
        <g stroke="#cdbd92" strokeWidth="0.88"><path d="M66 34 V46 M76 34 V46 M86 34 V46 M96 34 V46 M106 34 V46 M116 34 V46 M126 34 V46" /></g>
        {variant === 'orange' && (
          <g className="ic-bob"><circle cx="88" cy="30" r="17" fill="#d98418" stroke={INK} strokeWidth="1.32" /><path d="M78 22 q6 -6 14 -4" stroke="#f6c870" strokeWidth="2.2" strokeLinecap="round" fill="none" /><path d="M88 13 q7 -8 15 -4 q-3 9 -15 4z" fill="#5a7a34" stroke={INK} strokeWidth="0.88" /><circle cx="118" cy="38" r="12" fill="#e8a02c" stroke={INK} strokeWidth="1.21" /></g>
        )}
        {variant === 'tag' && (
          <g className="ic-sway" style={{ transformOrigin: '124px 40px' }}><path d="M124 40 q12 6 8 22" stroke="#7a2a20" strokeWidth="1.32" fill="none" /><rect x="116" y="60" width="30" height="24" rx="3" fill="#efe2bc" stroke={INK} strokeWidth="1.1" /><circle cx="121" cy="65" r="2" fill="#7a5a28" /><path d="M126 72 h14 M126 77 h10" stroke={INK} strokeOpacity=".6" strokeWidth="0.77" /></g>
        )}
        {variant === 'coins' && (
          <g>{[[84, 26, 0], [106, 22, -1.1], [96, 34, -.5]].map(([x, y, d], i) => <g key={i} className="ic-coin" style={{ animationDelay: `${d}s` }}><circle cx={x} cy={y} r="10" fill="#d9a838" stroke={INK} strokeWidth="1.21" /><circle cx={x} cy={y} r="6" fill="none" stroke="#7a5a14" strokeWidth="0.66" /><path d={`M${x - 3} ${y - 6} a6 6 0 0 1 7 0`} stroke="#fff0b0" strokeWidth="0.99" fill="none" /></g>)}</g>
        )}
      </g>
      <g className="ic-tw" fill="#f7e6b0"><path d="M176 70 l3 9 9 3 -9 3 -3 9 -3 -9 -9 -3 9 -3z" /><path d="M28 110 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" style={{ animationDelay: '-1s' }} /></g>
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
      <g clipPath="url(#fir-ring)">{stones.map((s, i) => <rect key={i} x={s.x} y={s.y - 56} width={s.w} height={s.h} rx="4" fill={s.c} stroke="#2e2014" strokeOpacity=".55" strokeWidth="0.77" />)}
        <rect x="0" y="30" width="200" height="190" fill="#000" opacity=".12" /></g>
      {Array.from({ length: 8 }, (_, i) => { const a = Math.PI + (i / 7) * Math.PI; return <rect key={`k${i}`} x={100 + Math.cos(a) * 82 - 9} y={112 + Math.sin(a) * 76 - 9} width="18" height="18" rx="3" fill="#8a6a46" stroke="#3a2a1a" strokeWidth="0.77" transform={`rotate(${(a * 180) / Math.PI + 90} ${100 + Math.cos(a) * 82} ${112 + Math.sin(a) * 76})`} opacity=".0" /> })}
      <path d="M46 214 V118 Q46 70 100 70 Q154 70 154 118 V214 Z" fill="url(#fir-in)" />
      <g stroke="#000" strokeOpacity=".35" strokeWidth="0.88" fill="none"><path d="M52 150 H148 M52 128 H148 M52 172 H148" /><path d="M70 128 V150 M110 128 V150 M90 150 V172 M130 150 V172 M70 172 V194" /></g>
      <ellipse className="ic-glowbox" cx="100" cy="196" rx="52" ry="18" fill="url(#fir-glow)" />
      <rect x="6" y="206" width="188" height="12" rx="3" fill="#7a6a58" stroke="#3a3026" strokeWidth="0.88" />
      <rect x="62" y="186" width="80" height="14" rx="7" fill="url(#fir-log)" transform="rotate(-6 100 193)" /><path d="M70 190 h60 M74 186 h50" stroke="#2a1608" strokeOpacity=".6" strokeWidth="0.66" transform="rotate(-6 100 193)" />
      <rect x="64" y="176" width="76" height="14" rx="7" fill="url(#fir-log)" transform="rotate(8 102 183)" /><circle cx="140" cy="181" r="6" fill="#d9a05a" opacity=".85" /><circle cx="140" cy="181" r="2.5" fill="#7a4a26" />
      <g fill="#ff7a2a" opacity=".9"><circle cx="84" cy="196" r="3" /><circle cx="112" cy="198" r="3.4" /><circle cx="126" cy="195" r="2.6" /><circle cx="96" cy="199" r="2.2" /></g>
      <g className="ic-flame a" style={{ transformOrigin: '100px 190px' }}><path d="M100 94 C122 126 136 152 126 178 C118 192 82 192 74 178 C64 152 80 126 100 94Z" fill="url(#fir-fl)" /></g>
      <g className="ic-flame b" style={{ transformOrigin: '100px 190px' }}><path d="M88 120 C98 138 98 158 92 176 C86 186 72 184 72 172 C70 152 80 138 88 120Z" fill="#ff8a1e" opacity=".9" /></g>
      <g className="ic-flame b" style={{ transformOrigin: '100px 190px', animationDelay: '-.3s' }}><path d="M118 126 C126 142 128 160 122 176 C118 184 106 184 106 174 C106 156 112 142 118 126Z" fill="#ffae2a" opacity=".9" /></g>
      <g className="ic-flame c" style={{ transformOrigin: '100px 190px' }}><path d="M100 138 C112 158 114 172 108 184 C104 190 96 190 92 184 C86 172 88 158 100 138Z" fill="#ffe9a0" /></g>
      <g className="ic-flame c" style={{ transformOrigin: '100px 190px', animationDelay: '-.25s' }}><path d="M100 160 C106 170 106 178 103 184 C101 187 99 187 97 184 C94 178 94 170 100 160Z" fill="#fffbe6" /></g>
      <g fill="#ffd27a">{[[84, 120, 1], [116, 110, 2], [100, 100, 3], [128, 130, 4], [74, 138, 5]].map(([x, y, n]) => <circle key={n} className={`ic-spark s${(n % 3) + 1}`} cx={x} cy={y} r="2.2" style={{ animationDelay: `-${n * 0.45}s` }} />)}</g>
      <rect x="2" y="26" width="196" height="16" rx="4" fill="#6a4426" stroke="#2e1c0e" strokeWidth="1.1" /><path d="M10 34 H190" stroke="#8a5e36" strokeOpacity=".7" strokeWidth="0.77" />
      <path d="M6 26 Q40 40 70 26 T130 26 T194 26" fill="none" stroke="#2b6a3e" strokeWidth="4.4" strokeLinecap="round" /><path d="M6 26 Q40 40 70 26 T130 26 T194 26" fill="none" stroke="#4a9a58" strokeWidth="1.65" strokeDasharray="2 5" strokeLinecap="round" />
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
      <circle cx="100" cy="100" r="62" fill="none" stroke="#12301c" strokeWidth="14.3" opacity=".85" />
      {leaves.map((l, i) => <ellipse key={i} cx={l.x} cy={l.y} rx={l.l} ry="4.4" fill={l.c} stroke="#0f2a18" strokeOpacity=".5" strokeWidth="0.33" transform={`rotate(${l.a} ${l.x} ${l.y})`} />)}
      {cones.map((c) => (
        <g key={c.i} transform={`rotate(${c.a} ${c.x} ${c.y})`}><ellipse cx={c.x} cy={c.y} rx="7" ry="11" fill="#7a4a22" stroke="#3e220c" strokeWidth="0.66" />
          <g stroke="#3e220c" strokeWidth="0.55" fill="none"><path d={`M${c.x - 6} ${c.y - 5} q6 4 12 0 M${c.x - 6.5} ${c.y} q6.5 4 13 0 M${c.x - 6} ${c.y + 5} q6 4 12 0`} /></g><ellipse cx={c.x - 2} cy={c.y - 4} rx="2" ry="3.4" fill="#c28a52" opacity=".55" /></g>
      ))}
      {berries.map((b, i) => <g key={i}>{[[0, 0], [8, 3], [3, 8]].map(([dx, dy], j) => <g key={j}><circle cx={b.x + dx} cy={b.y + dy} r="5.2" fill="#c9302c" stroke="#7a1412" strokeWidth="0.5" /><circle cx={b.x + dx - 1.6} cy={b.y + dy - 1.8} r="1.5" fill="#ffd8cc" /></g>)}</g>)}
      {lights.map((l) => <g key={l.i}><circle className="ic-light" cx={l.x} cy={l.y} r="9" fill="url(#wr-glow)" style={{ animationDelay: `-${(l.i * 0.31).toFixed(2)}s` }} /><circle cx={l.x} cy={l.y} r="2.4" fill="#fff5c2" /></g>)}
      <g className="ic-sway" style={{ transformOrigin: '100px 176px' }}>
        <path d="M100 172 Q70 140 52 168 Q64 196 100 172Z" fill="url(#wr-bow)" stroke="#6a1014" strokeWidth="0.66" /><path d="M100 172 Q130 140 148 168 Q136 196 100 172Z" fill="url(#wr-bow)" stroke="#6a1014" strokeWidth="0.66" />
        <path d="M72 168 Q86 164 98 172 M128 168 Q114 164 102 172" stroke="#ff8d8d" strokeOpacity=".5" strokeWidth="0.88" fill="none" />
        <path d="M92 178 Q82 204 66 214 Q82 212 98 188Z M108 178 Q118 204 134 214 Q118 212 102 188Z" fill="#9c1a20" stroke="#6a1014" strokeWidth="0.55" />
        <rect x="93" y="166" width="14" height="14" rx="5" fill="#c92a2e" stroke="#6a1014" strokeWidth="0.66" />
        <g className="ic-ring" style={{ transformOrigin: '84px 196px' }}><circle cx="84" cy="198" r="9" fill="url(#wr-bell)" stroke="#6e4c0c" strokeWidth="0.66" /><path d="M76 200 h16" stroke="#6e4c0c" strokeWidth="0.77" /><circle cx="84" cy="205" r="1.8" fill="#4a3208" /></g>
        <g className="ic-ring" style={{ transformOrigin: '116px 196px', animationDelay: '-.5s' }}><circle cx="116" cy="198" r="9" fill="url(#wr-bell)" stroke="#6e4c0c" strokeWidth="0.66" /><path d="M108 200 h16" stroke="#6e4c0c" strokeWidth="0.77" /><circle cx="116" cy="205" r="1.8" fill="#4a3208" /></g>
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
        <radialGradient id="lm-glow" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffd98a" stopOpacity=".85" /><stop offset=".55" stopColor="#ffb54a" stopOpacity=".26" /><stop offset="1" stopColor="#ff9a2a" stopOpacity="0" /></radialGradient>
        <linearGradient id="lm-iron" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1c1410" /><stop offset=".4" stopColor="#4a3c30" /><stop offset=".6" stopColor="#6a5844" /><stop offset="1" stopColor="#1c1410" /></linearGradient>
        <linearGradient id="lm-glass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e8c677" stopOpacity=".32" /><stop offset=".6" stopColor="#ffcf72" stopOpacity=".55" /><stop offset="1" stopColor="#ffb04a" stopOpacity=".4" /></linearGradient>
        <linearGradient id="lm-wax" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#d6c394" /><stop offset=".5" stopColor="#f6ecc8" /><stop offset="1" stopColor="#cdb986" /></linearGradient>
        <linearGradient id="lm-fl" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#e8761a" /><stop offset="1" stopColor="#ffd25a" /></linearGradient>
      </defs>
      <circle className="ic-halo" cx="100" cy="124" r="98" fill="url(#lm-glow)" />
      <g className="ic-swing" style={{ transformOrigin: '100px 4px' }}>
        <path d="M100 2 V30" stroke={INK} strokeWidth="3.3" /><path d="M100 2 V30" stroke="#5a4a38" strokeWidth="1.43" />
        <circle cx="100" cy="14" r="10" fill="none" stroke={INK} strokeWidth="3.3" /><circle cx="100" cy="14" r="10" fill="none" stroke="#6a5844" strokeWidth="1.32" />
        <path d="M74 66 Q100 24 126 66 Z" fill="url(#lm-iron)" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" /><path d="M84 60 Q100 38 116 60" fill="none" stroke="#8a7458" strokeOpacity=".6" strokeWidth="1.1" />
        <circle cx="100" cy="38" r="5" fill="#5a4a38" stroke={INK} strokeWidth="1.1" />
        <path d="M70 66 H130 L136 74 H64 Z" fill="url(#lm-iron)" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
        <path d="M68 74 H132 L142 176 H58 Z" fill="url(#lm-glass)" stroke={INK} strokeWidth="1.76" strokeLinejoin="round" />
        <path d="M68 74 L58 176 M132 74 L142 176 M100 74 V176 M63 126 H137" stroke="url(#lm-iron)" strokeWidth="2.75" fill="none" />
        <path d="M63 126 H137 M100 74 V176" stroke={INK} strokeWidth="0.66" fill="none" strokeOpacity=".6" />
        <path d="M76 86 L70 160" stroke="#fff" strokeOpacity=".4" strokeWidth="2.75" strokeLinecap="round" />
        <rect x="88" y="132" width="24" height="44" rx="2" fill="url(#lm-wax)" stroke={INK} strokeWidth="0.88" /><path d="M90 132 q2 10 4 3 q3 12 6 1 q3 11 7 0 q2 8 4 -2 v-5 h-21z" fill="#fbf3d6" />
        <path d="M100 132 v-9" stroke={INK} strokeWidth="1.1" />
        <g className="ic-flame lamp" style={{ transformOrigin: '100px 124px' }}><path d="M100 86 C115 102 119 116 112 126 C108 132 92 132 88 126 C81 116 85 102 100 86Z" fill="url(#lm-fl)" stroke="#a8480c" strokeWidth="0.66" /><path d="M100 104 C107 112 108 120 105 126 C103 129 97 129 95 126 C92 120 93 112 100 104Z" fill="#fff2b8" /></g>
        <path d="M52 176 H148 L152 190 H48 Z" fill="url(#lm-iron)" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
        <path d="M54 190 H146 V198 Q100 208 54 198 Z" fill="#2a1e14" stroke={INK} strokeWidth="1.32" />
        <path d="M100 198 V210" stroke={INK} strokeWidth="2.2" strokeLinecap="round" /><circle cx="100" cy="212" r="3" fill="#6a5844" stroke={INK} strokeWidth="0.88" />
      </g>
      <g className="ic-tw" fill="#ffe3a0"><circle cx="36" cy="96" r="2.4" /><circle cx="166" cy="110" r="2" style={{ animationDelay: '-.8s' }} /><circle cx="172" cy="66" r="1.6" style={{ animationDelay: '-1.4s' }} /></g>
    </Svg>
  )
}

export function BowIcon() {
  return (
    <Svg label="Chiếc nơ">
      <defs><linearGradient id="bw-g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#b8332f" /><stop offset="1" stopColor="#6a1214" /></linearGradient></defs>
      <ellipse cx="100" cy="206" rx="56" ry="5" fill={INK} opacity=".16" />
      <g className="ic-sway" style={{ transformOrigin: '100px 90px' }}>
        <path d="M92 108 C84 140 74 170 58 196 L82 190 L94 202 C98 170 100 140 100 112 Z" fill="url(#bw-g)" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
        <path d="M108 108 C116 140 126 170 142 196 L118 190 L106 202 C102 170 100 140 100 112 Z" fill="url(#bw-g)" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
        <path d="M100 96 C80 52 36 44 28 72 C24 96 62 112 100 96 Z" fill="url(#bw-g)" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
        <path d="M100 96 C120 52 164 44 172 72 C176 96 138 112 100 96 Z" fill="url(#bw-g)" stroke={INK} strokeWidth="1.65" strokeLinejoin="round" />
        <g stroke={INK} strokeOpacity=".4" strokeWidth="0.77" fill="none"><path d="M96 92 C78 66 52 60 40 72 M96 98 C76 90 52 90 38 80 M104 92 C122 66 148 60 160 72 M104 98 C124 90 148 90 162 80" /></g>
        <path d="M36 70 C48 58 70 60 88 78" stroke="#e58a82" strokeOpacity=".5" strokeWidth="1.65" fill="none" strokeLinecap="round" />
        <rect x="86" y="84" width="28" height="28" rx="9" fill="url(#bw-g)" stroke={INK} strokeWidth="1.65" />
        <path d="M92 90 Q100 86 108 90" stroke="#e58a82" strokeOpacity=".6" strokeWidth="1.1" fill="none" />
      </g>
      <g className="ic-tw" fill="#f7e6b0"><path d="M170 150 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" /><path d="M24 140 l1.6 4.6 4.6 1.6 -4.6 1.6 -1.6 4.6 -1.6 -4.6 -4.6 -1.6 4.6 -1.6z" style={{ animationDelay: '-1s' }} /></g>
    </Svg>
  )
}

export function BellIcon() {
  return (
    <Svg label="Chiếc chuông">
      <defs>
        <linearGradient id="bl-g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6e4c10" /><stop offset=".3" stopColor="#d8a842" /><stop offset=".5" stopColor="#f6dc92" /><stop offset=".8" stopColor="#b8862c" /><stop offset="1" stopColor="#5e3f0c" /></linearGradient>
      </defs>
      <ellipse cx="100" cy="212" rx="50" ry="5" fill={INK} opacity=".16" />
      <path d="M100 8 C86 8 80 22 86 32 M100 8 C114 8 120 22 114 32" fill="none" stroke={INK} strokeWidth="2.2" />
      <g className="ic-swing" style={{ transformOrigin: '100px 30px' }}>
        <path d="M100 30 V50" stroke={INK} strokeWidth="2.75" />
        <path d="M100 48 C72 48 62 90 58 130 C56 150 44 160 40 176 L160 176 C156 160 144 150 142 130 C138 90 128 48 100 48 Z" fill="url(#bl-g)" stroke={INK} strokeWidth="1.87" strokeLinejoin="round" />
        <path d="M44 168 H156" stroke={INK} strokeOpacity=".5" strokeWidth="1.1" /><path d="M60 140 Q100 148 140 140" fill="none" stroke={INK} strokeOpacity=".35" strokeWidth="0.88" />
        <path d="M76 62 C70 90 68 120 66 146" stroke="#fff" strokeOpacity=".45" strokeWidth="2.75" strokeLinecap="round" fill="none" />
        <path d="M100 74 l5 6 -5 6 -5 -6z M100 100 l5 6 -5 6 -5 -6z" fill={INK} fillOpacity=".35" />
        <path d="M38 176 Q100 188 162 176" fill="none" stroke={INK} strokeWidth="1.87" />
        <g className="ic-ring" style={{ transformOrigin: '100px 176px' }}><circle cx="100" cy="190" r="11" fill="url(#bl-g)" stroke={INK} strokeWidth="1.65" /><path d="M94 186 q4 -4 8 0" stroke="#fff" strokeOpacity=".5" strokeWidth="1.1" fill="none" /></g>
      </g>
      <g className="ic-tw" fill="#fff0b8"><path d="M164 80 l2.4 7 7 2.4 -7 2.4 -2.4 7 -2.4 -7 -7 -2.4 7 -2.4z" /><path d="M30 100 l1.6 4.6 4.6 1.6 -4.6 1.6 -1.6 4.6 -1.6 -4.6 -4.6 -1.6 4.6 -1.6z" style={{ animationDelay: '-1.2s' }} /></g>
    </Svg>
  )
}

const GLYPH: Record<string, string> = { window: '❄', curtainL: '❦', curtainR: '❦', painting: '❖', painting2: '❖', shelf: '❧', basket: '❦', tools: '✠', garland: '❀', chair: '❧', rug: '✥', tree: '✦' }
export function OrnamentIcon({ kind }: { kind: string }) {
  const g = GLYPH[kind] ?? '❦'
  return (
    <Svg label="Hoa văn">
      <g fill="none" stroke={INK} strokeWidth="1.32" strokeLinecap="round">
        <circle cx="100" cy="110" r="78" strokeWidth="1.76" /><circle cx="100" cy="110" r="68" strokeWidth="0.66" strokeDasharray="3 5" />
        <path d="M100 22 L106 40 L100 34 L94 40 Z M100 198 L106 180 L100 186 L94 180 Z M12 110 L30 104 L24 110 L30 116 Z M188 110 L170 104 L176 110 L170 116 Z" fill={INK} opacity=".6" />
        <path d="M44 56 q16 -10 30 0 M126 56 q16 -10 30 0 M44 164 q16 10 30 0 M126 164 q16 10 30 0" opacity=".55" />
      </g>
      <text x="100" y="138" textAnchor="middle" fontSize="92" fill={INK} fillOpacity=".78" fontFamily="'Cormorant Garamond', serif">{g}</text>
    </Svg>
  )
}
