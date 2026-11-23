// Chụp các cảnh chính ở hai cỡ màn hình để phát hiện lỗi hiển thị sau mỗi thay đổi lớn.
// Chạy: npx vite --host --port 5173 &  rồi  NODE_PATH=$(npm root -g) node tools/smoke/shots.cjs <thư mục ra> [địa chỉ]
const { chromium } = require('playwright')
const OUT = process.argv[2] || '.', BASE = process.argv[3] || 'http://localhost:5173'
const SCENES = [['box', 0.05], ['tree', 1.95], ['cats', 4.45], ['snow', 5.95]]
;(async () => {
  const b = await chromium.launch()
  for (const [w, h, tag, touch] of [[1440, 900, 'd', false], [390, 844, 'm', true]]) {
    const c = await b.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch })
    await c.addInitScript(() => { try { localStorage.setItem('olcw:unlocked', 'true'); localStorage.setItem('olcw:opened', 'true') } catch (e) {} })
    const p = await c.newPage(); const errs = []
    p.on('pageerror', (e) => errs.push(String(e))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 140)) })
    await p.goto(BASE + '/?h=22'); await p.waitForTimeout(1500)
    await p.getByText('Bỏ qua').first().click({ timeout: 8000 }).catch(() => {})
    await p.waitForTimeout(2500)
    for (const [name, y] of SCENES) {
      await p.evaluate((y) => window.scrollTo({ top: y * innerHeight, behavior: 'instant' }), y)
      await p.waitForTimeout(2500)
      await p.screenshot({ path: `${OUT}/smoke-${tag}-${name}.png` })
    }
    console.log(tag, errs.length ? errs.slice(0, 4) : 'không có lỗi console')
    await c.close()
  }
  await b.close()
})()
