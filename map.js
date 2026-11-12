/* Mapa ambiental do Brasil: camadas, filtros, seleção animada, painel lateral e comparação regional. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, el, svg, clear } = ML.dom;
  const S = ML.shared;
  const IND = ML.indicators.coleta;
  const YEARS = [2000, 2010, 2022];
  const LAYERS = [
    { id: 'coleta', label: 'Coleta de lixo', kind: 'official' },
    { id: 'comunidade', label: 'Compromissos', kind: 'community' },
    { id: 'litoral', label: 'Litoral', kind: 'official' },
  ];
  const paths = new Map();
  let impact = null;
  let tipTimer = 0;

  const kindOf = (layer) => (layer === 'comunidade' ? (ML.state.mode === 'demo' ? 'demo' : 'community') : 'official');
  const badge = (kind) => {
    const text = { official: 'OFICIAL', community: 'COMUNIDADE', demo: 'DEMONSTRAÇÃO' }[kind];
    return el('span', { class: `badge badge-${kind}` }, el('i'), text);
  };

  // ---------- Cores ----------
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  function mix(a, b, t) { const A = hex(a); const B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(',')})`; }
  function scale(t) { return t < 0.5 ? mix('#ff785e', '#ffd166', t * 2) : mix('#ffd166', '#6fe2d0', (t - 0.5) * 2); }
  function coleta(id) {
    const v = ML.state.year === 2022 ? IND.ufs[id] : undefined;
    return v == null ? null : v;
  }
  function communityCount(id) { return (impact && impact.byUf && impact.byUf[id]) || 0; }
  function maxCommunity() { return Math.max(1, ...Object.values((impact && impact.byUf) || {})); }

  function paint() {
    const { layer, region, uf } = ML.state;
    S.ufList.forEach((u) => {
      const p = paths.get(u.id);
      if (!p) return;
      let fill = null; let nodata = false;
      if (layer === 'coleta') { const v = coleta(u.id); if (v == null) nodata = true; else fill = scale(Math.max(0, Math.min(1, (v - 65) / 35))); }
      else if (layer === 'comunidade') { const c = communityCount(u.id); fill = `rgba(111,226,208,${(0.12 + 0.8 * (c / maxCommunity())).toFixed(2)})`; }
      else fill = u.coastal ? '#3aa8c4' : '#d3b06a';
      if (fill) p.style.setProperty('--fill', fill); else p.style.removeProperty('--fill');
      p.classList.toggle('is-nodata', nodata);
      p.classList.toggle('is-dim', Boolean(region) && u.region !== region);
      p.classList.toggle('is-selected', uf === u.id);
      p.setAttribute('aria-pressed', String(uf === u.id));
    });
  }

  // ---------- Legenda ----------
  function legend() {
    const box = clear($('#mapLegend'));
    const { layer, year } = ML.state;
    const title = (t) => el('span', { class: 'legend-title', text: t });
    const row = (swatchClass, text) => el('div', { class: 'legend-row' }, el('i', { class: `swatch ${swatchClass}` }), el('span', { text }));
    if (layer === 'coleta') {
      const vals = Object.values(IND.ufs);
      box.append(title(`COLETA DE LIXO · ${year}`), el('div', { class: 'legend-bar' }),
        el('div', { class: 'legend-scale' }, el('span', { text: '65%' }), el('span', { text: '100%' })),
        row('swatch-hatch', year === 2022 ? 'Dado oficial desta UF ainda não importado' : `Sem dado por UF para ${year}`),
        el('p', { class: 'control-hint', text: year === 2022 ? `Importados: ${Object.keys(IND.ufs).length} UFs (${Math.min(...vals)}%–${Math.max(...vals)}%).` : 'Para 2000 e 2010 só existe a referência nacional (veja o painel e o Observatório).' }));
    } else if (layer === 'comunidade') {
      box.append(title(kindOf('comunidade') === 'demo' ? 'COMPROMISSOS · DEMONSTRAÇÃO' : 'COMPROMISSOS REGISTRADOS'), el('div', { class: 'legend-bar legend-aqua' }),
        el('div', { class: 'legend-scale' }, el('span', { text: '0' }), el('span', { text: String(maxCommunity()) })),
        el('p', { class: 'control-hint', text: 'Conta registros digitais ligados ao estado. Não é lixo recolhido.' }));
    } else {
      box.append(title('LITORAL · IBGE'), row('swatch-coast', 'Estado com litoral (17)'), row('swatch-inland', 'Estado sem litoral (10)'));
    }
  }

  // ---------- Controles ----------
  function chips(container, items, current, onPick, disabledFn) {
    clear(container);
    items.forEach((it) => {
      const disabled = disabledFn ? disabledFn(it) : false;
      const b = el('button', { class: 'chip', text: it.label, attrs: { type: 'button', role: 'radio', 'aria-checked': String(it.id === current), ...(disabled ? { 'aria-disabled': 'true' } : {}) } });
      b.addEventListener('click', () => { if (!disabled) onPick(it.id); });
      container.append(b);
    });
  }
  function controls() {
    chips($('#mapLayerChips'), LAYERS, ML.state.layer, (id) => ML.setState({ layer: id }));
    const isColeta = ML.state.layer === 'coleta';
    chips($('#mapYearChips'), YEARS.map((y) => ({ id: y, label: String(y) })), ML.state.year, (y) => ML.setState({ year: y }), () => !isColeta);
    $('#yearHint').textContent = isColeta ? 'Por UF, só 2022 foi importado. 2000 e 2010 mostram a referência nacional.' : 'O ano só se aplica à camada Coleta de lixo.';
  }

  // ---------- Painel ----------
  function nationalLine() {
    const y = ML.state.year; const v = IND.national[y];
    return v == null ? null : `Brasil em ${y}: ${ML.fmt.pct(v)}`;
  }
  function layerCard(u) {
    const { layer, year } = ML.state;
    const card = el('div', { class: 'data-card' });
    if (layer === 'coleta') {
      card.append(badge('official'));
      const v = coleta(u.id);
      if (v != null) {
        card.append(el('div', { class: 'data-value', text: ML.fmt.pct(v) }), el('p', { class: 'data-label', text: `da população em domicílios com coleta de lixo direta ou indireta, ${year}.` }));
        const d = IND.delta[u.id];
        if (d) card.append(el('p', { class: 'data-label', text: `Subiu ${String(d.pp).replace('.', ',')} pontos percentuais desde ${d.from}.` }));
      } else {
        card.append(el('p', { class: 'data-none', text: year === 2022 ? 'Dado oficial desta UF ainda não importado. Isso não significa que o estado não tenha coleta, apenas que o número não está neste site.' : `Não há valor por UF importado para ${year}.` }));
      }
      const nat = nationalLine();
      if (nat) card.append(el('p', { class: 'data-label', text: nat }));
      card.append(el('div', { class: 'data-source' }, `Fonte: ${IND.source} · ano ${year}. `, el('a', { text: 'Ver fonte', attrs: { href: IND.url, target: '_blank', rel: 'noopener noreferrer' } })));
    } else if (layer === 'comunidade') {
      const k = kindOf('comunidade');
      card.append(badge(k), el('div', { class: 'data-value', text: ML.fmt.n(communityCount(u.id)) }),
        el('p', { class: 'data-label', text: 'compromissos registrados ligados a este estado.' }),
        el('div', { class: 'data-source', text: k === 'demo' ? 'Números FICTÍCIOS de demonstração (servidor desligado).' : 'Fonte: registros feitos neste site. Participação digital, não lixo removido.' }));
    } else {
      card.append(badge('official'), el('div', { class: 'data-value', text: u.coastal ? 'Com litoral' : 'Sem litoral' }),
        el('p', { class: 'data-label', text: `${u.name} ${u.coastal ? 'tem' : 'não tem'} costa oceânica. Rios e cidades do interior também fazem parte do caminho dos resíduos.` }),
        el('div', { class: 'data-source', text: 'Fonte: IBGE, divisão territorial.' }));
    }
    return card;
  }
  function panel() {
    const box = clear($('#mapPanel'));
    const u = ML.state.uf ? S.ufInfo(ML.state.uf) : null;
    if (!u) {
      box.append(el('div', { class: 'panel-empty' }, el('b', { text: 'Selecione um estado' }), 'Toque em qualquer estado do mapa (ou use Tab e Enter) para ver os indicadores disponíveis, a fonte de cada número e uma sugestão de iniciativa.'));
      return;
    }
    const action = ML.state.action || 'recusar-descartavel';
    box.append(
      el('div', { class: 'panel-head' }, el('div', {}, el('h3', { text: u.name }), el('div', { class: 'panel-meta' }, el('span', { class: 'tag', text: `Região ${u.region}` }), el('span', { class: 'tag', text: u.coastal ? 'Litoral' : 'Interior' }))),
        el('button', { class: 'chip', text: 'Limpar', attrs: { type: 'button', 'aria-label': 'Limpar seleção do estado' }, on: { click: () => ML.setState({ uf: null }) } })),
      layerCard(u),
      ML.state.layer !== 'comunidade' ? el('div', { class: 'data-source' }, `Compromissos neste estado: ${ML.fmt.n(communityCount(u.id))}${ML.state.mode === 'demo' ? ' (demonstração)' : ''}`) : null,
      el('p', { class: 'panel-warn', text: 'Lixo no mar e em praias: nenhuma medição direta foi importada nesta versão. Indicadores de coleta municipal não medem plástico no oceano.' }),
      el('div', { class: 'panel-suggest' }, el('b', { text: 'SUGESTÃO DE INICIATIVA' }), ML.content.initiatives[action], ' ', u.coastal ? ML.content.coastalTip : ML.content.inlandTip),
      el('button', { class: 'button button-acid', attrs: { type: 'button' }, on: { click: () => { ML.emit('help:choose', u.id); const t = $('#ajudar'); if (t) t.scrollIntoView({ behavior: ML.reduceMotion.matches ? 'auto' : 'smooth' }); } } }, 'Escolher este estado para ajudar ', el('span', { text: '↗', attrs: { 'aria-hidden': 'true' } })),
    );
  }

  // ---------- Comparação entre regiões ----------
  function compare() {
    const box = clear($('#mapCompare'));
    const { layer } = ML.state;
    box.append(el('h3', { text: 'Comparação entre regiões' }));
    const bars = (rows, cls, fmt) => {
      const max = Math.max(1, ...rows.map((r) => r.v));
      rows.forEach((r) => {
        const fill = el('i');
        box.append(el('div', { class: `hbar ${cls}` }, el('span', { text: r.label }), el('span', { class: 'hbar-track' }, fill), el('b', { text: fmt(r.v) })));
        requestAnimationFrame(() => { fill.style.width = `${(r.v / max) * 100}%`; });
      });
    };
    if (layer === 'comunidade') {
      const k = kindOf('comunidade');
      box.append(el('p', { text: `Compromissos registrados por região ${k === 'demo' ? '(DEMONSTRAÇÃO, números fictícios)' : '(participação digital)'}.` }));
      bars(S.REGIONS.map((r) => ({ label: r, v: (impact && impact.byRegion && impact.byRegion[r]) || 0 })), k === 'demo' ? 'is-demo' : '', ML.fmt.n);
    } else if (layer === 'litoral') {
      box.append(el('p', { text: 'Quantos estados de cada região têm litoral (IBGE).' }));
      bars(S.REGIONS.map((r) => ({ label: r, v: S.ufList.filter((u) => u.region === r && u.coastal).length })), 'is-official', ML.fmt.n);
    } else {
      box.append(el('p', { text: 'A comparação oficial por região ainda não foi importada. Veja os extremos entre UFs e a referência nacional (Censo 2022, coleta de lixo domiciliar).' }));
      bars([{ label: 'São Paulo', v: IND.ufs.SP }, { label: 'Brasil', v: IND.national[2022] }, { label: 'Maranhão', v: IND.ufs.MA }], 'is-official', ML.fmt.pct);
    }
  }

  // ---------- Desenho do mapa ----------
  function drawConnector() {
    const g = $('#mapConnector');
    if (!g) return;
    clear(g);
    const id = ML.state.uf; const p = id && paths.get(id);
    if (!p) return;
    const box = p.getBBox();
    const cx = box.x + box.width / 2; const cy = box.y + box.height / 2;
    const vb = ML.mapData.viewBox.split(' ').map(Number);
    const endX = vb[2] + 14;
    g.append(svg('circle', { class: 'map-dot', cx, cy, r: 4 }), svg('path', { class: 'map-connector', d: `M${cx} ${cy} L${cx} ${cy} L${endX} ${cy}` }), svg('circle', { class: 'map-dot', cx: endX, cy, r: 3 }));
    const pulse = p.cloneNode(false);
    pulse.removeAttribute('tabindex'); pulse.removeAttribute('role'); pulse.removeAttribute('aria-label'); pulse.removeAttribute('aria-pressed');
    pulse.setAttribute('class', 'uf-pulse'); pulse.removeAttribute('data-uf');
    g.prepend(pulse);
  }

  function build() {
    const host = clear($('#brazilMap'));
    const stage = $('#mapStage');
    const data = ML.mapData;
    const root = svg('svg', { viewBox: data.viewBox, role: 'group', 'aria-label': 'Estados do Brasil' });
    const defs = svg('defs', {}, svg('pattern', { id: 'hatch', width: 7, height: 7, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
      svg('rect', { width: 7, height: 7, fill: 'rgba(120,150,145,.12)' }), svg('line', { x1: 0, y1: 0, x2: 0, y2: 7, stroke: 'rgba(160,190,185,.55)', 'stroke-width': 1.6 })));
    const states = svg('g');
    const tip = el('div', { class: 'map-tooltip', attrs: { 'aria-hidden': 'true' } });
    stage.append(tip);
    data.locations.forEach((loc) => {
      const info = S.ufInfo(loc.id);
      if (!info) return;
      const p = svg('path', { d: loc.path, class: 'uf', tabindex: 0, role: 'button', 'aria-label': `${info.name}, região ${info.region}`, 'aria-pressed': 'false', 'data-uf': loc.id });
      p.addEventListener('click', () => ML.setState({ uf: ML.state.uf === loc.id ? null : loc.id }));
      p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); p.dispatchEvent(new Event('click')); } });
      const showTip = (e) => {
        const r = stage.getBoundingClientRect();
        const pt = e.clientX != null && e.type !== 'focus' ? [e.clientX - r.left, e.clientY - r.top] : (() => { const b = p.getBoundingClientRect(); return [b.left + b.width / 2 - r.left, b.top - r.top + 8]; })();
        tip.textContent = info.name; tip.style.left = `${pt[0]}px`; tip.style.top = `${pt[1]}px`; tip.classList.add('show');
        clearTimeout(tipTimer);
      };
      p.addEventListener('pointermove', showTip);
      p.addEventListener('focus', showTip);
      p.addEventListener('pointerleave', () => tip.classList.remove('show'));
      p.addEventListener('blur', () => tip.classList.remove('show'));
      paths.set(loc.id, p);
      states.append(p);
    });
    root.append(defs, states, svg('g', { id: 'mapConnector', 'aria-hidden': 'true' }));
    host.append(root);
  }

  let lastUf = null;
  function render() {
    controls(); legend(); paint(); panel(); compare();
    if (ML.state.uf !== lastUf) { drawConnector(); lastUf = ML.state.uf; }
  }

  function init() {
    if (!ML.mapData) return;
    const sel = $('#mapRegion');
    S.REGIONS.forEach((r) => sel.append(el('option', { text: r, prop: { value: r } })));
    sel.addEventListener('change', () => {
      const region = sel.value || null;
      const patch = { region };
      if (region && ML.state.uf && S.ufInfo(ML.state.uf).region !== region) patch.uf = null;
      ML.setState(patch);
    });
    build();
    ML.on('state', () => { if (sel.value !== (ML.state.region || '')) sel.value = ML.state.region || ''; render(); });
    ML.on('impact', (data) => { impact = data; render(); });
    render();
  }
  ML.map = { init };
})();
