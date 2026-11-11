/** Shared gradients/filters, referenced by url(#id) from every inline SVG. */
export function Defs() {
  const lg = (id: string, a: string, b: string, c?: string) => (
    <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor={a} />
      {c && <stop offset=".5" stopColor={c} />}
      <stop offset="1" stopColor={b} />
    </linearGradient>
  )
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
      <defs>
        {lg('gPine', '#2a6a4e', '#0f3326')}
        {lg('gPine2', '#1d4f3b', '#0b261c')}
        {lg('gWood', '#9a6638', '#5f3b20')}
        {lg('gWoodD', '#6b4326', '#3a2212')}
        {lg('gRed', '#d2404f', '#7a1f2b')}
        {lg('gGold', '#fff0bf', '#d99a3e', '#f4c970')}
        {lg('gSnow', '#ffffff', '#c9dcee')}
        {lg('gNight', '#060d18', '#14385a', '#0b2038')}
        {lg('gStone', '#8f98a3', '#5c6670')}
        {lg('gCream', '#fff6e0', '#e8d6ae')}
        {lg('gCloth', '#c63a48', '#8a2432')}
        {lg('gHill', '#eef5fc', '#a9c3dd')}
        {lg('gRoom', '#4a2d1e', '#24140c')}
        <radialGradient id="gGlow">
          <stop offset="0" stopColor="#fff3c4" stopOpacity="1" />
          <stop offset=".35" stopColor="#ffd27a" stopOpacity=".55" />
          <stop offset="1" stopColor="#ffb04a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="gMoon">
          <stop offset="0" stopColor="#f4f8ff" />
          <stop offset=".6" stopColor="#dbe6f6" />
          <stop offset="1" stopColor="#b9c9e0" />
        </radialGradient>
        <radialGradient id="gMoonGlow">
          <stop offset="0" stopColor="#bcd4ff" stopOpacity=".5" />
          <stop offset="1" stopColor="#bcd4ff" stopOpacity="0" />
        </radialGradient>
        <filter id="fBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" /></filter>
        <filter id="fSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.6" /></filter>
        <filter id="fShadow" x="-20%" y="-20%" width="150%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity=".4" />
        </filter>
      </defs>
    </svg>
  )
}
