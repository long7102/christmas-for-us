import { couple as C } from '../content/content'

/** Two people sitting in the snow, seen only from behind. `pointing`: she points at a star, he tilts his head after it. viewBox 400x330 */
export default function CoupleArt({ pointing = false }: { pointing?: boolean }) {
  return (
    <svg viewBox="0 0 400 330" className="couple" aria-hidden="true">
      <ellipse cx="200" cy="312" rx="190" ry="26" fill="url(#gSnow)" />
      {/* her */}
      <g>
        <path d="M96 128Q92 230 108 250L170 250Q184 170 168 128Z" fill={C.herHair} opacity=".0" />
        <path d="M92 140Q86 215 104 232Q142 222 176 232Q192 205 176 140Z" fill={C.herHair} />
        <path d="M82 240Q86 168 124 154Q168 154 182 240L190 306L74 306Z" fill={C.herCoat} />
        <path d="M124 154Q130 220 128 306" stroke="#00000030" strokeWidth="3" fill="none" />
        {pointing
          ? <g><path d="M92 176Q58 130 60 66" stroke={C.herCoat} strokeWidth="26" strokeLinecap="round" fill="none" /><circle cx="60" cy="52" r="13" fill="#f2cba5" /><path d="M60 42L62 8" stroke="#f2cba5" strokeWidth="6" strokeLinecap="round" /></g>
          : <path d="M92 180Q78 230 96 270" stroke={C.herCoat} strokeWidth="22" strokeLinecap="round" fill="none" />}
        <circle cx="134" cy="114" r="35" fill={C.herHair} />
        <path d="M98 112Q100 70 136 70Q172 70 170 112Q134 100 98 112Z" fill={C.herHat} /><circle cx="134" cy="64" r="11" fill={C.herHat} />
        <rect x="100" y="146" width="68" height="18" rx="9" fill={C.herScarf} /><path d="M148 160L154 206L134 206Z" fill={C.herScarf} />
      </g>
      {/* him */}
      <g style={{ transformOrigin: '270px 160px', transform: pointing ? 'rotate(-8deg)' : 'none', transition: 'transform .8s' }}>
        <path d="M206 240Q212 168 252 154Q304 156 318 240L324 306L202 306Z" fill={C.hisCoat} />
        <path d="M262 154Q268 220 266 306" stroke="#00000030" strokeWidth="3" fill="none" />
        <path d="M312 180Q326 230 308 270" stroke={C.hisCoat} strokeWidth="22" strokeLinecap="round" fill="none" />
        <circle cx="262" cy="112" r="36" fill={C.hisHair} />
        <path d="M224 110Q226 66 264 66Q302 66 300 110Q262 98 224 110Z" fill={C.hisHat} />
        <path d="M226 100H300" stroke="#00000025" strokeWidth="6" />
        <rect x="228" y="146" width="70" height="20" rx="10" fill={C.hisScarf} /><path d="M282 160L290 210L270 210Z" fill={C.hisScarf} />
      </g>
    </svg>
  )
}
