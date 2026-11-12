import type { DoorGeo } from './doorGeometry'

/** Tuyết bám trên khung cửa: dày ở đỉnh vòm, rải dọc hai bên và dồn thành đống ở ngưỡng cửa. */
export function DoorSnow({ geo }: { geo: DoorGeo }) {
  const { w, h, cx, hw, apex, spring, bottom } = geo
  const rx = hw + 10, ry = spring - apex + 10
  const arc = `M ${cx - rx} ${spring} A ${rx} ${ry} 0 0 1 ${cx + rx} ${spring}`
  const sideL = `M ${cx - hw - 7} ${spring} V ${bottom - 30}`
  const sideR = `M ${cx + hw + 7} ${spring} V ${bottom - 30}`
  const sc = w / 1680
  return (
    <svg className="door-snowcap" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden>
      <defs>
        <filter id="dsn" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="3" seed="12" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale={16 * sc} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={0.9 * sc} result="b" />
          <feDropShadow in="b" dx="0" dy={3 * sc} stdDeviation={2.4 * sc} floodColor="#0a1428" floodOpacity=".55" />
        </filter>
        <linearGradient id="dsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d4e0f2" /></linearGradient>
      </defs>
      <g filter="url(#dsn)" fill="none" strokeLinecap="round">
        <path d={arc} stroke="url(#dsg)" strokeWidth={30 * sc} />
        <path d={arc} stroke="#fff" strokeWidth={13 * sc} transform={`translate(0 ${-6 * sc})`} opacity=".95" />
        <path d={sideL} stroke="#eef4ff" strokeWidth={10 * sc} strokeDasharray={`${34 * sc} ${54 * sc}`} opacity=".92" />
        <path d={sideR} stroke="#eef4ff" strokeWidth={10 * sc} strokeDasharray={`${26 * sc} ${70 * sc}`} strokeDashoffset={20 * sc} opacity=".92" />
        <path d={`M ${cx - hw - 26} ${bottom + 4} Q ${cx} ${bottom - 34} ${cx + hw + 26} ${bottom + 4}`} stroke="url(#dsg)" strokeWidth={34 * sc} />
        <path d={`M ${cx - hw - 6} ${bottom - 6} Q ${cx - hw * 0.4} ${bottom - 30} ${cx} ${bottom - 22} T ${cx + hw + 6} ${bottom - 6}`} stroke="#fff" strokeWidth={14 * sc} />
      </g>
    </svg>
  )
}
