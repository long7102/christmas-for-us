import index from 'virtual:asset-index'

const set = new Set(index)
const EXT = ['webp', 'avif', 'png', 'jpg', 'mp3', 'glb']

/** Resolve "door/frame.png" (or "door/frame") to a real file under /assets, or null if it does not exist. */
export function asset(name: string): string | null {
  if (set.has(name)) return `/assets/${name}`
  const stem = name.replace(/\.[a-z0-9]+$/i, '')
  for (const e of EXT) if (set.has(`${stem}.${e}`)) return `/assets/${stem}.${e}`
  return null
}

export const hasAsset = (name: string) => asset(name) !== null
