/**
 * Phong bì cổ dựng bằng WebGL (three.js): giấy có vân nổi và vết ố (texture sinh bằng mã), phong bì là khối có độ dày,
 * nắp tam giác có bản lề thật, con dấu sáp ép khối bóng, ánh sáng ấm, bóng đổ mềm. Chỉ tải khi mở một món quà (import động).
 * Điều khiển từ GiftLetter: góc quay, tiến độ giữ con dấu, giai đoạn mở thư; trả về toạ độ màn hình của con dấu và tờ thư.
 */
import type * as T from 'three'
import gsap from 'gsap'
import { rng } from '../lib/sketch'

export type EnvStage = 'closed' | 'cracked' | 'opening' | 'out' | 'read'
export type Box = { x: number; y: number; w: number; h: number }
export type EnvGL = {
  setRot(rxDeg: number, ryDeg: number): void
  setHold(p: number): void
  shake(): void
  stage(s: EnvStage): void
  sealRect(): Box | null
  letterRect(): { left: number; top: number; width: number; height: number } | null
  dispose(): void
}
export type EnvOpts = { host: HTMLElement; stamp: string; label: string; to: string; from: string }

const W = 4, H = 2.72, TH = 0.05, FLAP = H * 0.56, SEAL_R = 0.3
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/** Giấy cũ: nền ngả vàng, vết ố, vòng ố trà, đốm nâu, sợi giấy, hạt, mép cháy. Trả về ảnh màu và ảnh bump (độ nổi). */
function paper(w: number, h: number, seed: number, tone: [string, string, string], burn = 0.5) {
  const r = rng(seed)
  const c = document.createElement('canvas'); c.width = w; c.height = h
  const x = c.getContext('2d')!
  const g = x.createRadialGradient(w * 0.5, h * 0.48, 0, w * 0.5, h * 0.48, Math.max(w, h) * 0.65)
  g.addColorStop(0, tone[0]); g.addColorStop(0.6, tone[1]); g.addColorStop(1, tone[2]); x.fillStyle = g; x.fillRect(0, 0, w, h)
  for (let i = 0; i < 9; i++) { const cx = r() * w, cy = r() * h, rad = 70 + r() * 220, k = x.createRadialGradient(cx, cy, 0, cx, cy, rad); k.addColorStop(0, `rgba(120,76,28,${0.1 + r() * 0.16})`); k.addColorStop(1, 'rgba(120,76,28,0)'); x.fillStyle = k; x.fillRect(0, 0, w, h) }
  for (let i = 0; i < 2; i++) { const cx = w * (0.25 + r() * 0.5), cy = h * (0.25 + r() * 0.5), rad = 60 + r() * 70; x.strokeStyle = `rgba(118,74,26,${0.09 + r() * 0.06})`; x.lineWidth = 4; x.beginPath(); x.arc(cx, cy, rad, 0, 6.283); x.stroke() }
  for (let i = 0; i < 60; i++) { x.fillStyle = `rgba(96,56,20,${0.25 + r() * 0.3})`; x.beginPath(); x.arc(r() * w, r() * h, 1.2 + r() * 2.6, 0, 6.283); x.fill() }
  x.lineWidth = 1
  for (let i = 0; i < 1100; i++) { const px = r() * w, py = r() * h, a = r() * 6.283, l = 6 + r() * 22; x.strokeStyle = r() < 0.5 ? `rgba(255,248,225,${0.05 + r() * 0.07})` : `rgba(90,60,25,${0.04 + r() * 0.07})`; x.beginPath(); x.moveTo(px, py); x.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke() }
  const id = x.getImageData(0, 0, w, h), d = id.data
  for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 22; d[i] += n; d[i + 1] += n; d[i + 2] += n }
  x.putImageData(id, 0, 0)
  const e = x.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.34, w / 2, h / 2, Math.max(w, h) * 0.72); e.addColorStop(0, 'rgba(70,38,10,0)'); e.addColorStop(1, `rgba(70,38,10,${burn})`); x.fillStyle = e; x.fillRect(0, 0, w, h)
  // bump
  const b = document.createElement('canvas'); b.width = w; b.height = h
  const y = b.getContext('2d')!; y.fillStyle = '#808080'; y.fillRect(0, 0, w, h)
  const bd = y.getImageData(0, 0, w, h), q = bd.data
  for (let i = 0; i < q.length; i += 4) { const n = 128 + (r() - 0.5) * 70; q[i] = q[i + 1] = q[i + 2] = n }
  y.putImageData(bd, 0, 0)
  for (let i = 0; i < 700; i++) { const px = r() * w, py = r() * h, a = r() * 6.283, l = 8 + r() * 26; y.strokeStyle = r() < 0.5 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.12)'; y.beginPath(); y.moveTo(px, py); y.lineTo(px + Math.cos(a) * l, py + Math.sin(a) * l); y.stroke() }
  return { c, b, x, y }
}

