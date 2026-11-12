/* Núcleo: utilitários de DOM, estado compartilhado, modo (servidor/demonstração) e camada de dados. */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const S = ML.shared;

  // ---------- DOM ----------
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  // el('div', { class:'x', text:'olá', attrs:{role:'img'}, on:{click:fn}, prop:{hidden:true} }, filhos...)
  function el(tag, opts = {}, ...children) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
    if (opts.prop) Object.assign(node, opts.prop);
    if (opts.on) for (const [k, v] of Object.entries(opts.on)) node.addEventListener(k, v);
    children.flat().forEach((c) => { if (c != null) node.append(c); });
    return node;
  }
  const svgNS = 'http://www.w3.org/2000/svg';
  function svg(tag, attrs = {}, ...children) {
    const node = document.createElementNS(svgNS, tag);
    for (const [k, v] of Object.entries(attrs)) node.setAttribute(k, v);
    children.flat().forEach((c) => { if (c != null) node.append(c); });
    return node;
  }
  const clear = (node) => { node.replaceChildren(); return node; };
  ML.dom = { $, $$, el, svg, clear };

  // ---------- Formatação ----------
  const nf = new Intl.NumberFormat('pt-BR');
  ML.fmt = {
    n: (v) => nf.format(Number(v) || 0),
    pct: (v) => `${Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`,
    brl: (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }),
    date: (iso) => new Date(iso).toLocaleDateString('pt-BR'),
    dateTime: (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }),
  };

  ML.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  ML.wait = (ms) => new Promise((r) => setTimeout(r, ML.reduceMotion.matches ? Math.min(ms, 250) : ms));

  // ---------- Eventos e estado ----------
  const listeners = {};
  ML.on = (name, fn) => { (listeners[name] = listeners[name] || []).push(fn); };
  ML.emit = (name, payload) => (listeners[name] || []).forEach((fn) => { try { fn(payload); } catch (e) { console.error(e); } });

  ML.state = { mode: 'server', uf: null, region: null, action: null, layer: 'coleta', year: 2022 };
  ML.setState = (patch) => { Object.assign(ML.state, patch); ML.emit('state', ML.state); };

  // ---------- Toast ----------
  ML.toast = (message) => {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(ML.toast.timer);
    ML.toast.timer = setTimeout(() => toast.classList.remove('show'), 3400);
  };

  // ---------- Armazenamento local seguro ----------
  const memory = {};
  ML.local = {
    get(key, fallback) {
      try { const raw = localStorage.getItem(key); return raw == null ? fallback : JSON.parse(raw); } catch { return key in memory ? memory[key] : fallback; }
    },
    set(key, value) {
      memory[key] = value;
      try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* armazenamento opcional */ }
    },
  };

  // ---------- Servidor ----------
  async function api(url, options = {}) {
    const response = await fetch(url, {
      credentials: 'same-origin',
      cache: 'no-store',
      ...options,
      headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(options.headers || {}) },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { const err = new Error(payload.error || 'Não foi possível concluir a solicitação.'); err.status = response.status; throw err; }
    return payload;
  }
  ML.api = api;
  const post = (url, body) => api(url, { method: 'POST', headers: { 'X-Requested-With': 'fetch' }, body: JSON.stringify(body) });

  ML.serverStore = {
    mode: 'server',
    config: () => api('/api/config'),
    impact: () => api('/api/impact'),
    leaderboard: () => api('/api/leaderboard'),
    events: () => api('/api/events').then((d) => d.events),
    summary: () => api('/api/me/summary'),
    pledge: (body) => post('/api/pledges', body),
    simulate: (body) => post('/api/simulations', body),
    simStats: () => api('/api/simulations/stats'),
  };

  // Decide o modo: sem servidor (arquivo aberto direto ou API fora do ar) => demonstração.
  ML.detectMode = async function detectMode() {
    let mode = 'demo';
    if (location.protocol !== 'file:') {
      try {
        const health = await api('/api/health', { signal: AbortSignal.timeout(3500) });
        if (health && health.ok) mode = 'server';
      } catch { mode = 'demo'; }
    }
    ML.store = mode === 'server' ? ML.serverStore : ML.demoStore;
    ML.setState({ mode });
    document.body.dataset.mode = mode;
    const banner = $('#demoBanner');
    if (banner) banner.hidden = mode === 'server';
    return mode;
  };

  ML.actionTitle = (key) => (S.ACTIONS[key] ? S.ACTIONS[key].title : key);
})();
