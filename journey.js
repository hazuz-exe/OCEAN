/* A jornada de um resíduo: dois caminhos possíveis (descarte incorreto × coleta adequada), com cena em SVG. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, el, svg, clear } = ML.dom;
  const C = () => ML.content;
  const W = 900; const H = 250;
  let path = 'wrong'; let idx = 0; let timer = 0;

  const steps = () => (path === 'wrong' ? C().journeyWrong : C().journeyRight);
  // posições dos nós na cena
  function pos(i, n) {
    const x = 70 + (i * (W - 140)) / (n - 1);
    const y = path === 'wrong' ? 70 + (i * 105) / (n - 1) : 150 - Math.sin((i / (n - 1)) * Math.PI) * 60;
    return [x, y];
  }

  function scene() {
    const list = steps(); const n = list.length;
    const root = svg('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': path === 'wrong' ? 'Cena: do descarte na cidade, passando por drenagem e rios, até o mar.' : 'Cena: do descarte correto à coleta, triagem e destinação adequada.', class: `path-${path}` });
    if (path === 'wrong') {
      root.append(svg('rect', { class: 'j-bg-city', x: 0, y: 0, width: 300, height: H }), svg('rect', { class: 'j-bg-sand', x: 640, y: 0, width: 130, height: H }), svg('rect', { class: 'j-bg-sea', x: 770, y: 0, width: 130, height: H }));
      [[24, 150, 34, 100], [66, 120, 40, 130], [118, 170, 30, 80], [162, 100, 44, 150], [216, 140, 36, 110]].forEach(([x, y, w, h]) => root.append(svg('rect', { class: 'j-bg-city', x, y, width: w, height: h, rx: 3 })));
    } else {
      root.append(svg('rect', { class: 'j-bg-city', x: 0, y: 0, width: W, height: H, opacity: 0.4 }));
    }
    const pts = list.map((_, i) => pos(i, n));
    const d = pts.map((p, i) => (i ? `L${p[0]} ${p[1]}` : `M${p[0]} ${p[1]}`)).join(' ');
    root.append(svg('path', { class: 'j-line', d }));
    const done = svg('path', { class: 'j-line-done', d: '' });
    root.append(done);
    list.forEach((s, i) => {
      const [x, y] = pts[i];
      const g = svg('g', { class: 'j-node', tabindex: 0, role: 'button', 'aria-label': `Etapa ${i + 1}: ${s.title}`, 'data-i': i }, svg('circle', { cx: x, cy: y, r: 15 }), svg('text', { x, y: y + 36 }, document.createTextNode(s.title.toUpperCase())));
      g.addEventListener('click', () => go(i));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); } });
      root.append(g);
    });
    const item = svg('g', { class: 'j-item', id: 'jItem' }, svg('circle', { r: 8, cx: 0, cy: 0 }));
    item.style.transform = `translate(${pts[0][0]}px,${pts[0][1]}px)`;
    root.append(item);
    root._pts = pts; root._done = done;
    clear($('#journeyScene')).append(root);
    return root;
  }

  function update() {
    const list = steps(); const root = $('#journeyScene svg');
    if (!root) return;
    const [x, y] = root._pts[idx];
    $('#jItem').style.transform = `translate(${x}px,${y}px)`;
    root.querySelectorAll('.j-node').forEach((g, i) => { g.classList.toggle('is-active', i === idx); g.classList.toggle('is-done', i < idx); });
    root._done.setAttribute('d', root._pts.slice(0, idx + 1).map((p, i) => (i ? `L${p[0]} ${p[1]}` : `M${p[0]} ${p[1]}`)).join(' '));
    const dots = clear($('#journeySteps'));
    list.forEach((_, i) => dots.append(el('li', { class: i <= idx ? 'on' : '' })));
    const s = list[idx];
    clear($('#journeyDetail')).append(el('small', { text: `ETAPA ${idx + 1} DE ${list.length}` }), el('h3', { text: s.title }), el('p', { text: s.text }));
    $('#journeyNext').textContent = idx >= list.length - 1 ? '↺ Recomeçar' : 'Próxima etapa →';
  }

  function go(i) { idx = Math.max(0, Math.min(steps().length - 1, i)); update(); }
  function stop() { clearInterval(timer); timer = 0; const b = $('#journeyPlay'); if (b) b.textContent = '▶ Acompanhar a jornada'; }
  function play() {
    if (timer) { stop(); return; }
    idx = 0; update();
    $('#journeyPlay').textContent = '❚❚ Pausar';
    if (ML.reduceMotion.matches) { stop(); return; }
    timer = setInterval(() => { if (idx >= steps().length - 1) { stop(); return; } go(idx + 1); }, 2400);
  }
  function setPath(p) {
    stop(); path = p; idx = 0;
    clear($('#journeyToggle'));
    [['wrong', 'Descarte incorreto'], ['right', 'Descarte adequado']].forEach(([id, label]) => {
      const b = el('button', { class: 'chip', text: label, attrs: { type: 'button', role: 'radio', 'aria-checked': String(id === path) } });
      b.addEventListener('click', () => setPath(id));
      $('#journeyToggle').append(b);
    });
    scene(); update();
  }

  function init() {
    $('#journeyNote').append(el('b', { text: 'Importante: ' }), C().journeyNote);
    $('#journeyPlay').addEventListener('click', play);
    $('#journeyNext').addEventListener('click', () => { stop(); go(idx >= steps().length - 1 ? 0 : idx + 1); });
    setPath('wrong');
  }
  ML.journey = { init };
})();