const wob = (r: () => number, n: number) => Array.from({ length: n }, () => (r() - 0.5) * 3)
/** Khung mực kép run tay quanh mép. */
function inkFrame(x: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const r = rng(seed)
  for (const [ins, lw, al] of [[34, 4.5, 0.85], [54, 2.4, 0.55]] as const) {
    x.strokeStyle = `rgba(106,74,38,${al})`; x.lineWidth = lw; x.lineJoin = 'round'; x.beginPath()
    const pts: [number, number][] = []
    for (let t = 0; t <= 1; t += 0.02) pts.push([ins + t * (w - 2 * ins), ins])
    for (let t = 0; t <= 1; t += 0.02) pts.push([w - ins, ins + t * (h - 2 * ins)])
    for (let t = 0; t <= 1; t += 0.02) pts.push([w - ins - t * (w - 2 * ins), h - ins])
    for (let t = 0; t <= 1; t += 0.02) pts.push([ins, h - ins - t * (h - 2 * ins)])
    const j = wob(r, pts.length * 2)
    pts.forEach((p, i) => { const px = p[0] + j[i * 2], py = p[1] + j[i * 2 + 1]; if (i === 0) x.moveTo(px, py); else x.lineTo(px, py) })
    x.closePath(); x.stroke()
  }
}

function tex(THREE: typeof T, c: HTMLCanvasElement, color: boolean, aniso: number) {
  const t = new THREE.CanvasTexture(c); t.anisotropy = aniso; if (color) t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true; return t
}

