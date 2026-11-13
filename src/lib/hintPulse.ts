import { useEffect, useRef, useState } from 'react'

/**
 * Gợi ý nhẹ nhàng thay cho dòng chữ "hãy bấm vào...": thi thoảng một vật bấm được sáng viền khẽ vài giây rồi tắt.
 * Trả về chỉ số vật đang sáng (hoặc null). Chỉ chạy khi cảnh đang hiện và không có thao tác nào đang diễn ra.
 */
export function useHintPulse(count: number, active: boolean, paused = false) {
  const [i, setI] = useState<number | null>(null)
  const last = useRef(-1)
  const stop = useRef(paused); stop.current = paused
  useEffect(() => {
    if (!active || count <= 0) { setI(null); return }
    let t1 = 0, t2 = 0, dead = false
    const next = (first: boolean) => {
      t1 = window.setTimeout(() => {
        if (dead) return
        if (document.hidden || stop.current) { next(false); return }
        let k = Math.floor(Math.random() * count); if (k === last.current && count > 1) k = (k + 1) % count
        last.current = k; setI(k)
        t2 = window.setTimeout(() => { setI(null); next(false) }, 3000)
      }, first ? 5500 : 8000 + Math.random() * 6000)
    }
    next(true)
    return () => { dead = true; clearTimeout(t1); clearTimeout(t2); setI(null) }
  }, [count, active])
  return i
}
