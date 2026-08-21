/* ══════════════════════════════════════════════════════
   Roje Alasdair Evangelista — Security & Sound
   theme switch · hash router (fade) · cursor · loader ·
   subtle monochrome WebGL grain field
   ══════════════════════════════════════════════════════ */

const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const VIEWS = ['home', 'work', 'label', 'info', 'contact', 'faq'];

/* ── THEME (dark · light · mono) ── */
const themeColors = {
  dark:  { bg:[0.039,0.043,0.039], fg:[0.941,0.937,0.913] },
  light: { bg:[0.925,0.922,0.890], fg:[0.078,0.078,0.059] },
  mono:  { bg:[0.0,0.0,0.0],       fg:[1.0,1.0,1.0] }
};
const currentTheme = () => document.documentElement.getAttribute('data-theme') || 'dark';
function paintThemeButtons() {
  document.querySelectorAll('[data-theme-set]').forEach((b) =>
    b.classList.toggle('active', b.getAttribute('data-theme-set') === currentTheme()));
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

/* ── CUSTOM CURSOR ── */
if (matchMedia('(pointer: fine)').matches) {
  const cur = document.createElement('div'); cur.className = 'cursor';
  document.body.append(cur);
  let cx = innerWidth / 2, cy = innerHeight / 2, tx = cx, ty = cy;
  addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
  (function loop() { cx += (tx - cx) * 0.25; cy += (ty - cy) * 0.25; cur.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
}

/* ── ROUTER (fade) ── */
const menuLinks = document.querySelectorAll('.nav a[data-view-link]');
let currentView = null;
const viewFromHash = () => {
  const h = location.hash.replace('#', '').trim();
  return VIEWS.includes(h) ? h : 'home';
};
function swap(name) {
  const cur = document.querySelector('.view.active');
  if (cur) cur.classList.remove('active');
  const next = document.getElementById('v-' + name);
  if (!next) return;
  next.classList.add('active');
  window.scrollTo(0, 0);
  menuLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('data-view-link') === name));
  document.title = (name === 'home' ? '' : name.charAt(0).toUpperCase() + name.slice(1) + ' — ')
                 + 'Roje Alasdair Evangelista — Security & Sound / Manila';
  currentView = name;
}
addEventListener('hashchange', () => swap(viewFromHash()));

/* ── START ── */
swap(viewFromHash());

/* ── WEBGL — SUBTLE MONOCHROME GRAIN FIELD ── */
(function () {
  const canvas = document.getElementById('gl');
  if (!canvas) return;
  const gl = canvas.getContext('webgl', { antialias: true, alpha: false }) || canvas.getContext('experimental-webgl');
  if (!gl) { document.body.classList.add('no-webgl'); return; }

  const VS = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;
  const FS = `
    precision highp float;
    uniform vec2 uRes; uniform float uTime; uniform vec2 uMouse; uniform vec3 uBg; uniform vec3 uFg;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){
      vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      float a=hash(i), b=hash(i+vec2(1.0,0.0)), c=hash(i+vec2(0.0,1.0)), d=hash(i+vec2(1.0,1.0));
      return mix(mix(a,b,f.x), mix(c,d,f.x), f.y);
    }
    void main(){
      vec2 uv = gl_FragCoord.xy / uRes;
      float aspect = uRes.x / uRes.y;
      // soft light, gently follows cursor
      vec2 c = mix(vec2(0.30,0.36), uMouse, 0.32);
      float glow = exp(-length((uv-c)*vec2(aspect,1.0))*1.75);
      // low-frequency haze
      vec2 q = uv*vec2(aspect,1.0)*1.7;
      float cloud = noise(q + uTime*0.025)*0.55 + noise(q*2.2 - uTime*0.018)*0.25;
      float b = glow*0.6 + cloud*0.18;
      vec3 col = mix(uBg, uFg, clamp(b,0.0,1.0)*0.17);
      // animated film grain
      float g = hash(gl_FragCoord.xy*0.5 + floor(uTime*22.0));
      col += (g-0.5)*0.062;
      // vignette
      float vig = smoothstep(1.35,0.15,length(uv-0.5));
      col *= 0.9 + 0.1*vig;
      gl_FragColor = vec4(col,1.0);
    }`;

  const compile = (type, src) => {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  const prog = gl.createProgram();
  const v = compile(gl.VERTEX_SHADER, VS), f = compile(gl.FRAGMENT_SHADER, FS);
  if (!v || !f) { document.body.classList.add('no-webgl'); return; }
  gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.warn(gl.getProgramInfoLog(prog)); document.body.classList.add('no-webgl'); return; }
  gl.useProgram(prog);

  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, 'p'); gl.enableVertexAttribArray(aLoc); gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const U = {
    res: gl.getUniformLocation(prog, 'uRes'), time: gl.getUniformLocation(prog, 'uTime'),
    mouse: gl.getUniformLocation(prog, 'uMouse'), bg: gl.getUniformLocation(prog, 'uBg'), fg: gl.getUniformLocation(prog, 'uFg')
  };
  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.floor(innerWidth * dpr); canvas.height = Math.floor(innerHeight * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
  }
  addEventListener('resize', resize); resize();

  const col = () => themeColors[currentTheme()] || themeColors.dark;
  let mx = 0.3, my = 0.36, tmx = 0.3, tmy = 0.36;
  addEventListener('mousemove', (e) => { tmx = e.clientX / innerWidth; tmy = 1 - e.clientY / innerHeight; });
  addEventListener('touchmove', (e) => { if (e.touches[0]) { tmx = e.touches[0].clientX / innerWidth; tmy = 1 - e.touches[0].clientY / innerHeight; } }, { passive: true });

  function push() { const c = col(); gl.uniform3fv(U.bg, c.bg); gl.uniform3fv(U.fg, c.fg); }
  function drawStatic() {
    gl.uniform2f(U.res, canvas.width, canvas.height); gl.uniform1f(U.time, 8.0); gl.uniform2f(U.mouse, 0.3, 0.36);
    push(); gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  window.__glThemeChanged = () => { if (reduceMotion) drawStatic(); };

  if (reduceMotion) { drawStatic(); addEventListener('resize', () => { resize(); drawStatic(); }); return; }

  const t0 = performance.now(); let running = true;
  function frame(now) {
    if (!running) return;
    mx += (tmx - mx) * 0.05; my += (tmy - my) * 0.05;
    gl.uniform2f(U.res, canvas.width, canvas.height); gl.uniform1f(U.time, (now - t0) / 1000); gl.uniform2f(U.mouse, mx, my);
    push(); gl.drawArrays(gl.TRIANGLES, 0, 3);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  document.addEventListener('visibilitychange', () => { if (document.hidden) running = false; else if (!running) { running = true; requestAnimationFrame(frame); } });
})();
