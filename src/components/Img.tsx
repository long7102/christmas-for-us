import { type CSSProperties, type MouseEventHandler } from 'react'
import { asset } from '../lib/assets'
import { usePortrait } from '../lib/device'

type Props = {
  name: string
  /** Use "<name>-m" variant on portrait screens (for backgrounds). */
  responsive?: boolean
  className?: string
  style?: CSSProperties
  alt?: string
  onClick?: MouseEventHandler
}

/**
 * Renders a real asset. If the file is missing: dev shows a labelled tag,
 * production renders nothing (never substitutes shapes).
 */
export function Img({ name, responsive, className, style, alt = '', onClick }: Props) {
  const portrait = usePortrait()
  const want = responsive && portrait ? name.replace(/(\.[a-z]+)$/i, '-m$1') : name
  const src = asset(want) ?? (responsive ? asset(name) : null)
  if (!src) {
    if (!import.meta.env.DEV && !import.meta.env.VITE_SHOW_MISSING) return null
    return (
      <div className={`asset-missing ${className ?? ''}`} style={style} onClick={onClick}>
        {want}
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      decoding="async"
      className={className}
      style={style}
      onClick={onClick}
    />
  )
}
