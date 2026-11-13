/**
 * Vũ công quay có khối: dựng từ hai ảnh thật (mặt trước, mặt lưng), mỗi hàng ảnh được coi như một mặt cắt tròn quanh trục đứng.
 * - Thân, đầu, chân, váy (bán kính theo từng hàng): bề mặt cong quay thật, hoạ tiết trượt về mép rồi sang mặt sau, rìa tối dần để thấy khối tròn.
 * - Hai tay duỗi ngang: coi là tấm phẳng đi qua trục, co lại theo cos(góc) rồi lật sang ảnh lưng.
 * Mỗi khung hình dựng lại bằng một lượt tính theo điểm ảnh (khoảng 60 nghìn điểm), đủ nhẹ để chạy liền mạch.
 */
type Tex = { d: Uint8ClampedArray; w: number; h: number; axis: number }

const load = (src: string) => new Promise<HTMLImageElement>((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src })
const pixels = (im: HTMLImageElement): Tex => {
  const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight
  const c = cv.getContext('2d', { willReadFrequently: true })!; c.drawImage(im, 0, 0)
  const d = c.getImageData(0, 0, cv.width, cv.height).data
  // trục quay = trọng tâm các hàng chân (nơi mũi giày đứng trên đĩa)
  let sx = 0, n = 0
  for (let y = 268; y < Math.min(cv.height, 312); y++) for (let x = 0; x < cv.width; x++) if (d[(y * cv.width + x) * 4 + 3] > 128) { sx += x; n++ }
  return { d, w: cv.width, h: cv.height, axis: n ? sx / n : cv.width / 2 }
}
/** Nửa bề rộng thân theo từng hàng (px ảnh): đầu, cổ, thân, váy xoè, chân. */
const KEYS: [number, number][] = [[0, 12], [24, 12], [60, 14], [74, 12], [92, 19], [130, 20], [138, 34], [148, 54], [162, 66], [178, 64], [188, 36], [198, 14], [210, 10], [316, 9]]
const rowR = (y: number) => { for (let i = 1; i < KEYS.length; i++) if (y <= KEYS[i][0]) { const [y0, r0] = KEYS[i - 1], [y1, r1] = KEYS[i]; return r0 + (r1 - r0) * ((y - y0) / (y1 - y0)) } return 9 }

export class Figurine {
  private f?: Tex
  private b?: Tex
  readonly w = 189
  readonly h = 316
  private ax = 0
  private R = new Float32Array(316)
  ready = false

  async load(front: string, back: string) {
    const [a, b] = await Promise.all([load(front), load(back)])
    this.f = pixels(a); this.b = pixels(b); this.ax = this.f.axis
    for (let y = 0; y < this.h; y++) this.R[y] = rowR(y)
    // từ hàng bắt đầu váy trở xuống: bán kính lấy theo bề rộng thật (trung bình mặt trước và lưng) để mặt trụ khít hình
    const half = (t: Tex, y: number) => { let lo = t.w, hi = -1; for (let x = 0; x < t.w; x++) if (t.d[(y * t.w + x) * 4 + 3] > 100) { if (x < lo) lo = x; hi = x } return hi < 0 ? 0 : Math.max(t.axis - lo, hi - t.axis) }
    const meas = new Float32Array(this.h)
    for (let y = 136; y < this.h; y++) meas[y] = (half(this.f, y) + half(this.b, y)) / 2
    for (let y = 136; y < this.h; y++) { let sum = 0, n = 0; for (let k = -4; k <= 4; k++) { const v = meas[y + k]; if (y + k >= 136 && y + k < this.h && v > 0) { sum += v; n++ } } if (n) this.R[y] = Math.max(6, sum / n) }
    this.ready = true
  }

