import { useEffect, useRef } from 'react'

/**
 * Con trỏ riêng của trang: một chấm sáng ấm và một vòng nhỏ đi theo trễ nhẹ; rê lên vật bấm được thì vòng nở ra thành quầng sao,
 * bấm thì toả một vòng gợn. Chỉ bật với chuột thật (điện thoại không có), tắt khi người dùng chọn giảm chuyển động.
 * Không dùng filter nặng: chỉ transform và opacity.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!matchMedia('(pointer: fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const root = document.documentElement
    root.classList.add('has-cursor')
    const d = dot.current!, r = ring.current!
    let x = -100, y = -100, rx = -100, ry = -100, raf = 0, seen = false, down = false
    const frame = () => {
      rx += (x - rx) * 0.22; ry += (y - ry) * 0.22
      d.style.transform = `translate3d(${x}px,${y}px,0)`
      r.style.transform = `translate3d(${rx}px,${ry}px,0)`
      raf = Math.abs(x - rx) + Math.abs(y - ry) > 0.2 ? requestAnimationFrame(frame) : 0
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const move = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      x = e.clientX; y = e.clientY
      if (!seen) { seen = true; rx = x; ry = y; d.classList.add('show'); r.classList.add('show') }
      kick()
    }
    const over = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const t = e.target as Element | null
      const hot = !!t && (t.closest('button, a, input, [role="button"], select, label') != null || getComputedStyle(t).cursor === 'pointer')
      r.classList.toggle('hot', hot); d.classList.toggle('hot', hot)
    }
    const press = (v: boolean) => () => { down = v; r.classList.toggle('down', v) }
    const click = (e: MouseEvent) => {
      const s = document.createElement('i'); s.className = 'cur-ping'
      s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'
      document.body.appendChild(s); setTimeout(() => s.remove(), 700)
    }
    const leave = () => { d.classList.remove('show'); r.classList.remove('show'); seen = false }
    addEventListener('pointermove', move, { passive: true })
    addEventListener('pointerover', over, { passive: true })
    addEventListener('pointerdown', press(true)); addEventListener('pointerup', press(false))
    addEventListener('click', click)
    document.documentElement.addEventListener('pointerleave', leave)
    void down
    return () => {
      cancelAnimationFrame(raf); root.classList.remove('has-cursor')
      removeEventListener('pointermove', move); removeEventListener('pointerover', over); removeEventListener('click', click)
      document.documentElement.removeEventListener('pointerleave', leave)
    }
  }, [])
  return (<><div ref={ring} className="cur-ring" aria-hidden /><div ref={dot} className="cur-dot" aria-hidden /></>)
}
