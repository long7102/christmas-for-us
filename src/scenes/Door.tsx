import { DoorSnow } from './DoorSnow'
import { useEffect, useMemo, useRef, useState } from 'react'
import gsap from 'gsap'
import { SnowParticles } from '../components/SnowParticles'
import { content, ui } from '../content/content'
import { store } from '../lib/storage'
import { reducedMotion, usePortrait } from '../lib/device'
import { LAND, PORT, build, pixelShapes } from './doorGeometry'
import VillageLife from './VillageLife'
import { sfx } from '../lib/audio'
import landImg from '../assets/door-land.jpg'
import portImg from '../assets/door-port.jpg'

// Optional establishing shot of the village (drop village-land.webp / village-port.webp into src/assets).
const villageFiles = import.meta.glob('../assets/village-*.webp', { eager: true, query: '?url', import: 'default' }) as Record<string, string>
const villageUrl = (portrait: boolean) => Object.entries(villageFiles).find(([k]) => k.includes(portrait ? 'village-port' : 'village-land'))?.[1]
/** Where the door house sits in the village shot (0..1) and how far to run in until it fills the screen. Tune per image. */
/** x,y: the door in the village photo; s: zoom until it fills the door shot; dy: shift so its centre lands where the door shot's centre is. */
const VILL = { land: { x: 0.5, y: 0.634, s: 2.0, w: 0.108 }, port: { x: 0.508, y: 0.6, s: 1.7, w: 0.194 } }

/** Leaf thickness and how deep it hangs inside the doorway, as fractions of the leaf width. */
const THICK = 0.36
const RECESS = 0.75
const PERSP = 1100

type Tex = { wr: string; wrDark: string; wbox: [number, number, number, number]; frame: string; left: string; right: string; leftDark: string; rightDark: string; hl: string; hr: string; hlDark: string; hrDark: string }