  private sample(t: Tex, x: number, y: number, out: Float32Array) {
    // lấy mẫu song tuyến, màu nhân sẵn alpha
    if (x < 0 || y < 0 || x >= t.w - 1 || y >= t.h - 1) { out[0] = out[1] = out[2] = out[3] = 0; return }
    const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = (y0 * t.w + x0) * 4, j = i + t.w * 4
    const w00 = (1 - fx) * (1 - fy), w10 = fx * (1 - fy), w01 = (1 - fx) * fy, w11 = fx * fy
    const a00 = t.d[i + 3], a10 = t.d[i + 7], a01 = t.d[j + 3], a11 = t.d[j + 7]
    out[3] = (a00 * w00 + a10 * w10 + a01 * w01 + a11 * w11)
    out[0] = t.d[i] * a00 * w00 + t.d[i + 4] * a10 * w10 + t.d[j] * a01 * w01 + t.d[j + 4] * a11 * w11
    out[1] = t.d[i + 1] * a00 * w00 + t.d[i + 5] * a10 * w10 + t.d[j + 1] * a01 * w01 + t.d[j + 5] * a11 * w11
    out[2] = t.d[i + 2] * a00 * w00 + t.d[i + 6] * a10 * w10 + t.d[j + 2] * a01 * w01 + t.d[j + 6] * a11 * w11
  }

  /** Dựng khung hình ở góc `th` (radian, 0 = mặt trước) vào hai ImageData: hình vũ công và hình bóng (đen, cùng độ phủ). */
  render(th: number, img: ImageData, sh: ImageData) {
    if (!this.ready) return
    const F = this.f!, B = this.b!, W = this.w, H = this.h
    const c = Math.cos(th), PI = Math.PI
    const px = new Float32Array(4), ps = new Float32Array(4)
    const o = img.data, so = sh.data
    o.fill(0); so.fill(0)
    for (let y = 0; y < H; y++) {
      const R = this.R[y]
      for (let x = 0; x < W; x++) {
        const xo = x - this.ax
        let r = 0, g = 0, bl = 0, a = 0
        // lớp tay (tấm phẳng): chỉ phần ngoài thân
        if (Math.abs(c) > 0.04) {
          const xw = xo / c
          if (Math.abs(xw) > R && Math.abs(xw) < 110) {
            if (c > 0) this.sample(F, F.axis + xw, y, px); else this.sample(B, B.axis - xw, y, px)
            const aa = px[3] / 255
            if (aa > 0) { r = px[0] / 65025 * 0.92; g = px[1] / 65025 * 0.92; bl = px[2] / 65025 * 0.92; a = aa * 0.92 }
          }
        }
        // lớp thân (mặt trụ)
        if (Math.abs(xo) <= R + 0.5) {
          const s = xo / (R + 0.5), phi0 = Math.asin(s > 1 ? 1 : s < -1 ? -1 : s)
          let phi = phi0 - th
          phi = ((phi + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI
          // gần mép (khoảng 70 đến 110 độ) hoà mặt trước và mặt lưng để chỗ nối không lộ hai tư thế khác nhau
          const ap = Math.abs(phi), t01 = ap < 1.22 ? 0 : ap > 1.92 ? 1 : (ap - 1.22) / 0.7, wb = t01 * t01 * (3 - 2 * t01)
          const sf = F.axis + R * Math.sin(phi), sbk = B.axis - R * Math.sin(phi)
          if (wb <= 0) this.sample(F, sf, y, ps)
          else if (wb >= 1) this.sample(B, sbk, y, ps)
          else { this.sample(F, sf, y, ps); this.sample(B, sbk, y, px); for (let q = 0; q < 4; q++) ps[q] = ps[q] * (1 - wb) + px[q] * wb }
          const ba = ps[3] / 255
          if (ba > 0) {
            const shade = 0.72 + 0.28 * Math.pow(Math.cos(phi0), 0.9)
            const k = shade / 65025
            r = ps[0] * k + r * (1 - ba); g = ps[1] * k + g * (1 - ba); bl = ps[2] * k + bl * (1 - ba); a = ba + a * (1 - ba)
          }
        }
        if (a > 0.003) {
          const i = (y * W + x) * 4
          o[i] = Math.min(255, (r / a) * 255); o[i + 1] = Math.min(255, (g / a) * 255); o[i + 2] = Math.min(255, (bl / a) * 255); o[i + 3] = Math.min(255, a * 255)
          so[i + 3] = o[i + 3]
        }
      }
    }
  }
}
