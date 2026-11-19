/* ══════════════════════════════════════════════════════════════
   Roje Alasdair Evangelista — Security & Sound
   theme · router · filter · clock · cursor · scanline shader
   ══════════════════════════════════════════════════════════════ */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const VIEWS = ['home', 'work', 'label', 'info', 'contact', 'faq'];

/* ── THEME ──────────────────────────────────────────────────── */
const themeColors = {
  dark:  { bg:[0.031,0.035,0.031], fg:[0.918,0.906,0.871], sec:[0.659,0.941,0.353], amb:[0.914,0.663,0.420] },
  light: { bg:[0.929,0.918,0.878], fg:[0.086,0.086,0.059], sec:[0.247,0.420,0.071], amb:[0.588,0.306,0.110] },
  mono:  { bg:[0.0,0.0,0.0],       fg:[1.0,1.0,1.0],       sec:[0.5,0.5,0.5],       amb:[0.5,0.5,0.5] }
};
const currentTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';

function paintThemeButtons() {
  document.querySelectorAll('[data-theme-set]').forEach((b) =>
    b.classList.toggle('active', b.getAttribute('data-theme-set') === currentTheme()));
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', currentTheme() === 'light' ? '#edeae0' : currentTheme() === 'mono' ? '#000000' : '#080908');
}
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  try { localStorage.setItem('rae-theme', t); } catch (e) {}
  paintThemeButtons();
  if (window.__glThemeChanged) window.__glThemeChanged();
}
document.querySelectorAll('[data-theme-set]').forEach((b) =>
  b.addEventListener('click', () => setTheme(b.getAttribute('data-theme-set'))));
paintThemeButtons();

/* ── CLOCK (Manila) ─────────────────────────────────────────── */
const clockTargets = [document.getElementById('clock'), document.getElementById('clockFoot')];
function tickClock() {
  const now = new Date();
  const full = new Intl.DateTimeFormat('en-GB', {
    timeZone:'Asia/Manila', hour12:false,
    hour:'2-digit', minute:'2-digit', second:'2-digit'
  }).format(now);
  if (clockTargets[0]) clockTargets[0].textContent = full;
  if (clockTargets[1]) clockTargets[1].textContent = full.slice(0, 5);
}
tickClock();
setInterval(tickClock, 1000);

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());

/* ── CUSTOM CURSOR ──────────────────────────────────────────── */
if (matchMedia('(pointer: fine)').matches) {
  const dot = document.createElement('div');  dot.className = 'cursor-dot';
  const ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.append(ring, dot);
  document.body.classList.add('has-cursor');

  let mx = innerWidth / 2, my = innerHeight / 2;   // dot
  let rx = mx, ry = my;                            // ring (lagging)
  let tx = mx, ty = my;
  let visible = true;

  addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    if (!visible) { visible = true; dot.style.opacity = ring.style.opacity = '1'; }
    const interactive = e.target.closest('a, button, summary, input, textarea, select, label');
    document.body.classList.toggle('is-hover', !!interactive);
  });
  addEventListener('mouseleave', () => { visible = false; dot.style.opacity = ring.style.opacity = '0'; });
  addEventListener('mouseenter', () => { visible = true; dot.style.opacity = ring.style.opacity = '1'; });

  (function loop() {
    mx += (tx - mx) * 0.55; my += (ty - my) * 0.55;
    rx += (tx - rx) * 0.16; ry += (ty - ry) * 0.16;
    dot.style.left = mx + 'px';  dot.style.top = my + 'px';
    ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
}

/* ── MOBILE NAV ─────────────────────────────────────────────── */
const menuToggle = document.getElementById('menuToggle');
const nav = document.getElementById('nav');
function closeNav() {
  document.body.classList.remove('nav-open');
  if (menuToggle) {
    menuToggle.setAttribute('aria-expanded', 'false');
    const label = menuToggle.querySelector('b');
    if (label) label.textContent = 'Menu';
  }
}
if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    const open = document.body.classList.toggle('nav-open');
    menuToggle.setAttribute('aria-expanded', String(open));
    const label = menuToggle.querySelector('b');
    if (label) label.textContent = open ? 'Close' : 'Menu';
  });
}
document.querySelectorAll('.nav a').forEach((a) => a.addEventListener('click', closeNav));
addEventListener('keydown', (e) => { if (e.key === 'Escape') closeNav(); });
addEventListener('resize', () => { if (innerWidth > 900) closeNav(); });

