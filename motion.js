/* Movimento leve: revelação ao rolar, contadores, bolhas em canvas e parallax do cursor. Sem bibliotecas. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, $$ } = ML.dom;
  document.documentElement.classList.add('js');
  const reduce = () => ML.reduceMotion.matches;

  // ---------- Revelação ao rolar ----------
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' })
    : null;
  function watch(node) { if (!node) return; if (io) io.observe(node); else node.classList.add('is-in'); }
  ML.motion = { watch };
  $$('.reveal, .stagger').forEach(watch);

  // ---------- Contadores ----------
  const counters = new WeakMap();
  ML.motion.count = function count(node, target) {
    if (!node) return;
    const to = Number(target) || 0;
    const from = counters.get(node) || 0;
    counters.set(node, to);
    if (reduce() || from === to) { node.textContent = ML.fmt.n(to); return; }
    const t0 = performance.now();
    const dur = 900;
    (function tick(now) {
      const p = Math.min(1, (now - t0) / dur);
      node.textContent = ML.fmt.n(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    })(t0);
  };

  // Maré de participação: 0–1 (meta simbólica de 100 compromissos). Não é medida ambiental.
  ML.motion.setLevel = function setLevel(total) {
    const ratio = Math.max(0.12, Math.min(1, (Number(total) || 0) / 100));
    const disc = $('#oceanDisc');
    if (disc) disc.style.setProperty('--level', ratio.toFixed(2));
    const pct = $('#levelPct');
    if (pct) pct.textContent = `${Math.round(Math.min(1, (Number(total) || 0) / 100) * 100)}%`;
  };

  // ---------- Parallax do cursor (só ponteiro fino, 1 frame por movimento) ----------
  const hero = $('#inicio');
  if (hero && window.matchMedia('(pointer:fine)').matches) {
    let raf = 0; let nx = 0; let ny = 0;
    hero.addEventListener('pointermove', (ev) => {
      if (reduce()) return;
      const r = hero.getBoundingClientRect();
      nx = ((ev.clientX - r.left) / r.width - 0.5) * 2;
      ny = ((ev.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        hero.style.setProperty('--px', nx.toFixed(3));
        hero.style.setProperty('--py', ny.toFixed(3));
      });
    });
    hero.addEventListener('pointerleave', () => { hero.style.setProperty('--px', 0); hero.style.setProperty('--py', 0); });
  }

  // ---------- Bolhas em canvas ----------
  const canvas = $('#bubbles');
  const ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  if (ctx && !reduce()) {
    let w = 0; let h = 0; let bubbles = []; let running = false; let visible = true; let last = 0;
    const lowEnd = (navigator.hardwareConcurrency || 4) <= 2 || window.innerWidth < 700;
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(lowEnd ? 14 : 34, w / 38));
      bubbles = Array.from({ length: n }, () => spawn(true));
    }
    function spawn(initial) {
      return { x: Math.random() * w, y: initial ? Math.random() * h : h + 10, r: 1.5 + Math.random() * 4.5, v: 8 + Math.random() * 20, ph: Math.random() * 6.28, a: 0.12 + Math.random() * 0.25 };
    }
    function frame(now) {
      if (!running) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      ctx.clearRect(0, 0, w, h);
      for (const b of bubbles) {
        b.y -= b.v * dt; b.ph += dt;
        const x = b.x + Math.sin(b.ph * 1.3) * 10;
        if (b.y < -10) Object.assign(b, spawn(false));
        ctx.beginPath(); ctx.arc(x, b.y, b.r, 0, 6.283);
        ctx.strokeStyle = `rgba(150,235,220,${b.a + 0.1})`; ctx.fillStyle = `rgba(111,226,208,${b.a * 0.35})`;
        ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
      }
      requestAnimationFrame(frame);
    }
    function sync() {
      const should = visible && !document.hidden && !reduce();
      if (should && !running) { running = true; last = performance.now(); requestAnimationFrame(frame); }
      if (!should) running = false;
    }
    resize();
    let resizeTimer; window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(resize, 200); });
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(([e]) => { visible = e.isIntersecting; sync(); }).observe(hero);
    sync();
  }
})();
