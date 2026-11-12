/** Hình minh hoạ hoạt ảnh nhỏ cho từng vật trong phòng (vẽ bằng SVG, chuyển động bằng CSS). */
import type { ReactNode } from 'react'

const Svg = ({ children, label }: { children: ReactNode; label: string }) => (
  <svg className="ic" viewBox="0 0 120 140" role="img" aria-label={label}>{children}</svg>
)

export function StockingIcon({ main = '#a82a2a', dark = '#6f1414' }: { main?: string; dark?: string }) {
  return (
    <Svg label="Chiếc tất">
      <g className="ic-swing" style={{ transformOrigin: '56px 10px' }}>
        <path d="M54 4 q-6 -4 -2 -8 M54 4 l0 14" stroke="#7a4a1c" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M32 26 H76 V80 Q76 94 92 101 Q112 110 106 127 Q99 140 77 134 Q38 127 32 92 Z" fill={main} stroke={dark} strokeWidth="2" />
        <path d="M32 92 Q38 127 77 134 Q99 140 106 127 Q106 126 106 125 Q98 132 80 128 Q44 120 32 92Z" fill={dark} opacity=".45" />
        <rect x="28" y="16" width="52" height="20" rx="7" fill="#f6efe0" stroke="#cdbf9d" strokeWidth="2" />
        <g stroke="#cdbf9d" strokeWidth="1.4"><path d="M36 20 v12 M44 20 v12 M52 20 v12 M60 20 v12 M68 20 v12" /></g>
        <g stroke="#f6efe0" strokeWidth="2.4" strokeLinecap="round" transform="translate(54 58)">
          <path d="M0 -14 V14 M-12 -7 L12 7 M-12 7 L12 -7" /><circle r="2.5" fill="#f6efe0" />
        </g>
        <path d="M34 80 H76" stroke="#f6efe0" strokeWidth="2" strokeDasharray="4 4" opacity=".8" />
        <ellipse cx="94" cy="122" rx="11" ry="8" fill="#f6efe0" opacity=".85" transform="rotate(25 94 122)" />
      </g>
      <g className="ic-tw" fill="#ffe9a8"><path d="M100 30 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2z" /><path d="M14 70 l1.5 4.5 4.5 1.5 -4.5 1.5 -1.5 4.5 -1.5 -4.5 -4.5 -1.5 4.5 -1.5z" style={{ animationDelay: '-.9s' }} /></g>
    </Svg>
  )
}

export function FireIcon() {
  return (
    <Svg label="Bếp lửa">
      <path d="M12 132 V58 Q12 22 60 22 Q108 22 108 58 V132 Z" fill="#6b4a32" stroke="#3d2716" strokeWidth="3" />
      <g stroke="#4c3322" strokeWidth="1.6" opacity=".75"><path d="M12 50 H34 M86 50 H108 M12 74 H30 M90 74 H108 M12 98 H30 M90 98 H108 M30 36 L40 28 M90 36 L80 28" /></g>
      <path d="M26 132 V62 Q26 38 60 38 Q94 38 94 62 V132 Z" fill="#1b0d06" />
      <g className="ic-glowbox"><ellipse cx="60" cy="118" rx="30" ry="12" fill="#ff9a3c" opacity=".5" /></g>
      <rect x="34" y="118" width="52" height="9" rx="4.5" fill="#4b2c14" transform="rotate(-4 60 122)" />
      <rect x="40" y="112" width="44" height="9" rx="4.5" fill="#5c3719" transform="rotate(5 62 116)" />
      <g style={{ transformOrigin: '60px 114px' }} className="ic-flame a"><path d="M60 52 C74 70 82 86 76 104 C72 114 48 114 44 104 C38 86 50 72 60 52Z" fill="#ff7a1e" /></g>
      <g style={{ transformOrigin: '60px 114px' }} className="ic-flame b"><path d="M60 68 C70 82 72 94 68 106 C64 112 54 112 52 106 C48 94 54 82 60 68Z" fill="#ffc43d" /></g>
      <g style={{ transformOrigin: '60px 114px' }} className="ic-flame c"><path d="M60 88 C66 96 66 104 63 110 C61 113 58 113 57 110 C54 104 55 96 60 88Z" fill="#fff3b0" /></g>
      <g fill="#ffd27a"><circle className="ic-spark s1" cx="50" cy="70" r="2" /><circle className="ic-spark s2" cx="70" cy="64" r="1.6" /><circle className="ic-spark s3" cx="60" cy="58" r="1.8" /></g>
    </Svg>
  )
}

