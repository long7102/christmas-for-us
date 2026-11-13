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

/** Chồng sách cũ kiểu khắc vintage: ba cuốn bìa da gáy mạ vàng, mép giấy kẻ nét, dải ruy băng đánh dấu và chiếc thẻ buộc dây có chữ L♥H. */
export function BooksIcon() {
  const spineBands = (x: number, y: number, w: number, h: number, c = '#d9b25c') => (
    <g stroke={c} strokeWidth="1.1" fill="none" opacity=".9">
      {[0.16, 0.2, 0.8, 0.84].map((t, i) => <path key={i} d={`M${x + w * t} ${y + 1} V${y + h - 1}`} />)}
      <path d={`M${x + w * 0.38} ${y + h / 2 - 3} h${w * 0.24} M${x + w * 0.38} ${y + h / 2 + 3} h${w * 0.24}`} />
    </g>
  )
  const edge = (x: number, y: number, w: number, h: number) => (
    <g>
      <rect x={x} y={y} width={w} height={h} fill="#efe1bb" stroke="#6b4a22" strokeWidth="0.9" />
      <g stroke="#9a7a45" strokeWidth="0.45" opacity=".8">{Array.from({ length: Math.floor(h / 1.7) }, (_, i) => <path key={i} d={`M${x + 1} ${y + 1.2 + i * 1.7} H${x + w - 1}`} />)}</g>
    </g>
  )
  return (
    <Svg label="Chồng sách cũ">
      <defs>
        <linearGradient id="bk-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3f6a4a" /><stop offset="1" stopColor="#1c3a28" /></linearGradient>
        <linearGradient id="bk-r" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9a2f33" /><stop offset="1" stopColor="#5a1519" /></linearGradient>
        <linearGradient id="bk-b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8b6236" /><stop offset="1" stopColor="#4c3015" /></linearGradient>
        <radialGradient id="bk-glow"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".7" /><stop offset="1" stopColor="#ffc060" stopOpacity="0" /></radialGradient>
      </defs>
      <g transform="translate(-14 -22) scale(1.14)">
      <ellipse cx="100" cy="196" rx="74" ry="7" fill={INK} opacity=".22" />
      <circle className="ic-light" cx="100" cy="110" r="74" fill="url(#bk-glow)" />
      {/* cuốn dưới: nâu */}
      <g>
        <path d="M30 150 H166 V186 H30 Z" fill="url(#bk-b)" stroke="#2c1a08" strokeWidth="1.2" />
        {edge(166, 152, 8, 32)}
        <path d="M30 186 H176 V190 H34 Z" fill="#2c1a08" opacity=".5" />
        {spineBands(30, 150, 136, 36)}
        <path d="M34 154 H162" stroke="#d9b25c" strokeWidth=".7" opacity=".7" />
      </g>
      {/* cuốn giữa: đỏ rượu, lệch nhẹ */}
      <g transform="rotate(-2.2 100 134)">
        <path d="M38 112 H158 V148 H38 Z" fill="url(#bk-r)" stroke="#2b0a0c" strokeWidth="1.2" />
        {edge(158, 114, 8, 32)}
        {spineBands(38, 112, 120, 36, '#e2c071')}
        <circle cx="98" cy="130" r="5.5" fill="none" stroke="#e2c071" strokeWidth=".9" /><path d="M98 125.5 v9 M93.5 130 h9" stroke="#e2c071" strokeWidth=".7" />
      </g>
      {/* cuốn trên: xanh rêu, xoay ngược */}
      <g transform="rotate(1.6 98 96)">
        <path d="M46 76 H150 V110 H46 Z" fill="url(#bk-g)" stroke="#0e2316" strokeWidth="1.2" />
        {edge(150, 78, 7, 30)}
        {spineBands(46, 76, 104, 34, '#d9b25c')}
        <path d="M62 93 q36 -10 72 0" fill="none" stroke="#d9b25c" strokeWidth=".7" opacity=".6" />
      </g>
      {/* dải ruy băng đánh dấu */}
      <g className="ic-sway" style={{ transformOrigin: '140px 150px' }}>
        <path d="M140 148 q4 22 -2 40 l5 -4 l5 6 q2 -20 -2 -42Z" fill="#a8242a" stroke="#5a1014" strokeWidth=".8" />
      </g>
      {/* thẻ buộc dây */}
      <g className="ic-swing" style={{ transformOrigin: '60px 78px' }}>
        <path d="M60 78 q-14 18 -10 38" fill="none" stroke="#7a5a2a" strokeWidth="1.2" strokeDasharray="2 1.2" />
        <path d="M40 116 l10 -6 l12 8 l-4 16 l-14 -2 z" fill="#efe0b6" stroke="#6b4a22" strokeWidth=".9" />
        <circle cx="50" cy="114" r="1.6" fill="#8a2a22" />
        <text x="49" y="126" textAnchor="middle" fontSize="6.6" fill="#8a2a22" fontFamily="serif" fontWeight="700">L♥H</text>
      </g>
      </g>
    </Svg>
  )
}

