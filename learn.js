/* Desafio ambiental (quiz de decisões) e cartões de curiosidades com fonte. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const { $, el, clear } = ML.dom;
  let i = 0; let score = 0; let results = []; let answered = false;

  function render() {
    const quiz = ML.content.quiz;
    const box = clear($('#quizBox'));
    const dots = el('div', { class: 'quiz-dots', attrs: { 'aria-hidden': 'true' } });
    quiz.forEach((_, k) => dots.append(el('i', { class: k === i && i < quiz.length ? 'on' : results[k] === true ? 'ok' : results[k] === false ? 'no' : '' })));
    box.append(el('div', { class: 'quiz-top' }, el('span', { text: i < quiz.length ? `DESAFIO ${i + 1}/${quiz.length}` : 'RESULTADO' }), dots));
    if (i >= quiz.length) {
      const msg = score === quiz.length ? 'Você dominou o descarte!' : score >= quiz.length / 2 ? 'Bom caminho. Revise o que errou e confira as regras da sua cidade.' : 'Começar é isso: aprender com cada resposta. Tente de novo!';
      box.append(el('div', { class: 'quiz-end' }, el('div', { class: 'quiz-score', text: `${score}/${quiz.length}` }), el('p', { class: 'quiz-why', text: msg }),
        el('button', { class: 'button button-acid', text: 'Jogar de novo', attrs: { type: 'button' }, on: { click: () => { i = 0; score = 0; results = []; render(); } } })));
      return;
    }
    const q = quiz[i];
    answered = false;
    box.append(el('h3', { class: 'quiz-q', text: q.q }));
    const opts = el('div', { class: 'quiz-opts' });
    const why = el('p', { class: 'quiz-why', attrs: { hidden: '' } });
    const next = el('button', { class: 'button button-acid', text: i === quiz.length - 1 ? 'Ver resultado' : 'Próximo desafio →', attrs: { type: 'button', hidden: '' }, on: { click: () => { i += 1; render(); } } });
    q.options.forEach((text, k) => {
      const b = el('button', { class: 'quiz-opt', text, attrs: { type: 'button' } });
      b.addEventListener('click', () => {
        if (answered) return; answered = true;
        const ok = k === q.answer; if (ok) score += 1; results[i] = ok;
        [...opts.children].forEach((c, idx) => { c.disabled = true; if (idx === q.answer) c.classList.add('is-right'); else if (idx === k) c.classList.add('is-wrong'); });
        why.textContent = `${ok ? 'Certo! ' : 'Quase. '}${q.why}`; why.hidden = false; next.hidden = false; next.focus();
      });
      opts.append(b);
    });
    box.append(opts, why, next);
  }

  function curiosities() {
    const grid = clear($('#curioGrid'));
    grid.classList.add('stagger');
    ML.content.curiosities.forEach((c, k) => {
      const answer = el('div', {}, c.a, el('small', {}, 'Fonte: ', c.url ? el('a', { text: c.src, attrs: { href: c.url, target: '_blank', rel: 'noopener noreferrer' } }) : c.src));
      const b = el('button', { class: 'curio', attrs: { type: 'button', 'aria-expanded': 'false', 'aria-controls': `curio-a-${k}` } },
        el('span', { class: 'curio-tag', text: c.tag.toUpperCase() }), el('span', { class: 'curio-q', text: c.q }), el('span', { class: 'curio-a', attrs: { id: `curio-a-${k}` } }, answer));
      b.addEventListener('click', (e) => { if (e.target.closest('a')) return; const open = b.classList.toggle('is-open'); b.setAttribute('aria-expanded', String(open)); });
      grid.append(b);
    });
    ML.motion.watch(grid);
  }

  ML.learn = { init() { render(); curiosities(); } };
})();