export async function createEnvelopeGL(o: EnvOpts): Promise<EnvGL> {
  const THREE = await import('three')
  await Promise.all([
    document.fonts.load('400 100px Charm', `${o.to} ${o.from} ${o.label} Người gửi`),
    document.fonts.load('italic 700 100px "Playfair Display"', 'L♥H'),
    document.fonts.load('400 40px "Cormorant Garamond"', o.stamp),
  ].map((p) => p.catch(() => null)))

  const host = o.host
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1))
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.VSMShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15
  renderer.setClearColor(0x000000, 0)
  const cv = renderer.domElement; cv.style.display = 'block'; cv.style.width = '100%'; cv.style.height = '100%'
  host.appendChild(cv)
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy())

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 60)
  scene.add(new THREE.HemisphereLight(0xfff0d8, 0x4a3018, 1.05))
  const key = new THREE.DirectionalLight(0xffe0ac, 2.6); key.position.set(-2.6, 4.6, 5.2); key.castShadow = true
  key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0006; key.shadow.radius = 9; key.shadow.blurSamples = 16
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 16 })
  scene.add(key)
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.3 }))
  ground.rotation.x = -Math.PI / 2; ground.position.set(0, -H / 2 - 0.5, 0); ground.receiveShadow = true; scene.add(ground)

  const rig = new THREE.Group(); scene.add(rig)
  const mat = (map: T.Texture, bump: T.Texture, rough = 0.93, bs = 1.6) => new THREE.MeshStandardMaterial({ map, bumpMap: bump, bumpScale: bs, roughness: rough, metalness: 0 })

  // ---- hai mặt phong bì ----
  const FW = 1024, FH = Math.round(1024 * (H / W))
  const back = paper(FW, FH, 11, ['#e9d6a8', '#dcc48f', '#b1935d'])
  inkFrame(back.x, FW, FH, 21)
  const ap = [FW / 2, FH * 0.58] as const
  back.x.lineCap = 'round'
  for (const [x1, y1] of [[0, 0], [FW, 0], [0, FH], [FW, FH]] as const) {
    back.x.strokeStyle = 'rgba(90,58,26,.75)'; back.x.lineWidth = 3.4; back.x.beginPath(); back.x.moveTo(x1, y1); back.x.lineTo(ap[0], ap[1]); back.x.stroke()
    back.y.strokeStyle = 'rgba(0,0,0,.55)'; back.y.lineWidth = 7; back.y.beginPath(); back.y.moveTo(x1, y1); back.y.lineTo(ap[0], ap[1]); back.y.stroke()
    back.y.strokeStyle = 'rgba(255,255,255,.35)'; back.y.lineWidth = 3; back.y.beginPath(); back.y.moveTo(x1 + 5, y1 + 5); back.y.lineTo(ap[0] + 5, ap[1] + 5); back.y.stroke()
  }
  for (const tri of [[[0, 0], [ap[0], ap[1]], [0, FH]], [[FW, 0], [ap[0], ap[1]], [FW, FH]], [[0, FH], [ap[0], ap[1]], [FW, FH]]] as const) {
    back.x.fillStyle = 'rgba(86,52,18,.10)'; back.x.beginPath(); back.x.moveTo(tri[0][0], tri[0][1]); back.x.lineTo(tri[1][0], tri[1][1]); back.x.lineTo(tri[2][0], tri[2][1]); back.x.closePath(); back.x.fill()
  }

  const front = paper(FW, FH, 12, ['#ead8ab', '#dec792', '#b4965f'])
  inkFrame(front.x, FW, FH, 22)
  {
    const x = front.x
    x.textAlign = 'center'; x.fillStyle = '#6a4a26'; x.font = `italic 400 44px Charm`; x.fillText(o.label, FW / 2, FH * 0.36)
    x.fillStyle = '#33200f'; x.font = `400 150px Charm`; x.shadowColor = 'rgba(51,32,15,.45)'; x.shadowBlur = 2; x.fillText(o.to, FW / 2, FH * 0.56); x.shadowBlur = 0
    x.strokeStyle = 'rgba(106,74,38,.85)'; x.lineWidth = 3; x.beginPath()
    for (let t = 0; t <= 1; t += 0.01) { const px = FW * 0.25 + t * FW * 0.5, py = FH * 0.64 + Math.sin(t * 18) * 6 * (1 - Math.abs(t - 0.5) * 1.4); if (t === 0) x.moveTo(px, py); else x.lineTo(px, py) }
    x.stroke()
    x.textAlign = 'left'; x.fillStyle = '#6a4a26'; x.font = `italic 400 36px Charm`; x.fillText('Người gửi', 80, FH * 0.84)
    x.fillStyle = '#33200f'; x.font = `400 76px Charm`; x.fillText(o.from, 80, FH * 0.93)
    x.textAlign = 'left'; x.fillStyle = '#6a4a26'; x.font = `italic 400 36px Charm`; x.fillText('Thư tay', 80, FH * 0.17)
    // tem + dấu bưu điện
    const sx = FW - 230, sy = 70
    x.save(); x.translate(sx + 70, sy + 85); x.rotate(0.05); x.fillStyle = '#efe0b6'; x.fillRect(-70, -85, 140, 170); x.setLineDash([7, 5]); x.strokeStyle = '#8a2a22'; x.lineWidth = 3; x.strokeRect(-70, -85, 140, 170); x.setLineDash([])
    x.strokeRect(-54, -69, 108, 138); x.fillStyle = 'rgba(58,90,58,.9)'; x.beginPath(); x.moveTo(0, -48); x.lineTo(-30, 18); x.lineTo(-12, 18); x.lineTo(-34, 50); x.lineTo(34, 50); x.lineTo(12, 18); x.lineTo(30, 18); x.closePath(); x.fill(); x.fillStyle = '#b0392b'; x.beginPath(); x.arc(0, -52, 7, 0, 6.283); x.fill(); x.restore()
    x.save(); x.translate(sx - 70, sy + 80); x.rotate(-0.2); x.strokeStyle = 'rgba(58,74,106,.62)'; x.lineWidth = 3
    x.beginPath(); x.arc(0, 0, 80, 0, 6.283); x.stroke(); x.beginPath(); x.arc(0, 0, 66, 0, 6.283); x.stroke()
    x.fillStyle = 'rgba(58,74,106,.7)'; x.textAlign = 'center'; x.font = `700 40px "Cormorant Garamond"`; x.fillText(o.stamp, 0, 14)
    for (const dy of [-96, -80, -64]) { x.beginPath(); for (let t = -1; t <= 1; t += 0.05) { const px = 90 + t * 130, py = dy + Math.sin(t * 9) * 6; if (t === -1) x.moveTo(px, py); else x.lineTo(px, py) } x.stroke() }
    x.restore()
  }

  const edgeC = document.createElement('canvas'); edgeC.width = edgeC.height = 64; { const x = edgeC.getContext('2d')!; const g = x.createLinearGradient(0, 0, 0, 64); g.addColorStop(0, '#cdb888'); g.addColorStop(1, '#9d8556'); x.fillStyle = g; x.fillRect(0, 0, 64, 64) }
  const edgeM = new THREE.MeshStandardMaterial({ map: tex(THREE, edgeC, true, 1), roughness: 1 })
  const backM = mat(tex(THREE, back.c, true, aniso), tex(THREE, back.b, false, aniso))
  const frontM = mat(tex(THREE, front.c, true, aniso), tex(THREE, front.b, false, aniso))
  const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, TH), [edgeM, edgeM, edgeM, edgeM, backM, frontM])
  body.castShadow = true; body.receiveShadow = true; rig.add(body)

  // ---- nắp tam giác có bản lề ở mép trên ----
  const shape = new THREE.Shape()
  shape.moveTo(-W / 2, 0); shape.lineTo(W / 2, 0); shape.lineTo(W / 2, -FLAP * 0.16); shape.lineTo(0, -FLAP); shape.lineTo(-W / 2, -FLAP * 0.16); shape.closePath()
  const fg = new THREE.ShapeGeometry(shape)
  { const p = fg.attributes.position, uv = fg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, 1 + p.getY(i) / FLAP) }
  const flapOut = paper(FW, Math.round(FW * (FLAP / W)), 13, ['#ebd9ac', '#dfc893', '#b69860'], 0.35)
  flapOut.x.strokeStyle = 'rgba(93,61,28,.9)'; flapOut.x.lineWidth = 5; flapOut.x.beginPath()
  { const fh = flapOut.c.height; flapOut.x.moveTo(0, fh * 0.16); flapOut.x.lineTo(FW / 2, fh - 3); flapOut.x.lineTo(FW, fh * 0.16); flapOut.x.stroke() }
  const lining = paper(FW, Math.round(FW * (FLAP / W)), 14, ['#efe2bd', '#e3d1a5', '#c9b283'], 0.2)
  lining.x.strokeStyle = 'rgba(110,70,30,.18)'; lining.x.lineWidth = 1.6
  for (let i = -FW; i < FW * 2; i += 9) { lining.x.beginPath(); lining.x.moveTo(i, 0); lining.x.lineTo(i + lining.c.height, lining.c.height); lining.x.stroke() }
  const flap = new THREE.Group(); flap.position.set(0, H / 2, TH / 2 + 0.004); rig.add(flap)
  const fOut = new THREE.Mesh(fg, mat(tex(THREE, flapOut.c, true, aniso), tex(THREE, flapOut.b, false, aniso))); fOut.castShadow = true; fOut.receiveShadow = true
  const fIn = new THREE.Mesh(fg, mat(tex(THREE, lining.c, true, aniso), tex(THREE, lining.b, false, aniso))); fIn.rotation.y = Math.PI; fIn.position.z = -0.006; fIn.receiveShadow = true
  flap.add(fOut, fIn)

  // ---- con dấu sáp ép khối ----
  const sh = new THREE.Shape()
  for (let i = 0; i <= 72; i++) { const a = (i / 72) * Math.PI * 2, rr = SEAL_R * (1 + 0.06 * Math.sin(5 * a + 1) + 0.045 * Math.sin(9 * a + 2) + 0.03 * Math.sin(13 * a)); const px = Math.cos(a) * rr, py = Math.sin(a) * rr; if (i === 0) sh.moveTo(px, py); else sh.lineTo(px, py) }
  const sg = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.035, bevelSize: 0.03, bevelSegments: 5, curveSegments: 1 })
  { const p = sg.attributes.position, uv = sg.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / (SEAL_R * 2.2) + 0.5, p.getY(i) / (SEAL_R * 2.2) + 0.5) }
  const sb = document.createElement('canvas'); sb.width = sb.height = 256
  { const x = sb.getContext('2d')!; x.fillStyle = '#787878'; x.fillRect(0, 0, 256, 256); x.strokeStyle = '#d8d8d8'; x.lineWidth = 16; x.beginPath(); x.arc(128, 128, 92, 0, 6.283); x.stroke(); x.fillStyle = '#5a5a5a'; x.beginPath(); x.arc(128, 128, 82, 0, 6.283); x.fill()
    x.fillStyle = '#242424'; x.textAlign = 'center'; x.font = `italic 700 84px "Playfair Display"`; x.fillText(o.stamp ? 'L♥H' : 'L♥H', 128, 156) }
  const sealM = new THREE.MeshPhysicalMaterial({ color: 0x8e1219, roughness: 0.3, metalness: 0.05, clearcoat: 1, clearcoatRoughness: 0.18, bumpMap: tex(THREE, sb, false, 4), bumpScale: 2.4 })
  const seal = new THREE.Mesh(sg, sealM); seal.castShadow = true; seal.position.set(0, -FLAP + 0.02, 0.012); flap.add(seal)
  const kc = document.createElement('canvas'); kc.width = kc.height = 256
  { const x = kc.getContext('2d')!; x.strokeStyle = '#1a0305'; x.lineWidth = 5; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(140, 10); x.lineTo(122, 80); x.lineTo(150, 130); x.lineTo(124, 190); x.lineTo(136, 246); x.moveTo(12, 130); x.lineTo(90, 140); x.lineTo(130, 120); x.lineTo(190, 146); x.lineTo(244, 124); x.moveTo(122, 80); x.lineTo(70, 56); x.moveTo(150, 130); x.lineTo(200, 100); x.stroke() }
  const cracks = new THREE.Mesh(new THREE.PlaneGeometry(SEAL_R * 2.1, SEAL_R * 2.1), new THREE.MeshBasicMaterial({ map: tex(THREE, kc, true, 1), transparent: true, opacity: 0, depthWrite: false }))
  cracks.position.z = 0.12; seal.add(cracks)
  const stainC = document.createElement('canvas'); stainC.width = stainC.height = 128
  { const x = stainC.getContext('2d')!; const g = x.createRadialGradient(64, 64, 0, 64, 64, 64); g.addColorStop(0, 'rgba(120,18,24,.6)'); g.addColorStop(1, 'rgba(120,18,24,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128) }
  const stain = new THREE.Mesh(new THREE.PlaneGeometry(SEAL_R * 3.4, SEAL_R * 3.4), new THREE.MeshBasicMaterial({ map: tex(THREE, stainC, true, 1), transparent: true, opacity: 0, depthWrite: false }))
  stain.position.set(0, -FLAP + 0.02, 0.008); flap.add(stain)

  // ---- tờ thư nằm giữa hai mặt, trượt ra qua miệng phong bì ----
  const lw = W * 0.88, lh = H * 0.94
  const lp = paper(900, Math.round(900 * (lh / lw)), 15, ['#f1e4bd', '#e6d3a4', '#c6ad7a'], 0.4)
  lp.x.strokeStyle = 'rgba(110,70,26,.2)'; lp.x.lineWidth = 3
  for (const f of [0.333, 0.666]) { lp.x.beginPath(); lp.x.moveTo(0, lp.c.height * f); lp.x.lineTo(900, lp.c.height * f); lp.x.stroke() }
  const letter = new THREE.Mesh(new THREE.PlaneGeometry(lw, lh), new THREE.MeshStandardMaterial({ map: tex(THREE, lp.c, true, aniso), bumpMap: tex(THREE, lp.b, false, aniso), bumpScale: 1.4, roughness: 0.95, side: THREE.DoubleSide }))
  letter.castShadow = true; letter.receiveShadow = true; rig.add(letter)

  // ---- mảnh sáp vỡ ----
  type Frag = { m: T.Mesh; v: T.Vector3; w: T.Vector3; t: number }
  const frags: Frag[] = []
  const fragGeo = new THREE.IcosahedronGeometry(1, 0)
  const tmp = new THREE.Vector3()
  function breakSeal() {
    seal.getWorldPosition(tmp)
    seal.visible = false; cracks.visible = false
    gsap.to(stain.material, { opacity: 1, duration: 0.5 })
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(fragGeo, sealM); const s = 0.03 + Math.random() * 0.06; m.scale.set(s, s * (0.6 + Math.random() * 0.5), s * 0.6)
      m.position.copy(tmp).add(new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, 0.05)); m.castShadow = true; scene.add(m)
      frags.push({ m, v: new THREE.Vector3((Math.random() - 0.5) * 2.2, 0.6 + Math.random() * 1.6, 0.4 + Math.random() * 1.6), w: new THREE.Vector3(Math.random() * 8, Math.random() * 8, Math.random() * 8), t: 0 })
    }
  }

  // ---- khung hình ----
  let alive = true, paused = false, last = performance.now(), raf = 0
  function resize() {
    const cw = Math.max(1, host.clientWidth), ch = Math.max(1, host.clientHeight)
    renderer.setSize(cw, ch, false); camera.aspect = cw / ch
    const targetPx = Math.min(560, cw * 0.84, ch * 0.88 / (H / W))
    const visW = (W * cw) / targetPx, z = visW / (2 * Math.tan((camera.fov * Math.PI) / 360) * camera.aspect)
    camera.position.set(0, 0, z); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix()
  }
  resize()
  const ro = new ResizeObserver(resize); ro.observe(host)
  const frame = (t: number) => {
    if (!alive) return
    raf = requestAnimationFrame(frame)
    if (paused) return
    const dt = Math.min(0.05, (t - last) / 1000); last = t
    for (let i = frags.length - 1; i >= 0; i--) {
      const f = frags[i]; f.t += dt; f.v.y -= 6 * dt; f.m.position.addScaledVector(f.v, dt); f.m.rotation.x += f.w.x * dt; f.m.rotation.y += f.w.y * dt; f.m.rotation.z += f.w.z * dt
      if (f.t > 1.7) { scene.remove(f.m); frags.splice(i, 1) } else if (f.t > 1.2) f.m.scale.multiplyScalar(0.94)
    }
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  const toPx = (v: T.Vector3): [number, number] => { const p = v.clone().project(camera); return [(p.x * 0.5 + 0.5) * host.clientWidth, (-p.y * 0.5 + 0.5) * host.clientHeight] }
  const hostMap = () => { const r = host.getBoundingClientRect(), k = r.width / Math.max(1, host.clientWidth); return { r, k } }
  const hold = { p: 0 }
  return {
    setRot(rx, ry) { rig.rotation.x = (-rx * Math.PI) / 180; rig.rotation.y = (ry * Math.PI) / 180 },
    setHold(p) { hold.p = p; (cracks.material as T.MeshBasicMaterial).opacity = clamp((p - 0.25) * 1.5, 0, 1); seal.scale.setScalar(1 + p * 0.08); seal.rotation.z = Math.sin(performance.now() / 40) * 0.015 * p },
    shake() { gsap.fromTo(seal.position, { x: -0.06 }, { x: 0, duration: 0.45, ease: 'elastic.out(1.4, 0.3)' }) },
    stage(s) {
      if (s === 'cracked') breakSeal()
      else if (s === 'opening') gsap.to(flap.rotation, { x: -Math.PI, duration: 1.05, ease: 'power2.inOut' })
      else if (s === 'out') gsap.to(letter.position, { y: H * 0.66, duration: 1.3, delay: 0.15, ease: 'power2.out' })
      else if (s === 'read') { letter.visible = false; window.setTimeout(() => { paused = true }, 1500) }
    },
    sealRect() {
      if (!seal.visible) return null
      const { r, k } = hostMap(); seal.getWorldPosition(tmp); const c = toPx(tmp)
      const e = tmp.clone().add(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(SEAL_R)); const ep = toPx(e)
      const rad = Math.hypot(ep[0] - c[0], ep[1] - c[1]) * k
      return { x: r.left + c[0] * k, y: r.top + c[1] * k, w: rad * 2, h: rad * 2 }
    },
    letterRect() {
      const { r, k } = hostMap(); let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) { const p = toPx(letter.localToWorld(new THREE.Vector3((sx * lw) / 2, (sy * lh) / 2, 0))); x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]) }
      return { left: r.left + x0 * k, top: r.top + y0 * k, width: (x1 - x0) * k, height: (y1 - y0) * k }
    },
    dispose() {
      alive = false; cancelAnimationFrame(raf); ro.disconnect()
      gsap.killTweensOf([flap.rotation, letter.position, seal.position, stain.material])
      scene.traverse((ob) => { const m = ob as T.Mesh; if (m.geometry) m.geometry.dispose(); const mm = m.material as T.Material | T.Material[] | undefined; (Array.isArray(mm) ? mm : mm ? [mm] : []).forEach((x) => { const mp = x as T.MeshStandardMaterial; mp.map?.dispose(); mp.bumpMap?.dispose(); x.dispose() }) })
      renderer.dispose(); cv.remove()
    },
  }
}
