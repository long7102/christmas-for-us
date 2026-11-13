/**
 * Ánh sáng theo giờ thật của máy người xem. Ảnh gốc là đêm, nên ban đêm giữ nguyên;
 * ban ngày và hoàng hôn chỉ đổi màu bầu trời (lớp phủ chạy từ trên xuống) và một lớp phủ rất nhẹ lên cả khung.
 * Đèn đường, cửa sổ vẫn sáng như ảnh. Chỉ đặt các biến CSS, không có hiệu ứng lọc nặng.
 * Xem thử một giờ bất kỳ: thêm ?h=14.5 vào địa chỉ.
 */
type K = { h: number; sky: [number, number, number]; sa: number; wash: [number, number, number]; wa: number }

const KEYS: K[] = [
  { h: 0, sky: [10, 20, 60], sa: 0, wash: [10, 20, 60], wa: 0 },
  { h: 5, sky: [10, 20, 60], sa: 0, wash: [10, 20, 60], wa: 0 },
  { h: 6, sky: [255, 165, 125], sa: 0.5, wash: [255, 170, 120], wa: 0.06 },
  { h: 8, sky: [170, 200, 235], sa: 0.62, wash: [200, 220, 245], wa: 0.1 },
  { h: 12, sky: [150, 195, 240], sa: 0.68, wash: [210, 225, 245], wa: 0.14 },
  { h: 16, sky: [190, 205, 230], sa: 0.6, wash: [240, 225, 200], wa: 0.1 },
  { h: 17.5, sky: [255, 130, 80], sa: 0.52, wash: [255, 140, 90], wa: 0.08 },
  { h: 18.5, sky: [80, 60, 130], sa: 0.45, wash: [90, 60, 120], wa: 0.04 },
  { h: 20, sky: [20, 30, 80], sa: 0.16, wash: [20, 30, 80], wa: 0 },
  { h: 21, sky: [10, 20, 60], sa: 0, wash: [10, 20, 60], wa: 0 },
  { h: 24, sky: [10, 20, 60], sa: 0, wash: [10, 20, 60], wa: 0 },
]

const mix = (a: number, b: number, t: number) => a + (b - a) * t

export function lightAt(h: number) {
  let i = 0
  while (i < KEYS.length - 2 && h >= KEYS[i + 1].h) i++
  const a = KEYS[i], b = KEYS[i + 1]
  const t = Math.min(1, Math.max(0, (h - a.h) / (b.h - a.h)))
  const rgb = (x: number[], y: number[]) => x.map((v, n) => Math.round(mix(v, y[n], t))).join(',')
  return { sky: rgb(a.sky, b.sky), sa: mix(a.sa, b.sa, t), wash: rgb(a.wash, b.wash), wa: mix(a.wa, b.wa, t) }
}

export function startTimeOfDay() {
  const root = document.documentElement
  const q = parseFloat(new URLSearchParams(location.search).get('h') ?? '')
  const apply = () => {
    const d = new Date()
    const h = Number.isFinite(q) ? ((q % 24) + 24) % 24 : d.getHours() + d.getMinutes() / 60
    const L = lightAt(h)
    root.style.setProperty('--tod-sky', `rgba(${L.sky},${L.sa.toFixed(3)})`)
    root.style.setProperty('--tod-wash', `rgba(${L.wash},${L.wa.toFixed(3)})`)
    root.style.setProperty('--tod-in', `rgba(${L.wash},${(L.wa * 0.45).toFixed(3)})`)
  }
  apply()
  const iv = setInterval(apply, 60000)
  return () => clearInterval(iv)
}