/** Cành thông vintage: một nhánh cong phủ dày lá kim xoè quạt, hai quả thông khô treo bên dưới, chùm quả mọng đỏ có điểm sáng và nơ ruy băng. */
export function PineIcon() {
  const r = rng(31)
  // thân cành: đường cong từ góc dưới trái lên phía trên phải; mỗi mắt có một quạt lá kim
  const stem = (t: number) => ({ x: 24 + 148 * t, y: 178 - 112 * t - 26 * Math.sin(Math.PI * t) })
  const nodes = Array.from({ length: 15 }, (_, i) => i / 14)
  const col = ['#12331f', '#1c4d2e', '#2a6a3e', '#3a8250', '#4f9a62']
  const fans = nodes.flatMap((t, k) => {
    const c = stem(t), size = 34 - t * 12
    return [-1, 1].flatMap((side) => Array.from({ length: 5 }, (_, j) => {
      const a = -38 - t * 18 + side * (24 + j * 15) + (r() - 0.5) * 8, l = size * (0.72 + r() * 0.4) * (j === 2 ? 1.05 : 1)
      const rad = (a * Math.PI) / 180
      return { x: c.x, y: c.y, x2: c.x + Math.cos(rad) * l, y2: c.y + Math.sin(rad) * l, c: col[(k + j + (side > 0 ? 2 : 0)) % 5] }
    }))
  })
  const cone = (cx: number, cy: number, a: number, s = 1) => (
    <g transform={`translate(${cx} ${cy}) rotate(${a}) scale(${s})`}>
      <path d="M0 -3 C13 -3 20 14 14 32 C10 44 -10 44 -14 32 C-20 14 -13 -3 0 -3Z" fill="#7d4c22" stroke="#3a1f0a" strokeWidth="1.3" />
      {[4, 11, 18, 25, 32, 39].map((y, i) => <path key={i} d={`M${-13 + i * 1.3} ${y} q${13 - i * 1.3} 7 ${26 - i * 2.6} 0`} stroke="#3a1f0a" strokeWidth="1" fill="none" />)}
      {[4, 11, 18, 25, 32].map((y, i) => <path key={'h' + i} d={`M${-9 + i} ${y + 1} q7 3 12 -1`} stroke="#dba76a" strokeWidth=".9" fill="none" opacity=".65" />)}
      <path d="M-3 -3 q3 -9 6 0" stroke="#3a1f0a" strokeWidth="1.5" fill="none" />
    </g>
  )
  const berries: [number, number][] = [[0, 0], [12, 2], [6, 12], [-8, 9], [19, 13], [-2, 21]]
  return (
    <Svg label="Cành thông và quả đỏ">
      <defs>
        <radialGradient id="pn-glow"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".5" /><stop offset="1" stopColor="#ffc060" stopOpacity="0" /></radialGradient>
        <radialGradient id="pn-b" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#f26a62" /><stop offset=".6" stopColor="#b3201f" /><stop offset="1" stopColor="#6e0f10" /></radialGradient>
        <linearGradient id="pn-rib" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#c3333a" /><stop offset="1" stopColor="#7a1418" /></linearGradient>
      </defs>
      <ellipse cx="100" cy="204" rx="72" ry="6" fill={INK} opacity=".2" />
      <circle className="ic-light" cx="104" cy="112" r="84" fill="url(#pn-glow)" />
      <g className="ic-sway" style={{ transformOrigin: '30px 176px' }}>
        <path d={`M${stem(0).x} ${stem(0).y} ${nodes.slice(1).map((t) => `L${stem(t).x} ${stem(t).y}`).join(' ')}`} stroke="#3a2412" strokeWidth="3.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {fans.map((f, i) => <path key={i} d={`M${f.x} ${f.y} L${f.x2} ${f.y2}`} stroke={f.c} strokeWidth="1.9" strokeLinecap="round" />)}
        {cone(76, 124, -14, 1.05)}
        {cone(126, 98, 12, 0.88)}
        <g transform="translate(112 62)">
          <path d="M-4 6 q-22 -14 -40 -2 q16 18 40 2Z" fill="#2b6a3d" stroke="#12301c" strokeWidth=".8" /><path d="M-6 5 q-18 -6 -34 -2" stroke="#12301c" strokeWidth=".6" fill="none" />
          {berries.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="8" fill="url(#pn-b)" stroke="#5a0d0f" strokeWidth=".9" /><circle cx={x - 2.6} cy={y - 2.8} r="2.2" fill="#ffe6da" opacity=".9" /><path d={`M${x} ${y - 8} l1.5 -3.5`} stroke="#3a2412" strokeWidth="1" /></g>)}
        </g>
        <g transform="translate(40 168) rotate(-12)">
          <path d="M0 0 q-20 -18 -34 -4 q8 20 34 4Z" fill="url(#pn-rib)" stroke="#5a1014" strokeWidth="1" />
          <path d="M0 0 q20 -18 34 -4 q-8 20 -34 4Z" fill="url(#pn-rib)" stroke="#5a1014" strokeWidth="1" />
          <circle cx="0" cy="0" r="4.6" fill="#a8242a" stroke="#5a1014" strokeWidth=".9" />
          <path d="M-3 4 q-6 14 -16 22 M3 4 q6 14 14 22" stroke="#a8242a" strokeWidth="3.6" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </Svg>
  )
}

