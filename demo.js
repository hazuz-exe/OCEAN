/*
 * Modo demonstração: usado quando o servidor Node não está disponível (ex.: index.html aberto direto).
 * - Os números "da comunidade" são uma SEMENTE FICTÍCIA, sempre rotulada como demonstração.
 * - Compromissos e simulações feitos aqui ficam só neste navegador (localStorage).
 */
(function () {
  'use strict';
  const ML = (window.ML = window.ML || {});
  const S = ML.shared;
  const KEY_P = 'ml-demo-pledges';
  const KEY_S = 'ml-demo-sims';
  const KEY_ID = 'ml-demo-participant';

  const seed = {
    byAction: { 'recusar-descartavel': 14, 'descarte-correto': 11, 'informacao-confiavel': 8, 'acao-organizada': 4, 'aprender-descarte': 6, 'apoiar-preservacao': 3 },
    byRegion: { Norte: 3, Nordeste: 12, 'Centro-Oeste': 2, Sudeste: 6, Sul: 4 },
    byUf: { RN: 7, PE: 3, BA: 2, SP: 4, RJ: 2, RS: 2, SC: 2, PA: 3, GO: 2, CE: 2 },
    byDay: [1, 2, 2, 3, 2, 4, 3, 5, 4, 3, 6, 4, 5, 7],
    ranking: [
      { name: 'Maré_Demo', total: 9, badges: ['primeira-mare', 'participante-consciente'] },
      { name: 'Recife_Exemplo', total: 6, badges: ['primeira-mare'] },
      { name: 'Onda_Fictícia', total: 4, badges: ['primeira-mare'] },
    ],
    sims: { simulations: 5, totalSymbolic: 130, byPurpose: { educacao: 2, preservacao: 1, reciclagem: 1, limpeza: 0, pesquisa: 1 } },
  };
  const seedTotal = Object.values(seed.byAction).reduce((a, b) => a + b, 0);

  const pledges = () => ML.local.get(KEY_P, []);
  const dayKey = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });

  ML.demoStore = {
    mode: 'demo',
    config: async () => ({ robloxEnabled: false }),
    async impact() {
      const mine = pledges();
      const byAction = { ...seed.byAction };
      const byRegion = { ...seed.byRegion };
      const byUf = { ...seed.byUf };
      const byDay = seed.byDay.map((total, i) => ({ date: dayKey(Date.now() - (13 - i) * 86400000), total }));
      mine.forEach((p) => {
        byAction[p.action] = (byAction[p.action] || 0) + 1;
        const info = p.uf && S.ufInfo(p.uf);
        if (info) { byUf[info.id] = (byUf[info.id] || 0) + 1; byRegion[info.region] += 1; }
        const d = byDay.find((x) => x.date === dayKey(p.createdAt));
        if (d) d.total += 1;
      });
      return { totalCommitments: seedTotal + mine.length, participants: 9 + (mine.length ? 1 : 0), byAction, byRegion, byUf, byDay, demo: true };
    },
    async leaderboard() {
      const mine = pledges();
      const ranking = [...seed.ranking];
      if (mine.length) ranking.push({ name: 'Você (neste navegador)', total: mine.length, badges: S.computeAchievements(mine) });
      ranking.sort((a, b) => b.total - a.total);
      return { ranking: ranking.slice(0, 5), demo: true };
    },
    events: async () => [],
    async summary() {
      const mine = pledges();
      return {
        pledges: [...mine].reverse().slice(0, 20).map((p) => ({ action: p.action, title: ML.actionTitle(p.action), uf: p.uf || null, createdAt: p.createdAt })),
        total: mine.length,
        achievements: S.computeAchievements(mine),
      };
    },
    async pledge({ action, alias, uf }) {
      if (!S.ACTIONS[action]) throw new Error('Escolha uma ação válida.');
      const list = pledges();
      const today = dayKey(Date.now());
      const todays = list.filter((p) => dayKey(p.createdAt) === today);
      if (todays.length >= 12) throw new Error('Você atingiu o limite de registros de hoje (demonstração).');
      if (todays.some((p) => p.action === action && (p.uf || null) === (uf || null))) throw new Error('Você já registrou esse compromisso hoje para essa escolha. Experimente outra ação ou região.');
      const entry = { action, uf: uf || null, alias: (alias || '').trim().slice(0, 22) || 'Anônimo', createdAt: new Date().toISOString() };
      const next = [...list, entry];
      ML.local.set(KEY_P, next);
      return { ok: true, pledge: { alias: entry.alias, action: ML.actionTitle(action), actionKey: action, uf: entry.uf, createdAt: entry.createdAt }, achievements: S.computeAchievements(next), totalMine: next.length, demo: true };
    },
    async simulate({ amount, purpose, preset }) {
      const value = Number(amount);
      if (!Number.isInteger(value) || value < S.SIM_LIMITS.min || value > S.SIM_LIMITS.max) throw new Error(`Informe um valor simbólico inteiro entre R$ ${S.SIM_LIMITS.min} e R$ ${S.SIM_LIMITS.max}.`);
      if (!S.SIM_PURPOSES[purpose]) throw new Error('Escolha um destino demonstrativo.');
      const chosen = ['foco', 'principal', 'equilibrado'].includes(preset) ? preset : 'principal';
      const id = `SIM-${[...crypto.getRandomValues(new Uint8Array(4))].map((b) => b.toString(16).padStart(2, '0')).join('').toUpperCase()}`;
      const entry = { id, amount: value, purpose, preset: chosen, createdAt: new Date().toISOString() };
      ML.local.set(KEY_S, [...ML.local.get(KEY_S, []), entry].slice(-200));
      return { ok: true, demo: true, receipt: { ...entry, purposeLabel: S.SIM_PURPOSES[purpose], split: S.simSplit(purpose, chosen), status: 'SIMULAÇÃO CONCLUÍDA', notice: 'Esta é uma simulação educativa. Nenhum pagamento ou transferência foi realizado.' } };
    },
    async simStats() {
      const mine = ML.local.get(KEY_S, []);
      const byPurpose = { ...seed.sims.byPurpose };
      let total = seed.sims.totalSymbolic;
      mine.forEach((m) => { byPurpose[m.purpose] = (byPurpose[m.purpose] || 0) + 1; total += m.amount; });
      return { simulations: seed.sims.simulations + mine.length, totalSymbolic: total, byPurpose, label: 'DEMONSTRAÇÃO — valores simbólicos, nada foi arrecadado.', demo: true };
    },
  };
})();
