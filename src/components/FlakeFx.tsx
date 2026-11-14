import { useEffect, useRef } from 'react'
import { FLAKES, drawFlake } from '../lib/snowflakes'

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
const COLOR = '#ecdcae'

/**
 * Chuyển cảnh bông tuyết, vẽ bằng canvas theo đúng thanh cuộn (không dùng ảnh/SVG phóng to nên không vỡ nét và không nháy):
 * một bông tuyết vector phẳng nằm ngang (dẹt như đĩa, xoay chậm) từ từ dựng đứng đối diện người xem, rồi bay thẳng ra phía trước, phóng lớn
 * che kín màn hình (lúc đó cảnh bên dưới đổi) và tan đi để lộ cảnh mới. Trả hàm vẽ qua `reg`: draw(r, i) với r = 0..1 tiến độ, i = mẫu.
 */
export function FlakeFx({ reg }: { reg: React.MutableRefObject<(r: number, i: number, rect?: { w: number; h: number }) => void> }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = ref.current!, ctx = cv.getContext('2d')!
    let W = 0, H = 0, dpr = 1, blank = true
    const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); blank = false }
    size(); addEventListener('resize', size)
    reg.current = (r, i) => {
      if (r <= 0.003 || r >= 0.997) { if (!blank) { ctx.clearRect(0, 0, cv.width, cv.height); blank = true } return }
      blank = false
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H)
      const f = FLAKES[i % FLAKES.length]
      const tilt = (78 * Math.PI) / 180 * (1 - ease(smooth(0.06, 0.4, r))) // 78 độ: nằm ngang như đĩa; 0: dựng đứng đối diện người xem
      const sy = Math.cos(tilt)
      const sc = r < 0.4 ? 0.5 + 0.6 * ease(smooth(0, 0.4, r)) : 1.1 * Math.pow(70, ease(smooth(0.4, 0.64, r))) * (1 + 0.3 * smooth(0.64, 1, r))
      const ppu = (Math.min(W, H) * 0.9 / 200) * sc // điểm ảnh mỗi đơn vị của hộp -100..100
      const cx = W / 2, cy = H * (0.5 + 0.12 * (1 - ease(smooth(0.06, 0.4, r))))
      const spin = ease(r) * Math.PI * 0.8
      const alpha = smooth(0, 0.08, r) * (1 - smooth(0.66, 0.94, r))
      const cover = smooth(0.5, 0.62, r) * (1 - smooth(0.66, 0.94, r)) // lấp kín những khe giữa các nhánh khi phóng lớn
      ctx.globalAlpha = alpha
      ctx.save(); ctx.translate(cx, cy); ctx.scale(1, sy); ctx.rotate(spin); drawFlake(ctx, f, ppu, COLOR); ctx.restore()
      if (cover > 0.001) { ctx.globalAlpha = cover; ctx.fillStyle = COLOR; ctx.fillRect(0, 0, W, H) }
      ctx.globalAlpha = 1
    }
    return () => { removeEventListener('resize', size); reg.current = () => {} }
  }, [reg])
  return <canvas ref={ref} className="xf-flake" aria-hidden />
}
