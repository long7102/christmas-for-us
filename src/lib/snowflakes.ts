/**
 * Chín mẫu bông tuyết (theo bộ mẫu Long gửi), vẽ bằng đường nét trong hộp -100..100: mỗi mẫu là MỘT nhánh hướng lên (arm) nhân ra sáu lần
 * (xoay 60 độ), cộng phần lõi (core, vẽ một lần). Cùng dữ liệu dùng cho SVG của chuyển cảnh và cho sprite của tuyết rơi (Path2D đọc cùng chuỗi đường dẫn).
 */
export type FlakeDesign = { arm: string; w: number; core?: string; coreW?: number; fill?: boolean }

const br = (ps: number[], ls: number[], a = 45, side = 1) => { // cặp cành con tại các vị trí ps trên thân (y âm), dài ls, nghiêng a độ
  const s = Math.sin((a * Math.PI) / 180), c = Math.cos((a * Math.PI) / 180)
  return ps.map((p, i) => { const L = ls[i] ?? ls[ls.length - 1]; return `M0 ${-p}L${-L * s * side} ${-(p + L * c)}M0 ${-p}L${L * s * side} ${-(p + L * c)}` }).join('')
}
const hex = (r: number) => `M0 ${-r}L${(r * 0.866).toFixed(1)} ${-r / 2}L${(r * 0.866).toFixed(1)} ${r / 2}L0 ${r}L${(-r * 0.866).toFixed(1)} ${r / 2}L${(-r * 0.866).toFixed(1)} ${-r / 2}Z`
const dot = (x: number, y: number, r: number) => `M${x - r} ${y}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

export const FLAKES: FlakeDesign[] = [
  // 1. nhánh mập, chẻ ba ở đầu, lõi tròn có lỗ
  { arm: 'M0 -26V-72M0 -58L-17 -86M0 -58L17 -86', w: 13, core: dot(0, 0, 11), coreW: 8 },
  // 2. lục giác ở giữa, thân mảnh, cành con dày
  { arm: `M0 -24V-94${br([46, 60, 74, 86], [24, 20, 16, 10], 50)}`, w: 3.4, core: hex(24), coreW: 3 },
  // 3. sao lưới: cành chữ V dài, lục giác trong
  { arm: `M0 -22V-92${br([44, 62, 78], [30, 22, 14], 62)}`, w: 3.2, core: `${hex(30)}${hex(16)}`, coreW: 2.6 },
  // 4. mũi giáo mập, cành ngắn
  { arm: `M0 -14V-90M0 -46L-20 -68M0 -46L20 -68M0 -66L-13 -82M0 -66L13 -82`, w: 8.5 },
  // 5. dày cành như lông chim, lõi sáu cánh nhỏ
  { arm: `M0 -20V-94${br([30, 39, 48, 57, 66, 75, 84], [22, 20, 18, 16, 13, 10, 6], 42)}`, w: 2.6, core: hex(14), coreW: 2.4 },
  // 6. hoa: cánh tròn đặc, thân nhỏ
  { arm: 'M0 -16C-26 -38 -24 -66 0 -72C24 -66 26 -38 0 -16ZM0 -72V-94', w: 4, fill: true, core: dot(0, 0, 8), coreW: 5 },
  // 7. mạng nhện: ba vòng lục giác và nan hoa
  { arm: 'M0 -12V-92', w: 2.6, core: `${hex(30)}${hex(52)}${hex(74)}`, coreW: 2.2 },
  // 8. lá răng cưa đặc
  { arm: 'M0 -20L-14 -34L-8 -40L-19 -56L-10 -60L-15 -78L0 -94L15 -78L10 -60L19 -56L8 -40L14 -34Z', w: 3.2, fill: true, core: hex(14), coreW: 3 },
  // 9. nhánh có nút tròn ở đầu mỗi cành
  { arm: `M0 -20V-84M0 -42L-22 -62M0 -42L22 -62M0 -62L-13 -76M0 -62L13 -76${dot(0, -92, 7)}${dot(-22, -64, 6)}${dot(22, -64, 6)}`, w: 6 },
]

/** Vẽ một bông tuyết (trắng) vào canvas, tâm tại (0,0), hộp -100..100 nhân với scale. */
export function drawFlake(ctx: CanvasRenderingContext2D, f: FlakeDesign, scale: number) {
  ctx.save(); ctx.scale(scale, scale)
  ctx.strokeStyle = '#fff'; ctx.fillStyle = '#fff'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'
  const arm = new Path2D(f.arm)
  ctx.lineWidth = f.w
  for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate((i * Math.PI) / 3); if (f.fill) ctx.fill(arm); ctx.stroke(arm); ctx.restore() }
  if (f.core) { ctx.lineWidth = f.coreW ?? f.w; ctx.stroke(new Path2D(f.core)) }
  ctx.restore()
}

/** Sprite 96px mỗi mẫu (trắng trên nền trong), để vẽ nhanh bằng drawImage. */
export function makeSprites(): HTMLCanvasElement[] {
  return FLAKES.map((f) => {
    const c = document.createElement('canvas'); c.width = c.height = 96
    const x = c.getContext('2d')!; x.translate(48, 48); drawFlake(x, f, 0.47); return c
  })
}
