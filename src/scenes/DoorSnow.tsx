import type { DoorGeo } from './doorGeometry'

/** Tuyết bám trên khung cửa: dày ở đỉnh vòm, rải dọc hai bên và dồn thành đống ở ngưỡng cửa. */
export function DoorSnow({ geo, fall }: { geo: DoorGeo; fall: boolean }) {
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
          <feDisplacementMap in="SourceGraphic" in2="n" scale={9 * sc} xChannelSelector="R" yChannelSelector="G" result="d" />
          <feGaussianBlur in="d" stdDeviation={0.9 * sc} result="b" />
          <feDropShadow in="b" dx="0" dy={3 * sc} stdDeviation={2.4 * sc} floodColor="#0a1428" floodOpacity=".55" />
        </filter>
        <linearGradient id="dsg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d4e0f2" /></linearGradient>
      </defs>
      <g className={`dsn-main${fall ? ' fall' : ''}`} filter="url(#dsn)" fill="none" strokeLinecap="round">
        <path d={arc} stroke="url(#dsg)" strokeWidth={13 * sc} />
        <path d={arc} stroke="#fff" strokeWidth={6 * sc} transform={`translate(0 ${-3 * sc})`} opacity=".95" />
        <path d={sideL} stroke="#eef4ff" strokeWidth={4.5 * sc} strokeDasharray={`${30 * sc} ${70 * sc}`} opacity=".92" />
        <path d={sideR} stroke="#eef4ff" strokeWidth={4 * sc} strokeDasharray={`${22 * sc} ${84 * sc}`} strokeDashoffset={20 * sc} opacity=".92" />
        <path d={`M ${cx - hw - 26} ${bottom + 4} Q ${cx} ${bottom - 34} ${cx + hw + 26} ${bottom + 4}`} stroke="url(#dsg)" strokeWidth={15 * sc} />
        <path d={`M ${cx - hw - 6} ${bottom - 6} Q ${cx - hw * 0.4} ${bottom - 30} ${cx} ${bottom - 22} T ${cx + hw + 6} ${bottom - 6}`} stroke="#fff" strokeWidth={6 * sc} />
      </g>
      {fall && (
        <g fill="#f4f8ff">
          {Array.from({ length: 34 }, (_, i) => {
            const t = (i + 0.5) / 34, a = Math.PI * (1 - t)
            const x = cx + Math.cos(a) * rx * (i % 5 === 0 ? 1.02 : 1), y = spring - Math.sin(a) * ry
            return <circle key={i} className="dsn-drop" cx={x} cy={y} r={(2.4 + (i % 4)) * sc} style={{ animationDelay: `${(i % 9) * 0.07}s`, ['--fall' as string]: `${(bottom - y) * (0.7 + (i % 3) * 0.12)}px`, ['--dx' as string]: `${((i % 7) - 3) * 4 * sc}px` }} />
          })}
        </g>
      )}
    </svg>
  )
}