/** Bakes the frame (doors cut out) and each leaf (+ a darker copy for its thickness) into transparent textures. */
function useDoorTextures(src: string, geo: typeof LAND) {
  const [tex, setTex] = useState<Tex | null>(null)
  useEffect(() => {
    let dead = false
    const im = new Image()
    im.onload = () => {
      const sh = pixelShapes(geo)
      // ---- the wreath: lift it off the photo as ONE whole object, and fill the wood where it hung ----
      const { ell, rects } = geo.wreath
      const W = im.naturalWidth, H = im.naturalHeight
      const full = document.createElement('canvas'); full.width = W; full.height = H
      const fc = full.getContext('2d', { willReadFrequently: true })!; fc.drawImage(im, 0, 0)
      const bx0 = Math.floor(Math.min(ell[0] - ell[2], ...rects.map((r) => r[0]))) - 8, bx1 = Math.ceil(Math.max(ell[0] + ell[2], ...rects.map((r) => r[0] + r[2]))) + 8
      const by0 = Math.floor(Math.min(ell[1] - ell[3], ...rects.map((r) => r[1]))) - 8, by1 = Math.ceil(Math.max(ell[1] + ell[3], ...rects.map((r) => r[1] + r[3]))) + 8
      const bw = bx1 - bx0, bh = by1 - by0
      const img = fc.getImageData(bx0, by0, bw, bh), px = img.data
      let alpha = new Float32Array(bw * bh)
      const isWood = (r: number, g: number, b: number) => {
        const mx = Math.max(r, g, b), mn = Math.min(r, g, b), v = mx / 255, sat = mx ? (mx - mn) / mx : 0
        let h = 0; const d = mx - mn
        if (d) h = mx === r ? ((g - b) / d + 6) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4
        h *= 60
        return h >= 12 && h <= 48 && v < 0.62 && sat > 0.35
      }
      for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
        const X = x + bx0, Y = y + by0
        const e = ((X - ell[0]) / ell[2]) ** 2 + ((Y - ell[1]) / ell[3]) ** 2
        const inRect = rects.some((r) => X >= r[0] && X <= r[0] + r[2] && Y >= r[1] && Y <= r[1] + r[3])
        if (e > 1 && !inRect) continue
        const i = (y * bw + x) * 4
        const solid = e < 0.62 // the middle of the wreath is kept whole, even its dark shadows
        if (solid || !isWood(px[i], px[i + 1], px[i + 2])) alpha[y * bw + x] = 1
      }
      // close pinholes and soften edge
      const blur = (a: Float32Array) => { const o = new Float32Array(a.length); for (let y = 1; y < bh - 1; y++) for (let x = 1; x < bw - 1; x++) { let t = 0; for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++) t += a[(y + j) * bw + x + k]; o[y * bw + x] = t / 9 } return o }
      alpha = blur(alpha); for (let i = 0; i < alpha.length; i++) alpha[i] = alpha[i] > 0.34 ? 1 : 0
      const solidA = alpha.slice(); alpha = blur(alpha)
      // dilate for the fill mask
      const fm = new Uint8Array(bw * bh)
      for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) if (solidA[y * bw + x]) for (let j = -4; j <= 4; j++) for (let k = -4; k <= 4; k++) { const yy = y + j, xx = x + k; if (yy >= 0 && yy < bh && xx >= 0 && xx < bw) fm[yy * bw + xx] = 1 }
      // wreath texture (original pixels, soft alpha)
      const wc = document.createElement('canvas'); wc.width = bw; wc.height = bh
      const wd = new ImageData(new Uint8ClampedArray(px), bw, bh)
      for (let i = 0; i < alpha.length; i++) wd.data[i * 4 + 3] = alpha[i] * 255
      const wdark = new ImageData(new Uint8ClampedArray(wd.data), bw, bh)
      for (let i = 0; i < alpha.length; i++) { wdark.data[i * 4] *= 0.42; wdark.data[i * 4 + 1] *= 0.42; wdark.data[i * 4 + 2] *= 0.42 }
      // fill: wood planks run vertically, so blend each column between the wood above and below the wreath
      const avg = (x: number, y: number, dy: number) => { const c = [0, 0, 0]; for (let t = 0; t < 4; t++) { const yy = Math.min(bh - 1, Math.max(0, y + dy * t)); const i = (yy * bw + x) * 4; c[0] += px[i]; c[1] += px[i + 1]; c[2] += px[i + 2] } return c.map((v) => v / 4) }
      const fill = fc.getImageData(bx0, by0, bw, bh)
      for (let x = 0; x < bw; x++) {
        let y0 = -1, y1 = -1
        for (let y = 0; y < bh; y++) if (fm[y * bw + x]) { if (y0 < 0) y0 = y; y1 = y }
        if (y0 < 0) continue
        const top = avg(x, Math.max(0, y0 - 3), -1), bot = avg(x, Math.min(bh - 1, y1 + 3), 1)
        for (let y = y0; y <= y1; y++) if (fm[y * bw + x]) {
          const t = (y - y0) / Math.max(1, y1 - y0), i = (y * bw + x) * 4, n = (Math.sin(x * 12.9898 + y * 78.233) * 43758.5453) % 1 * 3
          fill.data[i] = top[0] * (1 - t) + bot[0] * t + n; fill.data[i + 1] = top[1] * (1 - t) + bot[1] * t + n; fill.data[i + 2] = top[2] * (1 - t) + bot[2] * t + n
        }
      }
      fc.putImageData(fill, bx0, by0)
      const clean = full
      const toUrl = (d: ImageData) => new Promise<string>((res) => { wc.getContext('2d')!.putImageData(d, 0, 0); wc.toBlob((b) => res(URL.createObjectURL(b!)), 'image/png') })
      const wbox: [number, number, number, number] = [bx0, by0, bw, bh]

      const path = (c: CanvasRenderingContext2D, pts: [number, number][], ox = 0, oy = 0) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x - ox, y - oy) : c.moveTo(x - ox, y - oy))); c.closePath() }
      const make = (w: number, h: number, draw: (c: CanvasRenderingContext2D) => void) => new Promise<string>((res) => {
        const cv = document.createElement('canvas'); cv.width = Math.round(w); cv.height = Math.round(h)
        draw(cv.getContext('2d')!)
        cv.toBlob((b) => res(URL.createObjectURL(b!)), 'image/png')
      })
      // paint the handle out of the leaf (copy plain wood from beside it) so a real, raised handle can replace it
      const unhandle = (c: CanvasRenderingContext2D, [bx, by, bw, bh]: [number, number, number, number], ox: number, dir: 1 | -1) => {
        const t = document.createElement('canvas'); t.width = bw; t.height = bh
        const tc = t.getContext('2d')!
        tc.drawImage(im, bx + dir * (bw + 12), by, bw, bh, 0, 0, bw, bh)
        const d = tc.getImageData(0, 0, bw, bh)
        for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) { const e = Math.min(x, bw - 1 - x, y, bh - 1 - y); d.data[(y * bw + x) * 4 + 3] = Math.min(1, e / 5) * 255 }
        tc.putImageData(d, 0, 0)
        c.drawImage(t, bx - ox, by - sh.y0)
      }
      const leaf = (pts: [number, number][], ox: number, dark: boolean, hb: [number, number, number, number], dir: 1 | -1) => make(sh.bw, sh.bh, (c) => {
        c.save(); path(c, pts, ox, sh.y0); c.clip(); c.drawImage(clean, -ox, -sh.y0); unhandle(c, hb, ox, dir)
        if (dark) { c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(70,36,14,.4)'; c.fillRect(0, 0, sh.bw, sh.bh) }
        c.restore()
      })
      // the brass handle, cut out of the photo by colour, upscaled for smooth edges
      const brass = (b: [number, number, number, number], dark: boolean) => make(b[2] * 3, b[3] * 3, (c) => {
        c.imageSmoothingQuality = 'high'; c.drawImage(im, b[0], b[1], b[2], b[3], 0, 0, b[2] * 3, b[3] * 3)
        const d = c.getImageData(0, 0, b[2] * 3, b[3] * 3), k = dark ? 0.42 : 1
        for (let i = 0; i < d.data.length; i += 4) {
          const r = d.data[i], gg = d.data[i + 1], bl = d.data[i + 2], lum = 0.3 * r + 0.59 * gg + 0.11 * bl
          const a = geo.metal === 'brass' ? Math.min(1, Math.max(0, (lum - 62) / 34)) * Math.min(1, Math.max(0, (r - bl - 28) / 26)) : Math.min(1, Math.max(0, (95 - lum) / 30)) * Math.min(1, Math.max(0, (44 - (r - bl)) / 22))
          d.data[i] = r * k; d.data[i + 1] = gg * k; d.data[i + 2] = bl * k; d.data[i + 3] = a * 255
        }
        c.putImageData(d, 0, 0)
      })
      Promise.all([
        toUrl(wd), toUrl(wdark),
        make(geo.w, geo.h, (c) => { c.drawImage(clean, 0, 0); c.globalCompositeOperation = 'destination-out'; path(c, sh.ring); c.fill() }),
        leaf(sh.leafL, sh.x0, false, geo.handleL, -1), leaf(sh.leafR, sh.cx, false, geo.handleR, 1), leaf(sh.leafL, sh.x0, true, geo.handleL, -1), leaf(sh.leafR, sh.cx, true, geo.handleR, 1),
        brass(geo.handleL, false), brass(geo.handleR, false), brass(geo.handleL, true), brass(geo.handleR, true),
      ]).then(([wr, wrDark, frame, left, right, leftDark, rightDark, hl, hr, hlDark, hrDark]) => !dead && setTex({ wr, wrDark, wbox, frame, left, right, leftDark, rightDark, hl, hr, hlDark, hrDark }))
    }
    im.src = src
    return () => { dead = true }
  }, [src, geo])
  return tex
}