/* ── ROUTER ─────────────────────────────────────────────────── */
const menuLinks = document.querySelectorAll('.nav a[data-view-link]');
const viewFromHash = () => {
  const h = location.hash.replace('#', '').trim().toLowerCase();
  return VIEWS.includes(h) ? h : 'home';
};

function swap(name) {
  document.querySelectorAll('.view.active').forEach((el) => el.classList.remove('active'));
  const next = document.getElementById('v-' + name);
  if (!next) return;

  // restart the entrance animation
  void next.offsetWidth;
  next.classList.add('active');

  window.scrollTo({ top:0, behavior:'auto' });
  closeNav();

  menuLinks.forEach((a) => {
    const on = a.getAttribute('data-view-link') === name;
    a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });

  const label = name === 'home' ? '' : name.charAt(0).toUpperCase() + name.slice(1) + ' — ';
  document.title = label + 'Roje Alasdair Evangelista — Security & Sound / Manila';
}
addEventListener('hashchange', () => swap(viewFromHash()));
swap(viewFromHash());

/* ── WORK FILTER ────────────────────────────────────────────── */
const filterBtns = document.querySelectorAll('.filter');
const projItems = document.querySelectorAll('#proj > li');

filterBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const f = btn.getAttribute('data-filter');
    filterBtns.forEach((b) => {
      const on = b === btn;
      b.classList.toggle('is-on', on);
      b.setAttribute('aria-pressed', String(on));
    });
    projItems.forEach((li) => {
      const show = f === 'all' || li.getAttribute('data-cat') === f;
      li.classList.toggle('is-hidden', !show);
    });
    const proj = document.getElementById('proj');
    if (proj) { proj.style.animation = 'none'; void proj.offsetWidth; proj.style.animation = 'rise .45s cubic-bezier(.2,.7,.2,1) both'; }
  });
});

/* ── FAQ — one open at a time ───────────────────────────────── */
const faqItems = document.querySelectorAll('.faq .qa');
faqItems.forEach((item) => {
  item.addEventListener('toggle', () => {
    if (!item.open) return;
    faqItems.forEach((other) => { if (other !== item) other.open = false; });
  });
});

