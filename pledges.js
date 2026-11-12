/* Compromissos: envio, cartão digital (PNG), conquistas simbólicas e histórico. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, el, clear } = ML.dom;
  const S = ML.shared;
  const ICONS = { 'primeira-mare': '◉', 'explorador-oceanico': '✦', 'conhecedor-ambiental': '❖', 'participante-consciente': '◈', 'protetor-dos-mares': '✺' };
  let known = [];
  let summary = { pledges: [], total: 0, achievements: [] };

  // ---------- Cartão em PNG (canvas, 100% local) ----------
  function wrap(ctx, text, maxW) {
    const words = String(text).split(' '); const lines = []; let line = '';
    words.forEach((w) => { const t = line ? `${line} ${w}` : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; });
    if (line) lines.push(line); return lines;
  }
  function downloadCard({ kicker, title, lines, footer, filename }) {
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1080;
    const x = c.getContext('2d');
    const g = x.createLinearGradient(0, 0, 1080, 1080); g.addColorStop(0, '#0b3a48'); g.addColorStop(0.6, '#071b24'); g.addColorStop(1, '#06161d');
    x.fillStyle = g; x.fillRect(0, 0, 1080, 1080);
    x.strokeStyle = 'rgba(111,226,208,.5)'; x.lineWidth = 3; x.strokeRect(40, 40, 1000, 1000);
    for (let k = 0; k < 4; k += 1) { x.beginPath(); x.strokeStyle = `rgba(111,226,208,${0.08 + k * 0.05})`; x.lineWidth = 2; for (let px = 0; px <= 1080; px += 20) { const py = 820 + k * 40 + Math.sin(px / 90 + k) * 18; if (px) x.lineTo(px, py); else x.moveTo(px, py); } x.stroke(); }
    x.fillStyle = '#6fe2d0'; x.font = '500 28px "DM Mono", monospace'; x.fillText(kicker, 90, 130);
    x.fillStyle = '#eef6ea'; x.font = '600 76px "Space Grotesk", sans-serif';
    let y = 260; wrap(x, title, 900).forEach((l) => { x.fillText(l, 90, y); y += 88; });
    x.fillStyle = '#b3c7c2'; x.font = '400 34px "DM Sans", sans-serif'; y += 20;
    lines.forEach((t) => wrap(x, t, 900).forEach((l) => { x.fillText(l, 90, y); y += 46; }));
    x.fillStyle = '#d7ff54'; x.font = '500 26px "DM Mono", monospace'; wrap(x, footer, 900).forEach((l, k) => x.fillText(l, 90, 960 + k * 34));
    c.toBlob((blob) => {
      if (!blob) return;
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.append(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, 'image/png');
  }
  ML.share = { downloadCard };

  // ---------- Envio ----------
  async function submit({ action, alias, uf }) {
    const before = known.slice();
    const result = await ML.store.pledge({ action, alias, uf: uf || undefined });
    result.newBadges = (result.achievements || []).filter((id) => !before.includes(id));
    known = result.achievements || known;
    ML.toast('Novo compromisso registrado no Mar Limpo.');
    if (ML.community) ML.community.refresh();
    refreshDiary(result.newBadges);
    return result;
  }

  function renderCard(container, result) {
    const p = result.pledge;
    const where = p.uf ? S.ufInfo(p.uf).name : 'sem estado específico';
    const demo = ML.state.mode === 'demo';
    const note = demo ? 'Modo demonstração: este registro fica só neste navegador.' : 'Compromisso digital registrado. Não representa lixo recolhido nem doação.';
    const card = el('div', { class: 'pledge-card' },
      el('div', {}, el('small', { text: `CARTÃO DE COMPROMISSO · ${ML.fmt.date(p.createdAt)}` }), el('h3', { text: p.action }), el('p', { text: `${p.alias === 'Anônimo' ? 'Participante anônimo' : p.alias} · ${where}. ${note}` }),
        result.newBadges && result.newBadges.length ? el('div', { class: 'pledge-new' }, ...result.newBadges.map((id) => el('span', { class: 'new-badge', text: `NOVA CONQUISTA: ${S.ACHIEVEMENTS.find((a) => a.id === id).name.toUpperCase()}` }))) : null),
      el('div', { class: 'pledge-card-actions' },
        el('button', { class: 'button button-acid', text: 'Baixar cartão (PNG)', attrs: { type: 'button' }, on: { click: () => downloadCard({ kicker: 'MAR LIMPO · COMPROMISSO', title: p.action, lines: [`${p.alias === 'Anônimo' ? 'Participante anônimo' : p.alias} · ${where}`, ML.fmt.date(p.createdAt)], footer: 'Compromisso digital. Não representa lixo recolhido nem doação.', filename: 'mar-limpo-compromisso.png' }) } })));
    container.append(card);
  }

  // ---------- Conquistas e histórico ----------
  function refreshDiaryView(newIds = []) {
    const list = clear($('#achievementList'));
    S.ACHIEVEMENTS.forEach((a) => {
      const on = summary.achievements.includes(a.id);
      list.append(el('li', { class: `ach${on ? ' is-on' : ''}${newIds.includes(a.id) ? ' is-new' : ''}` }, el('span', { class: 'ach-ico', text: on ? ICONS[a.id] : '○', attrs: { 'aria-hidden': 'true' } }), el('div', {}, el('b', { text: a.name }), el('span', { text: `${a.description}${on ? ' (conquistada)' : ''}` }))));
    });
    const hist = clear($('#historyList'));
    if (!summary.pledges.length) hist.append(el('li', { class: 'history-empty', text: 'Nenhum compromisso ainda. O primeiro cria sua primeira conquista.' }));
    summary.pledges.slice(0, 6).forEach((p) => hist.append(el('li', {}, el('span', { text: `${p.title}${p.uf ? ` · ${p.uf}` : ''}` }), el('small', { text: ML.fmt.date(p.createdAt) }))));
  }
  async function refreshDiary(newIds) {
    try { summary = await ML.store.summary(); known = summary.achievements; } catch { /* mantém o que já está na tela */ }
    refreshDiaryView(newIds || []);
  }

  // ---------- Formulário principal ----------
  function initForm() {
    const actionSel = $('#actionSelect');
    Object.entries(S.ACTIONS).forEach(([k, a]) => actionSel.append(el('option', { text: a.short, prop: { value: k } })));
    const ufSel = $('#ufSelect');
    S.REGIONS.forEach((r) => { const g = el('optgroup', { attrs: { label: r } }); S.ufList.filter((u) => u.region === r).forEach((u) => g.append(el('option', { text: u.name, prop: { value: u.id } }))); ufSel.append(g); });
    ML.on('state', () => { if (ufSel.value !== (ML.state.uf || '')) ufSel.value = ML.state.uf || ''; if (ML.state.action && actionSel.value !== ML.state.action) actionSel.value = ML.state.action; });
    ufSel.addEventListener('change', () => ML.setState({ uf: ufSel.value || null }));
    actionSel.addEventListener('change', () => ML.setState({ action: actionSel.value }));

    $('#pledgeForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.currentTarget; const button = form.querySelector('button[type="submit"]'); const message = $('#formMessage');
      button.disabled = true; button.textContent = 'Registrando…';
      message.className = 'form-message'; message.textContent = 'Enviando seu compromisso para o painel da comunidade.';
      try {
        const result = await submit({ action: actionSel.value, alias: $('#aliasInput').value, uf: ufSel.value });
        message.className = 'form-message success'; message.textContent = `Compromisso registrado: ${result.pledge.action}. Valeu por participar!`;
        const out = clear($('#pledgeResult')); out.hidden = false; renderCard(out, result);
        $('#aliasInput').value = '';
      } catch (error) {
        message.className = 'form-message error'; message.textContent = error.message;
      } finally { button.disabled = false; button.innerHTML = 'Registrar meu compromisso <span aria-hidden="true">↗</span>'; }
    });
  }

  ML.pledges = { submit, renderCard, init() { initForm(); refreshDiary(); } };
})();
