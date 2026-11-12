import { useEffect } from 'react'

/** Gợn sáng vàng nhỏ tại chỗ vừa chạm trên nút và vật bấm được, kèm rung rất nhẹ trên điện thoại. */
export function useRipple() {
  useEffect(() => {
    const calm = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
    const on = (e: PointerEvent) => {
      const el = (e.target as Element | null)?.closest?.('button, a, [role="button"], .tr-hs, .cat-hs')
      if (!el || (el as HTMLButtonElement).disabled) return
      if (e.pointerType === 'touch') navigator.vibrate?.(6)
      if (calm) return
      const r = document.createElement('i')
      r.className = 'rip'; r.style.left = `${e.clientX}px`; r.style.top = `${e.clientY}px`
      document.body.appendChild(r)
      r.addEventListener('animationend', () => r.remove())
    }
    addEventListener('pointerdown', on, { passive: true })
    return () => removeEventListener('pointerdown', on)
  }, [])
}
