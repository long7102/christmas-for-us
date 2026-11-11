/** Where the door leaves sit inside each door photo (px of the source image). Each leaf is the whole arch-shaped half of the door. */
export type DoorGeo = { w: number; h: number; cx: number; hw: number; apex: number; spring: number; bottom: number; cut: number }
export const LAND: DoorGeo = { w: 799, h: 449, cx: 400, hw: 156, apex: 14, spring: 125, bottom: 413, cut: 15 }
export const PORT: DoorGeo = { w: 449, h: 799, cx: 227, hw: 130, apex: 140, spring: 290, bottom: 716, cut: 141 }

const xAt = (g: DoorGeo, y: number) => g.hw * Math.sqrt(Math.max(0, 1 - ((g.spring - y) / (g.spring - g.apex)) ** 2))

/** Left chain of the opening, bottom → top, then the centre line. Right side is its mirror. */
function leftChain(g: DoorGeo): [number, number][] {
  const p: [number, number][] = [[g.cx - g.hw, g.bottom], [g.cx - g.hw, Math.max(g.spring, g.cut)]]
  if (g.cut < g.spring) {
    for (let y = g.spring - 6; y > g.cut; y -= 6) p.push([g.cx - xAt(g, y), y])
    p.push([g.cx - xAt(g, g.cut), g.cut])
  }
  return p
}

export function build(g: DoorGeo) {
  const L = leftChain(g)
  const x0 = g.cx - g.hw, y0 = g.cut, bw = g.hw * 2, bh = g.bottom - g.cut
  const pct = (v: number, a: number, s: number) => `${(((v - a) / s) * 100).toFixed(2)}%`
  // hole in the full image (evenodd), in % of the image
  const R = [...L].reverse().map(([x, y]) => [g.cx + (g.cx - x), y] as [number, number])
  const ring = [...L, ...R]
  const holePts = ring.map(([x, y]) => `${((x / g.w) * 100).toFixed(2)}% ${((y / g.h) * 100).toFixed(2)}%`)
  const frameClip = `polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, ${holePts.join(', ')}, ${holePts[0]}, 0 0)`
  // each half: its own box (half the opening), polygon relative to that box
  const halfL = [...L, [g.cx, g.cut], [g.cx, g.bottom]] as [number, number][]
  const clipL = `polygon(${halfL.map(([x, y]) => `${pct(x, x0, g.hw)} ${pct(y, y0, bh)}`).join(', ')})`
  const halfR = halfL.map(([x, y]) => [g.cx + (g.cx - x), y] as [number, number])
  const clipR = `polygon(${halfR.map(([x, y]) => `${pct(x, g.cx, g.hw)} ${pct(y, y0, bh)}`).join(', ')})`
  const fw = g.hw / g.w, fh = bh / g.h
  const bgSize = `${100 / fw}% ${100 / fh}%`
  const posY = `${((y0 / g.h) / (1 - fh)) * 100}%`
  const posX = (left: number) => `${((left / g.w) / (1 - fw)) * 100}%`
  const areaNum = { widthNum: bw / g.w }
  const area = { ...areaNum, left: `${(x0 / g.w) * 100}%`, top: `${(y0 / g.h) * 100}%`, width: `${(bw / g.w) * 100}%`, height: `${(bh / g.h) * 100}%` }
  // the light fills the full arch-shaped opening (clipped like the frame hole)
  const lightClip = `polygon(${ring.map(([x, y]) => `${pct(x, x0, bw)} ${pct(y, y0, bh)}`).join(', ')})`
  return { frameClip, clipL, clipR, bgSize, posY, posL: posX(x0), posR: posX(g.cx), area, lightClip, origin: `${(g.cx / g.w) * 100}% ${((g.cut + bh * 0.45) / g.h) * 100}%`, aspect: g.w / g.h }
}

/** Pixel polygons for baking textures: whole opening ring, and each leaf with its bounding box. */
export function pixelShapes(g: DoorGeo) {
  const L = leftChain(g)
  const mirror = (pts: [number, number][]) => pts.map(([x, y]) => [g.cx + (g.cx - x), y] as [number, number])
  const ring = [...L, ...mirror([...L].reverse())]
  const leafL = [...L, [g.cx, g.cut], [g.cx, g.bottom]] as [number, number][]
  const leafR = mirror(leafL)
  return { ring, leafL, leafR, x0: g.cx - g.hw, cx: g.cx, y0: g.cut, bw: g.hw, bh: g.bottom - g.cut }
}