/** Re-samples a photo at up to 2x with a gentle unsharp mask, so edges stay crisp when it is shown large or on dense screens. */
function useSharpened(src?: string) {
  const [out, setOut] = useState<string | undefined>(undefined)
  useEffect(() => {
    setOut(undefined)
    if (!src) return
    let dead = false
    const im = new Image()
    im.onload = () => {
      const k = Math.min(2, 3000 / im.naturalWidth)
      const w = Math.round(im.naturalWidth * k), h = Math.round(im.naturalHeight * k)
      const a = document.createElement('canvas'); a.width = w; a.height = h
      const ac = a.getContext('2d')!; ac.imageSmoothingQuality = 'high'; ac.drawImage(im, 0, 0, w, h)
      const b = document.createElement('canvas'); b.width = w; b.height = h
      const bc = b.getContext('2d')!; bc.filter = 'blur(1.6px)'; bc.drawImage(a, 0, 0)
      const A = ac.getImageData(0, 0, w, h), B = bc.getImageData(0, 0, w, h).data, d = A.data, amt = 0.85
      for (let i = 0; i < d.length; i += 4) for (let c = 0; c < 3; c++) d[i + c] = d[i + c] + amt * (d[i + c] - B[i + c])
      ac.putImageData(A, 0, 0)
      a.toBlob((bl) => !dead && bl && setOut(URL.createObjectURL(bl)), 'image/jpeg', 0.92)
    }
    im.src = src
    return () => { dead = true }
  }, [src])
  return out
}