export function WreathIcon() {
  const berries = [[60, 20], [92, 36], [100, 70], [28, 40], [20, 74], [38, 104], [88, 100]]
  const lights = [[76, 24], [98, 52], [96, 86], [18, 54], [30, 92], [50, 108], [80, 108], [44, 22]]
  return (
    <Svg label="Vòng hoa">
      <circle cx="60" cy="64" r="40" fill="none" stroke="#244f30" strokeWidth="22" />
      <circle cx="60" cy="64" r="40" fill="none" stroke="#3b7a45" strokeWidth="16" strokeDasharray="7 3" />
      <circle cx="60" cy="64" r="40" fill="none" stroke="#5aa05d" strokeWidth="6" strokeDasharray="3 6" />
      {berries.map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="4.5" fill="#c9302c" /><circle cx={x - 1.3} cy={y - 1.3} r="1.2" fill="#ffd6c8" /></g>)}
      <g className="ic-sway" style={{ transformOrigin: '60px 100px' }}>
        <path d="M60 100 q-24 -22 -30 6 q10 14 30 -6z" fill="#b2262a" /><path d="M60 100 q24 -22 30 6 q-10 14 -30 -6z" fill="#b2262a" />
        <path d="M54 104 q-6 22 -14 28 q10 -2 18 -18z M66 104 q6 22 14 28 q-10 -2 -18 -18z" fill="#8d1b1f" />
        <circle cx="60" cy="102" r="6" fill="#d23a3a" />
      </g>
      {lights.map(([x, y], i) => <circle key={i} className="ic-light" cx={x} cy={y} r="2.6" fill="#ffe08a" style={{ animationDelay: `-${(i * 0.37).toFixed(2)}s` }} />)}
    </Svg>
  )
}

export function StarIcon() {
  const pts = Array.from({ length: 16 }, (_, i) => { const a = (Math.PI * i) / 8 - Math.PI / 2, r = i % 2 ? 17 : 50; return `${60 + r * Math.cos(a)},${70 + r * Math.sin(a)}` }).join(' ')
  const pts2 = Array.from({ length: 8 }, (_, i) => { const a = (Math.PI * i) / 4 - Math.PI / 2 + Math.PI / 8, r = i % 2 ? 12 : 34; return `${60 + r * Math.cos(a)},${70 + r * Math.sin(a)}` }).join(' ')
  return (
    <Svg label="Ngôi sao">
      <defs><radialGradient id="icg" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#fff2b8" stopOpacity=".95" /><stop offset="1" stopColor="#ffbf55" stopOpacity="0" /></radialGradient>
        <linearGradient id="icf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffe9a0" /><stop offset="1" stopColor="#d49a3a" /></linearGradient></defs>
      <circle className="ic-halo" cx="60" cy="70" r="58" fill="url(#icg)" />
      <g className="ic-spin" style={{ transformOrigin: '60px 70px' }}><polygon points={pts2} fill="#ffd77a" opacity=".55" /></g>
      <polygon points={pts} fill="url(#icf)" stroke="#a87220" strokeWidth="1.6" strokeLinejoin="round" />
      <circle cx="60" cy="70" r="4" fill="#fff6d0" />
      <g className="ic-tw" fill="#fff3c4"><path d="M18 24 l2 7 7 2 -7 2 -2 7 -2 -7 -7 -2 7 -2z" /><path d="M102 112 l1.6 5.4 5.4 1.6 -5.4 1.6 -1.6 5.4 -1.6 -5.4 -5.4 -1.6 5.4 -1.6z" style={{ animationDelay: '-1.2s' }} /></g>
    </Svg>
  )
}

export function LampIcon() {
  return (
    <Svg label="Ngọn đèn">
      <circle className="ic-halo" cx="60" cy="76" r="54" fill="url(#icg2)" />
      <defs><radialGradient id="icg2" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#ffd78a" stopOpacity=".7" /><stop offset="1" stopColor="#ffb54a" stopOpacity="0" /></radialGradient></defs>
      <path d="M60 6 a9 9 0 0 1 9 9 M60 6 a9 9 0 0 0 -9 9" fill="none" stroke="#3a2a1c" strokeWidth="3" />
      <path d="M44 26 L60 14 L76 26 Z" fill="#2c2018" stroke="#1a110b" strokeWidth="2" />
      <rect x="40" y="26" width="40" height="6" rx="2" fill="#3a2a1c" />
      <path d="M42 32 H78 L82 108 H38 Z" fill="#ffd98a" opacity=".35" stroke="#3a2a1c" strokeWidth="3" />
      <path d="M60 32 V108 M42 32 L38 108 M78 32 L82 108" stroke="#3a2a1c" strokeWidth="2" />
      <rect x="52" y="82" width="16" height="24" rx="2" fill="#f6e9cc" />
      <g className="ic-flame lamp" style={{ transformOrigin: '60px 82px' }}><path d="M60 52 C68 62 70 72 66 80 C63 84 57 84 54 80 C50 72 52 62 60 52Z" fill="#ffb02e" /><path d="M60 64 C64 70 64 76 62 80 C61 82 59 82 58 80 C56 76 56 70 60 64Z" fill="#fff0b0" /></g>
      <path d="M34 108 H86 L90 120 H30 Z" fill="#2c2018" stroke="#1a110b" strokeWidth="2" />
      <g className="ic-tw" fill="#ffe3a0"><circle cx="24" cy="50" r="2" /><circle cx="98" cy="64" r="1.6" style={{ animationDelay: '-.8s' }} /></g>
    </Svg>
  )
}
