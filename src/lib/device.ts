import { useEffect, useState } from 'react'

export const reducedMotion = () =>
  typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches

export const isCoarse = () => typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches

export function usePortrait() {
  const q = '(orientation: portrait)'
  const [v, set] = useState(() => matchMedia(q).matches)
  useEffect(() => {
    const m = matchMedia(q)
    const f = () => set(m.matches)
    m.addEventListener('change', f)
    return () => m.removeEventListener('change', f)
  }, [])
  return v
}

/** Chế độ nhẹ cho máy yếu: giảm hạt, bỏ lớp hiệu ứng nặng (bật tự động khi tốc độ khung hình thấp, hoặc ?lite=1). */
export const isLite = () => typeof document !== 'undefined' && document.documentElement.classList.contains('lite')