/** Clumps and powder of snow that fall off the door, garland and ledges when the door moves. */
function useShed() {
  const cv = useRef<HTMLCanvasElement>(null)
  const parts = useRef<{ x: number; y: number; vx: number; vy: number; r: number; a: number; life: number; powder: boolean }[]>([])
  const raf = useRef(0)
  const sprite = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 64
    const x = c.getContext('2d')!, g = x.createRadialGradient(32, 32, 0, 32, 32, 32)
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(236,244,255,.85)'); g.addColorStop(1, 'rgba(226,238,255,0)')
    x.fillStyle = g; x.fillRect(0, 0, 64, 64); return c
  }, [])

  const loop = () => {
    const c = cv.current; if (!c) return
    const ctx = c.getContext('2d')!, dpr = Math.min(devicePixelRatio || 1, 2)
    if (c.width !== c.clientWidth * dpr) { c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr }
    let last = performance.now()
    const frame = (t: number) => {
      const dt = Math.min(0.04, (t - last) / 1000); last = t
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, c.clientWidth, c.clientHeight)
      const ps = parts.current
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]
        p.life -= dt
        if (p.life <= 0 || p.y > c.clientHeight + 40) { ps.splice(i, 1); continue }
        p.vy += (p.powder ? 380 : 1500) * dt; p.vx *= 1 - dt * (p.powder ? 1.6 : 0.4)
        p.x += p.vx * dt; p.y += p.vy * dt
        ctx.globalAlpha = Math.min(1, p.life * 1.6) * p.a
        ctx.drawImage(sprite, p.x - p.r, p.y - p.r, p.r * 2, p.r * 2)
      }
      ctx.globalAlpha = 1
      raf.current = ps.length ? requestAnimationFrame(frame) : 0
    }
    raf.current = requestAnimationFrame(frame)
  }

  /** Drop snow from the door area `r` (screen px): some from the top, more from the garland columns on both sides. */
  const burst = (n: number, r: DOMRect) => {
    for (let i = 0; i < n; i++) {
      const top = Math.random() < 0.4
      const side = Math.random() < 0.5 ? -1 : 1
      const x = top ? r.left + Math.random() * r.width : side < 0 ? r.left - r.width * (0.02 + Math.random() * 0.16) : r.right + r.width * (0.02 + Math.random() * 0.16)
      const y = top ? r.top + Math.random() * r.height * 0.18 : r.top + Math.random() * r.height * 0.75
      const powder = Math.random() < 0.9
      parts.current.push({ x, y, vx: (Math.random() - 0.5) * 70 + (top ? 0 : side * 25), vy: Math.random() * 60, r: powder ? 1.4 + Math.random() * 2.6 : 4 + Math.random() * 6, a: powder ? 0.6 : 0.8, life: 1.2 + Math.random() * 1.4, powder })
    }
    if (!raf.current) loop()
  }
  return { cv, burst }
}

/** Wide screens fill (cover, up to 40% crop). Tall phones show the whole photo (contain) and the extra space is a mirrored continuation of the wall/snow. */
function useFit(ar: number): 'cover' | 'contain' {
  const calc = () => { const A = innerWidth / innerHeight; const crop = A > ar ? 1 - ar / A : 1 - A / ar; return crop <= (ar < 1 && A < ar ? 0.04 : 0.4) ? 'cover' : 'contain' }
  const [fit, setFit] = useState<'cover' | 'contain'>(calc)
  useEffect(() => { const f = () => setFit(calc()); f(); addEventListener('resize', f); return () => removeEventListener('resize', f) }, [ar])
  return fit
}

