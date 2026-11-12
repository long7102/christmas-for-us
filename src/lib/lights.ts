import { useEffect, useState } from 'react'
import { sfx } from './audio'

/**
 * Công tắc đèn chung của hai cảnh (đèn lồng ở cảnh mèo, đèn trên cây ở cảnh cây thông).
 * Trạng thái nằm trong bộ nhớ nên cuộn qua lại giữa hai cảnh vẫn giữ nguyên; tải lại trang thì đèn sáng lại.
 */
let on = true
const subs = new Set<() => void>()

export const lights = {
  get on() { return on },
  subscribe(f: () => void) { subs.add(f); return () => void subs.delete(f) },
  toggle() {
    on = !on
    if (on) sfx.relight(); else sfx.puff()
    subs.forEach((f) => f())
  },
}

export function useLights() {
  const [v, setV] = useState(lights.on)
  useEffect(() => { setV(lights.on); return lights.subscribe(() => setV(lights.on)) }, [])
  return v
}
