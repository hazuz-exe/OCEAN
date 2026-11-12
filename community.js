/* Comunidade: indicadores, ranking, agenda (confirmados × demonstração) e login Roblox opcional. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, el, clear } = ML.dom;
  const S = ML.shared;
  const ICON = { 'primeira-mare': '◉', 'explorador-oceanico': '✦', 'conhecedor-ambiental': '❖', 'participante-consciente': '◈', 'protetor-dos-mares': '✺' };
  let eventFilter = 'all'; let realEvents = [];

  function bars(byAction) {
    const box = clear($('#actionBars'));
    const max = Math.max(1, ...Object.values(byAction));
    Object.entries(S.ACTIONS).forEach(([key, a]) => {
      const fill = el('i');
      box.append(el('div', { class: 'action-bar-row' }, el('span', { text: a.short }), el('span', { class: 'action-bar-track' }, fill), el('b', { class: 'action-bar-count', text: ML.fmt.n(byAction[key]) })));
      requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = `${((Number(byAction[key]) || 0) / max) * 100}%`; }));
    });
  }
  function leaderboard(items) {
    const list = clear($('#leaderboard'));
    if (!items.length) { list.append(el('li', { text: 'Seja a primeira pessoa a registrar um compromisso.' })); return; }
    items.forEach((it, i) => {
      const badges = el('span', { class: 'badge-row' }, ...(it.badges || []).map((id) => el('span', { class: 'mini-badge', text: ICON[id] || '•', attrs: { title: S.ACHIEVEMENTS.find((a) => a.id === id)?.name || '', 'aria-label': S.ACHIEVEMENTS.find((a) => a.id === id)?.name || '' } })));
      list.append(el('li', {}, el('span', { class: 'place', text: String(i + 1).padStart(2, '0') }), el('span', { class: 'who' }, el('strong', { text: it.name }), badges), el('span', { class: 'score', text: `${ML.fmt.n(it.total)} ${it.total === 1 ? 'registro' : 'registros'}` })));
    });
  }

  async function refresh() {
    try {
      const [impact, board] = await Promise.all([ML.store.impact(), ML.store.leaderboard()]);
      const demo = ML.state.mode === 'demo';
      ML.motion.count($('#heroCommitments'), impact.totalCommitments); ML.motion.count($('#heroParticipants'), impact.participants);
      ML.motion.count($('#totalCommitments'), impact.totalCommitments); ML.motion.count($('#totalParticipants'), impact.participants);
      $('#pledgeLiveText').textContent = `${ML.fmt.n(impact.totalCommitments)} compromissos ${demo ? 'de demonstração (fictícios + os seus)' : 'registrados pela comunidade'}`;
      $('#liveLabel').textContent = demo ? 'DEMONSTRAÇÃO' : 'AO VIVO';
      ML.motion.setLevel(impact.totalCommitments);
      bars(impact.byAction); leaderboard(board.ranking);
      ML.emit('impact', impact);
    } catch (error) {
      ['#heroCommitments', '#heroParticipants', '#totalCommitments', '#totalParticipants'].forEach((s) => { $(s).textContent = '—'; });
      $('#pledgeLiveText').textContent = 'Painel temporariamente indisponível.';
      $('#actionBars').textContent = 'Não foi possível carregar os dados agora.';
      $('#leaderboard').textContent = 'Ranking indisponível.';
      console.error(error);
    }
  }

  function renderEvents() {
    const list = clear($('#eventList'));
    const demoOn = eventFilter !== 'real';
    const items = [...realEvents, ...(eventFilter === 'real' ? [] : ML.content.demoEvents)].filter((e) => (eventFilter === 'demo' ? e.kind === 'demonstracao' : true));
    void demoOn;
    if (!items.length || (eventFilter === 'real' && !realEvents.length)) {
      list.append(el('div', { class: 'empty-event' }, el('span', { text: '＋', attrs: { 'aria-hidden': 'true' } }), el('p', { text: 'Nenhum evento confirmado cadastrado ainda.' }), el('small', { text: 'SEM DATAS OU LOCAIS CONFIRMADOS' })));
      if (!items.length) return;
    }
    items.forEach((e) => {
      const demo = e.kind === 'demonstracao';
      list.append(el('article', { class: `event-item${demo ? ' is-demo' : ''}` }, el('strong', { text: e.title }),
        el('div', { class: 'tags' }, el('span', { class: `tag ${demo ? 'is-demo' : 'is-ok'}`, text: demo ? 'EXEMPLO DE DEMONSTRAÇÃO' : 'CONFIRMADO' }), el('span', { class: 'tag', text: e.category }), el('span', { class: 'tag', text: e.status })),
        el('span', { text: [e.date, e.location, e.region].filter(Boolean).join(' · ') }), el('p', { text: e.description })));
    });
  }
  async function events() {
    try { realEvents = await ML.store.events(); } catch (error) { realEvents = []; console.error(error); }
    const row = clear($('#eventFilters'));
    [['all', 'Todos'], ['real', 'Confirmados'], ['demo', 'Exemplos de demonstração']].forEach(([id, label]) => {
      const b = el('button', { class: 'chip', text: label, attrs: { type: 'button', 'aria-pressed': String(eventFilter === id) } });
      b.addEventListener('click', () => { eventFilter = id; events.render(); });
      row.append(b);
    });
    renderEvents();
  }
  events.render = () => { [...$('#eventFilters').children].forEach((b, i) => b.setAttribute('aria-pressed', String(['all', 'real', 'demo'][i] === eventFilter))); renderEvents(); };

  async function roblox() {
    const panel = $('#robloxPanel'); const controls = $('#robloxControls'); const message = $('#robloxMessage');
    try {
      const config = await ML.store.config();
      if (!config.robloxEnabled) return;
      panel.hidden = false;
      const { user } = await ML.api('/api/me');
      if (!user) return;
      clear(controls);
      const profile = el('div', { class: 'roblox-profile' });
      if (user.avatar) profile.append(el('img', { attrs: { src: user.avatar, alt: '' } }));
      profile.append(el('div', {}, el('strong', { text: user.displayName || user.username }), el('small', { text: `@${user.username}` })));
      const out = el('button', { class: 'button button-dark', text: 'Desconectar', attrs: { type: 'button' } });
      out.addEventListener('click', async () => {
        out.disabled = true;
        try { await ML.api('/api/logout', { method: 'POST', headers: { 'X-Requested-With': 'fetch' } }); ML.toast('Conta Roblox desconectada.'); location.reload(); } catch (e) { message.textContent = e.message; out.disabled = false; }
      });
      controls.append(profile, out);
      message.textContent = 'Perfil público conectado. Nenhuma senha é solicitada pelo Mar Limpo.';
    } catch (error) { message.textContent = 'Não foi possível verificar a conexão Roblox agora.'; console.error(error); }
  }
  function robloxCallback() {
    const status = new URLSearchParams(location.search).get('roblox');
    if (!status) return;
    const msgs = { ok: 'Conta Roblox conectada com sucesso.', cancelled: 'Autorização cancelada. Nenhuma conta foi conectada.', unavailable: 'A conexão Roblox ainda não foi configurada neste ambiente.', error: 'Não foi possível concluir a conexão Roblox. Tente novamente.' };
    $('#robloxMessage').textContent = msgs[status] || msgs.error;
    if (status !== 'unavailable') $('#robloxPanel').hidden = false;
    history.replaceState({}, document.title, `${location.pathname}#comunidade`);
  }

  ML.community = { refresh, init() { refresh(); events(); if (ML.state.mode === 'server') { roblox(); robloxCallback(); } } };
})();