export default function Door({ onOpen }: { onOpen: () => void }) {
  const portrait = usePortrait()
  const g = useMemo(() => build(portrait ? PORT : LAND), [portrait])
  const img = portrait ? portImg : landImg
  const villRaw = villageUrl(portrait)
  const vill = useSharpened(villRaw)
  const tex = useDoorTextures(img, portrait ? PORT : LAND)
  const shed = useShed()
  const fit = useFit(g.aspect)

  const root = useRef<HTMLDivElement>(null)
  const box = useRef<HTMLDivElement>(null)
  const villRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const panels = useRef<HTMLDivElement>(null)
  const [line, setLine] = useState(0) // 0 none, 1 line1, 2 line1+2, 3 hidden
  const [ready, setReady] = useState(false) // button visible
  const [opening, setOpening] = useState(false)
  const [rs, setRs] = useState(0) // rendered px per source px
  const [snd, setSnd] = useState(() => sfx.running && !sfx.muted)
    const returning = store.get('opened', false)

  // Wind outside. Starts as soon as the browser allows sound (first tap); the speaker button also unlocks it.
  useEffect(() => {
    const sync = () => { if (sfx.running) sfx.startWind(); setSnd(sfx.running && !sfx.muted) }
    sync()
    const off = sfx.subscribe(sync)
    const iv = setInterval(sync, 700)
    return () => { off(); clearInterval(iv) }
  }, [])

  // Leaf thickness follows the rendered size.
  useEffect(() => {
    const set = () => {
      if (!box.current || !panels.current) return
      const r = box.current.offsetWidth / (portrait ? PORT : LAND).w
      setRs(r)
      panels.current.style.setProperty('--depth', `${((portrait ? PORT : LAND).hw * r * THICK).toFixed(1)}px`)
      // the leaves hang deeper inside the doorway; scale compensates the perspective so they still fill the opening when shut
      const rec = (portrait ? PORT : LAND).hw * r * RECESS
      gsap.set(panels.current.querySelector('.door-recess'), { z: -rec, scale: (PERSP + rec) / PERSP })
    }
    set(); addEventListener('resize', set); return () => removeEventListener('resize', set)
  }, [g, fit, portrait])

  // Intro: village fades in, we run to the house, the door appears, the button follows.
  useEffect(() => {
    if (villRaw && !vill) return // wait for the sharpened photo
    const k = reducedMotion() ? 0.3 : 1
    const timers: ReturnType<typeof setTimeout>[] = []
    const at = (ms: number, f: () => void) => timers.push(setTimeout(f, ms * k))
    const tl = gsap.timeline()
    const v = vill ? VILL[portrait ? 'port' : 'land'] : null
    if (v && villRef.current && sceneRef.current && box.current && !reducedMotion()) {
      // One continuous camera move: both photos are scaled by the same exponential zoom, so there is no stop between
      // "walking down the street" and "arriving at the door". The close-up fades in while it is still smaller than the
      // screen (soft edges) and grows to full size exactly as the zoom ends. No big upscaling of either photo.
      const W = innerWidth, H = innerHeight
      const arV = portrait ? 9 / 16 : 16 / 9
      const Wv = Math.max(W, H * arV), Hv = Wv / arV
      const Wd = fit === 'cover' ? Math.max(W, H * g.aspect) : Math.min(W, H * g.aspect), Hd = Wd / g.aspect
      const c = (v.w * Wv) / (g.dw * Wd) // close-up scale at which its door matches the village door
      const lnEnd = Math.log(1 / c)
      const dBoxX = (g.ox - 0.5) * Wd, dBoxY = (g.oy - 0.5) * Hd
      const sm = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t) }
      const proxy = { p: 0 }
      const apply = () => {
        const p = proxy.p, G = Math.exp(p * lnEnd)
        const ox = -(v.x - 0.5) * Wv * G * (1 - p), oy = -(v.y - 0.5) * Hv * G * (1 - p)
        // village: the door drifts to the middle of the screen
        gsap.set(villRef.current, { scale: G, x: -(v.x - 0.5) * Wv * G * p, y: -(v.y - 0.5) * Hv * G * p, opacity: 1 - sm(0.86, 1, p) })
        // close-up: keeps its door exactly over the village door, then settles to its natural framing
        const w = sm(0.55, 0.92, p)
        gsap.set(box.current, { scale: G * c, x: (1 - w) * (-ox - dBoxX), y: (1 - w) * (-oy - dBoxY) })
        box.current!.style.setProperty('--fr', `${50 + 105 * sm(0.78, 1, p)}%`)
        gsap.set(sceneRef.current, { opacity: sm(1.5, 2.3, G) })
      }
      gsap.set(sceneRef.current, { opacity: 0 })
      gsap.set(villRef.current, { transformOrigin: '50% 50%' })
      apply()
      box.current.classList.add('feather')
      tl.fromTo(villRef.current, { opacity: 0 }, { opacity: 1, duration: 2.4, ease: 'power1.inOut' }, 0)
      at(900, () => setLine(1)); at(3000, () => setLine(2)); at(4600, () => setLine(3))
      tl.to(proxy, { p: 1, duration: 5.6, ease: 'sine.inOut', onUpdate: apply, onComplete: () => { box.current?.classList.remove('feather'); gsap.set(villRef.current, { display: 'none' }) } }, 4.6)
        .to(villRef.current.querySelector('img'), { y: -5, duration: 0.27, yoyo: true, repeat: 20, ease: 'sine.inOut' }, 4.6)
      at(10400, () => setReady(true))
    } else {
      if (sceneRef.current) gsap.to(sceneRef.current, { opacity: 1, duration: 2, delay: 5.6 * k })
      at(800, () => setLine(1)); at(2900, () => setLine(2)); at(5600, () => setLine(3)); at(7600, () => setReady(true))
    }
    return () => { timers.forEach(clearTimeout); tl.kill() }
  }, [vill, villRaw, portrait, fit])

  const finish = () => { store.set('opened', true); sfx.windLevel(0, 1.5); onOpen() }

  const open = () => {
    if (opening) return
    setOpening(true)
    const q = (s: string) => root.current!.querySelectorAll(s)
    if (reducedMotion()) { gsap.to(root.current, { opacity: 0, duration: 0.8, onComplete: finish }); return }
    const dust = (n: number) => panels.current && shed.burst(n, panels.current.getBoundingClientRect())
    const rumble = (tl: gsap.core.Timeline, at: number, amp: number, steps: number) => {
      for (let i = 0; i < steps; i++) tl.to(box.current, { x: (Math.random() - 0.5) * amp, y: (Math.random() - 0.5) * amp, duration: 0.045, ease: 'none' }, at + i * 0.045)
      tl.to(box.current, { x: 0, y: 0, duration: 0.08 }, at + steps * 0.045)
    }
    sfx.unlock(); sfx.startWind()
    const tl = gsap.timeline({ onComplete: finish })
    // We stay where we are. The leaves open in place and STAY open, then we run in between them.
    tl.to(q('.door-cta'), { opacity: 0, y: 10, duration: 0.5 }, 0)
    // 1. a low rumble: the snow on the garland starts to slide
    rumble(tl, 0.4, 3, 22)
    tl.add(() => sfx.creak(1.5, 62, 96, 0.2), 0.9).add(() => sfx.windLevel(0.5, 1), 1.0)
    tl.add(() => dust(12), 0.6).add(() => dust(14), 1.2)
      .fromTo(q('.door-light'), { opacity: 0 }, { opacity: 0.8, duration: 2, ease: 'power1.in' }, 1.2)
      .fromTo(q('.door-glow'), { opacity: 0 }, { opacity: 0.7, duration: 2.4, ease: 'power1.in' }, 1.2)
    // 2. The wreath hangs on the LEFT leaf and overhangs the seam, so the plain RIGHT leaf must swing away first.
    //    Only then does the left leaf (with the wreath) follow; this way the wreath never swings behind the other leaf.
    tl.to(q('.door-panel-r'), { rotateY: -12, duration: 1.2, ease: 'power2.in' }, 0.9)
      .add(() => dust(22), 2.0)
      .add(() => { sfx.creak(1.9, 88, 150, 0.26); sfx.windLevel(0.75, 1.2) }, 2.1)
      .to(q('.door-panel-r'), { rotateY: -84, duration: 1.7, ease: 'power1.inOut' }, 2.1)
      .to(q('.door-panel-r .door-shade'), { opacity: 0.55, duration: 1.8, ease: 'power1.inOut' }, 2.1)
      .to(q('.door-panel-r'), { rotateY: -79, duration: 0.45, ease: 'power2.out' }, 3.8)
      .add(() => { dust(16); sfx.thud(0.6) }, 3.85)
      // the left leaf follows once the right one is well out of the way
      .add(() => { sfx.creak(1.7, 80, 140, 0.24); dust(26) }, 3.3)
      .to(q('.door-panel-l'), { rotateY: 84, duration: 1.7, ease: 'power1.inOut' }, 3.3)
      .to(q('.door-panel-l .door-shade'), { opacity: 0.55, duration: 1.8, ease: 'power1.inOut' }, 3.3)
      .to(q('.door-panel-l'), { rotateY: 79, duration: 0.45, ease: 'power2.out' }, 5.0)
    rumble(tl, 3.8, 6, 6)
    rumble(tl, 5.0, 8, 7)
    tl.add(() => { dust(20); sfx.thud() }, 5.05)
    // 3. a beat to look at the open door, then we run in between the leaves toward the light
    tl.add(() => sfx.whoosh(2.4), 5.9).add(() => sfx.windLevel(0.2, 2.5), 7.6)
      .to(box.current, { scale: 14, duration: 2.6, ease: 'power3.in' }, 5.8)
      .set(q('.door-img, .door-panels, .door-scrim, .door-glow'), { visibility: 'hidden' }, 8.2)
      .to(q('.door-flash'), { opacity: 0.85, duration: 1.4, ease: 'power1.in' }, 7.4)
      .to(root.current, { opacity: 0, duration: 1.4 }, 8.2)
  }

  const geo = portrait ? PORT : LAND
  const sh = useMemo(() => pixelShapes(geo), [geo])
  const handle = (side: 'l' | 'r') => {
    if (!tex) return null
    const [hx, hy, hw, hh] = side === 'l' ? geo.handleL : geo.handleR
    const ox = side === 'l' ? sh.x0 : sh.cx
    const url = (dark: boolean) => (side === 'l' ? (dark ? tex.hlDark : tex.hl) : dark ? tex.hrDark : tex.hr)
    const hd = Math.max(6, geo.hw * rs * 0.085) // how far the handle stands off the wood
    const hn = Math.min(24, Math.round(hd / 0.8))
    return (
      <div className="hnd" style={{ left: `${((hx - ox) / sh.bw) * 100}%`, top: `${((hy - sh.y0) / sh.bh) * 100}%`, width: `${(hw / sh.bw) * 100}%`, height: `${(hh / sh.bh) * 100}%` }}>
        {/* one solid extruded object: slices 0.8px apart fuse into a continuous body, bright face on top */}
        {Array.from({ length: hn + 1 }, (_, k) => (
          <i key={k} className="slice" style={{ backgroundImage: `url(${k === hn ? url(false) : url(true)})`, transform: `translateZ(${(Math.max(rs, 0.4) * 0 + (k / hn) * hd + 1).toFixed(2)}px)` }} />
        ))}
      </div>
    )
  }
  /** The whole wreath, hung on the left leaf: a pillowy body of slices (back darker and slightly smaller), plus a soft contact shadow. */
  const wreath = () => {
    if (!tex) return null
    const [wx, wy, ww, wh] = tex.wbox
    const wdp = Math.max(10, geo.hw * rs * 0.085), n = Math.min(26, Math.round(wdp / 0.8))
    return (
      <div className="hnd" style={{ left: `${((wx - sh.x0) / sh.bw) * 100}%`, top: `${((wy - sh.y0) / sh.bh) * 100}%`, width: `${(ww / sh.bw) * 100}%`, height: `${(wh / sh.bh) * 100}%` }}>
        <i className="slice" style={{ backgroundImage: `url(${tex.wrDark})`, filter: 'brightness(0) blur(7px)', opacity: 0.5, transform: 'translate3d(7px, 10px, 0.5px)' }} />
        {Array.from({ length: n + 1 }, (_, k) => (
          <i key={k} className="slice" style={{ backgroundImage: `url(${k === n ? tex.wr : tex.wrDark})`, transform: `translateZ(${(1 + (k / n) * wdp).toFixed(2)}px) scale(${(0.9 + 0.1 * (k / n)).toFixed(3)})` }} />
        ))}
      </div>
    )
  }
  /** One solid slab: front face (photo), back face (dark), and a continuous rim around the outline. No stacked layers. */
  const leaf = (side: 'l' | 'r') => {
    const pts = (side === 'l' ? sh.leafL : sh.leafR).map(([x, y]) => [(x - (side === 'l' ? sh.x0 : sh.cx)) * rs, (y - sh.y0) * rs] as [number, number])
    const D = sh.bw * rs * THICK
    const rim = rs
      ? pts.map((p, i) => {
          const q = pts[(i + 1) % pts.length], dx = q[0] - p[0], dy = q[1] - p[1], len = Math.hypot(dx, dy)
          if (len < 0.8) return null
          const ang = (Math.atan2(dy, dx) * 180) / Math.PI
          const lit = 0.72 + 0.3 * Math.abs(Math.cos((ang * Math.PI) / 180)) // flatter edges (arch top) catch more light
          const c1 = `rgb(${Math.round(120 * lit)},${Math.round(72 * lit)},${Math.round(38 * lit)})`, c2 = `rgb(${Math.round(78 * lit)},${Math.round(46 * lit)},${Math.round(24 * lit)})`
          return <i key={i} className="rim" style={{ width: len + 0.6, height: D, background: `linear-gradient(${c1}, ${c2})`, transform: `translate3d(${p[0]}px,${p[1]}px,0) rotateZ(${ang}deg) rotateX(-90deg)` }} />
        })
      : null
    return (
      <div className={`door-panel door-panel-${side}`}>
        {tex && <i className="slice" style={{ backgroundImage: `url(${side === 'l' ? tex.leftDark : tex.rightDark})`, transform: `translateZ(${-D}px)` }} />}
        {tex && rim}
        {tex && <i className="slice" style={{ backgroundImage: `url(${side === 'l' ? tex.left : tex.right})` }} />}
        {tex && <i className="slice door-shade" style={{ backgroundImage: `url(${side === 'l' ? tex.leftDark : tex.rightDark})`, transform: 'translateZ(.6px)' }} />}
        {handle(side)}
        {side === 'l' && wreath()}
      </div>
    )
  }

  return (
    <div ref={root} className="door">
      <div className="door-sky" />

      {vill && (
        <div ref={villRef} className="door-vill door-cover" style={{ ['--ar' as string]: portrait ? 9 / 16 : 16 / 9 }}>
          <img src={vill} alt="" draggable={false} />
          <VillageLife portrait={portrait} />
        </div>
      )}

      <div ref={sceneRef} className="door-scene">
        <div ref={box} className={`door-box ${fit}`} style={{ ['--ar' as string]: g.aspect, transformOrigin: g.origin }}>
          {fit === 'contain' && <><div className="mir mir-t" style={{ backgroundImage: `url(${img})` }} /><div className="mir mir-b" style={{ backgroundImage: `url(${img})` }} /></>}
          <div className="door-glow" />
          <div className="door-light" style={{ left: g.area.left, top: g.area.top, width: g.area.width, height: g.area.height, clipPath: g.lightClip }} />
          {tex && <img src={tex.frame} className="door-img" alt="" draggable={false} />}
          <DoorSnow geo={portrait ? PORT : LAND} fall={opening} />
          <div ref={panels} className="door-panels" style={{ left: g.area.left, top: g.area.top, width: g.area.width, height: g.area.height, clipPath: g.lightClip }}>
            <div className="door-recess">{leaf('l')}{leaf('r')}</div>
          </div>
        </div>
        <div className="door-scrim" />
      </div>

      <div className={`door-intro ${vill ? 'top' : ''}`}>
        <div className={`door-plate ${line >= 1 ? 'in' : ''}`}>
          <p className={`door-line1 reveal ${line === 1 || line === 2 ? 'in' : ''}`}>{content.door.line1}</p>
          <h1 className={`door-line2 ${line === 2 ? 'in' : ''}`}><span className="mask-line"><span>{content.door.line2}</span></span></h1>
          <div className="door-orn bot" aria-hidden><i /><b>✦</b><i /></div>
        </div>
      </div>
      {!opening && <div className="door-breath" aria-hidden><i /><i /><i /></div>}

      <SnowParticles density={vill ? 1.4 : 1.1} />
      <canvas ref={shed.cv} className="door-shed" />
      <button className="door-sound" aria-label={snd ? 'Tắt âm thanh' : 'Bật âm thanh'} onClick={() => { if (!sfx.running) { sfx.setMuted(false); sfx.unlock(); sfx.startWind() } else sfx.setMuted(!sfx.muted); setSnd(sfx.running && !sfx.muted) }}>
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9v6h4l5 4V5L8 9H4z" />{snd ? <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" /> : <path d="M17 9l5 6M22 9l-5 6" />}</svg>
      </button>
      {returning && !opening && <button className="door-skip" onClick={finish}>{ui.skip}</button>}

      <div className={`door-cta reveal ${ready ? 'in' : ''}`}>
        <button className="btn-gold" onClick={open} disabled={opening || !ready}>{content.door.button}</button>
      </div>
      <div className="door-flash" />
    </div>
  )
}
