/* Observatório: três abas (oficiais, comunidade, demonstração), cada uma com fonte, ano e significado. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, $$, el, svg, clear } = ML.dom;
  const S = ML.shared;
  const IND = ML.indicators.coleta;
  let impact = null; let sims = null;

  const badge = (k) => el('span', { class: `badge badge-${k}` }, el('i'), { official: 'OFICIAL', community: 'COMUNIDADE', demo: 'DEMONSTRAÇÃO' }[k]);
  function meta(...parts) { return el('div', { class: 'chart-meta' }, ...parts); }
  function card(kind, title, desc, content, metaNode, wide) {
    return el('article', { class: `chart-card${wide ? ' wide' : ''}` }, badge(kind), el('h3', { text: title }), el('p', { class: 'desc', text: desc }), content, metaNode);
  }
  function hbars(rows, cls, fmt) {
    const wrap = el('div');
    const max = Math.max(1, ...rows.map((r) => r.v));
    rows.forEach((r) => {
      const fill = el('i');
      wrap.append(el('div', { class: `hbar ${cls}` }, el('span', { text: r.label }), el('span', { class: 'hbar-track' }, fill), el('b', { text: fmt(r.v) })));
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${(r.v / max) * 100}%`; }));
    });
    return wrap;
  }
  const link = (text, href) => el('a', { text, attrs: { href, target: '_blank', rel: 'noopener noreferrer' } });

  function official() {
    const box = clear($('#obs-official'));
    const years = Object.keys(IND.national).map(Number);
    const cols = el('div', { class: 'col-chart', attrs: { role: 'img', 'aria-label': years.map((y) => `${y}: ${ML.fmt.pct(IND.national[y])}`).join('; ') } });
    years.forEach((y) => {
      const bar = el('i'); cols.append(el('div', { class: 'col' }, el('b', { text: ML.fmt.pct(IND.national[y]) }), bar, el('span', { text: String(y) })));
      requestAnimationFrame(() => requestAnimationFrame(() => { bar.style.height = `${((IND.national[y] - 50) / 50) * 100}%`; }));
    });
    box.append(
      card('official', 'Coleta de lixo no Brasil', 'Parcela da população em domicílios com coleta direta ou indireta de lixo. A escala do gráfico começa em 50%.', cols,
        meta(el('b', { text: 'Fonte: ' }), IND.source, ` · anos 2000, 2010 e 2022 · `, link('abrir fonte', IND.url))),
      card('official', 'Extremos entre os estados (2022)', 'Maior e menor cobertura entre as UFs, mais a média nacional. As demais UFs ainda não foram importadas.',
        hbars([{ label: 'São Paulo', v: IND.ufs.SP }, { label: 'Brasil', v: IND.national[2022] }, { label: 'Maranhão', v: IND.ufs.MA }], 'is-official', ML.fmt.pct),
        meta(el('b', { text: 'Fonte: ' }), IND.source, ' · 2022 · ', link('abrir fonte', IND.url), `. Maranhão foi a UF que mais ampliou a cobertura desde 2010 (+${String(IND.delta.MA.pp).replace('.', ',')} p.p.).`)),
      card('official', 'Tamanho do município importa (2022)', 'Cobertura de coleta segundo o porte do município.',
        hbars(IND.bySize.map((s) => ({ label: s.label.replace('Municípios com ', ''), v: s.value })), 'is-official', ML.fmt.pct),
        meta(el('b', { text: 'Fonte: ' }), IND.sizeSource, ' · 2022 · ', link('abrir fonte', IND.sizeUrl))),
      card('official', 'Referência global', ML.global.label, el('div', { class: 'stat-row' }, el('div', {}, el('strong', { text: '19–23' }), el('span', { text: 'milhões de toneladas por ano' }))),
        meta(el('b', { text: 'Fonte: ' }), ML.global.source, ' · dado global, não medido pelo Mar Limpo · ', link('abrir fonte', ML.global.url))),
      card('official', 'O que os dados oficiais NÃO dizem', 'Cobertura de coleta é gestão urbana. Nenhuma medição direta de lixo em praias ou no mar foi importada nesta versão: onde não há dado, o site diz isso.', el('div'),
        meta('Próximas fontes para importar: SINIR, SINISA e estudos científicos sobre lixo costeiro.'), true),
    );
  }

  function spark(days) {
    const w = 520; const h = 150; const pad = 24;
    const max = Math.max(1, ...days.map((d) => d.total));
    const pts = days.map((d, i) => [pad + (i * (w - pad * 2)) / (days.length - 1), h - pad - (d.total / max) * (h - pad * 2)]);
    const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
    const root = svg('svg', { class: 'spark', viewBox: `0 0 ${w} ${h}`, role: 'img', 'aria-label': `Compromissos por dia nos últimos 14 dias: ${days.map((d) => d.total).join(', ')}` });
    const len = Math.ceil(pts.reduce((a, p, i) => (i ? a + Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) : 0), 0)) + 20;
    const path = svg('path', { class: 'line', d: line });
    path.style.setProperty('--len', String(len));
    root.append(svg('path', { class: 'area', d: `${line} L${pts[pts.length - 1][0]} ${h - pad} L${pts[0][0]} ${h - pad}Z` }), path,
      svg('text', { x: pad, y: h - 6 }, document.createTextNode(ML.fmt.date(days[0].date + 'T12:00:00'))), svg('text', { x: w - pad, y: h - 6, 'text-anchor': 'end' }, document.createTextNode('hoje')),
      svg('text', { x: pad, y: 14 }, document.createTextNode(`máx. ${max}/dia`)));
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('is-in')));
    return root;
  }

  function community() {
    const box = clear($('#obs-community'));
    if (!impact) { box.append(el('p', { text: 'Carregando dados da comunidade…' })); return; }
    const demo = ML.state.mode === 'demo';
    const kind = demo ? 'demo' : 'community';
    const src = demo ? 'Números FICTÍCIOS (servidor desligado) somados aos registros feitos neste navegador.' : 'Fonte: compromissos registrados neste site. Mede participação digital, não lixo recolhido.';
    box.append(
      card(kind, 'Participação', 'Total de registros e pessoas (sessões anônimas) que participaram.',
        el('div', { class: 'stat-row' }, el('div', {}, el('strong', { text: ML.fmt.n(impact.totalCommitments) }), el('span', { text: 'compromissos' })), el('div', {}, el('strong', { text: ML.fmt.n(impact.participants) }), el('span', { text: 'participantes' }))), meta(src)),
      card(kind, 'Evolução em 14 dias', 'Compromissos registrados por dia.', spark(impact.byDay), meta(src)),
      card(kind, 'Por tipo de ação', 'Quais compromissos a comunidade mais escolhe.', hbars(Object.keys(S.ACTIONS).map((k) => ({ label: S.ACTIONS[k].short.slice(0, 16), v: impact.byAction[k] || 0 })), demo ? 'is-demo' : '', ML.fmt.n), meta(src)),
      card(kind, 'Por região', 'Compromissos ligados a um estado, somados por região.', hbars(S.REGIONS.map((r) => ({ label: r, v: (impact.byRegion || {})[r] || 0 })), demo ? 'is-demo' : '', ML.fmt.n), meta(src)),
    );
  }

  function demoTab() {
    const box = clear($('#obs-demo'));
    if (!sims) { box.append(el('p', { text: 'Carregando…' })); return; }
    box.append(
      card('demo', 'Simulações realizadas', 'Contagem exclusiva da demonstração de contribuição. Isolada dos dados reais.',
        el('div', { class: 'stat-row' }, el('div', {}, el('strong', { text: ML.fmt.n(sims.simulations) }), el('span', { text: 'simulações' })), el('div', {}, el('strong', { text: ML.fmt.brl(sims.totalSymbolic) }), el('span', { text: 'valor SIMBÓLICO somado' }))),
        meta(el('b', { text: 'DEMONSTRAÇÃO: ' }), 'nenhum valor foi cobrado, pago ou arrecadado. Não é arrecadação.')),
      card('demo', 'Destinos escolhidos (fictícios)', 'Quantas simulações escolheram cada destino demonstrativo.',
        hbars(Object.keys(S.SIM_PURPOSES).map((k) => ({ label: S.SIM_PURPOSES[k].slice(0, 16), v: sims.byPurpose[k] || 0 })), 'is-demo', ML.fmt.n),
        meta(sims.label || 'Dados de demonstração.')),
    );
  }

  async function refresh() {
    try { impact = await ML.store.impact(); } catch { /* mantém */ }
    try { sims = await ML.store.simStats(); } catch { sims = null; }
    community(); demoTab();
  }

  function tabs() {
    const list = $$('#obsTabs [role=tab]');
    const select = (tab, focus) => {
      list.forEach((t) => { const on = t === tab; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; $(`#obs-${t.dataset.tab}`).hidden = !on; });
      if (focus) tab.focus();
      if (tab.dataset.tab === 'official') official();
    };
    list.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); select(list[(i + d + list.length) % list.length], true); }
        if (e.key === 'Home') { e.preventDefault(); select(list[0], true); }
        if (e.key === 'End') { e.preventDefault(); select(list[list.length - 1], true); }
      });
    });
  }

  ML.observatory = { refresh, init() { official(); tabs(); ML.on('impact', (d) => { impact = d; community(); }); ML.on('state', () => { if (ML.state.mode === 'demo') community(); }); refresh(); } };
})();