/** Giỏ củi vintage: giỏ liễu gai đan chéo, quai cong, những khúc củi bổ đôi lộ vân gỗ và vỏ cây, vài mảnh vụn và một chiếc lá thông. */
export function BasketIcon() {
  const r = rng(47)
  const logs = [
    { x: 54, y: 92, rx: 22, ry: 18, a: -6, c: '#8a5a2c' }, { x: 100, y: 84, rx: 23, ry: 19, a: 3, c: '#7a4b22' }, { x: 146, y: 92, rx: 22, ry: 18, a: 8, c: '#946134' },
    { x: 76, y: 106, rx: 21, ry: 17, a: 5, c: '#6f441f' }, { x: 124, y: 106, rx: 22, ry: 17, a: -5, c: '#85552a' },
  ]
  return (
    <Svg label="Giỏ củi">
      <defs>
        <linearGradient id="bs-w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c8955a" /><stop offset="1" stopColor="#7c5026" /></linearGradient>
        <radialGradient id="bs-glow"><stop offset="0" stopColor="#ffd890" stopOpacity=".5" /><stop offset="1" stopColor="#ffb050" stopOpacity="0" /></radialGradient>
        <clipPath id="bs-clip"><path d="M26 112 H174 L160 188 Q158 198 148 198 H52 Q42 198 40 188 Z" /></clipPath>
      </defs>
      <ellipse cx="100" cy="204" rx="72" ry="6" fill={INK} opacity=".25" />
      <circle className="ic-light" cx="100" cy="110" r="84" fill="url(#bs-glow)" />
      {/* quai giỏ */}
      <path d="M32 116 C32 44 168 44 168 116" fill="none" stroke="#5e3a18" strokeWidth="9" strokeLinecap="round" />
      <path d="M32 116 C32 44 168 44 168 116" fill="none" stroke="#b98448" strokeWidth="5" strokeLinecap="round" strokeDasharray="6 4" />
      {/* củi chất đầy miệng giỏ */}
      {logs.map((l, i) => (
        <g key={i} transform={`rotate(${l.a} ${l.x} ${l.y})`}>
          <ellipse cx={l.x} cy={l.y} rx={l.rx} ry={l.ry} fill="#4a2a10" stroke="#2a1608" strokeWidth="2.4" />
          <ellipse cx={l.x} cy={l.y} rx={l.rx - 3} ry={l.ry - 3} fill={l.c} />
          {[0.75, 0.55, 0.35, 0.18].map((t, k) => <ellipse key={k} cx={l.x + (k % 2 ? 0.8 : -0.8)} cy={l.y} rx={(l.rx - 3) * t} ry={(l.ry - 3) * t} fill="none" stroke="#3e2210" strokeOpacity=".5" strokeWidth=".8" />)}
          <path d={`M${l.x - 2} ${l.y - l.ry + 4} L${l.x + 3} ${l.y + l.ry - 4}`} stroke="#3e2210" strokeOpacity=".55" strokeWidth=".9" />
          <ellipse cx={l.x - l.rx * 0.35} cy={l.y - l.ry * 0.35} rx={l.rx * 0.25} ry={l.ry * 0.2} fill="#e0b27a" opacity=".45" />
        </g>
      ))}
      {/* thân giỏ đan chéo */}
      <path d="M26 112 H174 L160 188 Q158 198 148 198 H52 Q42 198 40 188 Z" fill="url(#bs-w)" stroke="#3e2410" strokeWidth="1.6" />
      <g clipPath="url(#bs-clip)">
        {Array.from({ length: 16 }, (_, i) => <path key={'a' + i} d={`M${14 + i * 12} 108 L${-6 + i * 12 + 52} 202`} stroke="#4a2c12" strokeWidth="2.6" opacity=".55" />)}
        {Array.from({ length: 16 }, (_, i) => <path key={'b' + i} d={`M${14 + i * 12 + 60} 108 L${14 + i * 12 - 4} 202`} stroke="#e3b878" strokeWidth="2.2" opacity=".4" />)}
        <path d="M20 134 H180 M20 160 H180" stroke="#3e2410" strokeWidth="2" opacity=".5" />
      </g>
      <path d="M26 112 H174" stroke="#3e2410" strokeWidth="5" strokeLinecap="round" /><path d="M26 112 H174" stroke="#d9a868" strokeWidth="2.2" strokeLinecap="round" strokeDasharray="7 3" />
      {/* mảnh vụn và lá thông */}
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${60 + r() * 90} ${203 + r() * 6} l${6 + r() * 6} ${r() * 3 - 1.5}`} stroke="#6a4220" strokeWidth="2.2" strokeLinecap="round" />)}
      <g transform="translate(150 196) rotate(-24)"><path d="M0 0 q16 -4 26 -14" stroke="#2f7545" strokeWidth="2.2" fill="none" strokeLinecap="round" />{[4, 11, 18].map((x) => <path key={x} d={`M${x} ${-x * 0.45} l5 -7 M${x} ${-x * 0.45} l-1 7`} stroke="#2f7545" strokeWidth="1.6" strokeLinecap="round" />)}</g>
    </Svg>
  )
}

/** Bức tranh treo tường vintage: khung mạ vàng chạm hoa văn, tranh phong cảnh (hoặc làng quê dưới tuyết), tấm biển đồng nhỏ bên dưới, dây treo. */
export function PaintingIcon({ snow = false }: { snow?: boolean }) {
  const r = rng(snow ? 5 : 19)
  const trees = Array.from({ length: 7 }, (_, i) => ({ x: 34 + i * 22 + r() * 6, h: 14 + r() * 12 }))
  return (
    <Svg label="Bức tranh treo tường">
      <defs>
        <linearGradient id={`pt-g${+snow}`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f4d27a" /><stop offset=".45" stopColor="#b98a30" /><stop offset="1" stopColor="#6a4812" /></linearGradient>
        <linearGradient id={`pt-s${+snow}`} x1="0" y1="0" x2="0" y2="1">{snow ? <><stop offset="0" stopColor="#25325a" /><stop offset=".6" stopColor="#6f7aa8" /><stop offset="1" stopColor="#e7d9c0" /></> : <><stop offset="0" stopColor="#7fa6c8" /><stop offset=".55" stopColor="#f2c88a" /><stop offset="1" stopColor="#f6dba4" /></>}</linearGradient>
        <clipPath id={`pt-c${+snow}`}><rect x="40" y="46" width="120" height="112" rx="2" /></clipPath>
      </defs>
      <ellipse cx="100" cy="206" rx="66" ry="5" fill={INK} opacity=".2" />
      {/* dây treo */}
      <path d="M100 8 L58 44 M100 8 L142 44" stroke="#5a3a18" strokeWidth="1.6" fill="none" /><circle cx="100" cy="8" r="3.4" fill="#caa14e" stroke="#5a3a18" strokeWidth=".8" />
      {/* khung vàng chạm nổi */}
      <rect x="22" y="30" width="156" height="148" rx="5" fill={`url(#pt-g${+snow})`} stroke="#4a3008" strokeWidth="1.6" />
      <rect x="30" y="38" width="140" height="132" rx="3" fill="none" stroke="#fbe9a8" strokeOpacity=".6" strokeWidth="1.2" />
      <rect x="36" y="42" width="128" height="120" rx="2" fill="#3a2410" />
      {[[22, 30], [178, 30], [22, 178], [178, 178]].map(([x, y], i) => <g key={i} transform={`translate(${x} ${y}) rotate(${i * 90})`}><path d="M0 0 q14 2 18 -12 q-4 14 -18 12 q8 8 -2 16 q0 -10 2 -16Z" fill="#f7dc8a" stroke="#6a4812" strokeWidth=".9" /></g>)}
      {Array.from({ length: 10 }, (_, i) => <circle key={'t' + i} cx={44 + i * 12.4} cy="34" r="1.5" fill="#fbe9a8" opacity=".85" />)}
      {Array.from({ length: 10 }, (_, i) => <circle key={'b' + i} cx={44 + i * 12.4} cy="174" r="1.5" fill="#fbe9a8" opacity=".85" />)}
      {/* tranh */}
      <g clipPath={`url(#pt-c${+snow})`}>
        <rect x="40" y="46" width="120" height="112" fill={`url(#pt-s${+snow})`} />
        {snow
          ? Array.from({ length: 18 }, (_, i) => <circle key={i} cx={44 + r() * 112} cy={50 + r() * 70} r={0.8 + r() * 1.1} fill="#fff" opacity=".85" />)
          : <><circle cx="128" cy="76" r="11" fill="#fff0b8" opacity=".9" /><circle cx="128" cy="76" r="18" fill="#fff0b8" opacity=".25" /></>}
        <path d={snow ? 'M40 112 Q70 94 100 108 T160 100 V158 H40Z' : 'M40 108 Q66 88 94 104 T160 96 V158 H40Z'} fill={snow ? '#c7cde0' : '#6f8a62'} />
        <path d={snow ? 'M40 126 Q80 112 120 124 T160 120 V158 H40Z' : 'M40 126 Q80 110 120 124 T160 118 V158 H40Z'} fill={snow ? '#e9e4d8' : '#4f6b46'} />
        {/* mái nhà và gác chuông */}
        <g transform="translate(78 92)"><rect x="0" y="12" width="34" height="22" fill={snow ? '#8a5a3a' : '#a8683f'} /><path d="M-4 14 L17 -2 L38 14Z" fill={snow ? '#f2f2f4' : '#7a3a2a'} /><rect x="13" y="20" width="8" height="14" fill="#2a1608" /><rect x="3" y="18" width="6" height="6" fill="#ffd36e" /><rect x="25" y="18" width="6" height="6" fill="#ffd36e" />
          <rect x="24" y="-12" width="9" height="26" fill={snow ? '#8a5a3a' : '#a8683f'} /><path d="M22 -12 L28.5 -24 L35 -12Z" fill={snow ? '#f2f2f4' : '#7a3a2a'} /></g>
        {trees.map((t, i) => <path key={i} d={`M${t.x} 142 l-6 0 l6 -${t.h} l6 ${t.h}Z`} fill={snow ? '#2c5a46' : '#2c5a3a'} stroke={snow ? '#f4f4f8' : 'none'} strokeWidth=".8" />)}
        <path d="M40 148 Q80 140 120 148 T160 146 V158 H40Z" fill={snow ? '#aebbd8' : '#7fb0cc'} opacity=".8" />
        <path d="M60 152 h20 M96 150 h28" stroke="#fff" strokeOpacity=".55" strokeWidth="1" />
      </g>
      <rect x="40" y="46" width="120" height="112" rx="2" fill="none" stroke="#2a1608" strokeOpacity=".7" strokeWidth="1.4" />
      <path d="M40 46 H160 L150 56 H50Z" fill="#000" opacity=".18" />
      {/* tấm biển đồng */}
      <rect x="72" y="182" width="56" height="14" rx="2" fill="#d9b25c" stroke="#5a3a0c" strokeWidth="1" /><path d="M78 187 h44 M82 192 h36" stroke="#5a3a0c" strokeWidth="1" opacity=".7" />
    </Svg>
  )
}

/** Tủ sách gỗ cũ: ba tầng, gáy sách nhiều màu, một cây nến nhỏ và chậu cây trên đỉnh. */
export function ShelfIcon() {
  const r = rng(61), cols = ['#8a2a2c', '#2f5a3c', '#8b6236', '#3a4a6a', '#a8742e', '#5a2a4a', '#6f8a62']
  const row = (y: number) => { let x = 44; const out = []; while (x < 150) { const w = 7 + r() * 8, h = 28 + r() * 14; out.push(<g key={x}><rect x={x} y={y - h} width={w} height={h} fill={cols[Math.floor(r() * 7)]} stroke="#1e1006" strokeWidth=".8" /><path d={`M${x + 1.5} ${y - h + 6} h${w - 3} M${x + 1.5} ${y - 6} h${w - 3}`} stroke="#e2c071" strokeWidth=".7" opacity=".8" /></g>); x += w + 1 } return out }
  return (
    <Svg label="Tủ sách gỗ">
      <defs><linearGradient id="sh-w" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#6a4020" /><stop offset=".5" stopColor="#8b5a2c" /><stop offset="1" stopColor="#5a3416" /></linearGradient><radialGradient id="sh-g"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".5" /><stop offset="1" stopColor="#ffc060" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="100" cy="208" rx="62" ry="5" fill={INK} opacity=".25" /><circle className="ic-light" cx="100" cy="110" r="84" fill="url(#sh-g)" />
      <rect x="30" y="32" width="140" height="170" rx="3" fill="url(#sh-w)" stroke="#2a1608" strokeWidth="1.6" />
      <rect x="38" y="40" width="124" height="154" fill="#2a1608" />
      {[92, 142, 192].map((y, i) => <g key={y}>{row(y - 2)}<rect x="38" y={y - 2} width="124" height="6" fill="#7a4a24" stroke="#2a1608" strokeWidth=".8" />{i === 0 && null}</g>)}
      <rect x="26" y="24" width="148" height="10" rx="2" fill="#8b5a2c" stroke="#2a1608" strokeWidth="1.2" />
      <g className="ic-sway" style={{ transformOrigin: '60px 24px' }}><rect x="56" y="6" width="9" height="18" rx="1.5" fill="#f3e6c4" stroke="#7a5a2a" strokeWidth=".8" /><path d="M60.5 6 q-3 -6 0 -9 q3 3 0 9Z" fill="#ffc850" /></g>
      <path d="M132 24 q-6 -14 4 -20 q4 12 -4 20Z M138 24 q8 -12 18 -8 q-6 10 -18 8Z" fill="#2f7545" stroke="#12301c" strokeWidth=".7" /><rect x="128" y="20" width="22" height="6" rx="1.5" fill="#a8683f" />
    </Svg>
  )
}

/** Bộ dụng cụ lò sưởi: giá sắt đen, cái cời, xẻng nhỏ, chổi lông và kẹp gắp củi. */
export function ToolsIcon() {
  return (
    <Svg label="Bộ dụng cụ lò sưởi">
      <defs><linearGradient id="tl-i" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#2a2a2e" /><stop offset=".5" stopColor="#6a6a72" /><stop offset="1" stopColor="#222226" /></linearGradient><radialGradient id="tl-g"><stop offset="0" stopColor="#ffb060" stopOpacity=".45" /><stop offset="1" stopColor="#ff8030" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="100" cy="208" rx="58" ry="5" fill={INK} opacity=".3" /><circle className="ic-light" cx="100" cy="150" r="80" fill="url(#tl-g)" />
      <path d="M56 196 h88 M70 196 l-8 10 M130 196 l8 10 M100 196 v-14" stroke="#1c1c20" strokeWidth="4" strokeLinecap="round" />
      <path d="M100 182 V34" stroke="url(#tl-i)" strokeWidth="5" strokeLinecap="round" /><circle cx="100" cy="30" r="7" fill="none" stroke="#2a2a2e" strokeWidth="3.4" />
      {/* cái cời */}
      <path d="M78 196 V44 q0 -12 10 -12 q8 0 8 8" stroke="url(#tl-i)" strokeWidth="4.4" fill="none" strokeLinecap="round" /><path d="M86 38 l10 -10" stroke="#2a2a2e" strokeWidth="3.4" strokeLinecap="round" />
      {/* xẻng */}
      <path d="M122 196 V66" stroke="url(#tl-i)" strokeWidth="4.4" strokeLinecap="round" /><path d="M112 66 h20 l-2 -20 h-16Z" fill="#3a3a40" stroke="#1c1c20" strokeWidth="1.4" /><path d="M115 60 h14" stroke="#8a8a92" strokeWidth="1" />
      {/* chổi lông */}
      <path d="M140 196 V90" stroke="#5a3a18" strokeWidth="6" strokeLinecap="round" /><path d="M132 92 q8 -26 16 0 q-8 6 -16 0Z" fill="#c8a468" stroke="#6a4a22" strokeWidth="1.2" />{[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${134 + i * 3} 90 v-14`} stroke="#8a6a3a" strokeWidth=".9" />)}
      <path d="M60 196 V80 l-8 -6 M60 80 l8 -6" stroke="url(#tl-i)" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  )
}

/** Vòng lá thông trên bệ lò sưởi: dải cành xanh võng xuống, quả thông, quả đỏ, đèn nhỏ nhấp nháy và nơ nhung. */
export function GarlandIcon() {
  const r = rng(73), pts = Array.from({ length: 22 }, (_, i) => { const t = i / 21; return { x: 14 + 172 * t, y: 70 + 52 * Math.sin(Math.PI * t) } })
  return (
    <Svg label="Vòng lá trên bệ lò sưởi">
      <defs><radialGradient id="ga-g"><stop offset="0" stopColor="#fff2b0" /><stop offset="1" stopColor="#ffc850" stopOpacity="0" /></radialGradient><radialGradient id="ga-b" cx=".35" cy=".3" r=".8"><stop offset="0" stopColor="#f26a62" /><stop offset=".6" stopColor="#b3201f" /><stop offset="1" stopColor="#6e0f10" /></radialGradient></defs>
      <path d="M8 40 H192" stroke="#5a3a18" strokeWidth="9" strokeLinecap="round" /><path d="M8 38 H192" stroke="#8b5a2c" strokeWidth="3" strokeLinecap="round" />
      <path d={`M${pts.map((p) => `${p.x} ${p.y - 24}`).join(' L')}`} stroke="#12301c" strokeWidth="6" fill="none" />
      {pts.flatMap((p, i) => [0, 1, 2, 3].map((j) => <path key={`${i}${j}`} d={`M${p.x} ${p.y - 24} l${(r() - 0.5) * 26} ${(r() * 20) + 2}`} stroke={['#1f5231', '#2f7040', '#43914f', '#2a6a3e'][j]} strokeWidth="2.3" strokeLinecap="round" />))}
      {[3, 9, 15, 19].map((i) => <g key={i} transform={`translate(${pts[i].x} ${pts[i].y - 4})`}><ellipse rx="7" ry="10" fill="#7d4c22" stroke="#3a1f0a" strokeWidth="1" />{[-5, 0, 5].map((y) => <path key={y} d={`M-6 ${y} q6 4 12 0`} stroke="#3a1f0a" strokeWidth=".8" fill="none" />)}</g>)}
      {[6, 12, 17].map((i) => <g key={i} transform={`translate(${pts[i].x} ${pts[i].y - 6})`}>{[[0, 0], [7, 2], [3, 8]].map(([x, y], j) => <g key={j}><circle cx={x} cy={y} r="4.6" fill="url(#ga-b)" stroke="#5a0d0f" strokeWidth=".6" /><circle cx={x - 1.4} cy={y - 1.6} r="1.3" fill="#ffe6da" /></g>)}</g>)}
      {pts.filter((_, i) => i % 2 === 1).map((p, i) => <g key={i}><circle className="ic-light" cx={p.x} cy={p.y - 20 + (i % 2) * 4} r="8" fill="url(#ga-g)" style={{ animationDelay: `-${(i * 0.37).toFixed(2)}s` }} /><circle cx={p.x} cy={p.y - 20 + (i % 2) * 4} r="2" fill="#fff5c2" /></g>)}
      <g transform="translate(100 118)"><path d="M0 0 q-22 -16 -34 -2 q10 18 34 2Z M0 0 q22 -16 34 -2 q-10 18 -34 2Z" fill="#a8242a" stroke="#5a1014" strokeWidth="1" /><circle r="5" fill="#8a1a20" stroke="#5a1014" strokeWidth=".8" /><path d="M-3 4 q-6 16 -14 26 M3 4 q6 16 14 26" stroke="#a8242a" strokeWidth="4" fill="none" strokeLinecap="round" /></g>
    </Svg>
  )
}

/** Tấm thảm cổ: hoa văn đối xứng đỏ và xanh thẫm, viền kép và tua rua hai đầu. */
export function RugIcon() {
  return (
    <Svg label="Tấm thảm cổ">
      <defs><pattern id="rg-p" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M7 0 L14 7 L7 14 L0 7Z" fill="none" stroke="#e8c880" strokeWidth=".9" /><circle cx="7" cy="7" r="1.6" fill="#e8c880" /></pattern><radialGradient id="rg-g"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".4" /><stop offset="1" stopColor="#ffc060" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="100" cy="190" rx="82" ry="7" fill={INK} opacity=".25" /><circle className="ic-light" cx="100" cy="120" r="84" fill="url(#rg-g)" />
      <path d="M40 54 H160 L186 178 H14Z" fill="#7a1f24" stroke="#2b0a0c" strokeWidth="1.6" />
      <path d="M48 62 H152 L174 170 H26Z" fill="#1f2f4a" stroke="#e8c880" strokeWidth="2" />
      <path d="M56 70 H144 L164 162 H36Z" fill="url(#rg-p)" stroke="#e8c880" strokeWidth="1" />
      <path d="M100 76 l24 40 l-24 40 l-24 -40Z" fill="#7a1f24" stroke="#e8c880" strokeWidth="1.6" /><path d="M100 90 l12 26 l-12 26 l-12 -26Z" fill="#c8a050" stroke="#5a3a0c" strokeWidth="1" /><circle cx="100" cy="116" r="5" fill="#7a1f24" />
      {Array.from({ length: 22 }, (_, i) => <g key={i}><path d={`M${22 + i * 7.5} 178 v14`} stroke="#e8d4a2" strokeWidth="1.7" strokeLinecap="round" /><path d={`M${44 + i * 5.2} 54 v-10`} stroke="#e8d4a2" strokeWidth="1.7" strokeLinecap="round" /></g>)}
    </Svg>
  )
}

/** Cây thông nhỏ: ba tầng lá, chuỗi đèn, quả châu đỏ vàng, nơ nhung và ngôi sao trên đỉnh, đặt trong chậu gỗ. */
export function TreeIcon() {
  const tiers = [{ y: 60, w: 36 }, { y: 100, w: 56 }, { y: 142, w: 76 }]
  return (
    <Svg label="Cây thông">
      <defs><radialGradient id="tr-g"><stop offset="0" stopColor="#fff2b0" /><stop offset="1" stopColor="#ffc850" stopOpacity="0" /></radialGradient><linearGradient id="tr-l" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#12301c" /><stop offset=".55" stopColor="#2f7545" /><stop offset="1" stopColor="#173a24" /></linearGradient></defs>
      <ellipse cx="100" cy="208" rx="50" ry="5" fill={INK} opacity=".25" />
      <rect x="92" y="170" width="16" height="22" fill="#5a3a18" stroke="#2a1608" strokeWidth="1" /><path d="M76 190 h48 l-6 16 h-36Z" fill="#8b5a2c" stroke="#2a1608" strokeWidth="1.2" />
      {tiers.map((t, i) => <path key={i} d={`M100 ${t.y - 40} L${100 - t.w} ${t.y + 30} Q100 ${t.y + 18} ${100 + t.w} ${t.y + 30}Z`} fill="url(#tr-l)" stroke="#0e2316" strokeWidth="1.2" />)}
      <path d="M96 38 q-26 22 -34 54 M104 38 q22 26 38 70 M70 110 q30 16 70 -2 M52 156 q48 20 98 -4" stroke="#ffe08a" strokeWidth="1.2" fill="none" strokeDasharray="1.5 5" strokeLinecap="round" />
      {[[84, 66, '#d9373a'], [112, 86, '#f4c14e'], [74, 104, '#f4c14e'], [128, 120, '#d9373a'], [96, 128, '#2f8fd0'], [60, 150, '#d9373a'], [136, 156, '#f4c14e'], [102, 160, '#d9373a']].map(([x, y, c], i) => <g key={i}><circle cx={x as number} cy={y as number} r="5.6" fill={c as string} stroke="#2a1608" strokeWidth=".7" /><circle cx={(x as number) - 1.6} cy={(y as number) - 1.8} r="1.6" fill="#fff" opacity=".8" /></g>)}
      {[[92, 82], [118, 104], [82, 132], [122, 146], [64, 168]].map(([x, y], i) => <circle key={i} className="ic-light" cx={x} cy={y} r="7" fill="url(#tr-g)" style={{ animationDelay: `-${(i * 0.43).toFixed(2)}s` }} />)}
      <g transform="translate(100 112)"><path d="M0 0 q-16 -12 -24 -2 q8 14 24 2Z M0 0 q16 -12 24 -2 q-8 14 -24 2Z" fill="#a8242a" stroke="#5a1014" strokeWidth=".9" /><circle r="3.6" fill="#8a1a20" /></g>
      <path className="ic-light" d="M100 8 l5 13 l14 1 l-11 9 l4 14 l-12 -8 l-12 8 l4 -14 l-11 -9 l14 -1Z" fill="#ffd866" stroke="#8a6212" strokeWidth="1.2" strokeLinejoin="round" />
    </Svg>
  )
}

/** Ô cửa sổ đêm đông: khung gỗ nhiều ô, bầu trời xanh thẫm điểm sao, tuyết phủ bệ cửa, ngọn nến ở góc. */
export function WindowIcon() {
  const r = rng(83)
  return (
    <Svg label="Cửa sổ ngập tuyết">
      <defs><linearGradient id="wn-s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f1a3c" /><stop offset=".7" stopColor="#25407a" /><stop offset="1" stopColor="#4a6aa8" /></linearGradient><radialGradient id="wn-g"><stop offset="0" stopColor="#ffe9a8" stopOpacity=".6" /><stop offset="1" stopColor="#ffc060" stopOpacity="0" /></radialGradient></defs>
      <ellipse cx="100" cy="210" rx="70" ry="5" fill={INK} opacity=".25" />
      <rect x="34" y="20" width="132" height="170" rx="3" fill="#5a3a1c" stroke="#2a1608" strokeWidth="1.8" />
      <rect x="44" y="30" width="112" height="150" fill="url(#wn-s)" stroke="#2a1608" strokeWidth="1.4" />
      {Array.from({ length: 14 }, (_, i) => <circle key={'s' + i} cx={48 + r() * 104} cy={34 + r() * 70} r={0.7 + r() * 1.1} fill="#fff" opacity={0.5 + r() * 0.5} />)}
      {Array.from({ length: 26 }, (_, i) => <circle key={'f' + i} className="ic-light" cx={48 + r() * 104} cy={34 + r() * 140} r={1 + r() * 1.7} fill="#f2f7ff" opacity=".85" style={{ animationDelay: `-${(i * 0.31).toFixed(2)}s` }} />)}
      <path d="M44 150 Q70 138 100 148 T156 144 V180 H44Z" fill="#e6ecf8" opacity=".92" />
      <path d="M100 30 V180 M44 80 H156 M44 130 H156" stroke="#5a3a1c" strokeWidth="4.4" /><path d="M100 30 V180 M44 80 H156 M44 130 H156" stroke="#8b6236" strokeWidth="1.4" />
      <rect x="28" y="186" width="144" height="10" rx="2" fill="#7a4a24" stroke="#2a1608" strokeWidth="1.2" /><path d="M30 186 Q60 176 100 184 T170 182 V188 H30Z" fill="#f4f6fb" />
      <circle className="ic-light" cx="60" cy="172" r="26" fill="url(#wn-g)" /><rect x="55" y="164" width="10" height="16" rx="1.5" fill="#f3e6c4" stroke="#7a5a2a" strokeWidth=".8" /><path d="M60 164 q-3.4 -6 0 -10 q3.4 4 0 10Z" fill="#ffc850" />
    </Svg>
  )
}

/** Tấm rèm nhung đỏ thẫm: nếp vải buông dài, dây buộc vàng có tua rua và thanh treo gỗ. */
export function CurtainIcon({ flip = false }: { flip?: boolean }) {
  return (
    <Svg label="Tấm rèm nhung">
      <defs><linearGradient id="ct-r" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#4a0d12" /><stop offset=".25" stopColor="#9a2230" /><stop offset=".5" stopColor="#5a1018" /><stop offset=".78" stopColor="#a8283a" /><stop offset="1" stopColor="#4a0d12" /></linearGradient></defs>
      <g transform={flip ? 'translate(200 0) scale(-1 1)' : undefined}>
        <ellipse cx="100" cy="212" rx="64" ry="5" fill={INK} opacity=".25" />
        <rect x="22" y="12" width="156" height="8" rx="4" fill="#6a4020" stroke="#2a1608" strokeWidth="1.2" /><circle cx="22" cy="16" r="6" fill="#c8a050" stroke="#5a3a0c" strokeWidth="1" /><circle cx="178" cy="16" r="6" fill="#c8a050" stroke="#5a3a0c" strokeWidth="1" />
        <path d="M34 20 H112 Q118 110 96 146 Q120 180 118 208 H26 Q22 110 34 20Z" fill="url(#ct-r)" stroke="#2b0a0c" strokeWidth="1.6" />
        {[48, 60, 72, 84, 96, 106].map((x, i) => <path key={x} d={`M${x} 22 Q${x - 6 + i} 110 ${x - 4} 206`} stroke="#2b0a0c" strokeOpacity=".45" strokeWidth="1.6" fill="none" />)}
        {[54, 78, 100].map((x) => <path key={x} d={`M${x} 26 Q${x + 6} 100 ${x} 160`} stroke="#d85a6a" strokeOpacity=".22" strokeWidth="3" fill="none" />)}
        <path d="M32 140 Q78 128 118 150" stroke="#e2c071" strokeWidth="5" fill="none" strokeLinecap="round" /><path d="M32 140 Q78 128 118 150" stroke="#8a6a24" strokeWidth="1.4" fill="none" strokeDasharray="3 3" />
        <g className="ic-swing" style={{ transformOrigin: '100px 146px' }}><circle cx="100" cy="148" r="5" fill="#e2c071" stroke="#8a6a24" strokeWidth="1" /><path d="M96 152 l-3 22 h14 l-3 -22Z" fill="#d9b25c" stroke="#8a6a24" strokeWidth="1" />{[-4, -1.5, 1, 3.5].map((x) => <path key={x} d={`M${100 + x} 174 v14`} stroke="#d9b25c" strokeWidth="1.8" strokeLinecap="round" />)}</g>
      </g>
    </Svg>
  )
}
