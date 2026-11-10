// ====== Cấu hình: sửa tên ở đây ======
const NAMES = 'chúng mình';
document.getElementById('names').textContent = NAMES;

// ====== Đếm ngược tới Giáng sinh ======
const cd = document.getElementById('countdown');
function tick() {
  const now = new Date();
  let target = new Date(now.getFullYear(), 11, 25);
  if (now > target) target = new Date(now.getFullYear() + 1, 11, 25);
  const diff = target - now;
  const d = Math.floor(diff / 864e5), h = Math.floor(diff / 36e5) % 24,
        m = Math.floor(diff / 6e4) % 60, s = Math.floor(diff / 1e3) % 60;
  const box = (v, l) => `<div><b>${v}</b><span>${l}</span></div>`;
  cd.innerHTML = box(d, 'ngày') + box(h, 'giờ') + box(m, 'phút') + box(s, 'giây');
}
tick(); setInterval(tick, 1000);

// ====== Danh sách điều ước (lưu localStorage) ======
const KEY = 'xmas-wishes';
let wishes;
try { wishes = JSON.parse(localStorage.getItem(KEY)); } catch { wishes = null; }
if (!Array.isArray(wishes)) wishes = [
  { t: 'Cùng ngắm đèn Noel', d: false },
  { t: 'Trao nhau quà bất ngờ', d: false },
  { t: 'Chụp ảnh bên cây thông', d: false },
];
const list = document.getElementById('wishlist');
function save() { try { localStorage.setItem(KEY, JSON.stringify(wishes)); } catch {} }
function render() {
  list.innerHTML = '';
  wishes.forEach((w, i) => {
    const li = document.createElement('li');
    if (w.d) li.className = 'done';
    const cb = document.createElement('input');
    cb.type = 'checkbox'; cb.checked = w.d;
    cb.onchange = () => { w.d = cb.checked; save(); render(); };
    const sp = document.createElement('span'); sp.textContent = w.t;
    const rm = document.createElement('button');
    rm.textContent = '✕'; rm.setAttribute('aria-label', 'Xoá');
    rm.onclick = () => { wishes.splice(i, 1); save(); render(); };
    li.append(cb, sp, rm); list.append(li);
  });
}
render();
document.getElementById('wishForm').addEventListener('submit', e => {
  e.preventDefault();
  const inp = document.getElementById('wishInput');
  const t = inp.value.trim();
  if (t) { wishes.push({ t, d: false }); save(); render(); inp.value = ''; }
});

// ====== Phong thư ======
const env = document.getElementById('envelope');
const toggle = () => {
  const open = env.classList.toggle('open');
  env.setAttribute('aria-expanded', open);
};
env.addEventListener('click', toggle);
env.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });

// ====== Tuyết rơi ======
const cv = document.getElementById('snow'), ctx = cv.getContext('2d');
let flakes = [];
function resize() {
  cv.width = innerWidth; cv.height = innerHeight;
  flakes = Array.from({ length: Math.min(150, Math.floor(innerWidth / 8)) }, () => ({
    x: Math.random() * cv.width, y: Math.random() * cv.height,
    r: Math.random() * 2.5 + .8, s: Math.random() * 1 + .4, o: Math.random() * 2 * Math.PI,
  }));
}
addEventListener('resize', resize); resize();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
function snow() {
  ctx.clearRect(0, 0, cv.width, cv.height);
  ctx.fillStyle = 'rgba(255,255,255,.85)';
  for (const f of flakes) {
    f.y += f.s; f.o += .01; f.x += Math.sin(f.o) * .4;
    if (f.y > cv.height) { f.y = -5; f.x = Math.random() * cv.width; }
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill();
  }
  if (!reduce) requestAnimationFrame(snow);
}
snow();