/* ── WEBGL — SCANLINE / DUAL-LIGHT FIELD ────────────────────── */
(function () {
  const canvas = document.getElementById('gl');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias:true, alpha:false, powerPreference:'low-power' })
          || canvas.getContext('experimental-webgl');
  if (!gl) { document.body.classList.add('no-webgl'); return; }

  const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;

  const FS = `
    precision highp float;
    uniform vec2 uRes;
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec3 uBg, uFg, uSec, uAmb;

    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }

    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p){
      float v = 0.0, a = 0.5;
      for (int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.03; a *= 0.5; }
      return v;
    }

    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      float aspect = uRes.x / uRes.y;
      vec2 p = vec2((uv.x - 0.5) * aspect, uv.y - 0.5);

      /* two ambient glows — signal left, sound right */
      float g1 = exp(-length(p - vec2(-0.44, -0.26)) * 2.0);
      float g2 = exp(-length(p - vec2( 0.46, -0.30)) * 2.0);

      /* cursor light, tinted across the axis */
      vec2 m = vec2((uMouse.x - 0.5) * aspect, uMouse.y - 0.5);
      float gm = exp(-length(p - m) * 3.6);
      vec3 tint = mix(uSec, uAmb, smoothstep(0.12, 0.88, uv.x));

      /* barely-there grid, fading toward the top */
      vec2 g = fract(uv * vec2(aspect, 1.0) * 24.0);
      float line = smoothstep(0.985, 1.0, g.x) + smoothstep(0.985, 1.0, g.y);
      line *= smoothstep(0.1, 0.8, uv.y);

      /* slow haze */
      float haze = fbm(p * 2.1 + vec2(uTime * 0.012, -uTime * 0.009));

      /* travelling sweep band */
      float band = exp(-pow((fract(uv.y - uTime * 0.042) - 0.5) * 7.0, 2.0));

      float lightAmt = g1 * 0.085 + g2 * 0.075 + gm * 0.16
                     + line * 0.025 + haze * 0.032 + band * 0.022;

      vec3 col = mix(uBg, uFg, clamp(lightAmt, 0.0, 0.85));
      col += tint * (g1 * 0.015 + g2 * 0.013 + gm * 0.032 + band * 0.008);

      /* animated grain */
      float grain = hash(gl_FragCoord.xy * 0.5 + floor(uTime * 24.0));
      col += (grain - 0.5) * 0.028;

      /* vignette */
      float vig = smoothstep(1.3, 0.2, length(p));
      col *= 0.94 + 0.06 * vig;

      gl_FragColor = vec4(col, 1.0);
    }`;

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.warn(gl.getShaderInfoLog(s));
      return null;
    }
    return s;
  };

  const prog = gl.createProgram();
  const v = compile(gl.VERTEX_SHADER, VS);
  const f = compile(gl.FRAGMENT_SHADER, FS);
  if (!v || !f) { document.body.classList.add('no-webgl'); return; }
  gl.attachShader(prog, v);
  gl.attachShader(prog, f);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.warn(gl.getProgramInfoLog(prog));
    document.body.classList.add('no-webgl');
    return;
  }
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'p');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const U = {
    res: gl.getUniformLocation(prog, 'uRes'),
    time: gl.getUniformLocation(prog, 'uTime'),
    mouse: gl.getUniformLocation(prog, 'uMouse'),
    bg: gl.getUniformLocation(prog, 'uBg'),
    fg: gl.getUniformLocation(prog, 'uFg'),
    sec: gl.getUniformLocation(prog, 'uSec'),
    amb: gl.getUniformLocation(prog, 'uAmb')
  };

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 1.75);
    canvas.width = Math.floor(innerWidth * dpr);
    canvas.height = Math.floor(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  addEventListener('resize', resize);
  resize();

  const palette = () => themeColors[currentTheme()] || themeColors.dark;
  let mx = 0.3, my = 0.34, tmx = 0.3, tmy = 0.34;

  addEventListener('mousemove', (e) => {
    tmx = e.clientX / innerWidth;
    tmy = 1 - e.clientY / innerHeight;
  });
  addEventListener('touchmove', (e) => {
    if (e.touches[0]) {
      tmx = e.touches[0].clientX / innerWidth;
      tmy = 1 - e.touches[0].clientY / innerHeight;
    }
  }, { passive:true });

  function push() {
    const c = palette();
    gl.uniform3fv(U.bg, c.bg);
    gl.uniform3fv(U.fg, c.fg);
    gl.uniform3fv(U.sec, c.sec);
    gl.uniform3fv(U.amb, c.amb);
  }

  function drawStatic() {
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, 9.0);
    gl.uniform2f(U.mouse, 0.3, 0.34);
    push();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  window.__glThemeChanged = () => { if (reduceMotion) drawStatic(); };

  if (reduceMotion) {
    drawStatic();
    addEventListener('resize', () => { resize(); drawStatic(); });
    return;
  }

  const t0 = performance.now();
  let running = true;

  function frame(now) {
    if (!running) return;
    mx += (tmx - mx) * 0.05;
    my += (tmy - my) * 0.05;
    gl.uniform2f(U.res, canvas.width, canvas.height);
    gl.uniform1f(U.time, (now - t0) / 1000);
    gl.uniform2f(U.mouse, mx, my);
    push();
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      running = false;
    } else if (!running) {
      running = true;
      requestAnimationFrame(frame);
    }
  });
})();
