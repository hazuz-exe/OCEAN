/* Simulação de contribuição em 5 etapas. 100% demonstrativa: nenhum pagamento, nenhum dado pessoal. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, el, svg, clear } = ML.dom;
  const S = ML.shared;
  const STEPS = ['1 · VALOR', '2 · DESTINO', '3 · REVISÃO', '4 · CONFIRMAÇÃO', '5 · RECIBO'];
  const AMOUNTS = [5, 10, 20, 50];
  const PRESETS = [['principal', '60% no destino + 10% nos outros'], ['foco', '100% no destino'], ['equilibrado', '20% em cada']];
  const st = { step: 0, amount: 10, custom: false, purpose: null, preset: 'principal', receipt: null, error: '' };

  const root = () => $('#simRoot');
  const go = (n) => { st.step = n; st.error = ''; render(); const r = root(); if (r && n !== 3) r.scrollIntoView({ block: 'nearest', behavior: ML.reduceMotion.matches ? 'auto' : 'smooth' }); };

  function stepper() {
    return el('ol', { class: 'sim-steps', attrs: { 'aria-label': 'Etapas da simulação' } }, ...STEPS.map((t, i) => el('li', { class: i === st.step ? 'on' : i < st.step ? 'done' : '', text: t, attrs: i === st.step ? { 'aria-current': 'step' } : {} })));
  }
  function splitView(split) {
    const keys = Object.keys(S.SIM_PURPOSES);
    const bar = el('div', { class: 'split-bar', attrs: { role: 'img', 'aria-label': keys.map((k) => `${S.SIM_PURPOSES[k]} ${split[k]}%`).join(', ') } });
    keys.forEach((k, i) => { const seg = el('i', { class: `split-${i}` }); seg.style.flexBasis = `${split[k]}%`; seg.style.flexGrow = '0'; bar.append(seg); });
    const legend = el('ul', { class: 'split-legend' }, ...keys.map((k, i) => el('li', {}, el('i', { class: `split-${i}` }), `${S.SIM_PURPOSES[k]}: ${split[k]}%`)));
    return [bar, legend];
  }
  const validAmount = () => Number.isInteger(st.amount) && st.amount >= S.SIM_LIMITS.min && st.amount <= S.SIM_LIMITS.max;

  // ----- Etapa 1 -----
  function stepAmount() {
    const group = el('div', { class: 'amount-grid', attrs: { role: 'radiogroup', 'aria-label': 'Valor simbólico' } });
    AMOUNTS.forEach((v) => {
      const b = el('button', { class: 'amount', text: `R$ ${v}`, attrs: { type: 'button', role: 'radio', 'aria-checked': String(!st.custom && st.amount === v) } });
      b.addEventListener('click', () => { st.amount = v; st.custom = false; render(); });
      group.append(b);
    });
    const other = el('button', { class: 'amount', text: 'Outro', attrs: { type: 'button', role: 'radio', 'aria-checked': String(st.custom) } });
    other.addEventListener('click', () => { st.custom = true; render(); const i = $('#simCustom'); if (i) i.focus(); });
    group.append(other);
    const drops = el('div', { class: 'drops', attrs: { role: 'img', 'aria-label': `Representação gráfica: ${Math.min(20, Math.ceil((st.amount || 0) / 5))} gotas` } });
    for (let k = 0; k < Math.min(20, Math.ceil((validAmount() ? st.amount : 0) / 5)); k += 1) { const d = el('span', { class: 'drop' }); d.style.animationDelay = `${k * 35}ms`; drops.append(d); }
    const body = el('div', { class: 'sim-body' }, el('h3', { text: 'Quanto você simularia?' }), el('p', { text: 'Valores simbólicos, só para a demonstração. Nada será cobrado.' }), group);
    if (st.custom) {
      const input = el('input', { attrs: { id: 'simCustom', type: 'number', inputmode: 'numeric', min: String(S.SIM_LIMITS.min), max: String(S.SIM_LIMITS.max), step: '1', 'aria-describedby': 'simCustomHint' }, prop: { value: st.amount || '' } });
      input.addEventListener('input', () => { st.amount = input.value === '' ? NaN : Number(input.value); const ok = validAmount(); hint.textContent = ok ? '' : `Use um número inteiro entre ${S.SIM_LIMITS.min} e ${S.SIM_LIMITS.max}.`; next.disabled = !ok; });
      const hint = el('span', { class: 'sim-error', attrs: { id: 'simCustomHint' } });
      body.append(el('div', { class: 'custom-amount' }, el('label', { text: 'R$', attrs: { for: 'simCustom' } }), input, hint));
    }
    body.append(drops, el('p', { class: 'drops-cap', text: 'Ilustração: 1 gota = R$ 5. É só um desenho, não representa resultado ambiental.' }));
    const next = el('button', { class: 'button button-acid', text: 'Escolher destino →', attrs: { type: 'button' }, prop: { disabled: !validAmount() }, on: { click: () => validAmount() && go(1) } });
    body.append(el('div', { class: 'sim-nav' }, next));
    return body;
  }

  // ----- Etapa 2 -----
  function stepPurpose() {
    const grid = el('div', { class: 'purpose-grid', attrs: { role: 'radiogroup', 'aria-label': 'Destino demonstrativo' } });
    const desc = { educacao: 'Materiais e atividades educativas.', preservacao: 'Proteção de ambientes marinhos.', reciclagem: 'Coleta seletiva e reaproveitamento.', limpeza: 'Ações supervisionadas de limpeza.', pesquisa: 'Estudos e comunicação científica.' };
    Object.entries(S.SIM_PURPOSES).forEach(([k, label]) => {
      const b = el('button', { class: 'purpose', attrs: { type: 'button', role: 'radio', 'aria-checked': String(st.purpose === k) } }, el('b', { text: label }), el('span', { text: `Fictício · ${desc[k]}` }));
      b.addEventListener('click', () => { st.purpose = k; render(); const f = $('.purpose[aria-checked=true]', root()); if (f) f.focus(); });
      grid.append(b);
    });
    const body = el('div', { class: 'sim-body' }, el('h3', { text: 'Para onde iria?' }), el('p', { text: 'Os destinos são fictícios. Escolha um e veja a distribuição simulada.' }), grid);
    if (st.purpose) {
      const presets = el('div', { class: 'preset-row', attrs: { role: 'radiogroup', 'aria-label': 'Regra de distribuição' } });
      PRESETS.forEach(([id, label]) => { const b = el('button', { class: 'preset', text: label, attrs: { type: 'button', role: 'radio', 'aria-checked': String(st.preset === id) } }); b.addEventListener('click', () => { st.preset = id; render(); }); presets.append(b); });
      body.append(presets, ...splitView(S.simSplit(st.purpose, st.preset)), el('p', { class: 'sim-note', text: 'Regra ilustrativa de demonstração. Não é prestação de contas de nenhuma organização.' }));
    }
    body.append(el('div', { class: 'sim-nav' }, el('button', { class: 'button button-ghost', text: '← Voltar', attrs: { type: 'button' }, on: { click: () => go(0) } }), el('button', { class: 'button button-acid', text: 'Revisar →', attrs: { type: 'button' }, prop: { disabled: !st.purpose }, on: { click: () => st.purpose && go(2) } })));
    return body;
  }

  // ----- Etapa 3 -----
  function stepReview() {
    const body = el('div', { class: 'sim-body' }, el('h3', { text: 'Revise a simulação' }),
      el('ul', { class: 'review' }, el('li', {}, 'Valor simbólico', el('b', { text: ML.fmt.brl(st.amount) })), el('li', {}, 'Destino demonstrativo', el('b', { text: S.SIM_PURPOSES[st.purpose] })), el('li', {}, 'Distribuição', el('b', { text: PRESETS.find((p) => p[0] === st.preset)[1] }))),
      ...splitView(S.simSplit(st.purpose, st.preset)),
      el('div', { class: 'review-alert', text: 'Aviso: esta é uma simulação educativa. Nenhuma transação real será realizada e nenhum valor será cobrado ou transferido.' }));
    if (st.error) body.append(el('p', { class: 'sim-error', text: st.error, attrs: { role: 'alert' } }));
    body.append(el('div', { class: 'sim-nav' }, el('button', { class: 'button button-ghost', text: '← Ajustar', attrs: { type: 'button' }, on: { click: () => go(1) } }), el('button', { class: 'button button-acid', text: 'Confirmar simulação ↗', attrs: { type: 'button' }, on: { click: confirm } })));
    return body;
  }

  // ----- Etapa 4: animação (onda atravessando o painel + partículas) -----
  function stepConfirm() {
    const stage = el('div', { class: 'sim-stage is-running' });
    const wave = (cls, d) => svg('svg', { class: `sim-wave ${cls}`, viewBox: '0 0 1200 120', preserveAspectRatio: 'none', 'aria-hidden': 'true' }, svg('path', { d }));
    const water = el('div', { class: 'sim-water', attrs: { 'aria-hidden': 'true' } },
      wave('w2', 'M0 60 Q150 20 300 60 T600 60 T900 60 T1200 60 V120 H0Z'), wave('', 'M0 70 Q150 30 300 70 T600 70 T900 70 T1200 70 V120 H0Z'));
    const parts = el('div', { class: 'sim-particles', attrs: { 'aria-hidden': 'true' } });
    for (let k = 0; k < 16; k += 1) { const p = el('i'); p.style.left = `${6 + (k * 83) % 88}%`; p.style.setProperty('--d', `${(k % 8) * 0.28}s`); p.style.setProperty('--t', `${2.2 + (k % 4) * 0.3}s`); parts.append(p); }
    const text = el('div', { class: 'sim-stage-text' }, el('b', { text: 'Simulando a contribuição…' }), el('span', { text: 'PREPARANDO A SIMULAÇÃO', attrs: { id: 'simCaption', role: 'status' } }));
    stage.append(parts, water, text);
    return el('div', { class: 'sim-body' }, stage);
  }
  async function confirm() {
    go(3);
    const caption = () => $('#simCaption');
    const captions = ['PREPARANDO A SIMULAÇÃO', 'DISTRIBUINDO (DEMONSTRAÇÃO)', 'CHEGANDO AO OCEANO (ILUSTRATIVO)'];
    const timers = captions.map((t, i) => setTimeout(() => { if (caption()) caption().textContent = t; }, i * 1300));
    try {
      const [res] = await Promise.all([ML.store.simulate({ amount: st.amount, purpose: st.purpose, preset: st.preset }), ML.wait(4200)]);
      st.receipt = res.receipt; go(4);
      if (ML.observatory) ML.observatory.refresh();
    } catch (err) {
      timers.forEach(clearTimeout);
      st.error = err.message || 'Não foi possível concluir a simulação.'; go(2);
    }
  }

  // ----- Etapa 5: recibo ilustrativo -----
  function stepReceipt() {
    const r = st.receipt;
    const row = (k, v) => [el('dt', { text: k }), el('dd', { text: v })];
    const receipt = el('div', { class: 'receipt' }, el('h4', { text: 'Recibo ilustrativo · Mar Limpo' }), el('div', { class: 'stamp', text: r.status }),
      el('dl', {}, ...row('Identificador fictício', r.id), ...row('Valor simbólico', ML.fmt.brl(r.amount)), ...row('Destino', r.purposeLabel), ...row('Data da demonstração', ML.fmt.dateTime(r.createdAt)), ...row('Status', r.status)),
      ...splitView(r.split),
      el('p', { class: 'receipt-notice', text: r.notice }),
      ML.state.mode === 'demo' ? el('p', { class: 'receipt-notice', text: 'Modo demonstração: registro salvo só neste navegador.' }) : null);
    return el('div', { class: 'sim-body' }, el('h3', { text: 'Simulação concluída' }), el('p', { text: 'Obrigado por explorar! Guarde o recibo ilustrativo se quiser mostrá-lo na apresentação do projeto.' }), receipt,
      el('div', { class: 'sim-nav' },
        el('button', { class: 'button button-acid', text: 'Baixar recibo (PNG)', attrs: { type: 'button' }, on: { click: () => ML.share.downloadCard({ kicker: 'MAR LIMPO · RECIBO ILUSTRATIVO', title: r.status, lines: [`${r.id} · ${ML.fmt.brl(r.amount)}`, `Destino: ${r.purposeLabel}`, ML.fmt.dateTime(r.createdAt)], footer: r.notice, filename: `mar-limpo-${r.id}.png` }) } }),
        el('button', { class: 'button button-ghost', text: 'Nova simulação', attrs: { type: 'button' }, on: { click: () => { Object.assign(st, { step: 0, purpose: null, receipt: null, custom: false, amount: 10, preset: 'principal' }); render(); } } })));
  }

  function render() {
    const box = clear(root());
    box.append(stepper(), [stepAmount, stepPurpose, stepReview, stepConfirm, stepReceipt][st.step]());
  }
  ML.simulation = { init() { render(); } };
})();
