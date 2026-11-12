/* "Onde você gostaria de ajudar?": região → estado → categoria → painel personalizado + compromisso simbólico. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, el, clear } = ML.dom;
  const S = ML.shared;
  let impact = null;
  let busy = false;
  let last = null; // último cartão (sobrevive a re-renderizações do painel)

  const curRegion = () => (ML.state.uf ? S.ufInfo(ML.state.uf).region : ML.state.helpRegion || null);

  function fillRegions() {
    const sel = $('#helpRegion');
    S.REGIONS.forEach((r) => sel.append(el('option', { text: r, prop: { value: r } })));
    sel.addEventListener('change', () => {
      const region = sel.value || null;
      ML.setState({ helpRegion: region, uf: region && ML.state.uf && S.ufInfo(ML.state.uf).region === region ? ML.state.uf : null });
    });
    $('#helpUf').addEventListener('change', (e) => ML.setState({ uf: e.target.value || null }));
  }

  function fillUfs() {
    const sel = $('#helpUf');
    const region = curRegion();
    clear(sel);
    if (!region) { sel.disabled = true; sel.append(el('option', { text: 'Escolha uma região primeiro', prop: { value: '' } })); return; }
    sel.disabled = false;
    sel.append(el('option', { text: 'Escolha um estado…', prop: { value: '' } }));
    S.ufList.filter((u) => u.region === region).forEach((u) => sel.append(el('option', { text: u.name, prop: { value: u.id } })));
    sel.value = ML.state.uf || '';
  }

  function fillActions() {
    const box = clear($('#helpActions'));
    Object.entries(S.ACTIONS).forEach(([key, a]) => {
      const b = el('button', { class: 'action-opt', text: a.short, attrs: { type: 'button', role: 'radio', 'aria-checked': String(ML.state.action === key) } });
      b.addEventListener('click', () => ML.setState({ action: key }));
      box.append(b);
    });
  }

  function flow() {
    const u = ML.state.uf; const a = ML.state.action;
    const step = (txt, on) => el('span', { class: on ? 'on' : '', text: txt });
    return el('div', { class: 'help-flow', attrs: { 'aria-hidden': 'true' } }, step('REGIÃO', curRegion()), el('i'), step('ESTADO', u), el('i'), step('AÇÃO', a), el('i'), step('COMPROMISSO', u && a));
  }

  function render() {
    fillUfs(); fillActions();
    $('#helpRegion').value = curRegion() || '';
    const box = clear($('#helpPanel'));
    const u = ML.state.uf ? S.ufInfo(ML.state.uf) : null;
    const key = ML.state.action;
    box.append(flow());
    if (!u) {
      box.append(el('div', { class: 'panel-empty' }, el('b', { text: 'Comece escolhendo um lugar' }), 'Selecione uma região e um estado ao lado (ou clique no mapa). O painel mostra o que se sabe sobre o território e uma sugestão de iniciativa.'));
      return;
    }
    const IND = ML.indicators.coleta;
    const v = IND.ufs[u.id];
    const count = (impact && impact.byUf && impact.byUf[u.id]) || 0;
    const goal = 10;
    const dataCard = el('div', { class: 'data-card' }, el('span', { class: 'badge badge-official' }, el('i'), 'OFICIAL'),
      v != null
        ? [el('div', { class: 'data-value', text: ML.fmt.pct(v) }), el('p', { class: 'data-label', text: 'da população com coleta de lixo domiciliar (Censo 2022, IBGE).' })]
        : el('p', { class: 'data-none', text: 'Ainda não há indicador oficial deste estado importado no site. Quando houver, ele aparece aqui com fonte e ano.' }));
    const fill = el('i');
    const prog = el('div', {}, el('div', { class: 'data-source', text: `Participação digital em ${u.name}: ${ML.fmt.n(count)} compromissos${ML.state.mode === 'demo' ? ' (demonstração)' : ''} · meta simbólica de ${goal}` }), el('div', { class: 'progress', attrs: { role: 'progressbar', 'aria-valuemin': '0', 'aria-valuemax': String(goal), 'aria-valuenow': String(Math.min(count, goal)), 'aria-label': 'Progresso simbólico de participação no estado' } }, fill));
    requestAnimationFrame(() => { fill.style.width = `${Math.min(100, (count / goal) * 100)}%`; });
    box.append(
      el('div', { class: 'panel-head' }, el('div', {}, el('h3', { text: u.name }), el('div', { class: 'panel-meta' }, el('span', { class: 'tag', text: `Região ${u.region}` }), el('span', { class: 'tag', text: u.coastal ? 'Litoral' : 'Interior' })))),
      dataCard, prog,
      el('p', { class: 'panel-warn', text: 'Coleta de lixo é um indicador de gestão urbana, não uma medição de plástico no mar.' }),
    );
    if (!key) {
      box.append(el('div', { class: 'panel-suggest' }, el('b', { text: 'PRÓXIMO PASSO' }), 'Escolha uma categoria de ação para ver uma sugestão de iniciativa e liberar o registro do compromisso.'));
      return;
    }
    box.append(
      el('div', { class: 'panel-suggest' }, el('b', { text: `SUGESTÃO · ${S.ACTIONS[key].short.toUpperCase()}` }), ML.content.initiatives[key], ' ', u.coastal ? ML.content.coastalTip : ML.content.inlandTip),
      el('label', { class: 'control-label', text: 'APELIDO (OPCIONAL)', attrs: { for: 'helpAlias' } }),
      el('input', { attrs: { id: 'helpAlias', type: 'text', maxlength: '22', autocomplete: 'off', placeholder: 'Ex.: Oceano_azul' }, prop: { value: ML.state.alias || '' } }),
      el('p', { class: 'data-source', text: 'É um compromisso simbólico: conta como participação digital, não como lixo recolhido.' }),
      el('button', { class: 'button button-acid', attrs: { type: 'button', id: 'helpSubmit' }, prop: { disabled: busy }, on: { click: submit } }, `Registrar compromisso com ${u.name} `, el('span', { text: '↗', attrs: { 'aria-hidden': 'true' } })),
      el('div', { attrs: { id: 'helpResult', 'aria-live': 'polite' } }),
    );
    if (last && last.uf === u.id && last.key === key) ML.pledges.renderCard($('#helpResult'), last.result);
    const alias = $('#helpAlias');
    alias.addEventListener('input', () => { ML.state.alias = alias.value; });
  }

  async function submit() {
    const u = ML.state.uf; const action = ML.state.action;
    if (!u || !action || busy) return;
    busy = true; $('#helpSubmit').disabled = true;
    const out = $('#helpResult');
    try {
      const result = await ML.pledges.submit({ action, uf: u, alias: ($('#helpAlias') || {}).value || '' });
      last = { uf: u, key: action, result };
      ML.pledges.renderCard(clear($('#helpResult') || out), result);
    } catch (err) {
      clear($('#helpResult') || out).append(el('p', { class: 'sim-error', text: err.message }));
    } finally { busy = false; const b = $('#helpSubmit'); if (b) b.disabled = false; }
  }

  function init() {
    fillRegions();
    ML.on('state', render);
    ML.on('impact', (d) => { impact = d; render(); });
    ML.on('help:choose', (uf) => ML.setState({ uf }));
    render();
  }
  ML.help = { init };
})();
