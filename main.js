/* Inicialização: navegação, tema, teclado em grupos de opções, fontes e ordem de carregamento dos módulos. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, $$, el } = ML.dom;

  function nav() {
    const toggle = $('#menuToggle'); const menu = $('#mobileNav');
    const close = () => { menu.hidden = true; toggle.setAttribute('aria-expanded', 'false'); toggle.textContent = '☰'; toggle.setAttribute('aria-label', 'Abrir menu'); };
    toggle.addEventListener('click', () => {
      const open = toggle.getAttribute('aria-expanded') === 'true';
      if (open) close(); else { menu.hidden = false; toggle.setAttribute('aria-expanded', 'true'); toggle.textContent = '×'; toggle.setAttribute('aria-label', 'Fechar menu'); }
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { close(); toggle.focus(); } });
  }
  function theme() {
    if (ML.local.get('ml-theme', 'dark') === 'light') document.body.classList.add('light-mode');
    $('#themeToggle').addEventListener('click', () => {
      document.body.classList.toggle('light-mode');
      ML.local.set('ml-theme', document.body.classList.contains('light-mode') ? 'light' : 'dark');
    });
  }
  // Grupos role="radiogroup": setas movem a seleção (padrão WAI-ARIA).
  function radioKeys() {
    document.addEventListener('keydown', (e) => {
      const t = e.target;
      if (!t.matches || !t.matches('[role=radio]') || !['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'].includes(e.key)) return;
      const group = t.closest('[role=radiogroup]'); if (!group) return;
      const items = $$('[role=radio]:not([aria-disabled=true])', group); const i = items.indexOf(t);
      if (i < 0) return;
      e.preventDefault();
      const d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1;
      const next = items[(i + d + items.length) % items.length];
      next.click();
      const again = $$('[role=radio]', group).find((b) => b.textContent === next.textContent); if (again) again.focus();
    });
  }
  function sources() {
    const list = $('#sourceList');
    ML.content.sources.forEach((s) => list.append(el('li', {}, el('div', {}, el('a', { text: s.name, attrs: { href: s.url, target: '_blank', rel: 'noopener noreferrer' } }), el('small', { text: `${s.what} Ano de referência: ${s.year}.` })), el('span', { class: `badge ${s.used ? 'badge-official' : 'badge-demo'}`, text: s.used ? 'USADA' : 'NÃO IMPORTADA' }))));
    ML.content.credits.forEach((c) => $('#creditList').append(el('li', { text: c })));
  }

  async function start() {
    nav(); theme(); radioKeys(); sources();
    await ML.detectMode();
    const run = (name, mod) => { try { mod.init(); } catch (e) { console.error(`Falha em ${name}`, e); } };
    run('mapa', ML.map); run('ajuda', ML.help); run('jornada', ML.journey); run('aprender', ML.learn);
    run('compromissos', ML.pledges); run('simulação', ML.simulation); run('observatório', ML.observatory); run('comunidade', ML.community);
  }
  document.addEventListener('DOMContentLoaded', start);
})();
